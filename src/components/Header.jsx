import React from 'react';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/telegramSdk';

export function Header({ dateTitle, onOpenAdmin, onRefreshServerData, isLoading, isBotActive, t }) {
  return (
    <header className="glass-card" style={{ padding: '14px 18px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* App Title, Dynamic Bot Status Badge & Date Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
            flexShrink: 0
          }}>
            <FileSpreadsheet size={24} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {t.appTitle}
              </h1>
              
              {/* Dynamic Bot Active / Inactive Badge */}
              {isBotActive ? (
                <span className="badge badge-profit" style={{
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 700
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  Bot Active
                </span>
              ) : (
                <span className="badge badge-loss" style={{
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 700
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }}></span>
                  Bot Inactive
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📅 {dateTitle || t.dailyReport}</span>
            </p>
          </div>
        </div>

        {/* Action Controls: Refresh Button & Circular 'C' Avatar Button ONLY */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Refresh Data Button */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              triggerHaptic('impact', 'light');
              onRefreshServerData();
            }}
            disabled={isLoading}
            title="ធ្វើបច្ចុប្បន្នភាពទិន្នន័យ"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>ធ្វើបច្ចុប្បន្នភាព</span>
          </button>

          {/* Circular 'C' Avatar Button ONLY (Triggers Password Protected Admin Modal) */}
          <button
            onClick={() => {
              triggerHaptic('impact', 'medium');
              onOpenAdmin();
            }}
            title="Admin Settings"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              padding: 0
            }}
          >
            C
          </button>

        </div>

      </div>
    </header>
  );
}
