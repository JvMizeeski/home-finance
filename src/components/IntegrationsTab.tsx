import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SUPABASE_SQL_SCHEMA, testSupabaseConnection } from '../lib/supabase';
import { GOOGLE_APPS_SCRIPT_CODE } from '../lib/sparkScript';
import { 
  Database, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  FileSpreadsheet, 
  Send, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Layers, 
  Terminal,
  Zap,
  Info
} from 'lucide-react';

export const IntegrationsTab: React.FC = () => {
  const { supabaseConfig, setSupabaseConfig, simulateSparkSync, refreshData } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'supabase' | 'spark' | 'simulator'>('spark');
  
  // Supabase form
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(supabaseConfig.anonKey || '');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; loading?: boolean } | null>(null);
  
  // Copy feedback states
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Simulator State
  const [simDesc, setSimDesc] = useState('Supermercado Extra');
  const [simAmount, setSimAmount] = useState('285.50');
  const [simType, setSimType] = useState<'expense' | 'income'>('expense');
  const [simCategory, setSimCategory] = useState('Alimentação');
  const [simFreq, setSimFreq] = useState<'pontual' | 'fixed'>('pontual');
  const [simAssigned, setSimAssigned] = useState('Casal');
  const [simSuccess, setSimSuccess] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setTestResult({ success: false, message: 'Por favor, informe a URL e a Chave Anon do Supabase.' });
      return;
    }
    setTestResult({ loading: true });
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setTestResult(res);
    if (res.success) {
      setSupabaseConfig({
        url: supabaseUrl.trim(),
        anonKey: supabaseKey.trim(),
        isConnected: true,
        lastSync: new Date().toLocaleTimeString('pt-BR')
      });
    }
  };

  const handleRunSimulator = async () => {
    setSimSuccess(false);
    await simulateSparkSync(
      simDesc,
      Number(simAmount) || 0,
      simType,
      simCategory,
      simFreq,
      simAssigned
    );
    setSimSuccess(true);
    setTimeout(() => setSimSuccess(false), 4000);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://seu-app.run.app';
  const webhookUrl = `${currentOrigin}/api/sync/spark`;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 backdrop-blur-md">
                Integrações & Sincronização
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Google Spark, Planilhas & Banco de Dados Supabase
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Conecte sua planilha automatizada com o Google Spark e armazene tudo na nuvem com Supabase.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            id="tab-btn-spark"
            onClick={() => setActiveSubTab('spark')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'spark'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md backdrop-blur-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            1. Guia Google Spark & Planilhas (Apps Script)
          </button>

          <button
            id="tab-btn-supabase"
            onClick={() => setActiveSubTab('supabase')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'supabase'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md backdrop-blur-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            2. Configurar Supabase Gratuito (SQL Schema)
          </button>

          <button
            id="tab-btn-simulator"
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'simulator'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-md backdrop-blur-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-blue-400" />
            3. Simulador de Webhook em Tempo Real
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SUB-TAB 1: GOOGLE SPARK & PLANILHAS APPS SCRIPT         */}
      {/* ======================================================= */}
      {activeSubTab === 'spark' && (
        <div className="space-y-6">
          
          {/* Flow Visualizer */}
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-amber-950/30 p-5 rounded-2xl border border-amber-500/20 backdrop-blur-xl">
            <h3 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Como Funciona o Fluxo Automatizado:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mt-3">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="font-bold text-white mb-1">1. Mensagem Simples</div>
                <p className="text-slate-300 text-[11px]">Você envia uma mensagem para o seu Spark (ex: <em>"Gastei 50 mercado João"</em>).</p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="font-bold text-white mb-1">2. Anota na Planilha</div>
                <p className="text-slate-300 text-[11px]">O Google Spark processa e insere a linha na sua Planilha Google padronizada.</p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="font-bold text-white mb-1">3. Apps Script Dispara</div>
                <p className="text-slate-300 text-[11px]">O script envia a nova linha instantaneamente via POST para o Webhook deste App.</p>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 backdrop-blur-md">
                <div className="font-bold text-emerald-400 mb-1">4. Dashboard Atualizado!</div>
                <p className="text-slate-300 text-[11px]">Os valores, métricas e gráficos atualizam em tempo real para você e sua esposa.</p>
              </div>
            </div>
          </div>

          {/* Webhook URL Box */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>Sua URL de Webhook da API para o Apps Script:</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">Ativo & Pronto</span>
            </h3>
            <p className="text-xs text-slate-300">
              Esta é a URL que o Google Apps Script na sua planilha chamará para enviar os dados:
            </p>
            <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
              <span className="flex-1">{webhookUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[11px] font-sans flex items-center gap-1 transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-white text-sm">
              Passo a Passo de Configuração no Google Developer / Apps Script:
            </h3>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
              <li className="leading-relaxed">
                Abra sua <strong>Planilha Google</strong> (ou crie uma nova em <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-400 font-semibold underline">sheets.new</a>).
              </li>
              <li className="leading-relaxed">
                No menu superior da planilha, clique em: <strong>Extensões &gt; Apps Script</strong>.
              </li>
              <li className="leading-relaxed">
                Apague qualquer código existente no editor e <strong>cole o código pronto abaixo</strong>.
              </li>
              <li className="leading-relaxed">
                Substitua a linha <code className="bg-white/10 text-amber-300 px-1 py-0.5 rounded">const APP_API_URL = "..."</code> pela sua URL acima.
              </li>
              <li className="leading-relaxed">
                Clique no ícone de <strong>Salvar (💾)</strong> e depois no botão <strong>Executar</strong> na função <code className="bg-white/10 text-amber-300 px-1 py-0.5 rounded">onOpen</code> para conceder permissão.
              </li>
              <li className="leading-relaxed">
                Pronto! Volte na planilha: Um menu <strong>"⚡ FinanCasal"</strong> estará disponível no topo, permitindo sincronizar linhas avulsas, lotes ou disparar automaticamente no evento <code className="bg-white/10 text-amber-300 px-1 py-0.5 rounded">onEdit</code>!
              </li>
            </ol>

            {/* Apps Script Code Box with Copy */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-slate-400 font-semibold">Código: GoogleAppsScript_FinanCasal.js</span>
                <button
                  id="btn-copy-apps-script"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-amber-900/30 active:scale-95"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Código Copiado com Sucesso!' : 'Copiar Código Completo do Apps Script'}
                </button>
              </div>

              <div className="bg-slate-950/80 border border-white/10 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>

          </div>

          {/* Model of Sheet Columns */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <h3 className="font-bold text-white text-sm mb-2">
              Estrutura de Colunas Recomendada para a Planilha:
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              O script cria automaticamente essas colunas caso você clique em <em>"Criar Cabeçalhos Padrão"</em> no menu da planilha:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/10 text-slate-200 font-bold">
                  <tr>
                    <th className="p-2 border-r border-white/10">A: Data</th>
                    <th className="p-2 border-r border-white/10">B: Descrição</th>
                    <th className="p-2 border-r border-white/10">C: Valor (R$)</th>
                    <th className="p-2 border-r border-white/10">D: Tipo</th>
                    <th className="p-2 border-r border-white/10">E: Frequência</th>
                    <th className="p-2 border-r border-white/10">F: Categoria</th>
                    <th className="p-2 border-r border-white/10">G: Status</th>
                    <th className="p-2">H: Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="p-2 font-mono">2026-08-17</td>
                    <td className="p-2 font-semibold text-white">Mercado Pão de Açúcar</td>
                    <td className="p-2 font-semibold text-emerald-400 font-mono">340,50</td>
                    <td className="p-2">Gasto</td>
                    <td className="p-2">Pontual</td>
                    <td className="p-2">Alimentação</td>
                    <td className="p-2">Pago</td>
                    <td className="p-2">Casal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* SUB-TAB 2: CONFIGURAR SUPABASE GRATUITO                 */}
      {/* ======================================================= */}
      {activeSubTab === 'supabase' && (
        <div className="space-y-6">
          
          {/* Supabase Connection Setup Box */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Configurar Credenciais do Supabase
              </h3>
              {supabaseConfig.isConnected && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conectado com Sucesso
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL do Projeto Supabase
                </label>
                <input
                  type="text"
                  placeholder="https://exemplo.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-hidden focus:border-emerald-500 placeholder:text-slate-500 backdrop-blur-md"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Encontrado em: Project Settings &gt; API &gt; Project URL
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chave Pública Anon (anon / public)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-hidden focus:border-emerald-500 placeholder:text-slate-500 backdrop-blur-md"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Encontrado em: Project Settings &gt; API &gt; Project API keys (anon public)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleTestSupabase}
                disabled={testResult?.loading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 active:scale-95"
              >
                {testResult?.loading ? 'Testando Conexão...' : 'Salvar & Testar Conexão Supabase'}
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1"
              >
                <span>Acessar Painel do Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {testResult && !testResult.loading && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 backdrop-blur-md ${
                testResult.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testResult.success ? 'Tudo Pronto!' : 'Aviso de Conexão'}</div>
                  <p className="mt-0.5">{testResult.message}</p>
                </div>
              </div>
            )}

          </div>

          {/* SQL Generator & Copy Box */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Script SQL Completo para o Supabase (1-Clique)
                </h3>
                <p className="text-xs text-slate-300">
                  Cria automaticamente as tabelas <code className="font-mono text-emerald-400">transactions</code>, <code className="font-mono text-emerald-400">goals</code>, <code className="font-mono text-emerald-400">audit_logs</code> e habilita replicação Realtime.
                </p>
              </div>

              <button
                id="btn-copy-sql-schema"
                onClick={handleCopySql}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/10 shrink-0 active:scale-95"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'SQL Copiado com Sucesso!' : 'Copiar Script SQL'}
              </button>
            </div>

            <div className="bg-slate-950/80 border border-white/10 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-slate-300 space-y-1">
              <strong className="text-white">Como executar no Supabase:</strong>
              <p>1. Acesse seu projeto no Supabase &gt; Menu lateral <strong>SQL Editor</strong>.</p>
              <p>2. Clique em <strong>New Query</strong>, cole o código acima e clique no botão verde <strong>Run (▶)</strong>.</p>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* SUB-TAB 3: SIMULADOR DE WEBHOOK DO SPARK AO VIVO       */}
      {/* ======================================================= */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 backdrop-blur-md">
                  Sandbox de Teste
                </span>
              </div>
              <h3 className="font-bold text-white text-base mt-1">
                Simulador de Envio em Tempo Real do Google Spark / Planilha
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Simule exatamente como o Google Spark envia um novo gasto ou ganho da planilha para o aplicativo.
              </p>
            </div>

            {/* Quick Test Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Item</label>
                <input
                  type="text"
                  value={simDesc}
                  onChange={(e) => setSimDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-blue-500 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-bold font-mono text-white focus:outline-hidden focus:border-blue-500 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="expense">Despesa (Gasto)</option>
                  <option value="income">Receita (Ganho)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <input
                  type="text"
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frequência</label>
                <select
                  value={simFreq}
                  onChange={(e) => setSimFreq(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="pontual">Pontual</option>
                  <option value="fixed">Fixa Mensal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável</label>
                <select
                  value={simAssigned}
                  onChange={(e) => setSimAssigned(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-hidden [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="Casal">Casal (Compartilhado)</option>
                  <option value="João">João</option>
                  <option value="Esposa">Esposa</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                id="btn-trigger-spark-sim"
                onClick={handleRunSimulator}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                Disparar Webhook do Spark Agora
              </button>

              {simSuccess && (
                <div className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Registro inserido em tempo real! Confira na aba 'Visão Geral' ou 'Transações'.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
