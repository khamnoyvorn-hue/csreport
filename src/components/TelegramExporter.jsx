import React, { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/excelParser';
import { triggerHaptic, getTelegramApp } from '../utils/telegramSdk';
import confetti from 'canvas-confetti';

export function TelegramExporter({ reportData, t }) {
  const [copied, setCopied] = useState(false);

  if (!reportData || !reportData.summary) return null;

  const { dateTitle, summary, csList } = reportData;

  // Top 5 CS agents
  const topCs = [...csList]
    .sort((a, b) => b.result - a.result)
    .slice(0, 5);

  // Generate Telegram Formatted Summary with i18n support
  const generateTelegramText = () => {
    let msg = `${t.tgReportHeader}\n`;
    msg += `📅 _${dateTitle || t.dailyReport}_\n\n`;
    
    msg += `${t.tgRefill} \`${formatCurrency(summary.totalRefill)}\` \n`;
    msg += `${t.tgWithdraw} \`${formatCurrency(summary.totalWithdraw)}\` \n`;
    msg += `${t.tgNetResult} \`${formatCurrency(summary.netResult)}\` (${summary.profitMargin.toFixed(1)}% ${t.margin})\n`;
    msg += `${t.tgActivePlayers} ${formatNumber(summary.activePlayers)} / ${formatNumber(summary.totalAccounts)}\n\n`;

    msg += `${t.tgLeaderboardHeader}\n`;
    topCs.forEach((cs, i) => {
      const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
      msg += `${icon} *${cs.csName}*: Refill: \`${formatCurrency(cs.refill)}\` | Net: \`${formatCurrency(cs.result)}\` (${cs.play}/${cs.total} ${t.active})\n`;
    });

    msg += `\n🤖 _Generated via Telegram Mini App_`;
    return msg;
  };

  const telegramText = generateTelegramText();

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramText);
    setCopied(true);
    triggerHaptic('notification', 'success');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-card" style={{ padding: '18px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--accent-purple)" /> {t.exportTitle}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {t.exportSub}
          </p>
        </div>

        <button
          className="btn btn-success"
          onClick={handleCopy}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? t.copied : t.copySummary}</span>
        </button>
      </div>

      {/* Message Preview Box */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        fontFamily: 'Kantumruy Pro, monospace',
        fontSize: '0.82rem',
        color: '#e2e8f0',
        whiteSpace: 'pre-wrap',
        maxHeight: '220px',
        overflowY: 'auto'
      }}>
        {telegramText}
      </div>
    </div>
  );
}
