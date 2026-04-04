// scripts/telegram-bridge.js
// Polls your Telegram bot and runs `claude -p <message>` in the project root.
//
// Usage:
//   node --env-file=.env scripts/telegram-bridge.js

const { execSync } = require('child_process');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER = String(process.env.TELEGRAM_USER_ID);
const PROJECT_DIR = path.resolve(__dirname, '..');
const API = `https://api.telegram.org/bot${TOKEN}`;

if (!TOKEN || !ALLOWED_USER) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_USER_ID in .env');
  process.exit(1);
}

let offset = 0;

async function getUpdates() {
  const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
  const data = await res.json();
  return data.result ?? [];
}

async function sendMessage(chatId, text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += 4000) {
    chunks.push(text.slice(i, i + 4000));
  }
  for (const chunk of chunks) {
    const res = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: chunk }),
    });
    const data = await res.json();
    if (!data.ok) console.error('sendMessage failed:', JSON.stringify(data));
    else console.log(`✓ sent to ${chatId}`);
  }
}

async function runClaude(prompt) {
  try {
    const output = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
      cwd: PROJECT_DIR,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 120000,
      shell: true,
    });
    return output.trim() || '(no output)';
  } catch (err) {
    const msg = err.stdout?.trim() || err.message;
    return `Error: ${msg}`;
  }
}

async function poll() {
  console.log('Telegram bridge ready. Listening for messages...');
  while (true) {
    try {
      const updates = await getUpdates();
      for (const update of updates) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (!msg?.text) continue;

        const userId = String(msg.from.id);
        const chatId = msg.chat.id;

        if (userId !== ALLOWED_USER) {
          await sendMessage(chatId, 'Unauthorized.');
          continue;
        }

        console.log(`← ${msg.text}`);
        await sendMessage(chatId, '⏳ Working on it...');

        const result = await runClaude(msg.text);
        console.log(`→ ${result.slice(0, 120)}`);
        await sendMessage(chatId, result);
      }
    } catch (err) {
      console.error('Poll error:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
