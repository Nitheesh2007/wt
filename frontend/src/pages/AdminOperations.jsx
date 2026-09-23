import React, { useState, useEffect } from 'react';
import { adminAPI, bookAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  ShieldCheck,
  Building2,
  FileText,
  Activity,
  Settings,
  Plus,
  Download,
  CheckCircle2,
  Trash2,
  Edit,
  Search,
  Server
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { StatusBadge, SkeletonLoader } from '../components/common/UIComponents';

export function UserManagement() {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ search });
      if (res.success) setUsers(res.data || []);
    } catch (err) {
      toast.error(isTamil ? 'பயனாளர்களை ஏற்றுவதில் தோல்வி.' : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await adminAPI.updateUser(user._id, { status: newStatus });
      if (res.success) {
        toast.success(isTamil ? `பயனர் ${user.email} ${newStatus} என மாற்றப்பட்டது.` : `User ${user.email} marked ${newStatus}.`);
        loadUsers();
      }
    } catch (err) {
      toast.error(isTamil ? 'நிலை புதுப்பித்தல் தோல்வி.' : 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(isTamil ? 'இந்த மாணவர் கணக்கை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this user account?')) return;
    try {
      const res = await adminAPI.deleteUser(userId);
      if (res.success) {
        toast.success(isTamil ? 'பயனர் நீக்கப்பட்டார்.' : 'User deleted.');
        loadUsers();
      }
    } catch (err) {
      toast.error(isTamil ? 'நீக்குதல் தோல்வி.' : 'Failed to delete user.');
    }
  };

  if (loading) return <SkeletonLoader type="table" count={5} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('userDirectoryTitle', 'Student & Member Directory')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'அனைத்து பதிவு செய்யப்பட்ட மாணவர் மற்றும் ஊழியர் உறுப்பினர்களைக் கண்காணிக்கவும், நிலையை நிர்வகிக்கவும்.'
            : 'View and manage all registered student and staff member library accounts and access rights.'}
        </p>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder={isTamil ? 'பெயர், மின்னஞ்சல், மாணவர் எண் மூலம் தேடுக...' : 'Search by name, email, student ID...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{isTamil ? 'உறுப்பினர் பெயர்' : 'Member Name'}</th>
              <th>{t('email', 'Email')}</th>
              <th>{t('studentId', 'Student ID')}</th>
              <th>{t('department', 'Department')}</th>
              <th>{isTamil ? 'பொறுப்பு' : 'Role'}</th>
              <th>{isTamil ? 'நிலை' : 'Status'}</th>
              <th style={{ textAlign: 'right' }}>{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.studentId || '-'}</td>
                <td>{u.department} ({u.year})</td>
                <td><StatusBadge status={u.role} /></td>
                <td><StatusBadge status={u.status} /></td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleToggleStatus(u)}>
                      {u.status === 'ACTIVE' ? (isTamil ? 'செயலிழக்கச் செய்' : 'Deactivate') : (isTamil ? 'செயல்படுத்து' : 'Activate')}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LibrarianManagement() {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  useEffect(() => {
    loadLibrarians();
  }, []);

  const loadLibrarians = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLibrarians();
      if (res.success) setLibrarians(res.data || []);
    } catch (err) {
      toast.error(isTamil ? 'நூலகர்களை ஏற்றுவதில் தோல்வி.' : 'Failed to load librarians.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createLibrarian(form);
      if (res.success) {
        toast.success(isTamil ? 'நூலகர் கணக்கு உருவாக்கப்பட்டது.' : 'Librarian account created.');
        setIsModalOpen(false);
        setForm({ name: '', email: '', password: '', phone: '' });
        loadLibrarians();
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'உருவாக்குவதில் தோல்வி.' : 'Failed to add librarian.'));
    }
  };

  if (loading) return <SkeletonLoader type="table" count={4} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {t('librarianStaffTitle', 'Librarian Staff & Activity Tracking')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isTamil
              ? 'சுழற்சி கவுண்டர் ஊழியர்களின் செயல்பாடுகளை கண்காணிக்கவும் மற்றும் புதிய கணக்குகளை உருவாக்கவும்.'
              : 'Circulation desk personnel, daily borrow processing counts, and return validations.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> {isTamil ? 'புதிய நூலகப் பணியாளர் சேர்' : 'Add Librarian Staff'}
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{isTamil ? 'பணியாளர் பெயர்' : 'Staff Name'}</th>
              <th>{t('email', 'Email')}</th>
              <th>{isTamil ? 'தொலைபேசி' : 'Phone'}</th>
              <th>{isTamil ? 'வழங்கப்பட்டவை' : 'Books Issued'}</th>
              <th>{isTamil ? 'திரும்பப் பெற்றவை' : 'Books Returned'}</th>
              <th>{isTamil ? 'மொத்த செயல்பாடுகள்' : 'Total Activity'}</th>
              <th>{isTamil ? 'நிலை' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {librarians.map((lib) => (
              <tr key={lib._id}>
                <td style={{ fontWeight: 700 }}>{lib.name}</td>
                <td>{lib.email}</td>
                <td>{lib.phone || '-'}</td>
                <td><strong style={{ color: 'var(--primary)' }}>{lib.activity?.booksIssued || 0}</strong></td>
                <td><strong style={{ color: 'var(--success)' }}>{lib.activity?.booksReturned || 0}</strong></td>
                <td><strong>{lib.activity?.totalProcessed || 0} {isTamil ? 'செயல்கள்' : 'operations'}</strong></td>
                <td><StatusBadge status={lib.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isTamil ? 'நூலகப் பணியாளர் கணக்கு உருவாக்குதல்' : 'Create Librarian Account'}>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">{t('fullName', 'Full Name')} *</label>
            <input type="text" required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'பணியாளர் மின்னஞ்சல் *' : 'Staff Email *'}</label>
            <input type="email" required className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password', 'Password')} *</label>
            <input type="password" required className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'தொலைபேசி' : 'Phone'}</label>
            <input type="text" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{t('cancel', 'Cancel')}</button>
            <button type="submit" className="btn btn-primary">{isTamil ? 'கணக்கை உருவாக்கு' : 'Create Staff Account'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function SuppliersAndAcquisitions() {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [suppliers, setSuppliers] = useState([]);
  const [acquisitions, setAcquisitions] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAcqOpen, setIsAcqOpen] = useState(false);
  const [acqForm, setAcqForm] = useState({ bookId: '', supplierName: '', quantity: 5, purchasePrice: 40.0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [supRes, acqRes, bkRes] = await Promise.all([
        adminAPI.getSuppliers(),
        adminAPI.getAcquisitions(),
        bookAPI.getBooks({ limit: 150 })
      ]);
      if (supRes.success) setSuppliers(supRes.data || []);
      if (acqRes.success) setAcquisitions(acqRes.data || []);
      if (bkRes.success) setBooks(bkRes.data.books || []);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleAcquire = async (e) => {
    e.preventDefault();
    if (!acqForm.bookId) {
      toast.warning(isTamil ? 'புத்தகத்தைத் தேர்வு செய்க.' : 'Please select a book.');
      return;
    }
    try {
      const res = await adminAPI.createAcquisition(acqForm);
      if (res.success) {
        toast.success(res.message);
        setIsAcqOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Acquisition error.');
    }
  };

  if (loading) return <SkeletonLoader type="table" count={4} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {t('suppliersPurchasesTitle', 'Suppliers & Book Acquisitions')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isTamil
              ? 'வெளியீட்டாளர்கள், விநியோகஸ்தர்கள் மற்றும் புதிய புத்தக நகல்களுக்கான கொள்முதல் பதிவுகள்.'
              : 'Institutional book suppliers, procurement orders, and automatic copy expansion.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAcqOpen(true)}>
          <Plus size={16} /> {isTamil ? 'புதிய கொள்முதல் ஆணை' : 'Order New Book Copies'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Building2 size={20} /> {isTamil ? 'செயலில் உள்ள வெளியீட்டாளர்கள் & வழங்குநர்கள்' : 'Registered Suppliers'}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {suppliers.map((s) => (
            <div key={s._id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.contactPerson} • {s.email}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.city} | {s.phone}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{isTamil ? 'சமீபத்திய கொள்முதல் ஆணைகள்' : 'Recent Acquisition Orders'}</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{isTamil ? 'ஆணை எண்' : 'Order #'}</th>
                <th>{isTamil ? 'புத்தக தலைப்பு' : 'Book Title'}</th>
                <th>{isTamil ? 'வழங்குநர்' : 'Supplier'}</th>
                <th>{isTamil ? 'அளவு' : 'Quantity'}</th>
                <th>{isTamil ? 'மொத்த விலை' : 'Total Cost'}</th>
                <th>{isTamil ? 'தேதி' : 'Date'}</th>
                <th>{isTamil ? 'நிலை' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {acquisitions.map((a) => (
                <tr key={a._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.orderNumber}</td>
                  <td style={{ fontWeight: 700 }}>{a.bookTitle}</td>
                  <td>{a.supplierName}</td>
                  <td>+{a.quantity} {isTamil ? 'பிரதிகள்' : 'copies'}</td>
                  <td>${a.totalCost?.toFixed(2)}</td>
                  <td>{a.orderDate}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAcqOpen} onClose={() => setIsAcqOpen(false)} title={isTamil ? 'புதிய பிரதிகள் கொள்முதல் செய்தல்' : 'Acquire Additional Book Copies'}>
        <form onSubmit={handleAcquire}>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'நூலகப் புத்தகத்தைத் தேர்வு செய்க *' : 'Select Catalog Book *'}</label>
            <select
              className="form-select"
              required
              value={acqForm.bookId}
              onChange={(e) => setAcqForm({ ...acqForm, bookId: e.target.value })}
            >
              <option value="">{isTamil ? '-- தலைப்பைத் தேர்வு செய்க --' : '-- Choose Title --'}</option>
              {books.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} ({isTamil ? 'தற்போதைய பிரதிகள்' : 'Current Copies'}: {b.totalCopies})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'வழங்குநர் பெயர் *' : 'Supplier *'}</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Global Academic Book Distributors"
              value={acqForm.supplierName}
              onChange={(e) => setAcqForm({ ...acqForm, supplierName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{isTamil ? 'சேர்க்க வேண்டிய அளவு *' : 'Quantity to Add *'}</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={acqForm.quantity}
                onChange={(e) => setAcqForm({ ...acqForm, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isTamil ? 'ஒரு பிரதியின் விலை ($) *' : 'Unit Price ($) *'}</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                value={acqForm.purchasePrice}
                onChange={(e) => setAcqForm({ ...acqForm, purchasePrice: e.target.value })}
              />
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {isTamil
              ? 'இந்த ஆணையைச் சமர்ப்பிப்பது தானாகவே புதிய பார்கோடுகளை உருவாக்கி கையிருப்பில் சேர்க்கும்.'
              : 'Submitting this order will automatically generate copy barcodes and increment available stock.'}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAcqOpen(false)}>{t('cancel', 'Cancel')}</button>
            <button type="submit" className="btn btn-primary">{isTamil ? 'கொள்முதலை உறுதிப்படுத்து' : 'Process Acquisition'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function ReportsPage() {
  const { isTamil } = useLanguage();
  const downloadReport = (type, format = 'pdf') => {
    if (format === 'pdf') {
      window.open(`/api/reports/pdf?type=${type}`, '_blank');
    } else {
      window.open('/api/books/export-csv', '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {isTamil ? 'கல்வி அறிக்கைகள் & PDF / CSV ஏற்றுமதி' : 'Academic Reports & Data Export'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'ReportLab மூலம் வடிவமைக்கப்பட்ட தொழில்முறை PDF அறிக்கைகள் அல்லது CSV தரவுத்தொகுப்புகளை உருவாக்கவும்.'
            : 'Generate PDF reports formatted via ReportLab or export CSV datasets.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {isTamil ? 'முழுமையான புத்தக இருப்பு அறிக்கை' : 'Full Catalog Inventory'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isTamil ? 'செயலில் உள்ள தலைப்புகள், ISBN, அலமாரி இடங்கள் மற்றும் பிரதிகள் பற்றிய முழு பட்டியல்.' : 'Complete list of active titles, ISBNs, physical shelves, and available copies.'}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => downloadReport('inventory', 'pdf')}>
              <FileText size={16} /> PDF {isTamil ? 'அறிக்கை' : 'Report'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => downloadReport('inventory', 'csv')}>
              <Download size={16} /> CSV {isTamil ? 'ஏற்றுமதி' : 'Export'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {isTamil ? 'சுழற்சி & செயலில் உள்ள கடன்கள்' : 'Circulation & Active Loans'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isTamil ? 'தற்போது மாணவர்களிடம் உள்ள கடன்கள் மற்றும் காலக்கெடு விவரங்கள்.' : 'Active borrowings, student names, transaction IDs, and calculated due dates.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => downloadReport('circulation', 'pdf')}>
            <FileText size={16} /> {isTamil ? 'சுழற்சி PDF உருவாக்கு' : 'Generate Circulation PDF'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {isTamil ? 'காலாவதியான கடன்கள் தணிக்கை' : 'Overdue Loans Audit'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isTamil ? 'தாமதக் கட்டணங்களுடன் கூடிய காலாவதியான அனைத்து கடன் பதிவுகளின் பட்டியல்.' : 'Filter all loans past scheduled return deadlines with assessed fine amounts.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => downloadReport('overdue', 'pdf')}>
            <FileText size={16} /> {isTamil ? 'தாமதக் கடன் PDF உருவாக்கு' : 'Generate Overdue PDF'}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {isTamil ? 'அபராத வசூல் & தள்ளுபடி அறிக்கை' : 'Fines Collection & Waivers'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isTamil ? 'வசூலிக்கப்பட்ட, நிலுவையில் உள்ள மற்றும் தள்ளுபடி செய்யப்பட்ட நிதி தணிக்கை அறிக்கை.' : 'Financial audit report of collected, pending, and waived fines.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => downloadReport('fines', 'pdf')}>
            <FileText size={16} /> {isTamil ? 'அபராத PDF உருவாக்கு' : 'Generate Fines PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuditLogsPage() {
  const { t, isTamil } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await adminAPI.getAuditLogs();
        if (res.success) setLogs(res.data || []);
      } catch (err) {}
      finally { setLoading(false); }
    }
    loadLogs();
  }, []);

  if (loading) return <SkeletonLoader type="table" count={5} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('systemAuditTitle', 'System Security & Audit Trail')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'அனைத்து நிர்வாக நடவடிக்கைகள், புத்தக வழங்கல்கள் மற்றும் அமைப்புகள் பற்றிய மாற்ற முடியாத தணிக்கை பதிவுகள்.'
            : 'Immutable audit records of all administrative actions, book issues, and setting updates.'}
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{isTamil ? 'நேரமுத்திரை' : 'Timestamp'}</th>
              <th>{isTamil ? 'செயல்' : 'Action'}</th>
              <th>{isTamil ? 'பிரிவு' : 'Entity'}</th>
              <th>{isTamil ? 'பயனர்' : 'User'}</th>
              <th>{isTamil ? 'பொறுப்பு' : 'Role'}</th>
              <th>{isTamil ? 'விவரம்' : 'Description'}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id}>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {l.timestamp ? new Date(l.timestamp).toLocaleString() : '-'}
                </td>
                <td><span className="badge badge-purple">{l.action}</span></td>
                <td><strong>{l.entity}</strong></td>
                <td>{l.userName}</td>
                <td><StatusBadge status={l.role} /></td>
                <td style={{ fontSize: '0.85rem' }}>{l.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SystemSettingsPage() {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await adminAPI.getSettings();
        if (res.success) setSettings(res.data);
      } catch (err) {}
      finally { setLoading(false); }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.updateSettings(settings);
      if (res.success) {
        toast.success(isTamil ? 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன.' : res.message);
      }
    } catch (err) {
      toast.error(isTamil ? 'அமைப்புகளைப் புதுப்பிப்பதில் தோல்வி.' : 'Failed to update settings.');
    }
  };

  if (loading || !settings) return <SkeletonLoader count={3} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '780px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('systemSettingsTitle', 'System Parameters & Library Policies')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'அபராத விகிதங்கள், கடன் வரம்புகள், சலுகைக் காலம் மற்றும் நிறுவன தொடர்பு விவரங்களை கட்டமைக்கவும்.'
            : 'Configure fine rates, borrowing limits, grace periods, and institutional contact details.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label className="form-label">{isTamil ? 'நூலக நிறுவனத்தின் பெயர்' : 'Library Institutional Name'}</label>
          <input
            type="text"
            className="form-input"
            value={settings.libraryName || ''}
            onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'கடன் காலம் (நாட்கள்)' : 'Loan Duration (Days)'}</label>
            <input
              type="number"
              className="form-input"
              value={settings.loanDurationDays || 14}
              onChange={(e) => setSettings({ ...settings, loanDurationDays: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'ஒரு மாணவருக்கான அதிகபட்ச புத்தகங்கள்' : 'Max Active Books per Student'}</label>
            <input
              type="number"
              className="form-input"
              value={settings.maxBooksStudent || 4}
              onChange={(e) => setSettings({ ...settings, maxBooksStudent: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'அபராத விகிதம் ($ / நாள்)' : 'Fine Rate ($ / Day)'}</label>
            <input
              type="number"
              step="0.25"
              className="form-input"
              value={settings.fineRatePerDay || 1.0}
              onChange={(e) => setSettings({ ...settings, fineRatePerDay: parseFloat(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'சலுகைக் காலம் (நாட்கள்)' : 'Grace Period (Days)'}</label>
            <input
              type="number"
              className="form-input"
              value={settings.gracePeriodDays || 2}
              onChange={(e) => setSettings({ ...settings, gracePeriodDays: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'அதிகபட்ச புதுப்பித்தல் எண்ணிக்கை' : 'Max Renewal Count'}</label>
            <input
              type="number"
              className="form-input"
              value={settings.maxRenewalLimit || 2}
              onChange={(e) => setSettings({ ...settings, maxRenewalLimit: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {isTamil ? 'கட்டமைப்பு மாற்றங்களைச் சேமி' : 'Save Configuration Changes'}
        </button>
      </form>
    </div>
  );
}

export function SystemHealthPage() {
  const { t, isTamil } = useLanguage();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await adminAPI.getHealth();
        if (res.success) setHealth(res.data);
      } catch (err) {}
      finally { setLoading(false); }
    }
    checkHealth();
  }, []);

  if (loading) return <SkeletonLoader count={3} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('systemHealthTitle', 'System Health & Database Engine Status')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'MongoDB இணைப்பு, REST API சேவைகள் மற்றும் AI இயந்திரத்தின் நிகழ்நேர இயக்க நிலை.'
            : 'Real-time diagnostics of MongoDB connectivity, API microservices, and AI models.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Server size={22} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {isTamil ? 'தரவுத்தள கட்டமைப்பு' : 'Database Architecture'}
            </h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>{isTamil ? 'இயந்திரம்:' : 'Engine:'} <strong>{health?.database?.engine}</strong></div>
            <div>{isTamil ? 'துவக்கப்பட்ட சேகரிப்புகள்:' : 'Collections Initialized:'} <strong>{health?.database?.collections_count}</strong></div>
            <div>{isTamil ? 'நிலை:' : 'Status:'} <span className="badge badge-success">{isTamil ? 'செயல்பாட்டில் உள்ளது' : 'OPERATIONAL'}</span></div>
            <div>{isTamil ? 'சேமிப்பு இருப்பிடம்:' : 'Storage Location:'} <code style={{ fontSize: '0.75rem' }}>{health?.database?.data_directory}</code></div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Activity size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {isTamil ? 'சர்வர் இயக்க நேரம்' : 'Server Runtime'}
            </h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>{isTamil ? 'கட்டமைப்பு:' : 'Framework:'} <strong>{health?.server?.framework}</strong></div>
            <div>{isTamil ? 'பைத்தான் பதிப்பு:' : 'Python Version:'} <strong>{health?.server?.pythonVersion}</strong></div>
            <div>{isTamil ? 'AI சேவை:' : 'AI Service:'} <strong>{health?.server?.aiEngine}</strong></div>
            <div>{isTamil ? 'OCR தொகுதி:' : 'OCR Module:'} <strong>{health?.server?.ocrService}</strong></div>
            <div>{isTamil ? 'API பதிப்பு:' : 'API Version:'} <strong>{health?.server?.version}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
