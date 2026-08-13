import * as XLSX from 'xlsx';

/**
 * Parses an Excel file buffer into a structured CS Report data model.
 * @param {ArrayBuffer} buffer - Binary content of .xlsx file
 * @returns {Object} Structured report object
 */
export function parseExcelReport(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  let csList = [];
  let summary = {
    totalAccounts: 0,
    activePlayers: 0,
    totalRefill: 0,
    totalWithdraw: 0,
    netResult: 0,
    profitMargin: 0
  };
  let dateTitle = 'Customer Service Performance Report';

  // 1. Try extracting date string from cell A1 / row 0 of sheets
  let extractedDate = null;
  for (const sName of sheetNames) {
    const sheet = workbook.Sheets[sName];
    if (!sheet) continue;
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (rawRows && rawRows.length > 0 && rawRows[0] && rawRows[0][0]) {
      const firstCell = String(rawRows[0][0]).trim();
      if (firstCell && firstCell.toLowerCase() !== 'cs_name' && firstCell.length > 5) {
        extractedDate = firstCell;
        break;
      }
    }
  }

  if (extractedDate) {
    dateTitle = extractedDate;
  }

  // 2. Parse "Result" sheet for deep CS and Member breakdown
  const resultSheetName = sheetNames.find(s => s.toLowerCase().includes('result')) || sheetNames[0];
  if (resultSheetName) {
    const resultSheet = workbook.Sheets[resultSheetName];
    const resultData = XLSX.utils.sheet_to_json(resultSheet);

    let currentCs = null;

    resultData.forEach(row => {
      const csName = String(row['Cs_Name'] || row['CS_Name'] || row['cs_name'] || '').trim();
      if (!csName) return;

      const isCsHeader = csName.toLowerCase().startsWith('cs_') || (row['Total'] !== undefined && row['Total'] !== null && !isNaN(parseFloat(row['Total'])));

      if (isCsHeader) {
        // Exclude cs_member / cs_members header
        if (csName.toLowerCase() === 'cs_member' || csName.toLowerCase() === 'cs_members') {
          currentCs = null;
          return;
        }

        currentCs = {
          csName: csName,
          total: parseFloat(row['Total']) || 0,
          play: parseFloat(row['Play']) || 0,
          refill: parseFloat(row['Refill']) || 0,
          withdraw: parseFloat(row['Withdraw']) || 0,
          result: parseFloat(row['Result']) || 0,
          members: []
        };
        currentCs.profitMargin = currentCs.refill > 0 ? ((currentCs.result / currentCs.refill) * 100) : 0;
        csList.push(currentCs);
      } else if (currentCs) {
        // It's a member row under a valid CS agent (not cs_member)
        const refill = parseFloat(row['Refill']) || 0;
        const withdraw = parseFloat(row['Withdraw']) || 0;
        const result = parseFloat(row['Result']) !== undefined && !isNaN(parseFloat(row['Result']))
          ? parseFloat(row['Result'])
          : (refill - withdraw);

        const member = {
          csName: currentCs.csName,
          username: csName,
          count: parseFloat(row['Count']) || 0,
          refill: refill,
          withdraw: withdraw,
          result: result,
          remark: row['Remark'] !== undefined ? row['Remark'] : null,
          isActive: (parseFloat(row['Count']) > 0 || parseFloat(row['Remark']) === 1)
        };

        currentCs.members.push(member);
      }
    });
  }

  // Calculate overall summary metrics (excluding cs_member)
  if (csList.length > 0) {
    let totAcc = 0;
    let actPlay = 0;
    let totRef = 0;
    let totWith = 0;
    let totRes = 0;

    csList.forEach(cs => {
      totAcc += cs.total;
      actPlay += cs.play;
      totRef += cs.refill;
      totWith += cs.withdraw;
      totRes += cs.result;
    });

    summary = {
      totalAccounts: totAcc,
      activePlayers: actPlay,
      totalRefill: totRef,
      totalWithdraw: totWith,
      netResult: totRes,
      profitMargin: totRef > 0 ? ((totRes / totRef) * 100) : 0
    };
  }

  // Flatten all members for global member search
  const allMembers = csList.flatMap(cs => cs.members);

  return {
    dateTitle,
    summary,
    csList,
    allMembers,
    parsedAt: new Date().toISOString()
  };
}

/**
 * Format currency numbers with commas and 2 decimals
 */
export function formatCurrency(num) {
  if (num === null || num === undefined || isNaN(num)) return '$0.00';
  const val = Number(num);
  const formatted = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return val < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format simple numbers
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}
