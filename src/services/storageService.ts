import { 
  Subscription, 
  ProductSale, 
  Purchase, 
  Expense, 
  InventoryItem, 
  MonthlyFinancialSummary,
  GoogleSyncState 
} from '../types';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'record_gym_subscriptions_v1',
  SALES: 'record_gym_sales_v1',
  PURCHASES: 'record_gym_purchases_v1',
  EXPENSES: 'record_gym_expenses_v1',
  INVENTORY: 'record_gym_inventory_v1',
  SYNC_CONFIG: 'record_gym_sync_config_v1',
  CURRENCY_SYMBOL: 'record_gym_currency_v1',
};

// Datos iniciales realistas para Record GYM (en pesos/dólares)
const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Proteína Whey Isolate 2lb (Vainilla)', category: 'Suplementos', costPrice: 130000, salePrice: 195000, stock: 14, minStock: 5 },
  { id: 'inv-2', name: 'Creatina Monohidratada 300g (Creapure)', category: 'Suplementos', costPrice: 75000, salePrice: 120000, stock: 22, minStock: 8 },
  { id: 'inv-3', name: 'Pre-Entreno C4 Extreme 30 servicios', category: 'Suplementos', costPrice: 90000, salePrice: 145000, stock: 9, minStock: 4 },
  { id: 'inv-4', name: 'Bebida Hidratante Gatorade 500ml', category: 'Bebidas', costPrice: 3200, salePrice: 6000, stock: 48, minStock: 15 },
  { id: 'inv-5', name: 'Agua Mineral sin gas 600ml', category: 'Bebidas', costPrice: 1500, salePrice: 3000, stock: 65, minStock: 20 },
  { id: 'inv-6', name: 'Barra Proteica Quest Bar 60g', category: 'Snacks', costPrice: 8500, salePrice: 14000, stock: 30, minStock: 10 },
  { id: 'inv-7', name: 'Shaker Mezclador Record GYM Pro', category: 'Ropa & Accesorios', costPrice: 15000, salePrice: 30000, stock: 25, minStock: 6 },
  { id: 'inv-8', name: 'Straps para Levantamiento de Pesas', category: 'Ropa & Accesorios', costPrice: 18000, salePrice: 35000, stock: 12, minStock: 5 },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    memberId: 'CC-10982341',
    memberName: 'Carlos Mario Restrepo',
    phone: '+57 311 456 7890',
    email: 'carlos.m@example.com',
    plan: 'Mensual VIP / Full',
    amount: 140000,
    paymentMethod: 'Transferencia',
    startDate: '2026-10-01',
    endDate: '2026-11-01',
    notes: 'Incluye acceso ilimitado + zona húmeda',
    createdAt: '2026-10-01T08:30:00Z',
  },
  {
    id: 'sub-002',
    memberId: 'CC-10178492',
    memberName: 'Valentina Ospina Gómez',
    phone: '+57 320 890 1234',
    email: 'valen.ospina@example.com',
    plan: 'Trimestral',
    amount: 360000,
    paymentMethod: 'Nequi / Daviplata',
    startDate: '2026-09-15',
    endDate: '2026-12-15',
    notes: 'Pago completo por 3 meses con 15% desc',
    createdAt: '2026-09-15T10:15:00Z',
  },
  {
    id: 'sub-003',
    memberId: 'CC-71829344',
    memberName: 'Alejandro Morales Duque',
    phone: '+57 300 234 5678',
    email: 'alejo.fitness@example.com',
    plan: 'Mensual Básico',
    amount: 100000,
    paymentMethod: 'Efectivo',
    startDate: '2026-10-05',
    endDate: '2026-11-05',
    notes: 'Horario diurno',
    createdAt: '2026-10-05T14:20:00Z',
  },
  {
    id: 'sub-004',
    memberId: 'CC-10367890',
    memberName: 'Mariana Zuluaga Hoyos',
    phone: '+57 315 678 9012',
    email: 'mariana.zuluaga@example.com',
    plan: 'Entrenamiento Personalizado',
    amount: 380000,
    paymentMethod: 'Tarjeta Débito',
    startDate: '2026-10-10',
    endDate: '2026-11-10',
    notes: 'Plan con Entrenador Juan David (12 sesiones)',
    createdAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'sub-005',
    memberId: 'CC-10948271',
    memberName: 'David Felipe Henao',
    phone: '+57 312 901 3456',
    email: 'david.henao@example.com',
    plan: 'Mensual VIP / Full',
    amount: 140000,
    paymentMethod: 'Nequi / Daviplata',
    startDate: '2026-09-28',
    endDate: '2026-10-28', // Recién vencida para mostrar alerta
    notes: 'Recordar renovación por WhatsApp',
    createdAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 'sub-006',
    memberId: 'CC-98721345',
    memberName: 'Camila Andrea Roldán',
    phone: '+57 318 456 1234',
    email: 'camila.roldan@example.com',
    plan: 'Pase Diario',
    amount: 15000,
    paymentMethod: 'Efectivo',
    startDate: '2026-10-29',
    endDate: '2026-10-29',
    notes: 'Visitante fin de semana',
    createdAt: '2026-10-29T10:00:00Z',
  },
  {
    id: 'sub-007',
    memberId: 'CC-10459812',
    memberName: 'Esteban Cuartas Ríos',
    phone: '+57 301 789 4561',
    email: 'esteban.c@example.com',
    plan: 'Semestral',
    amount: 680000,
    paymentMethod: 'Tarjeta Crédito',
    startDate: '2026-08-01',
    endDate: '2027-02-01',
    notes: 'Membresía premium semestral',
    createdAt: '2026-08-01T11:00:00Z',
  },
  {
    id: 'sub-008',
    memberId: 'CC-10234901',
    memberName: 'Laura Sofía Castro',
    phone: '+57 314 555 8921',
    email: 'laura.castro@example.com',
    plan: 'Mensual Básico',
    amount: 100000,
    paymentMethod: 'Transferencia',
    startDate: '2026-10-02',
    endDate: '2026-11-02',
    notes: 'Estudiante universitaria',
    createdAt: '2026-10-02T15:30:00Z',
  }
];

