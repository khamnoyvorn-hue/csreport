/**
 * Persistent Storage Helper for saving & restoring uploaded Excel reports
 * in browser localStorage so uploaded data is NEVER lost on page refresh.
 */

const STORAGE_KEY_JSON = 'CS_REPORT_CACHE_JSON_V2';
const STORAGE_KEY_META = 'CS_REPORT_CACHE_META_V2';

/**
 * Save parsed report object directly to localStorage
 */
export function saveCachedReport(parsedReport, fileName = '') {
  try {
    if (!parsedReport) return false;
    const jsonStr = JSON.stringify(parsedReport);
    localStorage.setItem(STORAGE_KEY_JSON, jsonStr);
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify({
      fileName: fileName || parsedReport.dateTitle || 'Uploaded Report',
      savedAt: new Date().toISOString()
    }));
    console.log('✅ Successfully saved uploaded report to localStorage cache');
    return true;
  } catch (err) {
    console.warn('Failed to cache report in localStorage:', err);
    return false;
  }
}

/**
 * Retrieve cached parsed report object from localStorage if present
 */
export function getCachedReport() {
  try {
    const jsonStr = localStorage.getItem(STORAGE_KEY_JSON);
    const metaStr = localStorage.getItem(STORAGE_KEY_META);
    if (!jsonStr) return null;

    const parsedReport = JSON.parse(jsonStr);
    const meta = metaStr ? JSON.parse(metaStr) : null;

    return {
      reportData: parsedReport,
      fileName: meta?.fileName,
      savedAt: meta?.savedAt
    };
  } catch (err) {
    console.warn('Failed to read cached report from localStorage:', err);
    return null;
  }
}

/**
 * Clear cached report from localStorage (Reset to Server Default)
 */
export function clearCachedReport() {
  try {
    localStorage.removeItem(STORAGE_KEY_JSON);
    localStorage.removeItem(STORAGE_KEY_META);
    console.log('Cleared cached report from localStorage');
  } catch (err) {
    console.warn('Failed to clear cached report:', err);
  }
}
