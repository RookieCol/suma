export const MSG = {
  welcome: `👋 *Recaudos Bot*\n\nEscribe el nombre de un cliente para consultar su saldo, o usa los botones:`,

  mainMenu: `📋 *Menú principal*\n\nElige una opción:`,

  customerNotFound: (query: string) =>
    `❌ No encontré ningún cliente con *"${query}"*.\n¿Quieres registrarlo como cliente nuevo?`,

  multipleCustomers: (query: string) =>
    `🔍 Encontré varios clientes con *"${query}"*. ¿Cuál buscas?`,

  tooManyResults: `Hay demasiados resultados. Sé más específico con el nombre.`,

  askAmount: `💰 ¿Cuánto vas a registrar? (ej: 50000, 50.000, 50mil)`,

  askPaymentMethod: `💳 ¿Cómo pagó?`,

  askSaleDescription: `🧾 ¿Qué vendiste? (ej: tela lino 5m, encaje blanco)`,

  askCustomerName: `👤 ¿Cuál es el nombre completo del cliente?`,

  askCompany: `🏢 ¿A qué empresa o negocio pertenece? (escribe "no" para omitir)`,

  askPhone: `📱 ¿Cuál es su teléfono? (escribe "no" para omitir)`,

  askAddress: `🏠 ¿Cuál es su dirección? (escribe "no" para omitir)`,

  askNeighborhood: `📍 ¿En qué barrio vive? (escribe "no" para omitir)`,

  invalidAmount: `❌ No entendí el monto. Escribe algo como: 50000, 50.000 ó 50mil`,

  cancelled: `✅ Operación cancelada.`,

  genericError: `⚠️ Ocurrió un error. Intenta de nuevo.`,

  paymentSummary: (name: string, amount: string, method: string) =>
    `📋 *Confirmar pago*\n\n👤 Cliente: ${name}\n💰 Monto: ${amount}\n💳 Método: ${method}`,

  saleSummary: (name: string, description: string, amount: string) =>
    `📋 *Confirmar venta*\n\n👤 Cliente: ${name}\n🧾 Descripción: ${description}\n💰 Monto: ${amount}`,

  newCustomerSummary: (name: string, company: string, phone: string, address: string, neighborhood: string) =>
    `📋 *Confirmar cliente nuevo*\n\n👤 Nombre: ${name}\n🏢 Empresa: ${company}\n📱 Teléfono: ${phone}\n🏠 Dirección: ${address}\n📍 Barrio: ${neighborhood}`,

  paymentRecorded: (name: string, amount: string) =>
    `✅ Pago de ${amount} registrado para *${name}*.\n\nNuevo saldo:`,

  saleRecorded: (name: string, amount: string) =>
    `✅ Venta de ${amount} registrada para *${name}*.\n\nNuevo saldo:`,

  customerCreated: (name: string) =>
    `✅ Cliente *${name}* registrado correctamente.`,

  noDebts: `✅ No hay clientes con saldo pendiente.`,

  unknownCommand: `No entendí ese comando. Escribe el nombre de un cliente o usa /menu`,
};
