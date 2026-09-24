import os
import uuid
import datetime
from flask import Blueprint, request, jsonify, g
from backend.models.db import get_col, serialize_doc
from backend.middleware.auth import hash_password, verify_password, generate_token, token_required, log_audit

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()
    student_id = data.get("studentId", "").strip().upper()
    department = data.get("department", "Computer Science").strip()
    year = data.get("year", "1st Year").strip()

    if not all([name, email, password, student_id]):
        return jsonify({"success": False, "message": "Name, email, password, and Student ID are required."}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters long."}), 400

    user_col = get_col("users")
    if user_col.find_one({"email": email}):
        return jsonify({"success": False, "message": "An account with this email address already exists."}), 409

    if user_col.find_one({"studentId": student_id}):
        return jsonify({"success": False, "message": "An account with this Student ID already exists."}), 409

    now = datetime.datetime.utcnow().isoformat()
    new_user = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": "STUDENT",
        "studentId": student_id,
        "phone": phone,
        "department": department,
        "year": year,
        "status": "ACTIVE",
        "isBlocked": False,
        "booksBorrowedCount": 0,
        "currentBorrowedCount": 0,
        "totalFines": 0.0,
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={name}",
        "createdAt": now,
        "updatedAt": now
    }

    res = user_col.insert_one(new_user)
    new_user["_id"] = res.inserted_id

    # Add welcome notification
    notif_col = get_col("notifications")
    notif_col.insert_one({
        "userId": str(res.inserted_id),
        "title": "Welcome to Smart Library!",
        "message": f"Hello {name}, your library account has been successfully created. Explore AI-personalized book recommendations and catalog search.",
        "type": "WELCOME",
        "isRead": False,
        "createdAt": now
    })

    log_audit("REGISTER", "USER", f"New student account registered: {email}", res.inserted_id)

    token = generate_token(new_user)
    user_data = serialize_doc(new_user)
    user_data.pop("password", None)

    return jsonify({
        "success": True,
        "message": "Registration successful! Welcome to the Smart Library Hub.",
        "data": {
            "token": token,
            "user": user_data
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    user_col = get_col("users")
    user = user_col.find_one({"email": email})

    if not user or not verify_password(password, user.get("password", "")):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    if user.get("status") == "INACTIVE" or user.get("isBlocked", False):
        return jsonify({"success": False, "message": "Your account is deactivated or suspended. Please contact the library administrator."}), 403

    token = generate_token(user)
    user_data = serialize_doc(user)
    user_data.pop("password", None)

    log_audit("LOGIN", "USER", f"User logged in successfully: {email}", user.get("_id"))

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "data": {
            "token": token,
            "user": user_data
        }
    })

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me():
    user = dict(g.current_user)
    user.pop("password", None)
    return jsonify({
        "success": True,
        "message": "User profile retrieved.",
        "data": user
    })

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    user_id = g.current_user.get("_id")
    user_col = get_col("users")

    allowed_fields = [
        "name", "phone", "department", "year", "studentId",
        "avatar", "bio", "interests", "address", "preferredLanguage"
    ]
    update_data = {}
    for f in allowed_fields:
        if f in data:
            update_data[f] = data[f]

    if update_data:
        update_data["updatedAt"] = datetime.datetime.utcnow().isoformat()
        user_col.update_one({"_id": user_id}, {"$set": update_data})

    updated_user = user_col.find_one({"_id": user_id})
    user_data = serialize_doc(updated_user)
    user_data.pop("password", None)

    log_audit("UPDATE_PROFILE", "USER", f"User updated profile details", user_id)

    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "data": user_data
    })

@auth_bp.route("/upload-avatar", methods=["POST"])
@token_required
def upload_avatar():
    if "avatar" not in request.files and "image" not in request.files and "file" not in request.files:
        return jsonify({"success": False, "message": "No avatar file provided."}), 400
    
    file = request.files.get("avatar") or request.files.get("image") or request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"success": False, "message": "Empty filename."}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        return jsonify({"success": False, "message": "Supported formats: JPG, PNG, WEBP, SVG."}), 400

    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"avatar_{uuid.uuid4().hex[:12]}{ext}"
    target_path = os.path.join(upload_dir, filename)
    file.save(target_path)

    avatar_url = f"/uploads/{filename}"
    user_id = g.current_user.get("_id")
    user_col = get_col("users")
    user_col.update_one(
        {"_id": user_id},
        {"$set": {"avatar": avatar_url, "updatedAt": datetime.datetime.utcnow().isoformat()}}
    )

    updated_user = user_col.find_one({"_id": user_id})
    user_data = serialize_doc(updated_user)
    user_data.pop("password", None)

    log_audit("UPDATE_AVATAR", "USER", "User updated profile picture", user_id)

    return jsonify({
        "success": True,
        "message": "Profile picture updated successfully!",
        "avatarUrl": avatar_url,
        "data": user_data
    })

@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password():
    data = request.get_json() or {}
    current_password = data.get("currentPassword", "")
    new_password = data.get("newPassword", "")

    if not current_password or not new_password:
        return jsonify({"success": False, "message": "Current and new password are required."}), 400

    if len(new_password) < 6:
        return jsonify({"success": False, "message": "New password must be at least 6 characters long."}), 400

    user_id = g.current_user.get("_id")
    user_col = get_col("users")
    user = user_col.find_one({"_id": user_id})

    if not verify_password(current_password, user.get("password", "")):
        return jsonify({"success": False, "message": "Current password is incorrect."}), 400

    user_col.update_one(
        {"_id": user_id},
        {"$set": {"password": hash_password(new_password), "updatedAt": datetime.datetime.utcnow().isoformat()}}
    )

    log_audit("PASSWORD_CHANGE", "USER", "User changed password", user_id)

    return jsonify({"success": True, "message": "Password changed successfully."})

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    user_col = get_col("users")
    user = user_col.find_one({"email": email})
    # For security reasons, respond with success message even if email is not found
    return jsonify({
        "success": True,
        "message": "If an account matches that email, password reset instructions have been dispatched."
    })
