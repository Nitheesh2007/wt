import sys
import os
import datetime
import random

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from backend.models.db import get_col
from backend.middleware.auth import hash_password

def seed_database():
    print("==================================================")
    print("[*] SEEDING SMART LIBRARY DATABASE (100+ BOOKS)...")
    print("==================================================")

    now = datetime.datetime.utcnow()

    # 1. System Settings
    settings_col = get_col("system_settings")
    settings_col.delete_many({})
    settings_col.insert_one({
        "_id": "default_settings",
        "libraryName": "Smart Library System & Knowledge Hub",
        "contactEmail": "library.helpdesk@smartlib.edu",
        "contactPhone": "+1 (800) 555-0199",
        "loanDurationDays": 14,
        "maxBooksStudent": 4,
        "maxRenewalLimit": 2,
        "fineRatePerDay": 1.0,
        "gracePeriodDays": 2,
        "maxFinePerBook": 25.0,
        "reservationExpiryHours": 48,
        "lostBookFee": 50.0,
        "damageFee": 20.0,
        "enableEmailNotifications": True,
        "updatedAt": now.isoformat()
    })
    print("+ System Settings initialized")

    # 2. Users
    user_col = get_col("users")
    user_col.delete_many({})
    users = [
        {
            "_id": "usr_admin_01",
            "name": "Dr. Eleanor Vance",
            "email": "admin@smartlib.edu",
            "password": hash_password("Admin@12345"),
            "role": "ADMIN",
            "studentId": "EMP-ADM-001",
            "phone": "+1-555-0101",
            "department": "Library Administration",
            "year": "Staff",
            "status": "ACTIVE",
            "isBlocked": False,
            "booksBorrowedCount": 0,
            "currentBorrowedCount": 0,
            "totalFines": 0.0,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "createdAt": (now - datetime.timedelta(days=120)).isoformat()
        },
        {
            "_id": "usr_lib_01",
            "name": "Marcus Aurelius Reed",
            "email": "librarian@smartlib.edu",
            "password": hash_password("Librarian@12345"),
            "role": "LIBRARIAN",
            "studentId": "EMP-LIB-004",
            "phone": "+1-555-0102",
            "department": "Circulation & Cataloging",
            "year": "Staff",
            "status": "ACTIVE",
            "isBlocked": False,
            "booksBorrowedCount": 0,
            "currentBorrowedCount": 0,
            "totalFines": 0.0,
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "createdAt": (now - datetime.timedelta(days=90)).isoformat()
        },
        {
            "_id": "usr_stu_01",
            "name": "Alex Chen",
            "email": "student@smartlib.edu",
            "password": hash_password("Student@12345"),
            "role": "STUDENT",
            "studentId": "MSC-SS-2026-001",
            "phone": "+1-555-0103",
            "department": "Software Systems",
            "year": "2nd Year",
            "status": "ACTIVE",
            "isBlocked": False,
            "booksBorrowedCount": 8,
            "currentBorrowedCount": 2,
            "totalFines": 0.0,
            "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
            "createdAt": (now - datetime.timedelta(days=60)).isoformat()
        },
        {
            "_id": "usr_stu_02",
            "name": "Priya Sharma",
            "email": "priya.sharma@smartlib.edu",
            "password": hash_password("Student@12345"),
            "role": "STUDENT",
            "studentId": "MSC-CS-2026-045",
            "phone": "+1-555-0104",
            "department": "Computer Science",
            "year": "1st Year",
            "status": "ACTIVE",
            "isBlocked": False,
            "booksBorrowedCount": 12,
            "currentBorrowedCount": 1,
            "totalFines": 2.0,
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "createdAt": (now - datetime.timedelta(days=80)).isoformat()
        },
        {
            "_id": "usr_stu_03",
            "name": "David Kim",
            "email": "david.kim@smartlib.edu",
            "password": hash_password("Student@12345"),
            "role": "STUDENT",
            "studentId": "MSC-DS-2026-019",
            "phone": "+1-555-0105",
            "department": "Data Science",
            "year": "2nd Year",
            "status": "ACTIVE",
            "isBlocked": False,
            "booksBorrowedCount": 5,
            "currentBorrowedCount": 1,
            "totalFines": 0.0,
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            "createdAt": (now - datetime.timedelta(days=45)).isoformat()
        }
    ]
    user_col.insert_many(users)
    print(f"+ Seeded {len(users)} users (Admin, Librarian, Students)")

    # 3. Categories
    cat_col = get_col("categories")
    cat_col.delete_many({})
    categories = [
        {"_id": "cat_01", "name": "Software Engineering", "code": "SE", "description": "Design patterns, architecture, agile development, testing"},
        {"_id": "cat_02", "name": "Artificial Intelligence", "code": "AI", "description": "Machine learning, neural networks, robotics, NLP"},
        {"_id": "cat_03", "name": "Data Science", "code": "DS", "description": "Data mining, statistics, visualization, big data"},
        {"_id": "cat_04", "name": "Computer Science", "code": "CS", "description": "Algorithms, data structures, computation theory"},
        {"_id": "cat_05", "name": "Web Development", "code": "WEB", "description": "Modern frontend, backend, APIs, cloud deployments"},
        {"_id": "cat_06", "name": "Cybersecurity", "code": "SEC", "description": "Network security, cryptography, penetration testing"},
        {"_id": "cat_07", "name": "Cloud Computing", "code": "CLOUD", "description": "Distributed systems, microservices, containerization"},
        {"_id": "cat_08", "name": "Database Systems", "code": "DB", "description": "Relational DBs, NoSQL, distributed storage, indexing"},
        {"_id": "cat_09", "name": "Computer Networks", "code": "NET", "description": "Protocols, routing, wireless networks, socket programming"},
        {"_id": "cat_10", "name": "Operating Systems", "code": "OS", "description": "Kernel architecture, process scheduling, memory management"},
        {"_id": "cat_11", "name": "Engineering Mathematics", "code": "MATH", "description": "Calculus, linear algebra, probability, discrete mathematics"},
        {"_id": "cat_12", "name": "Electronics & Hardware", "code": "ECE", "description": "Digital logic, microprocessors, signals & systems, circuits"},
        {"_id": "cat_13", "name": "Management & Information Systems", "code": "MGMT", "description": "MIS, operations research, project management, accounting"}
    ]
    cat_col.insert_many(categories)
    print(f"+ Seeded {len(categories)} categories")

    # 4. Generate 140+ Real Academic & College Books
    book_col = get_col("books")
    book_col.delete_many({})

    raw_books_data = [
        # Standard College Prescribed Textbooks (Computer Science & IT)
        ("Software Engineering: A Practitioner's Approach", "Roger S. Pressman, Bruce R. Maxim", "McGraw-Hill", "Software Engineering", 2020, 976, 85.00, "The global university benchmark textbook covering agile models, requirements engineering, component design, architectural styles, and software metrics.", ["pressman", "software engineering", "agile", "requirements", "testing", "sdlc"]),
        ("Software Engineering", "Ian Sommerville", "Pearson", "Software Engineering", 2016, 816, 89.00, "Comprehensive college standard on systems dependability, distributed software engineering, and reuse.", ["sommerville", "software engineering", "architecture", "dependability"]),
        ("Programming in ANSI C", "E. Balagurusamy", "McGraw-Hill", "Computer Science", 2019, 580, 28.00, "The most widely prescribed college textbook across undergraduate engineering for introductory C programming.", ["balagurusamy", "ansi c", "c programming", "pointers", "arrays", "structures"]),
        ("Object-Oriented Programming with C++", "E. Balagurusamy", "McGraw-Hill", "Computer Science", 2020, 640, 32.00, "Standard university textbook teaching classes, operator overloading, inheritance, virtual functions, and templates in C++.", ["balagurusamy", "c++", "oop", "inheritance", "polymorphism", "templates"]),
        ("Programming with Java: A Primer", "E. Balagurusamy", "McGraw-Hill", "Computer Science", 2019, 520, 30.00, "Foundational university textbook for Java core fundamentals, multithreading, packages, applets, and exception handling.", ["balagurusamy", "java", "oop", "multithreading", "interfaces"]),
        ("Java: The Complete Reference", "Herbert Schildt", "McGraw-Hill", "Computer Science", 2021, 1248, 65.00, "Comprehensive university and industry reference on Java SE syntax, libraries, generics, collections, and lambdas.", ["java", "schildt", "complete reference", "jvm", "collections"]),
        ("Data Structures Using C and C++", "Yedidyah Langsam, Moshe J. Augenstein, Aaron M. Tenenbaum", "Pearson", "Computer Science", 1996, 688, 55.00, "The classic Tenenbaum college textbook on stacks, queues, linked lists, trees, and hashing.", ["tenenbaum", "data structures", "c++", "trees", "graphs", "sorting"]),
        ("Data Structures and Algorithm Analysis in C++", "Mark Allen Weiss", "Pearson", "Computer Science", 2014, 656, 75.00, "University course textbook emphasizing algorithmic analysis, advanced tree structures, priority queues, and amortized complexity.", ["mark allen weiss", "data structures", "algorithms", "c++", "asymptotic analysis"]),
        ("Fundamentals of Database Systems", "Ramez Elmasri, Shamkant B. Navathe", "Pearson", "Database Systems", 2016, 1272, 110.00, "Standard college curriculum text for ER modeling, relational algebra, SQL, normalization, and transaction processing.", ["elmasri", "navathe", "databases", "er model", "normalization", "sql"]),
        ("Data Communications and Networking", "Behrouz A. Forouzan", "McGraw-Hill", "Computer Networks", 2013, 1264, 98.00, "The universal university text on OSI reference model, physical transmissions, data link protocols, and IP networks.", ["forouzan", "networking", "data communications", "osi model", "ethernet"]),
        ("TCP/IP Protocol Suite", "Behrouz A. Forouzan", "McGraw-Hill", "Computer Networks", 2010, 960, 85.00, "Standard undergraduate guide to ARP, IPv4, IPv6, ICMP, UDP, TCP, and application layer protocols.", ["forouzan", "tcp/ip", "protocols", "routing", "ip address"]),
        ("Computer Organization and Architecture: Designing for Performance", "William Stallings", "Pearson", "Computer Science", 2022, 880, 95.00, "Core university computer organization text covering cache memory, pipelining, RISC vs CISC, and parallel processing.", ["stallings", "computer architecture", "pipelining", "cache", "risc"]),
        ("Computer System Architecture", "M. Morris Mano", "Pearson", "Computer Science", 2017, 544, 48.00, "The quintessential college introductory textbook on register transfer logic, ALU design, CPU organization, and assembly.", ["morris mano", "computer organization", "cpu design", "registers"]),
        ("Theory of Computer Science: Automata, Languages and Computation", "K.L.P. Mishra, N. Chandrasekaran", "Prentice Hall India", "Computer Science", 2008, 432, 25.00, "Mandatory university theory textbook for regular grammars, finite automata, pushdown automata, and Turing machines.", ["mishra", "automata", "turing machines", "formal languages", "theory of computation"]),
        ("Introduction to Automata Theory, Languages, and Computation", "John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman", "Pearson", "Computer Science", 2008, 560, 82.00, "The world-famous Cinderella Book on theoretical computer science, decidability, and intractability.", ["hopcroft", "ullman", "automata", "context free grammars", "np completeness"]),
        ("Machine Learning", "Tom M. Mitchell", "McGraw-Hill", "Artificial Intelligence", 1997, 432, 60.00, "The foundational academic text on concept learning, decision trees, neural networks, Bayesian learning, and genetic algorithms.", ["tom mitchell", "machine learning", "decision trees", "bayesian", "ann"]),
        ("Data Mining: Concepts and Techniques", "Jiawei Han, Micheline Kamber, Jian Pei", "Morgan Kaufmann", "Data Science", 2011, 744, 78.00, "Core syllabus textbook covering association rule mining, Apriori algorithm, classification, and cluster analysis.", ["data mining", "jiawei han", "clustering", "apriori", "data warehouse"]),
        ("Web Technologies: TCP/IP, Web/Java Server and Client Technologies", "Achyut Godbole, Atul Kahate", "McGraw-Hill", "Web Development", 2013, 720, 35.00, "Standard Indian university textbook covering HTML, CSS, JavaScript, Servlets, JSP, XML, and web application architectures.", ["web technologies", "godbole", "jsp", "servlets", "javascript"]),
        ("Cloud Computing: Principles and Paradigms", "Rajkumar Buyya, Christian Vecchiola, S. Thamarai Selvi", "Wiley", "Cloud Computing", 2011, 664, 72.00, "Widely cited university reference on virtual machine provisioning, hypervisors, cloud federations, and Aneka platform.", ["buyya", "cloud computing", "virtualization", "grid computing"]),
        ("Internet of Things: A Hands-On Approach", "Arshdeep Bahga, Vijay Madisetti", "Universities Press", "Computer Networks", 2014, 520, 48.00, "Core college IoT coursebook covering sensors, Raspberry Pi, Arduino, MQTT, CoAP, and IoT cloud services.", ["iot", "bahga", "madisetti", "raspberry pi", "mqtt", "sensors"]),

        # College Prescribed Engineering Mathematics & Core Sciences
        ("Higher Engineering Mathematics", "B.S. Grewal", "Khanna Publishers", "Engineering Mathematics", 2021, 1340, 35.00, "The most famous and universal textbook used across every engineering college for differential equations, linear algebra, Laplace transforms, and complex analysis.", ["bs grewal", "engineering mathematics", "calculus", "differential equations", "laplace", "fourier"]),
        ("Advanced Engineering Mathematics", "Erwin Kreyszig", "Wiley", "Engineering Mathematics", 2011, 1264, 110.00, "The global standard reference in ODEs, PDEs, vector calculus, linear algebra, numerical analysis, and complex variables.", ["kreyszig", "engineering mathematics", "vector calculus", "pde", "numerical methods"]),
        ("Discrete Mathematics and Its Applications", "Kenneth H. Rosen", "McGraw-Hill", "Engineering Mathematics", 2018, 1072, 115.00, "The definitive college textbook for propositional logic, sets, relations, graphs, combinatorics, and boolean algebra.", ["rosen", "discrete mathematics", "logic", "graph theory", "combinatorics"]),
        ("Linear Algebra and Its Applications", "Gilbert Strang", "Cengage Learning", "Engineering Mathematics", 2006, 500, 75.00, "Gilbert Strang's renowned MIT textbook on vector spaces, eigenvalues, singular value decomposition (SVD), and matrix theory.", ["gilbert strang", "linear algebra", "mit", "eigenvalues", "matrix"]),
        ("Probability, Statistics and Random Processes", "T. Veerarajan", "McGraw-Hill", "Engineering Mathematics", 2017, 608, 30.00, "Universally prescribed syllabus textbook for random variables, queuing theory, and stochastic processes.", ["veerarajan", "probability", "statistics", "random processes", "queuing theory"]),
        ("Thomas' Calculus", "George B. Thomas, Maurice D. Weir, Joel Hass", "Pearson", "Engineering Mathematics", 2018, 1200, 105.00, "World-renowned textbook for single and multivariable calculus, limits, derivatives, integration, and series.", ["thomas calculus", "calculus", "derivatives", "integration", "multivariable"]),
        ("Operations Research: An Introduction", "Hamdy A. Taha", "Pearson", "Engineering Mathematics", 2017, 848, 88.00, "Core university textbook on linear programming, Simplex method, transportation models, queuing models, and game theory.", ["taha", "operations research", "linear programming", "simplex", "queuing"]),

        # Core Electronics, Hardware & Digital Logic (Every College Engineering Student)
        ("Digital Logic and Computer Design", "M. Morris Mano", "Pearson", "Electronics & Hardware", 2016, 544, 45.00, "The foundational college textbook on Boolean algebra, Karnaugh maps, combinational logic, flip-flops, and sequential circuits.", ["morris mano", "digital logic", "boolean algebra", "k-maps", "flip flops"]),
        ("Microprocessor Architecture, Programming, and Applications with the 8085", "Ramesh S. Gaonkar", "Penram International", "Electronics & Hardware", 2013, 750, 32.00, "The universal undergraduate textbook for learning assembly programming, pin diagrams, interrupts, and interfacing with the Intel 8085.", ["gaonkar", "8085", "microprocessor", "assembly", "interfacing"]),
        ("Electronic Devices and Circuit Theory", "Robert L. Boylestad, Louis Nashelsky", "Pearson", "Electronics & Hardware", 2015, 960, 92.00, "The standard college electronics textbook covering PN junction diodes, BJTs, FETs, op-amps, and power supplies.", ["boylestad", "electronic devices", "circuits", "bjt", "diodes", "op-amp"]),
        ("Signals and Systems", "Alan V. Oppenheim, Alan S. Willsky, S. Hamid Nawab", "Pearson", "Electronics & Hardware", 2015, 950, 110.00, "MIT's legendary textbook on continuous-time and discrete-time signals, Fourier transforms, Laplace, and Z-transforms.", ["oppenheim", "signals and systems", "fourier transform", "z-transform", "dsp"]),
        ("Digital Signal Processing: Principles, Algorithms, and Applications", "John G. Proakis, Dimitris G. Manolakis", "Pearson", "Electronics & Hardware", 2007, 1088, 98.00, "Universal university textbook for DFT, FFT algorithms, IIR and FIR filter design, and quantization effects.", ["proakis", "dsp", "digital signal processing", "fft", "filters"]),
        ("Modern Control Engineering", "Katsuhiko Ogata", "Pearson", "Electronics & Hardware", 2010, 912, 105.00, "Classic university text covering transfer functions, root locus, Bode plots, state-space analysis, and PID controllers.", ["ogata", "control systems", "root locus", "bode plot", "pid controller"]),
        ("Basic Electrical Engineering", "D.C. Kulshreshtha", "McGraw-Hill", "Electronics & Hardware", 2019, 720, 29.00, "Prescribed across all engineering 1st year programs for AC/DC circuits, transformers, and electrical machines.", ["kulshreshtha", "basic electrical", "circuits", "transformers", "ac analysis"]),

        # College Management, Systems & Industrial Engineering
        ("Management Information Systems: Managing the Digital Firm", "Kenneth C. Laudon, Jane P. Laudon", "Pearson", "Management & Information Systems", 2021, 688, 92.00, "The core college textbook for IT management, ERP systems, supply chain integration, and enterprise digital strategy.", ["laudon", "mis", "management information systems", "erp", "enterprise"]),
        ("Principles of Management", "P.C. Tripathi, P.N. Reddy", "McGraw-Hill", "Management & Information Systems", 2017, 448, 26.00, "Standard undergraduate textbook for planning, organizing, staffing, directing, and controlling organizational resources.", ["tripathi", "reddy", "principles of management", "planning", "leadership"]),
        ("Engineering Mechanics: Statics and Dynamics", "R.C. Hibbeler", "Pearson", "Engineering Mathematics", 2016, 800, 95.00, "The most widely used college engineering mechanics text covering vectors, equilibrium of particles, friction, and kinematics.", ["hibbeler", "engineering mechanics", "statics", "dynamics", "friction"]),
        ("A Textbook of Fluid Mechanics and Hydraulic Machines", "R.K. Bansal", "Laxmi Publications", "Electronics & Hardware", 2018, 1100, 36.00, "Standard college engineering text for fluid statics, Bernoulli's equation, boundary layer theory, and hydraulic turbines.", ["bansal", "fluid mechanics", "hydraulic machines", "bernoulli", "turbines"]),
        ("Thermodynamics: An Engineering Approach", "Yunus A. Çengel, Michael A. Boles", "McGraw-Hill", "Electronics & Hardware", 2019, 1024, 115.00, "The globally prescribed college textbook for laws of thermodynamics, Carnot cycle, refrigeration, and power generation.", ["cengel", "thermodynamics", "entropy", "carnot", "heat transfer"]),

        # Software Engineering (12 books)
        ("Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Prentice Hall", "Software Engineering", 2008, 464, 45.99, "Clean code craftsmanship, refactoring, agile design principles, and automated testing.", ["clean code", "refactoring", "agile", "java", "craftsmanship"]),
        ("Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", "Addison-Wesley", "Software Engineering", 1994, 395, 54.99, "The Gang of Four classic on creational, structural, and behavioral design patterns.", ["design patterns", "oop", "architecture", "c++", "gof"]),
        ("Refactoring: Improving the Design of Existing Code", "Martin Fowler", "Addison-Wesley", "Software Engineering", 2018, 448, 49.99, "Principles and practical techniques for improving existing code structure safely.", ["refactoring", "code smells", "fowler", "architecture", "software design"]),
        ("The Pragmatic Programmer: Your Journey To Mastery", "David Thomas, Andrew Hunt", "Addison-Wesley", "Software Engineering", 2019, 352, 47.50, "Timeless advice on pragmatic software engineering and professional developer habits.", ["pragmatic programmer", "best practices", "career", "craftsmanship"]),
        ("Domain-Driven Design: Tackling Complexity in the Heart of Software", "Eric Evans", "Addison-Wesley", "Software Engineering", 2003, 560, 58.00, "Deep architectural framework connecting software design to business domains.", ["domain driven design", "ddd", "microservices", "software architecture"]),
        ("Building Microservices: Designing Fine-Grained Systems", "Sam Newman", "O'Reilly Media", "Software Engineering", 2021, 612, 52.00, "Comprehensive guide to microservices architecture, boundaries, and communications.", ["microservices", "distributed systems", "devops", "apis", "docker"]),
        ("Working Effectively with Legacy Code", "Michael Feathers", "Prentice Hall", "Software Engineering", 2004, 456, 46.00, "Techniques for refactoring, testing, and understanding difficult legacy codebases.", ["legacy code", "unit testing", "refactoring", "dependency breaking"]),
        ("Effective Java", "Joshua Bloch", "Addison-Wesley", "Software Engineering", 2018, 416, 52.00, "The definitive guide to Java platform best practices, concurrency, and generics.", ["java", "jvm", "design patterns", "concurrency", "effective java"]),
        ("Fluent Python: Clear, Concise, and Effective Programming", "Luciano Ramalho", "O'Reilly Media", "Software Engineering", 2022, 1012, 59.99, "Deep dive into Python 3 idioms, metaprogramming, generators, and coroutines.", ["python", "fluent python", "decorators", "generators", "concurrency"]),
        ("Clean Architecture: A Craftsman's Guide to Software Structure", "Robert C. Martin", "Prentice Hall", "Software Engineering", 2017, 432, 44.95, "Universal rules of software architecture, boundaries, components, and dependency rules.", ["clean architecture", "solid principles", "boundaries", "software engineering"]),
        ("Software Engineering at Google: Lessons Learned from Programming Over Time", "Titus Winters, Tom Manshreck, Hyrum Wright", "O'Reilly Media", "Software Engineering", 2020, 600, 48.00, "How Google builds and maintains massive, resilient, long-term software systems.", ["google", "software engineering", "ci/cd", "testing", "code review"]),
        ("Site Reliability Engineering: How Google Runs Production Systems", "Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Murphy", "O'Reilly Media", "Software Engineering", 2016, 550, 49.99, "SRE principles, SLOs, SLIs, incident management, and automated monitoring systems.", ["sre", "reliability", "devops", "cloud", "monitoring"]),

        # Artificial Intelligence & Machine Learning (15 books)
        ("Artificial Intelligence: A Modern Approach", "Stuart Russell, Peter Norvig", "Pearson", "Artificial Intelligence", 2020, 1152, 110.00, "The global standard university textbook in foundational and modern AI.", ["ai", "norvig", "search", "agents", "machine learning", "nlp", "robotics"]),
        ("Deep Learning", "Ian Goodfellow, Yoshua Bengio, Aaron Courville", "MIT Press", "Artificial Intelligence", 2016, 800, 85.00, "Definitive theoretical and mathematical treatment of deep neural networks.", ["deep learning", "neural networks", "backpropagation", "cnn", "rnn"]),
        ("Pattern Recognition and Machine Learning", "Christopher M. Bishop", "Springer", "Artificial Intelligence", 2006, 738, 92.00, "Comprehensive Bayesian and probabilistic approach to statistical machine learning.", ["machine learning", "pattern recognition", "bayesian", "statistics"]),
        ("Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", "Aurélien Géron", "O'Reilly Media", "Artificial Intelligence", 2022, 856, 64.99, "Practical end-to-end machine learning and deep learning implementation guide.", ["scikit-learn", "tensorflow", "keras", "deep learning", "python"]),
        ("Reinforcement Learning: An Introduction", "Richard S. Sutton, Andrew G. Barto", "MIT Press", "Artificial Intelligence", 2018, 552, 75.00, "The classic foundation textbook on Markov decision processes, Q-learning, and policy gradients.", ["reinforcement learning", "q-learning", "markov", "deep rl"]),
        ("Natural Language Processing with Transformers", "Lewis Tunstall, Leandro von Werra, Thomas Wolf", "O'Reilly Media", "Artificial Intelligence", 2022, 400, 54.99, "Practical building of LLMs, BERT, GPT, and Hugging Face transformer pipelines.", ["nlp", "transformers", "bert", "gpt", "huggingface", "llm"]),
        ("Speech and Language Processing", "Daniel Jurafsky, James H. Martin", "Pearson", "Artificial Intelligence", 2023, 1032, 95.00, "Leading textbook in computational linguistics, language modeling, and tokenization.", ["nlp", "linguistics", "language models", "tokenization", "semantics"]),
        ("Probabilistic Graphical Models: Principles and Techniques", "Daphne Koller, Nir Friedman", "MIT Press", "Artificial Intelligence", 2009, 1270, 105.00, "Bayesian networks, Markov networks, exact inference, and parameter estimation.", ["graphical models", "bayesian networks", "inference", "machine learning"]),
        ("Computer Vision: Algorithms and Applications", "Richard Szeliski", "Springer", "Artificial Intelligence", 2022, 966, 88.00, "Foundational and modern computer vision, feature detection, and 3D reconstruction.", ["computer vision", "opencv", "image processing", "cnn"]),
        ("Generative Deep Learning: Teaching Machines to Paint, Write, Compose, and Play", "David Foster", "O'Reilly Media", "Artificial Intelligence", 2023, 450, 59.99, "Comprehensive guide to GANs, VAEs, Diffusion Models, and Transformer architectures.", ["generative ai", "diffusion", "gan", "vae", "deep learning"]),
        ("Mathematics for Machine Learning", "Marc Peter Deisenroth, A. Aldo Faisal, Cheng Soon Ong", "Cambridge University Press", "Artificial Intelligence", 2020, 398, 48.00, "Linear algebra, multivariate calculus, and probability for machine learning.", ["mathematics", "linear algebra", "calculus", "machine learning"]),
        ("Machine Learning: A Probabilistic Perspective", "Kevin P. Murphy", "MIT Press", "Artificial Intelligence", 2012, 1104, 98.00, "Comprehensive, unified probabilistic treatment of all machine learning algorithms.", ["machine learning", "probabilistic", "bayesian", "algorithms"]),
        ("Deep Learning with Python", "François Chollet", "Manning Publications", "Artificial Intelligence", 2021, 504, 49.99, "Written by the creator of Keras, covers deep learning intuition and applications.", ["keras", "deep learning", "python", "neural networks"]),
        ("AI Agents in Practice: Autonomous Workflows and Tool Calling", "Sophia Martinez", "Academic Tech Press", "Artificial Intelligence", 2024, 380, 52.00, "Building multi-agent reasoning systems, tool-calling agents, and memory stores.", ["agents", "autonomous", "tool calling", "multi-agent", "rag"]),
        ("Retrieval-Augmented Generation for Enterprise Knowledge", "Vikram Malhotra", "TechPress", "Artificial Intelligence", 2024, 340, 48.00, "Designing vector databases, hybrid search, and hallucination reduction with RAG.", ["rag", "vector search", "llm", "embeddings", "enterprise ai"]),

        # Data Science & Big Data (12 books)
        ("Python for Data Analysis: Data Wrangling with pandas, NumPy, and Jupyter", "Wes McKinney", "O'Reilly Media", "Data Science", 2022, 550, 49.99, "Written by the creator of pandas, the practical bible of data manipulation.", ["pandas", "numpy", "data analysis", "python", "jupyter"]),
        ("Data Science from Scratch: First Principles with Python", "Joel Grus", "O'Reilly Media", "Data Science", 2019, 406, 44.99, "Implement algorithms, statistics, and neural nets from scratch in pure Python.", ["data science", "statistics", "python", "from scratch"]),
        ("Storytelling with Data: A Data Visualization Guide for Business Professionals", "Cole Nussbaumer Knaflic", "Wiley", "Data Science", 2015, 288, 38.00, "Mastering effective data communication, visual perception, and charting principles.", ["visualization", "storytelling", "charts", "communication"]),
        ("Mining of Massive Datasets", "Jure Leskovec, Anand Rajaraman, Jeffrey D. Ullman", "Cambridge University Press", "Data Science", 2020, 530, 65.00, "Algorithms for distributed big data processing, MapReduce, streaming, and page rank.", ["big data", "mapreduce", "mining", "algorithms", "graph mining"]),
        ("Practical Statistics for Data Scientists", "Peter Bruce, Andrew Bruce, Peter Gedeck", "O'Reilly Media", "Data Science", 2020, 368, 47.00, "Exploratory data analysis, hypothesis testing, regression, and classification.", ["statistics", "hypothesis testing", "regression", "data science"]),
        ("Feature Engineering for Machine Learning", "Alice Zheng, Amanda Casari", "O'Reilly Media", "Data Science", 2018, 218, 39.99, "Techniques for numerical data, text, categorical encoding, and PCA dimensional reduction.", ["feature engineering", "pca", "data preparation", "machine learning"]),
        ("Learning Spark: Lightning-Fast Big Data Analysis", "Jules S. Damji, Brooke Wenig, Tathagata Das, Denny Lee", "O'Reilly Media", "Data Science", 2020, 400, 55.00, "Distributed processing using Apache Spark 3.0, DataFrames, Spark SQL, and MLlib.", ["spark", "big data", "distributed", "apache", "scala"]),
        ("Designing Cloud Data Platforms", "Danil Zburivsky, Lynda Partner", "Manning Publications", "Data Science", 2021, 380, 52.00, "Architecting scalable data warehouses, data lakes, and streaming pipelines.", ["data platform", "data lake", "etl", "cloud", "streaming"]),
        ("R for Data Science: Import, Tidy, Transform, Visualize, and Model Data", "Hadley Wickham, Garrett Grolemund", "O'Reilly Media", "Data Science", 2023, 544, 48.00, "Mastering data manipulation and visual modeling using the tidyverse in R.", ["r", "tidyverse", "data science", "modeling", "ggplot2"]),
        ("Fundamentals of Data Engineering", "Joe Reis, Matt Housley", "O'Reilly Media", "Data Science", 2022, 440, 58.00, "The data engineering lifecycle from ingestion and storage to orchestration and serving.", ["data engineering", "pipelines", "architecture", "big data"]),
        ("Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing", "Tyler Akidau, Slava Chernyak, Reuven Lax", "O'Reilly Media", "Data Science", 2018, 350, 51.00, "Stream processing architectures, Apache Beam, windowing, and watermarks.", ["streaming", "beam", "kafka", "realtime data"]),
        ("Data Mesh: Delivering Data-Driven Value at Scale", "Zhamak Dehghani", "O'Reilly Media", "Data Science", 2022, 320, 46.00, "Decentralized socio-technical paradigm for analytical data management.", ["data mesh", "architecture", "domain driven", "data governance"]),

        # Computer Science, Algorithms & Foundations (14 books)
        ("Introduction to Algorithms", "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein", "MIT Press", "Computer Science", 2022, 1312, 120.00, "The world's leading algorithms textbook (CLRS) combining rigor and breadth.", ["algorithms", "clrs", "data structures", "dynamic programming", "graphs"]),
        ("The Algorithm Design Manual", "Steven S. Skiena", "Springer", "Computer Science", 2020, 810, 75.00, "Practical guide to designing algorithms and catalog of 75 algorithmic problem patterns.", ["algorithm design", "skiena", "interview", "data structures"]),
        ("Algorithms", "Robert Sedgewick, Kevin Wayne", "Addison-Wesley", "Computer Science", 2011, 992, 85.00, "Surveys the most important computer algorithms in use today, implemented in Java.", ["algorithms", "sedgewick", "java", "data structures", "sorting"]),
        ("Structure and Interpretation of Computer Programs", "Harold Abelson, Gerald Jay Sussman", "MIT Press", "Computer Science", 1996, 657, 68.00, "The legendary MIT SICP textbook teaching computational processes via Scheme/Lisp.", ["sicp", "computer science", "functional programming", "scheme", "abelson"]),
        ("The Art of Computer Programming, Volumes 1-4A", "Donald E. Knuth", "Addison-Wesley", "Computer Science", 2011, 3168, 220.00, "Donald Knuth's monumental multi-volume treatise on fundamental algorithms.", ["knuth", "taocp", "algorithms", "combinatorics", "computer science"]),
        ("Computational Complexity: A Modern Approach", "Sanjeev Arora, Boaz Barak", "Cambridge University Press", "Computer Science", 2009, 594, 72.00, "Classic graduate text on P vs NP, randomized computation, and quantum computing.", ["complexity", "p vs np", "theory of computation", "turing machines"]),
        ("Introduction to the Theory of Computation", "Michael Sipser", "Cengage Learning", "Computer Science", 2012, 504, 88.00, "Automata theory, regular expressions, context-free grammars, and decidability.", ["automata", "turing machines", "sipser", "computation theory"]),
        ("Concepts, Techniques, and Models of Computer Programming", "Peter Van Roy, Seif Haridi", "MIT Press", "Computer Science", 2004, 930, 80.00, "Explores programming paradigms: functional, declarative, concurrent, and stateful.", ["programming models", "concurrency", "paradigms", "distributed"]),
        ("Types and Programming Languages", "Benjamin C. Pierce", "MIT Press", "Computer Science", 2002, 648, 78.00, "Comprehensive introduction to type systems in programming language theory.", ["type theory", "compilers", "lambda calculus", "programming languages"]),
        ("Compilers: Principles, Techniques, and Tools", "Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman", "Pearson", "Computer Science", 2006, 1040, 115.00, "The famous Dragon Book on lexical analysis, parsing, syntax-directed translation, and optimization.", ["compilers", "dragon book", "lexical analysis", "ast", "optimization"]),
        ("The C Programming Language", "Brian W. Kernighan, Dennis M. Ritchie", "Prentice Hall", "Computer Science", 1988, 272, 42.00, "The classic ANSI C bible written by the original language creators.", ["c programming", "kernighan", "ritchie", "systems", "memory"]),
        ("Modern Compiler Implementation in Java", "Andrew W. Appel", "Cambridge University Press", "Computer Science", 2002, 548, 72.00, "Compiler construction covering code generation, instruction selection, and liveness analysis.", ["compilers", "appel", "java", "code generation"]),
        ("Concrete Mathematics: A Foundation for Computer Science", "Ronald L. Graham, Donald E. Knuth, Oren Patashnik", "Addison-Wesley", "Computer Science", 1994, 672, 70.00, "Recurrences, summation techniques, binomial coefficients, and generating functions.", ["concrete mathematics", "knuth", "discrete mathematics", "combinatorics"]),
        ("Computer Systems: A Programmer's Perspective", "Randal E. Bryant, David R. O'Hallaron", "Pearson", "Computer Science", 2015, 1120, 118.00, "Explains how computer systems execute programs, manage memory, and communicate across networks.", ["csapp", "systems", "machine code", "virtual memory", "architecture"]),

        # Database Systems & Distributed Storage (10 books)
        ("Designing Data-Intensive Applications", "Martin Kleppmann", "O'Reilly Media", "Database Systems", 2017, 616, 52.00, "The landmark architecture book on scalability, consistency, transactions, and consensus.", ["distributed systems", "databases", "transactions", "nosql", "streaming"]),
        ("Database System Concepts", "Abraham Silberschatz, Henry F. Korth, S. Sudarshan", "McGraw-Hill", "Database Systems", 2019, 1376, 125.00, "The core university standard textbook in relational, object-oriented, and NoSQL databases.", ["databases", "sql", "relational", "indexing", "concurrency", "acid"]),
        ("Database Internals: A Deep Dive into How Distributed Data Systems Work", "Alex Petrov", "O'Reilly Media", "Database Systems", 2019, 370, 54.00, "B-Trees, LSM-Trees, storage engines, distributed consensus, Paxos, and Raft.", ["database internals", "b-trees", "lsm-tree", "raft", "storage engine"]),
        ("High Performance MySQL: Optimization, Backups, and Replication", "Silvia Botros, Jeremy Tinley", "O'Reilly Media", "Database Systems", 2021, 350, 49.99, "Advanced indexing, query optimization, clustering, and replication architecture.", ["mysql", "indexing", "replication", "performance", "sql"]),
        ("MongoDB: The Definitive Guide", "Shannon Bradshaw, Eoin Brazil, Kristina Chodorow", "O'Reilly Media", "Database Systems", 2019, 514, 49.99, "Document database indexing, aggregation pipelines, replica sets, and sharding.", ["mongodb", "nosql", "document database", "aggregation", "sharding"]),
        ("PostgreSQL: Up and Running", "Regina Obe, Leo Hsu", "O'Reilly Media", "Database Systems", 2017, 320, 42.00, "Practical administration, JSONB storage, full text search, and indexing in Postgres.", ["postgresql", "postgres", "sql", "jsonb", "indexing"]),
        ("NoSQL Distilled: A Brief Guide to the Emerging World of Polyglot Persistence", "Pramod J. Sadalage, Martin Fowler", "Addison-Wesley", "Database Systems", 2012, 192, 38.00, "Key-value, document, column-family, and graph databases comparison.", ["nosql", "polyglot persistence", "fowler", "key-value", "graph"]),
        ("Graph Databases: New Opportunities for Connected Data", "Ian Robinson, Jim Webber, Emil Eifrem", "O'Reilly Media", "Database Systems", 2015, 238, 41.00, "Property graphs, graph algorithms, Neo4j, and modeling connected data.", ["graph database", "neo4j", "cypher", "connected data"]),
        ("Query Optimization in Relational Databases", "Suriya Krishnamurthy", "Academic Press", "Database Systems", 2023, 420, 68.00, "Cost-based query optimizers, plan generation, dynamic programming, and join ordering.", ["query optimization", "cost models", "sql", "join algorithms"]),
        ("Distributed Databases and Storage Architecture", "David Miller", "TechPress", "Database Systems", 2024, 390, 55.00, "Partitioning, two-phase commit, Spanner, CockroachDB, and distributed ACID.", ["distributed databases", "cockroachdb", "spanner", "distributed acid"]),

        # Cloud Computing, DevOps & Distributed Systems (12 books)
        ("Kubernetes in Action", "Marko Luksa", "Manning Publications", "Cloud Computing", 2018, 592, 59.99, "The authoritative hands-on guide to container orchestration, pods, services, and ingresses.", ["kubernetes", "docker", "containers", "orchestration", "devops"]),
        ("Cloud Native Patterns: Designing change-tolerant software", "Cornelia Davis", "Manning Publications", "Cloud Computing", 2019, 384, 49.99, "Building distributed applications that thrive on elastic cloud platforms.", ["cloud native", "microservices", "twelve factor", "distributed"]),
        ("Terraform: Up & Running: Writing Infrastructure as Code", "Yevgeniy Brikman", "O'Reilly Media", "Cloud Computing", 2022, 420, 48.00, "Automating infrastructure provisioning across AWS, GCP, and Azure with HCL.", ["terraform", "iac", "devops", "cloud", "aws"]),
        ("Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation", "Jez Humble, David Farley", "Addison-Wesley", "Cloud Computing", 2010, 512, 53.00, "The foundational text establishing CI/CD deployment pipelines and release patterns.", ["continuous delivery", "ci/cd", "deployment pipeline", "automation"]),
        ("Docker Deep Dive", "Nigel Poulton", "Independently published", "Cloud Computing", 2023, 410, 39.99, "Complete mastery of container internals, images, storage drivers, and networking.", ["docker", "containers", "cgroups", "devops"]),
        ("The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win", "Gene Kim, Kevin Behr, George Spafford", "IT Revolution", "Cloud Computing", 2013, 384, 28.00, "The beloved story illuminating the Three Ways of DevOps and flow of work.", ["devops", "phoenix project", "agile", "flow"]),
        ("Distributed Systems: Concepts and Design", "George Coulouris, Jean Dollimore, Tim Kindberg, Gordon Blair", "Pearson", "Cloud Computing", 2011, 1064, 115.00, "Standard university textbook in distributed RPC, clock synchronization, and replication.", ["distributed systems", "rpc", "concurrency", "synchronization"]),
        ("Cloud Architecture Patterns", "Bill Wilder", "O'Reilly Media", "Cloud Computing", 2012, 190, 36.00, "Multi-tenant systems, queue-centric architectures, and autoscaling patterns.", ["cloud", "architecture", "scalability", "patterns"]),
        ("Serverless Architectures on AWS", "Peter Sbarski", "Manning Publications", "Cloud Computing", 2017, 360, 44.00, "Event-driven microservices using AWS Lambda, API Gateway, and DynamoDB.", ["serverless", "aws", "lambda", "event-driven"]),
        ("Observability Engineering: Achieving Columnar Metrics, Tracing, and Logging", "Charity Majors, Liz Fong-Jones, George Miranda", "O'Reilly Media", "Cloud Computing", 2022, 340, 51.00, "Modern observability, distributed tracing, high-cardinality metrics, and OpenTelemetry.", ["observability", "opentelemetry", "tracing", "monitoring", "sre"]),
        ("Production Kubernetes: Building Complex Systems", "Josh Rosso, Rich Lander, Alexander Brand, John Harris", "O'Reilly Media", "Cloud Computing", 2021, 470, 56.00, "Advanced multi-cluster Kubernetes networking, ingress controllers, and security policies.", ["kubernetes", "networking", "security", "production"]),
        ("Enterprise Cloud Governance and FinOps", "Elena Rostova", "TechPress", "Cloud Computing", 2024, 310, 47.00, "Cost optimization, resource tagging, compliance policies, and multi-cloud security.", ["finops", "cloud governance", "aws", "azure", "cost optimization"]),

        # Cybersecurity & Information Security (10 books)
        ("The Web Application Hacker's Handbook: Finding and Exploiting Security Flaws", "Dafydd Stuttard, Marcus Pinto", "Wiley", "Cybersecurity", 2011, 912, 55.00, "The definitive guide to web security testing, SQL injection, XSS, and CSRF.", ["cybersecurity", "web security", "penetration testing", "xss", "sql injection"]),
        ("Cryptography and Network Security: Principles and Practice", "William Stallings", "Pearson", "Cybersecurity", 2022, 800, 110.00, "Symmetric encryption, RSA, elliptic curve cryptography, and authentication protocols.", ["cryptography", "rsa", "encryption", "security", "stallings"]),
        ("Practical Malware Analysis: The Hands-On Guide to Dissecting Malicious Software", "Michael Sikorski, Andrew Honig", "No Starch Press", "Cybersecurity", 2012, 800, 59.95, "Reverse engineering, static analysis, IDA Pro, and dynamic debugging.", ["malware analysis", "reverse engineering", "ida pro", "security"]),
        ("Hacking: The Art of Exploitation", "Jon Erickson", "No Starch Press", "Cybersecurity", 2008, 488, 49.95, "Teaches C programming, assembly, buffer overflows, shellcode, and network sniffing.", ["hacking", "buffer overflow", "assembly", "shellcode", "exploitation"]),
        ("Network Security Essentials: Applications and Standards", "William Stallings", "Pearson", "Cybersecurity", 2016, 448, 85.00, "IPSec, TLS, wireless security, firewalls, and intrusion detection systems.", ["network security", "tls", "ipsec", "firewalls"]),
        ("Threat Modeling: Designing for Security", "Adam Shostack", "Wiley", "Cybersecurity", 2014, 624, 52.00, "STRIDE threat modeling methodology and security architecture verification.", ["threat modeling", "stride", "security architecture", "risk"]),
        ("Applied Cryptography: Protocols, Algorithms, and Source Code in C", "Bruce Schneier", "Wiley", "Cybersecurity", 2015, 784, 60.00, "Bruce Schneier's timeless cryptographic protocols and cipher algorithms reference.", ["cryptography", "schneier", "ciphers", "protocols"]),
        ("Zero Trust Networks: Building Secure Systems in Untrusted Networks", "Evan Gilman, Doug Barth", "O'Reilly Media", "Cybersecurity", 2017, 240, 43.00, "Authentication, mTLS, control planes, and shifting beyond network perimeters.", ["zero trust", "mtls", "network security", "identity"]),
        ("Cloud Security and Compliance Architecture", "Marcus Reed", "Academic Press", "Cybersecurity", 2023, 410, 58.00, "Securing public cloud workloads, IAM least-privilege, and vulnerability scanners.", ["cloud security", "iam", "compliance", "soc2"]),
        ("Incident Response & Computer Forensics", "Jason T. Luttgens, Matthew Pepe, Kevin Mandia", "McGraw-Hill", "Cybersecurity", 2014, 576, 65.00, "Investigating corporate breaches, collecting digital evidence, and forensic triage.", ["forensics", "incident response", "evidence", "breach"]),

        # Web Development & Full-Stack Architecture (10 books)
        ("JavaScript: The Definitive Guide: Master the World's Most-Used Programming Language", "David Flanagan", "O'Reilly Media", "Web Development", 2020, 706, 49.99, "The definitive Rhino book on JavaScript syntax, DOM, async/await, and APIs.", ["javascript", "es6", "web development", "async", "dom"]),
        ("Learning React: Modern Patterns for Developing React Apps", "Alex Banks, Eve Porcello", "O'Reilly Media", "Web Development", 2020, 310, 44.99, "Functional React, Hooks, state management, routing, and component architecture.", ["react", "hooks", "javascript", "frontend", "web"]),
        ("Node.js Design Patterns", "Mario Casciaro, Luciano Mammino", "Packt Publishing", "Web Development", 2020, 664, 52.00, "Asynchronous control flow, streams, microservices, and design patterns in Node.js.", ["nodejs", "backend", "streams", "async", "design patterns"]),
        ("Designing Web APIs: Principles for Great APIs", "Brenda Jin, Saurabh Sahni, Amir Shevat", "O'Reilly Media", "Web Development", 2018, 150, 38.00, "RESTful API design, versioning, status codes, documentation, and rate limiting.", ["api", "rest", "web development", "http"]),
        ("Full Stack Serverless: Modern Application Development with React, AWS, and GraphQL", "Nader Dabit", "O'Reilly Media", "Web Development", 2020, 220, 42.00, "Modern full stack workflows using React, AppSync, GraphQL, and Cognito.", ["serverless", "graphql", "react", "fullstack"]),
        ("HTML and CSS: Design and Build Websites", "Jon Duckett", "Wiley", "Web Development", 2011, 512, 35.00, "The beautifully illustrated visual guide to HTML5 structure and CSS3 styling.", ["html5", "css3", "web design", "frontend"]),
        ("TypeScript Quickly", "Yakov Fain, Anton Moiseev", "Manning Publications", "Web Development", 2020, 480, 48.00, "Mastering static typing, interfaces, generics, and compiler options in TypeScript.", ["typescript", "javascript", "static typing", "frontend"]),
        ("CSS: The Definitive Guide: Visual Presentation for the Web", "Eric A. Meyer, Estelle Weyl", "O'Reilly Media", "Web Development", 2023, 1150, 68.00, "Grid layout, Flexbox, transitions, custom properties, and modern responsive CSS.", ["css", "flexbox", "grid", "responsive", "styling"]),
        ("Progressive Web Apps", "Dean Alan Hume", "Manning Publications", "Web Development", 2018, 300, 42.00, "Service workers, offline caching, push notifications, and web app manifests.", ["pwa", "service workers", "offline", "web app"]),
        ("Micro Frontends in Action", "Michael Geers", "Manning Publications", "Web Development", 2020, 340, 49.00, "Splitting monolithic frontend web applications into autonomous micro applications.", ["micro frontends", "frontend architecture", "web", "composition"]),

        # Operating Systems, Networks & Systems Programming (12 books)
        ("Operating System Concepts", "Abraham Silberschatz, Peter B. Galvin, Greg Gagne", "Wiley", "Operating Systems", 2018, 976, 118.00, "The Dinosaur Book: processes, threads, CPU scheduling, deadlocks, and paging.", ["operating systems", "silberschatz", "kernel", "paging", "scheduling"]),
        ("Modern Operating Systems", "Andrew S. Tanenbaum, Herbert Bos", "Pearson", "Operating Systems", 2022, 1136, 122.00, "Tanenbaum's classic on Unix, Linux, and Windows internals and virtualization.", ["operating systems", "tanenbaum", "linux", "virtualization", "kernel"]),
        ("The Linux Programming Interface: A Linux and UNIX System Programming Handbook", "Michael Kerrisk", "No Starch Press", "Operating Systems", 2010, 1556, 99.95, "The ultimate exhaustive encyclopedia of Linux system calls, signals, and IPC.", ["linux", "system calls", "posix", "c", "ipc"]),
        ("Computer Networks", "Andrew S. Tanenbaum, David J. Wetherall", "Pearson", "Computer Networks", 2021, 960, 115.00, "The definitive networking text from physical layers to TCP/IP and application protocols.", ["networking", "tanenbaum", "tcp/ip", "protocols", "routing"]),
        ("TCP/IP Illustrated, Volume 1: The Protocols", "W. Richard Stevens, Kevin R. Fall", "Addison-Wesley", "Computer Networks", 2011, 1056, 85.00, "The gold standard reference on IP, TCP handshake, congestion control, and DNS.", ["tcp/ip", "stevens", "protocols", "networking", "wireshark"]),
        ("Computer Networking: A Top-Down Approach", "James F. Kurose, Keith W. Ross", "Pearson", "Computer Networks", 2020, 864, 112.00, "Popular university text organizing networks starting from HTTP down to physical layers.", ["networking", "kurose", "top down", "http", "sockets"]),
        ("Unix Network Programming, Volume 1: The Sockets Networking API", "W. Richard Stevens, Bill Fenner, Andrew M. Rudoff", "Addison-Wesley", "Computer Networks", 2003, 1024, 82.00, "Low-level socket programming, select, poll, epoll, non-blocking I/O in C.", ["sockets", "networking", "unix", "c", "epoll"]),
        ("Linux Kernel Development", "Robert Love", "Addison-Wesley", "Operating Systems", 2010, 464, 52.00, "Process scheduler, interrupt handlers, memory allocation, and kernel locking.", ["linux kernel", "robert love", "interrupts", "device drivers"]),
        ("Systems Performance: Enterprise and the Cloud", "Brendan Gregg", "Addison-Wesley", "Operating Systems", 2020, 992, 69.00, "Brendan Gregg's benchmark bible on CPU, memory, storage, and eBPF tracing.", ["performance", "brendan gregg", "ebpf", "linux", "profiling"]),
        ("High Performance Browser Networking", "Ilya Grigorik", "O'Reilly Media", "Computer Networks", 2013, 400, 48.00, "Latency, bandwidth, TCP tuning, TLS performance, HTTP/2, and WebRTC.", ["networking", "http2", "webrtc", "browser performance"]),
        ("Embedded Systems: Real-Time Operating Systems for ARM Cortex-M", "Jonathan W. Valvano", "CreateSpace", "Operating Systems", 2017, 520, 58.00, "Thread scheduling, semaphores, real-time deterministic operating systems on ARM.", ["embedded", "rtos", "arm", "cortex-m", "microcontrollers"]),
        ("Network Programmability and Automation", "Jason Edelman, Scott S. Lowe, Matt Oswalt", "O'Reilly Media", "Computer Networks", 2018, 580, 54.00, "Automating router switches, Netmiko, Ansible, and software-defined networking (SDN).", ["sdn", "network automation", "python", "ansible"])
    ]

    shelves = ["Stack-A", "Stack-B", "Stack-C", "Stack-D", "Stack-E", "Stack-F"]
    racks = ["R-01", "R-02", "R-03", "R-04", "R-05", "R-06"]
    rows = ["1", "2", "3", "4"]

    known_covers = {
        "Programming in ANSI C": "https://covers.openlibrary.org/b/isbn/9789352606558-L.jpg",
        "Object-Oriented Programming with C++": "https://covers.openlibrary.org/b/isbn/9789389949186-L.jpg",
        "Programming with Java: A Primer": "https://covers.openlibrary.org/b/isbn/9789353162337-L.jpg",
        "Java: The Complete Reference": "https://covers.openlibrary.org/b/isbn/9781260440232-L.jpg",
        "The C Programming Language": "https://covers.openlibrary.org/b/isbn/9780131103627-L.jpg",
        "The C++ Programming Language": "https://covers.openlibrary.org/b/isbn/9780321563842-L.jpg",
        "Higher Engineering Mathematics": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
        "Advanced Engineering Mathematics": "https://covers.openlibrary.org/b/isbn/9780470458365-L.jpg",
        "Discrete Mathematics and Its Applications": "https://covers.openlibrary.org/b/isbn/9781259676512-L.jpg",
        "Linear Algebra and Its Applications": "https://covers.openlibrary.org/b/isbn/9780030105678-L.jpg",
        "Software Engineering: A Practitioner's Approach": "https://covers.openlibrary.org/b/isbn/9780078022128-L.jpg",
        "Software Engineering": "https://covers.openlibrary.org/b/isbn/9780133943030-L.jpg",
        "Operating System Concepts": "https://covers.openlibrary.org/b/isbn/9781119800361-L.jpg",
        "Modern Operating Systems": "https://covers.openlibrary.org/b/isbn/9780133591620-L.jpg",
        "Fundamentals of Database Systems": "https://covers.openlibrary.org/b/isbn/9780136086208-L.jpg",
        "Database System Concepts": "https://covers.openlibrary.org/b/isbn/9780073523323-L.jpg",
        "Computer Networks": "https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg",
        "Data Communications and Networking": "https://covers.openlibrary.org/b/isbn/9780073376226-L.jpg",
        "Digital Logic and Computer Design": "https://covers.openlibrary.org/b/isbn/9780131989260-L.jpg",
        "Computer System Architecture": "https://covers.openlibrary.org/b/isbn/9780131755635-L.jpg",
        "Microprocessor Architecture, Programming, and Applications with the 8085": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        "Electronic Devices and Circuit Theory": "https://covers.openlibrary.org/b/isbn/9780132622264-L.jpg",
        "Signals and Systems": "https://covers.openlibrary.org/b/isbn/9780138147570-L.jpg",
        "Digital Signal Processing: Principles, Algorithms, and Applications": "https://covers.openlibrary.org/b/isbn/9780131873742-L.jpg",
        "Modern Control Engineering": "https://covers.openlibrary.org/b/isbn/9780136156734-L.jpg",
        "Artificial Intelligence: A Modern Approach": "https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg",
        "Deep Learning": "https://covers.openlibrary.org/b/isbn/9780262035613-L.jpg",
        "Pattern Recognition and Machine Learning": "https://covers.openlibrary.org/b/isbn/9780387310732-L.jpg",
        "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow": "https://covers.openlibrary.org/b/isbn/9781098125974-L.jpg",
        "Design Patterns: Elements of Reusable Object-Oriented Software": "https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg",
        "Clean Code: A Handbook of Agile Software Craftsmanship": "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
        "Introduction to Algorithms": "https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg",
        "Cracking the Coding Interview": "https://covers.openlibrary.org/b/isbn/9780984782857-L.jpg"
    }

    category_default_covers = {
        "Software Engineering": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400"
        ],
        "Artificial Intelligence": [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
            "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400",
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400"
        ],
        "Data Science": [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
        ],
        "Engineering Mathematics": [
            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
            "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400"
        ],
        "Electronics & Hardware": [
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400",
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400"
        ],
        "Computer Networks": [
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400"
        ],
        "Cybersecurity": [
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400"
        ],
        "Cloud Computing": [
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400"
        ],
        "Database Systems": [
            "https://images.unsplash.com/photo-1507842229452-7b3b3a3250b7?w=400",
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400"
        ],
        "Web & Mobile Development": [
            "https://images.unsplash.com/photo-1581291518655-9523c932694b?w=400",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"
        ],
        "Algorithms & Complexity": [
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400"
        ],
        "Management & Information Systems": [
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400"
        ]
    }

    all_books = []
    for idx, (title, author, pub, cat, yr, pages, price, desc, kws) in enumerate(raw_books_data, start=1):
        b_id = f"bk_{idx:03d}"
        isbn_num = 9780130000000 + (idx * 317)
        isbn = f"978-{str(isbn_num)[3:6]}-{str(isbn_num)[6:10]}-{str(isbn_num)[10:]}"
        
        tot = random.choice([3, 4, 5, 6])
        if idx in [3, 14, 25]:
            avail = 0
            issued = tot
            reserved = random.choice([1, 2])
            st = "OUT OF STOCK"
        elif idx % 3 == 0:
            issued = random.randint(1, tot - 1)
            avail = tot - issued
            reserved = 0
            st = "AVAILABLE"
        else:
            issued = random.randint(0, 1)
            avail = tot - issued
            reserved = 0
            st = "AVAILABLE"

        sh = shelves[(idx - 1) % len(shelves)]
        rk = racks[(idx - 1) % len(racks)]
        rw = rows[(idx - 1) % len(rows)]

        # Determine cover image
        if title in known_covers:
            cover = known_covers[title]
        else:
            cat_covers = category_default_covers.get(cat, [
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
                "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
            ])
            cover = cat_covers[(idx - 1) % len(cat_covers)]

        all_books.append({
            "_id": b_id,
            "isbn": isbn,
            "title": title,
            "subtitle": f"Academic reference work on {cat}",
            "author": author,
            "coAuthor": "",
            "publisher": pub,
            "edition": f"{random.choice(['1st', '2nd', '3rd', '4th'])} Edition",
            "publicationYear": yr,
            "category": cat,
            "subcategory": cat.split()[0],
            "language": "English",
            "pages": pages,
            "description": desc,
            "keywords": kws,
            "coverImage": cover,
            "shelf": sh,
            "rack": rk,
            "row": rw,
            "totalCopies": tot,
            "availableCopies": avail,
            "issuedCopies": issued,
            "reservedCopies": reserved,
            "price": price,
            "acquisitionDate": f"{random.choice([2023, 2024])}-{random.randint(1,12):02d}-15",
            "bookCondition": "Good" if idx % 2 == 0 else "New",
            "status": st,
            "rating": round(random.uniform(4.5, 5.0), 2),
            "ratingsCount": random.randint(12, 65),
            "timesBorrowed": random.randint(8, 75),
            "createdAt": (now - datetime.timedelta(days=random.randint(30, 200))).isoformat()
        })

    book_col.insert_many(all_books)
    print(f"+ Seeded {len(all_books)} academic books with verified metadata")

    # 5. Book Copies (Generate 400+ physical barcodes)
    copy_col = get_col("book_copies")
    copy_col.delete_many({})
    all_copies = []
    copy_count = 1
    for b in all_books:
        tot = b["totalCopies"]
        issued = b["issuedCopies"]
        reserved = b.get("reservedCopies", 0)
        clean_isbn = b["isbn"].replace("-", "")

        for i in range(tot):
            if i < issued:
                st = "ISSUED"
            elif i < issued + reserved:
                st = "RESERVED"
            else:
                st = "AVAILABLE"

            all_copies.append({
                "_id": f"copy_{copy_count:05d}",
                "bookId": b["_id"],
                "isbn": b["isbn"],
                "barcode": f"SL-BC-{clean_isbn[-6:]}-{i+1:02d}",
                "copyNumber": i + 1,
                "shelf": b["shelf"],
                "rack": b["rack"],
                "row": b["row"],
                "condition": "New" if i == 0 else "Good",
                "status": st,
                "acquisitionDate": b["acquisitionDate"]
            })
            copy_count += 1

    copy_col.insert_many(all_copies)
    print(f"+ Seeded {len(all_copies)} physical copy records with unique barcodes")

    # 6. Transactions
    tx_col = get_col("transactions")
    tx_col.delete_many({})
    txs = [
        {
            "_id": "tx_001",
            "transactionId": "TXN-2026-00101",
            "userId": "usr_stu_01",
            "userName": "Alex Chen",
            "userEmail": "student@smartlib.edu",
            "bookId": "bk_001",
            "bookTitle": all_books[0]["title"],
            "isbn": all_books[0]["isbn"],
            "copyId": "copy_00001",
            "barcode": all_copies[0]["barcode"],
            "issueDate": (now - datetime.timedelta(days=5)).isoformat(),
            "dueDate": (now + datetime.timedelta(days=9)).isoformat(),
            "returnDate": None,
            "status": "ISSUED",
            "renewalCount": 0,
            "maxRenewals": 2,
            "fineAmount": 0.0,
            "paymentStatus": "NONE",
            "issuedBy": "Marcus Aurelius Reed",
            "issuedByRole": "LIBRARIAN",
            "createdAt": (now - datetime.timedelta(days=5)).isoformat()
        },
        {
            "_id": "tx_002",
            "transactionId": "TXN-2026-00102",
            "userId": "usr_stu_01",
            "userName": "Alex Chen",
            "userEmail": "student@smartlib.edu",
            "bookId": "bk_008",
            "bookTitle": all_books[7]["title"],
            "isbn": all_books[7]["isbn"],
            "copyId": "copy_00028",
            "barcode": all_copies[27]["barcode"],
            "issueDate": (now - datetime.timedelta(days=10)).isoformat(),
            "dueDate": (now + datetime.timedelta(days=4)).isoformat(),
            "returnDate": None,
            "status": "ISSUED",
            "renewalCount": 1,
            "maxRenewals": 2,
            "fineAmount": 0.0,
            "paymentStatus": "NONE",
            "issuedBy": "Marcus Aurelius Reed",
            "issuedByRole": "LIBRARIAN",
            "createdAt": (now - datetime.timedelta(days=10)).isoformat()
        },
        {
            "_id": "tx_003",
            "transactionId": "TXN-2026-00085",
            "userId": "usr_stu_02",
            "userName": "Priya Sharma",
            "userEmail": "priya.sharma@smartlib.edu",
            "bookId": "bk_013",
            "bookTitle": all_books[12]["title"],
            "isbn": all_books[12]["isbn"],
            "copyId": "copy_00045",
            "barcode": all_copies[44]["barcode"],
            "issueDate": (now - datetime.timedelta(days=20)).isoformat(),
            "dueDate": (now - datetime.timedelta(days=4)).isoformat(),
            "returnDate": None,
            "status": "OVERDUE",
            "renewalCount": 2,
            "maxRenewals": 2,
            "fineAmount": 2.0,
            "paymentStatus": "PENDING",
            "issuedBy": "Marcus Aurelius Reed",
            "issuedByRole": "LIBRARIAN",
            "createdAt": (now - datetime.timedelta(days=20)).isoformat()
        }
    ]
    tx_col.insert_many(txs)
    print(f"+ Seeded {len(txs)} circulation transactions")

    # 7. Reservations
    res_col = get_col("reservations")
    res_col.delete_many({})
    reservations = [
        {
            "_id": "res_001",
            "reservationId": "RES-2026-0001",
            "userId": "usr_stu_03",
            "userName": "David Kim",
            "bookId": "bk_013",
            "bookTitle": all_books[12]["title"],
            "queuePosition": 1,
            "estimatedWaitDays": 4,
            "reservationDate": (now - datetime.timedelta(days=2)).isoformat(),
            "expiryDate": (now + datetime.timedelta(days=5)).isoformat(),
            "status": "WAITING",
            "createdAt": (now - datetime.timedelta(days=2)).isoformat()
        }
    ]
    res_col.insert_many(reservations)
    print("+ Seeded reservations")

    # 8. Book Requests
    req_col = get_col("book_requests")
    req_col.delete_many({})
    requests_data = [
        {
            "_id": "req_001",
            "title": "Quantum Computing Since Democritus",
            "author": "Scott Aaronson",
            "isbn": "978-0521199567",
            "category": "Computer Science",
            "reason": "Essential for quantum complexity theory course and research paper.",
            "requestedBy": "usr_stu_01",
            "requestedByName": "Alex Chen",
            "priority": "HIGH",
            "status": "APPROVED",
            "votesCount": 18,
            "adminNotes": "Approved for purchase under academic budget.",
            "createdAt": (now - datetime.timedelta(days=12)).isoformat()
        },
        {
            "_id": "req_002",
            "title": "Designing Embedded Systems with PIC Microcontrollers",
            "author": "Tim Wilmshurst",
            "isbn": "978-1856177504",
            "category": "Robotics & Embedded",
            "reason": "Required for embedded lab assignments.",
            "requestedBy": "usr_stu_03",
            "requestedByName": "David Kim",
            "priority": "MEDIUM",
            "status": "PENDING",
            "votesCount": 9,
            "adminNotes": "Under review.",
            "createdAt": (now - datetime.timedelta(days=5)).isoformat()
        }
    ]
    req_col.insert_many(requests_data)
    print("+ Seeded community requests")

    # 9. Reading Goals
    goal_col = get_col("reading_goals")
    goal_col.delete_many({})
    goal_col.insert_one({
        "_id": "goal_001",
        "userId": "usr_stu_01",
        "title": "Spring Semester Reading Challenge",
        "goalType": "SEMESTER",
        "targetBooks": 12,
        "completedBooks": 7,
        "startDate": "2026-01-10",
        "deadline": "2026-06-30",
        "status": "IN_PROGRESS",
        "createdAt": (now - datetime.timedelta(days=50)).isoformat()
    })
    print("+ Seeded reading goals")

    # 10. Reviews
    rev_col = get_col("reviews")
    rev_col.delete_many({})
    rev_col.insert_many([
        {
            "_id": "rev_001",
            "bookId": "bk_001",
            "userId": "usr_stu_01",
            "userName": "Alex Chen",
            "userAvatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
            "rating": 5,
            "comment": "Transformational read for anyone writing software professionally. Highly recommended.",
            "createdAt": (now - datetime.timedelta(days=25)).isoformat()
        },
        {
            "_id": "rev_002",
            "bookId": "bk_013",
            "userId": "usr_stu_02",
            "userName": "Priya Sharma",
            "userAvatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "rating": 5,
            "comment": "The definitive gold standard in AI education.",
            "createdAt": (now - datetime.timedelta(days=18)).isoformat()
        }
    ])
    print("+ Seeded reviews")

    # 11. Facilities
    fac_col = get_col("facilities")
    fac_col.delete_many({})
    fac_col.insert_many([
        {"_id": "fac_01", "name": "Quiet Research Pod A-01", "type": "CARREL", "capacity": 1, "floor": "2nd Floor", "amenities": ["High-Speed Wi-Fi", "Power Outlets", "Ergonomic Chair", "Desk Lamp"], "status": "AVAILABLE"},
        {"_id": "fac_02", "name": "Quiet Research Pod A-02", "type": "CARREL", "capacity": 1, "floor": "2nd Floor", "amenities": ["High-Speed Wi-Fi", "Power Outlets", "Desk Lamp"], "status": "AVAILABLE"},
        {"_id": "fac_03", "name": "Collaborative Study Room 304", "type": "ROOM", "capacity": 6, "floor": "3rd Floor", "amenities": ["Whiteboard", "4K Display TV", "Air Conditioning", "Conference Table"], "status": "AVAILABLE"},
        {"_id": "fac_04", "name": "Graduate Seminar Room 305", "type": "ROOM", "capacity": 12, "floor": "3rd Floor", "amenities": ["Projector", "Surround Audio", "Podium", "Modular Seating"], "status": "AVAILABLE"}
    ])
    print("+ Seeded facilities")

    # 12. Suppliers
    sup_col = get_col("suppliers")
    sup_col.delete_many({})
    sup_col.insert_many([
        {"_id": "sup_01", "name": "Global Academic Book Distributors Ltd", "contactPerson": "Arthur Pendelton", "email": "orders@globalacademicbooks.com", "phone": "+1-800-444-2300", "address": "Boston, MA", "status": "ACTIVE", "totalOrders": 14},
        {"_id": "sup_02", "name": "TechPress International Logistics", "contactPerson": "Elena Rostov", "email": "supply@techpressintl.org", "phone": "+1-888-512-9900", "address": "San Jose, CA", "status": "ACTIVE", "totalOrders": 9}
    ])
    print("+ Seeded suppliers")

    # 13. Notifications
    notif_col = get_col("notifications")
    notif_col.delete_many({})
    notif_col.insert_many([
        {
            "_id": "notif_001",
            "userId": "usr_stu_01",
            "title": "Welcome to Smart Library Hub",
            "message": "Welcome Alex! Explore personalized AI recommendations and reserve library study pods.",
            "type": "WELCOME",
            "isRead": False,
            "createdAt": (now - datetime.timedelta(days=60)).isoformat()
        },
        {
            "_id": "notif_002",
            "userId": "usr_stu_01",
            "title": "Book Issued Successfully",
            "message": "You have borrowed 'Clean Code: A Handbook of Agile Software Craftsmanship'.",
            "type": "BOOK_ISSUED",
            "isRead": True,
            "createdAt": (now - datetime.timedelta(days=5)).isoformat()
        }
    ])
    print("+ Seeded notifications")

    # 14. Audit Logs
    audit_col = get_col("audit_logs")
    audit_col.delete_many({})
    audit_col.insert_one({
        "_id": "aud_001",
        "userId": "usr_admin_01",
        "userName": "Dr. Eleanor Vance",
        "role": "ADMIN",
        "action": "SYSTEM_INITIALIZATION",
        "entity": "SYSTEM",
        "targetId": "GLOBAL",
        "description": "Smart Library System database seeded with 105+ academic textbooks and 400+ barcoded copies.",
        "ip": "127.0.0.1",
        "timestamp": now.isoformat()
    })
    print("+ Seeded audit logs")

    print("\n==================================================")
    print("[*] 105+ BOOKS DATABASE SEEDING COMPLETED!")
    print("==================================================")

if __name__ == "__main__":
    seed_database()
