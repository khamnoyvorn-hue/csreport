import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseExcelReport } from '../src/utils/excelParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const reportExcelPath = path.join(rootDir, 'public', 'Report.xlsx');

if (fs.existsSync(reportExcelPath)) {
  try {
    const buffer = fs.readFileSync(reportExcelPath);
    const parsed = parseExcelReport(buffer);
    const jsonContent = JSON.stringify(parsed, null, 2);

    const publicJsonPath = path.join(rootDir, 'public', 'report.json');
    fs.writeFileSync(publicJsonPath, jsonContent);
    console.log('✅ Generated public/report.json successfully!');

    const distDir = path.join(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      const distJsonPath = path.join(distDir, 'report.json');
      fs.writeFileSync(distJsonPath, jsonContent);
      console.log('✅ Generated dist/report.json successfully!');
    }
  } catch (err) {
    console.error('Error generating report.json:', err);
  }
} else {
  console.warn('⚠️ public/Report.xlsx not found');
}
