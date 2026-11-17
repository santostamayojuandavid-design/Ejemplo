import React, { useState } from 'react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Truck, 
  Receipt, 
  Boxes, 
  FileText, 
  FileSpreadsheet, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSyncState } from '../types';

export type ActiveTab = 
  | 'dashboard' 
  | 'subscriptions' 
  | 'sales' 
  | 'purchases' 
  | 'expenses' 
  | 'inventory' 
  | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  syncState: GoogleSyncState;
  onOpenSheetsModal: () => void;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLoginClick,
  onLogoutClick,
  syncState,
  onOpenSheetsModal,
  onQuickSync,
  isSyncing,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Panel General', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Suscripciones', icon: <Users className="w-4 h-4" /> },
    { id: 'sales', label: 'Ventas Mostrador', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'purchases', label: 'Compras', icon: <Truck className="w-4 h-4" /> },
    { id: 'expenses', label: 'Gastos', icon: <Receipt className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventario', icon: <Boxes className="w-4 h-4" /> },
    { id: 'reports', label: 'Reportes Mensuales', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-400 p-0.5 shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
                  Record<span className="text-amber-400 ml-1">GYM</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md">
                  Contable
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Control de Finanzas, Socios y Ventas</p>
            </div>
          </div>

          {/* Nav Tabs Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar (Google Sheets & User Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Sync Pill */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={onOpenSheetsModal}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Configuración de Google Sheets"
              >
                <div className="relative">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span
                    className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                      syncState.spreadsheetId ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <span className="hidden sm:inline text-xs">
                  {syncState.spreadsheetId ? 'Google Sheets' : 'Conectar Sheets'}
                </span>
              </button>

              {syncState.spreadsheetId && (
                <button
                  type="button"
                  onClick={onQuickSync}
                  disabled={isSyncing}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50"
                  title="Sincronizar ahora con Google Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              )}
            </div>

            {/* Google Authentication Component */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuario'}
                    className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="hidden md:block text-left text-xs">
                  <p className="font-semibold text-white leading-tight truncate max-w-[110px]">
                    {currentUser.displayName || 'Administrador'}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">Google OK</p>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="gsi-material-button text-xs py-1.5 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-medium transition cursor-pointer flex items-center gap-2 shadow-sm border border-slate-200"
              >
                <div className="gsi-material-button-icon shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="hidden sm:inline font-semibold">Acceder con Google</span>
                <span className="sm:hidden font-semibold">Acceder</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-slate-800 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
