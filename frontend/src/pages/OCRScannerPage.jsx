import React, { useState } from 'react';
import { aiAPI, bookAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { ScanLine, Upload, CheckCircle2, AlertCircle, Sparkles, BookOpen, Edit } from 'lucide-react';

export default function OCRScannerPage({ setActiveTab, onSelectBook }) {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedData(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.warning(isTamil ? 'புத்தக அட்டை அல்லது பார்கோடு படத்தை தேர்வு செய்க.' : 'Please select a book cover or ISBN image.');
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await aiAPI.scanOCR(formData);
      if (res.success && res.data) {
        setExtractedData(res.data);
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'OCR பிரித்தெடுத்தல் தோல்வி.' : 'OCR extraction failed.'));
    } finally {
      setScanning(false);
    }
  };

  const handleFieldChange = (field, val) => {
    setExtractedData((prev) => ({ ...prev, [field]: val }));
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData.isbn || !extractedData.title || !extractedData.author) {
      toast.error(isTamil ? 'ISBN, தலைப்பு மற்றும் ஆசிரியர் தேவை.' : 'ISBN, Title, and Author are required to save catalog record.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: extractedData.title,
        isbn: extractedData.isbn,
        author: extractedData.author,
        publisher: extractedData.publisher || 'Academic Press',
        edition: extractedData.edition || '1st Edition',
        publicationYear: 2024,
        category: 'Computer Science',
        totalCopies: 2,
        shelf: 'Stack-B',
        rack: 'R-03',
        row: '1',
        price: 45.00,
        coverImage: extractedData.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        description: `Verified OCR scanned book: ${extractedData.title}. Extracted with ${extractedData.confidence}% confidence.`
      };

      const res = await bookAPI.createBook(payload);
      if (res.success) {
        toast.success(isTamil ? 'புத்தகம் சரிபார்க்கப்பட்டு MongoDB இல் பார்கோடுகளுடன் சேமிக்கப்பட்டது!' : 'Book verified and saved to catalog with barcode copies!');
        if (onSelectBook) onSelectBook(res.data);
        setActiveTab('book-mgmt');
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'நூலகப் பட்டியலில் சேமிப்பதில் தோல்வி.' : 'Failed to save book to catalog.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('ocrIngestionTitle', 'OCR & ISBN Optical Book Ingestion')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'டெசராக்ட் (Tesseract) OCR மூலம் மெட்டாடேட்டாவை தானாக பிரித்தெடுக்க புத்தக அட்டை அல்லது பார்கோடு படங்களை பதிவேற்றவும்.'
            : 'Upload book cover or barcode photos to automatically extract metadata using Tesseract OCR heuristics.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Upload & Preview Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Upload size={20} /> {isTamil ? '1. அட்டை அல்லது பார்கோடைப் பதிவேற்றுக' : '1. Upload Cover / Barcode'}
            </h3>
          </div>

          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('ocr-file-input').click()}
          >
            <input
              id="ocr-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div style={{ maxHeight: '280px', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }} />
              </div>
            ) : (
              <div>
                <ScanLine size={48} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {isTamil ? 'புத்தகப் படத்தை இங்கே கிளிக் செய்யவும் அல்லது இழுத்து விடவும்' : 'Click or drag book image here'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                  {isTamil ? 'JPG, PNG, WEBP அட்டைப் படங்கள் மற்றும் பார்கோடு லேபிள்களை ஆதரிக்கிறது' : 'Supports JPG, PNG, WEBP of book covers or barcode labels'}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={!selectedFile || scanning}
          >
            <Sparkles size={18} />
            {scanning ? (isTamil ? 'OCR பகுப்பாய்வு இயங்குகிறது...' : 'Running Optical OCR Analysis...') : t('runOCRBtn', 'Run OCR & Extract Metadata')}
          </button>
        </div>

        {/* Extracted Details & Verification Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title">
                <CheckCircle2 size={20} /> {isTamil ? '2. சரிபார்த்து உறுதிப்படுத்துக' : '2. Verify & Confirm'}
              </h3>
            </div>
            {extractedData && (
              <span className={`badge badge-${extractedData.confidence >= 80 ? 'success' : 'warning'}`}>
                {extractedData.confidence}% {isTamil ? 'துல்லிய நம்பிக்கை' : 'OCR Confidence'}
              </span>
            )}
          </div>

          {!extractedData ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1.5rem' }}>
              <ScanLine size={40} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p>{isTamil ? 'புத்தகப் படத்தைப் பதிவேற்றி, விவரங்களை முன்னோட்டமிட "OCR இயக்கி" பொத்தானை அழுத்தவும்.' : 'Upload a book image and click "Run OCR" to preview extracted information.'}</p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                {isTamil ? 'சரிபார்க்கப்படாத OCR தகவல்கள் தானாக ஒருபோதும் சேமிக்கப்படாது.' : 'Unverified OCR information will never be saved automatically.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{isTamil ? 'பிரித்தெடுக்கப்பட்ட ISBN *' : 'Extracted ISBN *'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={extractedData.isbn}
                  onChange={(e) => handleFieldChange('isbn', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isTamil ? 'பிரித்தெடுக்கப்பட்ட புத்தக தலைப்பு *' : 'Extracted Book Title *'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={extractedData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('primaryAuthor', 'Author')} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={extractedData.author}
                  onChange={(e) => handleFieldChange('author', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{t('publisher', 'Publisher')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={extractedData.publisher}
                    onChange={(e) => handleFieldChange('publisher', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('edition', 'Edition')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={extractedData.edition}
                    onChange={(e) => handleFieldChange('edition', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                <strong>{isTamil ? 'மூல OCR எழுத்தோட்டம்:' : 'Raw OCR Stream:'}</strong> {extractedData.rawText || 'Text stream processed.'}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleConfirmAndSave}
                disabled={saving}
                style={{ marginTop: '0.5rem' }}
              >
                <CheckCircle2 size={18} />
                {saving ? (isTamil ? 'பட்டியலில் சேமிக்கப்படுகிறது...' : 'Registering into Catalog...') : t('confirmSaveMongo', 'Confirm & Save to MongoDB Catalog')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
