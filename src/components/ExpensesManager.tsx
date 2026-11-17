import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  FileText, 
  DollarSign, 
  X,
  CreditCard,
  PieChart
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { formatCurrency, storageService } from '../services/storageService';
import { ConfirmationModal } from './ConfirmationModal';

interface ExpensesManagerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  currencySymbol: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Arriendo / Alquiler',
  'Servicios Públicos (Luz, Agua, Gas)',
  'Internet & Telefonía',
  'Nómina & Honorarios Entrenadores',
  'Nómina Recepción & Aseo',
  'Mantenimiento de Instalaciones',
  'Publicidad & Redes Sociales',
  'Software & Licencias',
  'Impuestos & Tasas',
  'Caja Menor / Gastos Imprevistos',
];

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [category, setCategory] = useState<ExpenseCategory>('Servicios Públicos (Luz, Agua, Gas)');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    onAddExpense({
      category,
      description: description.trim(),
      amount: Number(amount),
      paidTo: paidTo.trim() || 'Beneficiario',
      paymentMethod,
      receiptNumber: receiptNumber.trim(),
      date: expenseDate,
      notes: notes.trim(),
    });

    // Reset
    setShowAddModal(false);
    setDescription('');
    setAmount(0);
    setPaidTo('');
    setReceiptNumber('');
    setNotes('');
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    return true;
  });

  const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Categoría', 'Descripción', 'Monto', 'Pagado a', 'Método Pago', 'N° Comprobante', 'Notas'];
    const rows = filteredExpenses.map(e => [
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
    storageService.exportToCSV(`RecordGYM_Gastos_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Gastos Operativos del Gimnasio</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control de arriendos, nómina, servicios públicos, mantenimiento y marketing de Record GYM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            Registrar Gasto
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Gastos Operativos</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {formatCurrency(totalExpensesAmount, currencySymbol)}
            </div>
          </div>
          <span className="text-xs text-slate-400">{filteredExpenses.length} egresos</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Categorías Principales</span>
            <p className="text-xs text-slate-300 mt-1">Nómina, Arriendo y Servicios Públicos</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por concepto, beneficiario o comprobante..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="all">Todas las categorías</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Gastos */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4">Beneficiario / Entidad</th>
                <th className="py-3.5 px-4">Monto</th>
                <th className="py-3.5 px-4">Método / Comprobante</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No hay gastos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{exp.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs">{exp.description}</td>
                    <td className="py-3.5 px-4 text-slate-400">{exp.paidTo}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400 font-mono text-sm">
                      {formatCurrency(exp.amount, currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{exp.paymentMethod}</div>
                      {exp.receiptNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">Ref: {exp.receiptNumber}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Gasto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-400" />
                Registrar Gasto Operativo
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría del Gasto *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Concepto *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Pago de recibo de energía EPM / Aire acondicionado"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monto ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pagado a / Beneficiario *</label>
                  <input
                    type="text"
                    required
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="Ej: Empresas Públicas, Inmobiliaria, Nombre"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">N° Comprobante / Recibo</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="Ej: REC-9921"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Efectivo">Efectivo / Caja Menor</option>
                  <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                  <option value="Tarjeta Débito">Tarjeta Débito</option>
                  <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Eliminación */}
      <ConfirmationModal
        isOpen={!!expenseToDelete}
        title="¿Eliminar registro de gasto?"
        message={`¿Estás seguro de eliminar el gasto de "${expenseToDelete?.description}" por valor de ${expenseToDelete ? formatCurrency(expenseToDelete.amount, currencySymbol) : ''}?`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />

    </div>
  );
};
