/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken,
  syncAllDataToGoogleSheets,
  createRecordGymSpreadsheet
} from './services/googleSheetsService';
import { storageService, formatCurrency } from './services/storageService';
import { 
  Subscription, 
  ProductSale, 
  Purchase, 
  Expense, 
  InventoryItem, 
  GoogleSyncState 
} from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SubscriptionsManager } from './components/SubscriptionsManager';
import { ProductSalesManager } from './components/ProductSalesManager';
import { PurchasesManager } from './components/PurchasesManager';
import { ExpensesManager } from './components/ExpensesManager';
import { InventoryManager } from './components/InventoryManager';
import { MonthlyReports } from './components/MonthlyReports';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Datos contables
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [syncState, setSyncState] = useState<GoogleSyncState>(storageService.getSyncConfig());
  const [currencySymbol, setCurrencySymbol] = useState<string>(storageService.getCurrencySymbol());

  // Estado de sincronización y modales
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string; link?: string } | null>(null);

  // Cargar datos iniciales
  const loadAllData = useCallback(() => {
    setSubscriptions(storageService.getSubscriptions());
    setSales(storageService.getSales());
    setPurchases(storageService.getPurchases());
    setExpenses(storageService.getExpenses());
    setInventory(storageService.getInventory());
    setSyncState(storageService.getSyncConfig());
    setCurrencySymbol(storageService.getCurrencySymbol());
  }, []);

  useEffect(() => {
    loadAllData();

    // Inicializar oyente de Firebase Auth
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [loadAllData]);

  // Mostrar toast auto-ocultable
  const showToast = (type: 'success' | 'error' | 'info', message: string, link?: string) => {
    setToastNotification({ type, message, link });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Login con Google
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        showToast('success', `¡Bienvenido ${result.user.displayName || ''}! Conexión con Google establecida.`);
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      showToast('error', err.message || 'No se pudo iniciar sesión con Google.');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      showToast('info', 'Sesión de Google cerrada.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Sincronizar todos los datos con Google Sheets
  const handleQuickSync = async () => {
    if (!syncState.spreadsheetId) {
      setShowSheetsModal(true);
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      showToast('info', 'Por favor inicia sesión con Google para sincronizar con tu hoja de cálculo.');
      handleLogin();
      return;
    }

    setIsSyncing(true);
    try {
      const subs = storageService.getSubscriptions();
      const sls = storageService.getSales();
      const purs = storageService.getPurchases();
      const exps = storageService.getExpenses();
      const sums = storageService.getPastSixMonthsSummaries();

      const res = await syncAllDataToGoogleSheets(syncState.spreadsheetId, {
        subscriptions: subs,
        sales: sls,
        purchases: purs,
        expenses: exps,
        summaries: sums,
      });

      const updatedSyncState: GoogleSyncState = {
        ...syncState,
        lastSyncedAt: res.timestamp,
      };
      setSyncState(updatedSyncState);
      storageService.saveSyncConfig(updatedSyncState);

      showToast(
        'success',
        '¡Registros sincronizados con éxito en Google Sheets!',
        syncState.spreadsheetUrl || undefined
      );
    } catch (err: any) {
      console.error('Error en sincronización:', err);
      showToast('error', err.message || 'Error al sincronizar con Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manejadores de Suscripciones
  const handleAddSubscription = (newSub: Omit<Subscription, 'id' | 'createdAt'>) => {
    const created = storageService.addSubscription(newSub);
    setSubscriptions(storageService.getSubscriptions());
    showToast('success', `Suscripción de ${created.memberName} registrada correctamente.`);
    // Auto sync si está configurado
    if (syncState.spreadsheetId && syncState.autoSync) {
      handleQuickSync();
    }
  };

  const handleRenewSubscription = (sub: Subscription) => {
    // Calcular nuevo período sumando 30 días a partir de hoy o de su fecha fin
    const now = new Date();
    const currentEnd = new Date(sub.endDate);
    const startFrom = currentEnd > now ? currentEnd : now;
    
    const newStart = startFrom.toISOString().split('T')[0];
    const newEndObj = new Date(startFrom);
    newEndObj.setDate(newEndObj.getDate() + 30);
    const newEnd = newEndObj.toISOString().split('T')[0];

    // Actualizar suscripción
    storageService.updateSubscription(sub.id, {
      startDate: newStart,
      endDate: newEnd,
      amount: sub.amount,
      createdAt: new Date().toISOString(),
    });
    setSubscriptions(storageService.getSubscriptions());
    showToast('success', `¡Suscripción de ${sub.memberName} renovada con éxito hasta el ${newEnd}!`);

    if (syncState.spreadsheetId && syncState.autoSync) {
      handleQuickSync();
    }
  };

  const handleDeleteSubscription = (id: string) => {
    const updated = storageService.deleteSubscription(id);
    setSubscriptions(updated);
    showToast('info', 'Registro de suscripción eliminado.');
  };

  // Manejadores de Ventas
  const handleAddSale = (newSale: Omit<ProductSale, 'id' | 'createdAt'>) => {
    const created = storageService.addSale(newSale);
    setSales(storageService.getSales());
    setInventory(storageService.getInventory());
    showToast('success', `Venta de ${created.productName} registrada por ${formatCurrency(created.total, currencySymbol)}.`);

    if (syncState.spreadsheetId && syncState.autoSync) {
      handleQuickSync();
    }
  };

  const handleDeleteSale = (id: string) => {
    const updated = storageService.deleteSale(id);
    setSales(updated);
    showToast('info', 'Registro de venta eliminado.');
  };

  // Manejadores de Compras
  const handleAddPurchase = (newPurchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    const created = storageService.addPurchase(newPurchase);
    setPurchases(storageService.getPurchases());
    showToast('success', `Compra a ${created.supplier} registrada.`);

    if (syncState.spreadsheetId && syncState.autoSync) {
      handleQuickSync();
    }
  };

  const handleDeletePurchase = (id: string) => {
    const updated = storageService.deletePurchase(id);
    setPurchases(updated);
    showToast('info', 'Registro de compra eliminado.');
  };

  // Manejadores de Gastos
  const handleAddExpense = (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const created = storageService.addExpense(newExpense);
    setExpenses(storageService.getExpenses());
    showToast('success', `Gasto de "${created.description}" registrado por ${formatCurrency(created.amount, currencySymbol)}.`);

    if (syncState.spreadsheetId && syncState.autoSync) {
      handleQuickSync();
    }
  };

  const handleDeleteExpense = (id: string) => {
    const updated = storageService.deleteExpense(id);
    setExpenses(updated);
    showToast('info', 'Registro de gasto eliminado.');
  };

  // Manejadores de Inventario
  const handleAddProduct = (item: Omit<InventoryItem, 'id'>) => {
    const created = storageService.addInventoryItem(item);
    setInventory(storageService.getInventory());
    showToast('success', `Producto "${created.name}" agregado al catálogo.`);
  };

  const handleUpdateProduct = (id: string, updates: Partial<InventoryItem>) => {
    const updated = storageService.updateInventoryItem(id, updates);
    setInventory(updated);
  };

  // Fecha actual para resúmenes
  const today = new Date();
  const currentSummary = storageService.calculateMonthlySummary(today.getFullYear(), today.getMonth() + 1);
  const pastSummaries = storageService.getPastSixMonthsSummaries();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Barra de Navegación Principal */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        syncState={syncState}
        onOpenSheetsModal={() => setShowSheetsModal(true)}
        onQuickSync={handleQuickSync}
        isSyncing={isSyncing}
      />

      {/* Banner flotante de Google Sheets si no está configurada */}
      {!syncState.spreadsheetId && activeTab === 'dashboard' && (
        <div className="no-print bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-b border-emerald-500/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>¿Deseas respaldar tu contabilidad en Google Sheets?</strong> Conecta tu cuenta y crea una hoja de cálculo con un solo clic.
              </span>
            </div>
            <button
              onClick={() => setShowSheetsModal(true)}
              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition cursor-pointer shrink-0 shadow-sm"
            >
              Conectar Google Sheets
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastNotification && (
        <div className="no-print fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-md">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 ${
              toastNotification.type === 'success'
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                : toastNotification.type === 'error'
                ? 'bg-slate-900 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-blue-500/40 text-blue-300'
            }`}
          >
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-semibold text-white">{toastNotification.message}</p>
              {toastNotification.link && (
                <a
                  href={toastNotification.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline mt-1 font-semibold"
                >
                  Abrir hoja en Google Sheets <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentSummary={currentSummary}
            pastSummaries={pastSummaries}
            subscriptions={subscriptions}
            sales={sales}
            purchases={purchases}
            expenses={expenses}
            currencySymbol={currencySymbol}
            onNavigateTab={setActiveTab}
            onQuickAdd={(type) => {
              if (type === 'subscription') setActiveTab('subscriptions');
              if (type === 'sale') setActiveTab('sales');
              if (type === 'expense') setActiveTab('expenses');
              if (type === 'purchase') setActiveTab('purchases');
            }}
            onOpenSheetsModal={() => setShowSheetsModal(true)}
            syncState={syncState}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsManager
            subscriptions={subscriptions}
            onAddSubscription={handleAddSubscription}
            onRenewSubscription={handleRenewSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'sales' && (
          <ProductSalesManager
            sales={sales}
            inventory={inventory}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesManager
            purchases={purchases}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesManager
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReports
            currentYear={today.getFullYear()}
            currentMonth={today.getMonth() + 1}
            currencySymbol={currencySymbol}
            syncState={syncState}
            onOpenSheetsModal={() => setShowSheetsModal(true)}
            onSyncReportToSheets={handleQuickSync}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-400">
            RECORD GYM • Sistema Contable y Financiero
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Suscripciones</span>
            <span>•</span>
            <span>Ventas Mostrador</span>
            <span>•</span>
            <span>Compras & Gastos</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Sincronización Google Sheets</span>
          </div>
        </div>
      </footer>

      {/* Modal de Configuración Google Sheets */}
      <GoogleSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        syncState={syncState}
        onUpdateSyncState={setSyncState}
        isAuthenticated={!!currentUser}
        userEmail={currentUser?.email}
        onLoginClick={handleLogin}
      />

    </div>
  );
}
