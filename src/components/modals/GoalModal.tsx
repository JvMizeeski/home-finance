import React, { useState, useEffect } from 'react';
import { GoalItem, GoalCategory } from '../../types';
import { GOAL_CATEGORIES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { X, Target, Link, DollarSign, Calendar, Tag } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: any) => Promise<void>;
  editingGoal?: GoalItem | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal
}) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState<GoalCategory>('home');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmount(String(editingGoal.targetAmount));
      setCurrentAmount(String(editingGoal.currentAmount));
      setCategory(editingGoal.category);
      setPurchaseUrl(editingGoal.purchaseUrl || '');
      setPriority(editingGoal.priority || 'medium');
      setTargetDate(editingGoal.targetDate || '');
      setNotes(editingGoal.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setCategory('home');
      setPurchaseUrl('');
      setPriority('medium');
      setTargetDate('');
      setNotes('');
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) {
      alert("Por favor, preencha o título e o valor da meta.");
      return;
    }

    const numericTarget = Math.abs(parseFloat(targetAmount.replace(',', '.'))) || 0;
    const numericCurrent = Math.abs(parseFloat(currentAmount.replace(',', '.'))) || 0;

    if (numericTarget <= 0) {
      alert("O valor da meta precisa ser maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        targetAmount: numericTarget,
        currentAmount: numericCurrent,
        category,
        purchaseUrl: purchaseUrl.trim(),
        priority,
        targetDate: targetDate || undefined,
        notes: notes.trim(),
        status: numericCurrent >= numericTarget && numericTarget > 0 ? 'completed' : 'active'
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto backdrop-blur-xl text-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingGoal ? 'Editar Desejo / Meta' : 'Novo Desejo / Meta de Compra'}
            </h3>
            <p className="text-xs text-slate-400">
              Cadastre itens para o lar ou planos pessoais de João & Esposa
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Título do Desejo / Objetivo</label>
            <input
              type="text"
              required
              placeholder="Ex: Sofá Retrátil, Air Fryer, Viagem de Férias"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Valor da Meta / Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 2500,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 backdrop-blur-md font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Economizado Inicialmente (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-hidden placeholder:text-slate-500 backdrop-blur-md"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoria do Desejo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                {GOAL_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="high">🔴 Alta Prioridade</option>
                <option value="medium">🟡 Média Prioridade</option>
                <option value="low">🟢 Baixa Prioridade</option>
              </select>
            </div>
          </div>

          {/* Purchase Link */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Link de Compra / Produto (URL)
            </label>
            <input
              type="url"
              placeholder="https://www.mercadolivre.com.br/exemplo-produto"
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 backdrop-blur-md"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Adicione o link do Mercado Livre, Amazon ou loja para comprar com 1 clique.
            </span>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Data Prevista para Adquirir (Opcional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden backdrop-blur-md"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Observações / Detalhes</label>
            <textarea
              rows={2}
              placeholder="Ex: Cor cinza chumbo, esperar promoção da Black Friday"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden placeholder:text-slate-500 backdrop-blur-md"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 font-medium rounded-xl transition-colors backdrop-blur-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-95"
            >
              {isSubmitting ? 'Salvando...' : editingGoal ? 'Salvar Alterações' : 'Cadastrar Desejo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
