import os
import datetime
import functools
import jwt
import bcrypt
from flask import request, jsonify, g
from backend.models.db import get_col, serialize_doc

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_production_jwt_key_smart_library_msc_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_token(user: dict) -> str:
    payload = {
        "sub": str(user.get("_id")),
        "id": str(user.get("_id")),
        "email": user.get("email"),
        "role": user.get("role", "STUDENT"),
        "name": user.get("name"),
        "studentId": user.get("studentId"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authentication token is missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "message": "Invalid token header format. Use 'Bearer <token>'"}), 401
        
        token = parts[1]
        decoded = decode_token(token)
        if not decoded:
            return jsonify({"success": False, "message": "Session expired or invalid token. Please log in again."}), 401
        
        user_col = get_col("users")
        user = user_col.find_one({"_id": decoded.get("id")})
        if not user:
            user = user_col.find_one({"email": decoded.get("email")})
        
        if not user:
            return jsonify({"success": False, "message": "User account no longer exists."}), 401
        
        if user.get("status") == "INACTIVE" or user.get("isBlocked", False):
            return jsonify({"success": False, "message": "Account has been deactivated or blocked. Contact administrator."}), 403

        g.current_user = serialize_doc(user)
        return f(*args, **kwargs)
    return decorated

def role_required(*roles):
    def decorator(f):
        @functools.wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            user_role = g.current_user.get("role")
            if user_role not in roles:
                return jsonify({
                    "success": False,
                    "message": f"Access denied. Requires one of roles: {', '.join(roles)}"
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def log_audit(action, entity, description, target_id=None):
    try:
        current_user = getattr(g, 'current_user', None)
        user_id = current_user.get('_id') if current_user else "SYSTEM"
        user_name = current_user.get('name') if current_user else "System Operation"
        role = current_user.get('role') if current_user else "SYSTEM"
        
        audit_col = get_col("audit_logs")
        audit_col.insert_one({
            "userId": user_id,
            "userName": user_name,
            "role": role,
            "action": action,
            "entity": entity,
            "targetId": str(target_id) if target_id else None,
            "description": description,
            "ip": request.remote_addr if request else "127.0.0.1",
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
    except Exception as e:
        print(f"Audit log error: {e}")
