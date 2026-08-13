import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { formatCurrency } from '../utils/excelParser';
import { triggerHaptic } from '../utils/telegramSdk';

export function MemberDetailView({ allMembers, csList, selectedCsFilter, onCsFilterChange, t }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  // Default sort by 'count' (ប្រតិបត្តិការ / Transaction Count) descending from highest to lowest
  const [sortField, setSortField] = useState('count');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!allMembers || allMembers.length === 0) return null;

  // Filter members
  const filteredMembers = allMembers.filter(m => {
    const matchesSearch = m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.csName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCs = selectedCsFilter ? m.csName === selectedCsFilter : true;
    const matchesActive = activeOnly ? m.isActive : true;
    return matchesSearch && matchesCs && matchesActive;
  });

  // Sort members (defaults to count descending)
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    triggerHaptic('selection');
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
      
      {/* Title & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '14px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-cyan)" /> {t.memberTitle}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {t.memberSub} ({sortedMembers.length}) {selectedCsFilter ? `[${selectedCsFilter}]` : ''}
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '420px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '130px' }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={t.searchMember}
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
            />
          </div>

          <select
            className="input-field"
            value={selectedCsFilter || ''}
            onChange={(e) => {
              triggerHaptic('selection');
              onCsFilterChange(e.target.value || null);
            }}
            style={{ width: '110px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="">{t.allCsAgents}</option>
            {csList.map(cs => (
              <option key={cs.csName} value={cs.csName}>{cs.csName}</option>
            ))}
          </select>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                triggerHaptic('selection');
                setActiveOnly(e.target.checked);
              }}
            />
            <span>{t.activeOnly}</span>
          </label>
        </div>
      </div>

      {/* 📱 MOBILE CARD VIEW FOR MEMBERS */}
      <div className="mobile-card-view mobile-cards-list" style={{ maxHeight: '450px', overflowY: 'auto' }}>
        {sortedMembers.map((m, idx) => {
          const isProfitable = m.result >= 0;
          return (
            <div key={idx} className="mobile-card" style={{ padding: '12px' }}>
              <div className="mobile-card-header" style={{ marginBottom: '6px', paddingBottom: '6px' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                    {m.username}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    ({m.csName})
                  </span>
                </div>
                {m.isActive ? (
                  <span className="badge badge-profit" style={{ fontSize: '0.65rem' }}>{t.active}</span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{t.idle}</span>
                )}
              </div>

              <div className="mobile-card-grid">
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">🔢 {t.transCount}</span>
                  <span className="mobile-card-stat-val" style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>{m.count || 0}</span>
                </div>
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">💵 {t.refill}</span>
                  <span className="mobile-card-stat-val" style={{ fontWeight: 800 }}>{formatCurrency(m.refill)}</span>
                </div>
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">💸 {t.withdraw}</span>
                  <span className="mobile-card-stat-val" style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{formatCurrency(m.withdraw)}</span>
                </div>
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">📈 {t.netResultCol}</span>
                  <span className="mobile-card-stat-val" style={{ color: isProfitable ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 800 }}>
                    {formatCurrency(m.result)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 💻 DESKTOP TABLE VIEW FOR MEMBERS */}
      <div className="desktop-table-view custom-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t.username}</th>
              <th>{t.assignedCs}</th>
              <th className="sortable" onClick={() => handleSort('count')} style={{ textAlign: 'center', color: sortField === 'count' ? 'var(--accent-cyan)' : undefined }}>
                {t.transCount} {sortField === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => handleSort('refill')} style={{ textAlign: 'right', color: sortField === 'refill' ? 'var(--accent-cyan)' : undefined }}>
                {t.refill} {sortField === 'refill' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => handleSort('withdraw')} style={{ textAlign: 'right', color: sortField === 'withdraw' ? 'var(--accent-cyan)' : undefined }}>
                {t.withdraw} {sortField === 'withdraw' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => handleSort('result')} style={{ textAlign: 'right', color: sortField === 'result' ? 'var(--accent-cyan)' : undefined }}>
                {t.netResultCol} {sortField === 'result' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ textAlign: 'center' }}>{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((m, idx) => {
              const isProfitable = m.result >= 0;
              return (
                <tr key={idx}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{m.username}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.csName}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-amber)', fontSize: '0.92rem' }}>{m.count || '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(m.refill)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(m.withdraw)}</td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 800,
                    color: isProfitable ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {formatCurrency(m.result)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {m.isActive ? (
                      <span className="badge badge-profit" style={{ fontSize: '0.65rem' }}>{t.active}</span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{t.idle}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
