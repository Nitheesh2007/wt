import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI } from '../services/api';
import { Sparkles, BookOpen, TrendingUp, Award, Layers } from 'lucide-react';
import { SkeletonLoader } from '../components/common/UIComponents';

export default function AIRecommendations({ onSelectBook, setActiveTab }) {
  const { user } = useAuth();
  const { t, tCategory, isTamil } = useLanguage();
  const [forYou, setForYou] = useState([]);
  const [becauseBorrowed, setBecauseBorrowed] = useState(null);
  const [trending, setTrending] = useState([]);
  const [deptBooks, setDeptBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      setLoading(true);
      try {
        const [forYouRes, trendRes, deptRes] = await Promise.all([
          aiAPI.getForYou(6),
          aiAPI.getTrending(),
          aiAPI.getDepartment(user?.department || 'Computer Science and Engineering')
        ]);
        if (forYouRes.success) setForYou(forYouRes.data || []);
        if (trendRes.success) setTrending(trendRes.data || []);
        if (deptRes.success) setDeptBooks(deptRes.data || []);

        if (user) {
          try {
            const becRes = await aiAPI.getBecauseYouBorrowed();
            if (becRes.success) setBecauseBorrowed(becRes.data);
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, [user]);

  const handleBookClick = (b) => {
    onSelectBook(b);
    setActiveTab('book-detail');
  };

  const renderBookGrid = (books) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
      {books.map((b) => (
        <div
          key={b._id}
          className="card"
          style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
          onClick={() => handleBookClick(b)}
        >
          <div style={{ height: '160px', overflow: 'hidden', background: '#1e293b', position: 'relative' }}>
            <img
              src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
              alt={b.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'; }}
            />
            {b.matchConfidence && (
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(99, 102, 241, 0.9)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px'
                }}
              >
                {b.matchConfidence}% {t('matchScore', 'Match')}
              </span>
            )}
          </div>
          <div style={{ padding: '1.15rem' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 700 }}>
              {tCategory(b.category)}
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {b.title}
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isTamil ? 'ஆசிரியர்' : 'By'} {b.author}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SkeletonLoader count={4} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>{isTamil ? 'Scikit-Learn TF-IDF & கொசைன் ஒற்றுமை இயந்திரம்' : 'Scikit-Learn TF-IDF & Cosine Similarity Engine'}</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('aiRecsTitle', 'Personalized AI Recommendations')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('aiRecsSub', 'Dynamically generated interest vector based on your curriculum, borrowing history, and syllabus keywords.')}
        </p>
      </div>

      {/* Recommended For You */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Award size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {t('recommendedForYou', 'Recommended For You')}
          </h2>
        </div>
        {renderBookGrid(forYou)}
      </div>

      {/* Because You Borrowed */}
      {becauseBorrowed?.sourceBook && becauseBorrowed?.recommendations?.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Layers size={20} style={{ color: '#0ea5e9' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              {isTamil ? `நீங்கள் கடன் வாங்கியதால்: "${becauseBorrowed.sourceBook.title}"` : `Because You Borrowed "${becauseBorrowed.sourceBook.title}"`}
            </h2>
          </div>
          {renderBookGrid(becauseBorrowed.recommendations)}
        </div>
      )}

      {/* Department Trends */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <BookOpen size={20} style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {t('curriculumCore', 'Curriculum Core')}: {user?.department || 'Computer Science and Engineering'}
          </h2>
        </div>
        {renderBookGrid(deptBooks)}
      </div>

      {/* Trending Books */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <TrendingUp size={20} style={{ color: '#10b981' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {t('trendingAcrossCampus', 'Trending Across Campus')}
          </h2>
        </div>
        {renderBookGrid(trending)}
      </div>
    </div>
  );
}
