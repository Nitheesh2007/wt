import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { bookAPI, circAPI, communityAPI } from '../services/api';
import {
  ArrowLeft,
  Star,
  MapPin,
  CalendarCheck,
  Heart,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  BookOpen
} from 'lucide-react';
import { StatusBadge, SkeletonLoader } from '../components/common/UIComponents';

export default function BookDetail({ book: initialBook, onBack, onSelectBook }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t, tCategory, tCondition, isTamil } = useLanguage();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadBookDetail() {
      if (!initialBook?._id) return;
      setLoading(true);
      try {
        const res = await bookAPI.getBookById(initialBook._id);
        if (res.success && res.data) {
          setDetailData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    }
    loadBookDetail();
  }, [initialBook?._id]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to reserve books.');
      return;
    }
    setReserving(true);
    try {
      const res = await circAPI.createReservation({ bookId: initialBook._id });
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to create reservation.');
    } finally {
      setReserving(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to manage your wishlist.');
      return;
    }
    try {
      const res = await communityAPI.toggleWishlist(initialBook._id);
      if (res.success) {
        setInWishlist(res.data.inWishlist);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Wishlist action failed.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please sign in to leave a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await communityAPI.addReview({
        bookId: initialBook._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      if (res.success) {
        toast.success('Thank you! Your academic review has been posted.');
        setReviewForm({ rating: 5, comment: '' });
        // Refresh book
        const refreshed = await bookAPI.getBookById(initialBook._id);
        if (refreshed.success) setDetailData(refreshed.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ width: 'fit-content' }}>
          <ArrowLeft size={16} /> {t('backToCatalog', 'Back to Catalog')}
        </button>
        <SkeletonLoader count={2} />
      </div>
    );
  }

  const book = detailData?.book || initialBook;
  const copies = detailData?.copies || [];
  const reviews = detailData?.reviews || [];
  const similarBooks = detailData?.similarBooks || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> {t('backToCatalog', 'Back to Catalog')}
        </button>
      </div>

      {/* Main Book Detail Banner */}
      <div className="card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
        {/* Cover column */}
        <div style={{ maxWidth: '320px', width: '100%', margin: '0 auto' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', height: '420px', background: '#1e293b' }}>
            <img
              src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'; }}
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleReserve}
              disabled={reserving || book.availableCopies > 0}
            >
              <CalendarCheck size={18} />
              {book.availableCopies > 0 ? t('copiesAvailInStacks', 'Copies Available in Stacks') : reserving ? t('reserving', 'Reserving...') : t('reserveBook', 'Reserve Book')}
            </button>

            <button
              className={`btn ${inWishlist ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleToggleWishlist}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Metadata info column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple">{tCategory(book.category)}</span>
              <StatusBadge status={book.availableCopies > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>{book.title}</h1>
            {book.subtitle && <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '4px' }}>{book.subtitle}</h3>}
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {isTamil ? 'ஆசிரியர்' : 'By'} <strong>{book.author}</strong> {book.coAuthor && `${isTamil ? 'மற்றும்' : 'with'} ${book.coAuthor}`}
            </div>
          </div>

          {/* Location Pin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <div style={{ fontSize: '0.9rem' }}>
              {isTamil ? 'நூலக அமைவிடம்' : 'Physical Location'}: <strong>{isTamil ? 'தட்டு' : 'Shelf'} {book.shelf}</strong> • <strong>{isTamil ? 'அடுக்கு' : 'Rack'} {book.rack}</strong> • <strong>{isTamil ? 'வரிசை' : 'Row'} {book.row}</strong>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            {book.description}
          </p>

          {/* Details specs table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISBN</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{book.isbn}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'பதிப்பகம்' : 'Publisher'}</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{book.publisher}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'பதிப்பு / ஆண்டு' : 'Edition / Year'}</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{book.edition} ({book.publicationYear})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'பக்கங்கள் / மொழி' : 'Pages / Language'}</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{book.pages} {isTamil ? 'பக்கங்கள்' : 'pages'} • {book.language}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Copies Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><BookOpen size={20} /> {t('copyInventoryHeader', 'Copy Inventory & Physical Status')}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isTamil ? `மொத்தம்: ${book.totalCopies} | கைவசம்: ${book.availableCopies} | வழங்கப்பட்டது: ${book.issuedCopies}` : `Total: ${book.totalCopies} | Available: ${book.availableCopies} | Issued: ${book.issuedCopies}`}
          </span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('copyNumber', 'Copy #')}</th>
                <th>{t('barcode', 'Barcode')}</th>
                <th>{t('condition', 'Condition')}</th>
                <th>{t('shelfRack', 'Shelf / Rack')}</th>
                <th>{isTamil ? 'நிலை' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {copies.map((c) => (
                <tr key={c._id}>
                  <td><strong>#{c.copyNumber}</strong></td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.barcode}</td>
                  <td>{tCondition(c.condition)}</td>
                  <td>{c.shelf} / {c.rack}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Similar Books (TF-IDF Cosine Similarity) */}
      {similarBooks.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('similarBooksTitle', 'Similar Books (TF-IDF Content Matched)')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {similarBooks.map((sim) => (
              <div
                key={sim._id}
                className="card"
                style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
                onClick={() => onSelectBook(sim)}
              >
                <div style={{ height: '140px', overflow: 'hidden', background: '#1e293b' }}>
                  <img
                    src={sim.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                    alt={sim.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'; }}
                  />
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {tCategory(sim.category)} {sim.matchConfidence && `• ${sim.matchConfidence}% ${t('matchScore', 'Match')}`}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sim.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {isTamil ? 'ஆசிரியர்' : 'By'} {sim.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Reviews & Ratings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Star size={20} style={{ color: '#f59e0b' }} /> {t('studentReviewsTitle', 'Student Reviews & Feedback')}</h3>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
            ★ {book.rating} ({reviews.length} {isTamil ? 'மதிப்புரைகள்' : 'reviews'})
          </span>
        </div>

        {/* Post review form */}
        <form onSubmit={handleReviewSubmit} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('yourRating', 'Your Academic Rating:')}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                  style={{ color: s <= reviewForm.rating ? '#f59e0b' : 'var(--border-subtle)', padding: '2px' }}
                >
                  <Star size={20} fill={s <= reviewForm.rating ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder={t('reviewPlaceholder', 'Share how this book helped your coursework, projects, or thesis research...')}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
            <Send size={15} /> {t('postReviewBtn', 'Post Academic Review')}
          </button>
        </form>

        {/* Existing reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem' }}>
              {isTamil ? 'இந்தப் புத்தகத்திற்கு முதல் கல்வி மதிப்புரையை வழங்குங்கள்!' : 'Be the first student to review this textbook!'}
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r._id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={r.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${r.userName}`} alt={r.userName} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.userName}</span>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
