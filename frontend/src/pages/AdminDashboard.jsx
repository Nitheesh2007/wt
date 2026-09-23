import React, { useState, useEffect } from 'react';
import { adminAPI, aiAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Sparkles,
  FileText,
  ScanLine,
  Bookmark,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import { SkeletonLoader, StatusBadge } from '../components/common/UIComponents';

export default function AdminDashboard({ setActiveTab, onSelectBook }) {
  const { t, isTamil } = useLanguage();
  const [data, setData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, aiRes] = await Promise.all([
          adminAPI.getDashboard(),
          aiAPI.getInventoryHealth()
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (aiRes.success) setAiInsights(aiRes.data);
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SkeletonLoader count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {isTamil ? 'நூலக நிர்வாகம் & நுண்ணறிவு கட்டுப்பாட்டகம்' : 'Library Administration & Intelligence Hub'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            {isTamil ? 'நிகழ்நேர சுழற்சி அளவீடுகள், தானியங்கி அபராத கண்காணிப்பு மற்றும் முன்னறிவிப்பு இருப்பு பகுப்பாய்வு.' : 'Real-time circulation metrics, automated fine tracking, and predictive inventory health.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('circulation')}>
            <Repeat size={16} /> {isTamil ? 'சுழற்சி கவுண்டர்' : 'Circulation Desk'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('ocr-scanner')}>
            <ScanLine size={16} /> {isTamil ? 'OCR புத்தக ஸ்கேனர்' : 'OCR Book Scanner'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('reports')}>
            <FileText size={16} /> {isTamil ? 'அறிக்கைகள் ஏற்றுமதி' : 'Export Reports'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.15rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">{t('statTitles', 'Total Titles')}</div>
            <div className="stat-value">{data?.totalBooks || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data?.totalCopies || 0} {isTamil ? 'மொத்த நகல்கள்' : 'total copies'}</div>
          </div>
          <div className="stat-icon"><BookOpen size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'கிடைக்கும் நகல்கள்' : 'Available Copies'}</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{data?.availableCopies || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{isTamil ? 'வழங்கத் தயார்' : 'In Stacks Ready to Loan'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><BookOpen size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'வழங்கப்பட்ட நகல்கள்' : 'Issued Copies'}</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{data?.issuedCopies || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>{isTamil ? 'செயலில் உள்ள கடன்கள்' : 'Active Student Loans'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Repeat size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'முன்பதிவு நகல்கள்' : 'Reserved Copies'}</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{data?.reservedCopies || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>{isTamil ? 'வரிசை ஒதுக்கீட்டில்' : 'In Queue Allocation'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}><CalendarCheck size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'தாமதமான கடன்கள்' : 'Overdue Loans'}</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{data?.overdueBooks || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{isTamil ? 'கவனம் தேவை' : 'Requires Action'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><AlertTriangle size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'மொத்த உறுப்பினர்கள்' : 'Total Members'}</div>
            <div className="stat-value">{data?.totalMembers || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{data?.activeMembers || 0} {isTamil ? 'செயலில்' : 'Active'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}><Users size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'நிலுவை கோரிக்கைகள்' : 'Pending Requests'}</div>
            <div className="stat-value">{data?.pendingRequests || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTamil ? 'மாணவர் கருத்துக்கள்' : 'Community Proposals'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}><Clock size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">{isTamil ? 'மொத்த அபராதங்கள்' : 'Total Fines'}</div>
            <div className="stat-value">${(data?.totalFines || 0).toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{isTamil ? 'நிலுவை / சேகரிக்கப்பட்டது' : 'Accrued / Assessed'}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#4f46e5' }}><DollarSign size={22} /></div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Borrowing & Return Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={20} /> {isTamil ? 'சுழற்சி வளர்ச்சி & திருப்பிச் செலுத்தும் போக்குகள்' : 'Circulation Growth & Return Trends'}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isTamil ? 'கடந்த 6 மாதங்கள்' : 'Last 6 Months'}</span>
          </div>

          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', padding: '1rem 0', justifyContent: 'space-around' }}>
            {(data?.borrowingTrends || []).map((t, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', width: '100%', justifyContent: 'center' }}>
                  {/* Borrow bar */}
                  <div
                    style={{
                      width: '18px',
                      height: `${(t.borrowings / 70) * 100}%`,
                      background: 'linear-gradient(180deg, var(--primary) 0%, #6366f1 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 400ms ease'
                    }}
                    title={`Borrowings: ${t.borrowings}`}
                  />
                  {/* Return bar */}
                  <div
                    style={{
                      width: '18px',
                      height: `${(t.returns / 70) * 100}%`,
                      background: 'linear-gradient(180deg, var(--success) 0%, #34d399 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 400ms ease'
                    }}
                    title={`Returns: ${t.returns}`}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.month}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--primary)' }} />
              <span>{isTamil ? 'வழங்கப்பட்ட கடன்கள்' : 'Loans Issued'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--success)' }} />
              <span>{isTamil ? 'திரும்பிய கடன்கள்' : 'Loans Returned'}</span>
            </div>
          </div>
        </div>

        {/* Category Popularity Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Bookmark size={20} /> {isTamil ? 'துறை & வகை சார்ந்த தேவை' : 'Department & Category Demand'}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isTamil ? 'சுழற்சி அளவு' : 'Circulation Volume'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0.5rem 0' }}>
            {(data?.categoryPopularity || []).map((cat, idx) => {
              const maxVal = Math.max(...(data?.categoryPopularity || []).map((c) => c.borrowings), 1);
              const pct = Math.round((cat.borrowings / maxVal) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.borrowings} {isTamil ? 'இரவல்கள்' : 'checkouts'}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: idx === 0 ? 'var(--primary)' : idx === 1 ? '#0ea5e9' : idx === 2 ? '#8b5cf6' : '#10b981',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 500ms ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insights & Inventory Health Alert Panel */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent)', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(139, 92, 246, 0.04) 100%)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="card-title" style={{ marginBottom: 0 }}>
                {isTamil ? 'AI இருப்பு நுண்ணறிவு & தேவை முன்னறிவிப்பு' : 'AI Inventory Intelligence & Demand Forecasting'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isTamil ? 'சுழற்சி வேகத்திலிருந்து தானியங்கி கணிப்பு பகுப்பாய்வு' : 'Automated predictive analytics from circulation velocity'}
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('ai-analytics')}>
            {isTamil ? 'விரிவான பகுப்பாய்வு' : 'Deep Analytics Dashboard'} <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px' }}>
              {isTamil ? 'அதிக தேவை / சாத்தியமான பற்றாக்குறை' : 'High-Demand / Potential Shortage'} ({aiInsights?.shortages?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(aiInsights?.shortages || []).slice(0, 3).map((item) => (
                <div key={item._id} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>{item.category}</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      +{item.recommendedAdditionalCopies || 1} {isTamil ? 'நகல்கள் தேவை' : 'copies needed'}
                    </span>
                  </div>
                </div>
              ))}
              {(!aiInsights?.shortages || aiInsights.shortages.length === 0) && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {isTamil ? 'அனைத்து வகைகளிலும் இருப்பு நிலைகள் சமச்சீராக உள்ளன.' : 'Inventory levels are currently well-balanced across all categories.'}
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
              {isTamil ? 'அதிகம் இரவல் பெறப்பட்ட நூல்கள்' : 'Most Borrowed Academic Reference'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(data?.mostBorrowedBooks || []).slice(0, 3).map((b) => (
                <div key={b._id} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
                  <div style={{ fontWeight: 700 }}>{b.title}</div>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>{isTamil ? 'ஆசிரியர்' : 'By'} {b.author}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{b.timesBorrowed} {isTamil ? 'முறைகள்' : 'borrows'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
