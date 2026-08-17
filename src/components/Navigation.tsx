import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  History, 
  Sparkles, 
  Database 
} from 'lucide-react';
import { useData } from '../context/DataContext';

export type TabType = 'dashboard' | 'transactions' | 'goals' | 'logs' | 'integrations';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { transactions, goals, auditLogs } = useData();

  // Count pending bills for badge
  const pendingCount = transactions.filter(t => t.status === 'pending' && t.type === 'expense').length;
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Visão Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions' as TabType,
      label: 'Transações & Contas',
      icon: Receipt,
      badge: pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'goals' as TabType,
      label: 'Metas & Desejos',
      icon: Target,
      badge: activeGoalsCount > 0 ? `${activeGoalsCount}` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'logs' as TabType,
      label: 'Histórico & Logs',
      icon: History,
      badge: auditLogs.length > 0 ? `${auditLogs.length}` : undefined,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'integrations' as TabType,
      label: 'Supabase & Spark',
      icon: Sparkles,
      highlight: true
    }
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <div className="hidden md:block bg-slate-900/40 backdrop-blur-xl border-b border-white/10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1.5 py-2.5 overflow-x-auto no-scrollbar" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-desktop-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg shadow-black/20 border border-white/15 backdrop-blur-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  } ${item.highlight && !isActive ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-white/10 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/85 backdrop-blur-2xl border-t border-white/10 z-40 px-2 py-2 shadow-2xl safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive ? 'text-blue-400 font-bold bg-white/10 border border-white/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-blue-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {typeof item.badge === 'string' && item.badge.includes(' ') ? item.badge.split(' ')[0] : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full">
                  {item.id === 'dashboard' ? 'Início' : item.id === 'transactions' ? 'Contas' : item.id === 'goals' ? 'Metas' : item.id === 'logs' ? 'Logs' : 'Sync'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
