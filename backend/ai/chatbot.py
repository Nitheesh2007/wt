import re
import datetime
from backend.models.db import get_col, serialize_doc
from backend.ai.recommender import recommender

# Comprehensive Knowledge Base for Engineering Concepts & Central Library Policies
KNOWLEDGE_TOPICS = {
    "data structures": {
        "title": "Data Structures & Algorithms (DSA)",
        "summary": "Data structures organize data for efficient access and modification. Fundamental structures include Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees (BST, AVL, Red-Black), and Graphs (BFS, DFS, Dijkstra).",
        "key_concepts": ["Time & Space Complexity (Big-O)", "Tree Traversals (Inorder, Preorder, Postorder)", "Hashing & Collision Resolution", "Dynamic Programming & Greedy Strategies"],
        "recommended_books": ["Introduction to Algorithms", "Data Structures and Algorithm Analysis in C++", "Algorithms"],
        "follow_ups": ["Which algorithms are most important for technical interviews?", "Where are Cormen's Algorithms books located in the Library?", "Explain Time Complexity and Big-O notation."]
    },
    "operating systems": {
        "title": "Operating Systems (OS)",
        "summary": "An Operating System manages computer hardware, software resources, and provides common services for programs. Core concepts include Process Management, CPU Scheduling, Synchronization, Memory Management, and File Systems.",
        "key_concepts": ["Process States & IPC", "Deadlock Conditions (Coffman Conditions) & Banker's Algorithm", "Virtual Memory, Paging & TLB", "Linux Kernel & System Calls"],
        "recommended_books": ["Operating System Concepts", "Modern Operating Systems"],
        "follow_ups": ["Explain the four conditions for deadlock.", "What is Paging vs Segmentation in OS?", "Show available OS textbooks in the Library."]
    },
    "database": {
        "title": "Database Management Systems (DBMS)",
        "summary": "DBMS manages organized collections of structured data. Key areas include Relational Databases (SQL), ACID Properties, Normalization (1NF to BCNF), Indexing (B+ Trees), and Distributed/NoSQL architectures.",
        "key_concepts": ["ACID Transactions & Concurrency Control", "Relational Algebra & SQL Optimization", "B+ Tree Indexing", "NoSQL vs Relational Storage"],
        "recommended_books": ["Database System Concepts", "Database Management Systems"],
        "follow_ups": ["Explain ACID properties with an example.", "What is 3NF vs BCNF normalization?", "Where is Silberschatz's Database book located?"]
    },
    "machine learning": {
        "title": "Machine Learning & Artificial Intelligence",
        "summary": "Machine Learning enables computer systems to learn and make decisions from data without being explicitly programmed. Subfields include Supervised Learning, Unsupervised Learning, Reinforcement Learning, and Deep Learning.",
        "key_concepts": ["Gradient Descent & Backpropagation", "Overfitting, Regularization (L1/L2)", "Convolutional & Recurrent Neural Networks", "Transformers & Attention Mechanisms"],
        "recommended_books": ["Pattern Recognition and Machine Learning", "Hands-On Machine Learning with Scikit-Learn", "Deep Learning"],
        "follow_ups": ["How does TF-IDF work in this library's AI recommender?", "Explain Supervised vs Unsupervised learning.", "Recommend deep learning textbooks for research projects."]
    },
    "cloud": {
        "title": "Cloud Computing & Distributed Systems",
        "summary": "Cloud computing provides on-demand availability of computer system resources (data storage and computing power) without direct active management by the user. Key architectures include Microservices, Containers (Docker, Kubernetes), and Serverless.",
        "key_concepts": ["CAP Theorem & Eventual Consistency", "Microservices vs Monoliths", "Container Orchestration with Kubernetes", "MapReduce & Distributed Consensus (Raft/Paxos)"],
        "recommended_books": ["Designing Data-Intensive Applications", "Cloud Computing: Concepts, Technology & Architecture"],
        "follow_ups": ["Explain the CAP theorem in distributed databases.", "What is Docker containerization?", "Find books on Designing Data-Intensive Applications."]
    },
    "software engineering": {
        "title": "Software Engineering & Architecture",
        "summary": "Software engineering is the systematic engineering approach to developing software. It encompasses Agile methodologies, DevOps CI/CD, design patterns, clean architecture, and rigorous testing frameworks.",
        "key_concepts": ["Agile Scrum & Sprints", "SOLID Principles", "Design Patterns (GoF)", "Continuous Integration & Deployment (CI/CD)"],
        "recommended_books": ["Software Engineering: A Practitioner's Approach", "Clean Code: A Handbook of Agile Software Craftsmanship"],
        "follow_ups": ["What are the SOLID principles of Object-Oriented Design?", "Where can I borrow Pressman's Software Engineering?", "Explain Test-Driven Development (TDD)."]
    },
    "central library info": {
        "title": "Central Library Management Information",
        "summary": "Central Library Management System is a modern automated knowledge center with open access system, RFID-based circulation, study carrels, digital repository, and round-the-clock catalog access.",
        "timings": "Working Hours: 8:00 AM – 8:00 PM (Monday to Saturday), 9:00 AM – 1:00 PM (Sunday)",
        "borrowing_limits": "UG Students: 5 books for 14 days | PG Students: 7 books for 21 days | Faculty: 10 books for 30 days",
        "renewal_policy": "Books can be renewed up to 2 times if there are no pending reservations by other members.",
        "facilities": "Digital Library with 60 high-speed systems, discussion rooms, individual study carrels, and NPTEL video course archives.",
        "follow_ups": ["How can I renew my borrowed books?", "How do I reserve a quiet study carrel?", "What are the overdue fine policies?"]
    }
}

