import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Transaction, BillFrequency, TransactionType, TransactionStatus } from '../types';
import { CATEGORIES } from '../lib/constants';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Tag,
  CreditCard,
  User,
  SlidersHorizontal,
  X,
  Pin,
  Zap
} from 'lucide-react';

interface TransactionsTabProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ 
  onOpenNewTransaction,
  onEditTransaction 
}) => {
  const { transactions, selectedMonth, toggleTransactionStatus, deleteTransaction } = useData();
  const { currentUser } = useAuth();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [freqFilter, setFreqFilter] = useState<'all' | BillFrequency>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Month filter
      if (selectedMonth !== 'all') {
        const matchesDate = tx.date && tx.date.startsWith(selectedMonth);
        const matchesDueDate = tx.dueDate && tx.dueDate.startsWith(selectedMonth);
        if (!matchesDate && !matchesDueDate) return false;
      }

      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(term);
        const matchesCat = tx.category.toLowerCase().includes(term);
        const matchesNotes = tx.notes?.toLowerCase().includes(term);
        if (!matchesDesc && !matchesCat && !matchesNotes) return false;
      }

      // Type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Frequency (Fixa vs Pontual)
      if (freqFilter !== 'all' && tx.frequency !== freqFilter) return false;

      // Status
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Assigned To
      if (assignedFilter !== 'all') {
        if (assignedFilter === 'João' && tx.assignedTo !== 'João') return false;
        if (assignedFilter === 'Rafaella' && tx.assignedTo !== 'Rafaella' && tx.assignedTo !== 'Esposa') return false;
        if (assignedFilter === 'shared' && tx.assignedTo !== 'shared' && tx.assignedTo !== 'Casal') return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, searchTerm, typeFilter, freqFilter, statusFilter, categoryFilter, assignedFilter]);

  // Metrics for current filtered view
  const filteredIncomes = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredFixed = filteredTransactions
    .filter(t => t.type === 'expense' && t.frequency === 'fixed')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredPontual = filteredTransactions
    .filter(t => t.type === 'expense' && t.frequency === 'pontual')
    .reduce((acc, t) => acc + t.amount, 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDelete = async (id: string, description: string) => {
    if (window.confirm(`Tem certeza que deseja excluir '${description}'? Esta ação registrará um log de auditoria.`)) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Top Action & Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="tx-search-input"
            type="text"
            placeholder="Buscar por descrição, categoria, anotação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 backdrop-blur-md transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-medium backdrop-blur-md transition-colors ${
            showFiltersMobile ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-slate-300 border-white/10'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
        </button>
      </div>

      {/* Filter Row (Desktop Always, Mobile Toggleable) */}
      <div className={`${showFiltersMobile ? 'block' : 'hidden'} sm:block bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg space-y-3`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Tipo (Todos / Despesa / Receita) */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${typeFilter === 'all' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg transition-all ${typeFilter === 'expense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg transition-all ${typeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Receitas
            </button>
          </div>

          {/* Frequência (Fixa vs Pontual) */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFreqFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${freqFilter === 'all' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Todas Freq.
            </button>
            <button
              onClick={() => setFreqFilter('fixed')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${freqFilter === 'fixed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              <Pin className="w-3 h-3" />
              Contas Fixas
            </button>
            <button
              onClick={() => setFreqFilter('pontual')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${freqFilter === 'pontual' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              <Zap className="w-3 h-3" />
              Pontuais
            </button>
          </div>

          {/* Status (Pago / Pendente) */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Status: Todos
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Pagos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              Pendentes
            </button>
          </div>

          {/* Responsável Dropdown */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="bg-slate-900/60 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="all">Responsável: Todos</option>
            <option value="João">João</option>
            <option value="Rafaella">Rafaella</option>
            <option value="shared">Casal (Compartilhado)</option>
          </select>

          {/* Categoria Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900/60 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="all">Categoria: Todas</option>
            {CATEGORIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(typeFilter !== 'all' || freqFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all' || assignedFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setFreqFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
                setAssignedFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium ml-auto"
            >
              Limpar Filtros
            </button>
          )}

        </div>
      </div>

      {/* Filtered Overview Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs backdrop-blur-md">
        <div className="text-slate-400 font-medium">
          Exibindo <strong className="text-white">{filteredTransactions.length}</strong> transações
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="text-emerald-400">
            Receitas: {formatBRL(filteredIncomes)}
          </div>
          <div className="text-rose-400">
            Despesas: {formatBRL(filteredExpenses)}
          </div>
          <div className="text-blue-400 hidden sm:block">
            Fixas: {formatBRL(filteredFixed)}
          </div>
          <div className="text-amber-400 hidden sm:block">
            Pontuais: {formatBRL(filteredPontual)}
          </div>
          <div className="text-white border-l border-white/15 pl-3">
            Balanço: <span className={filteredIncomes - filteredExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatBRL(filteredIncomes - filteredExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 backdrop-blur-md">
          <Tag className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">Nenhuma transação encontrada</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros selecionados ou para o mês atual.
          </p>
          <button
            onClick={onOpenNewTransaction}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar Lançamento Agora
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isPaid = tx.status === 'paid';
            const isFixed = tx.frequency === 'fixed';
            const isSpark = tx.source === 'google_spark';

            return (
              <div
                key={tx.id}
                className="bg-white/5 p-3.5 sm:p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all backdrop-blur-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Icon, Description, Category, Tags */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">

                  {/* Status Checkbox Button */}
                  <button
                    onClick={() => toggleTransactionStatus(tx.id)}
                    title={isPaid ? "Marcado como Pago (Clique para marcar como Pendente)" : "Pendente (Clique para marcar como Pago)"}
                    className={`mt-0.5 sm:mt-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isPaid 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    }`}
                  >
                    {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm break-words">{tx.description}</span>
                      
                      {/* Fixed vs Pontual Badge */}
                      {isFixed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <Pin className="w-2.5 h-2.5" />
                          Fixa Mensal
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-slate-300">
                          Pontual
                        </span>
                      )}

                      {/* Google Spark Badge */}
                      {isSpark && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          Spark API
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        isPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>

                    {/* Metadata Subline */}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-200 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/5">
                        {tx.category}
                      </span>
                      <span>Data: {tx.date}</span>
                      {tx.dueDate && tx.dueDate !== tx.date && (
                        <span>• Vencimento: <strong className="text-slate-200">{tx.dueDate}</strong></span>
                      )}
                      <span>• Por: <strong className="text-slate-200">{tx.assignedTo === 'shared' ? 'Casal' : tx.assignedTo}</strong></span>
                      {tx.notes && (
                        <span className="italic text-slate-400 hidden md:inline truncate max-w-xs">
                          - "{tx.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <div className="text-left sm:text-right">
                    <div className={`text-base sm:text-lg font-bold tracking-tight font-mono ${
                      isIncome ? 'text-emerald-400' : 'text-slate-100'
                    }`}>
                      {isIncome ? `+ ${formatBRL(tx.amount)}` : `- ${formatBRL(tx.amount)}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Criado por {tx.createdBy || 'Usuário'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      title="Editar Transação"
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      title="Excluir Transação"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
