import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, BillFrequency, TransactionStatus, PaymentMethod } from '../../types';
import { CATEGORIES, PAYMENT_METHODS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowDownRight, ArrowUpRight, ChevronLeft } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: any) => Promise<void>;
  editingTransaction?: Transaction | null;
}

const DEFAULT_EXPENSE_CATEGORY = 'Alimentação';
const DEFAULT_INCOME_CATEGORY = 'Salário';

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction
}) => {
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [frequency, setFrequency] = useState<BillFrequency>('pontual');
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORY);
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
      setStep(2);
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
      setStep(1);
      setDescription('');
      setAmount('');
      setType('expense');
      setFrequency('pontual');
      setCategory(DEFAULT_EXPENSE_CATEGORY);
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

  // Receitas não têm data de vencimento, forma de pagamento ou frequência fixa
  // (salário e afins não seguem um padrão previsível) — só despesas usam esses campos.
  const chooseType = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'income' ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY);
    if (newType === 'income') {
      setFrequency('pontual');
      setPaymentMethod('transfer');
    }
    setStep(2);
  };

  const categoriesForType = CATEGORIES.filter(c => c.type === type || c.type === 'both');

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
        dueDate: type === 'income' ? date : (dueDate || date),
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
              {editingTransaction ? 'Editar Lançamento' : step === 1 ? 'Novo Lançamento' : type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
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

          {step === 1 ? (
            /* ============ Step 1: Type Selection ============ */
            <div className="space-y-3 py-1">
              <p className="text-xs text-slate-400 text-center mb-1">
                O que você quer registrar?
              </p>

              <button
                type="button"
                onClick={() => chooseType('expense')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Despesa (Gasto)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Uma saída de dinheiro: aluguel, mercado, contas, assinaturas...
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => chooseType('income')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Receita (Ganho)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Uma entrada de dinheiro: salário, bônus, venda, renda extra...
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* ============ Step 2: Details (fields depend on the chosen type) ============ */
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${
                  type === 'expense'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {type === 'expense' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  {type === 'expense' ? 'Despesa' : 'Receita'}
                </span>
              </div>

              {/* Description & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    placeholder={type === 'income' ? 'Ex: Salário, Bônus, Venda' : 'Ex: Aluguel, Supermercado'}
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

              {type === 'expense' ? (
                <>
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
                        {categoriesForType.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dates (Lançamento & Vencimento) */}
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
                </>
              ) : (
                /* Categoria & Data do Recebimento (receitas não têm vencimento) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
                    >
                      {categoriesForType.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Data do Recebimento</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden backdrop-blur-md"
                    />
                  </div>
                </div>
              )}

              {/* Status & Assigned To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {type === 'income' ? 'Status do Recebimento' : 'Status do Pagamento'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
                  >
                    <option value="paid">{type === 'income' ? 'Recebido' : 'Pago'}</option>
                    <option value="pending">{type === 'income' ? 'A Receber' : 'Pendente (A Pagar)'}</option>
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

              {/* Payment Method — só faz sentido para despesas */}
              {type === 'expense' && (
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
              )}

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
            </>
          )}

        </form>

      </div>
    </div>
  );
};
