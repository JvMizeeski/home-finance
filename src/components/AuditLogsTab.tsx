import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  Users, 
  Sparkles, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  CircleDollarSign, 
  Calendar,
  Filter,
  ShieldCheck
} from 'lucide-react';

export const AuditLogsTab: React.FC = () => {
  const { auditLogs } = useData();
  const { currentUser } = useAuth();
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (selectedUserFilter !== 'all' && log.userName !== selectedUserFilter) return false;
    if (selectedActionFilter !== 'all' && log.action !== selectedActionFilter) return false;
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Novo Cadastro', icon: PlusCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'update':
        return { label: 'Edição', icon: Edit3, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'delete':
        return { label: 'Exclusão', icon: Trash2, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'spark_sync':
        return { label: 'Google Spark (Planilha)', icon: Sparkles, color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' };
      case 'goal_complete':
        return { label: 'Meta Realizada', icon: CheckCircle, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'goal_contribute':
        return { label: 'Aporte / Economia', icon: CircleDollarSign, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      default:
        return { label: 'Ação', icon: History, color: 'text-slate-300 bg-white/10 border-white/10' };
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Info */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 backdrop-blur-md">
                Auditoria & Histórico do Casal
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Registro Transparente de Todas as Modificações
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Cada transação, alteração de status ou sincronização da planilha fica registrada com autor, data e hora.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-md">
              Total de <strong className="text-white font-bold">{auditLogs.length}</strong> eventos registrados
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-white/10 backdrop-blur-xl shadow-md text-xs">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* User Filter */}
          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            className="bg-slate-950/80 border border-white/10 text-slate-200 px-3 py-2 rounded-lg font-medium focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="all">👤 Todos os Usuários & Fontes</option>
            <option value="João">João</option>
            <option value="Esposa">Esposa</option>
            <option value="Google Spark (Planilha)">Google Spark (Planilha)</option>
          </select>

          {/* Action Filter */}
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="bg-slate-950/80 border border-white/10 text-slate-200 px-3 py-2 rounded-lg font-medium focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="all">⚡ Todas as Ações</option>
            <option value="create">Novos Cadastros</option>
            <option value="update">Edições / Alterações</option>
            <option value="delete">Exclusões</option>
            <option value="spark_sync">Sincronizações do Spark</option>
            <option value="goal_contribute">Aportes em Metas</option>
            <option value="goal_complete">Metas Concluídas</option>
          </select>

        </div>

        {(selectedUserFilter !== 'all' || selectedActionFilter !== 'all') && (
          <button
            onClick={() => {
              setSelectedUserFilter('all');
              setSelectedActionFilter('all');
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Logs Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-white/10 backdrop-blur-xl">
          <History className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">Nenhum registro encontrado</h4>
          <p className="text-xs text-slate-500 mt-1">Nenhum evento registrado com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl divide-y divide-white/5 overflow-hidden">
          {filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const BadgeIcon = badge.icon;

            return (
              <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className={`w-8 h-8 rounded-full ${log.userAvatar || 'bg-slate-700'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md mt-0.5`}>
                    {log.userName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.userName}</span>
                      
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-slate-200 text-xs sm:text-sm mt-1 font-medium leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right sm:text-right shrink-0 text-slate-400 font-mono text-[11px] pl-11 sm:pl-0">
                  {formatTimestamp(log.timestamp)}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
