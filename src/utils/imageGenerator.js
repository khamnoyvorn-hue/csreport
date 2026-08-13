import { createCanvas } from 'canvas';
import { formatCurrency } from './excelParser.js';

export function isMemberRed(m) {
  return (m.count || 0) >= 3 || (m.refill || 0) >= 50;
}

export function generateCsReportImage(cs) {
  // Sort members: RED font rows (Trans >= 3 OR Refill >= $50) sorted to the TOP!
  const members = [...(cs.members || [])].sort((a, b) => {
    const aRed = isMemberRed(a) ? 1 : 0;
    const bRed = isMemberRed(b) ? 1 : 0;

    // 1. Red font rows sorted to TOP
    if (bRed !== aRed) return bRed - aRed;

    // 2. Sort by Transaction count descending
    if ((b.count || 0) !== (a.count || 0)) return (b.count || 0) - (a.count || 0);

    // 3. Sort by Refill amount descending
    return (b.refill || 0) - (a.refill || 0);
  });

  const rowCount = Math.max(members.length, 1) + 2; // header 2 rows + member rows
  const cellHeight = 28;
  const width = 540;
  const height = rowCount * cellHeight + 10;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Column definitions: x offset, width, align
  const cols = [
    { label: cs.csName, width: 135, align: 'left' },    // Col A: Username / CS Name
    { label: 'Total', width: 45, align: 'center' },      // Col B: Total
    { label: 'Play', width: 45, align: 'center' },       // Col C: Play
    { label: 'Tran', width: 60, align: 'center' },       // Col D: Tran
    { label: 'Refill', width: 85, align: 'right' },      // Col E: Refill
    { label: 'Withdraw', width: 85, align: 'right' },    // Col F: Withdraw
    { label: 'Result', width: 85, align: 'right' }       // Col G: Result
  ];

  const colX = [0];
  for (let i = 0; i < cols.length; i++) {
    colX.push(colX[i] + cols[i].width);
  }

  // --- HEADER ROW 0 (Bright Excel Yellow Headers) ---
  ctx.fillStyle = '#ffff00'; // Bright Excel Yellow
  ctx.fillRect(0, 0, width, cellHeight);

  // --- ROW 1 (Soft Light Green Values Row matching cs_kimsorn row across full width) ---
  ctx.fillStyle = '#e2efda'; // Soft light green (#e2efda) matching cs_kimsorn
  ctx.fillRect(0, cellHeight, width, cellHeight);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;

  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = '#000000';

  // --- ROW 0 (Top Yellow Header Row - All aligned at Y = cellHeight * 0.7) ---
  ctx.textAlign = 'center';
  ctx.fillText('Cs_Name', colX[0] + cols[0].width / 2, cellHeight * 0.7);
  ctx.fillText('Total', colX[1] + cols[1].width / 2, cellHeight * 0.7);
  ctx.fillText('Play', colX[2] + cols[2].width / 2, cellHeight * 0.7);
  ctx.fillText('Tran', colX[3] + cols[3].width / 2, cellHeight * 0.7); // Aligned on Top Row!
  ctx.fillText('Refill', colX[4] + cols[4].width / 2, cellHeight * 0.7);
  ctx.fillText('Withdraw', colX[5] + cols[5].width / 2, cellHeight * 0.7);
  ctx.fillText('Result', colX[6] + cols[6].width / 2, cellHeight * 0.7);

  // --- ROW 1 (Summary Values Row) ---
  ctx.fillText(cs.csName, colX[0] + cols[0].width / 2, cellHeight * 1.7);
  ctx.fillText(String(cs.total), colX[1] + cols[1].width / 2, cellHeight * 1.7);
  ctx.fillText(String(cs.play), colX[2] + cols[2].width / 2, cellHeight * 1.7);

  // E2, F2, G2: Summary Values
  ctx.textAlign = 'right';
  ctx.fillText(formatCurrency(cs.refill), colX[5] - 6, cellHeight * 1.7);
  ctx.fillText(formatCurrency(cs.withdraw), colX[6] - 6, cellHeight * 1.7);
  
  const resValStr = cs.result < 0 ? `$ (${Math.abs(cs.result).toFixed(2)})` : formatCurrency(cs.result);
  ctx.fillText(resValStr, colX[7] - 6, cellHeight * 1.7);

  // --- MEMBER ROWS ---
  let currentY = cellHeight * 2;

  ctx.font = '14px Arial, sans-serif';

  members.forEach((m, idx) => {
    // Row background
    ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#fcfcfc';
    ctx.fillRect(0, currentY, width, cellHeight);

    // Color rule: RED font if Trans count >= 3 OR Refill >= $50!
    const isRed = isMemberRed(m);
    const fontColor = isRed ? '#cc0000' : '#000000';

    // Draw Member Username
    ctx.textAlign = 'left';
    ctx.fillStyle = fontColor;
    ctx.font = isRed ? 'bold 14px Arial, sans-serif' : '14px Arial, sans-serif';
    ctx.fillText(m.username, 8, currentY + cellHeight * 0.7);

    // Draw Trans count
    ctx.textAlign = 'center';
    ctx.fillStyle = fontColor;
    ctx.fillText(String(m.count || 0), colX[3] + cols[3].width / 2, currentY + cellHeight * 0.7);

    // Draw Refill, Withdraw, Result
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial, sans-serif';

    const refillText = m.refill > 0 ? formatCurrency(m.refill) : '$     -';
    const withdrawText = m.withdraw > 0 ? formatCurrency(m.withdraw) : '$     -';
    let resultText = '$     -';
    if (m.result < 0) {
      resultText = `$ (${Math.abs(m.result).toFixed(2)})`;
    } else if (m.result > 0) {
      resultText = formatCurrency(m.result);
    }

    ctx.fillText(refillText, colX[5] - 6, currentY + cellHeight * 0.7);
    ctx.fillText(withdrawText, colX[6] - 6, currentY + cellHeight * 0.7);
    ctx.fillText(resultText, colX[7] - 6, currentY + cellHeight * 0.7);

    currentY += cellHeight;
  });

  // --- GRID LINES ---
  ctx.strokeStyle = '#a6a6a6';
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let y = 0; y <= currentY; y += cellHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let x of colX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, currentY);
    ctx.stroke();
  }

  // Outer border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, currentY);

  return canvas.toBuffer('image/png');
}
