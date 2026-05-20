import { config } from '../config';
import { InlineKeyboard } from '../utils/keyboard';

const BASE_URL = `https://api.telegram.org/bot${config.telegramBotToken}`;

async function callApi(method: string, body: object): Promise<void> {
  const response = await fetch(`${BASE_URL}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`Telegram API error [${method}]:`, text);
  }
}

export async function sendMessage(
  chatId: number,
  text: string,
  keyboard?: InlineKeyboard
): Promise<void> {
  await callApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

export async function editMessage(
  chatId: number,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboard
): Promise<void> {
  await callApi('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'Markdown',
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

export async function answerCallback(callbackQueryId: string, text?: string): Promise<void> {
  await callApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}

export async function registerWebhook(): Promise<void> {
  await callApi('setWebhook', {
    url: config.webhookUrl,
    secret_token: config.webhookSecret,
    allowed_updates: ['message', 'callback_query'],
  });
  console.log('Webhook registered:', config.webhookUrl);
}
