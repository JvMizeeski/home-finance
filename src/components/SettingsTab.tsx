import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AuditLogsTab } from './AuditLogsTab';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Users,
  Mail,
  Database,
  History,
  Info
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { currentUser, availableUsers, switchUser } = useAuth();
  const { resetAllData, transactions, goals, auditLogs, supabaseConfig } = useData();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmationWord, setConfirmationWord] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (confirmationWord !== 'ZERAR') return;
    setIsResetting(true);
    try {
      await resetAllData();
      setIsResetting(false);
      setIsResetModalOpen(false);
      setConfirmationWord('');
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (e) {
      console.error(e);
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Configurações
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Gerencie os perfis de usuário, preferências do lar e manutenção do banco de dados.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 backdrop-blur-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="font-semibold text-emerald-200">Banco de dados zerado com sucesso!</strong>
            <p className="text-[11px] text-emerald-400/90 mt-0.5">
              Todas as transações, metas e registros foram excluídos permanentemente da base.
            </p>
          </div>
        </div>
      )}

      {/* 1. Perfis de Usuário */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Perfis do Casal & Usuário Ativo
              </h3>
              <p className="text-xs text-slate-400">
                Selecione qual perfil você está utilizando no momento para registrar as finanças.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableUsers.map((u) => {
            const isSelected = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-full ${u.avatarColor} text-white font-bold flex items-center justify-center text-base shadow-md`}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{u.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-semibold">
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {u.email || `${u.name.toLowerCase()}@homefinance.app`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-xs text-slate-400 flex items-start gap-2 bg-white/5 p-3.5 rounded-xl border border-white/5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            Ao criar ou editar lançamentos e metas, o perfil ativo é registrado como responsável no log de auditoria e relatórios de despesas individuais.
          </span>
        </div>
      </div>

      {/* 2. Resumo de Dados do Sistema */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Estatísticas do Banco de Dados
            </h3>
            <p className="text-xs text-slate-400">
              Volume de dados gravados nas tabelas do sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Transações</span>
            <span className="text-lg sm:text-xl font-bold text-white mt-1 block">
              {transactions.length}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Metas / Wishlist</span>
            <span className="text-lg sm:text-xl font-bold text-white mt-1 block">
              {goals.length}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Logs de Auditoria</span>
            <span className="text-lg sm:text-xl font-bold text-white mt-1 block">
              {auditLogs.length}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Conexão Supabase</span>
            <span className={`text-xs sm:text-sm font-bold mt-1.5 block ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {supabaseConfig.isConnected ? 'Conectado' : 'Local / Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Histórico & Logs */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Histórico & Logs
            </h3>
            <p className="text-xs text-slate-400">
              Registro de todas as alterações e sincronizações do sistema.
            </p>
          </div>
        </div>

        <AuditLogsTab />
      </div>

      {/* 4. Zona Crítica / Zerar Todos os Dados */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-rose-300">
                Zona de Perigo: Zerar Banco de Dados
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Esta ação <strong className="text-rose-300 font-semibold">apaga permanentemente todas as linhas das tabelas</strong> do banco de dados (todas as receitas, despesas, contas a pagar, metas e histórico).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/40 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Zerar Todos os Dados</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900/95 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-500/40 backdrop-blur-xl text-slate-100 space-y-4">
            
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Tem certeza absoluta?</h4>
                <p className="text-xs text-rose-300">Ação irreversível de exclusão de dados</p>
              </div>
            </div>

            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-slate-300 space-y-1.5">
              <p>Você está prestes a excluir:</p>
              <ul className="list-disc list-inside text-rose-200 font-medium space-y-0.5">
                <li>{transactions.length} transação(ões) cadastradas</li>
                <li>{goals.length} meta(s) e wishlist</li>
                <li>Todos os logs de auditoria e registros do banco</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                Para confirmar, digite <strong className="text-rose-400 tracking-wider">ZERAR</strong> no campo abaixo:
              </label>
              <input
                type="text"
                value={confirmationWord}
                onChange={(e) => setConfirmationWord(e.target.value.toUpperCase())}
                placeholder="Digite ZERAR"
                className="w-full px-3 py-2.5 bg-slate-950 border border-rose-500/40 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-rose-400 uppercase tracking-widest text-center"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setConfirmationWord('');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 font-medium text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmationWord !== 'ZERAR' || isResetting}
                onClick={handleReset}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 ${
                  confirmationWord === 'ZERAR' && !isResetting
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
                    : 'bg-rose-950/50 text-rose-400/40 border border-rose-900/40 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Apagando...' : 'Confirmar e Zerar Tudo'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
