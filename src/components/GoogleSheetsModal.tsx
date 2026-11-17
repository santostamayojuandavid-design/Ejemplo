import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Link as LinkIcon, 
  Layers, 
  Check, 
  X,
  FileCheck2,
  Calendar,
  Lock
} from 'lucide-react';
import { GoogleSyncState } from '../types';
import { createRecordGymSpreadsheet, syncAllDataToGoogleSheets, verifySpreadsheetAccess } from '../services/googleSheetsService';
import { storageService } from '../services/storageService';
import { ConfirmationModal } from './ConfirmationModal';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: GoogleSyncState;
  onUpdateSyncState: (newState: GoogleSyncState) => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  onLoginClick: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onUpdateSyncState,
  isAuthenticated,
  userEmail,
  onLoginClick,
}) => {
  const [customSheetId, setCustomSheetId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  if (!isOpen) return null;

  const handleCreateNewSpreadsheet = async () => {
    if (!isAuthenticated) {
      onLoginClick();
      return;
    }

    setIsCreating(true);
    setStatusMessage({ type: 'info', text: 'Creando hoja de cálculo en tu Google Drive...' });

    try {
      const result = await createRecordGymSpreadsheet(new Date().getFullYear());
      const updated: GoogleSyncState = {
        ...syncState,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetTitle: `Record GYM - Control Contable ${new Date().getFullYear()}`,
        lastSyncedAt: null,
      };
      onUpdateSyncState(updated);
      storageService.saveSyncConfig(updated);
      setStatusMessage({ 
        type: 'success', 
        text: '¡Hoja creada con éxito con las 5 pestañas contables configuradas! Procediendo a sincronizar datos...' 
      });

      // Sincronizar inmediatamente
      await handleSyncNowInternal(result.spreadsheetId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'No se pudo crear la hoja de cálculo. Verifica permisos en Google.' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLinkExistingSheet = async () => {
    const cleanId = customSheetId.trim();
    if (!cleanId) return;

    // Si pegaron una URL completa de Google Sheets, extraer el ID
    let sheetId = cleanId;
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    setIsCreating(true);
    setStatusMessage({ type: 'info', text: 'Verificando acceso a la hoja...' });

    try {
      const hasAccess = await verifySpreadsheetAccess(sheetId);
      if (!hasAccess) {
        throw new Error('No se pudo acceder a la hoja. Asegúrate de tener permisos de edición y que el ID sea correcto.');
      }

      const updated: GoogleSyncState = {
        ...syncState,
        spreadsheetId: sheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
        lastSyncedAt: null,
      };
      onUpdateSyncState(updated);
      storageService.saveSyncConfig(updated);
      setStatusMessage({ type: 'success', text: '¡Hoja vinculada correctamente!' });
      setCustomSheetId('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al validar la hoja.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncNowInternal = async (targetId?: string) => {
    const idToUse = targetId || syncState.spreadsheetId;
    if (!idToUse) return;

    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Enviando registros actualizados a Google Sheets...' });

    try {
      const subs = storageService.getSubscriptions();
      const sales = storageService.getSales();
      const purchases = storageService.getPurchases();
      const expenses = storageService.getExpenses();
      const summaries = storageService.getPastSixMonthsSummaries();

      const res = await syncAllDataToGoogleSheets(idToUse, {
        subscriptions: subs,
        sales,
        purchases,
        expenses,
        summaries,
      });

      const updated: GoogleSyncState = {
        ...syncState,
        lastSyncedAt: res.timestamp,
        isSyncing: false,
      };
      onUpdateSyncState(updated);
      storageService.saveSyncConfig(updated);
      setStatusMessage({ type: 'success', text: `¡Registros guardados en Google Sheets! (${subs.length} suscripciones, ${sales.length} ventas, ${purchases.length} compras, ${expenses.length} gastos)` });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error al sincronizar con Google Sheets.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Sincronización con Google Sheets
                </h2>
                <p className="text-xs text-slate-400">
                  Respalda todos los libros contables de Record GYM en tu propia nube
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Estado de Autenticación */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-amber-400'}`} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estado de Google</p>
                <p className="text-sm font-medium text-white">
                  {isAuthenticated ? `Conectado como: ${userEmail || 'Usuario de Google'}` : 'Sin conectar a Google'}
                </p>
              </div>
            </div>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onLoginClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                Conectar cuenta Google
              </button>
            )}
          </div>

          {/* Alertas / Mensajes de estado */}
          {statusMessage && (
            <div
              className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Hoja de cálculo configurada */}
          <div className="mt-6 space-y-4">
            {syncState.spreadsheetId ? (
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-emerald-500/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                      <FileCheck2 className="w-3 h-3" /> Hoja Vinculada
                    </span>
                    <h3 className="font-bold text-base text-white">{syncState.spreadsheetTitle}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1 break-all">ID: {syncState.spreadsheetId}</p>
                    {syncState.lastSyncedAt && (
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Última sincronización: {new Date(syncState.lastSyncedAt).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {syncState.spreadsheetUrl && (
                      <a
                        href={syncState.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir en Google Sheets
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => setShowConfirmSync(true)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
                <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">Aún no has vinculado una hoja de cálculo</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                  Crea una hoja nueva con todas las tablas configuradas para Record GYM o vincula una que ya tengas.
                </p>

                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCreateNewSpreadsheet}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {isCreating ? 'Creando hoja en Google Drive...' : 'Crear Hoja "Record GYM" en Google Sheets'}
                </button>
              </div>
            )}

            {/* Alternativa: Vincular por ID o URL */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                O ingresa el ID / Enlace de una Hoja de Cálculo existente:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customSheetId}
                    onChange={(e) => setCustomSheetId(e.target.value)}
                    placeholder="Ej: https://docs.google.com/spreadsheets/d/1BxiMVs... o el ID"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <button
                  type="button"
                  disabled={!customSheetId.trim() || isCreating}
                  onClick={handleLinkExistingSheet}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Vincular
                </button>
              </div>
            </div>

            {/* Estructura de pestañas que se sincronizan */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Pestañas que se organizan automáticamente en tu hoja:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-emerald-300 font-medium">Resumen_Mensual:</span>
                  <span>Ingresos, Egresos y Margen</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="font-mono text-blue-300 font-medium">Suscripciones:</span>
                  <span>Socios, planes y fechas</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="font-mono text-amber-300 font-medium">Ventas_Productos:</span>
                  <span>Suplementos, bebidas, total</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="font-mono text-purple-300 font-medium">Compras_Inventario:</span>
                  <span>Proveedores y costos</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 sm:col-span-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span className="font-mono text-rose-300 font-medium">Gastos_Operativos:</span>
                  <span>Arriendo, nómina, luz, agua, mantenimiento y publicidad</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmación para sincronización */}
      <ConfirmationModal
        isOpen={showConfirmSync}
        title="¿Sincronizar registros con Google Sheets?"
        message={`Esta acción enviará todos los datos actuales de suscripciones, ventas, compras y gastos a la hoja "${syncState.spreadsheetTitle}". Los datos de las pestañas contables se actualizarán con la información más reciente.`}
        confirmLabel="Sincronizar ahora"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setShowConfirmSync(false);
          handleSyncNowInternal();
        }}
        onCancel={() => setShowConfirmSync(false)}
      />
    </>
  );
};
