import { Pool } from 'pg';
import { createSale, getSaleHistory } from '../../db/sales.repo';
import { searchByName } from '../../db/customers.repo';
import { getBalance } from '../../db/balances.repo';
import { sendMessage } from '../telegram';
import { updateSession, resetSession, Session } from '../state';
import { parseAmount, formatAmount, formatDate } from '../../utils/format';
import { confirmKeyboard, customerListKeyboard, btn } from '../../utils/keyboard';
import { showCustomerCard } from './search.handler';
import { MSG } from '../../utils/messages';

export async function startSale(db: Pool, chatId: number, customerId: string): Promise<void> {
  const balance = await getBalance(db, customerId);
  if (!balance) {
    await sendMessage(chatId, MSG.genericError);
    return;
  }
  updateSession(chatId, {
    state: 'SALE_DESCRIPTION',
    data: { customerId, customerName: balance.name },
  });
  await sendMessage(chatId, `🧾 Nueva venta para *${balance.name}*\n\n${MSG.askSaleDescription}`);
}

export async function handleSaleDescription(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  updateSession(chatId, { state: 'SALE_AMOUNT', data: { ...session.data, description: text } });
  await sendMessage(chatId, MSG.askAmount);
}

export async function handleSaleAmount(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  const amount = parseAmount(text);
  if (!amount) {
    await sendMessage(chatId, MSG.invalidAmount);
    return;
  }

  const { customerName, description } = session.data as { customerName: string; description: string };

  updateSession(chatId, { state: 'SALE_CONFIRM', data: { ...session.data, amount } });
  await sendMessage(
    chatId,
    MSG.saleSummary(customerName, description, formatAmount(amount)),
    confirmKeyboard()
  );
}

export async function confirmSale(db: Pool, chatId: number, session: Session): Promise<void> {
  const { customerId, customerName, description, amount } = session.data as {
    customerId: string;
    customerName: string;
    description: string;
    amount: number;
  };

  await createSale(db, { customerId, description, amount });
  resetSession(chatId);

  await sendMessage(chatId, MSG.saleRecorded(customerName, formatAmount(amount)));
  await showCustomerCard(db, chatId, customerId);
}

export async function startSaleFromCommand(db: Pool, chatId: number): Promise<void> {
  updateSession(chatId, { state: 'SALE_DESCRIPTION', data: { searchCustomer: true } });
  await sendMessage(chatId, '🔍 ¿A quién le vas a vender? Escribe el nombre:');
}

export async function handleSearchForSale(db: Pool, chatId: number, session: Session, query: string): Promise<void> {
  const customers = await searchByName(db, query);

  if (customers.length === 0) {
    await sendMessage(chatId, MSG.customerNotFound(query), [
      [btn('👤 Registrar cliente', 'action:new_customer')],
    ]);
    resetSession(chatId);
    return;
  }

  if (customers.length === 1) {
    await startSale(db, chatId, customers[0].id);
    return;
  }

  if (customers.length > 5) {
    await sendMessage(chatId, MSG.tooManyResults);
    return;
  }

  updateSession(chatId, { data: { ...session.data, context: 'sale' } });
  await sendMessage(chatId, MSG.multipleCustomers(query), customerListKeyboard(customers));
}

export async function showHistory(db: Pool, chatId: number, customerId: string): Promise<void> {
  const [balance, sales] = await Promise.all([
    getBalance(db, customerId),
    getSaleHistory(db, customerId),
  ]);

  if (!balance) {
    await sendMessage(chatId, MSG.genericError);
    return;
  }

  if (sales.length === 0) {
    await sendMessage(chatId, `📋 *${balance.name}* no tiene ventas registradas.`);
    return;
  }

  let text = `📋 *Historial de ${balance.name}*\n\n`;
  for (const sale of sales) {
    text += `• ${formatDate(sale.sale_date)} — ${formatAmount(sale.total_amount)}`;
    if (sale.description) text += ` (${sale.description})`;
    text += '\n';
  }

  await sendMessage(chatId, text);
}
