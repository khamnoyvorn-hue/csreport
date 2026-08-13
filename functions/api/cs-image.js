import * as XLSX from 'xlsx';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

let wasmPromise = null;

async function ensureWasm(webAppUrl) {
  if (!wasmPromise) {
    wasmPromise = (async () => {
      try {
        const wasmRes = await fetch(`${webAppUrl}/index_bg.wasm`);
        if (wasmRes.ok) {
          const wasmBuf = await wasmRes.arrayBuffer();
          await initWasm(wasmBuf);
        }
      } catch (e) {
        console.error('Wasm init error:', e);
      }
    })();
  }
  await wasmPromise;
}

function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatCurrency(num) {
  if (num === null || num === undefined || isNaN(num)) return '$ -';
  const val = Number(num);
  if (val === 0) return '$ -';
  const formatted = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return val < 0 ? `$ (${formatted})` : `$ ${formatted}`;
}

function isMemberRed(m) {
  return (m.count || 0) >= 3 || (m.refill || 0) >= 50;
}

function parseExcelReport(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  let csList = [];
  const resultSheetName = sheetNames.find(s => s.toLowerCase().includes('result')) || sheetNames[0];
  if (!resultSheetName) return { csList: [] };

  const resultSheet = workbook.Sheets[resultSheetName];
  const resultData = XLSX.utils.sheet_to_json(resultSheet);

  let currentCs = null;

  resultData.forEach(row => {
    const csName = String(row['Cs_Name'] || row['CS_Name'] || row['cs_name'] || '').trim();
    if (!csName) return;

    const isCsHeader = csName.toLowerCase().startsWith('cs_') || (row['Total'] !== undefined && row['Total'] !== null && !isNaN(parseFloat(row['Total'])));

    if (isCsHeader) {
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
      csList.push(currentCs);
    } else if (currentCs) {
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
        remark: row['Remark'] !== undefined ? row['Remark'] : null
      };

      currentCs.members.push(member);
    }
  });

  return { csList };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const csName = url.searchParams.get('cs') || '';
  const webAppUrl = env.WEBAPP_URL || 'https://report-cs-mini-app.pages.dev';

  let reportData = null;

  // 1. Try reading from Cloudflare REPORT_KV namespace first (global synced upload)
  if (env.REPORT_KV) {
    try {
      const kvData = await env.REPORT_KV.get('LATEST_REPORT', 'json');
      if (kvData && kvData.csList && kvData.csList.length > 0) {
        reportData = kvData;
      }
    } catch (e) {}
  }

  // 2. Fallback to static report.json
  if (!reportData || !reportData.csList) {
    try {
      const jsonRes = await fetch(`${webAppUrl}/report.json?t=${Date.now()}`);
      if (jsonRes.ok) {
        reportData = await jsonRes.json();
      }
    } catch (e) {}
  }

  if (!reportData || !reportData.csList) {
    try {
      const excelRes = await fetch(`${webAppUrl}/Report.xlsx?t=${Date.now()}`);
      if (excelRes.ok) {
        const buf = await excelRes.arrayBuffer();
        reportData = parseExcelReport(buf);
      }
    } catch (e) {}
  }

  const cs = reportData?.csList?.find(c => c.csName.toLowerCase() === csName.toLowerCase()) || reportData?.csList?.[0];

  if (!cs) {
    return new Response('CS Not Found', { status: 404 });
  }

  // Sort members: RED font rows (Trans >= 3 OR Refill >= $50) sorted to TOP!
  const members = [...(cs.members || [])].sort((a, b) => {
    const aRed = isMemberRed(a) ? 1 : 0;
    const bRed = isMemberRed(b) ? 1 : 0;
    if (bRed !== aRed) return bRed - aRed;
    if ((b.count || 0) !== (a.count || 0)) return (b.count || 0) - (a.count || 0);
    return (b.refill || 0) - (a.refill || 0);
  });

  const rowHeight = 28;
  const colWidths = [135, 45, 45, 60, 85, 85, 85];
  const width = colWidths.reduce((a, b) => a + b, 0); // 540px
  const totalRows = Math.max(members.length, 1) + 2;
  const height = totalRows * rowHeight;

  let colX = [0];
  for (let i = 0; i < colWidths.length; i++) {
    colX.push(colX[i] + colWidths[i]);
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<style>
    .cell-text { font-family: Arial, sans-serif; font-size: 13px; }
    .header-text { font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #000000; }
    .red-text { font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #cc0000; }
    .black-text { fill: #000000; }
  </style>`;

  // Background white
  svg += `<rect width="${width}" height="${height}" fill="#ffffff" />`;

  // Row 0: Yellow Header Background
  svg += `<rect x="0" y="0" width="${width}" height="${rowHeight}" fill="#ffff00" />`;

  // Row 1: Soft Light Green Summary Background matching cs_kimsorn across full width!
  svg += `<rect x="0" y="${rowHeight}" width="${width}" height="${rowHeight}" fill="#e2efda" />`;

  // --- HEADER TEXTS (Row 0 - All aligned on Top Row!) ---
  const headers = ['Cs_Name', 'Total', 'Play', 'Tran', 'Refill', 'Withdraw', 'Result'];
  headers.forEach((h, i) => {
    const xMid = colX[i] + colWidths[i] / 2;
    svg += `<text x="${xMid}" y="${rowHeight * 0.68}" text-anchor="middle" class="header-text">${escapeXml(h)}</text>`;
  });

  // --- CS SUMMARY VALUES (Row 1) ---
  svg += `<text x="${colX[0] + colWidths[0] / 2}" y="${rowHeight * 1.68}" text-anchor="middle" class="header-text">${escapeXml(cs.csName)}</text>`;
  svg += `<text x="${colX[1] + colWidths[1] / 2}" y="${rowHeight * 1.68}" text-anchor="middle" class="header-text">${cs.total}</text>`;
  svg += `<text x="${colX[2] + colWidths[2] / 2}" y="${rowHeight * 1.68}" text-anchor="middle" class="header-text">${cs.play}</text>`;
  svg += `<text x="${colX[4] + colWidths[4] - 6}" y="${rowHeight * 1.68}" text-anchor="end" class="header-text">${formatCurrency(cs.refill)}</text>`;
  svg += `<text x="${colX[5] + colWidths[5] - 6}" y="${rowHeight * 1.68}" text-anchor="end" class="header-text">${formatCurrency(cs.withdraw)}</text>`;
  svg += `<text x="${colX[6] + colWidths[6] - 6}" y="${rowHeight * 1.68}" text-anchor="end" class="header-text">${formatCurrency(cs.result)}</text>`;

  // --- MEMBER ROWS (Row 2..N) ---
  members.forEach((m, idx) => {
    const y = (idx + 2) * rowHeight;
    const isEven = idx % 2 === 0;
    if (!isEven) {
      svg += `<rect x="0" y="${y}" width="${width}" height="${rowHeight}" fill="#fcfcfc" />`;
    }

    // RED FONT CONDITION: count >= 3 OR refill >= $50!
    const isRed = isMemberRed(m);
    const fontClass = isRed ? 'red-text' : 'cell-text black-text';

    // Col 0: Member Username
    svg += `<text x="8" y="${y + rowHeight * 0.68}" text-anchor="start" class="${fontClass}">${escapeXml(m.username)}</text>`;

    // Col 3: Transaction Count
    const transStr = (m.count || 0) > 0 ? String(m.count) : '0';
    svg += `<text x="${colX[3] + colWidths[3] / 2}" y="${y + rowHeight * 0.68}" text-anchor="middle" class="${fontClass}">${transStr}</text>`;

    // Col 4: Refill
    svg += `<text x="${colX[4] + colWidths[4] - 6}" y="${y + rowHeight * 0.68}" text-anchor="end" class="cell-text black-text">${m.refill > 0 ? formatCurrency(m.refill) : '$     -'}</text>`;

    // Col 5: Withdraw
    svg += `<text x="${colX[5] + colWidths[5] - 6}" y="${y + rowHeight * 0.68}" text-anchor="end" class="cell-text black-text">${m.withdraw > 0 ? formatCurrency(m.withdraw) : '$     -'}</text>`;

    // Col 6: Result
    let resultText = '$     -';
    if (m.result < 0) {
      resultText = `$ (${Math.abs(m.result).toFixed(2)})`;
    } else if (m.result > 0) {
      resultText = formatCurrency(m.result);
    }
    svg += `<text x="${colX[6] + colWidths[6] - 6}" y="${y + rowHeight * 0.68}" text-anchor="end" class="cell-text black-text">${resultText}</text>`;
  });

  // --- GRID LINES ---
  for (let r = 0; r <= totalRows; r++) {
    const y = r * rowHeight;
    svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#a6a6a6" stroke-width="1" />`;
  }
  for (let c = 0; c <= colWidths.length; c++) {
    const x = colX[c];
    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#a6a6a6" stroke-width="1" />`;
  }

  // Outer border
  svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#000000" stroke-width="2" />`;

  svg += `</svg>`;

  try {
    await ensureWasm(webAppUrl);
    const resvg = new Resvg(svg, {
      font: {
        loadSystemFonts: false
      }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (err) {
    console.error('PNG render error:', err);
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
}
