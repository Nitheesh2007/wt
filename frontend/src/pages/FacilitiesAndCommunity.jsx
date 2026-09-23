import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { studentAPI, communityAPI, circAPI } from '../services/api';
import { Building2, Calendar, Clock, ThumbsUp, DollarSign, Plus, CheckCircle2, X } from 'lucide-react';
import Modal from '../components/common/Modal';
import { StatusBadge, SkeletonLoader } from '../components/common/UIComponents';

export function FacilitiesPage() {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookDate, setBookDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('09:00 - 11:00');
  const [bookingLoading, setBookingLoading] = useState(false);

  const slots = [
    '09:00 - 11:00',
    '11:00 - 13:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00'
  ];

  useEffect(() => {
    loadFacilityData();
  }, []);

  const loadFacilityData = async () => {
    setLoading(true);
    try {
      const [fRes, bRes] = await Promise.all([
        studentAPI.getFacilities(),
        studentAPI.getBookings()
      ]);
      if (fRes.success) setFacilities(fRes.data || []);
      if (bRes.success) setBookings(bRes.data || []);
    } catch (err) {
      toast.error(isTamil ? 'வசதிகளை ஏற்றுவதில் தோல்வி.' : 'Failed to load facilities.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await studentAPI.bookFacility({
        facilityId: selectedFacility._id,
        date: bookDate,
        timeSlot
      });
      if (res.success) {
        toast.success(res.message);
        setIsBookModalOpen(false);
        loadFacilityData();
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'முன்பதிவு தோல்வி.' : 'Reservation failed.'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await studentAPI.cancelBooking(bookingId);
      if (res.success) {
        toast.success(res.message);
        loadFacilityData();
      }
    } catch (err) {
      toast.error(err.message || 'Cancellation failed.');
    }
  };

  if (loading) return <SkeletonLoader count={3} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('facilityBookingTitle', 'Library Facilities & Seat Booking')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('facilityBookingSub', 'Reserve quiet individual study carrel pods or collaborative seminar rooms with automated double-booking prevention.')}
        </p>
      </div>

      {/* Facilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {facilities.map((fac) => (
          <div key={fac._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '6px' }}>{fac.type}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fac.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {fac.location} • {isTamil ? 'தளம்' : 'Floor'}: {fac.floor}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isTamil ? 'கொள்ளளவு' : 'Capacity'}</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {fac.capacity} {isTamil ? 'இருக்கைகள்' : 'Seats'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {fac.amenities?.join(' • ')}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`badge badge-${fac.isAvailable ? 'success' : 'danger'}`}>
                {fac.isAvailable ? (isTamil ? 'திறந்துள்ளது' : 'Open for Booking') : (isTamil ? 'பயன்பாட்டில் உள்ளது' : 'Occupied')}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setSelectedFacility(fac); setIsBookModalOpen(true); }}
              >
                <Clock size={16} /> {t('bookTimeSlotBtn', 'Book Time Slot')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Bookings List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} /> {t('myActiveBookings', 'My Active Facility Reservations')} ({bookings.length})
          </h3>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            {isTamil ? 'செயலில் உள்ள படிப்பு அறை முன்பதிவுகள் எதுவும் இல்லை.' : 'No seat or room bookings scheduled.'}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{isTamil ? 'முன்பதிவு எண்' : 'Booking Ref'}</th>
                  <th>{isTamil ? 'அறை / வசதி' : 'Facility'}</th>
                  <th>{isTamil ? 'தேதி' : 'Date'}</th>
                  <th>{isTamil ? 'நேர இடைவெளி' : 'Time Slot'}</th>
                  <th>{isTamil ? 'நிலை' : 'Status'}</th>
                  <th style={{ textAlign: 'right' }}>{t('actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.bookingReference}</td>
                    <td>{b.facilityName} ({b.floor})</td>
                    <td>{b.date}</td>
                    <td>{b.timeSlot}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {b.status === 'CONFIRMED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(b._id)}>
                          {t('cancel', 'Cancel')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={isTamil ? `படிப்பு இருக்கையை முன்பதிவு செய்: ${selectedFacility?.name}` : `Reserve Facility: ${selectedFacility?.name}`}
      >
        <form onSubmit={handleBook}>
          <div className="form-group">
            <label className="form-label">{isTamil ? 'முன்பதிவு தேதி *' : 'Reservation Date *'}</label>
            <input
              type="date"
              required
              className="form-input"
              value={bookDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setBookDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'நேர இடைவெளி *' : 'Time Slot *'}</label>
            <select className="form-select" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
              {slots.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsBookModalOpen(false)}>{t('cancel', 'Cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
              {bookingLoading ? (isTamil ? 'முன்பதிவு செய்யப்படுகிறது...' : 'Reserving...') : (isTamil ? 'முன்பதிவை உறுதிப்படுத்து' : 'Confirm Reservation')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function BookRequestsPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', reason: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await communityAPI.getRequests();
      if (res.success) setRequests(res.data || []);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleVote = async (id) => {
    try {
      const res = await communityAPI.voteRequest(id);
      if (res.success) {
        toast.success(res.message);
        loadRequests();
      }
    } catch (err) {
      toast.error('Voting failed.');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await communityAPI.createRequest(form);
      if (res.success) {
        toast.success(isTamil ? 'நூல் பரிந்துரை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : res.message);
        setIsModalOpen(false);
        setForm({ title: '', author: '', isbn: '', reason: '' });
        loadRequests();
      }
    } catch (err) {
      toast.error(err.message || 'Submission error.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await communityAPI.updateRequestStatus(id, status);
      if (res.success) {
        toast.success(res.message);
        loadRequests();
      }
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  if (loading) return <SkeletonLoader count={3} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {isTamil ? 'சமூக நூல் கோரிக்கைகள் & வாக்குகள்' : 'Academic Book Requests & Voting'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isTamil
              ? 'பாடத்திட்டத்திற்கு தேவையான புதிய புத்தகங்களை பரிந்துரைக்கவும், பிற மாணவர்களின் பரிந்துரைகளுக்கு வாக்களிக்கவும்.'
              : 'Propose new technical titles for the library catalog. Popular community upvoted books are automatically prioritized for procurement.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> {isTamil ? 'புதிய நூல் பரிந்துரை' : 'Propose New Title'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {requests.map((r) => (
          <div key={r._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <button
                className="btn btn-secondary"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', padding: '8px' }}
                onClick={() => handleVote(r._id)}
              >
                <ThumbsUp size={16} />
                <span style={{ fontWeight: 800, fontSize: '1rem', marginTop: '2px' }}>{r.upvotes || 0}</span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{isTamil ? 'வாக்குகள்' : 'Votes'}</span>
              </button>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-purple">{r.category}</span>
                  <StatusBadge status={r.status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'முன்னுரிமை:' : 'Priority:'} {r.priority}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{r.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {isTamil ? 'ஆசிரியர்' : 'By'} <strong>{r.author}</strong> {r.isbn && `• ISBN: ${r.isbn}`}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  "{r.reason}" — {isTamil ? 'கோரியவர்' : 'Requested by'} {r.requestedByName || 'Student'}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {(role === 'ADMIN' || role === 'LIBRARIAN') && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(r._id, 'APPROVED')}>
                  {isTamil ? 'ஒப்புதல்' : 'Approve'}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(r._id, 'PURCHASED')}>
                  {isTamil ? 'வாங்கப்பட்டது' : 'Purchased'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(r._id, 'REJECTED')}>
                  {isTamil ? 'நிராகரி' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isTamil ? 'புதிய நூல் கொள்முதல் பரிந்துரை' : 'Submit Book Acquisition Proposal'}>
        <form onSubmit={handleCreateRequest}>
          <div className="form-group">
            <label className="form-label">{t('bookTitle', 'Book Title')} *</label>
            <input type="text" required className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('primaryAuthor', 'Author')} *</label>
              <input type="text" required className="form-input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('isbn', 'ISBN')}</label>
              <input type="text" className="form-input" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'காரணம் / கல்வித் தேவை *' : 'Reason / Academic Relevance *'}</label>
            <textarea required rows={3} className="form-textarea" placeholder={isTamil ? "பாடத்திட்டம் அல்லது ஆராய்ச்சி தேவை பற்றி விளக்கவும்..." : "Explain course curriculum or project need..."} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{t('cancel', 'Cancel')}</button>
            <button type="submit" className="btn btn-primary">{isTamil ? 'வாக்கெடுப்புக்குச் சமர்ப்பி' : 'Submit for Voting'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function FinesManagement() {
  const { role } = useAuth();
  const { toast } = useToast();
  const { isTamil } = useLanguage();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    setLoading(true);
    try {
      const res = await circAPI.getFines();
      if (res.success) setFines(res.data || []);
    } catch (err) {
      toast.error(isTamil ? 'அபராதங்களை ஏற்றுவதில் தோல்வி.' : 'Failed to load fines.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      const res = await circAPI.payFine(id);
      if (res.success) {
        toast.success(res.message);
        loadFines();
      }
    } catch (err) {
      toast.error('Payment processing failed.');
    }
  };

  const handleWaive = async (id) => {
    try {
      const res = await circAPI.waiveFine(id);
      if (res.success) {
        toast.success(res.message);
        loadFines();
      }
    } catch (err) {
      toast.error('Waiver processing failed.');
    }
  };

  if (loading) return <SkeletonLoader type="table" count={5} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {isTamil ? 'தாமதக் கட்டணங்கள் & அபராத மேலாண்மை' : 'Overdue Fines & Penalty Management'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil
            ? 'தாமதக் கட்டணங்களின் தானியங்கி கணக்கீடு, செலுத்துதல் சரிபார்ப்பு மற்றும் தள்ளுபடி ஒப்புதல்கள்.'
            : 'Automated calculation of overdue charges, payment reconciliations, and academic waivers.'}
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{isTamil ? 'பரிவர்த்தனை எண்' : 'Tx ID'}</th>
              <th>{isTamil ? 'உறுப்பினர் பெயர்' : 'Member Name'}</th>
              <th>{isTamil ? 'புத்தக தலைப்பு' : 'Book Title'}</th>
              <th>{isTamil ? 'காலக்கெடு' : 'Due Date'}</th>
              <th>{isTamil ? 'தாமதமான நாட்கள்' : 'Overdue Days'}</th>
              <th>{isTamil ? 'அபராதத் தொகை' : 'Fine Assessed'}</th>
              <th>{isTamil ? 'நிலை' : 'Status'}</th>
              <th style={{ textAlign: 'right' }}>{isTamil ? 'செயல்கள்' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((f) => (
              <tr key={f._id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{f.transactionId}</td>
                <td>{f.userName}</td>
                <td>{f.bookTitle}</td>
                <td>{f.dueDate?.slice(0, 10)}</td>
                <td>{f.overdueDays || 0} {isTamil ? 'நாட்கள்' : 'days'}</td>
                <td style={{ color: 'var(--danger)', fontWeight: 700 }}>${f.fineAmount?.toFixed(2)}</td>
                <td><StatusBadge status={f.paymentStatus || 'PENDING'} /></td>
                <td style={{ textAlign: 'right' }}>
                  {f.paymentStatus === 'PENDING' && (role === 'ADMIN' || role === 'LIBRARIAN') && (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handlePay(f._id)}>
                        {isTamil ? 'செலுத்தியதாகக் குறி' : 'Mark Paid'}
                      </button>
                      {role === 'ADMIN' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleWaive(f._id)}>
                          {isTamil ? 'அபராதத்தை தள்ளுபடி செய்' : 'Waive Fine'}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {fines.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {isTamil ? 'நிலுவையில் உள்ள அபராதங்கள் எதுவும் இல்லை.' : 'No outstanding fines on record.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
