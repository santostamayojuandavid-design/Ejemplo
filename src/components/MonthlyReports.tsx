import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { MonthlyFinancialSummary, GoogleSyncState } from '../types';
import { formatCurrency, storageService } from '../services/storageService';

interface MonthlyReportsProps {
  currentYear: number;
  currentMonth: number;
  currencySymbol: string;
  syncState: GoogleSyncState;
  onOpenSheetsModal: () => void;
  onSyncReportToSheets: () => void;
}

export const MonthlyReports: React.FC<MonthlyReportsProps> = ({
  currentYear,
  currentMonth,
  currencySymbol,
  syncState,
  onOpenSheetsModal,
  onSyncReportToSheets,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  const summary = storageService.calculateMonthlySummary(selectedYear, selectedMonth);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const reportData = [
      ['RECORD GYM - ESTADO DE RESULTADOS Y REPORTE FINANCIERO MENSUAL'],
      ['Período:', summary.monthLabel],
      ['Fecha de Generación:', new Date().toLocaleString('es-CO')],
      [],
      ['CONCEPTO', 'VALOR'],
      ['--- INGRESOS BRUTOS ---', ''],
      ['Suscripciones y Membresías', summary.totalSubscriptionsIncome],
      ['Ventas de Mostrador (Suplementos y Bebidas)', summary.totalProductSalesIncome],
      ['TOTAL INGRESOS BRUTOS', summary.totalGrossIncome],
      [],
      ['--- EGRESOS TOTALES ---', ''],
      ['Compras & Reabastecimiento de Inventario', summary.totalPurchasesExpense],
      ['Gastos Operativos (Arriendo, Nómina, Servicios, Mantenimiento)', summary.totalOperatingExpense],
      ['TOTAL EGRESOS', summary.totalGrossExpenses],
      [],
      ['--- RESULTADO FINAL ---', ''],
      ['UTILIDAD NETA (FLUJO DE CAJA)', summary.netIncome],
      ['Margen Operativo', `${summary.totalGrossIncome > 0 ? ((summary.netIncome / summary.totalGrossIncome) * 100).toFixed(1) : 0}%`],
      ['Socios Activos al Cierre', summary.activeMembersCount],
      ['Nuevas Suscripciones del Mes', summary.newSubscriptionsCount],
      [],
      ['--- DESGLOSE DE GASTOS POR CATEGORÍA ---', 'VALOR', 'PORCENTAJE'],
      ...summary.expensesByCategory.map(e => [e.category, e.total, `${e.percentage.toFixed(1)}%`]),
      [],
      ['--- TOP PRODUCTOS MÁS VENDIDOS ---', 'CANTIDAD', 'TOTAL INGRESOS'],
      ...summary.topSellingProducts.map(p => [p.name, p.quantity, p.revenue]),
    ];

    storageService.exportToCSV(`RecordGYM_Reporte_${summary.year}_${String(summary.month).padStart(2, '0')}`, reportData);
  };

  const marginPercentage = summary.totalGrossIncome > 0 
    ? ((summary.netIncome / summary.totalGrossIncome) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      
      {/* Selector de Mes / Año & Botones de Acción (Ocultos en impresión) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white">Seleccionar Período:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Descargar CSV
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Imprimir / Guardar PDF
          </button>

          <button
            type="button"
            onClick={onSyncReportToSheets}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Guardar en Google Sheets
          </button>
        </div>
      </div>

      {/* DOCUMENTO DEL REPORTE MENSUAL (Optimizado tanto para vista en pantalla como para impresión formal) */}
      <div className="print-report-container bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100">
        
        {/* Encabezado Corporativo Oficial */}
        <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black text-amber-400 italic">RG</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                RECORD <span className="text-amber-400">GYM</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Estado Financiero y Reporte Contable Mensual
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-400">
            <p className="font-bold text-white text-sm uppercase text-amber-400">{summary.monthLabel}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Generado: {new Date().toLocaleDateString('es-CO')}</p>
            <p className="text-[10px] text-slate-500">Moneda: {currencySymbol} COP / Oficial</p>
          </div>
        </div>

        {/* Tarjetas Resumen Ejecutivo del Mes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Ingresos Brutos</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatCurrency(summary.totalGrossIncome, currencySymbol)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Suscripciones + Ventas</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Egresos</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {formatCurrency(summary.totalGrossExpenses, currencySymbol)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Operativos + Compras</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Utilidad Neta / Flujo</span>
            <div className={`text-2xl font-black font-mono mt-1 ${summary.netIncome >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatCurrency(summary.netIncome, currencySymbol)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="font-bold text-emerald-400">{marginPercentage}%</span>
              <span className="text-slate-500">margen de utilidad</span>
            </div>
          </div>
        </div>

        {/* Estado de Resultados Simplificado (P&L) */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            1. Estado de Resultados Detallado
          </h2>

          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Concepto Contable</th>
                  <th className="py-3 px-4 text-right">Monto Parcial</th>
                  <th className="py-3 px-4 text-right">Total ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {/* Ingresos */}
                <tr className="bg-emerald-950/20 font-bold text-emerald-300">
                  <td className="py-2.5 px-4" colSpan={2}>INGRESOS OPERACIONALES</td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm">
                    {formatCurrency(summary.totalGrossIncome, currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-300">• Suscripciones y Membresías de Socios</td>
                  <td className="py-2 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(summary.totalSubscriptionsIncome, currencySymbol)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-300">• Ventas de Mostrador (Suplementos, Bebidas, Ropa)</td>
                  <td className="py-2 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(summary.totalProductSalesIncome, currencySymbol)}
                  </td>
                  <td></td>
                </tr>

                {/* Compras / Costos */}
                <tr className="bg-purple-950/20 font-bold text-purple-300">
                  <td className="py-2.5 px-4" colSpan={2}>COSTO DE VENTAS & COMPRAS</td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm text-purple-300">
                    -{formatCurrency(summary.totalPurchasesExpense, currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-300">• Abastecimiento de Inventario & Repuestos</td>
                  <td className="py-2 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(summary.totalPurchasesExpense, currencySymbol)}
                  </td>
                  <td></td>
                </tr>

                {/* Gastos Operativos */}
                <tr className="bg-rose-950/20 font-bold text-rose-300">
                  <td className="py-2.5 px-4" colSpan={2}>GASTOS OPERATIVOS Y ADMINISTRATIVOS</td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm text-rose-400">
                    -{formatCurrency(summary.totalOperatingExpense, currencySymbol)}
                  </td>
                </tr>
                {summary.expensesByCategory
                  .filter(e => e.category !== 'Compras & Inventario')
                  .map(exp => (
                    <tr key={exp.category}>
                      <td className="py-2 px-6 text-slate-300">• {exp.category}</td>
                      <td className="py-2 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(exp.total, currencySymbol)}
                      </td>
                      <td className="text-right text-[11px] text-slate-500 pr-4">
                        {exp.percentage.toFixed(1)}% de egresos
                      </td>
                    </tr>
                  ))}

                {/* Utilidad Neta Final */}
                <tr className="bg-slate-950 text-white font-extrabold text-sm border-t-2 border-slate-700">
                  <td className="py-3 px-4 uppercase text-amber-400" colSpan={2}>
                    UTILIDAD NETA FINAL (FLUJO DE CAJA)
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-base ${summary.netIncome >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {formatCurrency(summary.netIncome, currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Métricas Operativas & Top Productos del Mes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* Indicadores de Socios */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Métricas Operativas de Socios
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">Socios activos al cierre del período:</span>
                <span className="font-bold text-white text-sm">{summary.activeMembersCount} socios</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">Nuevas suscripciones vendidas en el mes:</span>
                <span className="font-bold text-emerald-400 text-sm">{summary.newSubscriptionsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ingreso promedio por suscripción:</span>
                <span className="font-bold font-mono text-slate-200">
                  {summary.newSubscriptionsCount > 0 
                    ? formatCurrency(summary.totalSubscriptionsIncome / summary.newSubscriptionsCount, currencySymbol)
                    : formatCurrency(0, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Top 5 Productos del Mes */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              Top Productos Vendidos en el Mes
            </h3>
            {summary.topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No hubo ventas registradas este mes.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {summary.topSellingProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <span className="text-slate-300 truncate max-w-[200px]">
                      {idx + 1}. {p.name} ({p.quantity} uds)
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatCurrency(p.revenue, currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Firmas de Aprobación para Impresión / Auditoría */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs text-slate-400">
          <div>
            <div className="w-48 mx-auto border-b border-slate-600 pb-1 mb-2"></div>
            <p className="font-bold text-slate-300">Administración General</p>
            <p className="text-[10px] text-slate-500">Record GYM</p>
          </div>
          <div>
            <div className="w-48 mx-auto border-b border-slate-600 pb-1 mb-2"></div>
            <p className="font-bold text-slate-300">Revisión Contable</p>
            <p className="text-[10px] text-slate-500">Control Financiero</p>
          </div>
        </div>

      </div>

    </div>
  );
};
