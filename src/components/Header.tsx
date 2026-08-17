import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Users, 
  Calendar, 
  Plus, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenIntegrations: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTransaction, onOpenIntegrations }) => {
  const { currentUser, availableUsers, switchUser } = useAuth();
  const { selectedMonth, setSelectedMonth, supabaseConfig, refreshData, isLoading } = useData();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Generate last 6 months + next 2 months for selector
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -6; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      options.push({ val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  };

  return (
    <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-slate-950 font-extrabold text-lg">
              FC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-lg sm:text-xl tracking-tight leading-none">
                  FinanCasal
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                  Casal & Lar
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                Finanças, Metas & Sincronização em Tempo Real
              </p>
            </div>
          </div>

          {/* Month Selector & Sync Indicators */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Month Filter Selector */}
            <div className="relative flex items-center bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-md">
              <Calendar className="w-4 h-4 text-slate-400 ml-2" />
              <select
                id="header-month-selector"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 py-1 pl-1 pr-6 focus:outline-hidden cursor-pointer [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="all">📅 Todos os Meses</option>
                {getMonthOptions().map(opt => (
                  <option key={opt.val} value={opt.val}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Supabase / Spark Status Pill */}
            <button
              id="header-integrations-btn"
              onClick={onOpenIntegrations}
              title="Configurações do Supabase e Google Spark"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors text-slate-300"
            >
              <div className="flex items-center gap-1.5">
                {supabaseConfig.isConnected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">Supabase</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">Spark API</span>
              </div>
            </button>

            {/* Manual Sync Button */}
            <button
              id="header-refresh-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Recarregar dados"
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors backdrop-blur-md"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* User Profile Switcher */}
            <div className="relative">
              <button
                id="header-user-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all shadow-sm"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white/10`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {currentUser.role === 'wife' ? 'Esposa' : currentUser.role === 'husband' ? 'Marido' : 'Usuário'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown for User Switch */}
              {showUserDropdown && (
                <div 
                  id="header-user-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1.5 border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Alternar Perfil Ativo
                  </div>
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-white/10 transition-colors ${
                        u.id === currentUser.id ? 'bg-white/10 font-semibold text-white' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full ${u.avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                          {u.name.charAt(0)}
                        </span>
                        <span>{u.name}</span>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                  <div className="mt-1 pt-1 border-t border-white/10 px-3 py-1">
                    <p className="text-[10px] text-slate-400">
                      As edições e cadastros serão registrados com seu perfil no log de histórico.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              id="header-new-transaction-btn"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Novo</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
