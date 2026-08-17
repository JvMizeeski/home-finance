import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, GoalItem, AuditLog, SupabaseConfig } from '../types';
import { useAuth } from './AuthContext';
import { getSupabase, testSupabaseConnection } from '../lib/supabase';
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
      url: localStorage.getItem('supabase_url') || '',
      anonKey: localStorage.getItem('supabase_anon_key') || '',
      isConnected: false,
      lastSync: undefined
    };
  });

  const setSupabaseConfig = (cfg: SupabaseConfig) => {
    setSupabaseConfigState(cfg);
    if (cfg.url) localStorage.setItem('supabase_url', cfg.url);
    else localStorage.removeItem('supabase_url');
    if (cfg.anonKey) localStorage.setItem('supabase_anon_key', cfg.anonKey);
    else localStorage.removeItem('supabase_anon_key');
  };

  // Fetch initial data from /api/data (with Supabase fallback or merge)
  const refreshData = useCallback(async () => {
    try {
      // 1. Try fetching from the backend API
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setGoals(data.goals || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.warn("Backend fetch failed, checking Supabase/LocalStorage", e);
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
    const payload = {
      ...txData,
      createdBy: currentUser.name
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { transaction, log } = await res.json();
        setTransactions(prev => [transaction, ...prev]);
        if (log) setAuditLogs(prev => [log, ...prev]);
        return transaction;
      }
    } catch (err) {
      console.error("API error adding transaction", err);
    }

    // Fallback local creation
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.name
    };
    setTransactions(prev => [newTx, ...prev]);

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entityType: 'transaction',
      entityId: newTx.id,
      action: 'create',
      userName: currentUser.name,
      userAvatar: currentUser.avatarColor,
      details: `Adicionou ${newTx.type === 'income' ? 'receita' : 'despesa'} '${newTx.description}' de R$ ${newTx.amount.toFixed(2)} (${newTx.frequency})`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return newTx;
  };

  // Update Transaction
  const updateTransaction = async (id: string, txData: Partial<Transaction>): Promise<Transaction> => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txData, modifiedBy: currentUser.name })
      });
      if (res.ok) {
        const { transaction, log } = await res.json();
        setTransactions(prev => prev.map(t => t.id === id ? transaction : t));
        if (log) setAuditLogs(prev => [log, ...prev]);
        return transaction;
      }
    } catch (e) {
      console.error(e);
    }

    // Fallback
    let updatedTx: Transaction | undefined;
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        updatedTx = { ...t, ...txData, updatedAt: new Date().toISOString(), lastModifiedBy: currentUser.name };
        return updatedTx;
      }
      return t;
    }));

    if (updatedTx) {
      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        entityType: 'transaction',
        entityId: id,
        action: 'update',
        userName: currentUser.name,
        userAvatar: currentUser.avatarColor,
        details: `Atualizou a transação '${updatedTx.description}' (R$ ${updatedTx.amount.toFixed(2)})`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newLog, ...prev]);
      return updatedTx;
    }
    throw new Error("Transação não encontrada");
  };

  // Delete Transaction
  const deleteTransaction = async (id: string): Promise<boolean> => {
    const tx = transactions.find(t => t.id === id);
    try {
      const res = await fetch(`/api/transactions/${id}?user=${encodeURIComponent(currentUser.name)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(prev => prev.filter(t => t.id !== id));
        if (data.log) setAuditLogs(prev => [data.log, ...prev]);
        return true;
      }
    } catch (e) {
      console.error(e);
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
        timestamp: new Date().toISOString()
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
    const payload = {
      ...goalData,
      createdBy: currentUser.name,
      contributions: goalData.currentAmount > 0 ? [{
        id: `c_${Date.now()}`,
        amount: goalData.currentAmount,
        date: new Date().toISOString().slice(0, 10),
        user: currentUser.name,
        notes: "Aporte inicial na criação da meta"
      }] : []
    };

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const { goal, log } = await res.json();
        setGoals(prev => [goal, ...prev]);
        if (log) setAuditLogs(prev => [log, ...prev]);
        return goal;
      }
    } catch (e) {
      console.error(e);
    }

    const newGoal: GoalItem = {
      ...goalData,
      id: `goal_${Date.now()}`,
      contributions: payload.contributions,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name
    };
    setGoals(prev => [newGoal, ...prev]);

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entityType: 'goal',
      entityId: newGoal.id,
      action: 'create',
      userName: currentUser.name,
      userAvatar: currentUser.avatarColor,
      details: `Criou o objetivo '${newGoal.title}' (Meta: R$ ${newGoal.targetAmount.toFixed(2)})`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return newGoal;
  };

  // Update Goal
  const updateGoal = async (id: string, goalData: Partial<GoalItem>): Promise<GoalItem> => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goalData, modifiedBy: currentUser.name })
      });
      if (res.ok) {
        const { goal, log } = await res.json();
        setGoals(prev => prev.map(g => g.id === id ? goal : g));
        if (log) setAuditLogs(prev => [log, ...prev]);
        return goal;
      }
    } catch (e) {
      console.error(e);
    }

    let updated: GoalItem | undefined;
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        updated = { ...g, ...goalData };
        return updated;
      }
      return g;
    }));
    return updated!;
  };

  // Delete Goal
  const deleteGoal = async (id: string): Promise<boolean> => {
    const goal = goals.find(g => g.id === id);
    try {
      const res = await fetch(`/api/goals/${id}?user=${encodeURIComponent(currentUser.name)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(prev => prev.filter(g => g.id !== id));
        if (data.log) setAuditLogs(prev => [data.log, ...prev]);
        return true;
      }
    } catch (e) {
      console.error(e);
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
        timestamp: new Date().toISOString()
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
      simulateSparkSync
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
