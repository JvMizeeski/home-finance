import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ExternalLink,
  Target,
  Sparkles,
  PlusCircle,
  Check
} from 'lucide-react';
import { TabType } from './Navigation';
import { Transaction } from '../types';

interface DashboardTabProps {
  onOpenNewTransaction: () => void;
  onOpenNewGoal: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ 
  onOpenNewTransaction, 
  onOpenNewGoal,
  setActiveTab 
}) => {
  const { transactions, goals, selectedMonth, toggleTransactionStatus } = useData();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Independent period filter for the "Upcoming Bills" card — always relative
  // to today, regardless of the global month/year selector above.
  const [billsPeriod, setBillsPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Filter transactions by selectedMonth (or show all if 'all').
  // Single denominator: the effective date is the due date when set, else the
  // launch date — same rule used by the "Próximas Contas a Vencer" card below.
  // (Previously this matched date OR dueDate independently, which wrongly
  // counted a bill in the month it was registered even if it's actually due
  // in a different month.)
  const filteredTxs = transactions.filter(t => {
    if (selectedMonth === 'all') return true;
    const effectiveDate = t.dueDate || t.date;
    return effectiveDate.startsWith(selectedMonth);
  });

  // Financial Metrics
  const totalIncome = filteredTxs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTxs
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const fixedExpenses = filteredTxs
    .filter(t => t.type === 'expense' && t.frequency === 'fixed')
    .reduce((acc, t) => acc + t.amount, 0);

  const pontualExpenses = filteredTxs
    .filter(t => t.type === 'expense' && t.frequency === 'pontual')
    .reduce((acc, t) => acc + t.amount, 0);

  // "A Pagar" deliberately does NOT use filteredTxs (exact month match) —
  // an unpaid bill due in a past month must keep counting as owed money in
  // the current view instead of silently disappearing once the calendar
  // rolls over to a new month ("esquecida").
  const pendingExpenses = transactions.filter(t => {
    if (t.type !== 'expense' || t.status !== 'pending') return false;
    if (selectedMonth === 'all') return true;
    const effectiveMonth = (t.dueDate || t.date).slice(0, 7);
    return effectiveMonth <= selectedMonth;
  });

  const totalPendingAmount = pendingExpenses.reduce((acc, t) => acc + t.amount, 0);

  // Group expenses by category
  const categoryMap: Record<string, number> = {};
  filteredTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Group expenses by Assigned To (João, Rafaella, Shared)
  const userExpenses: Record<string, number> = {
    'João': 0,
    'Rafaella': 0,
    'Casal (Compartilhado)': 0
  };
  filteredTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const key = t.assignedTo === 'João' ? 'João' : (t.assignedTo === 'Rafaella' || t.assignedTo === 'Esposa') ? 'Rafaella' : 'Casal (Compartilhado)';
      userExpenses[key] = (userExpenses[key] || 0) + t.amount;
    });

  // Is this due date already in the past (and, since we only ever call this
  // on pending items, still unpaid)? Overdue bills always surface below,
  // regardless of the week/month/year tab, so they don't get forgotten.
  const isOverdue = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return false;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return d < startOfToday;
  };

  // Upcoming bills card: pending expenses within the chosen period (week/month/year),
  // always relative to today — independent of the global month/year selector,
  // since this card is meant as a quick glance, not the detailed history view.
  const isWithinBillsPeriod = (dateStr: string) => {
    if (isOverdue(dateStr)) return true;

    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return false;
    const now = new Date();

    if (billsPeriod === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    if (billsPeriod === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    // week: current Monday-to-Sunday range
    const mondayOffset = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return d >= startOfWeek && d <= endOfWeek;
  };

  const periodPendingBills = transactions.filter(t =>
    t.type === 'expense' && t.status === 'pending' && isWithinBillsPeriod(t.dueDate || t.date)
  );

  const upcomingBills = [...periodPendingBills]
    .sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date))
    .slice(0, 4);

  // Marking a bill as paid from this card commits immediately, but offers a
  // 5s "Desfazer" window — the item would otherwise just vanish from this
  // short list with no way back.
  const handleCheckBill = async (bill: Transaction) => {
    await toggleTransactionStatus(bill.id);
    showToast(`'${bill.description}' marcado como pago`, {
      duration: 5000,
      action: {
        label: 'Desfazer',
        onClick: () => {
          toggleTransactionStatus(bill.id);
        }
      }
    });
  };

  // Highlight active goals
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-14">

      {/* Main KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Receitas Card */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total de Receitas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {formatBRL(totalIncome)}
            </div>
            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full" />
            </div>
          </div>
        </div>

        {/* Despesas Totais Card */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total de Despesas
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400 tracking-tight">
              {formatBRL(totalExpense)}
            </div>
            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Saldo Líquido do Mês */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo Líquido
            </span>
            <div className={`w-8 h-8 rounded-lg ${balance >= 0 ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'} flex items-center justify-center`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {formatBRL(balance)}
            </div>
            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${balance >= 0 ? 'bg-blue-500' : 'bg-rose-500'} transition-all`}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Contas Pendentes / A Pagar */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              A Pagar (Pendentes)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 tracking-tight">
              {formatBRL(totalPendingAmount)}
            </div>
            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${totalExpense > 0 ? Math.min(100, Math.round((totalPendingAmount / totalExpense) * 100)) : 0}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Próximas Contas a Vencer (Full Width - 1 per line list) */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-white text-sm">
            Próximas Contas a Vencer
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10 text-[11px]">
              <button
                onClick={() => setBillsPeriod('week')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  billsPeriod === 'week' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setBillsPeriod('month')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  billsPeriod === 'month' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setBillsPeriod('year')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  billsPeriod === 'year' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ano
              </button>
            </div>

            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline shrink-0"
            >
              Ver todas ({periodPendingBills.length})
            </button>
          </div>
        </div>

        {upcomingBills.length === 0 ? (
          <div className="py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">Tudo pago por aqui!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Nenhuma conta pendente para este período.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcomingBills.map((bill) => {
              const overdue = isOverdue(bill.dueDate || bill.date);
              return (
              <div
                key={bill.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs ${
                  overdue ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleCheckBill(bill)}
                    title="Marcar como Pago"
                    className="w-6 h-6 rounded-lg border border-amber-400/40 bg-amber-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 flex items-center justify-center transition-colors group shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-400/40 group-hover:text-emerald-400 transition-colors" />
                  </button>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{bill.description}</div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                      {overdue && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-sm bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Atrasada
                        </span>
                      )}
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-sm bg-white/10 text-slate-300 border border-white/5">
                        {bill.category}
                      </span>
                      <span>Vencimento: <strong className="text-slate-200">{bill.dueDate || bill.date}</strong></span>
                      <span className="text-white/20">•</span>
                      <span>{bill.assignedTo === 'shared' ? 'Casal' : bill.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-bold text-amber-400 text-sm">
                    {formatBRL(bill.amount)}
                  </span>
                  <button
                    onClick={() => handleCheckBill(bill)}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    Pagar
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 3: Gastos por Categoria + Gastos por Responsável + Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Top Categorias */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <h3 className="font-semibold text-white text-sm mb-4">
            Gastos por Categoria
          </h3>
          {sortedCategories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Nenhuma despesa no período.</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([category, amount]) => {
                const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-300">{category}</span>
                      <span className="font-semibold text-white">
                        {formatBRL(amount)} <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Divisão por Responsável (João vs Rafaella vs Casal) */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <h3 className="font-semibold text-white text-sm mb-4">
            Divisão de Gastos por Responsável
          </h3>
          <div className="space-y-3.5">
            {Object.entries(userExpenses).map(([user, amount]) => {
              const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
              const color = user === 'João' ? 'bg-blue-500' : (user === 'Rafaella' || user === 'Esposa') ? 'bg-rose-500' : 'bg-purple-500';
              return (
                <div key={user}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {user}
                    </span>
                    <span className="font-semibold text-white">
                      {formatBRL(amount)} <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${color} h-1.5 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-3 border-t border-white/10 text-[11px] text-slate-400">
            Transações cadastradas com responsável são atribuídas individualmente no cálculo do casal.
          </div>
        </div>

        {/* Metas e Desejos em Destaque */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">
              Metas & Wishlist
            </h3>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium hover:underline"
            >
              Ver todas ({goals.length})
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="py-6 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
              <Target className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs text-slate-300">Nenhuma meta ativa.</p>
              <button
                onClick={onOpenNewGoal}
                className="mt-2 text-xs font-semibold text-purple-400 hover:underline"
              >
                + Cadastrar Desejo / Meta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                return (
                  <div key={goal.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200 truncate max-w-[160px]">{goal.title}</span>
                      <span className="font-bold text-purple-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
                      <span>{formatBRL(goal.currentAmount)}</span>
                      <span>Meta: {formatBRL(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
