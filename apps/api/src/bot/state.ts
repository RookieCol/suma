export type ConversationState =
  | 'IDLE'
  | 'PAYMENT_AMOUNT'
  | 'PAYMENT_METHOD'
  | 'PAYMENT_CONFIRM'
  | 'SALE_DESCRIPTION'
  | 'SALE_AMOUNT'
  | 'SALE_CONFIRM'
  | 'CUSTOMER_NAME'
  | 'CUSTOMER_COMPANY'
  | 'CUSTOMER_PHONE'
  | 'CUSTOMER_ADDRESS'
  | 'CUSTOMER_NEIGHBORHOOD'
  | 'CUSTOMER_CONFIRM';

export interface Session {
  state: ConversationState;
  data: Record<string, unknown>;
  updatedAt: number;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const sessions = new Map<number, Session>();

export function getSession(chatId: number): Session {
  const session = sessions.get(chatId);

  if (session) {
    if (Date.now() - session.updatedAt > SESSION_TIMEOUT_MS) {
      return resetSession(chatId);
    }
    return session;
  }

  return resetSession(chatId);
}

export function updateSession(chatId: number, changes: Partial<Session>): Session {
  const current = getSession(chatId);
  const updated: Session = { ...current, ...changes, updatedAt: Date.now() };
  sessions.set(chatId, updated);
  return updated;
}

export function resetSession(chatId: number): Session {
  const session: Session = { state: 'IDLE', data: {}, updatedAt: Date.now() };
  sessions.set(chatId, session);
  return session;
}
