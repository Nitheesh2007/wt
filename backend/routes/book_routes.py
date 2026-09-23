import csv
import io
import os
import re
import uuid
import datetime
from flask import Blueprint, request, jsonify, g, Response
from backend.models.db import get_col, serialize_doc
from backend.middleware.auth import token_required, role_required, log_audit
from backend.ai.recommender import recommender

book_bp = Blueprint("books", __name__)

@book_bp.route("/api/books/upload-cover", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def upload_book_cover():
    if "cover" not in request.files and "image" not in request.files:
        return jsonify({"success": False, "message": "No image file provided in request."}), 400
    
    file = request.files.get("cover") or request.files.get("image")
    if not file or file.filename == "":
        return jsonify({"success": False, "message": "Empty filename."}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        return jsonify({"success": False, "message": "Supported formats are JPG, PNG, WEBP, SVG."}), 400

    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"cover_{uuid.uuid4().hex[:12]}{ext}"
    target_path = os.path.join(upload_dir, filename)
    file.save(target_path)

    image_url = f"http://localhost:5000/uploads/{filename}"
    return jsonify({
        "success": True,
        "message": "Book cover image uploaded successfully.",
        "imageUrl": image_url
    })

@book_bp.route("/api/books", methods=["GET"])
def get_books():
    q = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    language = request.args.get("language", "").strip()
    availability = request.args.get("availability", "").strip()
    sort_by = request.args.get("sortBy", "relevance")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 12))

    book_col = get_col("books")
    query = {}

    if availability == "AVAILABLE":
        query["availableCopies"] = {"$gt": 0}
        query["status"] = {"$ne": "ARCHIVED"}
    elif availability == "OUT_OF_STOCK":
        query["availableCopies"] = 0
        query["status"] = {"$ne": "ARCHIVED"}
    elif availability == "ARCHIVED":
        query["status"] = "ARCHIVED"
    else:
        query["status"] = {"$ne": "ARCHIVED"}

    if category and category != "All":
        query["category"] = category

    if language and language != "All":
        query["language"] = language

    if q:
        escaped_q = re.escape(q)
        query["$or"] = [
            {"title": {"$regex": escaped_q, "$options": "i"}},
            {"author": {"$regex": escaped_q, "$options": "i"}},
            {"isbn": {"$regex": escaped_q, "$options": "i"}},
            {"publisher": {"$regex": escaped_q, "$options": "i"}},
            {"category": {"$regex": escaped_q, "$options": "i"}},
            {"keywords": {"$regex": escaped_q, "$options": "i"}},
            {"shelf": {"$regex": escaped_q, "$options": "i"}},
            {"rack": {"$regex": escaped_q, "$options": "i"}}
        ]

    total_count = book_col.count_documents(query)

    cursor = book_col.find(query)

    if sort_by == "title":
        cursor.sort("title", 1)
    elif sort_by == "recently_added":
        cursor.sort("createdAt", -1)
    elif sort_by == "most_borrowed":
        cursor.sort("timesBorrowed", -1)
    elif sort_by == "rating":
        cursor.sort("rating", -1)
    else:
        cursor.sort([("rating", -1), ("timesBorrowed", -1)])

    skip = (page - 1) * limit
    books = list(cursor.skip(skip).limit(limit))

    return jsonify({
        "success": True,
        "message": "Books retrieved successfully.",
        "data": {
            "books": [serialize_doc(b) for b in books],
            "total": total_count,
            "page": page,
            "limit": limit,
            "totalPages": (total_count + limit - 1) // limit if total_count > 0 else 1
        }
    })

@book_bp.route("/api/books/<book_id>", methods=["GET"])
def get_book_by_id(book_id):
    book_col = get_col("books")
    book = book_col.find_one({"_id": str(book_id)})
    if not book:
        return jsonify({"success": False, "message": "Book not found"}), 404

    # Fetch physical copies
    copy_col = get_col("book_copies")
    copies = list(copy_col.find({"bookId": str(book_id)}))

    # Fetch reviews
    rev_col = get_col("reviews")
    reviews = list(rev_col.find({"bookId": str(book_id)}).sort("createdAt", -1).limit(10))

    # Get similar books via ML engine
    similar = recommender.get_similar_books(str(book_id), limit=4)

    return jsonify({
        "success": True,
        "message": "Book details retrieved.",
        "data": {
            "book": serialize_doc(book),
            "copies": [serialize_doc(c) for c in copies],
            "reviews": [serialize_doc(r) for r in reviews],
            "similarBooks": similar
        }
    })

