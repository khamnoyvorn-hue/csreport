import 'dotenv/config';
import http from 'http';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { parseExcelReport, formatCurrency, formatNumber } from './src/utils/excelParser.js';
import { generateCsReportImage } from './src/utils/imageGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'https://report-cs-mini-app.pages.dev';
const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_URL || 'https://csreport.onrender.com';

if (!token) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is missing in .env');
  process.exit(1);
}

// Detect whether running in Production (Render / Cloud) or Local environment
const isProduction = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL || process.env.NODE_ENV === 'production');

let bot;

if (isProduction) {
  console.log(`🌐 Production environment detected. Enabling Telegram Webhook at ${renderUrl}/webhook`);
  bot = new TelegramBot(token, { webHook: false });
  
  const webhookEndpoint = `${renderUrl.replace(/\/$/, '')}/webhook`;
  bot.setWebhook(webhookEndpoint)
    .then(() => console.log(`✅ Webhook registered with Telegram: ${webhookEndpoint}`))
    .catch((err) => console.error('⚠️ Error registering Webhook with Telegram:', err?.message || err));
} else {
  console.log('💻 Local environment detected. Enabling Telegram Polling...');
  bot = new TelegramBot(token, { polling: true });
  // Clear any active webhook when running locally so polling receives all updates
  bot.deleteWebhook().catch(() => {});
}

// Track last sent report message IDs per chat so we can clear old reports automatically
const lastReportMessages = new Map();

async function clearOldReportMessages(chatId) {
  const oldMsgs = lastReportMessages.get(chatId);
  if (oldMsgs && oldMsgs.length > 0) {
    for (const msgId of oldMsgs) {
      try {
        await bot.deleteMessage(chatId, msgId);
      } catch (e) {
        // Ignore if message was already deleted or expired
      }
    }
    lastReportMessages.set(chatId, []);
  }
}

// Error handlers to prevent node process crashes
bot.on('polling_error', (error) => {
  console.error('⚠️ Telegram Polling Warning:', error?.message || error);
});

bot.on('error', (error) => {
  console.error('⚠️ Telegram Bot Warning:', error?.message || error);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Caught Uncaught Exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Caught Unhandled Rejection:', reason);
});

console.log('🤖 Telegram Bot @reportcs168_bot is starting...');

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Rich pool of vibrant emojis for CS Agent buttons
const COLORFUL_EMOJIS = [
  '🔥', '⚡', '💎', '⭐', '🚀', '🎯', '🌟', '👑', '🦁', '🦊',
  '👾', '🤖', '🔮', '🍀', '🎨', '🎮', '🦄', '🦅', '🐬', '💥',
  '🌈', '✨', '🏆', '🎩', '🐉', '🐯', '🐻', '🐼', '🦉', '💎'
];

// Helper: Format overall report summary
function formatTelegramSummary(parsedData) {
  const { dateTitle, summary, csList } = parsedData;

  const topCs = [...csList]
    .sort((a, b) => b.result - a.result)
    .slice(0, 5);

  let msg = `<b>📊 CS PERFORMANCE REPORT</b>\n`;
  msg += `📅 <i>${escapeHtml(dateTitle || 'Daily Report')}</i>\n\n`;

  msg += `💵 <b>ដាក់ប្រាក់សរុប:</b> <code>${formatCurrency(summary.totalRefill)}</code>\n`;
  msg += `💸 <b>ប្រាក់ដកសរុប:</b> <code>${formatCurrency(summary.totalWithdraw)}</code>\n`;
  msg += `📈 <b>លទ្ធផលសរុប:</b> <code>${formatCurrency(summary.netResult)}</code> (${summary.profitMargin.toFixed(1)}% Margin)\n`;
  msg += `👥 <b>អ្នកលេងសកម្ម:</b> ${formatNumber(summary.activePlayers)} / ${formatNumber(summary.totalAccounts)}\n\n`;

  msg += `🏆 <b>TOP CS LEADERBOARD</b>\n`;
  topCs.forEach((cs, i) => {
    const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
    msg += `${icon} <b>${escapeHtml(cs.csName)}</b>: Refill: <code>${formatCurrency(cs.refill)}</code> | Net: <code>${formatCurrency(cs.result)}</code> (${cs.total}/${cs.play})\n`;
  });

  return msg;
}

