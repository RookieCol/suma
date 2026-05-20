import { Pool } from 'pg';
import { searchByName } from '../../db/customers.repo';
import { getBalance } from '../../db/balances.repo';
import { getLastPayment } from '../../db/payments.repo';
import { sendMessage } from '../telegram';
import { formatAmount, formatDate } from '../../utils/format';
import { customerCardKeyboard, customerListKeyboard, btn } from '../../utils/keyboard';
import { MSG } from '../../utils/messages';

export async function handleSearch(db: Pool, chatId: number, query: string): Promise<void> {
  const customers = await searchByName(db, query);

  if (customers.length === 0) {
    await sendMessage(chatId, MSG.customerNotFound(query), [
      [btn('👤 Registrar cliente', 'action:new_customer')],
    ]);
    return;
  }

  if (customers.length > 5) {
    await sendMessage(chatId, MSG.tooManyResults);
    return;
  }

  if (customers.length > 1) {
    await sendMessage(chatId, MSG.multipleCustomers(query), customerListKeyboard(customers));
    return;
  }

  await showCustomerCard(db, chatId, customers[0].id);
}

export async function showCustomerCard(db: Pool, chatId: number, customerId: string): Promise<void> {
  const [balance, lastPayment] = await Promise.all([
    getBalance(db, customerId),
    getLastPayment(db, customerId),
  ]);

  if (!balance) {
    await sendMessage(chatId, MSG.genericError);
    return;
  }

  const pending = parseFloat(balance.pending_balance);
  const icon = pending > 0 ? '🔴' : '✅';

  let text = `👤 *${balance.name}*\n`;
  if (balance.company)      text += `🏢 ${balance.company}\n`;
  if (balance.neighborhood) text += `📍 ${balance.neighborhood}\n`;
  if (balance.phone)        text += `📱 ${balance.phone}\n`;
  text += `\n${icon} Saldo pendiente: *${formatAmount(balance.pending_balance)}*\n`;
  text += `📊 Total comprado: ${formatAmount(balance.total_debt)}\n`;
  text += `💵 Total pagado: ${formatAmount(balance.total_paid)}\n`;

  if (lastPayment) {
    text += `\n🕐 Último pago: ${formatDate(lastPayment.payment_date)} — ${formatAmount(lastPayment.amount)} (${lastPayment.payment_method})`;
  } else {
    text += `\n🕐 Sin pagos registrados`;
  }

  await sendMessage(chatId, text, customerCardKeyboard(customerId));
}
