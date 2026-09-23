import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.models.db import get_col, serialize_doc

class RecommendationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = None
        self.book_ids = []
        self.book_index_map = {}
        self.books_cache = []
        self._is_fitted = False

    def fit(self):
        book_col = get_col("books")
        books = list(book_col.find({"status": {"$ne": "ARCHIVED"}}))
        if not books:
            self._is_fitted = False
            return False

        self.books_cache = [serialize_doc(b) for b in books]
        self.book_ids = [str(b['_id']) for b in self.books_cache]
        self.book_index_map = {b_id: idx for idx, b_id in enumerate(self.book_ids)}

        corpus = []
        for b in self.books_cache:
            title = b.get("title", "")
            author = b.get("author", "")
            co_author = b.get("coAuthor", "")
            category = b.get("category", "")
            subcategory = b.get("subcategory", "")
            desc = b.get("description", "")
            keywords = " ".join(b.get("keywords", [])) if isinstance(b.get("keywords"), list) else str(b.get("keywords", ""))
            
            combined_text = f"{title} {title} {author} {co_author} {category} {category} {subcategory} {keywords} {desc}"
            corpus.append(combined_text)

        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            self._is_fitted = True
            return True
        except Exception as e:
            print(f"Error fitting TF-IDF recommender: {e}")
            self._is_fitted = False
            return False

    def get_similar_books(self, book_id: str, limit: int = 6):
        if not self._is_fitted:
            self.fit()
        if not self._is_fitted or not self.book_ids:
            return self._fallback_popular(limit)

        book_id = str(book_id)
        if book_id not in self.book_index_map:
            # Fallback by category
            book_col = get_col("books")
            target = book_col.find_one({"_id": book_id})
            if target:
                cat = target.get("category")
                same_cat = list(book_col.find({"category": cat, "_id": {"$ne": book_id}}).limit(limit))
                if same_cat:
                    return [serialize_doc(b) for b in same_cat]
            return self._fallback_popular(limit)

        idx = self.book_index_map[book_id]
        target_vec = self.tfidf_matrix[idx]
        sim_scores = cosine_similarity(target_vec, self.tfidf_matrix).flatten()
        
        sim_scores[idx] = -1
        top_indices = np.argsort(sim_scores)[::-1][:limit]
        
        results = []
        for i in top_indices:
            if sim_scores[i] > 0.01:
                book_data = copy_with_score(self.books_cache[i], float(sim_scores[i]))
                results.append(book_data)
        
        if len(results) < limit:
            fallback = self._fallback_popular(limit - len(results), exclude_ids=[str(b['_id']) for b in results] + [book_id])
            results.extend(fallback)

        return results

    def get_recommendations_for_user(self, user_id: str, limit: int = 8):
        if not self._is_fitted:
            self.fit()

        tx_col = get_col("transactions")
        user_col = get_col("users")
        wishlist_col = get_col("wishlists")

        user = user_col.find_one({"_id": str(user_id)})
        user_dept = user.get("department", "") if user else ""

        # Gather books borrowed by user
        user_txs = list(tx_col.find({"userId": str(user_id)}))
        borrowed_book_ids = [str(t.get("bookId")) for t in user_txs if t.get("bookId")]

        # Gather wishlist books
        user_wishes = list(wishlist_col.find({"userId": str(user_id)}))
        wish_book_ids = [str(w.get("bookId")) for w in user_wishes if w.get("bookId")]

        interacted_ids = list(set(borrowed_book_ids + wish_book_ids))

        if not interacted_ids or not self._is_fitted:
            # Fallback based on department or popular
            if user_dept:
                dept_books = self.get_department_recommendations(user_dept, limit)
                if len(dept_books) >= limit:
                    return dept_books
            return self._fallback_popular(limit)

        # Create user profile vector by averaging vectors of interacted books
        valid_indices = [self.book_index_map[bid] for bid in interacted_ids if bid in self.book_index_map]
        if not valid_indices:
            return self._fallback_popular(limit)

        user_vec = np.asarray(self.tfidf_matrix[valid_indices].mean(axis=0))
        sim_scores = cosine_similarity(user_vec, self.tfidf_matrix).flatten()

        for idx in valid_indices:
            sim_scores[idx] = -1

        top_indices = np.argsort(sim_scores)[::-1][:limit]
        results = []
        for i in top_indices:
            if sim_scores[i] > 0.01:
                results.append(copy_with_score(self.books_cache[i], float(sim_scores[i])))

        if len(results) < limit:
            exclude = [str(b['_id']) for b in results] + interacted_ids
            fallback = self._fallback_popular(limit - len(results), exclude_ids=exclude)
            results.extend(fallback)

        return results

    def get_because_you_borrowed(self, user_id: str, limit: int = 6):
        tx_col = get_col("transactions")
        user_txs = list(tx_col.find({"userId": str(user_id)}).sort("createdAt", -1).limit(1))
        if not user_txs:
            return {"sourceBook": None, "recommendations": self._fallback_popular(limit)}

        last_book_id = str(user_txs[0].get("bookId"))
        book_col = get_col("books")
        source_book = book_col.find_one({"_id": last_book_id})

        sim_books = self.get_similar_books(last_book_id, limit)
        return {
            "sourceBook": serialize_doc(source_book) if source_book else None,
            "recommendations": sim_books
        }

    def get_department_recommendations(self, department: str, limit: int = 6):
        book_col = get_col("books")
        dept_cat_map = {
            "Computer Science": ["Computer Science", "Software Engineering", "Artificial Intelligence", "Information Technology", "Cybersecurity"],
            "Computer Science and Engineering": ["Computer Science", "Software Engineering", "Artificial Intelligence", "Information Technology", "Cybersecurity"],
            "Artificial Intelligence and Data Science": ["Artificial Intelligence", "Data Science", "Computer Science", "Machine Learning"],
            "Information Technology": ["Information Technology", "Networking", "Cybersecurity", "Cloud Computing"],
            "Computer Science and Design": ["Computer Science", "Software Engineering", "Web & Mobile Development"],
            "Electronics and Communication Engineering": ["Electronics", "Electrical Engineering", "IoT"],
            "Electrical and Electronics Engineering": ["Electrical Engineering", "Electronics", "Control Systems"],
            "Mechanical Engineering": ["Mechanical Engineering", "Robotics", "Physics"],
            "Civil Engineering": ["Civil Engineering", "Engineering Mechanics"],
            "Chemical Engineering": ["Chemical Engineering", "Thermodynamics"],
            "Food Technology": ["Chemical Engineering", "Biotechnology"],
            "MCA": ["Computer Science", "Database Systems", "Software Engineering", "Web Development"],
            "MBA": ["Management", "Business", "Economics", "Finance"]
        }
        
        cats = dept_cat_map.get(department, [department])
        books = list(book_col.find({"category": {"$in": cats}, "status": {"$ne": "ARCHIVED"}}).sort("timesBorrowed", -1).limit(limit))
        if books:
            return [serialize_doc(b) for b in books]
        return self._fallback_popular(limit)

    def get_trending_books(self, limit: int = 6):
        book_col = get_col("books")
        books = list(book_col.find({"status": {"$ne": "ARCHIVED"}}).sort("timesBorrowed", -1).limit(limit))
        return [serialize_doc(b) for b in books]

    def _fallback_popular(self, limit: int = 6, exclude_ids: list = None):
        exclude_ids = exclude_ids or []
        book_col = get_col("books")
        query = {"status": {"$ne": "ARCHIVED"}}
        if exclude_ids:
            query["_id"] = {"$nin": exclude_ids}
        books = list(book_col.find(query).sort([("rating", -1), ("timesBorrowed", -1)]).limit(limit))
        return [serialize_doc(b) for b in books]

def copy_with_score(book_dict, score):
    res = dict(book_dict)
    res["matchConfidence"] = round(float(score) * 100, 1)
    return res

recommender = RecommendationEngine()
