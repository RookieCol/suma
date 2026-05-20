import { Pool } from 'pg';
import { createPayment, PaymentMethod } from '../../db/payments.repo';
import { searchByName } from '../../db/customers.repo';
import { getBalance } from '../../db/balances.repo';
import { sendMessage } from '../telegram';
import { updateSession, resetSession, Session } from '../state';
import { parseAmount, formatAmount } from '../../utils/format';
import { paymentMethodKeyboard, confirmKeyboard, customerListKeyboard, btn } from '../../utils/keyboard';
import { showCustomerCard } from './search.handler';
import { MSG } from '../../utils/messages';

export async function startPayment(db: Pool, chatId: number, customerId: string): Promise<void> {
  const balance = await getBalance(db, customerId);
  if (!balance) {
    await sendMessage(chatId, MSG.genericError);
    return;
  }
  updateSession(chatId, {
    state: 'PAYMENT_AMOUNT',
    data: { customerId, customerName: balance.name },
  });
  await sendMessage(chatId, `💵 Registrando pago para *${balance.name}*\n\n${MSG.askAmount}`);
}

export async function handlePaymentAmount(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
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

  updateSession(chatId, { state: 'PAYMENT_METHOD', data: { ...session.data, amount } });
  await sendMessage(chatId, MSG.askPaymentMethod, paymentMethodKeyboard());
}

export async function handlePaymentMethod(db: Pool, chatId: number, session: Session, method: PaymentMethod): Promise<void> {
  const { customerName, amount } = session.data as { customerName: string; amount: number };

  updateSession(chatId, { state: 'PAYMENT_CONFIRM', data: { ...session.data, paymentMethod: method } });
  await sendMessage(
    chatId,
    MSG.paymentSummary(customerName, formatAmount(amount), method),
    confirmKeyboard()
  );
}

export async function confirmPayment(db: Pool, chatId: number, session: Session): Promise<void> {
  const { customerId, customerName, amount, paymentMethod } = session.data as {
    customerId: string;
    customerName: string;
    amount: number;
    paymentMethod: PaymentMethod;
  };

  await createPayment(db, { customerId, amount, paymentMethod });
  resetSession(chatId);

  await sendMessage(chatId, MSG.paymentRecorded(customerName, formatAmount(amount)));
  await showCustomerCard(db, chatId, customerId);
}

export async function startPaymentFromCommand(db: Pool, chatId: number): Promise<void> {
  updateSession(chatId, { state: 'PAYMENT_AMOUNT', data: { searchCustomer: true } });
  await sendMessage(chatId, '🔍 ¿A quién le vas a cobrar? Escribe el nombre:');
}

export async function handleSearchForPayment(db: Pool, chatId: number, session: Session, query: string): Promise<void> {
  const customers = await searchByName(db, query);

  if (customers.length === 0) {
    await sendMessage(chatId, MSG.customerNotFound(query), [
      [btn('👤 Registrar cliente', 'action:new_customer')],
    ]);
    resetSession(chatId);
    return;
  }

  if (customers.length === 1) {
    await startPayment(db, chatId, customers[0].id);
    return;
  }

  if (customers.length > 5) {
    await sendMessage(chatId, MSG.tooManyResults);
    return;
  }

  updateSession(chatId, { data: { ...session.data, context: 'payment' } });
  await sendMessage(chatId, MSG.multipleCustomers(query), customerListKeyboard(customers));
}
