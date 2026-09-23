import uuid
import datetime
from flask import Blueprint, request, jsonify, g
from backend.models.db import get_col, serialize_doc
from backend.middleware.auth import token_required, role_required, log_audit

comm_bp = Blueprint("community", __name__)

# Book Requests
@comm_bp.route("/api/book-requests", methods=["GET"])
def get_book_requests():
    req_col = get_col("book_requests")
    requests = list(req_col.find().sort("createdAt", -1))
    
    # If user is authenticated, check which ones they've voted on
    voted_ids = set()
    auth_header = request.headers.get("Authorization")
    if auth_header:
        from backend.middleware.auth import decode_token
        try:
            token = auth_header.split()[1]
            decoded = decode_token(token)
            if decoded:
                vote_col = get_col("book_votes")
                user_votes = list(vote_col.find({"userId": decoded.get("id")}))
                voted_ids = {str(v.get("requestId")) for v in user_votes}
        except Exception:
            pass

    results = []
    for r in requests:
        doc = serialize_doc(r)
        doc["hasVoted"] = str(doc.get("_id")) in voted_ids
        results.append(doc)

    return jsonify({"success": True, "data": results})

@comm_bp.route("/api/book-requests", methods=["POST"])
@token_required
def create_book_request():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    author = data.get("author", "").strip()
    if not title or not author:
        return jsonify({"success": False, "message": "Book title and author are required."}), 400

    req_col = get_col("book_requests")
    now = datetime.datetime.utcnow().isoformat()
    new_req = {
        "_id": str(uuid.uuid4()),
        "title": title,
        "author": author,
        "isbn": data.get("isbn", ""),
        "category": data.get("category", "Computer Science"),
        "reason": data.get("reason", "Useful for coursework and reference."),
        "priority": data.get("priority", "MEDIUM"),
        "status": "PENDING",
        "requestedBy": str(g.current_user.get("_id")),
        "requestedByName": g.current_user.get("name"),
        "votesCount": 1,
        "adminNotes": "",
        "createdAt": now
    }

    req_col.insert_one(new_req)

    # Initial vote by requester
    vote_col = get_col("book_votes")
    vote_col.insert_one({
        "requestId": new_req["_id"],
        "userId": str(g.current_user.get("_id")),
        "createdAt": now
    })

    log_audit("REQUEST_BOOK", "COMMUNITY", f"Requested book: '{title}' by {author}", new_req["_id"])

    return jsonify({
        "success": True,
        "message": "Book purchase request submitted for review.",
        "data": serialize_doc(new_req)
    }), 201

@comm_bp.route("/api/book-requests/<req_id>/vote", methods=["POST"])
@token_required
def vote_book_request(req_id):
    req_col = get_col("book_requests")
    vote_col = get_col("book_votes")
    user_id = str(g.current_user.get("_id"))

    req = req_col.find_one({"_id": str(req_id)})
    if not req:
        return jsonify({"success": False, "message": "Book request not found."}), 404

    existing = vote_col.find_one({"requestId": str(req_id), "userId": user_id})
    if existing:
        # Toggle unvote
        vote_col.delete_one({"_id": existing["_id"]})
        req_col.update_one({"_id": str(req_id)}, {"$inc": {"votesCount": -1}})
        return jsonify({"success": True, "message": "Vote removed.", "data": {"hasVoted": False}})
    else:
        # Cast vote
        vote_col.insert_one({
            "requestId": str(req_id),
            "userId": user_id,
            "createdAt": datetime.datetime.utcnow().isoformat()
        })
        req_col.update_one({"_id": str(req_id)}, {"$inc": {"votesCount": 1}})
        return jsonify({"success": True, "message": "Vote recorded!", "data": {"hasVoted": True}})

