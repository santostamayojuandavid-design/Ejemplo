import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  TrendingUp, 
  X, 
  CreditCard,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ProductSale, InventoryItem, PaymentMethod } from '../types';
import { formatCurrency, storageService } from '../services/storageService';
import { ConfirmationModal } from './ConfirmationModal';

interface ProductSalesManagerProps {
  sales: ProductSale[];
  inventory: InventoryItem[];
  onAddSale: (sale: Omit<ProductSale, 'id' | 'createdAt'>) => void;
  onDeleteSale: (id: string) => void;
  currencySymbol: string;
}

export const ProductSalesManager: React.FC<ProductSalesManagerProps> = ({
  sales,
  inventory,
  onAddSale,
  onDeleteSale,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<ProductSale | null>(null);

  // Form State
  const now = new Date();
  const [customerName, setCustomerName] = useState('Cliente Mostrador');
  const [selectedProductId, setSelectedProductId] = useState<string>(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(inventory[0]?.salePrice || 0);
  const [unitCost, setUnitCost] = useState<number>(inventory[0]?.costPrice || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [saleDate, setSaleDate] = useState(now.toISOString().split('T')[0]);
  const [saleTime, setSaleTime] = useState(now.toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  const selectedProduct = inventory.find(i => i.id === selectedProductId);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = inventory.find(i => i.id === id);
    if (prod) {
      setUnitPrice(prod.salePrice);
      setUnitCost(prod.costPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    const total = Number(unitPrice) * Number(quantity);
    const profit = (Number(unitPrice) - Number(unitCost)) * Number(quantity);

    onAddSale({
      customerName: customerName.trim() || 'Cliente Mostrador',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      unitCost: Number(unitCost),
      total,
      profit,
      paymentMethod,
      date: saleDate,
      time: saleTime,
      notes: notes.trim(),
    });

    // Reset
    setShowAddModal(false);
    setQuantity(1);
    setNotes('');
  };

  // Quick sell click from catalog cards
  const handleQuickSell = (prod: InventoryItem) => {
    setSelectedProductId(prod.id);
    setUnitPrice(prod.salePrice);
    setUnitCost(prod.costPrice);
    setQuantity(1);
    setShowAddModal(true);
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    return true;
  });

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + Number(s.total), 0);
  const totalSalesProfit = filteredSales.reduce((acc, s) => acc + Number(s.profit), 0);

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Hora', 'Cliente', 'Producto', 'Categoría', 'Cantidad', 'Precio Unitario', 'Costo Unitario', 'Total Venta', 'Ganancia', 'Método Pago', 'Notas'];
    const rows = filteredSales.map(s => [
      s.id,
      s.date,
      s.time,
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
    storageService.exportToCSV(`RecordGYM_Ventas_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Venta de Productos & Mostrador</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro de venta de suplementos, bebidas energéticas, proteínas y accesorios en el mostrador
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
            onClick={() => {
              if (inventory.length > 0) handleProductSelect(inventory[0].id);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Registrar Venta
          </button>
        </div>
      </div>

      {/* Catálogo Rápido de Mostrador (Top Items para Vender en 1 Click) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            Venta Rápida de Mostrador
          </span>
          <span className="text-[11px] text-slate-400">Haz clic en un producto para venderlo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {inventory.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => handleQuickSell(item)}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition text-left cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400 font-mono">
                  {item.category}
                </span>
                <p className="text-xs font-semibold text-white mt-1.5 line-clamp-2 leading-tight group-hover:text-emerald-300">
                  {item.name}
                </p>
              </div>
              <div className="mt-2 pt-1 border-t border-slate-850 flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(item.salePrice, currencySymbol)}
                </span>
                <span className={`text-[10px] ${item.stock <= item.minStock ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                  {item.stock} ud
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats de Ventas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Ingreso por Ventas</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatCurrency(totalSalesRevenue, currencySymbol)}
            </div>
          </div>
          <span className="text-xs text-slate-400">{filteredSales.length} transacciones</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ganancia Neta Estimada</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {formatCurrency(totalSalesProfit, currencySymbol)}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por producto, cliente o categoría..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="Suplementos">Suplementos</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Snacks">Snacks</option>
            <option value="Ropa & Accesorios">Ropa & Accesorios</option>
          </select>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Fecha & Hora</th>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4 text-center">Cant.</th>
                <th className="py-3.5 px-4">Precio Unit.</th>
                <th className="py-3.5 px-4">Total Venta</th>
                <th className="py-3.5 px-4">Ganancia</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No se registran ventas con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      <div>{sale.date}</div>
                      <div className="text-[10px] text-slate-500">{sale.time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{sale.productName}</div>
                      <div className="text-[10px] text-slate-400">{sale.category}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{sale.customerName}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-white font-mono">{sale.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{formatCurrency(sale.unitPrice, currencySymbol)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(sale.total, currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-mono text-[11px]">
                      +{formatCurrency(sale.profit, currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px]">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSaleToDelete(sale)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Eliminar registro"
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

      {/* Modal Nueva Venta */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                Registrar Venta de Mostrador
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producto a Vender *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatCurrency(item.salePrice, currencySymbol)} (Stock: {item.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct?.stock || 999}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {selectedProduct && (
                    <p className="text-[10px] text-slate-400 mt-1">Disponibles: {selectedProduct.stock} unidades</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Unitario ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Total a Cobrar:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {formatCurrency(unitPrice * quantity, currencySymbol)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Socio Mostrador"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                    <option value="Tarjeta Débito">Tarjeta Débito</option>
                    <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hora</label>
                  <input
                    type="time"
                    value={saleTime}
                    onChange={(e) => setSaleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20"
                >
                  Confirmar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Eliminación */}
      <ConfirmationModal
        isOpen={!!saleToDelete}
        title="¿Eliminar registro de venta?"
        message={`¿Estás seguro de eliminar la venta de "${saleToDelete?.productName}" (${saleToDelete?.quantity} uds) por ${saleToDelete ? formatCurrency(saleToDelete.total, currencySymbol) : ''}?`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={() => {
          if (saleToDelete) {
            onDeleteSale(saleToDelete.id);
            setSaleToDelete(null);
          }
        }}
        onCancel={() => setSaleToDelete(null)}
      />

    </div>
  );
};
