import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from backend.routes.auth_routes import auth_bp
from backend.routes.book_routes import book_bp
from backend.routes.circulation_routes import circ_bp
from backend.routes.community_routes import comm_bp
from backend.routes.student_routes import student_bp
from backend.routes.ai_routes import ai_bp
from backend.routes.admin_routes import admin_bp
from backend.ai.recommender import recommender

app = Flask(__name__)

# Configure uploads directory (safely handle Vercel read-only filesystem)
if os.environ.get("VERCEL"):
    UPLOAD_FOLDER = "/tmp/uploads"
else:
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except Exception:
    pass
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(book_bp)
app.register_blueprint(circ_bp)
app.register_blueprint(comm_bp)
app.register_blueprint(student_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(admin_bp)

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/")
@app.route("/api")
@app.route("/api/")
def index():
    return jsonify({
        "success": True,
        "message": "AI-Powered Smart Library Management & Personalized Recommendation System API",
        "documentation": "/api/health",
        "version": "2.4.0"
    })

# Centralized Error Handlers
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"success": False, "message": "Bad Request", "error": str(e)}), 400

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"success": False, "message": "Unauthorized access", "error": str(e)}), 401

@app.errorhandler(403)
def forbidden(e):
    return jsonify({"success": False, "message": "Access forbidden. Insufficient permissions.", "error": str(e)}), 403

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Resource endpoint not found.", "error": str(e)}), 404

@app.errorhandler(409)
def conflict(e):
    return jsonify({"success": False, "message": "Conflict occurred with existing data.", "error": str(e)}), 409

@app.errorhandler(422)
def unprocessable_entity(e):
    return jsonify({"success": False, "message": "Unprocessable entity.", "error": str(e)}), 422

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "message": "Internal server error occurred.", "error": str(e)}), 500

# Fit AI recommender on startup
try:
    print("[*] Initializing AI Recommendation TF-IDF model...")
    recommender.fit()
    print("[+] AI Recommendation Engine fitted and ready.")
except Exception as e:
    print(f"[!] Warning fitting recommender on startup: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"[*] Starting Smart Library REST API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