@comm_bp.route("/api/book-requests/<req_id>/status", methods=["PUT"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def update_book_request_status(req_id):
    data = request.get_json() or {}
    new_status = data.get("status") # PENDING, UNDER_REVIEW, APPROVED, REJECTED, PURCHASED
    admin_notes = data.get("adminNotes", "")

    req_col = get_col("book_requests")
    req = req_col.find_one({"_id": str(req_id)})
    if not req:
        return jsonify({"success": False, "message": "Request not found."}), 404

    req_col.update_one(
        {"_id": str(req_id)},
        {"$set": {"status": new_status, "adminNotes": admin_notes, "updatedAt": datetime.datetime.utcnow().isoformat()}}
    )

    # Notify requester
    notif_col = get_col("notifications")
    notif_col.insert_one({
        "userId": str(req.get("requestedBy")),
        "title": f"Book Request Status: {new_status}",
        "message": f"Your request for '{req.get('title')}' is now {new_status}. {admin_notes}",
        "type": "REQUEST_UPDATE",
        "isRead": False,
        "createdAt": datetime.datetime.utcnow().isoformat()
    })

    return jsonify({"success": True, "message": f"Status updated to {new_status}."})

# Wishlist
@comm_bp.route("/api/wishlist", methods=["GET"])
@token_required
def get_wishlist():
    wish_col = get_col("wishlists")
    book_col = get_col("books")
    user_id = str(g.current_user.get("_id"))

    wishes = list(wish_col.find({"userId": user_id}).sort("createdAt", -1))
    book_ids = [w.get("bookId") for w in wishes]
    books = list(book_col.find({"_id": {"$in": book_ids}}))
    books_map = {str(b["_id"]): serialize_doc(b) for b in books}

    result = []
    for w in wishes:
        b_data = books_map.get(str(w.get("bookId")))
        if b_data:
            result.append(b_data)

    return jsonify({"success": True, "data": result})

@comm_bp.route("/api/wishlist", methods=["POST"])
@token_required
def add_to_wishlist():
    data = request.get_json() or {}
    book_id = data.get("bookId")
    if not book_id:
        return jsonify({"success": False, "message": "Book ID required."}), 400

    wish_col = get_col("wishlists")
    user_id = str(g.current_user.get("_id"))

    existing = wish_col.find_one({"userId": user_id, "bookId": str(book_id)})
    if existing:
        wish_col.delete_one({"_id": existing["_id"]})
        return jsonify({"success": True, "message": "Removed from wishlist.", "data": {"inWishlist": False}})

    wish_col.insert_one({
        "userId": user_id,
        "bookId": str(book_id),
        "createdAt": datetime.datetime.utcnow().isoformat()
    })
    return jsonify({"success": True, "message": "Added to wishlist.", "data": {"inWishlist": True}})

# Reviews & Ratings
@comm_bp.route("/api/reviews", methods=["POST"])
@token_required
def add_review():
    data = request.get_json() or {}
    book_id = data.get("bookId")
    rating = int(data.get("rating", 5))
    comment = data.get("comment", "").strip()

    if not book_id or not comment:
        return jsonify({"success": False, "message": "Book ID and review comment are required."}), 400

    rev_col = get_col("reviews")
    book_col = get_col("books")
    user_id = str(g.current_user.get("_id"))

    # Update or insert review
    existing = rev_col.find_one({"bookId": str(book_id), "userId": user_id})
    now = datetime.datetime.utcnow().isoformat()

    if existing:
        rev_col.update_one(
            {"_id": existing["_id"]},
            {"$set": {"rating": rating, "comment": comment, "updatedAt": now}}
        )
    else:
        rev_col.insert_one({
            "bookId": str(book_id),
            "userId": user_id,
            "userName": g.current_user.get("name"),
            "userAvatar": g.current_user.get("avatar"),
            "rating": rating,
            "comment": comment,
            "createdAt": now
        })

    # Recalculate average rating for book
    all_revs = list(rev_col.find({"bookId": str(book_id)}))
    avg_rating = round(sum(r.get("rating", 5) for r in all_revs) / len(all_revs), 2)
    book_col.update_one(
        {"_id": str(book_id)},
        {"$set": {"rating": avg_rating, "ratingsCount": len(all_revs)}}
    )

    return jsonify({
        "success": True,
        "message": "Review submitted successfully!",
        "data": {"averageRating": avg_rating, "ratingsCount": len(all_revs)}
    })
