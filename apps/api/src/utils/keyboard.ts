export interface InlineButton {
  text: string;
  callback_data: string;
}

export type InlineKeyboard = InlineButton[][];

export function btn(text: string, data: string): InlineButton {
  return { text, callback_data: data };
}

export function paymentMethodKeyboard(): InlineKeyboard {
  return [
    [btn('💵 Efectivo', 'method:Efectivo'), btn('📱 Nequi', 'method:Nequi')],
    [btn('💜 Daviplata', 'method:Daviplata'), btn('🏦 Transferencia', 'method:Transferencia')],
    [btn('🔘 Otro', 'method:Otro')],
  ];
}

export function confirmKeyboard(): InlineKeyboard {
  return [[btn('✅ Confirmar', 'confirm:yes'), btn('❌ Cancelar', 'confirm:no')]];
}

export function customerCardKeyboard(customerId: string): InlineKeyboard {
  return [
    [btn('💵 Registrar pago', `action:pay:${customerId}`), btn('🧾 Nueva venta', `action:sale:${customerId}`)],
    [btn('📋 Ver historial', `action:history:${customerId}`), btn('👤 Ver perfil', `action:profile:${customerId}`)],
  ];
}

export function customerProfileKeyboard(customerId: string): InlineKeyboard {
  return [
    [btn('💵 Registrar pago', `action:pay:${customerId}`), btn('🧾 Nueva venta', `action:sale:${customerId}`)],
    [btn('📋 Ver historial', `action:history:${customerId}`), btn('◀ Volver', `customer:${customerId}`)],
  ];
}

export function customerListKeyboard(customers: Array<{ id: string; name: string }>): InlineKeyboard {
  return customers.map((c) => [btn(c.name, `customer:${c.id}`)]);
}
