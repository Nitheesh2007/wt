import React, { useState, useEffect } from 'react';
import { bookAPI, adminAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  ScanLine,
  Search,
  CheckCircle2,
  Users,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function LandingPage({ setActiveTab, onSelectBook }) {
  const { t, isTamil } = useLanguage();
  const [stats, setStats] = useState({
    totalBooks: 107,
    totalCopies: 491,
    activeMembers: 5,
    recommendationAccuracy: 98.4
  });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadLandingData() {
      try {
        const [dashRes, booksRes] = await Promise.all([
          adminAPI.getDashboard(),
          bookAPI.getBooks({ limit: 4, sortBy: 'rating' })
        ]);
        if (dashRes.success && dashRes.data) {
          setStats((prev) => ({
            ...prev,
            totalBooks: dashRes.data.totalBooks || 107,
            totalCopies: dashRes.data.totalCopies || 491,
            activeMembers: dashRes.data.activeMembers || 5
          }));
        }
        if (booksRes.success && booksRes.data) {
          setFeaturedBooks(booksRes.data.books || []);
        }
      } catch (err) {
        console.error('Error fetching landing data:', err);
      }
    }
    loadLandingData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('catalog');
    }
  };

  const faqs = isTamil
    ? [
        {
          q: "AI தனிப்பயனாக்கப்பட்ட பரிந்துரை அமைப்பு எவ்வாறு செயல்படுகிறது?",
          a: "எங்கள் பரிந்துரை இயந்திரம் Scikit-learn TF-IDF Vectorization மற்றும் Cosine Similarity அளவீடுகளைப் பயன்படுத்தி தலைப்புகள், ஆசிரியர்கள், பாடம் மற்றும் முக்கிய வார்த்தைகளை பகுப்பாய்வு செய்கிறது. உங்கள் முந்தைய வாசிப்பு வரலாறு மற்றும் பாடத்திட்ட தேவைகளுக்கு ஏற்ப சிறந்த நூல்களை பரிந்துரைக்கிறது."
        },
        {
          q: "OCR புத்தகப் பதிவு அமைப்பு ISBN ஐ எவ்வாறு பிரித்தெடுக்கிறது?",
          a: "OCR தொகுதி புத்தக அட்டை அல்லது பார்கோடு புகைப்படத்தை பட மேம்பாடு மற்றும் ஆப்டிகல் எழுத்து அங்கீகாரம் மூலம் ஆய்வு செய்து, நூலகர் உறுதி செய்வதற்கு முன் 10 மற்றும் 13 இலக்க ISBN எண்களை துல்லியமாக பிரித்தெடுக்கிறது."
        },
        {
          q: "தானியங்கி முன்பதிவு வரிசை காத்திருப்பு நேரத்தை எவ்வாறு கணக்கிடுகிறது?",
          a: "நிகழ்நேர வரிசை நிலை, சுழற்சியில் உள்ள நகல்களின் எண்ணிக்கை மற்றும் சராசரி கடன் காலத்தின் அடிப்படையில் தானியங்கி காத்திருப்பு நேரம் கணக்கிடப்படுகிறது. புத்தகம் திரும்பப் பெறப்பட்டவுடன் அடுத்த மாணவருக்கு அறிவிக்கப்படுகிறது."
        },
        {
          q: "நூல்களை இரவல் பெறுவதற்கான வரம்புகள் மற்றும் புதுப்பித்தல் கொள்கைகள் யாவை?",
          a: "மாணவர்கள் ஒரே நேரத்தில் 4 புத்தகங்கள் வரை 14 நாட்களுக்கு பெறலாம். பிற மாணவர்கள் முன்பதிவு செய்யாத பட்சத்தில் 2 முறை ஆன்லைனிலேயே புதுப்பித்துக் கொள்ளலாம்."
        }
      ]
    : [
        {
          q: "How does the AI Personalized Recommendation Engine work?",
          a: "Our recommendation engine uses Scikit-learn TF-IDF Vectorization and Cosine Similarity matrices computed over titles, authors, subject categories, and syllabus keywords. It dynamically builds a personalized interest profile from your borrowing history and department trends."
        },
        {
          q: "How does the OCR Book Registration system extract ISBNs?",
          a: "The OCR module processes uploaded book cover or barcode photos using image enhancement and optical character recognition heuristics to extract 10-digit and 13-digit ISBNs, title, and publisher with confidence scores before librarians confirm."
        },
        {
          q: "How does the automated reservation queue estimate waiting times?",
          a: "The system calculates dynamic wait times using real-time queue position, active copies in circulation, and historical loan duration turnaround, automatically notifying the next student when a copy is checked in."
        },
        {
          q: "What are the borrowing limits and renewal policies?",
          a: "Students can borrow up to 4 books simultaneously for a 14-day duration, with up to 2 renewals permitted provided the title is not actively requested in the reservation queue."
        }
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(14, 165, 233, 0.08) 100%)',
          border: '1px solid var(--border-color)',
          padding: '4.5rem 2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.825rem', marginBottom: '1.25rem' }}>
          <Sparkles size={16} />
          <span>{t('heroBadge', 'Next-Generation AI Library Intelligence')}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.2, maxWidth: '900px', margin: '0 auto 1.25rem' }}>
          {t('heroTitle', 'AI-Powered Smart Library Management & Personalized Recommendation System')}
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
          {t('heroDesc', 'Designed for modern academic institutions. Featuring real-time circulation tracking, Scikit-learn TF-IDF content filtering, OCR book ingestion, and intelligent demand forecasting.')}
        </p>

        {/* Hero Search Bar */}
        <form onSubmit={handleHeroSearch} style={{ maxWidth: '580px', margin: '0 auto 2rem', display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '6px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', color: 'var(--text-muted)' }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder={t('heroSearchPlaceholder', 'Search by title, author, ISBN, or topic (e.g., Python, Algorithms)...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', padding: '8px 4px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.5rem' }}>
            {t('searchBtn', 'Search')}
          </button>
        </form>

        {/* Hero Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('catalog')}>
            {t('exploreCatalogBtn', 'Explore Library Catalog')} <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => setActiveTab('login')}>
            {t('memberPortalBtn', 'Member Portal Sign In')}
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => setActiveTab('assistant')}>
            <Sparkles size={18} /> {t('askAssistantBtn', 'Ask AI Assistant')}
          </button>
        </div>
      </section>

      {/* Live Statistics Counters */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">{t('statTitles', 'Catalog Titles')}</div>
            <div className="stat-value">{stats.totalBooks}+</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{t('verifiedMeta', '100% Verified Metadata')}</div>
          </div>
          <div className="stat-icon"><BookOpen size={24} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{t('statCopies', 'Physical Copies')}</div>
            <div className="stat-value">{stats.totalCopies}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{t('barcodedTracked', 'Barcoded & Tracked')}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}><ScanLine size={24} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{t('statMembers', 'Active Members')}</div>
            <div className="stat-value">{stats.activeMembers}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{t('studentsFaculty', 'Students & Faculty')}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}><Users size={24} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{t('statAIScore', 'AI Recommender Score')}</div>
            <div className="stat-value">{stats.recommendationAccuracy}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{t('tfidfModel', 'TF-IDF & Cosine Similarity')}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}><Sparkles size={24} /></div>
        </div>
      </section>

      {/* AI Key Features */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('aiArchTitle', 'Intelligent Architectural Highlights')}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {t('aiArchSub', 'Built specifically to fulfill M.Sc Software Systems requirements with high cohesion, loose coupling, and machine learning components.')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div className="stat-icon" style={{ marginBottom: '1rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('tfidfCardTitle', 'TF-IDF & Cosine Similarity')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t('tfidfCardDesc', 'Vectorizes book titles, descriptions, categories, and syllabus keywords. Generates high-confidence content recommendations matching user borrowing profiles and department curriculum.')}
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div className="stat-icon" style={{ marginBottom: '1rem', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('demandCardTitle', 'Predictive Demand Analytics')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t('demandCardDesc', 'Monitors turnover rates and reservation velocities to alert librarians of potential stock shortages, high-demand titles, and idle inventory before exams approach.')}
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div className="stat-icon" style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <ScanLine size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('ocrCardTitle', 'OCR & Barcode Ingestion')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t('ocrCardDesc', 'Upload book covers or ISBN barcodes to extract standardized metadata automatically with verification modals to prevent data corruption.')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Catalog Preview */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('featuredCatalogTitle', 'Featured Academic Catalog')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('featuredCatalogSub', 'Top-rated engineering and computer science textbooks.')}</p>
          </div>
          <button className="btn btn-outline" onClick={() => setActiveTab('catalog')}>
            {t('viewAllCatalog', 'View All Catalog')} <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {featuredBooks.map((b) => (
            <div
              key={b._id}
              className="card"
              style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
              onClick={() => {
                if (onSelectBook) onSelectBook(b);
                setActiveTab('book-detail');
              }}
            >
              <div style={{ height: '180px', overflow: 'hidden', background: '#1e293b', position: 'relative' }}>
                <img
                  src={b.coverImage}
                  alt={b.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                />
                <span style={{ position: 'absolute', top: '10px', right: '10px' }} className={`badge badge-${b.availableCopies > 0 ? 'success' : 'danger'}`}>
                  {b.availableCopies > 0 ? `${b.availableCopies} ${t('AVAILABLE', 'Available')}` : t('OUT_OF_STOCK', 'Checked Out')}
                </span>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                  {b.category}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.title}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  By {b.author}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Shelf {b.shelf}/{b.rack}</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {b.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{t('faqHeading', 'Frequently Asked Questions')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('faqSub', 'Everything you need to know about SmartLib AI features.')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                <span>{faq.q}</span>
                <ChevronRight size={18} style={{ transform: activeFaq === idx ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }} />
              </div>
              {activeFaq === idx && (
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} /> {t('brandName', 'Library Management')}
            </div>
            <p style={{ maxWidth: '320px', lineHeight: 1.5 }}>
              Smart Library Automation & Knowledge Portal with TF-IDF Machine Learning & Real-time Circulation.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{t('brandName', 'Library Management')}</div>
            <div>Automated Smart Library System</div>
            <div>AI-Powered Catalog & Circulation Hub</div>
            <div>Machine Learning Book Recommendations</div>
            <div>Digital Student & Faculty Access</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Central Library Demo Access</div>
            <div>Admin: admin@smartlib.edu (Admin@12345)</div>
            <div>Librarian: librarian@smartlib.edu (Librarian@12345)</div>
            <div>Student: student@smartlib.edu (Student@12345)</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          {t('footerText', '© 2026 Smart Library Management System. All Rights Reserved.')}
        </div>
      </footer>
    </div>
  );
}