const INITIAL_SALES: ProductSale[] = [
  {
    id: 'sale-101',
    date: '2026-10-28',
    time: '18:30',
    customerName: 'Carlos Mario Restrepo',
    productId: 'inv-1',
    productName: 'Proteína Whey Isolate 2lb (Vainilla)',
    category: 'Suplementos',
    quantity: 1,
    unitPrice: 195000,
    unitCost: 130000,
    total: 195000,
    profit: 65000,
    paymentMethod: 'Transferencia',
    notes: 'Cliente frecuente',
    createdAt: '2026-10-28T18:30:00Z',
  },
  {
    id: 'sale-102',
    date: '2026-10-28',
    time: '19:15',
    customerName: 'Socio Mostrador',
    productId: 'inv-4',
    productName: 'Bebida Hidratante Gatorade 500ml',
    category: 'Bebidas',
    quantity: 2,
    unitPrice: 6000,
    unitCost: 3200,
    total: 12000,
    profit: 5600,
    paymentMethod: 'Efectivo',
    createdAt: '2026-10-28T19:15:00Z',
  },
  {
    id: 'sale-103',
    date: '2026-10-29',
    time: '08:45',
    customerName: 'Mariana Zuluaga',
    productId: 'inv-2',
    productName: 'Creatina Monohidratada 300g (Creapure)',
    category: 'Suplementos',
    quantity: 1,
    unitPrice: 120000,
    unitCost: 75000,
    total: 120000,
    profit: 45000,
    paymentMethod: 'Nequi / Daviplata',
    createdAt: '2026-10-29T08:45:00Z',
  },
  {
    id: 'sale-104',
    date: '2026-10-29',
    time: '10:20',
    customerName: 'Visitante Mostrador',
    productId: 'inv-5',
    productName: 'Agua Mineral sin gas 600ml',
    category: 'Bebidas',
    quantity: 1,
    unitPrice: 3000,
    unitCost: 1500,
    total: 3000,
    profit: 1500,
    paymentMethod: 'Efectivo',
    createdAt: '2026-10-29T10:20:00Z',
  },
  {
    id: 'sale-105',
    date: '2026-10-27',
    time: '17:00',
    customerName: 'David Felipe Henao',
    productId: 'inv-8',
    productName: 'Straps para Levantamiento de Pesas',
    category: 'Ropa & Accesorios',
    quantity: 1,
    unitPrice: 35000,
    unitCost: 18000,
    total: 35000,
    profit: 17000,
    paymentMethod: 'Nequi / Daviplata',
    createdAt: '2026-10-27T17:00:00Z',
  },
  {
    id: 'sale-106',
    date: '2026-10-26',
    time: '16:10',
    customerName: 'Alejandro Morales',
    productId: 'inv-6',
    productName: 'Barra Proteica Quest Bar 60g',
    category: 'Snacks',
    quantity: 3,
    unitPrice: 14000,
    unitCost: 8500,
    total: 42000,
    profit: 16500,
    paymentMethod: 'Efectivo',
    createdAt: '2026-10-26T16:10:00Z',
  }
];

