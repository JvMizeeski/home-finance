import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Calendar, 
  CheckCircle2, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTransaction?: () => void;
  onOpenIntegrations?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { currentUser, availableUsers, switchUser } = useAuth();
  const { selectedMonth, setSelectedMonth, refreshData } = useData();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Parse active year and month from selectedMonth
  const getActiveYearAndMonth = () => {
    if (selectedMonth === 'all') return { year: 'all', month: 'all' };
    const parts = selectedMonth.split('-');
    if (parts.length === 1) return { year: parts[0], month: 'all' };
    return { year: parts[0], month: parts[1] };
  };

  const { year: activeYear, month: activeMonth } = getActiveYearAndMonth();

  const YEARS = ['all', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  const MONTHS = [
    { val: 'all', label: 'Todos os Meses' },
    { val: '01', label: 'Janeiro' },
    { val: '02', label: 'Fevereiro' },
    { val: '03', label: 'Março' },
    { val: '04', label: 'Abril' },
    { val: '05', label: 'Maio' },
    { val: '06', label: 'Junho' },
    { val: '07', label: 'Julho' },
    { val: '08', label: 'Agosto' },
    { val: '09', label: 'Setembro' },
    { val: '10', label: 'Outubro' },
    { val: '11', label: 'Novembro' },
    { val: '12', label: 'Dezembro' },
  ];

  const handleYearChange = (newYear: string) => {
    if (newYear === 'all') {
      setSelectedMonth('all');
    } else {
      const monthToUse = activeMonth === 'all' ? 'all' : activeMonth;
      if (monthToUse === 'all') {
        setSelectedMonth(newYear);
      } else {
        setSelectedMonth(`${newYear}-${monthToUse}`);
      }
    }
  };

  const handleMonthChange = (newMonth: string) => {
    const yearToUse = activeYear === 'all' ? '2026' : activeYear;
    if (newMonth === 'all') {
      setSelectedMonth(yearToUse);
    } else {
      setSelectedMonth(`${yearToUse}-${newMonth}`);
    }
  };

  return (
    <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand (Shown especially on mobile or compact mode) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center text-slate-950 font-black text-sm">
              HF
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight leading-none">
                Home Finance
              </h1>
            </div>
          </div>

          {/* Month/Year Selector, Manual Sync & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Year & Month Filter Controls */}
            <div className="flex items-center bg-white/5 hover:bg-white/10 rounded-xl p-1 border border-white/10 backdrop-blur-md transition-colors gap-1">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0 ml-1.5 hidden xs:block" />
              
              {/* Month Select */}
              <select
                id="header-month-selector"
                value={activeMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 px-1.5 py-1 focus:outline-hidden cursor-pointer [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                {MONTHS.map(m => (
                  <option key={m.val} value={m.val}>{m.label}</option>
                ))}
              </select>

              <span className="text-slate-500 text-xs font-semibold">/</span>

              {/* Year Select */}
              <select
                id="header-year-selector"
                value={activeYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-blue-400 px-1.5 py-1 focus:outline-hidden cursor-pointer [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="all">Todos os Anos</option>
                {YEARS.filter(y => y !== 'all').map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

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
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown for User Switch */}
              {showUserDropdown && (
                <div 
                  id="header-user-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1.5 border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Alternar Perfil
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
                      As alterações e cadastros serão associados a este perfil no histórico.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
