import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/excelParser';

export function KpiCards({ summary, t }) {
  if (!summary) return null;

  const isProfitable = summary.netResult >= 0;
  const activePercent = summary.totalAccounts > 0 
    ? Math.round((summary.activePlayers / summary.totalAccounts) * 100)
    : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    }}>
      
      {/* 1. Total Refill */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.totalRefill}</span>
          <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)' }}>
            <Wallet size={18} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {formatCurrency(summary.totalRefill)}
        </h2>
        <p style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          {t.refillDesc}
        </p>
      </div>

      {/* 2. Total Withdraw */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.totalWithdraw}</span>
          <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>
            <DollarSign size={18} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {formatCurrency(summary.totalWithdraw)}
        </h2>
        <p style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          {t.withdrawDesc}
        </p>
      </div>

      {/* 3. Net Result (Profit / Loss) */}
      <div className="glass-card" style={{
        padding: '16px 18px',
        position: 'relative',
        overflow: 'hidden',
        border: isProfitable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.netResult}</span>
          <div style={{
            padding: '7px',
            borderRadius: '10px',
            background: isProfitable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: isProfitable ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {isProfitable ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
        </div>
        <h2 style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: isProfitable ? 'var(--accent-green)' : 'var(--accent-red)'
        }}>
          {formatCurrency(summary.netResult)}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span className={isProfitable ? 'badge badge-profit' : 'badge badge-loss'}>
            {summary.profitMargin.toFixed(1)}% {t.margin}
          </span>
        </div>
      </div>

      {/* 4. Active Players Ratio */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.activePlayers}</span>
          <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-purple)' }}>
            <Users size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatNumber(summary.activePlayers)}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            / {formatNumber(summary.totalAccounts)} {t.totalAccounts}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          marginTop: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${activePercent}%`,
            height: '100%',
            background: 'var(--gradient-accent)',
            borderRadius: '4px'
          }} />
        </div>
      </div>

    </div>
  );
}
