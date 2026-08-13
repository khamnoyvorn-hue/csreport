import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, Upload, Globe, Bot, CheckCircle2, ShieldCheck, X, Eye, EyeOff, Send, Cpu, Unplug, Activity, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/telegramSdk';

export function AdminSettingsModal({
  isOpen,
  onClose,
  onOpenUpload,
  lang,
  onToggleLang,
  t,
  botToken,
  onSaveBotToken
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Bot settings state
  const [inputToken, setInputToken] = useState(botToken || '8828936242:AAEjg4dj6aiSulWQ3AtbeniO7YOCS8rTjS8');
  const [showToken, setShowToken] = useState(false);
  const [botStatus, setBotStatus] = useState({
    status: 'connected',
    username: '@reportcs168_bot',
    firstName: 'Report CS',
    botId: '8828936242',
    canJoinGroups: true
  });
  const [actionMsg, setActionMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated && inputToken) {
      const targetToken = inputToken.trim();
      if (!targetToken) {
        setBotStatus({ status: 'disconnected', username: 'Disconnected' });
        return;
      }
      setIsCheckingStatus(true);
      fetch(`https://api.telegram.org/bot${targetToken}/getMe`)
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            setBotStatus({
              status: 'connected',
              username: `@${data.result.username}`,
              firstName: data.result.first_name || 'Report CS',
              botId: String(data.result.id),
              canJoinGroups: data.result.can_join_groups ?? true
            });
          } else {
            setBotStatus({ status: 'error', username: 'Invalid Token' });
          }
        })
        .catch(() => {
          setBotStatus({ status: 'error', username: 'Connection Error' });
        })
        .finally(() => {
          setIsCheckingStatus(false);
        });
    }
  }, [isOpen, isAuthenticated, inputToken]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '123') {
      triggerHaptic('impact', 'medium');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      triggerHaptic('notification', 'error');
      setErrorMsg('លេខកូដសម្ងាត់មិនត្រឹមត្រូវ!');
    }
  };

  const handleSaveToken = () => {
    if (!inputToken.trim()) return;
    setIsProcessing(true);
    triggerHaptic('impact', 'light');

    // Test token connection with Telegram API
    fetch(`https://api.telegram.org/bot${inputToken.trim()}/getMe`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setBotStatus({
            status: 'connected',
            username: `@${data.result.username}`,
            firstName: data.result.first_name || 'Report CS',
            botId: String(data.result.id),
            canJoinGroups: data.result.can_join_groups ?? true
          });
          onSaveBotToken(inputToken.trim());
          setActionMsg(`✅ ភ្ជាប់ជោគជ័យជាមួយ Telegram Bot @${data.result.username}!`);
        } else {
          setBotStatus({ status: 'error', username: 'Invalid Token' });
          setActionMsg('❌ Telegram Bot Token មិនត្រឹមត្រូវ!');
        }
      })
      .catch(() => {
        setBotStatus({ status: 'error', username: 'Connection Error' });
        setActionMsg('❌ មិនអាចភ្ជាប់ទៅកាន់ Telegram API');
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const handleSetMenuButton = () => {
    if (!inputToken.trim()) return;
    setIsProcessing(true);
    triggerHaptic('impact', 'medium');

    const webAppUrl = 'https://report-cs-mini-app.pages.dev';

    fetch(`https://api.telegram.org/bot${inputToken.trim()}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '📊 របាយការណ៍ CS Report',
          web_app: { url: webAppUrl }
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setActionMsg('✅ បានដំឡើង Menu Button ក្នុង Telegram ជោគជ័យ!');
        } else {
          setActionMsg('❌ មិនអាចដំឡើង Menu Button ក្នុង Telegram');
        }
      })
      .catch(() => {
        setActionMsg('❌ បរាជ័យក្នុងការភ្ជាប់ទៅ Telegram Server');
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const handleDisconnectBot = () => {
    setIsProcessing(true);
    triggerHaptic('impact', 'medium');

    const currentToken = inputToken.trim();
    if (currentToken) {
      // Clear Telegram Webhook if set
      fetch(`https://api.telegram.org/bot${currentToken}/deleteWebhook`).catch(() => {});
    }

    setInputToken('');
    setBotStatus({ status: 'disconnected', username: 'Disconnected' });
    onSaveBotToken('');
    setActionMsg('🔌 បានផ្តាច់ Telegram Bot Token និង Webhook រួចរាល់!');
    setIsProcessing(false);
  };

  const handleCloseModal = () => {
    setIsAuthenticated(false);
    setPassword('');
    setErrorMsg('');
    setActionMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '22px', borderRadius: '18px' }}
      >
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: '1.1rem'
            }}>
              C
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                @cs_manager Admin Settings
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {isAuthenticated ? 'គ្រប់គ្រង Bot & ទិន្នន័យប្រព័ន្ធ' : 'សូមបញ្ចូលលេខកូដដើម្បីចូលប្រើ'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. SCREEN: PASSWORD REQUIRED (PIN 123) */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Lock size={28} color="var(--accent-cyan)" />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ការការពារសុវត្ថិភាព Admin
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                សូមបញ្ចូលលេខកូដសម្ងាត់ដើម្បីបើក Admin Control Panel
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="បញ្ចូលលេខកូដសម្ងាត់..."
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{ paddingLeft: '38px', fontSize: '0.9rem', letterSpacing: '2px', textAlign: 'center' }}
              />
            </div>

            {errorMsg && (
              <div style={{
                padding: '8px 12px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '6px',
                color: '#fb7185',
                fontSize: '0.78rem',
                textAlign: 'center'
              }}>
                {errorMsg}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '0.88rem', width: '100%', justifyContent: 'center' }}>
              <ShieldCheck size={16} /> ផ្ទៀងផ្ទាត់លេខកូដ
            </button>
          </form>
        ) : (

          /* 2. SCREEN: ADMIN DASHBOARD (AFTER PIN 123 ENTERED) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Action 1: Upload Excel File */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={16} color="var(--accent-cyan)" /> {t.uploadExcel}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>.xlsx / .xls</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                ទាញយក ឬបញ្ចូលឯកសារ Excel របាយការណ៍ថ្មី
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleCloseModal();
                  onOpenUpload();
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}
              >
                <Upload size={15} /> ជ្រើសរើសឯកសារ Excel
              </button>
            </div>

            {/* Action 2: Language Switcher */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} color="var(--accent-purple)" /> ភាសា / Language
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {lang === 'km' ? '🇰🇭 ខ្មែរ (Default)' : '🇬🇧 English'}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  triggerHaptic('selection');
                  onToggleLang();
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.82rem', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              >
                <Globe size={15} /> ប្តូរភាសា ({lang === 'km' ? 'Switch to English' : 'ប្តូរមកភាសាខ្មែរ'})
              </button>
            </div>

            {/* Action 3: Telegram Bot Control & Connection */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={16} color="var(--accent-amber)" /> Telegram Bot Control
                </span>
                {botStatus.status === 'connected' ? (
                  <span className="badge badge-profit" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={10} /> {botStatus.username}
                  </span>
                ) : (
                  <span className="badge badge-loss" style={{ fontSize: '0.68rem' }}>Disconnected</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Telegram Bot API Token:
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showToken ? 'text' : 'password'}
                    className="input-field"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="e.g. 8828936242:AAEjg4dj..."
                    style={{ paddingRight: '36px', fontSize: '0.78rem', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handleSaveToken}
                    disabled={isProcessing}
                    style={{ flex: 1, minWidth: '110px', fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
                  >
                    <Cpu size={14} /> ភ្ជាប់ Bot Token
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={handleSetMenuButton}
                    disabled={isProcessing}
                    style={{ flex: 1, minWidth: '130px', fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
                  >
                    <Send size={14} /> ដំឡើង Menu Button
                  </button>

                  <button
                    className="btn"
                    onClick={handleDisconnectBot}
                    disabled={isProcessing}
                    style={{
                      flex: '1 1 100%',
                      fontSize: '0.78rem',
                      padding: '6px',
                      justifyContent: 'center',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      color: '#fb7185'
                    }}
                  >
                    <Unplug size={14} /> ផ្តាច់ Bot Token (Disconnect)
                  </button>
                </div>

                {/* 4. Dedicated Bot Live Status Panel Card */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: botStatus.status === 'connected' ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: '10px',
                  padding: '12px',
                  marginTop: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <Activity size={14} color={botStatus.status === 'connected' ? '#38bdf8' : '#fb7185'} /> ស្ថានភាព Bot (Bot Live Status):
                    </span>
                    {isCheckingStatus ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={10} className="spin" /> កំពុងពិនិត្យ...
                      </span>
                    ) : botStatus.status === 'connected' ? (
                      <span style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }}></span>
                        Online / Active
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#fb7185', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fb7185', display: 'inline-block' }}></span>
                        Offline / Disconnected
                      </span>
                    )}
                  </div>

                  {botStatus.status === 'connected' && (
                    <>
                      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>ឈ្មោះ Bot: </span>
                          <strong style={{ color: '#fff' }}>{botStatus.firstName || 'Report CS'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Username: </span>
                          <strong style={{ color: 'var(--accent-cyan)' }}>{botStatus.username}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Bot ID: </span>
                          <code style={{ color: 'var(--accent-amber)', fontSize: '0.72rem' }}>{botStatus.botId || '8828936242'}</code>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Polling Mode: </span>
                          <span style={{ color: '#4ade80', fontWeight: 600 }}>Active 🟢</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {actionMsg && (
                  <div style={{
                    fontSize: '0.74rem',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}>
                    {actionMsg}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