const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur-201',
    date: '2026-10-08',
    supplier: 'Distribuidora Nutrición Fitness Pro SAS',
    invoiceNumber: 'FAC-9842',
    category: 'Inventario para Venta',
    description: 'Pedido mayorista de Proteína Whey (15 uds) y Creatinas (20 uds)',
    amount: 3200000,
    paymentStatus: 'Pagado',
    paymentMethod: 'Transferencia',
    notes: 'Mercancía recibida en bodega en perfecto estado',
    createdAt: '2026-10-08T11:00:00Z',
  },
  {
    id: 'pur-202',
    date: '2026-10-14',
    supplier: 'TecnoGym & Fitness Equipos',
    invoiceNumber: 'FAC-1234',
    category: 'Mantenimiento & Repuestos',
    description: 'Guayas de acero de alta resistencia y poleas para multifuncionales',
    amount: 450000,
    paymentStatus: 'Pagado',
    paymentMethod: 'Transferencia',
    notes: 'Mantenimiento preventivo de poleas piso 2',
    createdAt: '2026-10-14T15:20:00Z',
  },
  {
    id: 'pur-203',
    date: '2026-10-18',
    supplier: 'Distribuidora Postobón / Bebidas',
    invoiceNumber: 'REM-8821',
    category: 'Inventario para Venta',
    description: '5 cajas de Gatorade 500ml y 4 pacas de Agua mineral 600ml',
    amount: 340000,
    paymentStatus: 'Pagado',
    paymentMethod: 'Efectivo',
    notes: 'Reabastecimiento de nevera mostrador',
    createdAt: '2026-10-18T09:30:00Z',
  },
  {
    id: 'pur-204',
    date: '2026-10-22',
    supplier: 'Comercializadora de Aseo Industrial',
    invoiceNumber: 'FAC-4411',
    category: 'Insumos de Limpieza',
    description: 'Desinfectante amonio cuaternario, toallas de papel jumbo y alcohol',
    amount: 185000,
    paymentStatus: 'Pagado',
    paymentMethod: 'Efectivo',
    notes: 'Insumos mensuales de higiene para máquinas',
    createdAt: '2026-10-22T13:45:00Z',
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-301',
    date: '2026-10-05',
    category: 'Arriendo / Alquiler',
    description: 'Canon de arrendamiento local comercial Record GYM (Octubre 2026)',
    amount: 2800000,
    paidTo: 'Inmobiliaria El Poblado',
    paymentMethod: 'Transferencia',
    receiptNumber: 'REC-AR-1026',
    notes: 'Comprobante bancario archivado',
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'exp-302',
    date: '2026-10-10',
    category: 'Servicios Públicos (Luz, Agua, Gas)',
    description: 'Factura EPM Energía Eléctrica (Iluminación, Aire Acondicionado y Caminadoras)',
    amount: 680000,
    paidTo: 'Empresas Públicas de Medellín (EPM)',
    paymentMethod: 'Transferencia',
    receiptNumber: 'EPM-992182',
    createdAt: '2026-10-10T11:30:00Z',
  },
  {
    id: 'exp-303',
    date: '2026-10-12',
    category: 'Servicios Públicos (Luz, Agua, Gas)',
    description: 'Factura EPM Acueducto, Alcantarillado y Aseo',
    amount: 240000,
    paidTo: 'Empresas Públicas de Medellín (EPM)',
    paymentMethod: 'Transferencia',
    receiptNumber: 'EPM-771239',
    createdAt: '2026-10-12T14:10:00Z',
  },
  {
    id: 'exp-304',
    date: '2026-10-15',
    category: 'Nómina & Honorarios Entrenadores',
    description: 'Primera quincena Entrenador de planta (Juan David) y Entrenadora de clases grupales',
    amount: 1450000,
    paidTo: 'Personal de Entrenamiento',
    paymentMethod: 'Transferencia',
    receiptNumber: 'NOM-Q1-1026',
    notes: 'Quincena 1 al 15 de octubre',
    createdAt: '2026-10-15T18:00:00Z',
  },
  {
    id: 'exp-305',
    date: '2026-10-15',
    category: 'Nómina Recepción & Aseo',
    description: 'Primera quincena Recepcionista turno mañana y Personal de servicios generales',
    amount: 950000,
    paidTo: 'Personal Administrativo y Aseo',
    paymentMethod: 'Transferencia',
    receiptNumber: 'NOM-REC-Q1',
    createdAt: '2026-10-15T18:15:00Z',
  },
  {
    id: 'exp-306',
    date: '2026-10-06',
    category: 'Internet & Telefonía',
    description: 'Plan fibra óptica simétrica 300MB y línea fija mostrador',
    amount: 95000,
    paidTo: 'Tigo / UNE Telecomunicaciones',
    paymentMethod: 'Transferencia',
    receiptNumber: 'TIG-55421',
    createdAt: '2026-10-06T09:00:00Z',
  },
  {
    id: 'exp-307',
    date: '2026-10-20',
    category: 'Publicidad & Redes Sociales',
    description: 'Campaña Meta Ads (Instagram & Facebook) membresías de fin de año',
    amount: 220000,
    paidTo: 'Meta Platforms Inc.',
    paymentMethod: 'Tarjeta Crédito',
    receiptNumber: 'META-OCT-892',
    createdAt: '2026-10-20T16:45:00Z',
  },
  {
    id: 'exp-308',
    date: '2026-10-25',
    category: 'Caja Menor / Gastos Imprevistos',
    description: 'Botellón de agua para dispensador, café para recepción y pilas para báscula bioimpedancia',
    amount: 45000,
    paidTo: 'Supermercado Local',
    paymentMethod: 'Efectivo',
    receiptNumber: 'TKT-0932',
    createdAt: '2026-10-25T11:00:00Z',
  }
];

