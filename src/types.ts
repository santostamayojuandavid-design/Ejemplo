/**
 * Tipos de datos para el sistema contable de Record GYM
 */

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta Débito' | 'Tarjeta Crédito' | 'Nequi / Daviplata';

export type PlanType = 
  | 'Pase Diario'
  | 'Semanal'
  | 'Quincenal'
  | 'Mensual Básico'
  | 'Mensual VIP / Full'
  | 'Trimestral'
  | 'Semestral'
  | 'Anual'
  | 'Entrenamiento Personalizado';

export type SubscriptionStatus = 'Activa' | 'Por Vencer' | 'Vencida';

export interface Subscription {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  email?: string;
  plan: PlanType;
  amount: number;
  paymentMethod: PaymentMethod;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Suplementos' | 'Bebidas' | 'Snacks' | 'Ropa & Accesorios' | 'Otros';
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  barcode?: string;
}

export interface ProductSale {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type PurchaseCategory = 
  | 'Inventario para Venta'
  | 'Equipamiento & Máquinas'
  | 'Mantenimiento & Repuestos'
  | 'Insumos de Limpieza'
  | 'Dotación & Papelería'
  | 'Otros';

export interface Purchase {
  id: string;
  date: string; // YYYY-MM-DD
  supplier: string; // Proveedor
  invoiceNumber?: string; // N° Factura / Recibo
  category: PurchaseCategory;
  description: string;
  amount: number;
  paymentStatus: 'Pagado' | 'Pendiente' | 'A Crédito';
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Arriendo / Alquiler'
  | 'Servicios Públicos (Luz, Agua, Gas)'
  | 'Internet & Telefonía'
  | 'Nómina & Honorarios Entrenadores'
  | 'Nómina Recepción & Aseo'
  | 'Mantenimiento de Instalaciones'
  | 'Publicidad & Redes Sociales'
  | 'Software & Licencias'
  | 'Impuestos & Tasas'
  | 'Caja Menor / Gastos Imprevistos';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string; // Beneficiario o entidad
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface MonthlyFinancialSummary {
  year: number;
  month: number; // 1-12
  monthLabel: string;
  totalSubscriptionsIncome: number;
  totalProductSalesIncome: number;
  totalGrossIncome: number;
  totalPurchasesExpense: number;
  totalOperatingExpense: number;
  totalGrossExpenses: number;
  netIncome: number; // Ingresos - Egresos
  activeMembersCount: number;
  newSubscriptionsCount: number;
  topSellingProducts: { name: string; quantity: number; revenue: number }[];
  expensesByCategory: { category: string; total: number; percentage: number }[];
  incomeByCategory: { category: string; total: number; percentage: number }[];
}

export interface GoogleSyncState {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  autoSync: boolean;
}
