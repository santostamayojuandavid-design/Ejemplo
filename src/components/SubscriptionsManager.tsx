import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Download, 
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Subscription, PlanType, PaymentMethod } from '../types';
import { formatCurrency, storageService } from '../services/storageService';
import { ConfirmationModal } from './ConfirmationModal';

interface SubscriptionsManagerProps {
  subscriptions: Subscription[];
  onAddSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onRenewSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  currencySymbol: string;
}

const PLAN_PRESETS: { plan: PlanType; durationDays: number; defaultPrice: number }[] = [
  { plan: 'Pase Diario', durationDays: 1, defaultPrice: 15000 },
  { plan: 'Semanal', durationDays: 7, defaultPrice: 40000 },
  { plan: 'Quincenal', durationDays: 15, defaultPrice: 65000 },
  { plan: 'Mensual Básico', durationDays: 30, defaultPrice: 100000 },
  { plan: 'Mensual VIP / Full', durationDays: 30, defaultPrice: 140000 },
  { plan: 'Trimestral', durationDays: 90, defaultPrice: 360000 },
  { plan: 'Semestral', durationDays: 180, defaultPrice: 680000 },
  { plan: 'Anual', durationDays: 365, defaultPrice: 1200000 },
  { plan: 'Entrenamiento Personalizado', durationDays: 30, defaultPrice: 380000 },
];

export const SubscriptionsManager: React.FC<SubscriptionsManagerProps> = ({
  subscriptions,
  onAddSubscription,
  onRenewSubscription,
  onDeleteSubscription,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [memberName, setMemberName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('Mensual VIP / Full');
  const [amount, setAmount] = useState<number>(140000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Actualizar precio y fecha fin al cambiar de plan
  const handlePlanChange = (newPlan: PlanType) => {
    setSelectedPlan(newPlan);
    const preset = PLAN_PRESETS.find(p => p.plan === newPlan);
    if (preset) {
      setAmount(preset.defaultPrice);
      const start = new Date(startDate || todayStr);
      start.setDate(start.getDate() + preset.durationDays);
      setEndDate(start.toISOString().split('T')[0]);
    }
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    const preset = PLAN_PRESETS.find(p => p.plan === selectedPlan);
    if (preset && newStart) {
      const start = new Date(newStart);
      start.setDate(start.getDate() + preset.durationDays);
      setEndDate(start.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !amount) return;

    onAddSubscription({
      memberId: memberId.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      memberName: memberName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      plan: selectedPlan,
      amount: Number(amount),
      paymentMethod,
      startDate,
      endDate,
      notes: notes.trim(),
    });

    // Reset
    setMemberName('');
    setMemberId('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  // Cálculo de estado
  const now = new Date();
  const getSubStatus = (sub: Subscription): { label: string; type: 'active' | 'expiring' | 'expired'; color: string } => {
    const end = new Date(sub.endDate);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Vencida', type: 'expired', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    }
    if (diffDays <= 5) {
      return { label: `Por vencer (${diffDays}d)`, type: 'expiring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    return { label: 'Activa', type: 'active', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  // Filtrado
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.phone.includes(searchTerm) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.memberId && sub.memberId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const statusInfo = getSubStatus(sub);
    if (statusFilter === 'active') return statusInfo.type === 'active';
    if (statusFilter === 'expiring') return statusInfo.type === 'expiring';
    if (statusFilter === 'expired') return statusInfo.type === 'expired';

    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Fecha Registro', 'Socio', 'Identificación', 'Teléfono', 'Email', 'Plan', 'Monto', 'Método Pago', 'Fecha Inicio', 'Fecha Vence', 'Notas'];
    const rows = filteredSubscriptions.map(s => [
      s.id,
      s.createdAt.split('T')[0],
      s.memberName,
      s.memberId,
      s.phone,
      s.email || '',
      s.plan,
      s.amount,
      s.paymentMethod,
      s.startDate,
      s.endDate,
      s.notes || ''
    ]);
    storageService.exportToCSV(`RecordGYM_Suscripciones_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Suscripciones & Membresías</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control de socios, planes contratados, fechas de vencimiento y cobros
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
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Suscripción
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por socio, cédula, teléfono o plan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({subscriptions.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'active' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'expiring' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Por vencer
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'expired' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vencidas
          </button>
        </div>
      </div>

      {/* Tabla de Suscripciones */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Socio / Cliente</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Vigencia (Inicio - Fin)</th>
                <th className="py-3.5 px-4">Monto / Pago</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No se encontraron suscripciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const status = getSubStatus(sub);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-850/50 transition">
                      
                      {/* Socio */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{sub.memberName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{sub.memberId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {sub.phone}
                          </span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200">{sub.plan}</span>
                        {sub.notes && <p className="text-[10px] text-slate-500 truncate max-w-xs">{sub.notes}</p>}
                      </td>

                      {/* Fechas */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-mono text-[11px]">
                          {sub.startDate} <span className="text-slate-600">→</span> <span className="font-semibold text-white">{sub.endDate}</span>
                        </div>
                      </td>

                      {/* Monto & Método de Pago */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-400 font-mono text-sm">
                          {formatCurrency(sub.amount, currencySymbol)}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {sub.paymentMethod}
                        </div>
                      </td>

                      {/* Badge de Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onRenewSubscription(sub)}
                            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer border border-amber-500/20"
                            title="Renovar suscripción por un período más"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Renovar
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubToDelete(sub)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Eliminar suscripción"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Suscripción */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Registrar Nueva Suscripción
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo del Socio *</label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Ej: Daniel Gómez Pérez"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula / Documento</label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Ej: CC-10982341"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: +57 312 456 7890"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="socio@email.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan de Gimnasio *</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {PLAN_PRESETS.map((p) => (
                    <option key={p.plan} value={p.plan}>
                      {p.plan} — {formatCurrency(p.defaultPrice, currencySymbol)} ({p.durationDays} días)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Pagado ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Nequi / Daviplata">Nequi / Daviplata</option>
                    <option value="Tarjeta Débito">Tarjeta Débito</option>
                    <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas u Observaciones</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Acceso full pesas, zona cardio y vestier"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  Guardar Suscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Eliminación */}
      <ConfirmationModal
        isOpen={!!subToDelete}
        title="¿Eliminar suscripción?"
        message={`¿Estás seguro de eliminar el registro de suscripción de "${subToDelete?.memberName}" por valor de ${subToDelete ? formatCurrency(subToDelete.amount, currencySymbol) : ''}? Esta acción eliminará el registro local.`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={() => {
          if (subToDelete) {
            onDeleteSubscription(subToDelete.id);
            setSubToDelete(null);
          }
        }}
        onCancel={() => setSubToDelete(null)}
      />

    </div>
  );
};
