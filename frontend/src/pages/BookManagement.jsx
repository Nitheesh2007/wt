import React, { useState, useEffect, useRef } from 'react';
import { bookAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Copy,
  Archive,
  RefreshCw,
  Search,
  BookOpen,
  Camera,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { StatusBadge, SkeletonLoader } from '../components/common/UIComponents';

export default function BookManagement() {
  const { toast } = useToast();
  const { t, tCategory, isTamil } = useLanguage();
  const fileInputRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Forms
  const [formData, setFormData] = useState(getEmptyForm());
  const [uploadingCover, setUploadingCover] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);

  function getEmptyForm() {
    return {
      title: '',
      subtitle: '',
      isbn: '',
      author: '',
      publisher: 'Pearson Education',
      edition: '1st Edition',
      publicationYear: 2024,
      category: 'Software Engineering',
      totalCopies: 3,
      shelf: 'Stack-A',
      rack: 'R-01',
      row: '1',
      price: 49.99,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      description: 'Academic reference text.'
    };
  }

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, [search, category]);

  const loadCategories = async () => {
    try {
      const res = await bookAPI.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {}
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await bookAPI.getBooks({ search, category, limit: 100 });
      if (res.success && res.data) setBooks(res.data.books || []);
    } catch (err) {
      toast.error(isTamil ? 'புத்தகப் பதிவேடுகளை ஏற்ற முடியவில்லை.' : 'Failed to load catalog records.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Automatic Cover Fetcher
  const handleAutoFetchCover = async () => {
    const rawIsbn = (formData.isbn || '').trim();
    const cleanIsbn = rawIsbn.replace(/[^0-9X]/gi, '');

    if (!cleanIsbn && !formData.title) {
      toast.warning(
        isTamil
          ? 'அட்டைப் படத்தைப் பெற தயவுசெய்து ISBN அல்லது தலைப்பை உள்ளிடவும்.'
          : 'Please enter an ISBN or Book Title to auto-fetch a cover.'
      );
      return;
    }

    setFetchingCover(true);
    try {
      // 1st Priority: Open Library Covers API by ISBN
      if (cleanIsbn.length >= 10) {
        const testUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        setFormData((prev) => ({ ...prev, coverImage: testUrl }));
        toast.success(
          isTamil
            ? `OpenLibrary மூலம் அட்டைப் படம் இணைக்கப்பட்டது (ISBN: ${cleanIsbn})`
            : `Cover image linked from OpenLibrary (ISBN: ${cleanIsbn})`
        );
      } else {
        // Fallback: Curated high-res academic cover based on category
        const categoryCovers = {
          'Software Engineering': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
          'Artificial Intelligence': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
          'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          'Computer Networks': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
          'Cybersecurity': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
          'Engineering Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
          'Electronics & Hardware': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
          'Database Systems': 'https://images.unsplash.com/photo-1507842229452-7b3b3a3250b7?w=400',
          'Management & Information Systems': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400'
        };
        const fallbackUrl = categoryCovers[formData.category] || 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400';
        setFormData((prev) => ({ ...prev, coverImage: fallbackUrl }));
        toast.success(
          isTamil
            ? 'துறை சார்ந்த உயர்தர அட்டைப் படம் அமைக்கப்பட்டது.'
            : 'Subject-matched academic cover image assigned.'
        );
      }
    } catch (err) {
      toast.error(isTamil ? 'அட்டைப் படத்தை எடுப்பதில் தோல்வி.' : 'Failed to fetch cover image.');
    } finally {
      setFetchingCover(false);
    }
  };

  // 2. Manual Photo Upload Handler
  const handleManualPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning(isTamil ? 'படக் கோப்பை மட்டுமே பதிவேற்றவும் (JPG, PNG, WEBP).' : 'Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({ ...prev, coverImage: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);

    // Upload to server endpoint
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('cover', file);
      const res = await bookAPI.uploadCover(fd);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({ ...prev, coverImage: res.imageUrl }));
        toast.success(isTamil ? 'அட்டைப் படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Cover photo uploaded and linked successfully!');
      }
    } catch (err) {
      // Local Data URL preview will still remain active
      toast.info(isTamil ? 'உள்ளூர் முன்னோட்டம் இயக்கப்பட்டது.' : 'Local cover preview active.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await bookAPI.createBook(formData);
      if (res.success) {
        toast.success(isTamil ? 'புத்தகம் மற்றும் பார்கோடுகள் வெற்றிகரமாக உருவாக்கப்பட்டன!' : 'Book created successfully with barcodes generated!');
        setIsAddOpen(false);
        setFormData(getEmptyForm());
        loadBooks();
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'புத்தகத்தை உருவாக்குவதில் தோல்வி.' : 'Failed to create book.'));
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedBook?._id) return;
    try {
      const res = await bookAPI.updateBook(selectedBook._id, formData);
      if (res.success) {
        toast.success(isTamil ? 'புத்தக விவரங்கள் புதுப்பிக்கப்பட்டன.' : 'Book record updated successfully.');
        setIsEditOpen(false);
        loadBooks();
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'புதுப்பிப்பதில் தோல்வி.' : 'Failed to update book.'));
    }
  };

  const handleDelete = async () => {
    if (!selectedBook?._id) return;
    try {
      const res = await bookAPI.deleteBook(selectedBook._id);
      if (res.success) {
        toast.success(isTamil ? 'புத்தகம் வெற்றிகரமாக நீக்கப்பட்டது.' : 'Book deleted successfully.');
        setIsDeleteOpen(false);
        loadBooks();
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'நீக்குவதில் தோல்வி.' : 'Failed to delete book.'));
    }
  };

  const handleDuplicate = async (book) => {
    try {
      const duplicated = {
        ...book,
        title: `${book.title} (${isTamil ? 'நகல்' : 'Copy'})`,
        isbn: `${book.isbn.replace(/\D/g, '').slice(0, 10)}${Math.floor(100 + Math.random() * 900)}`
      };
      delete duplicated._id;
      const res = await bookAPI.createBook(duplicated);
      if (res.success) {
        toast.success(`${isTamil ? 'நகலெடுக்கப்பட்டது' : 'Duplicated'}: ${duplicated.title}`);
        loadBooks();
      }
    } catch (err) {
      toast.error(isTamil ? 'நகலெடுப்பதில் தோல்வி.' : 'Duplicate failed.');
    }
  };

  const handleArchive = async (book) => {
    try {
      const res = book.status === 'ARCHIVED' ? await bookAPI.restoreBook(book._id) : await bookAPI.archiveBook(book._id);
      if (res.success) {
        toast.success(book.status === 'ARCHIVED' ? (isTamil ? 'மீட்டமைக்கப்பட்டது.' : 'Book restored.') : (isTamil ? 'காப்பகப்படுத்தப்பட்டது.' : 'Book archived.'));
        loadBooks();
      }
    } catch (err) {
      toast.error(isTamil ? 'நிலை புதுப்பித்தல் தோல்வி.' : 'Status update failed.');
    }
  };

  const handleCSVImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportReport(null);
    try {
      const form = new FormData();
      form.append('file', importFile);
      const res = await bookAPI.importCSV(form);
      if (res.success) {
        setImportReport(res.data);
        toast.success(res.message);
        loadBooks();
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'CSV கோப்பு பிழை.' : 'CSV import error.'));
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/books/export-csv', '_blank');
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title || '',
      subtitle: book.subtitle || '',
      isbn: book.isbn || '',
      author: book.author || '',
      publisher: book.publisher || '',
      edition: book.edition || '1st Edition',
      publicationYear: book.publicationYear || 2024,
      category: book.category || 'Software Engineering',
      totalCopies: book.totalCopies || 1,
      shelf: book.shelf || 'Stack-A',
      rack: book.rack || 'R-01',
      row: book.row || '1',
      price: book.price || 40.0,
      coverImage: book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      description: book.description || ''
    });
    setIsEditOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hidden File Input for Manual Cover Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleManualPhotoUpload}
      />

      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {t('masterInventoryTitle', 'Master Book Inventory Management')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isTamil
              ? 'முழுமையான CRUD, தானியங்கி பார்கோடு உருவாக்கம், அட்டைப் படம் சேர்த்தல் மற்றும் CSV பதிவேற்றம்.'
              : 'Full CRUD, automatic barcode generation, cover photos, shelf allocation, and batch CSV ingestion.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setFormData(getEmptyForm()); setIsAddOpen(true); }}>
            <Plus size={16} /> {t('addNewBookBtn', 'Add New Book')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setImportReport(null); setIsImportOpen(true); }}>
            <Upload size={16} /> {t('batchCSVImportBtn', 'Batch CSV Import')}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
            <Download size={16} /> {t('exportCSVBtn', 'Export CSV')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder={t('filterPlaceholder', 'Filter by title, author, ISBN...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '240px' }}>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t('allCategories', 'All Categories')}</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{tCategory(c.name)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <SkeletonLoader type="table" count={6} />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t('coverPhoto', 'Cover')}</th>
                <th>{isTamil ? 'புத்தக தலைப்பு & ஆசிரியர்' : 'Book Title & Details'}</th>
                <th>{t('isbn', 'ISBN')}</th>
                <th>{isTamil ? 'வகை' : 'Category'}</th>
                <th>{isTamil ? 'அமைவிடம்' : 'Shelf / Rack'}</th>
                <th>{isTamil ? 'பிரதிகள் (கைவசம்/மொத்தம்)' : 'Copies (Avail/Tot)'}</th>
                <th>{isTamil ? 'நிலை' : 'Status'}</th>
                <th style={{ textAlign: 'right' }}>{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ width: '40px', height: '56px', borderRadius: '4px', overflow: 'hidden', background: '#1e293b' }}>
                      <img
                        src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                        alt={b.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'; }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{b.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {isTamil ? 'ஆசிரியர்' : 'By'} {b.author}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.isbn}</td>
                  <td><span className="badge badge-info">{tCategory(b.category)}</span></td>
                  <td>{b.shelf} / {b.rack} ({isTamil ? 'வரிசை' : 'Row'} {b.row})</td>
                  <td>
                    <strong>{b.availableCopies}</strong> / {b.totalCopies}
                  </td>
                  <td><StatusBadge status={b.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(b)} title={t('edit', 'Edit')}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDuplicate(b)} title={t('duplicate', 'Duplicate')}>
                        <Copy size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleArchive(b)} title={b.status === 'ARCHIVED' ? t('restore', 'Restore') : t('archive', 'Archive')}>
                        {b.status === 'ARCHIVED' ? <RefreshCw size={14} /> : <Archive size={14} />}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setSelectedBook(b); setIsDeleteOpen(true); }} title={t('delete', 'Delete')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Book Modal with Automatic & Manual Image Cover System */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => { setIsAddOpen(false); setIsEditOpen(false); }}
        title={isAddOpen ? (isTamil ? 'புதிய புத்தகத்தைச் சேர்த்தல்' : 'Add New Catalog Title') : (isTamil ? 'புத்தக விவரங்களைத் திருத்துதல்' : 'Edit Book Record')}
        maxWidth="740px"
      >
        <form onSubmit={isAddOpen ? handleCreate : handleEdit}>
          {/* Cover Image Control Box */}
          <div style={{
            padding: '1.25rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Image Preview */}
            <div style={{
              width: '84px',
              height: '116px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: '#0f172a',
              border: '2px solid var(--primary)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <img
                src={formData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
                alt="Book cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'; }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  <ImageIcon size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  {t('coverPhoto', 'Book Cover Image')}
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isTamil ? 'தானியங்கி அல்லது கையேடு புகைப்படம்' : 'Auto or Manual Photo'}
                </span>
              </div>

              {/* Cover URL Input */}
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.825rem' }}
                placeholder={t('enterCoverUrl', 'Paste Image URL or Auto-Fetch / Upload')}
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              />

              {/* Action Buttons for Image */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAutoFetchCover}
                  disabled={fetchingCover}
                >
                  <Sparkles size={14} />
                  {fetchingCover ? (isTamil ? 'தேடுகிறது...' : 'Fetching...') : t('autoFetchCover', 'Auto-Fetch Cover')}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover}
                >
                  <Camera size={14} />
                  {uploadingCover ? (isTamil ? 'பதிவேற்றுகிறது...' : 'Uploading...') : t('uploadPhoto', 'Upload Photo')}
                </button>

                {formData.coverImage && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                  >
                    {isTamil ? 'அழி' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('bookTitle', 'Book Title')} *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('isbn', 'ISBN')} *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 978-0131103627"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('primaryAuthor', 'Primary Author')} *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('publisher', 'Publisher')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('subjectCategory', 'Subject Category')}</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{tCategory(c.name)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('pubYear', 'Publication Year')}</label>
              <input
                type="number"
                className="form-input"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('totalCopies', 'Total Copies')}</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('shelf', 'Shelf')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('rack', 'Rack')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.rack}
                onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('row', 'Row')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.row}
                onChange={(e) => setFormData({ ...formData, row: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('price', 'Price ($)')}</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('description', 'Description')}</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
            >
              {t('cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {isAddOpen ? t('addBookBtnModal', 'Add Book & Generate Barcodes') : t('saveChanges', 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('confirmDelete', 'Delete Book')}
        message={isTamil
          ? `'${selectedBook?.title}' புத்தகத்தை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இது அதன் அனைத்து இயற்பியல் பிரதிகளையும் நீக்கும்.`
          : `Are you sure you want to permanently delete '${selectedBook?.title}'? This will also remove physical copy records.`}
        confirmText={t('delete', 'Delete Book')}
      />

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title={isTamil ? 'CSV வழியாக புத்தகங்களை மொத்தமாகப் பதிவுசெய்க' : 'Batch Ingest Books via CSV'}
      >
        <form onSubmit={handleCSVImport}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {isTamil
              ? 'கோப்பில் பின்வரும் தலைப்புகள் இருக்க வேண்டும்: ISBN, Title, Author, Publisher, Year, Category, Total Copies.'
              : 'Upload a CSV containing columns: ISBN, Title, Author, Publisher, Year, Category, Total Copies.'}
          </p>

          <div className="form-group">
            <input
              type="file"
              accept=".csv"
              required
              className="form-input"
              onChange={(e) => setImportFile(e.target.files[0])}
            />
          </div>

          {importReport && (
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)' }}>
                ✓ {importReport.successCount} {isTamil ? 'புத்தகங்கள் வெற்றிகரமாகப் பதிவுசெய்யப்பட்டன' : 'books successfully registered'}
              </div>
              {importReport.failedCount > 0 && (
                <div style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
                  {importReport.failedCount} {isTamil ? 'பதிவுகள் தவிர்க்கப்பட்டன:' : 'records skipped:'}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsImportOpen(false)}>
              {t('cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={importing}>
              {importing ? (isTamil ? 'இறக்குமதி செய்யப்படுகிறது...' : 'Ingesting...') : (isTamil ? 'CSV கோப்பைச் செயலாக்கு' : 'Upload & Process CSV')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
