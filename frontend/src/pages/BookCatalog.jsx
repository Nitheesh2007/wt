import React, { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Search, Filter, BookOpen, Star, Sparkles, MapPin, Grid, List as ListIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/common/UIComponents';

export default function BookCatalog({ onSelectBook, setActiveTab }) {
  const { t, tCategory, isTamil } = useLanguage();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('ALL');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await bookAPI.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [search, category, availability, sortBy, page]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await bookAPI.getBooks({
        search,
        category: category === 'All' ? '' : category,
        availability: availability === 'ALL' ? '' : availability,
        sortBy,
        page,
        limit: 12
      });
      if (res.success && res.data) {
        setBooks(res.data.books || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book) => {
    onSelectBook(book);
    setActiveTab('book-detail');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Search Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{t('catalogTitle', 'Academic Digital Catalog')}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isTamil ? `நூலகத்தில் உள்ள ${totalCount} பாடப்புத்தகங்கள், குறிப்பு நூல்கள் மற்றும் பாடத்திட்ட ஆவணங்களை ஆராயுங்கள்.` : `Explore ${totalCount} curated textbooks, technical references, and university course materials.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} /> {isTamil ? 'கட்டம்' : 'Grid'}
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={16} /> {isTamil ? 'பட்டியல்' : 'List'}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search Input */}
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{isTamil ? 'நூல்களைத் தேடுக' : 'Search Catalog'}</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder={isTamil ? "தலைப்பு, ஆசிரியர், ISBN, பாடம் அல்லது தட்டு வாரியாகத் தேடுக..." : "Search by title, author, ISBN, publisher, or shelf..."}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{t('subjectCategory', 'Subject Category')}</label>
              <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="All">{t('allCategories', 'All Categories')}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{tCategory(c.name)}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{t('availability', 'Availability')}</label>
              <select className="form-select" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }}>
                <option value="ALL">{t('allStatuses', 'All Statuses')}</option>
                <option value="AVAILABLE">{t('availToBorrow', 'Available to Borrow')}</option>
                <option value="OUT_OF_STOCK">{t('checkedOut', 'Currently Checked Out')}</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{t('sortBy', 'Sort By')}</label>
              <select className="form-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                <option value="relevance">{t('sortRelevant', 'Top Rated & Relevant')}</option>
                <option value="title">{t('sortTitle', 'Title (A - Z)')}</option>
                <option value="most_borrowed">{t('sortMostBorrowed', 'Most Borrowed')}</option>
                <option value="recently_added">{t('sortRecent', 'Recently Added')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Book Grid / List */}
      {loading ? (
        <SkeletonLoader count={6} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={isTamil ? "தேடலுக்கு பொருந்தும் நூல்கள் எதுவும் கிடைக்கவில்லை" : "No books match your criteria"}
          description={isTamil ? "உங்கள் தேடல் சொல்லை மாற்றவும் அல்லது வடிகட்டிகளை அழிக்கவும்." : "Try modifying your search query or clearing applied category filters."}
          action={
            <button className="btn btn-secondary" onClick={() => { setSearch(''); setCategory('All'); setAvailability('ALL'); }}>
              {isTamil ? "வடிகட்டிகளை மீட்டமைக்க" : "Clear All Filters"}
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {books.map((b) => (
            <div
              key={b._id}
              className="card"
              style={{ cursor: 'pointer', overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
              onClick={() => handleBookClick(b)}
            >
              <div style={{ height: '200px', overflow: 'hidden', background: '#1e293b', position: 'relative' }}>
                <img
                  src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}
                  alt={b.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'; }}
                />
                <span style={{ position: 'absolute', top: '10px', right: '10px' }} className={`badge badge-${b.availableCopies > 0 ? 'success' : 'danger'}`}>
                  {b.availableCopies > 0 ? `${b.availableCopies} ${t('copiesInStock', 'in stock')}` : t('reservedOut', 'Reserved/Out')}
                </span>
                <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.725rem', fontWeight: 600 }}>
                  {isTamil ? 'தட்டு' : 'Shelf'}: {b.shelf}/{b.rack}
                </span>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  {tCategory(b.category)}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {b.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {isTamil ? 'ஆசிரியர்' : 'By'} {b.author}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ISBN: {b.isbn?.slice(-8) || '-'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                    <Star size={14} fill="#f59e0b" />
                    <span>{b.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{isTamil ? 'தலைப்பு & ஆசிரியர்' : 'Title & Author'}</th>
                <th>{isTamil ? 'வகை' : 'Category'}</th>
                <th>ISBN</th>
                <th>{isTamil ? 'அமைவிடம்' : 'Location'}</th>
                <th>{isTamil ? 'கிடைக்கும் நகல்கள்' : 'Copies Available'}</th>
                <th>{isTamil ? 'மதிப்பீடு' : 'Rating'}</th>
                <th>{isTamil ? 'செயல்' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{b.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{isTamil ? 'ஆசிரியர்' : 'By'} {b.author} • {b.publisher}</div>
                  </td>
                  <td><span className="badge badge-info">{b.category}</span></td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.isbn}</td>
                  <td>{b.shelf} / {isTamil ? 'அடுக்கு' : 'Rack'} {b.rack}</td>
                  <td>
                    <StatusBadge status={b.availableCopies > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'} />
                    <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ({b.availableCopies}/{b.totalCopies})
                    </span>
                  </td>
                  <td style={{ color: '#f59e0b', fontWeight: 700 }}>★ {b.rating}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleBookClick(b)}>
                      {isTamil ? 'விவரங்களைக் காண்க' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> {isTamil ? 'முந்தைய' : 'Previous'}
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {isTamil ? `பக்கம் ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {isTamil ? 'அடுத்தது' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
