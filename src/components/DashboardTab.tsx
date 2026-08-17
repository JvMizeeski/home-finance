import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
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

  // Filter transactions by selectedMonth (or show all if 'all')
  const filteredTxs = transactions.filter(t => {
    if (selectedMonth === 'all') return true;
    return t.date.startsWith(selectedMonth) || (t.dueDate && t.dueDate.startsWith(selectedMonth));
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

  const pendingExpenses = filteredTxs
    .filter(t => t.type === 'expense' && t.status === 'pending');
  
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

  // Group expenses by Assigned To (João, Esposa, Shared)
  const userExpenses: Record<string, number> = {
    'João': 0,
    'Esposa': 0,
    'Casal (Compartilhado)': 0
  };
  filteredTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const key = t.assignedTo === 'João' ? 'João' : t.assignedTo === 'Esposa' ? 'Esposa' : 'Casal (Compartilhado)';
      userExpenses[key] = (userExpenses[key] || 0) + t.amount;
    });

  // Upcoming bills (pending with due dates)
  const upcomingBills = [...pendingExpenses]
    .sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date))
    .slice(0, 4);

  // Highlight active goals
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-14">
      
      {/* Welcome Banner & Quick Action */}
      <div className="bg-gradient-to-r from-blue-950/50 via-slate-900/60 to-purple-950/40 rounded-2xl p-5 sm:p-6 text-white border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 backdrop-blur-md">
                Painel do Lar
              </span>
              <span className="text-xs text-slate-400">
                Logado como <strong className="text-white">{currentUser.name}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Controle Financeiro da Casa
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Acompanhe gastos fixos, pontuais, progresso das economias e dados sincronizados via Google Spark.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="dash-quick-tx-btn"
              onClick={onOpenNewTransaction}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Lançar Gasto/Ganho
            </button>
            <button
              id="dash-quick-goal-btn"
              onClick={onOpenNewGoal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs sm:text-sm font-medium transition-all backdrop-blur-md active:scale-95"
            >
              <Target className="w-4 h-4 text-emerald-400" />
              Nova Meta
            </button>
          </div>
        </div>
      </div>

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
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400/80 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{filteredTxs.filter(t => t.type === 'income').length} entrada(s) registradas</span>
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
            <div className="flex items-center gap-1 mt-1 text-xs text-rose-400/80 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{filteredTxs.filter(t => t.type === 'expense').length} saída(s) registradas</span>
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
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <span>{balance >= 0 ? 'Economia no período' : 'Gastos excederam receitas'}</span>
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
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-400/80 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{pendingExpenses.length} conta(s) em aberto</span>
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

      {/* Row 2: Fixed vs Pontual + Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fixed vs Pontual Breakdown */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">
              Contas Fixas vs Pontuais
            </h3>
            <span className="text-xs text-slate-400">Tipo de Custo</span>
          </div>

          <div className="space-y-4">
            {/* Fixas */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Contas Fixas (Moradia, Internet, etc.)
                </span>
                <span className="font-bold text-white">{formatBRL(fixedExpenses)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalExpense > 0 ? Math.round((fixedExpenses / totalExpense) * 100) : 0}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 text-right">
                {totalExpense > 0 ? Math.round((fixedExpenses / totalExpense) * 100) : 0}% do total de gastos
              </div>
            </div>

            {/* Pontuais */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Gastos Pontuais (Mercado, Lazer, etc.)
                </span>
                <span className="font-bold text-white">{formatBRL(pontualExpenses)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalExpense > 0 ? Math.round((pontualExpenses / totalExpense) * 100) : 0}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 text-right">
                {totalExpense > 0 ? Math.round((pontualExpenses / totalExpense) * 100) : 0}% do total de gastos
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Comprometimento da Renda:</span>
            <span className="font-semibold text-emerald-400">
              {totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}% das receitas
            </span>
          </div>
        </div>

        {/* Próximas Contas a Vencer */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">
                Próximas Contas a Vencer
              </h3>
              <p className="text-xs text-slate-400">
                Pague e dê baixa diretamente com um clique
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline"
            >
              Ver todas ({pendingExpenses.length})
            </button>
          </div>

          {upcomingBills.length === 0 ? (
            <div className="py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">Tudo pago por aqui!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Nenhuma conta pendente para este período.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTransactionStatus(bill.id)}
                      title="Marcar como Pago"
                      className="w-5 h-5 rounded-md border border-amber-400/40 bg-amber-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 flex items-center justify-center transition-colors"
                    >
                      <span className="text-[10px] text-transparent hover:text-emerald-400 font-bold">✓</span>
                    </button>
                    <div>
                      <div className="font-semibold text-white">{bill.description}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-sm bg-white/10 text-slate-300 border border-white/5">
                          {bill.category}
                        </span>
                        <span>Vencimento: <strong className="text-slate-200">{bill.dueDate || bill.date}</strong></span>
                        <span className="text-white/20">•</span>
                        <span>{bill.assignedTo === 'shared' ? 'Casal' : bill.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-400 text-sm">
                      {formatBRL(bill.amount)}
                    </span>
                    <button
                      onClick={() => toggleTransactionStatus(bill.id)}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium rounded-lg border border-emerald-500/30 transition-colors"
                    >
                      Pagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {/* Divisão por Responsável (João vs Esposa vs Casal) */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <h3 className="font-semibold text-white text-sm mb-4">
            Divisão de Gastos por Responsável
          </h3>
          <div className="space-y-3.5">
            {Object.entries(userExpenses).map(([user, amount]) => {
              const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
              const color = user === 'João' ? 'bg-blue-500' : user === 'Esposa' ? 'bg-pink-500' : 'bg-purple-500';
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
              className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
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
                className="mt-2 text-xs font-semibold text-blue-400 hover:underline"
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
                      <span className="font-bold text-blue-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
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