class LibraryAssistant:
    def __init__(self):
        pass

    def answer_query(self, query: str, user: dict = None, history: list = None, language: str = "en"):
        text = re.sub(r"[^\w\s]", " ", query.strip().lower())
        text = " ".join(text.split())
        book_col = get_col("books")
        tx_col = get_col("transactions")
        is_tamil = language == "ta" or bool(re.search(r"[\u0B80-\u0BFF]", query))

        # Check for Central Library info queries (timings, rules, limits, contact)
        if any(w in text for w in ["timing", "hour", "open", "close", "rules", "fine", "limit", "quota", "renew", "library", "central", "policy"]):
            info = KNOWLEDGE_TOPICS["central library info"]
            if is_tamil:
                msg = (
                    f"**மத்திய நூலக மேலாண்மை விவரங்கள்:**\n\n"
                    f"• **வேலை நேரம்:** திங்கள் முதல் சனி வரை காலை 8:00 மணி முதல் இரவு 8:00 மணி வரை. ஞாயிற்றுக்கிழமை காலை 9:00 முதல் மதியம் 1:00 மணி வரை.\n"
                    f"• **கடன் வரம்பு:** இளங்கலை மாணவர்கள் (UG) 5 புத்தகங்கள் (14 நாட்கள்), முதுகலை மாணவர்கள் (PG) 7 புத்தகங்கள் (21 நாட்கள்), பேராசிரியர்கள் 10 புத்தகங்கள்.\n"
                    f"• **புதுப்பித்தல்:** பிற மாணவர்களின் முன்பதிவு இல்லாத வரை 2 முறை புதுப்பிக்கலாம்.\n"
                    f"• **வசதிகள்:** 60 கணினிகள் கொண்ட டிஜிட்டல் நூலகம், அமைதியான படிப்பு அறைகள் மற்றும் NPTEL வீடியோ பெட்டகங்கள் உள்ளன."
                )
                follow_ups = [
                    "கடன் பெற்ற புத்தகங்களை எவ்வாறு புதுப்பிப்பது?",
                    "படிப்பு அறையை (Study Carrel) எவ்வாறு முன்பதிவு செய்வது?",
                    "பைதான் மற்றும் அல்காரிதம் புத்தகங்களைக் காட்டு."
                ]
            else:
                msg = (
                    f"### 🏛️ Library Management — Central Library Information\n\n"
                    f"• **{info['timings']}**\n"
                    f"• **Borrowing Quota:** {info['borrowing_limits']}\n"
                    f"• **Renewals:** {info['renewal_policy']}\n"
                    f"• **Facilities:** {info['facilities']}\n"
                    f"• **Digital Pass:** Your dynamic barcode ID is accessible directly in the 'My Profile' tab."
                )
                follow_ups = info["follow_ups"]

            return {
                "message": msg,
                "books": [],
                "intent": "LIBRARY_INFO",
                "followUps": follow_ups
            }

        # 1. Location intent: "where is [book] located?" or "where is this book?"
        loc_match = re.search(r"where\s+is\s+(?:the\s+book\s+)?['\"]?([^?\"']+)['\"]?", text)
        if loc_match or "location" in text or "shelf" in text or "rack" in text or "எங்கு" in query:
            target_title = loc_match.group(1).strip() if loc_match else ""
            target_title = re.sub(r"\b(located|kept|found|at|placed|the|a|an)\b", "", target_title).strip()
            
            found = None
            if target_title:
                found = book_col.find_one({"title": {"$regex": re.escape(target_title), "$options": "i"}})
            if not found:
                for b in book_col.find().limit(60):
                    b_title_clean = b.get("title", "").lower().split(":")[0].strip()
                    if b_title_clean and b_title_clean in text:
                        found = b
                        break

            if found:
                shelf = found.get("shelf", "Main Stacks")
                rack = found.get("rack", "R-1")
                row = found.get("row", "A")
                avail = found.get("availableCopies", 0)
                if is_tamil:
                    avail_txt = f"{avail} பிரதிகள் கையில் உள்ளன" if avail > 0 else "தற்போது கடனாக வழங்கப்பட்டுள்ளது (முன்பதிவு செய்யலாம்)"
                    msg = f"**'{found.get('title')}'** புத்தகம் **அலமாரி: {shelf}, ரேக்: {rack}, வரிசை: {row}** இல் உள்ளது. இருப்பு நிலை: {avail_txt}."
                    follow_ups = [
                        f"{found.get('title')} தொடர்பான பிற புத்தகங்களைக் காட்டு.",
                        "இந்த புத்தகத்தை எவ்வாறு கடன் பெறுவது?",
                        "மற்றொரு புத்தகத்தின் இருப்பிடத்தைக் கண்டுபிடி."
                    ]
                else:
                    avail_txt = f"{avail} copies currently available in stacks" if avail > 0 else "currently checked out (you can place an instant reservation)"
                    msg = f"**'{found.get('title')}'** is located in the Central Library at **Shelf: {shelf}, Rack: {rack}, Row: {row}**. Physical Status: {avail_txt}."
                    follow_ups = [
                        f"Show books similar to {found.get('title')}",
                        "How can I reserve this book?",
                        "Check location of another textbook"
                    ]
                return {
                    "message": msg,
                    "books": [serialize_doc(found)],
                    "intent": "LOCATION_LOOKUP",
                    "followUps": follow_ups
                }

        # 2. Due date intent: "which books are due this week?", "what are my due dates?", "due this week"
        if "due" in text or "return" in text or "காலாவதி" in query:
            now = datetime.datetime.utcnow()
            week_ahead = now + datetime.timedelta(days=7)
            query_filter = {"status": "ISSUED"}
            if user and user.get("role") == "STUDENT":
                query_filter["userId"] = str(user.get("_id"))

            active_txs = list(tx_col.find(query_filter))
            due_soon = []
            for tx in active_txs:
                due_date_str = tx.get("dueDate")
                if due_date_str:
                    try:
                        due_dt = datetime.datetime.fromisoformat(due_date_str.replace("Z", "+00:00")).replace(tzinfo=None)
                        if due_dt <= week_ahead:
                            due_soon.append(tx)
                    except Exception:
                        pass

            if due_soon:
                book_ids = [t.get("bookId") for t in due_soon]
                matched_books = list(book_col.find({"_id": {"$in": book_ids}}))
                titles = [b.get("title") for b in matched_books]
                if is_tamil:
                    msg = f"அடுத்த 7 நாட்களில் காலாவதியாகும் **{len(due_soon)}** புத்தகம்(கள்) கண்டறியப்பட்டன: {', '.join(titles)}. தாமதக் கட்டணங்களைத் தவிர்க்க தயவுசெய்து அவற்றை உரிய நேரத்தில் திருப்பித் தரவும் அல்லது புதுப்பிக்கவும்."
                    follow_ups = ["புத்தகத்தை ஆன்லைனில் எவ்வாறு புதுப்பிப்பது?", "தாமதக் கட்டணக் கணக்கீட்டு முறையைக் கூறு.", "எனது படிப்புப் பட்டியலைச் சரிபார்."]
                else:
                    msg = f"Found **{len(due_soon)} book(s)** due within the upcoming 7 days: {', '.join(titles)}. Please return or renew them through the circulation desk to avoid overdue fines."
                    follow_ups = ["How do I renew my active loans?", "What are the overdue fine rates?", "Show my reading goals and history."]
                return {
                    "message": msg,
                    "books": [serialize_doc(b) for b in matched_books],
                    "intent": "DUE_DATE_CHECK",
                    "followUps": follow_ups
                }
            else:
                if is_tamil:
                    msg = "சிறந்த செய்தி! உங்களுக்கு இந்த வாரம் எந்தப் புத்தகமும் காலாவதியாகவில்லை. உங்கள் கணக்கு நல்ல நிலையில் உள்ளது."
                    follow_ups = ["எனது கல்வித் துறைக்கான பரிந்துரைகளைக் காட்டு.", "விருப்பப்பட்டியலில் புத்தகங்களை எவ்வாறு சேர்ப்பது?", "பிரபலமான புத்தகங்களைக் காட்டு."]
                else:
                    msg = "Good news! You have no library loans due within this upcoming week. Your academic account is in excellent standing."
                    follow_ups = ["Show recommendations for my department.", "Recommend top engineering textbooks.", "Find Python and Machine Learning books."]
                return {
                    "message": msg,
                    "books": [],
                    "intent": "DUE_DATE_CHECK",
                    "followUps": follow_ups
                }

        # 3. Check for Conceptual Academic Questions (DSA, OS, DBMS, ML, Cloud, Software Eng)
        for key, topic in KNOWLEDGE_TOPICS.items():
            if key == "central library info":
                continue
            if any(term in text for term in [key] + [k.lower() for k in topic["key_concepts"]]):
                rec_books = list(book_col.find({
                    "$or": [
                        {"title": {"$regex": key, "$options": "i"}},
                        {"category": {"$regex": key, "$options": "i"}},
                        {"keywords": {"$regex": key, "$options": "i"}}
                    ],
                    "status": {"$ne": "ARCHIVED"}
                }).limit(4))

                if is_tamil:
                    msg = (
                        f"### 📘 {topic['title']} பற்றிய கண்ணோட்டம்\n\n"
                        f"{topic['summary']}\n\n"
                        f"**முக்கிய கல்வி கருத்துகள்:**\n"
                        + "\n".join([f"• **{kc}**" for kc in topic["key_concepts"]])
                        + f"\n\nமத்திய நூலகத்தில் கிடைக்கக்கூடிய சிறந்த பாடப்புத்தகங்கள் கீழே பட்டியலிடப்பட்டுள்ளன:"
                    )
                else:
                    msg = (
                        f"### 📘 {topic['title']} — Comprehensive Academic Overview\n\n"
                        f"{topic['summary']}\n\n"
                        f"**Core Syllabus Highlights:**\n"
                        + "\n".join([f"• **{kc}**" for kc in topic["key_concepts"]])
                        + f"\n\nHere are verified reference textbooks available in the Central Library catalog matching this curriculum:"
                    )

                return {
                    "message": msg,
                    "books": [serialize_doc(b) for b in rec_books],
                    "intent": "CONCEPT_EXPLANATION",
                    "followUps": topic["follow_ups"]
                }

        # 4. Recommendation intent: "recommend machine learning books", "what should i read?"
        if "recommend" in text or "suggest" in text or "பரிந்துரை" in query:
            category_match = None
            for cat in ["machine learning", "artificial intelligence", "data science", "python", "software engineering", "algorithms", "web development", "database", "security", "cloud", "operating systems"]:
                if cat in text:
                    category_match = cat
                    break
            
            if category_match:
                books = list(book_col.find({
                    "$or": [
                        {"category": {"$regex": re.escape(category_match), "$options": "i"}},
                        {"title": {"$regex": re.escape(category_match), "$options": "i"}},
                        {"keywords": {"$regex": re.escape(category_match), "$options": "i"}}
                    ],
                    "status": {"$ne": "ARCHIVED"}
                }).sort([("rating", -1), ("availableCopies", -1)]).limit(5))
                if is_tamil:
                    msg = f"**{category_match.title()}** பாடப்பிரிவில் மத்திய நூலகத்தில் பரிந்துரைக்கப்படும் முன்னணி நூல்கள்:"
                    follow_ups = [
                        f"{category_match.title()} தொடர்பான முக்கிய கோட்பாடுகளை விளக்கு.",
                        "இந்த புத்தகங்களின் அலமாரி இருப்பிடங்களை அறிவது எப்படி?",
                        "மற்றொரு பொறியியல் துறைக்கான பரிந்துரைகளைக் காட்டு."
                    ]
                else:
                    msg = f"Here are the top-rated Central Library recommended titles in **{category_match.title()}**:"
                    follow_ups = [
                        f"Explain core concepts in {category_match.title()}.",
                        "Where are these books shelved in the library?",
                        "Show trending titles across all engineering departments."
                    ]
                return {
                    "message": msg,
                    "books": [serialize_doc(b) for b in books],
                    "intent": "AI_RECOMMENDATION",
                    "followUps": follow_ups
                }
            else:
                user_id = str(user.get("_id")) if user else None
                rec_books = recommender.get_recommendations_for_user(user_id, limit=5) if user_id else recommender.get_trending_books(limit=5)
                if is_tamil:
                    msg = "உங்கள் கல்வித் துறை மற்றும் வாசிப்பு வரலாற்றின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட நூலகப் பரிந்துரைகள்:"
                    follow_ups = [
                        "கணினி அறிவியல் மற்றும் பொறியியல் (CSE) மைய நூல்களைக் காட்டு.",
                        "செயற்கை நுண்ணறிவு மற்றும் தரவு அறிவியல் நூல்களைப் பரிந்துரைக்கவும்.",
                        "இந்த புத்தகங்கள் எங்கு வைக்கப்பட்டுள்ளன?"
                    ]
                else:
                    msg = "Here are curated personalized recommendations matched to your department curriculum and reading history:"
                    follow_ups = [
                        "Show core curriculum textbooks for Computer Science & Engineering.",
                        "Recommend Artificial Intelligence & Data Science books.",
                        "How does the AI recommendation model calculate affinity scores?"
                    ]
                return {
                    "message": msg,
                    "books": rec_books,
                    "intent": "AI_RECOMMENDATION",
                    "followUps": follow_ups
                }

        # 5. Availability & Search intent
        only_available = "available" in text or "in stock" in text or "கிடைக்கும்" in query
        keywords = text
        for remove_word in ["find", "show", "books", "book", "available", "search", "looking", "for", "please", "me", "any", "in", "stock", "tell", "about"]:
            keywords = re.sub(rf"\b{remove_word}\b", "", keywords)
        keywords = keywords.strip()

        search_query = {"status": {"$ne": "ARCHIVED"}}
        if only_available:
            search_query["availableCopies"] = {"$gt": 0}

        if keywords:
            search_query["$or"] = [
                {"title": {"$regex": re.escape(keywords), "$options": "i"}},
                {"author": {"$regex": re.escape(keywords), "$options": "i"}},
                {"category": {"$regex": re.escape(keywords), "$options": "i"}},
                {"keywords": {"$regex": re.escape(keywords), "$options": "i"}}
            ]

        found_books = list(book_col.find(search_query).limit(6))
        if found_books:
            avail_tag = "available " if only_available else ""
            if is_tamil:
                msg = f"'{keywords if keywords else 'நூலகப் பட்டியல்'}' தேடலுக்கு **{len(found_books)}** புத்தகங்கள் கண்டறியப்பட்டன:"
                follow_ups = [
                    f"'{found_books[0].get('title')}' புத்தகம் எங்குள்ளது?",
                    "இவற்றுடன் தொடர்புடைய பிற பரிந்துரைகளைக் காட்டு.",
                    "புத்தகத்தை எவ்வாறு முன்பதிவு செய்வது?"
                ]
            else:
                msg = f"Found **{len(found_books)} {avail_tag}title(s)** matching '{keywords if keywords else 'catalog'}':"
                follow_ups = [
                    f"Where is '{found_books[0].get('title')}' shelved?",
                    f"Show similar books to '{found_books[0].get('title')}'",
                    "How many copies are available right now?"
                ]
            return {
                "message": msg,
                "books": [serialize_doc(b) for b in found_books],
                "intent": "CATALOG_SEARCH",
                "followUps": follow_ups
            }
        else:
            # Fallback to general conversational engineering response instead of a dead end!
            trending = recommender.get_trending_books(limit=4)
            if is_tamil:
                msg = (
                    f"நீங்கள் குறிப்பிட்ட '{query}' தலைப்புக்கு நேரடி நூல் பொருந்தவில்லை என்றாலும், "
                    f"நமது நூலகத்தில் தொடர்புடைய பொறியியல் மற்றும் தொழில்நுட்ப பாடப்புத்தகங்கள் உள்ளன. "
                    f"நீங்கள் ஒரு புதிய புத்தகக் கோரிக்கையை சமர்ப்பிக்கலாம் அல்லது வளாகத்தில் அதிகம் கடன் பெறப்பட்ட பின்வரும் நூல்களைப் பார்க்கலாம்:"
                )
                follow_ups = [
                    "அல்காரிதம்கள் & தரவு கட்டமைப்புகள் பற்றி விளக்கு.",
                    "செயற்கை நுண்ணறிவு பாடப்புத்தகங்களைப் பரிந்துரைக்கவும்.",
                    "நூலக வேலை நேரங்கள் மற்றும் விதிகள் என்ன?"
                ]
            else:
                msg = (
                    f"I couldn't find an exact catalog match for '{query}', but our Library Management System has over 140+ textbooks across 13 engineering disciplines. "
                    f"Here are top circulating academic titles you may find valuable, or you can ask me to explain any engineering concept in depth:"
                )
                follow_ups = [
                    "Explain Data Structures and Algorithms.",
                    "Recommend top Machine Learning and AI textbooks.",
                    "What are the library working hours and loan limits?",
                    "Where is Silberschatz's Operating Systems book?"
                ]
            return {
                "message": msg,
                "books": trending,
                "intent": "EXPANDED_SUGGESTION",
                "followUps": follow_ups
            }

assistant = LibraryAssistant()

