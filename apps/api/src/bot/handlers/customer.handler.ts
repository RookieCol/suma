import { Pool } from 'pg';
import { createCustomer } from '../../db/customers.repo';
import { sendMessage } from '../telegram';
import { updateSession, resetSession, Session } from '../state';
import { confirmKeyboard } from '../../utils/keyboard';
import { MSG } from '../../utils/messages';

const SKIP_VALUES = ['no', 'n', '-', 'omitir', 'skip'];

function isSkipped(text: string): boolean {
  return SKIP_VALUES.includes(text.trim().toLowerCase());
}

export async function startNewCustomer(db: Pool, chatId: number, prefilledName?: string): Promise<void> {
  if (prefilledName) {
    updateSession(chatId, { state: 'CUSTOMER_COMPANY', data: { name: prefilledName } });
    await sendMessage(chatId, `👤 Registrando: *${prefilledName}*\n\n${MSG.askCompany}`);
  } else {
    updateSession(chatId, { state: 'CUSTOMER_NAME', data: {} });
    await sendMessage(chatId, MSG.askCustomerName);
  }
}

export async function handleCustomerName(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  updateSession(chatId, { state: 'CUSTOMER_COMPANY', data: { name: text.trim() } });
  await sendMessage(chatId, MSG.askCompany);
}

export async function handleCustomerCompany(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  const company = isSkipped(text) ? undefined : text.trim();
  updateSession(chatId, { state: 'CUSTOMER_PHONE', data: { ...session.data, company } });
  await sendMessage(chatId, MSG.askPhone);
}

export async function handleCustomerPhone(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  const phone = isSkipped(text) ? undefined : text.trim();
  updateSession(chatId, { state: 'CUSTOMER_ADDRESS', data: { ...session.data, phone } });
  await sendMessage(chatId, MSG.askAddress);
}

export async function handleCustomerAddress(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  const address = isSkipped(text) ? undefined : text.trim();
  updateSession(chatId, { state: 'CUSTOMER_NEIGHBORHOOD', data: { ...session.data, address } });
  await sendMessage(chatId, MSG.askNeighborhood);
}

export async function handleCustomerNeighborhood(db: Pool, chatId: number, session: Session, text: string): Promise<void> {
  if (text === '/cancelar') {
    resetSession(chatId);
    await sendMessage(chatId, MSG.cancelled);
    return;
  }

  const neighborhood = isSkipped(text) ? undefined : text.trim();
  const { name, company, phone, address } = session.data as {
    name: string;
    company?: string;
    phone?: string;
    address?: string;
  };

  updateSession(chatId, { state: 'CUSTOMER_CONFIRM', data: { ...session.data, neighborhood } });
  await sendMessage(
    chatId,
    MSG.newCustomerSummary(name, company ?? '—', phone ?? '—', address ?? '—', neighborhood ?? '—'),
    confirmKeyboard()
  );
}

export async function confirmNewCustomer(db: Pool, chatId: number, session: Session): Promise<void> {
  const { name, company, phone, address, neighborhood } = session.data as {
    name: string;
    company?: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
  };

  const customer = await createCustomer(db, { name, company, phone, address, neighborhood });
  resetSession(chatId);

  await sendMessage(chatId, MSG.customerCreated(customer.name));
}
