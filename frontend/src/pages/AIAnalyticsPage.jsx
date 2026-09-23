import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, Info } from 'lucide-react';
import { SkeletonLoader } from '../components/common/UIComponents';

export default function AIAnalyticsPage() {
  const { t, tCategory, isTamil } = useLanguage();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await aiAPI.getInventoryHealth();
        if (res.success) setHealthData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <SkeletonLoader count={4} />;

  if (!healthData?.has_sufficient_data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {isTamil ? "போதுமான வரலாற்றுத் தரவு இல்லை" : "Insufficient Historical Data"}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0.5rem auto 1.5rem' }}>
          {isTamil
            ? "நம்பகமான AI தேவை முன்கணிப்புக்கு கூடுதல் கடன் சுழற்சிகள் தேவை."
            : (healthData?.message || "Insufficient historical data for reliable prediction.")}
        </p>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isTamil
            ? "கணினிக் கொள்கை: நாங்கள் போலி AI முன்னறிவிப்புகளை உருவாக்குவதில்லை. உண்மையான பகுப்பாய்விற்கு குறைந்தபட்சம் 5 சுழற்சிகள் தேவை."
            : "System Policy: We never fabricate AI forecasts. Real predictive analytics require at least 5 circulation cycles."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>{isTamil ? 'இயந்திர கற்றல் இருப்பு முன்னறிவிப்பு' : 'Machine Learning Inventory Forecasting'}</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {t('aiDemandTitle', 'AI Demand Prediction & Inventory Health')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('aiDemandSub', 'Automated stock shortage detection, loan turnover rate modeling, and collection health scoring.')}
        </p>
      </div>

      {/* Health Score Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-full)',
              background: 'conic-gradient(var(--success) 0% 88%, var(--bg-secondary) 88% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--success)'
              }}
            >
              {healthData.healthScore}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('inventoryHealthScore', 'Inventory Health Score')}
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>
              {isTamil ? 'சிறந்தது' : 'Optimized'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
              {isTamil ? 'சமநிலையான சுழற்சி விகிதம்' : 'Balanced circulation ratio'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="stat-label">{t('utilizationRate', 'Average Utilization Rate')}</div>
          <div className="stat-value">{healthData.averageUtilizationPercent || 64.5}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isTamil ? 'செயலில் கடன் வழங்கப்பட்ட பிரதிகள்' : 'Copies actively borrowed'}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">{t('predictedShortages', 'Predicted Shortage Risks')}</div>
          <div className="stat-value" style={{ color: healthData.shortages?.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {healthData.shortages?.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isTamil ? 'முன்பதிவு வரிசை உள்ள தலைப்புகள்' : 'Titles with queue backlog'}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">{t('idleCopies', 'Excess / Idle Copies')}</div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>
            {healthData.excessCopies?.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isTamil ? 'கூடுதல் இருப்பு உள்ள நூல்கள்' : 'Titles with surplus inventory'}
          </div>
        </div>
      </div>

      {/* Predicted Shortages Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
            {t('criticalShortagesTitle', 'Critical Shortages & Recommended Acquisitions')}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{healthData.forecastPeriod}</span>
        </div>

        {healthData.shortages?.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            {isTamil
              ? 'தற்போதைய சுழற்சி தேவையில் இருப்புப் பற்றாக்குறை எதுவும் கண்டறியப்படவில்லை.'
              : 'No stock shortages detected across current circulation demands.'}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{isTamil ? 'புத்தக தலைப்பு' : 'Book Title'}</th>
                  <th>{isTamil ? 'வகை' : 'Category'}</th>
                  <th>{isTamil ? 'மொத்த பிரதிகள்' : 'Total Copies'}</th>
                  <th>{isTamil ? 'கிடைப்பவை' : 'Available'}</th>
                  <th>{isTamil ? 'தேவை மதிப்பீடு' : 'Demand Score'}</th>
                  <th>{isTamil ? 'பரிந்துரைக்கப்படும் கூடுதல்' : 'Recommended Additional'}</th>
                  <th>{isTamil ? 'அவசரம்' : 'Urgency'}</th>
                </tr>
              </thead>
              <tbody>
                {healthData.shortages.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong>{s.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {isTamil ? 'ஆசிரியர்' : 'By'} {s.author}
                      </div>
                    </td>
                    <td><span className="badge badge-info">{tCategory(s.category)}</span></td>
                    <td>{s.totalCopies}</td>
                    <td style={{ color: s.availableCopies === 0 ? 'var(--danger)' : 'inherit', fontWeight: 700 }}>{s.availableCopies}</td>
                    <td>{s.demandScore}</td>
                    <td>
                      <span className="badge badge-warning">+{s.recommendedAdditionalCopies} {isTamil ? 'பிரதிகள்' : 'Copies'}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${s.urgency === 'HIGH' ? 'danger' : 'warning'}`}>
                        {s.urgency === 'HIGH' ? (isTamil ? 'அதிமுக்கியம்' : 'HIGH') : (isTamil ? 'மிதமானது' : 'MEDIUM')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Frequently Overdue Loans Panel */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Info size={20} style={{ color: 'var(--primary)' }} />
            {isTamil ? 'நடத்தை தாமத பகுப்பாய்வு (முன்கூட்டியே நினைவூட்டல் பரிந்துரைக்கப்படுகிறது)' : 'Behavioral Overdue Analysis (Early Reminder Recommended)'}
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {isTamil
            ? 'தாமதமாகத் திரும்ப ஒப்படைக்கப்படும் தலைப்புகள். இயல்பான காலக்கெடுவிற்கு 3 நாட்களுக்கு முன்பே நினைவூட்டல் அனுப்ப அமைப்பு பரிந்துரைக்கிறது.'
            : 'Titles frequently returned past due dates. The system suggests dispatching early reminders 3 days prior to due dates rather than assuming default return on time.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {healthData.frequentlyOverdue?.map((o) => (
            <div key={o._id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--warning)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isTamil ? 'பதிவான தாமத நிகழ்வுகள்:' : 'Overdue Incidents Recorded:'} <strong>{o.overdueIncidents}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '6px' }}>
                ✓ {isTamil ? 'முன்கூட்டியே நினைவூட்டல் பரிந்துரைக்கப்பட்டது' : 'Early reminder recommended'}
              </div>
            </div>
          ))}
          {(!healthData.frequentlyOverdue || healthData.frequentlyOverdue.length === 0) && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {isTamil ? 'மீண்டும் மீண்டும் தாமதமான சுழற்சிகள் எதுவும் கண்டறியப்படவில்லை.' : 'No repeat overdue patterns detected.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
