import React from 'react';

export function SkeletonLoader({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {items.map((i) => (
          <div key={i} className="card" style={{ height: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ height: '160px', width: '100%' }} />
            <div className="skeleton" style={{ height: '24px', width: '75%' }} />
            <div className="skeleton" style={{ height: '16px', width: '50%' }} />
            <div className="skeleton" style={{ height: '40px', width: '100%', marginTop: 'auto' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="table-container" style={{ padding: '1rem' }}>
        {items.map((i) => (
          <div key={i} className="skeleton" style={{ height: '48px', width: '100%', marginBottom: '10px' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((i) => (
        <div key={i} className="skeleton" style={{ height: '28px', width: '100%' }} />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title = "No data found", description = "There are no records matching your query.", action }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', margin: '1rem 0' }}>
      {Icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}
        >
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

import { useLanguage } from '../../context/LanguageContext';

export function StatusBadge({ status }) {
  const { t, isTamil } = useLanguage();

  const variantMap = {
    AVAILABLE: 'success',
    ISSUED: 'warning',
    OVERDUE: 'danger',
    RETURNED: 'info',
    RESERVED: 'purple',
    WAITING: 'warning',
    READY: 'success',
    CANCELLED: 'danger',
    OUT_OF_STOCK: 'danger',
    ACTIVE: 'success',
    INACTIVE: 'danger',
    PENDING: 'warning',
    APPROVED: 'success',
    PURCHASED: 'info',
    REJECTED: 'danger',
    ADMIN: 'purple',
    LIBRARIAN: 'info',
    STUDENT: 'success',
    ARCHIVED: 'secondary'
  };

  const tamilMap = {
    AVAILABLE: 'கிடைக்கும்',
    ISSUED: 'வழங்கப்பட்டது',
    OVERDUE: 'தாமதமானது',
    RETURNED: 'திரும்பப் பெறப்பட்டது',
    RESERVED: 'முன்பதிவு',
    WAITING: 'வரிசையில்',
    READY: 'பெறத் தயார்',
    CANCELLED: 'ரத்து',
    OUT_OF_STOCK: 'கையிருப்பில்லை',
    ACTIVE: 'செயலில்',
    INACTIVE: 'செயலற்றது',
    PENDING: 'நிலுவையில்',
    APPROVED: 'ஒப்புதல்',
    PURCHASED: 'வாங்கப்பட்டது',
    REJECTED: 'நிராகரிப்பு',
    ADMIN: 'நிர்வாகி',
    LIBRARIAN: 'நூலகர்',
    STUDENT: 'மாணவர்',
    ARCHIVED: 'காப்பகம்'
  };

  const englishMap = {
    AVAILABLE: 'Available',
    ISSUED: 'Issued',
    OVERDUE: 'Overdue',
    RETURNED: 'Returned',
    RESERVED: 'Reserved',
    WAITING: 'In Queue',
    READY: 'Ready for Pickup',
    CANCELLED: 'Cancelled',
    OUT_OF_STOCK: 'Out of Stock',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PURCHASED: 'Purchased',
    REJECTED: 'Rejected',
    ADMIN: 'Admin',
    LIBRARIAN: 'Librarian',
    STUDENT: 'Student',
    ARCHIVED: 'Archived'
  };

  const variant = variantMap[status] || 'info';
  const label = isTamil ? (tamilMap[status] || status) : (englishMap[status] || status);

  return <span className={`badge badge-${variant}`}>{label}</span>;
}
