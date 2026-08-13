import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { formatCurrency } from '../utils/excelParser';
import { triggerHaptic } from '../utils/telegramSdk';

export function CsSummaryTable({ csList, onSelectCsForMemberView, t }) {
  const [searchTerm, setSearchTerm] = useState('');
  // Default sort by 'play' (អ្នកលេង / Active players) descending from highest to lowest
  const [sortField, setSortField] = useState('play');
  const [sortDirection, setSortDirection] = useState('desc');
  const [profitFilter, setProfitFilter] = useState('all');
  const [expandedCs, setExpandedCs] = useState(null);

  if (!csList || csList.length === 0) return null;

  const handleSort = (field) => {
    triggerHaptic('selection');
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredList = csList.filter(cs => {
    const matchesSearch = cs.csName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = profitFilter === 'all' 
      ? true 
      : profitFilter === 'profit' ? cs.result >= 0 : cs.result < 0;
    return matchesSearch && matchesFilter;
  });

  // Multi-level sort: Active players (play) primary descending, Total accounts (total) secondary descending
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortField === 'play') {
      if (a.play !== b.play) {
        return sortDirection === 'desc' ? b.play - a.play : a.play - b.play;
      }
      if (a.total !== b.total) {
        return sortDirection === 'desc' ? b.total - a.total : a.total - b.total;
      }
      return sortDirection === 'desc' ? b.refill - a.refill : a.refill - b.refill;
    } else if (sortField === 'total') {
      if (a.total !== b.total) {
        return sortDirection === 'desc' ? b.total - a.total : a.total - b.total;
      }
      if (a.play !== b.play) {
        return sortDirection === 'desc' ? b.play - a.play : a.play - b.play;
      }
      return sortDirection === 'desc' ? b.refill - a.refill : a.refill - b.refill;
    } else {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  const toggleExpand = (csName) => {
    triggerHaptic('impact', 'light');
    setExpandedCs(expandedCs === csName ? null : csName);
  };

  return (
    <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
      
      {/* Table Header & Search Controls */}
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
            <Trophy size={18} color="var(--accent-amber)" /> {t.leaderboardTitle}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {t.leaderboardSub} ({sortedList.length})
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '340px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '130px' }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={t.searchCs}
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
            />
          </div>

          <select
            className="input-field"
            value={profitFilter}
            onChange={(e) => {
              triggerHaptic('selection');
              setProfitFilter(e.target.value);
            }}
            style={{ width: '110px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="all">{t.allCs}</option>
            <option value="profit">{t.profitable}</option>
            <option value="loss">{t.lossOnly}</option>
          </select>
        </div>
      </div>

      {/* 📱 MOBILE CARD VIEW */}
      <div className="mobile-card-view mobile-cards-list">
        {sortedList.map((cs, idx) => {
          const isExpanded = expandedCs === cs.csName;
          const isProfitable = cs.result >= 0;

          // Members sorted by count descending
          const sortedMembersByCount = [...cs.members].sort((a, b) => (b.count || 0) - (a.count || 0));

          return (
            <div key={cs.csName} className="mobile-card">
              
              {/* Card Header */}
              <div className="mobile-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: idx < 3 ? 'var(--accent-amber)' : 'var(--text-dim)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                    {cs.csName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isProfitable ? 'badge badge-profit' : 'badge badge-loss'}>
                    {isProfitable ? t.profit : t.loss}
                  </span>
                  <button
                    onClick={() => toggleExpand(cs.csName)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* 2x2 Grid of Financial Metrics */}
              <div className="mobile-card-grid">
                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">👥 {t.activeOverTotalLabel}</span>
                  <span className="mobile-card-stat-val" style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '1.05rem' }}>
                    {cs.total} / {cs.play}
                  </span>
                </div>

                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">💵 {t.refill}</span>
                  <span className="mobile-card-stat-val" style={{ color: 'var(--text-main)', fontWeight: 800 }}>
                    {formatCurrency(cs.refill)}
                  </span>
                </div>

                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">💸 {t.withdraw}</span>
                  <span className="mobile-card-stat-val" style={{ color: 'var(--text-muted)', fontWeight: 800 }}>
                    {formatCurrency(cs.withdraw)}
                  </span>
                </div>

                <div className="mobile-card-stat">
                  <span className="mobile-card-stat-label">📈 {t.netResultCol}</span>
                  <span className="mobile-card-stat-val" style={{ color: isProfitable ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 800 }}>
                    {formatCurrency(cs.result)}
                  </span>
                </div>
              </div>

              {/* Expandable Member Details on Mobile */}
              {isExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {t.memberTitle} ({cs.members.length})
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onSelectCsForMemberView(cs.csName)}
                      style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                    >
                      {t.fullMemberView}
                    </button>
                  </div>

                  {cs.members.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.noMembers}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                      {sortedMembersByCount.map((m, mIdx) => (
                        <div key={mIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem'
                        }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#fff' }}>{m.username}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700, marginLeft: '6px' }}>
                              ({m.count || 0} trans)
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 800,
                              color: m.result >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                            }}>
                              {formatCurrency(m.result)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 💻 DESKTOP TABLE VIEW */}
      <div className="desktop-table-view custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>{t.rank}</th>
              <th className="sortable" onClick={() => handleSort('csName')}>
                {t.csName} {sortField === 'csName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => handleSort('total')} style={{ textAlign: 'center', color: sortField === 'total' ? 'var(--accent-cyan)' : undefined }}>
                {t.accounts} {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => handleSort('play')} style={{ textAlign: 'center', color: sortField === 'play' ? 'var(--accent-cyan)' : undefined }}>
                {t.active} {sortField === 'play' && (sortDirection === 'asc' ? '↑' : '↓')}
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
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((cs, idx) => {
              const isExpanded = expandedCs === cs.csName;
              const isProfitable = cs.result >= 0;
              const sortedMembersByCount = [...cs.members].sort((a, b) => (b.count || 0) - (a.count || 0));

              return (
                <React.Fragment key={cs.csName}>
                  <tr style={{ background: isExpanded ? 'rgba(56, 189, 248, 0.05)' : undefined }}>
                    
                    {/* Rank */}
                    <td style={{ fontWeight: 700, color: idx < 3 ? 'var(--accent-amber)' : 'var(--text-dim)' }}>
                      #{idx + 1}
                    </td>

                    {/* CS Name */}
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        {cs.csName}
                      </span>
                    </td>

                    {/* Total Accounts */}
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
                      {cs.total}
                    </td>

                    {/* Active Players */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(139, 92, 246, 0.18)',
                        color: 'var(--accent-purple)',
                        fontWeight: 800,
                        fontSize: '0.82rem'
                      }}>
                        {cs.play}
                      </span>
                    </td>

                    {/* Refill */}
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                      {formatCurrency(cs.refill)}
                    </td>

                    {/* Withdraw */}
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {formatCurrency(cs.withdraw)}
                    </td>

                    {/* Net Result */}
                    <td style={{
                      textAlign: 'right',
                      fontWeight: 800,
                      color: isProfitable ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {formatCurrency(cs.result)}
                    </td>

                    {/* Profit Badge */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={isProfitable ? 'badge badge-profit' : 'badge badge-loss'}>
                        {isProfitable ? t.profit : t.loss}
                      </span>
                    </td>

                    {/* Action Expand Button */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleExpand(cs.csName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-cyan)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>

                  </tr>

                  {/* Expandable Member Details Sub-row */}
                  {isExpanded && (
                    <tr style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
                      <td colSpan={9} style={{ padding: '14px 16px' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            {t.memberTitle} ({cs.csName} - {cs.members.length})
                          </h4>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              triggerHaptic('impact', 'medium');
                              onSelectCsForMemberView(cs.csName);
                            }}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            {t.fullMemberView}
                          </button>
                        </div>

                        {cs.members.length === 0 ? (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{t.noMembers}</p>
                        ) : (
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                                  <th style={{ padding: '6px' }}>{t.username}</th>
                                  <th style={{ padding: '6px', textAlign: 'center', color: 'var(--accent-cyan)' }}>{t.transCount} ↓</th>
                                  <th style={{ padding: '6px', textAlign: 'right' }}>{t.refill}</th>
                                  <th style={{ padding: '6px', textAlign: 'right' }}>{t.withdraw}</th>
                                  <th style={{ padding: '6px', textAlign: 'right' }}>{t.netResultCol}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedMembersByCount.map((m, mIdx) => (
                                  <tr key={mIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                    <td style={{ padding: '6px', fontWeight: 600 }}>{m.username}</td>
                                    <td style={{ padding: '6px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-amber)' }}>{m.count || '-'}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatCurrency(m.refill)}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{formatCurrency(m.withdraw)}</td>
                                    <td style={{
                                      padding: '6px',
                                      textAlign: 'right',
                                      fontWeight: 700,
                                      color: m.result >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                                    }}>
                                      {formatCurrency(m.result)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}

                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