export const storageService = {
  // Suscripciones
  getSubscriptions: (): Subscription[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  },
  saveSubscriptions: (items: Subscription[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(items));
  },
  addSubscription: (item: Omit<Subscription, 'id' | 'createdAt'>): Subscription => {
    const current = storageService.getSubscriptions();
    const newSub: Subscription = {
      ...item,
      id: `sub-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newSub, ...current];
    storageService.saveSubscriptions(updated);
    return newSub;
  },
  updateSubscription: (id: string, updates: Partial<Subscription>) => {
    const current = storageService.getSubscriptions();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    storageService.saveSubscriptions(updated);
    return updated;
  },
  deleteSubscription: (id: string) => {
    const current = storageService.getSubscriptions();
    const updated = current.filter(item => item.id !== id);
    storageService.saveSubscriptions(updated);
    return updated;
  },

  // Ventas de Productos
  getSales: (): ProductSale[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SALES;
    }
  },
  saveSales: (items: ProductSale[]) => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(items));
  },
  addSale: (saleData: Omit<ProductSale, 'id' | 'createdAt'>): ProductSale => {
    const current = storageService.getSales();
    const newSale: ProductSale = {
      ...saleData,
      id: `sale-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newSale, ...current];
    storageService.saveSales(updated);

    // Descontar inventario si existe
    if (saleData.productId) {
      storageService.adjustStock(saleData.productId, -saleData.quantity);
    }

    return newSale;
  },
  deleteSale: (id: string) => {
    const current = storageService.getSales();
    const updated = current.filter(item => item.id !== id);
    storageService.saveSales(updated);
    return updated;
  },

  // Compras
  getPurchases: (): Purchase[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(INITIAL_PURCHASES));
      return INITIAL_PURCHASES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PURCHASES;
    }
  },
  savePurchases: (items: Purchase[]) => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(items));
  },
  addPurchase: (item: Omit<Purchase, 'id' | 'createdAt'>): Purchase => {
    const current = storageService.getPurchases();
    const newPurchase: Purchase = {
      ...item,
      id: `pur-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPurchase, ...current];
    storageService.savePurchases(updated);
    return newPurchase;
  },
  updatePurchase: (id: string, updates: Partial<Purchase>) => {
    const current = storageService.getPurchases();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    storageService.savePurchases(updated);
    return updated;
  },
  deletePurchase: (id: string) => {
    const current = storageService.getPurchases();
    const updated = current.filter(item => item.id !== id);
    storageService.savePurchases(updated);
    return updated;
  },

  // Gastos Operativos
  getExpenses: (): Expense[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses: (items: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(items));
  },
  addExpense: (item: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const current = storageService.getExpenses();
    const newExpense: Expense = {
      ...item,
      id: `exp-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newExpense, ...current];
    storageService.saveExpenses(updated);
    return newExpense;
  },
  updateExpense: (id: string, updates: Partial<Expense>) => {
    const current = storageService.getExpenses();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    storageService.saveExpenses(updated);
    return updated;
  },
  deleteExpense: (id: string) => {
    const current = storageService.getExpenses();
    const updated = current.filter(item => item.id !== id);
    storageService.saveExpenses(updated);
    return updated;
  },

  // Inventario
  getInventory: (): InventoryItem[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INVENTORY;
    }
  },
  saveInventory: (items: InventoryItem[]) => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  },
  addInventoryItem: (item: Omit<InventoryItem, 'id'>): InventoryItem => {
    const current = storageService.getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now().toString().slice(-6)}`,
    };
    const updated = [...current, newItem];
    storageService.saveInventory(updated);
    return newItem;
  },
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => {
    const current = storageService.getInventory();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    storageService.saveInventory(updated);
    return updated;
  },
  adjustStock: (id: string, delta: number) => {
    const current = storageService.getInventory();
    const updated = current.map(item => {
      if (item.id === id) {
        return { ...item, stock: Math.max(0, item.stock + delta) };
      }
      return item;
    });
    storageService.saveInventory(updated);
  },

  // Configuración de sincronización Google Sheets
  getSyncConfig: (): GoogleSyncState => {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
    if (!raw) {
      return {
        spreadsheetId: null,
        spreadsheetUrl: null,
        spreadsheetTitle: 'Record GYM - Control Contable',
        lastSyncedAt: null,
        isSyncing: false,
        autoSync: true,
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        spreadsheetId: null,
        spreadsheetUrl: null,
        spreadsheetTitle: 'Record GYM - Control Contable',
        lastSyncedAt: null,
        isSyncing: false,
        autoSync: true,
      };
    }
  },
  saveSyncConfig: (config: GoogleSyncState) => {
    localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(config));
  },

  // Moneda
  getCurrencySymbol: (): string => {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY_SYMBOL) || '$';
  },
  setCurrencySymbol: (symbol: string) => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY_SYMBOL, symbol);
  },

  // Generación de resumen mensual
  calculateMonthlySummary: (year: number, month: number): MonthlyFinancialSummary => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    const subs = storageService.getSubscriptions();
    const sales = storageService.getSales();
    const purchases = storageService.getPurchases();
    const expenses = storageService.getExpenses();

    // Suscripciones pagadas en este mes
    const monthSubs = subs.filter(s => (s.startDate && s.startDate.startsWith(monthPrefix)) || (s.createdAt && s.createdAt.startsWith(monthPrefix)));
    const totalSubscriptionsIncome = monthSubs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Ventas de productos en este mes
    const monthSales = sales.filter(s => s.date && s.date.startsWith(monthPrefix));
    const totalProductSalesIncome = monthSales.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const totalGrossIncome = totalSubscriptionsIncome + totalProductSalesIncome;

    // Compras en este mes
    const monthPurchases = purchases.filter(p => p.date && p.date.startsWith(monthPrefix));
    const totalPurchasesExpense = monthPurchases.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Gastos operativos en este mes
    const monthExpenses = expenses.filter(e => e.date && e.date.startsWith(monthPrefix));
    const totalOperatingExpense = monthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalGrossExpenses = totalPurchasesExpense + totalOperatingExpense;

    const netIncome = totalGrossIncome - totalGrossExpenses;

    // Socios activos al cierre del mes
    const endOfMonthDate = new Date(year, month, 0).toISOString().split('T')[0];
    const activeMembersCount = subs.filter(s => s.endDate >= endOfMonthDate || (s.startDate <= endOfMonthDate && s.endDate >= endOfMonthDate)).length;

    // Desglose de gastos por categoría
    const expenseCategoryMap: Record<string, number> = {};
    monthExpenses.forEach(e => {
      expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + Number(e.amount);
    });
    // Agregar compras a la categoría
    if (totalPurchasesExpense > 0) {
      expenseCategoryMap['Compras & Inventario'] = totalPurchasesExpense;
    }
    const expensesByCategory = Object.entries(expenseCategoryMap).map(([category, total]) => ({
      category,
      total,
      percentage: totalGrossExpenses > 0 ? (total / totalGrossExpenses) * 100 : 0,
    })).sort((a, b) => b.total - a.total);

    // Desglose de ingresos
    const incomeByCategory = [
      {
        category: 'Suscripciones y Membresías',
        total: totalSubscriptionsIncome,
        percentage: totalGrossIncome > 0 ? (totalSubscriptionsIncome / totalGrossIncome) * 100 : 0,
      },
      {
        category: 'Ventas de Mostrador / Suplementos',
        total: totalProductSalesIncome,
        percentage: totalGrossIncome > 0 ? (totalProductSalesIncome / totalGrossIncome) * 100 : 0,
      },
    ];

    // Productos más vendidos
    const productSalesMap: Record<string, { quantity: number; revenue: number }> = {};
    monthSales.forEach(s => {
      if (!productSalesMap[s.productName]) {
        productSalesMap[s.productName] = { quantity: 0, revenue: 0 };
      }
      productSalesMap[s.productName].quantity += Number(s.quantity) || 1;
      productSalesMap[s.productName].revenue += Number(s.total) || 0;
    });

    const topSellingProducts = Object.entries(productSalesMap).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return {
      year,
      month,
      monthLabel: `${monthNames[month - 1]} ${year}`,
      totalSubscriptionsIncome,
      totalProductSalesIncome,
      totalGrossIncome,
      totalPurchasesExpense,
      totalOperatingExpense,
      totalGrossExpenses,
      netIncome,
      activeMembersCount,
      newSubscriptionsCount: monthSubs.length,
      topSellingProducts,
      expensesByCategory,
      incomeByCategory,
    };
  },

  // Genera historial de resúmenes de los últimos 6 meses para gráficas o sincronización
  getPastSixMonthsSummaries: (): MonthlyFinancialSummary[] => {
    const list: MonthlyFinancialSummary[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const summary = storageService.calculateMonthlySummary(d.getFullYear(), d.getMonth() + 1);
      list.push(summary);
    }
    return list;
  },

  // Exportar a CSV
  exportToCSV: (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string | number)[]) => {
      let finalVal = '';
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) {
          result = `"${result}"`;
        }
        if (j > 0) finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    let csvContent = '\uFEFF'; // BOM para soportar tildes y caracteres en español en Excel
    for (let i = 0; i < rows.length; i++) {
      csvContent += processRow(rows[i]);
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Resetear a datos de fábrica
  resetDataToDefaults: () => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(INITIAL_PURCHASES));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
  }
};

export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  return `${symbol} ${Math.round(amount).toLocaleString('es-CO')}`;
};