@book_bp.route("/api/books", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def create_book():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    isbn = data.get("isbn", "").strip()
    author = data.get("author", "").strip()
    category = data.get("category", "Computer Science").strip()
    total_copies = int(data.get("totalCopies", 1))

    if not title or not isbn or not author:
        return jsonify({"success": False, "message": "Title, ISBN, and Author are required."}), 400

    book_col = get_col("books")
    if book_col.find_one({"isbn": isbn}):
        return jsonify({"success": False, "message": f"A book with ISBN '{isbn}' already exists in catalog."}), 409

    now = datetime.datetime.utcnow().isoformat()
    new_book = {
        "isbn": isbn,
        "title": title,
        "subtitle": data.get("subtitle", ""),
        "author": author,
        "coAuthor": data.get("coAuthor", ""),
        "publisher": data.get("publisher", "Academic Press"),
        "edition": data.get("edition", "1st Edition"),
        "publicationYear": int(data.get("publicationYear", 2024)),
        "category": category,
        "subcategory": data.get("subcategory", "General"),
        "language": data.get("language", "English"),
        "pages": int(data.get("pages", 300)),
        "description": data.get("description", "Comprehensive academic reference book."),
        "keywords": data.get("keywords", [k.strip() for k in title.lower().split() if len(k) > 3]),
        "coverImage": data.get("coverImage", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"),
        "shelf": data.get("shelf", "Stack-A"),
        "rack": data.get("rack", "R-01"),
        "row": data.get("row", "1"),
        "totalCopies": total_copies,
        "availableCopies": total_copies,
        "issuedCopies": 0,
        "reservedCopies": 0,
        "price": float(data.get("price", 39.99)),
        "acquisitionDate": data.get("acquisitionDate", now[:10]),
        "bookCondition": data.get("bookCondition", "New"),
        "status": "AVAILABLE",
        "rating": 5.0,
        "ratingsCount": 1,
        "timesBorrowed": 0,
        "createdAt": now,
        "updatedAt": now
    }

    res = book_col.insert_one(new_book)
    book_id = str(res.inserted_id)
    new_book["_id"] = book_id

    # Create physical copy records
    copy_col = get_col("book_copies")
    clean_isbn = re.sub(r"[^\dX]", "", isbn)
    for i in range(total_copies):
        copy_col.insert_one({
            "bookId": book_id,
            "isbn": isbn,
            "barcode": f"SL-BC-{clean_isbn[-6:] if len(clean_isbn)>=6 else '000000'}-{i+1:02d}",
            "copyNumber": i + 1,
            "shelf": new_book["shelf"],
            "rack": new_book["rack"],
            "row": new_book["row"],
            "condition": "New",
            "status": "AVAILABLE",
            "acquisitionDate": new_book["acquisitionDate"]
        })

    # Trigger recommender model refresh
    recommender.fit()
    log_audit("CREATE_BOOK", "BOOK", f"Added book: '{title}' ({isbn}) with {total_copies} copies", book_id)

    return jsonify({
        "success": True,
        "message": "Book added successfully with copy records generated.",
        "data": serialize_doc(new_book)
    }), 201

@book_bp.route("/api/books/<book_id>", methods=["PUT"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def update_book(book_id):
    data = request.get_json() or {}
    book_col = get_col("books")
    book = book_col.find_one({"_id": str(book_id)})
    if not book:
        return jsonify({"success": False, "message": "Book not found"}), 404

    editable_fields = [
        "title", "subtitle", "author", "coAuthor", "publisher", "edition",
        "publicationYear", "category", "subcategory", "language", "pages",
        "description", "keywords", "coverImage", "shelf", "rack", "row",
        "price", "bookCondition", "status"
    ]
    
    update_data = {}
    for f in editable_fields:
        if f in data:
            update_data[f] = data[f]

    # Handle total copies change
    if "totalCopies" in data:
        new_total = int(data["totalCopies"])
        current_total = int(book.get("totalCopies", 0))
        issued = int(book.get("issuedCopies", 0))
        
        if new_total < issued:
            return jsonify({
                "success": False,
                "message": f"Cannot reduce total copies below currently issued count ({issued})."
            }), 400
        
        diff = new_total - current_total
        update_data["totalCopies"] = new_total
        update_data["availableCopies"] = max(0, int(book.get("availableCopies", 0)) + diff)
        
        # If adding copies, generate extra copy records
        if diff > 0:
            copy_col = get_col("book_copies")
            clean_isbn = re.sub(r"[^\dX]", "", book.get("isbn", ""))
            for i in range(diff):
                copy_num = current_total + i + 1
                copy_col.insert_one({
                    "bookId": str(book_id),
                    "isbn": book.get("isbn"),
                    "barcode": f"SL-BC-{clean_isbn[-6:] if len(clean_isbn)>=6 else '000000'}-{copy_num:02d}",
                    "copyNumber": copy_num,
                    "shelf": update_data.get("shelf", book.get("shelf")),
                    "rack": update_data.get("rack", book.get("rack")),
                    "row": update_data.get("row", book.get("row")),
                    "condition": "New",
                    "status": "AVAILABLE",
                    "acquisitionDate": datetime.datetime.utcnow().strftime("%Y-%m-%d")
                })

    update_data["updatedAt"] = datetime.datetime.utcnow().isoformat()
    book_col.update_one({"_id": str(book_id)}, {"$set": update_data})
    
    recommender.fit()
    log_audit("UPDATE_BOOK", "BOOK", f"Updated book: '{book.get('title')}'", book_id)

    updated = book_col.find_one({"_id": str(book_id)})
    return jsonify({
        "success": True,
        "message": "Book updated successfully.",
        "data": serialize_doc(updated)
    })

@book_bp.route("/api/books/<book_id>", methods=["DELETE"])
@token_required
@role_required("ADMIN")
def delete_book(book_id):
    book_col = get_col("books")
    book = book_col.find_one({"_id": str(book_id)})
    if not book:
        return jsonify({"success": False, "message": "Book not found"}), 404

    if int(book.get("issuedCopies", 0)) > 0:
        return jsonify({
            "success": False,
            "message": "Cannot delete book while copies are currently issued to students."
        }), 400

    book_col.delete_one({"_id": str(book_id)})
    copy_col = get_col("book_copies")
    copy_col.delete_many({"bookId": str(book_id)})

    recommender.fit()
    log_audit("DELETE_BOOK", "BOOK", f"Deleted book: '{book.get('title')}'", book_id)

    return jsonify({"success": True, "message": "Book and associated copies deleted successfully."})

@book_bp.route("/api/books/<book_id>/archive", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def archive_book(book_id):
    book_col = get_col("books")
    book_col.update_one({"_id": str(book_id)}, {"$set": {"status": "ARCHIVED"}})
    log_audit("ARCHIVE_BOOK", "BOOK", f"Archived book ID: {book_id}", book_id)
    return jsonify({"success": True, "message": "Book archived."})

@book_bp.route("/api/books/<book_id>/restore", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def restore_book(book_id):
    book_col = get_col("books")
    book_col.update_one({"_id": str(book_id)}, {"$set": {"status": "AVAILABLE"}})
    log_audit("RESTORE_BOOK", "BOOK", f"Restored book ID: {book_id}", book_id)
    return jsonify({"success": True, "message": "Book restored to active catalog."})

@book_bp.route("/api/books/export-csv", methods=["GET"])
def export_books_csv():
    book_col = get_col("books")
    books = list(book_col.find({"status": {"$ne": "ARCHIVED"}}))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ISBN", "Title", "Author", "Publisher", "Year", "Category", "Shelf", "Rack", "Total Copies", "Available Copies", "Issued Copies", "Price"])

    for b in books:
        writer.writerow([
            b.get("isbn", ""),
            b.get("title", ""),
            b.get("author", ""),
            b.get("publisher", ""),
            b.get("publicationYear", ""),
            b.get("category", ""),
            b.get("shelf", ""),
            b.get("rack", ""),
            b.get("totalCopies", 0),
            b.get("availableCopies", 0),
            b.get("issuedCopies", 0),
            b.get("price", 0.0)
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=smart_library_books.csv"}
    )

@book_bp.route("/api/books/import-csv", methods=["POST"])
@token_required
@role_required("ADMIN", "LIBRARIAN")
def import_books_csv():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No CSV file uploaded."}), 400

    csv_file = request.files["file"]
    if not csv_file.filename.endswith(".csv"):
        return jsonify({"success": False, "message": "Please upload a valid .csv file."}), 400

    stream = io.StringIO(csv_file.stream.read().decode("utf-8-sig"), newline=None)
    reader = csv.DictReader(stream)

    book_col = get_col("books")
    copy_col = get_col("book_copies")

    successful = []
    failed = []

    for row_idx, row in enumerate(reader, start=2):
        isbn = row.get("ISBN", "").strip()
        title = row.get("Title", "").strip()
        author = row.get("Author", "").strip()

        if not isbn or not title or not author:
            failed.append({"row": row_idx, "isbn": isbn, "reason": "Missing required fields (ISBN, Title, Author)"})
            continue

        if book_col.find_one({"isbn": isbn}):
            failed.append({"row": row_idx, "isbn": isbn, "reason": "Duplicate ISBN already exists in catalog"})
            continue

        try:
            total_copies = int(row.get("Total Copies", 2) or 2)
            pub_year = int(row.get("Year", 2024) or 2024)
            price = float(row.get("Price", 39.99) or 39.99)
        except ValueError:
            failed.append({"row": row_idx, "isbn": isbn, "reason": "Invalid numeric value for Copies, Year, or Price"})
            continue

        now = datetime.datetime.utcnow().isoformat()
        new_book = {
            "isbn": isbn,
            "title": title,
            "subtitle": "",
            "author": author,
            "coAuthor": "",
            "publisher": row.get("Publisher", "University Press").strip(),
            "edition": "1st Edition",
            "publicationYear": pub_year,
            "category": row.get("Category", "Computer Science").strip(),
            "subcategory": "General",
            "language": "English",
            "pages": 350,
            "description": f"Academic title: {title}",
            "keywords": [k.strip() for k in title.lower().split() if len(k) > 3],
            "coverImage": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "shelf": row.get("Shelf", "Stack-A").strip(),
            "rack": row.get("Rack", "R-01").strip(),
            "row": "1",
            "totalCopies": total_copies,
            "availableCopies": total_copies,
            "issuedCopies": 0,
            "reservedCopies": 0,
            "price": price,
            "acquisitionDate": now[:10],
            "bookCondition": "New",
            "status": "AVAILABLE",
            "rating": 5.0,
            "ratingsCount": 1,
            "timesBorrowed": 0,
            "createdAt": now,
            "updatedAt": now
        }

        res = book_col.insert_one(new_book)
        clean_isbn = re.sub(r"[^\dX]", "", isbn)
        for i in range(total_copies):
            copy_col.insert_one({
                "bookId": str(res.inserted_id),
                "isbn": isbn,
                "barcode": f"SL-BC-{clean_isbn[-6:] if len(clean_isbn)>=6 else '000000'}-{i+1:02d}",
                "copyNumber": i + 1,
                "shelf": new_book["shelf"],
                "rack": new_book["rack"],
                "row": "1",
                "condition": "New",
                "status": "AVAILABLE",
                "acquisitionDate": now[:10]
            })

        successful.append({"isbn": isbn, "title": title, "copies": total_copies})

    recommender.fit()
    log_audit("CSV_IMPORT", "BOOK", f"Imported {len(successful)} books via CSV, {len(failed)} failed")

    return jsonify({
        "success": True,
        "message": f"CSV import finished: {len(successful)} books imported, {len(failed)} skipped.",
        "data": {
            "successCount": len(successful),
            "failedCount": len(failed),
            "successful": successful,
            "failed": failed
        }
    })

@book_bp.route("/api/categories", methods=["GET"])
def get_categories():
    cat_col = get_col("categories")
    categories = list(cat_col.find())
    return jsonify({
        "success": True,
        "data": [serialize_doc(c) for c in categories]
    })