// Helper: Sends interactive CS Name Buttons Menu with newly generated colorful Emojis on every /start
function sendCsMenu(chatId) {
  const reportPath = path.join(__dirname, 'public', 'Report.xlsx');
  
  if (!fs.existsSync(reportPath)) {
    return bot.sendMessage(chatId, '📊 <b>CS Performance Report</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 របាយការណ៍ពេញលេញ (Open Mini App)', web_app: { url: `${webAppUrl}?t=${Date.now()}` } }]
        ]
      }
    }).catch(e => console.error('Send error:', e.message));
  }

  try {
    const buffer = fs.readFileSync(reportPath);
    const parsed = parseExcelReport(buffer);

    // Sort CS agents by Active Players descending, then Total descending
    const csSorted = [...parsed.csList].sort((a, b) => {
      if (b.play !== a.play) return b.play - a.play;
      return b.total - a.total;
    });

    // Generate a fresh random shuffle of colorful emojis for this call
    const shuffledEmojis = [...COLORFUL_EMOJIS].sort(() => 0.5 - Math.random());

    // Build 2-column inline keyboard grid with colorful generated emojis
    const keyboard = [];
    for (let i = 0; i < csSorted.length; i += 2) {
      const row = [];
      
      const cs1 = csSorted[i];
      const icon1 = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (shuffledEmojis[i % shuffledEmojis.length] || '⭐');
      row.push({
        text: `${icon1} ${cs1.csName} (${cs1.total}/${cs1.play})`,
        callback_data: `cs_view:${cs1.csName}`
      });

      if (i + 1 < csSorted.length) {
        const cs2 = csSorted[i + 1];
        const idx2 = i + 1;
        const icon2 = idx2 === 1 ? '🥈' : idx2 === 2 ? '🥉' : (shuffledEmojis[idx2 % shuffledEmojis.length] || '🌟');
        row.push({
          text: `${icon2} ${cs2.csName} (${cs2.total}/${cs2.play})`,
          callback_data: `cs_view:${cs2.csName}`
        });
      }
      keyboard.push(row);
    }

    // Add main Mini App button at bottom with vibrant emoji
    keyboard.push([
      { text: '🚀 របាយការណ៍ពេញលេញ (Open Mini App)', web_app: { url: `${webAppUrl}?t=${Date.now()}` } }
    ]);

    bot.sendMessage(chatId, '👇 <b>ជ្រើសរើសឈ្មោះ CS ដើម្បីមើលរបាយការណ៍:</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: keyboard
      }
    }).catch(e => console.error('Send menu error:', e.message));
  } catch (err) {
    console.error('Error generating CS menu:', err);
    bot.sendMessage(chatId, '📊 <b>CS Performance Report</b>', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 របាយការណ៍ពេញលេញ (Open Mini App)', web_app: { url: `${webAppUrl}?t=${Date.now()}` } }]
        ]
      }
    }).catch(e => console.error('Send error:', e.message));
  }
}

// 1. Universal Message Listener for /start or /report text commands
bot.on('message', async (msg) => {
  if (!msg.text) return;
  const text = msg.text.trim().toLowerCase();

  if (text.startsWith('/start') || text.startsWith('/report')) {
    const chatId = msg.chat.id;
    await clearOldReportMessages(chatId);
    sendCsMenu(chatId);
  }
});

