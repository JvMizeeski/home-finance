import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { GoalItem, GoalCategory } from '../types';
import { GOAL_CATEGORIES } from '../lib/constants';
import { 
  Target, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  CircleDollarSign, 
  Calendar, 
  HeartHandshake, 
  Trash2, 
  Edit3, 
  ShoppingBag, 
  Check, 
  Sparkles,
  Home,
  User,
  Plane,
  ShieldCheck,
  Laptop
} from 'lucide-react';

interface GoalsTabProps {
  onOpenNewGoal: () => void;
  onEditGoal: (goal: GoalItem) => void;
  onAddContribution: (goal: GoalItem) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({ 
  onOpenNewGoal, 
  onEditGoal, 
  onAddContribution 
}) => {
  const { goals, toggleGoalCompleted, deleteGoal } = useData();
  const { currentUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredGoals = goals.filter(g => {
    if (filterStatus === 'active' && g.status !== 'active') return false;
    if (filterStatus === 'completed' && g.status !== 'completed') return false;
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    return true;
  });

  const totalTargetActive = goals
    .filter(g => g.status === 'active')
    .reduce((acc, g) => acc + g.targetAmount, 0);

  const totalSavedActive = goals
    .filter(g => g.status === 'active')
    .reduce((acc, g) => acc + g.currentAmount, 0);

  const completedCount = goals.filter(g => g.status === 'completed').length;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Deseja realmente excluir a meta '${title}'?`)) {
      await deleteGoal(id);
    }
  };

  const getCategoryBadge = (catId: GoalCategory) => {
    const found = GOAL_CATEGORIES.find(c => c.id === catId);
    return found || { label: "Objetivo", color: "bg-slate-100 text-slate-700" };
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-blue-950/40 rounded-2xl p-5 sm:p-6 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 backdrop-blur-md">
                Lista de Desejos & Metas
              </span>
              <span className="text-xs text-slate-400">
                Economias do Lar & Pessoais
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Sonhos, Compras da Casa & Metas Financeiras
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Defina o valor, anexe o link da loja e acompanhe o progresso das economias em tempo real.
            </p>
          </div>

          <button
            id="goals-new-btn"
            onClick={onOpenNewGoal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Desejo / Meta
          </button>
        </div>

        {/* Mini KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="text-xs text-slate-400 font-medium">Total Economizado (Metas Ativas)</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">
              {formatBRL(totalSavedActive)}
            </div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="text-xs text-slate-400 font-medium">Meta Total a Atingir</div>
            <div className="text-xl font-bold text-white mt-0.5 font-mono">
              {formatBRL(totalTargetActive)}
            </div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="text-xs text-slate-400 font-medium">Itens Já Adquiridos / Realizados</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">
              🎉 {completedCount} meta(s)
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10 text-xs backdrop-blur-md">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'active' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Em Andamento ({goals.filter(g => g.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'completed' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✅ Já Adquiridos ({completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'all' ? 'bg-white/15 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({goals.length})
          </button>
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900/60 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-hidden backdrop-blur-md [&>option]:bg-slate-900 [&>option]:text-slate-100"
        >
          <option value="all">Todas as Categorias</option>
          {GOAL_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 backdrop-blur-md">
          <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">Nenhum item nesta lista</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filterStatus === 'completed' 
              ? "Você ainda não marcou metas como concluídas. Economize e marque seu primeiro check!" 
              : "Cadastre seu primeiro desejo de compra para a casa ou uso pessoal."}
          </p>
          <button
            onClick={onOpenNewGoal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Desejo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const isCompleted = goal.status === 'completed';
            const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const catBadge = getCategoryBadge(goal.category);

            return (
              <div
                key={goal.id}
                className={`rounded-2xl border transition-all duration-200 backdrop-blur-md flex flex-col justify-between overflow-hidden ${
                  isCompleted 
                    ? 'border-emerald-500/30 bg-emerald-950/20' 
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                }`}
              >
                <div className="p-5">
                  {/* Top Header: Category Badge & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/10`}>
                      {catBadge.label}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGoal(goal)}
                        title="Editar Meta"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id, goal.title)}
                        title="Excluir Meta"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <h3 className="font-bold text-white text-base leading-snug">
                    {goal.title}
                  </h3>

                  {goal.notes && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {goal.notes}
                    </p>
                  )}

                  {/* Purchase Link (Link de Compra) */}
                  {goal.purchaseUrl ? (
                    <div className="mt-3">
                      <a
                        href={goal.purchaseUrl.startsWith('http') ? goal.purchaseUrl : `https://${goal.purchaseUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-blue-300 border border-white/10 transition-colors group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-200" />
                        <span className="truncate max-w-[200px]">Acessar Link da Loja / Compra</span>
                      </a>
                    </div>
                  ) : null}

                  {/* Progress Section */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Progresso da Economia</span>
                      <span className={`font-bold text-sm ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Target & Saved Details */}
                    <div className="flex items-center justify-between text-xs mt-2 font-medium">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Economizado</span>
                        <span className="font-bold text-emerald-400 font-mono">{formatBRL(goal.currentAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Meta / Preço</span>
                        <span className="font-bold text-white font-mono">{formatBRL(goal.targetAmount)}</span>
                      </div>
                    </div>

                    {!isCompleted && remaining > 0 && (
                      <div className="mt-2 text-[11px] text-slate-300 bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                        Faltam <strong className="text-amber-400">{formatBRL(remaining)}</strong> para atingir a meta
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 font-semibold p-2 rounded-xl text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Item Adquirido / Concluído! 🎉
                      </div>
                    )}
                  </div>

                  {/* Contributions mini list */}
                  {goal.contributions && goal.contributions.length > 0 && (
                    <div className="mt-3 text-[11px] text-slate-400 border-t border-white/10 pt-2">
                      <span className="font-semibold text-slate-300 block mb-1">Últimos aportes:</span>
                      <div className="space-y-1">
                        {goal.contributions.slice(-2).map((c) => (
                          <div key={c.id} className="flex justify-between text-slate-400">
                            <span>{c.user} ({c.date}):</span>
                            <span className="font-medium text-emerald-400">+{formatBRL(c.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Action Footer */}
                <div className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
                  {!isCompleted ? (
                    <>
                      <button
                        onClick={() => onAddContribution(goal)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-900/30 active:scale-95"
                      >
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        + Economizar
                      </button>

                      <button
                        onClick={() => toggleGoalCompleted(goal.id)}
                        title="Marcar como adquirido"
                        className="px-3 py-2 bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Adquiri!
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleGoalCompleted(goal.id)}
                      className="w-full py-2 bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 text-xs font-medium rounded-xl transition-colors"
                    >
                      Reabrir Objetivo
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
