import React, { useState, useEffect } from 'react';
import { studentAPI, communityAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Target, BookOpen, Clock, Heart, Award, Plus, CheckCircle2, ChevronRight } from 'lucide-react';
import Modal from '../components/common/Modal';
import { SkeletonLoader } from '../components/common/UIComponents';

export default function StudentPortal({ onSelectBook, setActiveTab }) {
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [goals, setGoals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', targetBooks: 5, goalType: 'SEMESTER', deadline: '' });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [anRes, gRes, wRes] = await Promise.all([
        studentAPI.getAnalytics(),
        studentAPI.getGoals(),
        communityAPI.getWishlist()
      ]);
      if (anRes.success) setAnalytics(anRes.data);
      if (gRes.success) setGoals(gRes.data || []);
      if (wRes.success) setWishlist(wRes.data || []);
    } catch (err) {
      toast.error('Failed to load student portal data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await studentAPI.createGoal(goalForm);
      if (res.success) {
        toast.success(res.message);
        setIsGoalModalOpen(false);
        setGoalForm({ title: '', targetBooks: 5, goalType: 'SEMESTER', deadline: '' });
        loadStudentData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create goal.');
    }
  };

  const handleIncrementGoal = async (goal) => {
    try {
      const res = await studentAPI.updateGoal(goal._id, { completedBooks: goal.completedBooks + 1 });
      if (res.success) {
        toast.success('Goal progress updated!');
        loadStudentData();
      }
    } catch (err) {
      toast.error('Failed to update progress.');
    }
  };

  if (loading) return <SkeletonLoader count={4} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {isTamil ? 'மாணவர் கல்வி வாசிப்பு தளம்' : 'Student Academic Reading Workspace'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isTamil ? 'வாசிப்பு இலக்குகளைக் கண்காணிக்கவும், கடன் முறைகளை பகுப்பாய்வு செய்யவும், விருப்பப்பட்டியலை நிர்வகிக்கவும்.' : 'Track reading targets, analyze borrowing patterns, and curate course wishlists.'}
        </p>
      </div>

      {/* Analytics KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'படித்த மொத்த புத்தகங்கள்' : 'Total Books Read'}</div>
            <div className="stat-value">{analytics?.totalBorrowed || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{isTamil ? 'கல்விப் பருவங்கள் முழுவதும்' : 'Across academic terms'}</div>
          </div>
          <div className="stat-icon"><BookOpen size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'தற்போது கடன் வாங்கியவை' : 'Currently Borrowed'}</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{analytics?.currentActive || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'அதிகபட்ச வரம்பு: 4 புத்தகங்கள்' : 'Max limit: 4 books'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Clock size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'சராசரி வாசிப்பு வேகம்' : 'Avg. Reading Speed'}</div>
            <div className="stat-value">{analytics?.averageDurationDays || 11.5} <span style={{ fontSize: '1rem' }}>{isTamil ? 'நாட்கள்' : 'days'}</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'ஒரு பாடப்புத்தகத்திற்கு' : 'Per textbook checkout'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}><Award size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'விருப்பப்பட்டியல் நூல்கள்' : 'Wishlist Items'}</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{wishlist.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'சேமிக்கப்பட்டவை' : 'Saved for next term'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)' }}><Heart size={22} /></div>
        </div>
      </div>

      {/* Reading Goals Tracker */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} style={{ color: 'var(--primary)' }} />
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              {isTamil ? 'வாசிப்பு இலக்குகள் & கல்வி மைல்கற்கள்' : 'Reading Challenges & Academic Milestones'}
            </h3>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsGoalModalOpen(true)}>
            <Plus size={16} /> {isTamil ? 'புதிய வாசிப்பு இலக்கு' : 'New Reading Goal'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {goals.map((g) => (
            <div key={g._id} style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-purple" style={{ marginBottom: '4px' }}>{g.goalType}</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{g.title}</div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {g.deadline}</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>{isTamil ? 'நிறைவுற்றவை' : 'Completed'}: <strong>{g.completedBooks} / {g.targetBooks}</strong> {isTamil ? 'புத்தகங்கள்' : 'books'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{g.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${g.percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #10b981 100%)', borderRadius: 'var(--radius-full)', transition: 'width 400ms ease' }} />
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleIncrementGoal(g)} disabled={g.completedBooks >= g.targetBooks}>
                  {isTamil ? '+ 1 புத்தகம் முடித்ததாகப் பதிவு செய்' : '+ Log 1 Book Finished'}
                </button>
              </div>
            </div>
          ))}

          {goals.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              {isTamil ? 'இன்னும் வாசிப்பு இலக்குகள் எதுவும் நிர்ணயிக்கப்படவில்லை. "இந்த செமஸ்டரில் 10 புத்தகங்கள் படிக்க வேண்டும்" என்பது போன்ற இலக்கை அமைத்து முன்னேற்றத்தைக் கண்காணிக்கவும்!' : 'No reading goals set yet. Set a goal like "Read 10 Books this semester" to track your progress!'}
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} style={{ color: 'var(--danger)' }} />
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              {isTamil ? 'எனது விருப்பப்பட்டியல் நூல்கள்' : 'My Bookmarked Titles'} ({wishlist.length})
            </h3>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            {isTamil ? 'உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது. எதிர்கால குறிப்புக்கு நூல்களைச் சேமிக்க அட்டவணையை ஆராயுங்கள்!' : 'Your wishlist is empty. Browse the catalog to bookmark books for future research!'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {wishlist.map((b) => (
              <div
                key={b._id}
                className="card"
                style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
                onClick={() => {
                  if (onSelectBook) onSelectBook(b);
                  setActiveTab('book-detail');
                }}
              >
                <div style={{ height: '140px', overflow: 'hidden', background: '#1e293b' }}>
                  <img src={b.coverImage} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{b.category}</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>By {b.author}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Create Reading Milestone">
        <form onSubmit={handleCreateGoal}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Thesis Literature Review / Spring Semester Goal"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Books *</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={goalForm.targetBooks}
                onChange={(e) => setGoalForm({ ...goalForm, targetBooks: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Goal Horizon</label>
              <select
                className="form-select"
                value={goalForm.goalType}
                onChange={(e) => setGoalForm({ ...goalForm, goalType: e.target.value })}
              >
                <option value="MONTHLY">Monthly Target</option>
                <option value="SEMESTER">Semester Challenge</option>
                <option value="ANNUAL">Annual Horizon</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Completion Date</label>
            <input
              type="date"
              className="form-input"
              value={goalForm.deadline}
              onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Start Challenge</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
