import React, { useState, useEffect } from 'react';
import { parseExcelReport } from './utils/excelParser';
import { initTelegramApp, triggerHaptic } from './utils/telegramSdk';
import { translations } from './utils/i18n';
import { saveCachedReport, getCachedReport, clearCachedReport } from './utils/reportStorage';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { KpiCards } from './components/KpiCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CsSummaryTable } from './components/CsSummaryTable';
import { MemberDetailView } from './components/MemberDetailView';
import { LayoutDashboard, Users, FileText, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cs_table');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedCsFilter, setSelectedCsFilter] = useState(null);
  const [lang, setLang] = useState('km'); // Khmer Default (km)

  // Bot Token & Status State
  const [botToken, setBotToken] = useState(() => {
    return localStorage.getItem('TELEGRAM_BOT_TOKEN') || '8828936242:AAEjg4dj6aiSulWQ3AtbeniO7YOCS8rTjS8';
  });
  const [isBotActive, setIsBotActive] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    initTelegramApp();
    loadReport();
    checkBotStatus(botToken);
  }, []);

  const checkBotStatus = (token) => {
    if (!token) {
      setIsBotActive(false);
      return;
    }
    fetch(`https://api.telegram.org/bot${token.trim()}/getMe`)
      .then(res => res.json())
      .then(data => {
        setIsBotActive(data.ok === true);
      })
      .catch(() => {
        setIsBotActive(false);
      });
  };

  const handleSaveBotToken = (newToken) => {
    setBotToken(newToken);
    localStorage.setItem('TELEGRAM_BOT_TOKEN', newToken);
    checkBotStatus(newToken);
  };

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);

    // 1. Check local storage cache for user-uploaded report first
    const cached = getCachedReport();
    if (cached && cached.reportData && cached.reportData.csList && cached.reportData.csList.length > 0) {
      console.log('Restoring user-uploaded report from localStorage cache...');
      setReportData(cached.reportData);
      setIsLoading(false);
      return;
    }

    // 2. Fetch live data from server if no user upload exists
    fetchLiveServerReport(false);
  };

  const fetchLiveServerReport = async (shouldClearCache = false) => {
    setIsLoading(true);
    setError(null);
    if (shouldClearCache) {
      clearCachedReport();
    }
    try {
      // 1st Priority: Try fetching pre-parsed JSON report with cache buster
      const jsonRes = await fetch(`/report.json?t=${Date.now()}`);
      if (jsonRes.ok) {
        const jsonData = await jsonRes.json();
        setReportData(jsonData);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // Fallback to binary Excel
    }

    try {
      // 2nd Priority: Fetch binary Report.xlsx with cache-busting timestamp
      const response = await fetch(`/Report.xlsx?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Server report file not found');
      }
      const buffer = await response.arrayBuffer();
      const parsed = parseExcelReport(buffer);
      setReportData(parsed);
    } catch (err) {
      console.error('Error fetching live report:', err);
      setError('Could not fetch report from live server. Please upload an Excel file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    setError(null);
    fetchLiveServerReport(true);
  };

  const handleCustomFileUpload = (buffer, fileName) => {
    try {
      const parsed = parseExcelReport(buffer);
      if (!parsed.dateTitle || parsed.dateTitle === 'Customer Service Performance Report') {
        if (fileName) parsed.dateTitle = fileName;
      }
      setReportData(parsed);
      saveCachedReport(parsed, fileName);
      setError(null);

      // Try syncing with Cloudflare Worker /api/upload
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData: parsed })
      }).catch(e => console.warn('Sync /api/upload error:', e));
    } catch (err) {
      console.error('Error parsing uploaded file:', err);
      setError('Failed to parse uploaded Excel file.');
    }
  };

  const handleSelectCsForMemberView = (csName) => {
    setSelectedCsFilter(csName);
    setActiveTab('members');
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'km' ? 'en' : 'km'));
  };

  return (
    <div className="app-container">
      
      {/* Header Bar */}
      <Header
        dateTitle={reportData?.dateTitle}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onRefreshServerData={handleRefreshData}
        isLoading={isLoading}
        isBotActive={isBotActive}
        t={t}
      />

      {/* Main Tab Navigation */}
      <div className="desktop-tabs" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '10px',
        overflowX: 'auto'
      }}>
        <button
          className={`btn ${activeTab === 'cs_table' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { triggerHaptic('selection'); setActiveTab('cs_table'); }}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <FileText size={16} /> {t.csLeaderboard} ({reportData?.csList?.length || 0})
        </button>

        <button
          className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { triggerHaptic('selection'); setActiveTab('members'); }}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Users size={16} /> {t.memberDrilldown} ({reportData?.allMembers?.length || 0})
        </button>

        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { triggerHaptic('selection'); setActiveTab('overview'); }}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <LayoutDashboard size={16} /> {t.overviewAnalytics}
        </button>
      </div>

      {/* Error state alert */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#fb7185',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.82rem' }}>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <RefreshCw size={36} color="var(--accent-cyan)" className="spin" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>កំពុងទាញយកទិន្នន័យ...</h3>
        </div>
      ) : reportData ? (
        <main className="animate-fade-in">
          
          {/* 1st Tab: CS Leaderboard */}
          {activeTab === 'cs_table' && (
            <CsSummaryTable
              csList={reportData.csList}
              onSelectCsForMemberView={handleSelectCsForMemberView}
              t={t}
            />
          )}

          {/* 2nd Tab: Member Drilldown */}
          {activeTab === 'members' && (
            <MemberDetailView
              allMembers={reportData.allMembers}
              csList={reportData.csList}
              selectedCsFilter={selectedCsFilter}
              onCsFilterChange={setSelectedCsFilter}
              t={t}
            />
          )}

          {/* 3rd Tab: Overview Analytics */}
          {activeTab === 'overview' && (
            <>
              <KpiCards summary={reportData.summary} t={t} />
              <AnalyticsCharts csList={reportData.csList} t={t} />
            </>
          )}

        </main>
      ) : null}

      {/* Admin Settings Modal (PIN Password 123) */}
      <AdminSettingsModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onOpenUpload={() => setIsUploadOpen(true)}
        lang={lang}
        onToggleLang={toggleLanguage}
        t={t}
        botToken={botToken}
        onSaveBotToken={handleSaveBotToken}
      />

      {/* File Upload Modal */}
      <FileUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileUpload={handleCustomFileUpload}
        t={t}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="mobile-nav-bar">
        <button
          className={`mobile-nav-item ${activeTab === 'cs_table' ? 'active' : ''}`}
          onClick={() => { triggerHaptic('selection'); setActiveTab('cs_table'); }}
        >
          <FileText size={18} />
          <span>{t.navLeaderboard}</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => { triggerHaptic('selection'); setActiveTab('members'); }}
        >
          <Users size={18} />
          <span>{t.navMembers}</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => { triggerHaptic('selection'); setActiveTab('overview'); }}
        >
          <LayoutDashboard size={18} />
          <span>{t.navOverview}</span>
        </button>
      </div>

    </div>
  );
}
