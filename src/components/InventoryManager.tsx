import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Download, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  X,
  PackageCheck
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, storageService } from '../services/storageService';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddProduct: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<InventoryItem>) => void;
  currencySymbol: string;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  onAddProduct,
  onUpdateProduct,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Suplementos' | 'Bebidas' | 'Snacks' | 'Ropa & Accesorios' | 'Otros'>('Suplementos');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      onUpdateProduct(editingItem.id, {
        name: name.trim(),
        category,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        stock: Number(stock),
        minStock: Number(minStock),
      });
      setEditingItem(null);
    } else {
      onAddProduct({
        name: name.trim(),
        category,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        stock: Number(stock),
        minStock: Number(minStock),
      });
    }

    setShowAddModal(false);
    setName('');
    setCostPrice(0);
    setSalePrice(0);
    setStock(10);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setCostPrice(item.costPrice);
    setSalePrice(item.salePrice);
    setStock(item.stock);
    setMinStock(item.minStock);
    setShowAddModal(true);
  };

  const filteredItems = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    return true;
  });

  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;
  const totalInventoryValue = inventory.reduce((acc, i) => acc + (i.costPrice * i.stock), 0);

  const exportCSV = () => {
    const headers = ['ID', 'Producto', 'Categoría', 'Precio Costo', 'Precio Venta', 'Stock', 'Stock Mínimo', 'Margen Bruto'];
    const rows = filteredItems.map(i => [
      i.id,
      i.name,
      i.category,
      i.costPrice,
      i.salePrice,
      i.stock,
      i.minStock,
      `${Math.round(((i.salePrice - i.costPrice) / i.salePrice) * 100)}%`
    ]);
    storageService.exportToCSV(`RecordGYM_Inventario_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Inventario & Catálogo</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de stock de suplementos, bebidas y mercancía para la venta en Record GYM
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
              setEditingItem(null);
              setName('');
              setCostPrice(0);
              setSalePrice(0);
              setStock(10);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Valor Total en Bodega (Costo)</span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {formatCurrency(totalInventoryValue, currencySymbol)}
            </div>
          </div>
          <span className="text-xs text-slate-400">{inventory.length} referencias</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Alertas de Bajo Stock</span>
            <div className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockCount} {lowStockCount === 1 ? 'producto crítico' : 'productos críticos'}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <AlertTriangle className="w-5 h-5" />
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
            placeholder="Buscar por nombre de producto..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="Suplementos">Suplementos</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Snacks">Snacks</option>
            <option value="Ropa & Accesorios">Ropa & Accesorios</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Costo Compra</th>
                <th className="py-3.5 px-4">Precio Venta</th>
                <th className="py-3.5 px-4">Margen</th>
                <th className="py-3.5 px-4 text-center">Stock Actual</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No se encontraron productos en inventario.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const marginPercent = item.salePrice > 0 
                    ? Math.round(((item.salePrice - item.costPrice) / item.salePrice) * 100)
                    : 0;
                  const isLow = item.stock <= item.minStock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{item.name}</div>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Reordenar pronto (mín: {item.minStock})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {formatCurrency(item.costPrice, currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(item.salePrice, currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">
                        {marginPercent}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateProduct(item.id, { stock: Math.max(0, item.stock - 1) })}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className={`w-10 text-center font-bold font-mono text-sm ${isLow ? 'text-rose-400' : 'text-white'}`}>
                            {item.stock}
                          </span>
                          <button
                            onClick={() => onUpdateProduct(item.id, { stock: item.stock + 1 })}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar / Editar Producto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-400" />
                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Proteína Whey Isolate 2lb"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Suplementos">Suplementos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Ropa & Accesorios">Ropa & Accesorios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Costo ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Venta ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    min={1}
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  {editingItem ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
