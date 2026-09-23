import React, { useState, useEffect } from 'react';
import { circAPI, adminAPI, bookAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Repeat,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { StatusBadge, SkeletonLoader } from '../components/common/UIComponents';

export default function CirculationPage() {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [activeTab, setActiveTab] = useState('issue');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue Book State
  const [members, setMembers] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueReceipt, setIssueReceipt] = useState(null);

  // Return Book State
  const [returnInput, setReturnInput] = useState('');
  const [returning, setReturning] = useState(false);
  const [returnReceipt, setReturnReceipt] = useState(null);

  // Renew State
  const [renewInput, setRenewInput] = useState('');
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    loadCirculationData();
  }, []);

  const loadCirculationData = async () => {
    setLoading(true);
    try {
      const [txRes, usersRes, booksRes] = await Promise.all([
        circAPI.getTransactions({ limit: 50 }),
        adminAPI.getUsers({ status: 'ACTIVE' }),
        bookAPI.getBooks({ availability: 'AVAILABLE', limit: 100 })
      ]);
      if (txRes.success) setTransactions(txRes.data.transactions || []);
      if (usersRes.success) setMembers(usersRes.data || []);
      if (booksRes.success) setAvailableBooks(booksRes.data.books || []);
    } catch (err) {
      toast.error('Failed to load circulation records.');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedBook) {
      toast.warning('Please select both a member and an available book.');
      return;
    }

    setIssuing(true);
    try {
      const res = await circAPI.issueBook({ userId: selectedMember, bookId: selectedBook });
      if (res.success) {
        toast.success(res.message);
        setIssueReceipt(res.data.receipt);
        setSelectedBook('');
        loadCirculationData();
      }
    } catch (err) {
      toast.error(err.message || 'Issue failed.');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturnBook = async (e) => {
    e.preventDefault();
    if (!returnInput.trim()) {
      toast.warning('Please enter a Transaction ID or copy barcode.');
      return;
    }

    setReturning(true);
    try {
      const res = await circAPI.returnBook({ transactionId: returnInput.trim(), barcode: returnInput.trim() });
      if (res.success) {
        toast.success(res.message);
        setReturnReceipt(res.data);
        setReturnInput('');
        loadCirculationData();
      }
    } catch (err) {
      toast.error(err.message || 'Return operation failed.');
    } finally {
      setReturning(false);
    }
  };

  const handleRenew = async (txId) => {
    try {
      const res = await circAPI.renewBook({ transactionId: txId });
      if (res.success) {
        toast.success(res.message);
        loadCirculationData();
      }
    } catch (err) {
      toast.error(err.message || 'Renewal failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {isTamil ? 'புத்தக சுழற்சி & கடன் மேலாண்மை' : 'Circulation Counter & Loan Processing'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil ? 'புத்தகங்களை வழங்குதல், திரும்பப் பெறுதல், தாமத அபராதங்களைக் கணக்கிடுதல் மற்றும் கடன்களைப் புதுப்பித்தல்.' : 'Issue books, process returns, calculate overdue fines, and manage loan renewals.'}
        </p>
      </div>

      {/* Circulation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'issue' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('issue')}
        >
          <ArrowUpRight size={16} /> {isTamil ? 'புத்தகம் வழங்குதல்' : 'Issue Book'}
        </button>
        <button
          className={`btn ${activeTab === 'return' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('return')}
        >
          <ArrowDownLeft size={16} /> {isTamil ? 'புத்தகம் திரும்புதல்' : 'Return Book'}
        </button>
        <button
          className={`btn ${activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('loans')}
        >
          <Repeat size={16} /> {isTamil ? 'செயலில் உள்ள கடன்கள்' : 'Active & Overdue Loans'} ({transactions.filter((t) => t.status !== 'RETURNED').length})
        </button>
      </div>

      {/* Issue Book Form */}
      {activeTab === 'issue' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <h3 className="card-title"><ArrowUpRight size={20} /> {isTamil ? 'புதிய புத்தகக் கடன் பதிவு' : 'Checkout New Book Loan'}</h3>
          </div>

          <form onSubmit={handleIssueBook}>
            <div className="form-group">
              <label className="form-label">{isTamil ? 'மாணவர் / உறுப்பினரைத் தேர்ந்தெடுக்கவும் *' : 'Select Student / Member *'}</label>
              <select
                required
                className="form-select"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">{isTamil ? '-- உறுப்பினரைத் தேர்வுசெய்க --' : '-- Choose Member --'}</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.studentId || m.email}) • {isTamil ? 'செயலில் உள்ள கடன்கள்' : 'Active Loans'}: {m.currentBorrowedCount || 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{isTamil ? 'கிடைக்கும் நூலைத் தேர்ந்தெடுக்கவும் *' : 'Select Available Book *'}</label>
              <select
                required
                className="form-select"
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
              >
                <option value="">{isTamil ? '-- கிடைக்கும் நூலைத் தேர்வுசெய்க --' : '-- Choose Available Title --'}</option>
                {availableBooks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title} (ISBN: {b.isbn}) • {b.availableCopies} {isTamil ? 'இருப்பில் உள்ளது' : 'available in'} {b.shelf}/{b.rack}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {isTamil ? 'வழக்கமான கடன் காலம்: 14 நாட்கள். 2 நாட்கள் சலுகை காலத்திற்குப் பிறகு ஒரு நாளைக்கு $1.00 அபராதம் விதிக்கப்படும்.' : 'Standard Loan Duration: 14 Days. Fines accrue at $1.00/day after a 2-day grace period.'}
            </div>

            <button type="submit" className="btn btn-primary" disabled={issuing}>
              {issuing ? (isTamil ? 'பரிவர்த்தனை செயலாக்கப்படுகிறது...' : 'Processing Transaction...') : (isTamil ? 'புத்தகம் வழங்குவதை உறுதிசெய்து ரசீதை அச்சிடுக' : 'Confirm Book Issue & Print Receipt')}
            </button>
          </form>
        </div>
      )}

      {/* Return Book Form */}
      {activeTab === 'return' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="card-header">
            <h3 className="card-title"><ArrowDownLeft size={20} /> {isTamil ? 'திரும்பப் பெறப்பட்ட புத்தகப் பதிவு' : 'Check-In Returned Book'}</h3>
          </div>

          <form onSubmit={handleReturnBook}>
            <div className="form-group">
              <label className="form-label">{isTamil ? 'பரிவர்த்தனை எண் அல்லது பார்கோடு *' : 'Transaction ID or Copy Barcode *'}</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. TXN-2026-00101 or SL-BC-235088-01"
                value={returnInput}
                onChange={(e) => setReturnInput(e.target.value)}
              />
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {isTamil ? 'புத்தகத்தைத் திரும்பப் பெறும்போது தாமத நாட்கள் தானாகக் கணக்கிடப்பட்டு, காத்திருக்கும் மாணவருக்கு அறிவிப்பு அனுப்பப்படும்.' : 'Returns automatically recalculate overdue days, assess unpaid fines, and check the reservation queue to notify waiting students.'}
            </div>

            <button type="submit" className="btn btn-primary" disabled={returning}>
              {returning ? (isTamil ? 'புத்தகம் சரிபார்க்கப்படுகிறது...' : 'Checking In Book...') : (isTamil ? 'திரும்புதலைச் செயல்படுத்தி அபராதத்தைக் கணக்கிடு' : 'Process Return & Calculate Fines')}
            </button>
          </form>
        </div>
      )}

      {/* Active Loans Table */}
      {activeTab === 'loans' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{isTamil ? 'பரிவர்த்தனை ID' : 'Tx ID'}</th>
                <th>{isTamil ? 'உறுப்பினர்' : 'Member'}</th>
                <th>{isTamil ? 'புத்தகத் தலைப்பு' : 'Book Title'}</th>
                <th>{isTamil ? 'வழங்கிய தேதி' : 'Issue Date'}</th>
                <th>{isTamil ? 'கடைசி தேதி' : 'Due Date'}</th>
                <th>{isTamil ? 'நிலை / அபராதம்' : 'Status / Fine'}</th>
                <th style={{ textAlign: 'right' }}>{isTamil ? 'செயல்கள்' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tx.transactionId}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.studentId || tx.userEmail}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.bookTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'பார்கோடு' : 'Barcode'}: {tx.barcode}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{tx.issueDate?.slice(0, 10)}</td>
                  <td style={{ fontSize: '0.85rem' }}>{tx.dueDate?.slice(0, 10)}</td>
                  <td>
                    <StatusBadge status={tx.status} />
                    {tx.fineAmount > 0 && (
                      <span style={{ marginLeft: '6px', color: 'var(--danger)', fontWeight: 700, fontSize: '0.8rem' }}>
                        (${tx.fineAmount.toFixed(2)})
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {tx.status !== 'RETURNED' && (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRenew(tx._id)}
                          title={`Renew Loan (Count: ${tx.renewalCount || 0}/${tx.maxRenewals || 2})`}
                        >
                          <RotateCw size={14} /> {isTamil ? 'புதுப்பி' : 'Renew'}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setReturnInput(tx.transactionId);
                            setActiveTab('return');
                          }}
                        >
                          {isTamil ? 'திரும்பு' : 'Return'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Receipt Modal */}
      {issueReceipt && (
        <Modal isOpen={!!issueReceipt} onClose={() => setIssueReceipt(null)} title="Loan Issue Transaction Receipt" maxWidth="480px">
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <strong>SMART LIBRARY SYSTEM</strong>
              <div>Academic Circulation Desk</div>
            </div>
            <div><strong>Transaction ID:</strong> {issueReceipt.transactionId}</div>
            <div><strong>Member:</strong> {issueReceipt.memberName} ({issueReceipt.studentId})</div>
            <div><strong>Book:</strong> {issueReceipt.bookTitle}</div>
            <div><strong>Barcode:</strong> {issueReceipt.barcode}</div>
            <div><strong>Issue Date:</strong> {issueReceipt.issueDate}</div>
            <div style={{ color: 'var(--danger)' }}><strong>Due Date:</strong> {issueReceipt.dueDate}</div>
            <div><strong>Issued By:</strong> {issueReceipt.issuedBy}</div>
            <div style={{ textAlign: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
              Please return on or before due date to avoid fines.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setIssueReceipt(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Return Receipt Modal */}
      {returnReceipt && (
        <Modal isOpen={!!returnReceipt} onClose={() => setReturnReceipt(null)} title="Book Check-In Receipt" maxWidth="480px">
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <strong>RETURN CONFIRMATION</strong>
            </div>
            <div><strong>Transaction:</strong> {returnReceipt.transactionId}</div>
            <div><strong>Book:</strong> {returnReceipt.bookTitle}</div>
            <div><strong>Member:</strong> {returnReceipt.memberName}</div>
            <div><strong>Return Time:</strong> {returnReceipt.returnDate}</div>
            <div><strong>Overdue Days:</strong> {returnReceipt.overdueDays}</div>
            <div><strong>Fine Assessed:</strong> ${returnReceipt.fineAmount?.toFixed(2)}</div>
            <div style={{ color: returnReceipt.finePaid ? 'var(--success)' : 'var(--danger)' }}>
              <strong>Status:</strong> {returnReceipt.finePaid ? 'Cleared (No Fines)' : 'Fine Pending'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setReturnReceipt(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