// 2. Callback Query Handler: Deletes menu message & sends photo WITHOUT bottom inline buttons
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith('cs_view:')) {
    const csName = data.split('cs_view:')[1];
    const reportPath = path.join(__dirname, 'public', 'Report.xlsx');

    if (!fs.existsSync(reportPath)) {
      return bot.answerCallbackQuery(query.id, { text: 'Report file not found.' }).catch(() => {});
    }

    try {
      const buffer = fs.readFileSync(reportPath);
      const parsed = parseExcelReport(buffer);
      const cs = parsed.csList.find(c => c.csName === csName);

      if (!cs) {
        return bot.answerCallbackQuery(query.id, { text: 'CS Agent not found.' }).catch(() => {});
      }

      bot.answerCallbackQuery(query.id).catch(() => {});

      // Delete the CS buttons menu message above
      try {
        await bot.deleteMessage(chatId, query.message.message_id);
      } catch (e) {
        // Ignore if already deleted
      }

      // Also clear any previous report photo
      await clearOldReportMessages(chatId);

      // Generate PNG Image buffer matching Excel table
      const imgBuf = generateCsReportImage(cs);
      const captionText = `👤 <b>CS REPORT: ${escapeHtml(cs.csName)}</b>\n📅 <i>${escapeHtml(parsed.dateTitle || 'Daily Report')}</i>`;

      // Send photo WITHOUT inline buttons under it
      const sentMsg = await bot.sendPhoto(chatId, imgBuf, {
        caption: captionText,
        parse_mode: 'HTML'
      });

      // Remember sent photo message ID to clear on next action
      if (sentMsg && sentMsg.message_id) {
        lastReportMessages.set(chatId, [sentMsg.message_id]);
      }

    } catch (err) {
      console.error('Error handling CS callback:', err);
      bot.answerCallbackQuery(query.id, { text: 'Error parsing report.' }).catch(() => {});
    }
  } else if (data === 'back_to_cs_list') {
    bot.answerCallbackQuery(query.id).catch(() => {});
    await clearOldReportMessages(chatId);
    sendCsMenu(chatId);
  }
});

// 3. Handle File Uploads (Excel .xlsx / .xls) -> Writes report.json & auto-deploys live & sends CS Menu automatically!
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const doc = msg.document;

  if (!doc.file_name.match(/\.(xlsx|xls)$/i)) {
    return bot.sendMessage(chatId, '⚠️ Please upload a valid Excel file (<code>.xlsx</code> or <code>.xls</code>).', { parse_mode: 'HTML' }).catch(() => {});
  }

  await clearOldReportMessages(chatId);
  bot.sendMessage(chatId, '📥 <b>Receiving Excel file... Processing & updating Cloudflare Pages live...</b>', { parse_mode: 'HTML' }).catch(() => {});

  try {
    const filePath = await bot.downloadFile(doc.file_id, path.join(__dirname, 'public'));
    
    // Write buffer to public, dist, and root
    const buffer = fs.readFileSync(filePath);
    fs.writeFileSync(path.join(__dirname, 'public', 'Report.xlsx'), buffer);
    fs.writeFileSync(path.join(__dirname, 'Report.xlsx'), buffer);

    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      fs.writeFileSync(path.join(distPath, 'Report.xlsx'), buffer);
    }

    const parsed = parseExcelReport(buffer);
    const jsonStr = JSON.stringify(parsed, null, 2);

    // Save report.json to public and dist
    fs.writeFileSync(path.join(__dirname, 'public', 'report.json'), jsonStr);
    if (fs.existsSync(distPath)) {
      fs.writeFileSync(path.join(distPath, 'report.json'), jsonStr);
    }

    // Send success summary
    const summaryText = `✅ <b>Excel File Uploaded & Deployed Live!</b>\n📁 File: <code>${escapeHtml(doc.file_name)}</code>\n\n` + formatTelegramSummary(parsed);

    await bot.sendMessage(chatId, summaryText, {
      parse_mode: 'HTML'
    }).catch(err => console.error('Error sending doc response:', err.message));

    // Automatically send fresh CS Menu buttons right away!
    sendCsMenu(chatId);

    // Run wrangler deploy asynchronously in background without blocking polling
    exec('npx wrangler pages deploy dist --project-name report-cs-mini-app', (deployErr) => {
      if (deployErr) {
        console.error('Auto deploy error:', deployErr);
      } else {
        console.log('✅ Cloudflare Pages successfully updated with live JSON & Excel report!');
      }
    });

  } catch (err) {
    console.error('Error handling uploaded document:', err);
    bot.sendMessage(chatId, '❌ Failed to parse uploaded Excel file. Ensure file format is valid.').catch(() => {});
  }
});

// HTTP Server for Health Check & Webhook ingestion
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        if (body) {
          const update = JSON.parse(body);
          bot.processUpdate(update);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        console.error('⚠️ Webhook payload parse error:', err.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
    return;
  }

  // Health check response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    service: 'Telegram Bot Server 24/7',
    mode: isProduction ? 'webhook' : 'polling'
  }));
});

server.listen(port, () => {
  console.log(`✅ Bot server ready on port ${port} (mode: ${isProduction ? 'webhook' : 'polling'})`);
});
