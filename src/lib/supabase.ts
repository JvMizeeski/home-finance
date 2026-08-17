import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction, GoalItem, AuditLog } from '../types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(url?: string, anonKey?: string): SupabaseClient | null {
  const finalUrl = url || localStorage.getItem('supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const finalKey = anonKey || localStorage.getItem('supabase_anon_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (!finalUrl || !finalKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(finalUrl, finalKey);
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  try {
    if (url && anonKey) {
      supabaseInstance = createClient(url, anonKey);
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', anonKey);
      return supabaseInstance;
    } else {
      supabaseInstance = null;
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      return null;
    }
  } catch (e) {
    console.error("Error setting Supabase client:", e);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string; tablesFound?: string[] }> {
  try {
    const client = createClient(url, key);
    // Attempt a light query
    const { data, error } = await client.from('transactions').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "transactions" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: "Conexão com Supabase autorizada com sucesso! Nota: As tabelas ainda não foram criadas. Clique em 'Copiar Script SQL' abaixo para criá-las no SQL Editor do Supabase.",
          tablesFound: []
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return {
      success: true,
      message: "Conexão estabelecida com sucesso e tabelas validadas!",
      tablesFound: ['transactions']
    };
  } catch (err: any) {
    return { success: false, message: `Falha na requisição: ${err.message || 'Verifique a URL e Chave Anon'}` };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- FINANCASAL - BANCO DE DADOS SUPABASE (GRATUITO)
-- Copie e cole este script no SQL Editor do seu projeto Supabase
-- e clique em "RUN".
-- ========================================================

-- 1. Tabela de Transações (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    frequency TEXT NOT NULL DEFAULT 'pontual' CHECK (frequency IN ('fixed', 'pontual', 'installment')),
    category TEXT NOT NULL DEFAULT 'Outros',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
    payment_method TEXT DEFAULT 'pix',
    assigned_to TEXT DEFAULT 'shared',
    source TEXT DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'Usuário',
    last_modified_by TEXT
);

-- 2. Tabela de Metas & Lista de Desejos (Wishlist)
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL DEFAULT 'home',
    purchase_url TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    target_date DATE,
    notes TEXT,
    contributions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'Usuário',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Tabela de Histórico e Auditoria de Ações (Logs de João & Esposa)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    action TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT DEFAULT 'bg-blue-600',
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB
);

-- 4. Habilitar Segurança por Linha (Row Level Security) e Políticas Abertas para Casal
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Total Transações Casal" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Metas Casal" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Logs Casal" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 5. Habilitar Realtime para atualização instantânea em múltiplos celulares/PCs
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
`;
