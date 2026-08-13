const COLORFUL_EMOJIS = [
  '🔥', '⚡', '💎', '⭐', '🚀', '🎯', '🌟', '👑', '🦁', '🦊',
  '👾', '🤖', '🔮', '🍀', '🎨', '🎮', '🦄', '🦅', '🐬', '💥',
  '🌈', '✨', '🏆', '🎩', '🐉', '🐯', '🐻', '🐼', '🦉', '💎'
];

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

async function sendTelegramMessage(token, chatId, text, extra = {}) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...extra
    })
  });
  return res.json();
}

async function sendTelegramPhoto(token, chatId, photoUrl, caption, extra = {}) {
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      ...extra
    })
  });
  return res.json();
}

async function answerCallbackQuery(token, callbackQueryId, text = '') {
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text
    })
  });
}

async function deleteMessage(token, chatId, messageId) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId
    })
  }).catch(() => {});
}

async function getLatestReportData(env, webAppUrl) {
  // 1. Try reading from Cloudflare REPORT_KV namespace first (global synced upload)
  if (env.REPORT_KV) {
    try {
      const kvData = await env.REPORT_KV.get('LATEST_REPORT', 'json');
      if (kvData && kvData.csList && kvData.csList.length > 0) {
        return kvData;
      }
    } catch (e) {
      console.error('KV fetch error in telegram.js:', e);
    }
  }

  // 2. Try fetching static report.json
  try {
    const jsonRes = await fetch(`${webAppUrl}/report.json?t=${Date.now()}`);
    if (jsonRes.ok) {
      const jsonData = await jsonRes.json();
      if (jsonData && jsonData.csList) {
        return jsonData;
      }
    }
  } catch (e) {}

  return null;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    return new Response(JSON.stringify({ status: 'active', message: 'Cloudflare Telegram Webhook Endpoint Ready 24/7' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const token = env.TELEGRAM_BOT_TOKEN || '8828936242:AAEjg4dj6aiSulWQ3AtbeniO7YOCS8rTjS8';
  const webAppUrl = env.WEBAPP_URL || 'https://report-cs-mini-app.pages.dev';

  try {
    const update = await request.json();

    // 1. Handle /start or /report command
    if (update.message && update.message.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;

      if (text.startsWith('/start') || text.startsWith('/report')) {
        const reportData = await getLatestReportData(env, webAppUrl);
        const csList = reportData?.csList || [];
        const dateTitle = reportData?.dateTitle || '';

        const keyboard = [];

        if (csList && csList.length > 0) {
          const csSorted = [...csList].sort((a, b) => {
            if (b.play !== a.play) return b.play - a.play;
            return b.total - a.total;
          });

          const shuffledEmojis = [...COLORFUL_EMOJIS].sort(() => 0.5 - Math.random());

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
        }

        // Add main Mini App button at bottom
        keyboard.push([
          { text: '🚀 របាយការណ៍ពេញលេញ (Open Mini App)', web_app: { url: `${webAppUrl}?t=${Date.now()}` } }
        ]);

        let menuText = '';
        if (dateTitle) {
          menuText += `📅 <b>${escapeHtml(dateTitle)}</b>\n\n`;
        }
        menuText += '👇 <b>ជ្រើសរើសឈ្មោះ CS ដើម្បីមើលរបាយការណ៍:</b>';

        await sendTelegramMessage(token, chatId, menuText, {
          reply_markup: { inline_keyboard: keyboard }
        });

        return new Response('OK', { status: 200 });
      }
    }

    // 2. Handle Callback Query (cs_view:...)
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const data = query.data;

      if (data.startsWith('cs_view:')) {
        const csName = data.split('cs_view:')[1];
        await answerCallbackQuery(token, query.id);

        // Delete menu message
        await deleteMessage(token, chatId, query.message.message_id);

        const reportData = await getLatestReportData(env, webAppUrl);
        const dateTitle = reportData?.dateTitle || '';

        const photoUrl = `${webAppUrl}/api/cs-image?cs=${encodeURIComponent(csName)}&t=${Date.now()}`;
        let captionText = `👤 <b>CS REPORT: ${escapeHtml(csName)}</b>`;
        if (dateTitle) {
          captionText += `\n📅 <i>${escapeHtml(dateTitle)}</i>`;
        }

        const photoRes = await sendTelegramPhoto(token, chatId, photoUrl, captionText);

        if (!photoRes || !photoRes.ok) {
          // Fallback to text message if photo send fails
          let fallbackText = `👤 <b>CS REPORT: ${escapeHtml(csName)}</b>\n`;
          if (dateTitle) fallbackText += `📅 <i>${escapeHtml(dateTitle)}</i>\n\n`;

          const cs = reportData?.csList?.find(c => c.csName.toLowerCase() === csName.toLowerCase());
          if (cs) {
            fallbackText += `<b>Total:</b> <code>${cs.total}</code>  |  <b>Play:</b> <code>${cs.play}</code>\n`;
            fallbackText += `💵 <b>Refill:</b> <code>${formatCurrency(cs.refill)}</code>\n`;
            fallbackText += `💸 <b>Withdraw:</b> <code>${formatCurrency(cs.withdraw)}</code>\n`;
            fallbackText += `📈 <b>Result:</b> <code>${formatCurrency(cs.result)}</code>\n\n`;

            if (cs.members && cs.members.length > 0) {
              fallbackText += `📋 <b>សមាជិកប្រតិបត្តិការ (${cs.members.length}):</b>\n`;
              const sortedM = [...cs.members].sort((a, b) => (b.count || 0) - (a.count || 0));
              sortedM.forEach(m => {
                const isRed = (m.count || 0) >= 3 || (m.refill || 0) >= 50;
                const mark = isRed ? '🔴' : '•';
                fallbackText += `${mark} <b>${escapeHtml(m.username)}</b> (${m.count || 0} trans): Refill <code>${formatCurrency(m.refill)}</code>\n`;
              });
            }
          }

          await sendTelegramMessage(token, chatId, fallbackText);
        }
        return new Response('OK', { status: 200 });
      }
    }

    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('OK', { status: 200 });
  }
}
