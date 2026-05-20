import { Pool } from 'pg';
import { getDailySummary } from '../../db/payments.repo';
import { listWithDebt } from '../../db/balances.repo';
import { sendMessage } from '../telegram';
import { formatAmount, formatDate } from '../../utils/format';
import { MSG } from '../../utils/messages';

export async function showDailyReport(db: Pool, chatId: number): Promise<void> {
  const report = await getDailySummary(db);
  const today = formatDate(new Date());

  let text = `📊 *Reporte del día — ${today}*\n\n`;
  text += `💰 Total recaudado: *${formatAmount(report.total_collected)}*\n`;

  for (const m of report.by_method) {
    text += `  • ${m.payment_method}: ${formatAmount(m.total)}\n`;
  }

  text += `\n📝 Cobros realizados: ${report.payments_count}`;
  text += `\n👥 Clientes visitados: ${report.customers_visited}`;

  await sendMessage(chatId, text);
}

export async function showDebts(db: Pool, chatId: number): Promise<void> {
  const customers = await listWithDebt(db);

  if (customers.length === 0) {
    await sendMessage(chatId, MSG.noDebts);
    return;
  }

  let total = 0;
  let text = `📋 *Clientes con saldo pendiente:*\n\n`;

  customers.forEach((c, i) => {
    const balance = parseFloat(c.pending_balance);
    total += balance;
    text += `${i + 1}. ${c.name} — *${formatAmount(balance)}*`;
    if (c.neighborhood) text += ` (${c.neighborhood})`;
    text += '\n';
  });

  text += `\n💼 Total cartera: *${formatAmount(total)}*`;

  await sendMessage(chatId, text);
}
