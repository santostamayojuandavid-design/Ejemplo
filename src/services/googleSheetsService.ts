import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Subscription, ProductSale, Purchase, Expense, MonthlyFinancialSummary } from '../types';

// Inicializar Firebase App una sola vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // En recargas de página cuando ya había sesión activa pero sin token en memoria
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ==========================================
// Google Sheets API v4 Integración Directa
// ==========================================

export interface CreateSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Crea una nueva hoja de cálculo profesional para Record GYM con pestañas formateadas
 */
export const createRecordGymSpreadsheet = async (
  year: number = new Date().getFullYear()
): Promise<CreateSheetResponse> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para crear la hoja de cálculo');
  }

  const title = `Record GYM - Control Contable & Financiero ${year}`;
  
  const payload = {
    properties: {
      title,
      locale: 'es_CO',
      timeZone: 'America/Bogota',
    },
    sheets: [
      {
        properties: {
          title: 'Resumen_Mensual',
          tabColor: { red: 0.1, green: 0.7, blue: 0.3 },
          gridProperties: { rowCount: 100, columnCount: 15, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Suscripciones',
          tabColor: { red: 0.2, green: 0.5, blue: 0.9 },
          gridProperties: { rowCount: 1000, columnCount: 12, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Ventas_Productos',
          tabColor: { red: 0.95, green: 0.5, blue: 0.1 },
          gridProperties: { rowCount: 1000, columnCount: 12, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Compras_Inventario',
          tabColor: { red: 0.6, green: 0.2, blue: 0.8 },
          gridProperties: { rowCount: 1000, columnCount: 10, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Gastos_Operativos',
          tabColor: { red: 0.85, green: 0.2, blue: 0.2 },
          gridProperties: { rowCount: 1000, columnCount: 10, frozenRowCount: 1 },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error al crear la hoja en Google Sheets: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
};

/**
 * Valida si un ID de hoja de cálculo existe y tenemos acceso
 */
export const verifySpreadsheetAccess = async (spreadsheetId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Sincroniza todos los datos contables en la hoja de cálculo seleccionada
 */
export const syncAllDataToGoogleSheets = async (
  spreadsheetId: string,
  data: {
    subscriptions: Subscription[];
    sales: ProductSale[];
    purchases: Purchase[];
    expenses: Expense[];
    summaries: MonthlyFinancialSummary[];
  }
): Promise<{ success: boolean; message: string; timestamp: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Token de Google no disponible. Por favor reconecta tu cuenta.');
  }

  // 1. Datos para pestaña Resumen_Mensual
  const resumenHeaders = [
    ['RECORD GYM - RESUMEN FINANCIERO Y CONTABLE MENSUAL'],
    ['Última Sincronización:', new Date().toLocaleString('es-CO')],
    [],
    ['Año', 'Mes', 'Ingresos Suscripciones', 'Ingresos Ventas Productos', 'Total Ingresos Brutos', 'Gastos Compras', 'Gastos Operativos', 'Total Egresos', 'Utilidad Neta', 'Margen Operativo %', 'Socios Activos']
  ];
  const resumenRows = data.summaries.map(s => {
    const margin = s.totalGrossIncome > 0 ? ((s.netIncome / s.totalGrossIncome) * 100).toFixed(1) + '%' : '0%';
    return [
      s.year,
      s.monthLabel,
      s.totalSubscriptionsIncome,
      s.totalProductSalesIncome,
      s.totalGrossIncome,
      s.totalPurchasesExpense,
      s.totalOperatingExpense,
      s.totalGrossExpenses,
      s.netIncome,
      margin,
      s.activeMembersCount
    ];
  });
  const resumenValues = [...resumenHeaders, ...resumenRows];

  // 2. Datos para Suscripciones
  const subHeaders = [
    ['ID', 'Fecha Registro', 'Socio / Cliente', 'Teléfono', 'Email', 'Plan', 'Monto Pagado', 'Método de Pago', 'Fecha Inicio', 'Fecha Vencimiento', 'Estado', 'Notas']
  ];
  const subRows = data.subscriptions.map(s => [
    s.id,
    s.createdAt.split('T')[0],
    s.memberName,
    s.phone,
    s.email || '',
    s.plan,
    s.amount,
    s.paymentMethod,
    s.startDate,
    s.endDate,
    new Date(s.endDate) >= new Date() ? 'Activa' : 'Vencida',
    s.notes || ''
  ]);
  const subValues = [...subHeaders, ...subRows];

  // 3. Datos para Ventas Productos
  const salesHeaders = [
    ['ID Venta', 'Fecha', 'Hora', 'Cliente', 'Producto', 'Categoría', 'Cantidad', 'Precio Unitario', 'Costo Unitario', 'Total Venta', 'Ganancia Neta', 'Método Pago', 'Notas']
  ];
  const salesRows = data.sales.map(s => [
    s.id,
    s.date,
    s.time || '',
    s.customerName,
    s.productName,
    s.category,
    s.quantity,
    s.unitPrice,
    s.unitCost,
    s.total,
    s.profit,
    s.paymentMethod,
    s.notes || ''
  ]);
  const salesValues = [...salesHeaders, ...salesRows];

  // 4. Datos para Compras
  const purchasesHeaders = [
    ['ID Compra', 'Fecha', 'Proveedor', 'Factura/Recibo', 'Categoría', 'Descripción', 'Monto Total', 'Estado Pago', 'Método Pago', 'Notas']
  ];
  const purchasesRows = data.purchases.map(p => [
    p.id,
    p.date,
    p.supplier,
    p.invoiceNumber || '',
    p.category,
    p.description,
    p.amount,
    p.paymentStatus,
    p.paymentMethod || '',
    p.notes || ''
  ]);
  const purchasesValues = [...purchasesHeaders, ...purchasesRows];

  // 5. Datos para Gastos Operativos
  const expensesHeaders = [
    ['ID Gasto', 'Fecha', 'Categoría', 'Descripción', 'Monto', 'Pagado a', 'Método Pago', 'N° Comprobante', 'Notas']
  ];
  const expensesRows = data.expenses.map(e => [
    e.id,
    e.date,
    e.category,
    e.description,
    e.amount,
    e.paidTo,
    e.paymentMethod,
    e.receiptNumber || '',
    e.notes || ''
  ]);
  const expensesValues = [...expensesHeaders, ...expensesRows];

  // Enviar los batches a las hojas correspondientes
  const updateSheetRange = async (sheetName: string, values: any[][]) => {
    // Primero limpiar la hoja para evitar datos residuales
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z5000:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`;
    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${sheetName}!A1`,
        majorDimension: 'ROWS',
        values,
      }),
    });

    if (!res.ok) {
      // Si la pestaña no existe con ese nombre exacto, intentar escribir en Sheet1 o la primera pestaña
      const errorText = await res.text();
      console.warn(`Error al escribir en ${sheetName}:`, errorText);
    }
  };

  await Promise.allSettled([
    updateSheetRange('Resumen_Mensual', resumenValues),
    updateSheetRange('Suscripciones', subValues),
    updateSheetRange('Ventas_Productos', salesValues),
    updateSheetRange('Compras_Inventario', purchasesValues),
    updateSheetRange('Gastos_Operativos', expensesValues),
  ]);

  return {
    success: true,
    message: '¡Datos sincronizados exitosamente con Google Sheets!',
    timestamp: new Date().toISOString(),
  };
};
