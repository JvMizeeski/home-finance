import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  History, 
  Sparkles,
  Settings
} from 'lucide-react';

export type TabType = 'dashboard' | 'transactions' | 'goals' | 'logs' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Visão Geral',
      shortLabel: 'Início',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions' as TabType,
      label: 'Transações',
      shortLabel: 'Contas',
      icon: Receipt,
    },
    {
      id: 'goals' as TabType,
      label: 'Metas',
      shortLabel: 'Metas',
      icon: Target,
    },
    {
      id: 'logs' as TabType,
      label: 'Histórico',
      shortLabel: 'Logs',
      icon: History,
    },
    {
      id: 'settings' as TabType,
      label: 'Configurações',
      shortLabel: 'Ajustes',
      icon: Settings,
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 z-40 px-2 py-2 shadow-2xl safe-area-bottom">
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
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

