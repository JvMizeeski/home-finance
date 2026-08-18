import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, BillFrequency, TransactionStatus, PaymentMethod } from '../../types';
import { CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: any) => Promise<void>;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction
}) => {
  const { currentUser } = useAuth();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [frequency, setFrequency] = useState<BillFrequency>('pontual');
  const [category, setCategory] = useState('Alimentação');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [assignedTo, setAssignedTo] = useState('shared');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setFrequency(editingTransaction.frequency);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDueDate(editingTransaction.dueDate || editingTransaction.date);
      setStatus(editingTransaction.status);
      setPaymentMethod(editingTransaction.paymentMethod || 'pix');
      setAssignedTo(editingTransaction.assignedTo === 'Esposa' ? 'Rafaella' : (editingTransaction.assignedTo || 'shared'));
      setNotes(editingTransaction.notes || '');
      setReceiptUrl(editingTransaction.receiptUrl || '');
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setFrequency('pontual');
      setCategory('Alimentação');
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate(new Date().toISOString().slice(0, 10));
      setStatus('paid');
      setPaymentMethod('pix');
      setAssignedTo(currentUser.name === 'Rafaella' || currentUser.name === 'Esposa' ? 'Rafaella' : currentUser.name === 'João' ? 'João' : 'shared');
      setNotes('');
      setReceiptUrl('');
    }
  }, [editingTransaction, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      alert("Por favor, preencha a descrição e o valor.");
      return;
    }

    const numericAmount = Math.abs(parseFloat(amount.replace(',', '.'))) || 0;
    if (numericAmount <= 0) {
      alert("O valor precisa ser maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        description: description.trim(),
        amount: numericAmount,
        type,
        frequency,
        category,
        date,
        dueDate: dueDate || date,
        status,
        paymentMethod,
        assignedTo,
        notes: notes.trim(),
        receiptUrl: receiptUrl.trim(),
        source: editingTransaction ? editingTransaction.source : 'manual'
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
      <div className="bg-slate-900/95 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto backdrop-blur-xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
            <p className="text-xs text-slate-400">
              Registrado por <strong className="text-white">{currentUser.name}</strong>
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
          
          {/* Type Selector (Despesa vs Receita) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Tipo de Lançamento</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border-2 border-rose-500 shadow-md shadow-rose-950/40'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>Despesa (Gasto)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Receita (Ganho)</span>
              </button>
            </div>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Aluguel, Supermercado, Salário"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 backdrop-blur-md"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-hidden focus:border-blue-500 placeholder:text-slate-500 backdrop-blur-md font-mono"
              />
            </div>
          </div>

          {/* Frequency & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Frequência da Conta</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="pontual">Gasto Pontual (Eventual)</option>
                <option value="fixed">Conta Fixa Mensal (Recorrente)</option>
                <option value="installment">Parcelado</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates (Data do Pagamento & Vencimento) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Data do Lançamento</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden backdrop-blur-md"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Data de Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden backdrop-blur-md"
              />
            </div>
          </div>

          {/* Status & Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status do Pagamento</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="paid">Pago / Recebido</option>
                <option value="pending">Pendente (A Pagar)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Responsável</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="shared">Casal (Compartilhado)</option>
                <option value="João">João</option>
                <option value="Rafaella">Rafaella</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              {PAYMENT_METHODS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
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
              {isSubmitting ? 'Salvando...' : editingTransaction ? 'Salvar Alterações' : 'Cadastrar Lançamento'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
