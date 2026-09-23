# AI-POWERED SMART LIBRARY MANAGEMENT AND PERSONALIZED RECOMMENDATION SYSTEM
### Master of Science in Software Systems — Enterprise Academic Capstone Project

A complete, production-grade, end-to-end Smart Library Automation System featuring:
- **Frontend**: React 18 + Vite + Lucide Icons + Custom Glassmorphism Design System (Dark/Light Mode)
- **Backend**: Python 3.13 + Flask REST API + JWT Authentication + bcrypt + Role-Based Access Control
- **Database**: MongoDB Atlas Integration with persistent failover store
- **AI / ML**: Scikit-Learn TF-IDF Vectorization, Cosine Similarity Content Matching, Loan Demand Forecasting
- **OCR**: Tesseract Optical Character Recognition & 10/13-digit ISBN extraction with confidence scoring
- **Reports**: ReportLab PDF Generation & CSV Ingestion/Exporting
- **Circulation**: Automated issue/return/renew workflows, fine calculations, reservation queues, and facility bookings

---

## 🚀 Live Demo Credentials

| Role | Email Address | Password | Permissions / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartlib.edu` | `Admin@12345` | Full administrative control, user & librarian management, procurement acquisitions, audit logs, system parameters, health telemetry |
| **Librarian** | `librarian@smartlib.edu` | `Librarian@12345` | Circulation desk (issue/return/renew), book cataloging, OCR scanner, fine collection, student requests processing |
| **Student** | `student@smartlib.edu` | `Student@12345` | Catalog browsing, personalized AI recommendations, AI library chatbot, reading challenges & goals, book reservation, study seat booking |

*(Quick demo buttons are also embedded on the login page for instantaneous 1-click access)*

---

## 🛠️ Technology Architecture

```
[ React 18 + Vite Client ]  (Port 5173)
           │
           │ REST JSON / Bearer JWT
           ▼
[ Python Flask Application ] (Port 5000)
    ├── Auth & RBAC Middleware
    ├── Scikit-Learn TF-IDF & Cosine Similarity Engine
    ├── Demand Forecasting & Health Scoring Model
    ├── Natural Language Library Chatbot
    ├── Tesseract OCR & ISBN Regex Heuristics
    └── ReportLab PDF Generator
           │
           │ PyMongo Adapter
           ▼
[ MongoDB Atlas / Database Layer ]
    ├── 23 Collections (users, books, book_copies, transactions, etc.)
    └── Fully indexed on ISBN, Email, Student ID, Status, Transaction ID
```

---

## 📂 Project Structure

```
e:\wt\
├── .env                         # Server environment configuration
├── .env.example                 # Configuration template
├── requirements.txt             # Python backend dependencies
├── test_workflow.py             # Automated end-to-end integration test suite
│
├── database/
│   └── seed.py                  # Realistic database seeder for all 23 collections
│
├── backend/
│   ├── app.py                   # Flask server entry point & centralized error handlers
│   ├── data/                    # Document store failover data directory
│   ├── uploads/                 # Storage for covers and OCR scans
│   ├── models/
│   │   └── db.py                # MongoDB Atlas connection manager & PyMongo failover adapter
│   ├── middleware/
│   │   └── auth.py              # JWT authentication & audit logging middleware
│   ├── ai/
│   │   ├── recommender.py       # TF-IDF Vectorizer + Cosine Similarity Recommender
│   │   ├── demand_predictor.py  # Trend analysis & stock shortage prediction
│   │   ├── chatbot.py           # NLP Intent parser querying live database
│   │   └── ocr_service.py       # Tesseract OCR & ISBN extraction engine
│   ├── reports/
│   │   └── pdf_generator.py     # ReportLab PDF styling & layout generator
│   └── routes/
│       ├── auth_routes.py       # Login, register, profile, password reset
│       ├── book_routes.py       # Book CRUD, copies, search, CSV import/export
│       ├── circulation_routes.py# Issue, return, renew, reservations, fines
│       ├── community_routes.py  # Book requests, community voting, wishlist, reviews
│       ├── student_routes.py    # Reading stats, goals, facility seat booking
│       ├── ai_routes.py         # AI endpoints (recommendations, predictions, chatbot, OCR)
│       └── admin_routes.py      # Users, librarians, suppliers, acquisitions, audit logs, health
│
└── frontend/
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite dev server with proxy to backend
    ├── index.html               # Web application HTML entry point
    └── src/
        ├── main.jsx             # React root mount
        ├── App.jsx              # Master application coordinator
        ├── index.css            # Custom CSS Design System (Dark/Light themes)
        ├── context/
        │   ├── AuthContext.jsx  # JWT state & authentication management
        │   ├── ThemeContext.jsx # Theme switcher with persistence
        │   └── ToastContext.jsx # Global toast notifications
        ├── services/
        │   └── api.js           # API client with token interceptor
        ├── components/
        │   ├── layout/          # Navbar, Sidebar, Footer
        │   └── common/          # Modal, ConfirmationModal, UIComponents
        └── pages/
            ├── LandingPage.jsx  # Public showcase, stats, and catalog preview
            ├── AuthPages.jsx    # Login, Register, Profile, ForgotPassword
            ├── AdminDashboard.jsx # Admin KPIs, charts, and AI inventory alerts
            ├── BookCatalog.jsx  # Catalog search, category filters, pagination
            ├── BookDetail.jsx   # Detailed book view, copies, reservation, reviews
            ├── BookManagement.jsx # Inventory CRUD & CSV import/export
            ├── OCRScannerPage.jsx # OCR image scan and confirmation
            ├── CirculationPage.jsx # Issue/Return/Renew desk & receipts
            ├── AIRecommendations.jsx # Personalized TF-IDF recommendations
            ├── AIAnalyticsPage.jsx # Demand forecasting & inventory health
            ├── AIAssistantPage.jsx # Conversational AI chatbot
            ├── StudentPortal.jsx # Reading goals tracker & wishlist
            ├── FacilitiesAndCommunity.jsx # Facilities, requests, and fines
            └── AdminOperations.jsx # Users, librarians, suppliers, audit logs, health
```

---

## ⚙️ Setup and Installation

### 1. Backend Setup
```bash
# Verify Python 3.9+ or Python 3.13 is installed
python --version

# Install dependencies
pip install -r requirements.txt

# Seed database with realistic academic data
python database/seed.py

# Run the Flask REST API server (Port 5000)
python backend/app.py
```

### 2. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

Visit: **`http://localhost:5173/`**

---

## 🌐 Connecting to MongoDB Atlas

By default, the application is pre-configured with a resilient persistent store that operates offline out-of-the-box. To connect directly to your **MongoDB Atlas Cluster**:

1. Open `.env` in the root folder.
2. Replace `MONGO_URI` with your connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_library?retryWrites=true&w=majority
```
3. Restart the backend server. The database layer will connect directly to Atlas and initialize all 23 collections.

---

## 🧪 Automated Testing
Run the included end-to-end integration test suite:
```bash
python test_workflow.py
```
Validates:
- `GET /api/health` status telemetry
- Admin JWT authentication
- Book Issue transaction code generation
- Book Return and fine calculation
- ReportLab PDF generation
- NLP AI Assistant database query accuracy

---

## 📜 Academic Project Notice
Developed for M.Sc Software Systems curriculum requirements. Complete separation of concerns, robust error handling, database-backed dynamic data, and professional user experience.
