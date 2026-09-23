import uuid
import datetime
from flask import Blueprint, request, jsonify, g
from backend.models.db import get_col, serialize_doc
from backend.middleware.auth import token_required, role_required, log_audit

circ_bp = Blueprint("circulation", __name__)

def get_settings():
    set_col = get_col("system_settings")
    settings = set_col.find_one({"_id": "default_settings"}) or {}
    return {
        "loanDurationDays": int(settings.get("loanDurationDays", 14)),
        "maxBooksStudent": int(settings.get("maxBooksStudent", 4)),
        "maxRenewalLimit": int(settings.get("maxRenewalLimit", 2)),
        "fineRatePerDay": float(settings.get("fineRatePerDay", 1.0)),
        "gracePeriodDays": int(settings.get("gracePeriodDays", 2)),
        "maxFinePerBook": float(settings.get("maxFinePerBook", 25.0)),
        "reservationExpiryHours": int(settings.get("reservationExpiryHours", 48))
    }

@circ_bp.route("/api/transactions/issue", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def issue_book():
    data = request.get_json() or {}
    user_id = data.get("userId")
    book_id = data.get("bookId")
    copy_id = data.get("copyId")

    if not user_id or not book_id:
        return jsonify({"success": False, "message": "Member and Book selection are required."}), 400

    user_col = get_col("users")
    book_col = get_col("books")
    copy_col = get_col("book_copies")
    tx_col = get_col("transactions")

    user = user_col.find_one({"_id": str(user_id)})
    if not user:
        return jsonify({"success": False, "message": "Member not found."}), 404

    if user.get("isBlocked", False) or user.get("status") == "INACTIVE":
        return jsonify({"success": False, "message": "Cannot issue book: Member account is blocked or inactive."}), 403

    settings = get_settings()

    # Check student active loan limit
    active_loans = tx_col.count_documents({"userId": str(user_id), "status": {"$in": ["ISSUED", "OVERDUE"]}})
    if active_loans >= settings["maxBooksStudent"]:
        return jsonify({
            "success": False,
            "message": f"Member has reached the maximum borrowing limit of {settings['maxBooksStudent']} active books."
        }), 400

    # Check excessive unpaid fines
    unpaid_fines = list(tx_col.find({"userId": str(user_id), "fineAmount": {"$gt": 0}, "paymentStatus": "PENDING"}))
    total_unpaid = sum(float(f.get("fineAmount", 0)) for f in unpaid_fines)
    if total_unpaid >= 20.0:
        return jsonify({
            "success": False,
            "message": f"Cannot issue book: Member has excessive unpaid fines (${total_unpaid:.2f}). Please clear dues first."
        }), 403

    # Check book availability
    book = book_col.find_one({"_id": str(book_id)})
    if not book:
        return jsonify({"success": False, "message": "Book not found."}), 404

    avail = int(book.get("availableCopies", 0))
    if avail <= 0:
        return jsonify({"success": False, "message": "No available copies of this book currently in stock."}), 400

    # Select physical copy
    copy = None
    if copy_id:
        copy = copy_col.find_one({"_id": str(copy_id), "bookId": str(book_id), "status": "AVAILABLE"})
    if not copy:
        copy = copy_col.find_one({"bookId": str(book_id), "status": "AVAILABLE"})

    if not copy:
        return jsonify({"success": False, "message": "No physically available copy matching that ID found."}), 400

    now = datetime.datetime.utcnow()
    due_date = now + datetime.timedelta(days=settings["loanDurationDays"])
    tx_code = f"TXN-{now.year}-{uuid.uuid4().hex[:6].upper()}"

    transaction = {
        "_id": str(uuid.uuid4()),
        "transactionId": tx_code,
        "userId": str(user_id),
        "userName": user.get("name"),
        "userEmail": user.get("email"),
        "studentId": user.get("studentId"),
        "bookId": str(book_id),
        "bookTitle": book.get("title"),
        "isbn": book.get("isbn"),
        "copyId": str(copy.get("_id")),
        "barcode": copy.get("barcode"),
        "issueDate": now.isoformat(),
        "dueDate": due_date.isoformat(),
        "returnDate": None,
        "status": "ISSUED",
        "renewalCount": 0,
        "maxRenewals": settings["maxRenewalLimit"],
        "fineAmount": 0.0,
        "paymentStatus": "NONE",
        "issuedBy": g.current_user.get("name"),
        "issuedByRole": g.current_user.get("role"),
        "createdAt": now.isoformat()
    }

    tx_col.insert_one(transaction)

    # Update book stock
    book_col.update_one(
        {"_id": str(book_id)},
        {"$inc": {"availableCopies": -1, "issuedCopies": 1, "timesBorrowed": 1}}
    )

    # Update copy status
    copy_col.update_one({"_id": str(copy["_id"])}, {"$set": {"status": "ISSUED"}})

    # Update user borrow counters
    user_col.update_one(
        {"_id": str(user_id)},
        {"$inc": {"booksBorrowedCount": 1, "currentBorrowedCount": 1}}
    )

    # Notification
    notif_col = get_col("notifications")
    notif_col.insert_one({
        "userId": str(user_id),
        "title": "Book Issued Successfully",
        "message": f"You borrowed '{book.get('title')}'. Due date: {due_date.strftime('%B %d, %Y')}.",
        "type": "BOOK_ISSUED",
        "isRead": False,
        "createdAt": now.isoformat()
    })

    log_audit("ISSUE_BOOK", "CIRCULATION", f"Issued '{book.get('title')}' to {user.get('name')} ({tx_code})", tx_code)

    return jsonify({
        "success": True,
        "message": f"Book issued successfully to {user.get('name')}.",
        "data": {
            "transaction": serialize_doc(transaction),
            "receipt": {
                "transactionId": tx_code,
                "memberName": user.get("name"),
                "studentId": user.get("studentId"),
                "bookTitle": book.get("title"),
                "barcode": copy.get("barcode"),
                "issueDate": now.strftime("%Y-%m-%d %H:%M"),
                "dueDate": due_date.strftime("%Y-%m-%d"),
                "issuedBy": g.current_user.get("name")
            }
        }
    }), 201

@circ_bp.route("/api/transactions/return", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def return_book():
    data = request.get_json() or {}
    tx_id = data.get("transactionId")
    copy_barcode = data.get("barcode")

    tx_col = get_col("transactions")
    tx = None
    if tx_id:
        tx = tx_col.find_one({"$or": [{"_id": str(tx_id)}, {"transactionId": str(tx_id)}]})
    elif copy_barcode:
        tx = tx_col.find_one({"barcode": copy_barcode, "status": {"$in": ["ISSUED", "OVERDUE"]}})

    if not tx or tx.get("status") == "RETURNED":
        return jsonify({"success": False, "message": "Active loan transaction not found."}), 404

    now = datetime.datetime.utcnow()
    settings = get_settings()

    # Calculate overdue & fine
    due_dt = datetime.datetime.fromisoformat(tx["dueDate"].replace("Z", "+00:00")).replace(tzinfo=None)
    overdue_days = max(0, (now.date() - due_dt.date()).days)
    
    fine = 0.0
    if overdue_days > settings["gracePeriodDays"]:
        billable_days = overdue_days - settings["gracePeriodDays"]
        fine = min(settings["maxFinePerBook"], billable_days * settings["fineRatePerDay"])

    book_id = str(tx.get("bookId"))
    copy_id = str(tx.get("copyId"))
    user_id = str(tx.get("userId"))

    book_col = get_col("books")
    copy_col = get_col("book_copies")
    user_col = get_col("users")
    res_col = get_col("reservations")
    notif_col = get_col("notifications")

    # Update transaction
    tx_update = {
        "status": "RETURNED",
        "returnDate": now.isoformat(),
        "overdueDays": overdue_days,
        "fineAmount": fine,
        "paymentStatus": "PAID" if fine == 0 else "PENDING",
        "returnedBy": g.current_user.get("name"),
        "updatedAt": now.isoformat()
    }
    tx_col.update_one({"_id": tx["_id"]}, {"$set": tx_update})

    # Update copy status
    copy_col.update_one({"_id": copy_id}, {"$set": {"status": "AVAILABLE"}})

    # Decrement user's currentBorrowedCount
    user_col.update_one({"_id": user_id}, {"$inc": {"currentBorrowedCount": -1}})
    if fine > 0:
        user_col.update_one({"_id": user_id}, {"$inc": {"totalFines": fine}})

    # Check reservation queue for this book
    waiting_res = list(res_col.find({"bookId": book_id, "status": "WAITING"}).sort("queuePosition", 1).limit(1))
    
    if waiting_res:
        # Promote top reservation to READY
        promoted = waiting_res[0]
        expiry = now + datetime.timedelta(hours=settings["reservationExpiryHours"])
        res_col.update_one(
            {"_id": promoted["_id"]},
            {"$set": {"status": "READY", "expiryDate": expiry.isoformat()}}
        )
        # Allocate copy as reserved
        book_col.update_one(
            {"_id": book_id},
            {"$inc": {"issuedCopies": -1, "reservedCopies": 1}}
        )
        copy_col.update_one({"_id": copy_id}, {"$set": {"status": "RESERVED"}})
        
        # Notify reserving member
        notif_col.insert_one({
            "userId": str(promoted.get("userId")),
            "title": "Reserved Book is Ready for Pickup!",
            "message": f"Your reserved book '{tx.get('bookTitle')}' is now ready at the circulation desk. Please collect before {expiry.strftime('%B %d, %H:%M')}.",
            "type": "RESERVATION_READY",
            "isRead": False,
            "createdAt": now.isoformat()
        })
    else:
        # Return to general available pool
        book_col.update_one(
            {"_id": book_id},
            {"$inc": {"availableCopies": 1, "issuedCopies": -1}}
        )

    # Notify returning member
    notif_col.insert_one({
        "userId": user_id,
        "title": "Book Returned Successfully",
        "message": f"You returned '{tx.get('bookTitle')}'. Fine assessed: ${fine:.2f}.",
        "type": "BOOK_RETURNED",
        "isRead": False,
        "createdAt": now.isoformat()
    })

    log_audit("RETURN_BOOK", "CIRCULATION", f"Returned '{tx.get('bookTitle')}' from {tx.get('userName')} (Fine: ${fine:.2f})", tx["transactionId"])

    return jsonify({
        "success": True,
        "message": "Book returned successfully.",
        "data": {
            "transactionId": tx.get("transactionId"),
            "bookTitle": tx.get("bookTitle"),
            "memberName": tx.get("userName"),
            "returnDate": now.strftime("%Y-%m-%d %H:%M"),
            "overdueDays": overdue_days,
            "fineAmount": fine,
            "finePaid": fine == 0
        }
    })

@circ_bp.route("/api/transactions/renew", methods=["POST"])
@token_required
def renew_book():
    data = request.get_json() or {}
    tx_id = data.get("transactionId")
    tx_col = get_col("transactions")

    tx = tx_col.find_one({"$or": [{"_id": str(tx_id)}, {"transactionId": str(tx_id)}]})
    if not tx or tx.get("status") != "ISSUED":
        return jsonify({"success": False, "message": "Active loan transaction not found."}), 404

    # Authorization: Student can only renew own book, admin/librarian can renew any
    if g.current_user.get("role") == "STUDENT" and str(tx.get("userId")) != str(g.current_user.get("_id")):
        return jsonify({"success": False, "message": "Unauthorized to renew another student's loan."}), 403

    settings = get_settings()

    # Check renewal limit
    current_renewals = int(tx.get("renewalCount", 0))
    if current_renewals >= settings["maxRenewalLimit"]:
        return jsonify({
            "success": False,
            "message": f"Renewal limit reached ({settings['maxRenewalLimit']} renewals maximum permitted)."
        }), 400

    # Check if another user reserved this book
    res_col = get_col("reservations")
    active_reservations = res_col.count_documents({"bookId": str(tx.get("bookId")), "status": "WAITING"})
    if active_reservations > 0:
        return jsonify({
            "success": False,
            "message": "Cannot renew book: Another student is currently waiting in the reservation queue for this title."
        }), 409

    # Extend due date
    current_due = datetime.datetime.fromisoformat(tx["dueDate"].replace("Z", "+00:00")).replace(tzinfo=None)
    new_due = current_due + datetime.timedelta(days=settings["loanDurationDays"])

    tx_col.update_one(
        {"_id": tx["_id"]},
        {"$set": {
            "dueDate": new_due.isoformat(),
            "renewalCount": current_renewals + 1,
            "updatedAt": datetime.datetime.utcnow().isoformat()
        }}
    )

    log_audit("RENEW_BOOK", "CIRCULATION", f"Renewed loan for '{tx.get('bookTitle')}' to {new_due.strftime('%Y-%m-%d')}", tx["transactionId"])

    return jsonify({
        "success": True,
        "message": f"Loan renewed successfully! New due date: {new_due.strftime('%B %d, %Y')}.",
        "data": {
            "transactionId": tx.get("transactionId"),
            "newDueDate": new_due.strftime("%Y-%m-%d"),
            "renewalCount": current_renewals + 1,
            "remainingRenewals": settings["maxRenewalLimit"] - (current_renewals + 1)
        }
    })

@circ_bp.route("/api/transactions", methods=["GET"])
@token_required
def get_transactions():
    status = request.args.get("status")
    search = request.args.get("search", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 15))

    tx_col = get_col("transactions")
    query = {}

    # If student, restrict to own transactions
    if g.current_user.get("role") == "STUDENT":
        query["userId"] = str(g.current_user.get("_id"))
    elif request.args.get("userId"):
        query["userId"] = request.args.get("userId")

    if status and status != "ALL":
        query["status"] = status

    if search:
        escaped = re.escape(search)
        query["$or"] = [
            {"transactionId": {"$regex": escaped, "$options": "i"}},
            {"userName": {"$regex": escaped, "$options": "i"}},
            {"bookTitle": {"$regex": escaped, "$options": "i"}},
            {"isbn": {"$regex": escaped, "$options": "i"}},
            {"barcode": {"$regex": escaped, "$options": "i"}}
        ]

    total = tx_col.count_documents(query)
    txs = list(tx_col.find(query).sort("createdAt", -1).skip((page - 1) * limit).limit(limit))

    return jsonify({
        "success": True,
        "data": {
            "transactions": [serialize_doc(t) for t in txs],
            "total": total,
            "page": page,
            "limit": limit
        }
    })

# Reservations
@circ_bp.route("/api/reservations", methods=["POST"])
@token_required
def create_reservation():
    data = request.get_json() or {}
    book_id = data.get("bookId")
    if not book_id:
        return jsonify({"success": False, "message": "Book ID is required."}), 400

    user_id = str(g.current_user.get("_id"))
    res_col = get_col("reservations")
    book_col = get_col("books")

    # Check if already reserved by this user
    if res_col.find_one({"userId": user_id, "bookId": str(book_id), "status": {"$in": ["WAITING", "READY"]}}):
        return jsonify({"success": False, "message": "You already have an active reservation for this book."}), 400

    book = book_col.find_one({"_id": str(book_id)})
    if not book:
        return jsonify({"success": False, "message": "Book not found."}), 404

    # Calculate queue position
    current_waiting = res_col.count_documents({"bookId": str(book_id), "status": "WAITING"})
    queue_pos = current_waiting + 1

    # Estimate wait time: queue position * (average loan turnaround ~ 7 days) / total copies
    copies = max(1, int(book.get("totalCopies", 1)))
    estimated_wait_days = max(2, int(round((queue_pos * 7.0) / copies)))

    now = datetime.datetime.utcnow()
    res_id = f"RES-{now.year}-{uuid.uuid4().hex[:6].upper()}"

    new_res = {
        "_id": str(uuid.uuid4()),
        "reservationId": res_id,
        "userId": user_id,
        "userName": g.current_user.get("name"),
        "userEmail": g.current_user.get("email"),
        "bookId": str(book_id),
        "bookTitle": book.get("title"),
        "queuePosition": queue_pos,
        "estimatedWaitDays": estimated_wait_days,
        "reservationDate": now.isoformat(),
        "expiryDate": (now + datetime.timedelta(days=14)).isoformat(),
        "status": "WAITING",
        "createdAt": now.isoformat()
    }

    res_col.insert_one(new_res)
    log_audit("RESERVE_BOOK", "CIRCULATION", f"Reserved '{book.get('title')}' at queue position {queue_pos}", res_id)

    return jsonify({
        "success": True,
        "message": f"Reservation confirmed! Your queue position is #{queue_pos}. Estimated waiting time: ~{estimated_wait_days} days.",
        "data": serialize_doc(new_res)
    }), 201

@circ_bp.route("/api/reservations", methods=["GET"])
@token_required
def get_reservations():
    res_col = get_col("reservations")
    query = {}
    if g.current_user.get("role") == "STUDENT":
        query["userId"] = str(g.current_user.get("_id"))
    elif request.args.get("userId"):
        query["userId"] = request.args.get("userId")

    reservations = list(res_col.find(query).sort("createdAt", -1))
    return jsonify({
        "success": True,
        "data": [serialize_doc(r) for r in reservations]
    })

@circ_bp.route("/api/reservations/<res_id>", methods=["DELETE"])
@token_required
def cancel_reservation(res_id):
    res_col = get_col("reservations")
    res = res_col.find_one({"$or": [{"_id": str(res_id)}, {"reservationId": str(res_id)}]})
    if not res:
        return jsonify({"success": False, "message": "Reservation not found."}), 404

    if g.current_user.get("role") == "STUDENT" and str(res.get("userId")) != str(g.current_user.get("_id")):
        return jsonify({"success": False, "message": "Unauthorized."}), 403

    res_col.update_one({"_id": res["_id"]}, {"$set": {"status": "CANCELLED"}})

    # Re-order queue positions for remaining waiting reservations
    waiting = list(res_col.find({"bookId": res["bookId"], "status": "WAITING"}).sort("createdAt", 1))
    for idx, w in enumerate(waiting, start=1):
        res_col.update_one({"_id": w["_id"]}, {"$set": {"queuePosition": idx}})

    return jsonify({"success": True, "message": "Reservation cancelled."})

# Fines management
@circ_bp.route("/api/fines", methods=["GET"])
@token_required
def get_fines():
    tx_col = get_col("transactions")
    query = {"fineAmount": {"$gt": 0}}
    if g.current_user.get("role") == "STUDENT":
        query["userId"] = str(g.current_user.get("_id"))

    fines = list(tx_col.find(query).sort("createdAt", -1))
    return jsonify({
        "success": True,
        "data": [serialize_doc(f) for f in fines]
    })

@circ_bp.route("/api/fines/<tx_id>/pay", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def pay_fine(tx_id):
    tx_col = get_col("transactions")
    user_col = get_col("users")

    tx = tx_col.find_one({"$or": [{"_id": str(tx_id)}, {"transactionId": str(tx_id)}]})
    if not tx:
        return jsonify({"success": False, "message": "Fine record not found."}), 404

    fine_amt = float(tx.get("fineAmount", 0))
    tx_col.update_one(
        {"_id": tx["_id"]},
        {"$set": {"paymentStatus": "PAID", "paidAt": datetime.datetime.utcnow().isoformat()}}
    )

    user_col.update_one(
        {"_id": str(tx.get("userId"))},
        {"$inc": {"totalFines": -fine_amt}}
    )

    log_audit("PAY_FINE", "FINES", f"Collected fine payment of ${fine_amt:.2f} for Tx {tx.get('transactionId')}", tx_id)
    return jsonify({"success": True, "message": f"Fine payment of ${fine_amt:.2f} recorded successfully."})

@circ_bp.route("/api/fines/<tx_id>/waive", methods=["POST"])
@token_required
@role_required("ADMIN")
def waive_fine(tx_id):
    tx_col = get_col("transactions")
    user_col = get_col("users")

    tx = tx_col.find_one({"$or": [{"_id": str(tx_id)}, {"transactionId": str(tx_id)}]})
    if not tx:
        return jsonify({"success": False, "message": "Fine record not found."}), 404

    fine_amt = float(tx.get("fineAmount", 0))
    tx_col.update_one(
        {"_id": tx["_id"]},
        {"$set": {"paymentStatus": "WAIVED", "waivedBy": g.current_user.get("name"), "waivedAt": datetime.datetime.utcnow().isoformat()}}
    )

    user_col.update_one(
        {"_id": str(tx.get("userId"))},
        {"$inc": {"totalFines": -fine_amt}}
    )

    log_audit("WAIVE_FINE", "FINES", f"Waived fine of ${fine_amt:.2f} for Tx {tx.get('transactionId')}", tx_id)
    return jsonify({"success": True, "message": f"Fine of ${fine_amt:.2f} has been waived."})
