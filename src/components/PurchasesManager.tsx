import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  X,
  CreditCard
} from 'lucide-react';
import { Purchase, PurchaseCategory, PaymentMethod } from '../types';
import { formatCurrency, storageService } from '../services/storageService';
import { ConfirmationModal } from './ConfirmationModal';

interface PurchasesManagerProps {
  purchases: Purchase[];
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  onDeletePurchase: (id: string) => void;
  currencySymbol: string;
}

const PURCHASE_CATEGORIES: PurchaseCategory[] = [
  'Inventario para Venta',
  'Equipamiento & Máquinas',
  'Mantenimiento & Repuestos',
  'Insumos de Limpieza',
  'Dotación & Papelería',
  'Otros',
];

export const PurchasesManager: React.FC<PurchasesManagerProps> = ({
  purchases,
  onAddPurchase,
  onDeletePurchase,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [category, setCategory] = useState<PurchaseCategory>('Inventario para Venta');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Pagado' | 'Pendiente' | 'A Crédito'>('Pagado');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() || !amount) return;

    onAddPurchase({
      supplier: supplier.trim(),
      invoiceNumber: invoiceNumber.trim(),
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentStatus,
      paymentMethod,
      date: purchaseDate,
      notes: notes.trim(),
    });

    // Reset
    setShowAddModal(false);
    setSupplier('');
    setInvoiceNumber('');
    setDescription('');
    setAmount(0);
    setNotes('');
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = 
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  });

  const totalPurchasesAmount = filteredPurchases.reduce((acc, p) => acc + Number(p.amount), 0);

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Proveedor', 'Factura/Recibo', 'Categoría', 'Descripción', 'Monto', 'Estado Pago', 'Método Pago', 'Notas'];
    const rows = filteredPurchases.map(p => [
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
    storageService.exportToCSV(`RecordGYM_Compras_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Compras & Abastecimiento</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro de compras a proveedores de suplementos, repuestos de máquinas e insumos del gimnasio
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
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Registrar Compra
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Compras Filtradas</span>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1">
              {formatCurrency(totalPurchasesAmount, currencySymbol)}
            </div>
          </div>
          <span className="text-xs text-slate-400">{filteredPurchases.length} facturas</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estado de Proveedores</span>
            <p className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Pagos al día
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Truck className="w-5 h-5" />
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
            placeholder="Buscar por proveedor, factura o descripción..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todas las categorías</option>
            {PURCHASE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Compras */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Proveedor & Factura</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4">Monto Total</th>
                <th className="py-3.5 px-4">Estado Pago</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No hay compras registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{pur.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{pur.supplier}</div>
                      {pur.invoiceNumber && (
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3 text-slate-500" /> {pur.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-medium">
                        {pur.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs">{pur.description}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400 font-mono text-sm">
                      {formatCurrency(pur.amount, currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        pur.paymentStatus === 'Pagado'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {pur.paymentStatus}
                      </span>
                      {pur.paymentMethod && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{pur.paymentMethod}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setPurchaseToDelete(pur)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Eliminar compra"
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

      {/* Modal Nueva Compra */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                Registrar Compra o Insumo
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor / Tienda *</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ej: Nutrición Fitness Pro SAS"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">N° Factura o Recibo</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Ej: FAC-4921"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría de Compra *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PurchaseCategory)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {PURCHASE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción de los Artículos *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalle de productos o suministros comprados..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Total ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estado del Pago</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="A Crédito">A Crédito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                    <option value="Tarjeta Débito">Tarjeta Débito</option>
                    <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-purple-600/20"
                >
                  Guardar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Eliminación */}
      <ConfirmationModal
        isOpen={!!purchaseToDelete}
        title="¿Eliminar registro de compra?"
        message={`¿Estás seguro de eliminar la compra de "${purchaseToDelete?.supplier}" por valor de ${purchaseToDelete ? formatCurrency(purchaseToDelete.amount, currencySymbol) : ''}?`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={() => {
          if (purchaseToDelete) {
            onDeletePurchase(purchaseToDelete.id);
            setPurchaseToDelete(null);
          }
        }}
        onCancel={() => setPurchaseToDelete(null)}
      />

    </div>
  );
};
