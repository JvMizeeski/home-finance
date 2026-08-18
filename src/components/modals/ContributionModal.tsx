import React, { useState } from 'react';
import { GoalItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, CircleDollarSign, User, Sparkles } from 'lucide-react';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalItem | null;
  onContribute: (goalId: string, amount: number, notes?: string) => Promise<void>;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
  onContribute
}) => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Math.abs(parseFloat(amount.replace(',', '.'))) || 0;
    if (numericAmount <= 0) {
      alert("Por favor, digite um valor válido maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onContribute(goal.id, numericAmount, notes.trim());
      setAmount('');
      setNotes('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/90 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 backdrop-blur-xl text-slate-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <CircleDollarSign className="w-5 h-5 text-purple-400" />
              Economizar para Meta
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
              {goal.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal summary */}
        <div className="my-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1 backdrop-blur-md">
          <div className="flex justify-between text-slate-300">
            <span>Já economizado:</span>
            <strong className="text-emerald-400 font-mono">{formatBRL(goal.currentAmount)}</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Valor Total da Meta:</span>
            <strong className="text-white font-mono">{formatBRL(goal.targetAmount)}</strong>
          </div>
          <div className="flex justify-between text-slate-400 pt-1 border-t border-white/10">
            <span>Falta economizar:</span>
            <strong className="text-amber-400 font-mono">{formatBRL(remaining)}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Quanto deseja economizar agora? (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              placeholder="Ex: 200,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-base font-bold font-mono text-white focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Autor do Aporte
            </label>
            <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-semibold">
              <span className={`w-6 h-6 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-[10px]`}>
                {currentUser.name.charAt(0)}
              </span>
              <span>{currentUser.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Origem / Anotação (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Sobra do salário, Venda de item usado, Bônus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/30 active:scale-95"
            >
              {isSubmitting ? 'Salvando...' : 'Confirmar Economia'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
