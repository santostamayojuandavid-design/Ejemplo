import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertCircle, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  FileSpreadsheet, 
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  Subscription, 
  ProductSale, 
  Purchase, 
  Expense, 
  MonthlyFinancialSummary, 
  GoogleSyncState 
} from '../types';
import { formatCurrency } from '../services/storageService';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  currentSummary: MonthlyFinancialSummary;
  pastSummaries: MonthlyFinancialSummary[];
  subscriptions: Subscription[];
  sales: ProductSale[];
  purchases: Purchase[];
  expenses: Expense[];
  currencySymbol: string;
  onNavigateTab: (tab: ActiveTab) => void;
  onQuickAdd: (type: 'subscription' | 'sale' | 'expense' | 'purchase') => void;
  onOpenSheetsModal: () => void;
  syncState: GoogleSyncState;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentSummary,
  pastSummaries,
  subscriptions,
  sales,
  purchases,
  expenses,
  currencySymbol,
  onNavigateTab,
  onQuickAdd,
  onOpenSheetsModal,
  syncState,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Suscripciones que vencen hoy o en los próximos 5 días, o vencidas recientemente
  const todayDate = new Date();
  const expiringSubscriptions = subscriptions.filter(s => {
    const end = new Date(s.endDate);
    const diffDays = Math.ceil((end.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= -3 && diffDays <= 5;
  });

  // Transacciones recientes combinadas
  const recentActivities = [
    ...subscriptions.slice(0, 4).map(s => ({
      id: s.id,
      title: `Suscripción: ${s.memberName}`,
      subtitle: `${s.plan} • ${s.paymentMethod}`,
      amount: s.amount,
      isIncome: true,
      date: s.startDate,
      type: 'suscripcion',
    })),
    ...sales.slice(0, 4).map(sl => ({
      id: sl.id,
      title: `Venta: ${sl.productName}`,
      subtitle: `${sl.quantity} ud(s) • ${sl.customerName}`,
      amount: sl.total,
      isIncome: true,
      date: sl.date,
      type: 'venta',
    })),
    ...expenses.slice(0, 3).map(e => ({
      id: e.id,
      title: `Gasto: ${e.category}`,
      subtitle: e.description,
      amount: e.amount,
      isIncome: false,
      date: e.date,
      type: 'gasto',
    })),
  ].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 6);

  const profitMargin = currentSummary.totalGrossIncome > 0
    ? ((currentSummary.netIncome / currentSummary.totalGrossIncome) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Banner Superior de Bienvenida y Acciones Rápidas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Gestión Financiera Record GYM
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Control Contable & Operativo
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Período actual: <span className="text-amber-400 font-semibold">{currentSummary.monthLabel}</span>. 
              {syncState.spreadsheetId ? (
                <span className="text-emerald-400 ml-1 inline-flex items-center gap-1 font-medium">
                  • Hoja Google Sheets sincronizada
                </span>
              ) : (
                <span className="text-slate-400 ml-1">
                  • Conecta Google Sheets para respaldo en la nube
                </span>
              )}
            </p>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onQuickAdd('subscription')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              + Suscripción
            </button>
            <button
              onClick={() => onQuickAdd('sale')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <ShoppingBag className="w-4 h-4" />
              + Venta POS
            </button>
            <button
              onClick={() => onQuickAdd('expense')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-xl transition cursor-pointer border border-slate-700 flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-rose-400" />
              + Gasto
            </button>
            <button
              onClick={onOpenSheetsModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-xl transition cursor-pointer border border-emerald-500/30 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Google Sheets
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards de Finanzas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Ingresos */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos del Mes</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(currentSummary.totalGrossIncome, currencySymbol)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">
                {formatCurrency(currentSummary.totalSubscriptionsIncome, currencySymbol)}
              </span>
              <span>subs +</span>
              <span className="text-amber-400 font-medium">
                {formatCurrency(currentSummary.totalProductSalesIncome, currencySymbol)}
              </span>
              <span>ventas</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Nuevas inscripciones:</span>
            <span className="font-semibold text-white">{currentSummary.newSubscriptionsCount}</span>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Egresos Totales</span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(currentSummary.totalGrossExpenses, currencySymbol)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-rose-400 font-medium">
                {formatCurrency(currentSummary.totalOperatingExpense, currencySymbol)}
              </span>
              <span>operativos +</span>
              <span className="text-purple-400 font-medium">
                {formatCurrency(currentSummary.totalPurchasesExpense, currencySymbol)}
              </span>
              <span>compras</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Gastos fijos y nómina:</span>
            <span className="font-semibold text-rose-400">Controlado</span>
          </div>
        </div>

        {/* Utilidad Neta / Flujo de Caja */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilidad Neta</span>
            <div className={`p-2.5 rounded-2xl border ${currentSummary.netIncome >= 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${currentSummary.netIncome >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatCurrency(currentSummary.netIncome, currencySymbol)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${currentSummary.netIncome >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                Margen: {profitMargin}%
              </span>
              <span className="text-slate-400">Ganancia libre</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rendimiento:</span>
            <span className="font-semibold text-emerald-400">{currentSummary.netIncome >= 0 ? 'Positivo' : 'Déficit'}</span>
          </div>
        </div>

        {/* Socios Activos */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Socios Activos</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentSummary.activeMembersCount}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-blue-400 font-medium">Membresías al día</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Por vencer pronto:</span>
            <span className="font-semibold text-amber-400">{expiringSubscriptions.length} alertas</span>
          </div>
        </div>

      </div>

      {/* Grid de 2 Columnas: Comparativa Mensual & Alertas de Vencimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Historial Comparativo 6 Meses */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Desempeño Contable Semestral
              </h2>
              <p className="text-xs text-slate-400">Comparativa mensual de ingresos vs egresos de Record GYM</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Ver reporte detallado <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {pastSummaries.map((m) => {
              const maxVal = Math.max(...pastSummaries.map(p => Math.max(p.totalGrossIncome, p.totalGrossExpenses)), 1);
              const incomeWidth = Math.min(100, (m.totalGrossIncome / maxVal) * 100);
              const expenseWidth = Math.min(100, (m.totalGrossExpenses / maxVal) * 100);

              return (
                <div key={`${m.year}-${m.month}`} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-white">{m.monthLabel}</span>
                    <span className={m.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      Utilidad: {formatCurrency(m.netIncome, currencySymbol)}
                    </span>
                  </div>

                  {/* Barra Ingresos */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-14 text-slate-400">Ingresos</span>
                      <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, incomeWidth)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 w-24 text-right">
                        {formatCurrency(m.totalGrossIncome, currencySymbol)}
                      </span>
                    </div>

                    {/* Barra Egresos */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-14 text-slate-400">Egresos</span>
                      <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, expenseWidth)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-rose-400 w-24 text-right">
                        {formatCurrency(m.totalGrossExpenses, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas de Suscripciones por vencer / vencidas */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Vencimientos & Renovaciones
              </h2>
              <p className="text-xs text-slate-400">Socios que requieren cobro o renovación</p>
            </div>
            <button
              onClick={() => onNavigateTab('subscriptions')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {expiringSubscriptions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                No hay suscripciones críticas por vencer esta semana.
              </div>
            ) : (
              expiringSubscriptions.map((sub) => {
                const end = new Date(sub.endDate);
                const isOverdue = end < todayDate;

                return (
                  <div
                    key={sub.id}
                    className={`p-3.5 rounded-2xl border text-xs transition ${
                      isOverdue
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-white truncate max-w-[160px]">{sub.memberName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${isOverdue ? 'bg-rose-500/30 text-rose-300' : 'bg-amber-500/30 text-amber-300'}`}>
                        {isOverdue ? 'Vencida' : 'Por vencer'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{sub.plan} • {sub.phone}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400">Fin: {sub.endDate}</span>
                      <button
                        onClick={() => onNavigateTab('subscriptions')}
                        className="font-semibold text-amber-400 hover:underline cursor-pointer"
                      >
                        Renovar →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Actividades Recientes */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-white">Últimas Transacciones Registradas</h2>
          </div>
          <span className="text-xs text-slate-400">Suscripciones, Ventas de Mostrador y Gastos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentActivities.map((act) => (
            <div key={`${act.type}-${act.id}`} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 truncate">
                <div className={`p-2 rounded-xl shrink-0 ${act.isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {act.isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{act.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{act.subtitle}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-mono font-bold ${act.isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {act.isIncome ? '+' : '-'}{formatCurrency(act.amount, currencySymbol)}
                </span>
                <p className="text-[10px] text-slate-500">{act.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
