import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  History, 
  Sparkles, 
  Database,
  Plus,
  Wallet,
  CheckCircle2,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TabType } from './Navigation';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction
}) => {
  const { supabaseConfig } = useData();
  const { currentUser, availableUsers, switchUser } = useAuth();

  const navItems: { id: TabType; label: string; icon: typeof LayoutDashboard; highlight?: boolean }[] = [
    {
      id: 'dashboard' as TabType,
      label: 'Visão Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions' as TabType,
      label: 'Transações & Contas',
      icon: Receipt,
    },
    {
      id: 'goals' as TabType,
      label: 'Metas & Desejos',
      icon: Target,
    },
    {
      id: 'logs' as TabType,
      label: 'Histórico & Logs',
      icon: History,
    },
    {
      id: 'settings' as TabType,
      label: 'Configurações',
      icon: Settings,
    }
  ];

  return (
    <aside 
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 shrink-0 h-screen sticky top-0 z-40 select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-emerald-400 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-slate-950 font-black text-base shrink-0">
          <Wallet className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-white text-lg tracking-tight leading-none truncate">
            Home Finance
          </h1>
          <span className="text-[11px] text-slate-400 tracking-wide font-medium">
            Gestão & Sincronização
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 pb-2">
        <button
          id="sidebar-new-transaction-btn"
          onClick={onOpenNewTransaction}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto no-scrollbar" aria-label="Sidebar Navigation">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navegação
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              } ${item.highlight && !isActive ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : item.highlight 
                      ? 'text-amber-400' 
                      : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Cloud & Integration Status Box */}
      <div className="p-3 mx-3 mb-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            Supabase
          </span>
          {supabaseConfig.isConnected ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Local
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Google Spark
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">Ativo</span>
        </div>
      </div>

      {/* User Switcher / Profile Footer */}
      <div className="p-3 border-t border-white/10 bg-slate-950/40">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Perfil Ativo
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {availableUsers.map((u) => {
            const isCurrent = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${u.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                  {u.name.charAt(0)}
                </div>
                <span className="truncate">{u.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
