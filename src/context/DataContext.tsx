import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, GoalItem, AuditLog, SupabaseConfig } from '../types';
import { useAuth } from './AuthContext';
import { getSupabase, testSupabaseConnection, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface DataContextType {
  transactions: Transaction[];
  goals: GoalItem[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  selectedMonth: string; // "YYYY-MM" or "all"
  setSelectedMonth: (month: string) => void;
  
  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Transaction>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<boolean>;
  toggleTransactionStatus: (id: string) => Promise<void>;
  
  // Goal actions
  addGoal: (goal: Omit<GoalItem, 'id' | 'createdAt' | 'createdBy' | 'contributions'>) => Promise<GoalItem>;
  updateGoal: (id: string, goal: Partial<GoalItem>) => Promise<GoalItem>;
  deleteGoal: (id: string) => Promise<boolean>;
  addGoalContribution: (goalId: string, amount: number, notes?: string) => Promise<void>;
  toggleGoalCompleted: (goalId: string) => Promise<void>;

  // Sincronização & Status
  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: (config: SupabaseConfig) => void;
  refreshData: () => Promise<void>;
  simulateSparkSync: (description: string, amount: number, type: 'expense' | 'income', category: string, frequency: 'fixed' | 'pontual', assignedTo: string) => Promise<void>;
  resetAllData: () => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Current month string formatted as "YYYY-MM"
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => {
    return {
      url: localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL,
      anonKey: localStorage.getItem('supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY,
      isConnected: true,
      lastSync: new Date().toLocaleTimeString('pt-BR')
    };
  });

  const setSupabaseConfig = (cfg: SupabaseConfig) => {
    setSupabaseConfigState(cfg);
    if (cfg.url) localStorage.setItem('supabase_url', cfg.url);
    else localStorage.removeItem('supabase_url');
    if (cfg.anonKey) localStorage.setItem('supabase_anon_key', cfg.anonKey);
    else localStorage.removeItem('supabase_anon_key');

    // Also persist to backend server
    fetch('/api/config/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cfg.url, anonKey: cfg.anonKey })
    }).catch(e => console.warn("Failed to persist config to server", e));
  };

  // Load configuration from backend if not in localStorage
  useEffect(() => {
    fetch('/api/config/supabase')
      .then(res => res.json())
      .then(data => {
        if (data.url && data.anonKey && (!supabaseConfig.url || !supabaseConfig.anonKey)) {
          setSupabaseConfig({
            url: data.url,
            anonKey: data.anonKey,
            isConnected: false
          });
        }
      })
      .catch(e => console.warn("Could not fetch server supabase config", e));
  }, []);

  // Direct Supabase synchronization
  const supabase = getSupabase();

  // Fetch initial data from Supabase (with fallback to backend API)
  const refreshData = useCallback(async () => {
    const client = getSupabase();
    if (client) {
      try {
        const [txRes, goalsRes, logsRes] = await Promise.all([
          client.from('transactions').select('*').order('date', { ascending: false }),
          client.from('goals').select('*').order('created_at', { ascending: false }),
          client.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50)
        ]);

        if (!txRes.error && txRes.data) {
          const mappedTxs: Transaction[] = txRes.data.map((row: any) => ({
            id: row.id,
            description: row.description || '',
            amount: Number(row.amount || 0),
            type: row.type || 'expense',
            frequency: row.frequency || 'pontual',
            category: row.category || 'Outros',
            date: row.date || new Date().toISOString().slice(0, 10),
            dueDate: row.due_date || row.dueDate || row.date,
            status: row.status || 'pending',
            paymentMethod: row.payment_method || row.paymentMethod || 'pix',
            assignedTo: row.assigned_to || row.assignedTo || 'shared',
            source: row.source || 'manual',
            notes: row.notes || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
            createdBy: row.created_by || row.createdBy || 'Usuário',
            lastModifiedBy: row.last_modified_by || row.lastModifiedBy
          }));
          setTransactions(mappedTxs);
        }

        if (!goalsRes.error && goalsRes.data) {
          const mappedGoals: GoalItem[] = goalsRes.data.map((row: any) => ({
            id: row.id,
            title: row.title || '',
            targetAmount: Number(row.target_amount ?? row.targetAmount ?? 0),
            currentAmount: Number(row.current_amount ?? row.currentAmount ?? 0),
            category: row.category || 'home',
            purchaseUrl: row.purchase_url || row.purchaseUrl,
            imageUrl: row.image_url || row.imageUrl,
            status: row.status || 'active',
            priority: row.priority || 'medium',
            targetDate: row.target_date || row.targetDate,
            notes: row.notes,
            contributions: row.contributions || [],
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            createdBy: row.created_by || row.createdBy || 'Usuário',
            completedAt: row.completed_at || row.completedAt
          }));
          setGoals(mappedGoals);
        }

        if (!logsRes.error && logsRes.data) {
          const mappedLogs: AuditLog[] = logsRes.data.map((row: any) => ({
            id: row.id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            action: row.action,
            userName: row.user_name,
            userAvatar: row.user_avatar || 'bg-blue-600',
            details: row.details,
            timestamp: row.timestamp,
            metadata: row.metadata
          }));
          setAuditLogs(mappedLogs);
        }

        if (!txRes.error) {
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch error, fallback to API:", err);
      }
    }

    // Fallback: try fetching from local backend API
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setGoals(data.goals || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.warn("Backend fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Periodic refresh every 10 seconds to catch Google Spark incoming updates instantly
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Test Supabase connection if configured
  useEffect(() => {
    if (supabaseConfig.url && supabaseConfig.anonKey) {
      testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey).then(res => {
        setSupabaseConfigState(prev => ({
          ...prev,
          isConnected: res.success,
          lastSync: new Date().toLocaleTimeString('pt-BR')
        }));
      });
    }
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  // Add Transaction
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Transaction> => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    
    const newTx: Transaction = {
      ...txData,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser.name
    };

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entityType: 'transaction',
      entityId: id,
      action: 'create',
      userName: currentUser.name,
      userAvatar: currentUser.avatarColor,
      details: `Adicionou ${newTx.type === 'income' ? 'receita' : 'despesa'} '${newTx.description}' de R$ ${newTx.amount.toFixed(2)} (${newTx.frequency})`,
      timestamp: now
    };

    // 1. Direct Supabase write
    const client = getSupabase();
    if (client) {
      try {
        // Dynamic robust insert: starts with all columns, strips any missing columns reported by Supabase schema cache
        let rowToInsert: Record<string, any> = {
          id: newTx.id,
          description: newTx.description,
          amount: newTx.amount,
          type: newTx.type,
          frequency: newTx.frequency || 'pontual',
          category: newTx.category,
          date: newTx.date,
          due_date: newTx.dueDate || newTx.date,
          status: newTx.status,
          payment_method: newTx.paymentMethod || 'pix',
          assigned_to: newTx.assignedTo || 'shared',
          source: newTx.source || 'manual',
          notes: newTx.notes || '',
          created_at: newTx.createdAt,
          updated_at: newTx.updatedAt,
          created_by: newTx.createdBy
        };

        let txError: any = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          const res = await client.from('transactions').insert([rowToInsert]);
          txError = res.error;
          if (!txError) break;

          // If a column is missing from Supabase table schema
          if (txError.code === 'PGRST204' || txError.message?.includes('column')) {
            const match = txError.message.match(/Could not find the '([^']+)' column/);
            if (match && match[1] && rowToInsert[match[1]] !== undefined) {
              const missingCol = match[1];
              console.warn(`Column '${missingCol}' not in Supabase transactions table. Omitting...`);
              delete rowToInsert[missingCol];
              continue;
            }
          }
          break;
        }

        if (txError) {
          console.error("Supabase insert error:", txError);
        }

        // Insert audit log safely
        try {
          await client.from('audit_logs').insert([{
            id: newLog.id,
            entity_type: newLog.entityType,
            entity_id: newLog.entityId,
            action: newLog.action,
            user_name: newLog.userName,
            user_avatar: newLog.userAvatar,
            details: newLog.details,
            timestamp: newLog.timestamp
          }]);
        } catch (logErr) {
          console.warn("Audit log insert warning:", logErr);
        }
      } catch (err: any) {
        console.error("Supabase insert exception:", err);
      }
    }

    // 2. Also send to local backend
    try {
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTx, createdBy: currentUser.name })
      }).catch(e => console.warn("Backend sync failed", e));
    } catch (e) {
      // ignore
    }

    setTransactions(prev => [newTx, ...prev]);
    setAuditLogs(prev => [newLog, ...prev]);
    return newTx;
  };

  // Update Transaction
  const updateTransaction = async (id: string, txData: Partial<Transaction>): Promise<Transaction> => {
    const now = new Date().toISOString();
    let updatedTx: Transaction | undefined;

    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        updatedTx = { ...t, ...txData, updatedAt: now, lastModifiedBy: currentUser.name };
        return updatedTx;
      }
      return t;
    }));

    if (!updatedTx) {
      throw new Error("Transação não encontrada");
    }

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entityType: 'transaction',
      entityId: id,
      action: 'update',
      userName: currentUser.name,
      userAvatar: currentUser.avatarColor,
      details: `Atualizou a transação '${updatedTx.description}' (R$ ${updatedTx.amount.toFixed(2)})`,
      timestamp: now
    };

    // 1. Direct Supabase update
    const client = getSupabase();
    if (client) {
      try {
        const updatePayload: any = {
          updated_at: now,
          last_modified_by: currentUser.name
        };
        if (txData.description !== undefined) updatePayload.description = txData.description;
        if (txData.amount !== undefined) updatePayload.amount = txData.amount;
        if (txData.type !== undefined) updatePayload.type = txData.type;
        if (txData.frequency !== undefined) updatePayload.frequency = txData.frequency;
        if (txData.category !== undefined) updatePayload.category = txData.category;
        if (txData.date !== undefined) updatePayload.date = txData.date;
        if (txData.dueDate !== undefined) updatePayload.due_date = txData.dueDate;
        if (txData.status !== undefined) updatePayload.status = txData.status;
        if (txData.paymentMethod !== undefined) updatePayload.payment_method = txData.paymentMethod;
        if (txData.assignedTo !== undefined) updatePayload.assigned_to = txData.assignedTo;
        if (txData.notes !== undefined) updatePayload.notes = txData.notes;

        await client.from('transactions').update(updatePayload).eq('id', id);

        await client.from('audit_logs').insert([{
          id: newLog.id,
          entity_type: newLog.entityType,
          entity_id: newLog.entityId,
          action: newLog.action,
          user_name: newLog.userName,
          user_avatar: newLog.userAvatar,
          details: newLog.details,
          timestamp: newLog.timestamp
        }]);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    // 2. Local backend update
    try {
      fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txData, modifiedBy: currentUser.name })
      }).catch(e => console.warn("Backend update failed", e));
    } catch (e) {
      // ignore
    }

    setAuditLogs(prev => [newLog, ...prev]);
    return updatedTx;
  };

  // Delete Transaction
  const deleteTransaction = async (id: string): Promise<boolean> => {
    const tx = transactions.find(t => t.id === id);
    const now = new Date().toISOString();

    // 1. Direct Supabase delete
    const client = getSupabase();
    if (client) {
      try {
        await client.from('transactions').delete().eq('id', id);
        if (tx) {
          await client.from('audit_logs').insert([{
            id: `log_${Date.now()}`,
            entity_type: 'transaction',
            entity_id: id,
            action: 'delete',
            user_name: currentUser.name,
            user_avatar: currentUser.avatarColor,
            details: `Excluiu a transação '${tx.description}' de R$ ${tx.amount.toFixed(2)}`,
            timestamp: now
          }]);
        }
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    // 2. Local backend delete
    try {
      fetch(`/api/transactions/${id}?user=${encodeURIComponent(currentUser.name)}`, {
        method: 'DELETE'
      }).catch(e => console.warn("Backend delete failed", e));
    } catch (e) {
      // ignore
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    if (tx) {
      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        entityType: 'transaction',
        entityId: id,
        action: 'delete',
        userName: currentUser.name,
        userAvatar: currentUser.avatarColor,
        details: `Excluiu a transação '${tx.description}' de R$ ${tx.amount.toFixed(2)}`,
        timestamp: now
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    return true;
  };

  // Toggle status paid / pending
  const toggleTransactionStatus = async (id: string): Promise<void> => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const nextStatus = tx.status === 'paid' ? 'pending' : 'paid';
    await updateTransaction(id, { status: nextStatus });
  };

  // Add Goal
  const addGoal = async (goalData: Omit<GoalItem, 'id' | 'createdAt' | 'createdBy' | 'contributions'>): Promise<GoalItem> => {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const contributions = goalData.currentAmount > 0 ? [{
      id: `c_${Date.now()}`,
      amount: goalData.currentAmount,
      date: now.slice(0, 10),
      user: currentUser.name,
      notes: "Aporte inicial na criação da meta"
    }] : [];

    const newGoal: GoalItem = {
      ...goalData,
      id,
      contributions,
      createdAt: now,
      createdBy: currentUser.name
    };

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entityType: 'goal',
      entityId: id,
      action: 'create',
      userName: currentUser.name,
      userAvatar: currentUser.avatarColor,
      details: `Criou o objetivo '${newGoal.title}' (Meta: R$ ${newGoal.targetAmount.toFixed(2)})`,
      timestamp: now
    };

    // 1. Direct Supabase write
    const client = getSupabase();
    if (client) {
      try {
        let goalRowToInsert: Record<string, any> = {
          id: newGoal.id,
          title: newGoal.title,
          target_amount: newGoal.targetAmount,
          current_amount: newGoal.currentAmount,
          category: newGoal.category,
          purchase_url: newGoal.purchaseUrl || null,
          image_url: newGoal.imageUrl || null,
          status: newGoal.status,
          priority: newGoal.priority || 'medium',
          target_date: newGoal.targetDate || null,
          notes: newGoal.notes || null,
          contributions: newGoal.contributions,
          created_at: newGoal.createdAt,
          created_by: newGoal.createdBy
        };

        for (let attempt = 0; attempt < 5; attempt++) {
          const res = await client.from('goals').insert([goalRowToInsert]);
          if (!res.error) break;
          if (res.error.code === 'PGRST204' || res.error.message?.includes('column')) {
            const match = res.error.message.match(/Could not find the '([^']+)' column/);
            if (match && match[1] && goalRowToInsert[match[1]] !== undefined) {
              delete goalRowToInsert[match[1]];
              continue;
            }
          }
          break;
        }

        await client.from('audit_logs').insert([{
          id: newLog.id,
          entity_type: newLog.entityType,
          entity_id: newLog.entityId,
          action: newLog.action,
          user_name: newLog.userName,
          user_avatar: newLog.userAvatar,
          details: newLog.details,
          timestamp: newLog.timestamp
        }]);
      } catch (err) {
        console.warn("Supabase goal insert error:", err);
      }
    }

    // 2. Local backend sync
    try {
      fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      }).catch(e => console.warn("Backend goal sync failed", e));
    } catch (e) {
      // ignore
    }

    setGoals(prev => [newGoal, ...prev]);
    setAuditLogs(prev => [newLog, ...prev]);
    return newGoal;
  };

  // Update Goal
  const updateGoal = async (id: string, goalData: Partial<GoalItem>): Promise<GoalItem> => {
    const now = new Date().toISOString();
    let updated: GoalItem | undefined;

    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        updated = { ...g, ...goalData };
        return updated;
      }
      return g;
    }));

    if (!updated) {
      throw new Error("Goal not found");
    }

    // 1. Direct Supabase update
    const client = getSupabase();
    if (client) {
      try {
        const updatePayload: any = {};
        if (goalData.title !== undefined) updatePayload.title = goalData.title;
        if (goalData.targetAmount !== undefined) updatePayload.target_amount = goalData.targetAmount;
        if (goalData.currentAmount !== undefined) updatePayload.current_amount = goalData.currentAmount;
        if (goalData.category !== undefined) updatePayload.category = goalData.category;
        if (goalData.purchaseUrl !== undefined) updatePayload.purchase_url = goalData.purchaseUrl;
        if (goalData.imageUrl !== undefined) updatePayload.image_url = goalData.imageUrl;
        if (goalData.status !== undefined) updatePayload.status = goalData.status;
        if (goalData.priority !== undefined) updatePayload.priority = goalData.priority;
        if (goalData.targetDate !== undefined) updatePayload.target_date = goalData.targetDate;
        if (goalData.notes !== undefined) updatePayload.notes = goalData.notes;
        if (goalData.contributions !== undefined) updatePayload.contributions = goalData.contributions;
        if (goalData.completedAt !== undefined) updatePayload.completed_at = goalData.completedAt;

        await client.from('goals').update(updatePayload).eq('id', id);
      } catch (err) {
        console.warn("Supabase goal update error:", err);
      }
    }

    // 2. Local backend update
    try {
      fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goalData, modifiedBy: currentUser.name })
      }).catch(e => console.warn("Backend goal update failed", e));
    } catch (e) {
      // ignore
    }

    return updated;
  };

  // Delete Goal
  const deleteGoal = async (id: string): Promise<boolean> => {
    const goal = goals.find(g => g.id === id);
    const now = new Date().toISOString();

    // 1. Direct Supabase delete
    const client = getSupabase();
    if (client) {
      try {
        await client.from('goals').delete().eq('id', id);
        if (goal) {
          await client.from('audit_logs').insert([{
            id: `log_${Date.now()}`,
            entity_type: 'goal',
            entity_id: id,
            action: 'delete',
            user_name: currentUser.name,
            user_avatar: currentUser.avatarColor,
            details: `Excluiu o objetivo '${goal.title}'`,
            timestamp: now
          }]);
        }
      } catch (err) {
        console.warn("Supabase goal delete error:", err);
      }
    }

    // 2. Local backend delete
    try {
      fetch(`/api/goals/${id}?user=${encodeURIComponent(currentUser.name)}`, {
        method: 'DELETE'
      }).catch(e => console.warn("Backend goal delete failed", e));
    } catch (e) {
      // ignore
    }

    setGoals(prev => prev.filter(g => g.id !== id));
    if (goal) {
      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        entityType: 'goal',
        entityId: id,
        action: 'delete',
        userName: currentUser.name,
        userAvatar: currentUser.avatarColor,
        details: `Excluiu o objetivo '${goal.title}'`,
        timestamp: now
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    return true;
  };

  // Add Contribution to Goal
  const addGoalContribution = async (goalId: string, amount: number, notes?: string): Promise<void> => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newContribution = {
      id: `c_${Date.now()}`,
      amount,
      date: new Date().toISOString().slice(0, 10),
      user: currentUser.name,
      notes: notes || "Aporte para a meta"
    };

    const newCurrent = goal.currentAmount + amount;
    const isNowComplete = newCurrent >= goal.targetAmount;

    if (isNowComplete && goal.status !== 'completed') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }

    await updateGoal(goalId, {
      currentAmount: newCurrent,
      contributions: [...(goal.contributions || []), newContribution],
      status: isNowComplete ? 'completed' : goal.status,
      completedAt: isNowComplete ? new Date().toISOString() : goal.completedAt
    });

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entityType: 'goal',
      entityId: goalId,
      action: 'goal_contribute',
      userName: currentUser.name,
      userAvatar: currentUser.avatarColor,
      details: `Adicionou economia de R$ ${amount.toFixed(2)} para a meta '${goal.title}' (Total: R$ ${newCurrent.toFixed(2)} de R$ ${goal.targetAmount.toFixed(2)})`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Toggle Goal Completed / Wishlist acquired
  const toggleGoalCompleted = async (goalId: string): Promise<void> => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const willBeComplete = goal.status !== 'completed';
    if (willBeComplete) {
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch (e) {
        // ignore
      }
    }

    await updateGoal(goalId, {
      status: willBeComplete ? 'completed' : 'active',
      completedAt: willBeComplete ? new Date().toISOString() : undefined,
      currentAmount: willBeComplete ? Math.max(goal.currentAmount, goal.targetAmount) : goal.currentAmount
    });
  };

  // Simulate Google Spark Webhook Sync from the UI
  const simulateSparkSync = async (
    description: string,
    amount: number,
    type: 'expense' | 'income',
    category: string,
    frequency: 'fixed' | 'pontual',
    assignedTo: string
  ): Promise<void> => {
    const payload = {
      sender: "Google Spark (Planilha)",
      transactions: [{
        description,
        amount,
        type,
        frequency,
        category,
        assignedTo,
        status: "paid",
        date: new Date().toISOString().slice(0, 10),
        notes: "Enviado automaticamente pelo Google Spark via Planilha"
      }]
    };

    const res = await fetch('/api/sync/spark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      await refreshData();
    }
  };

  // Reset All Database Data (Wipe transactions, goals, logs)
  const resetAllData = async (): Promise<boolean> => {
    try {
      // 1. Call server wipe endpoint
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser.name })
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions([]);
        setGoals([]);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.warn("Error calling /api/reset:", e);
      setTransactions([]);
      setGoals([]);
      setAuditLogs([{
        id: `log_${Date.now()}`,
        entityType: 'system',
        action: 'delete',
        userName: currentUser.name,
        userAvatar: currentUser.avatarColor,
        details: 'Zerou todas as linhas e registros do banco de dados',
        timestamp: new Date().toISOString()
      }]);
    }

    // 2. If Supabase is connected, wipe remote Supabase tables as well
    const supabase = getSupabase(supabaseConfig.url, supabaseConfig.anonKey);
    if (supabase && supabaseConfig.isConnected) {
      try {
        await supabase.from('transactions').delete().neq('id', '0');
        await supabase.from('goal_contributions').delete().neq('id', '0');
        await supabase.from('goals').delete().neq('id', '0');
        await supabase.from('audit_logs').delete().neq('id', '0');
      } catch (err) {
        console.warn("Supabase wipe warning:", err);
      }
    }

    return true;
  };

  return (
    <DataContext.Provider value={{
      transactions,
      goals,
      auditLogs,
      isLoading,
      selectedMonth,
      setSelectedMonth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      toggleTransactionStatus,
      addGoal,
      updateGoal,
      deleteGoal,
      addGoalContribution,
      toggleGoalCompleted,
      supabaseConfig,
      setSupabaseConfig,
      refreshData,
      simulateSparkSync,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
