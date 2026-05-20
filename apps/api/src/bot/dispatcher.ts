import { Pool } from 'pg';
import { config } from '../config';
import { findByTelegramId, BotUser } from '../db/users.repo';
import { getSession, resetSession, updateSession } from './state';
import { sendMessage, answerCallback } from './telegram';
import { handleSearch, showCustomerCard } from './handlers/search.handler';
import {
  startPayment,
  handlePaymentAmount,
  handlePaymentMethod,
  confirmPayment,
  startPaymentFromCommand,
  handleSearchForPayment,
} from './handlers/payment.handler';
import {
  startSale,
  handleSaleDescription,
  handleSaleAmount,
  confirmSale,
  startSaleFromCommand,
  handleSearchForSale,
  showHistory,
} from './handlers/sale.handler';
import {
  startNewCustomer,
  handleCustomerName,
  handleCustomerCompany,
  handleCustomerPhone,
  handleCustomerAddress,
  handleCustomerNeighborhood,
  confirmNewCustomer,
} from './handlers/customer.handler';
import { showDailyReport, showDebts } from './handlers/report.handler';
import { MSG } from '../utils/messages';
import { btn } from '../utils/keyboard';
import { PaymentMethod } from '../db/payments.repo';

interface TelegramUser {
  id: number;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number };
  text?: string;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

async function getAuthorizedUser(db: Pool, telegramId: number): Promise<BotUser | null> {
  if (config.authorizedUserId !== null && telegramId === config.authorizedUserId) {
    return { id: 'legacy', name: 'Admin', role: 'admin' };
  }
  return findByTelegramId(db, telegramId);
}

export async function processUpdate(db: Pool, update: TelegramUpdate): Promise<void> {
  if (update.message) {
    await processMessage(db, update.message);
  } else if (update.callback_query) {
    await processCallback(db, update.callback_query);
  }
}

async function processMessage(db: Pool, message: TelegramMessage): Promise<void> {
  const userId = message.from?.id;
  if (!userId) return;
  const botUser = await getAuthorizedUser(db, userId);
  if (!botUser) {
    await sendMessage(message.chat.id, 'No tienes acceso a este bot. Contacta al administrador.');
    return;
  }

  const chatId = message.chat.id;
  const text = message.text?.trim() ?? '';
  if (!text) return;

  const session = getSession(chatId);

  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  if (text === '/start' || text === '/menu') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.mainMenu, [
      [btn('🔍 Buscar cliente', 'menu:search')],
      [btn('💵 Registrar cobro', 'menu:payment'), btn('🧾 Nueva venta', 'menu:sale')],
      [btn('👤 Nuevo cliente', 'menu:new_customer')],
      [btn('📊 Reporte del día', 'menu:report'), btn('📋 Deudas', 'menu:debts')],
    ]);
    return;
  }

  if (text === '/reporte') { await showDailyReport(db, chatId); return; }
  if (text === '/deudas')  { await showDebts(db, chatId); return; }
  if (text === '/cobrar')  { await startPaymentFromCommand(db, chatId); return; }
  if (text === '/venta')   { await startSaleFromCommand(db, chatId); return; }
  if (text === '/nuevo')   { await startNewCustomer(db, chatId); return; }

  switch (session.state) {
    case 'IDLE':
      if (!text.startsWith('/')) {
        await handleSearch(db, chatId, text);
      } else {
        await sendMessage(chatId, MSG.unknownCommand);
      }
      break;

    case 'PAYMENT_AMOUNT':
      if ((session.data as { searchCustomer?: boolean }).searchCustomer) {
        await handleSearchForPayment(db, chatId, session, text);
      } else {
        await handlePaymentAmount(db, chatId, session, text);
      }
      break;

    case 'SALE_DESCRIPTION':
      if ((session.data as { searchCustomer?: boolean }).searchCustomer) {
        await handleSearchForSale(db, chatId, session, text);
      } else {
        await handleSaleDescription(db, chatId, session, text);
      }
      break;

    case 'SALE_AMOUNT':
      await handleSaleAmount(db, chatId, session, text);
      break;

    case 'CUSTOMER_NAME':
      await handleCustomerName(db, chatId, session, text);
      break;

    case 'CUSTOMER_COMPANY':
      await handleCustomerCompany(db, chatId, session, text);
      break;

    case 'CUSTOMER_PHONE':
      await handleCustomerPhone(db, chatId, session, text);
      break;

    case 'CUSTOMER_ADDRESS':
      await handleCustomerAddress(db, chatId, session, text);
      break;

    case 'CUSTOMER_NEIGHBORHOOD':
      await handleCustomerNeighborhood(db, chatId, session, text);
      break;

    default:
      await sendMessage(chatId, MSG.unknownCommand);
      resetSession(chatId);
  }
}

async function processCallback(db: Pool, query: TelegramCallbackQuery): Promise<void> {
  const botUser = await getAuthorizedUser(db, query.from.id);
  if (!botUser) return;

  const chatId = query.message?.chat.id;
  if (!chatId) return;

  const data = query.data ?? '';
  const session = getSession(chatId);

  await answerCallback(query.id);

  if (data.startsWith('customer:')) {
    const customerId = data.slice('customer:'.length);
    const context = (session.data as { context?: string }).context;

    if (context === 'payment') {
      await startPayment(db, chatId, customerId);
    } else if (context === 'sale') {
      await startSale(db, chatId, customerId);
    } else {
      resetSession(chatId);
      await showCustomerCard(db, chatId, customerId);
    }
    return;
  }

  if (data.startsWith('action:')) {
    const parts = data.split(':');
    const type = parts[1];
    const customerId = parts[2];

    if (type === 'pay')          await startPayment(db, chatId, customerId);
    else if (type === 'sale')    await startSale(db, chatId, customerId);
    else if (type === 'history') await showHistory(db, chatId, customerId);
    else if (type === 'new_customer') await startNewCustomer(db, chatId);
    return;
  }

  if (data.startsWith('method:')) {
    const method = data.slice('method:'.length) as PaymentMethod;
    if (session.state === 'PAYMENT_METHOD') {
      await handlePaymentMethod(db, chatId, session, method);
    }
    return;
  }

  if (data.startsWith('confirm:')) {
    const answer = data.slice('confirm:'.length);

    if (answer === 'no') {
      resetSession(chatId);
      await sendMessage(chatId, MSG.cancelled);
      return;
    }

    if (answer === 'yes') {
      switch (session.state) {
        case 'PAYMENT_CONFIRM':  await confirmPayment(db, chatId, session); break;
        case 'SALE_CONFIRM':     await confirmSale(db, chatId, session); break;
        case 'CUSTOMER_CONFIRM': await confirmNewCustomer(db, chatId, session); break;
        default:
          await sendMessage(chatId, MSG.genericError);
          resetSession(chatId);
      }
    }
    return;
  }

  if (data.startsWith('menu:')) {
    const option = data.slice('menu:'.length);
    switch (option) {
      case 'search':       resetSession(chatId); await sendMessage(chatId, '🔍 Escribe el nombre del cliente:'); break;
      case 'payment':      await startPaymentFromCommand(db, chatId); break;
      case 'sale':         await startSaleFromCommand(db, chatId); break;
      case 'new_customer': await startNewCustomer(db, chatId); break;
      case 'report':       await showDailyReport(db, chatId); break;
      case 'debts':        await showDebts(db, chatId); break;
    }
  }
}
