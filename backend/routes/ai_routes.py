import os
import uuid
from flask import Blueprint, request, jsonify, g
from backend.models.db import get_col
from backend.middleware.auth import token_required, decode_token
from backend.ai.recommender import recommender
from backend.ai.demand_predictor import demand_predictor
from backend.ai.chatbot import assistant
from backend.ai.ocr_service import ocr_service

ai_bp = Blueprint("ai", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@ai_bp.route("/api/recommendations/for-you", methods=["GET"])
def get_for_you_recommendations():
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            token = auth_header.split()[1]
            decoded = decode_token(token)
            if decoded:
                user_id = decoded.get("id")
        except Exception:
            pass

    limit = int(request.args.get("limit", 8))
    books = recommender.get_recommendations_for_user(user_id, limit=limit) if user_id else recommender.get_trending_books(limit=limit)

    return jsonify({
        "success": True,
        "message": "Personalized recommendations retrieved.",
        "data": books
    })

@ai_bp.route("/api/recommendations/because-you-borrowed", methods=["GET"])
@token_required
def get_because_you_borrowed():
    user_id = str(g.current_user.get("_id"))
    data = recommender.get_because_you_borrowed(user_id, limit=6)
    return jsonify({
        "success": True,
        "data": data
    })

@ai_bp.route("/api/recommendations/trending", methods=["GET"])
def get_trending():
    limit = int(request.args.get("limit", 6))
    books = recommender.get_trending_books(limit=limit)
    return jsonify({
        "success": True,
        "data": books
    })

@ai_bp.route("/api/recommendations/department", methods=["GET"])
def get_department_recs():
    dept = request.args.get("department", "Computer Science and Engineering")
    limit = int(request.args.get("limit", 6))
    books = recommender.get_department_recommendations(dept, limit=limit)
    return jsonify({
        "success": True,
        "data": books
    })

@ai_bp.route("/api/predictions/inventory-health", methods=["GET"])
def get_inventory_health():
    health_data = demand_predictor.analyze_inventory_health()
    return jsonify({
        "success": True,
        "message": "AI Inventory Health & Demand analysis computed.",
        "data": health_data
    })

@ai_bp.route("/api/assistant/chat", methods=["POST"])
def assistant_chat():
    data = request.get_json() or {}
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"success": False, "message": "Query prompt is required."}), 400

    current_user = None
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            token = auth_header.split()[1]
            decoded = decode_token(token)
            if decoded:
                current_user = decoded
        except Exception:
            pass

    history = data.get("history", [])
    language = data.get("language", "en")
    reply = assistant.answer_query(query, user=current_user, history=history, language=language)
    return jsonify({
        "success": True,
        "data": reply
    })

@ai_bp.route("/api/ocr/scan", methods=["POST"])
def scan_ocr_image():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No image file provided."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "message": "Invalid file."}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        return jsonify({"success": False, "message": "Supported formats: JPG, PNG, WEBP, BMP"}), 400

    saved_name = f"ocr_{uuid.uuid4().hex}{ext}"
    saved_path = os.path.join(UPLOAD_FOLDER, saved_name)
    file.save(saved_path)

    extracted = ocr_service.extract_from_image(saved_path)
    extracted["imageUrl"] = f"/uploads/{saved_name}"

    return jsonify({
        "success": True,
        "message": "OCR scan completed. Please review and verify extracted details before registering book.",
        "data": extracted
    })
