import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardTab } from './components/DashboardTab';
import { TransactionsTab } from './components/TransactionsTab';
import { GoalsTab } from './components/GoalsTab';
import { AuditLogsTab } from './components/AuditLogsTab';
import { IntegrationsTab } from './components/IntegrationsTab';
import { TransactionModal } from './components/modals/TransactionModal';
import { GoalModal } from './components/modals/GoalModal';
import { ContributionModal } from './components/modals/ContributionModal';
import { Transaction, GoalItem } from './types';
import { Plus } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);

  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [contribGoal, setContribGoal] = useState<GoalItem | null>(null);

  const { addTransaction, updateTransaction, addGoal, updateGoal, addGoalContribution } = useData();

  // Transaction Handlers
  const handleOpenNewTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = async (txData: any) => {
    if (editingTx) {
      await updateTransaction(editingTx.id, txData);
    } else {
      await addTransaction(txData);
    }
  };

  // Goal Handlers
  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: GoalItem) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (goalData: any) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
    } else {
      await addGoal(goalData);
    }
  };

  const handleOpenContribution = (goal: GoalItem) => {
    setContribGoal(goal);
    setIsContribModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Ambient Glow Orbs for Frosted Glass Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[55%] h-[55%] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[20%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Header */}
      <Header
        onOpenNewTransaction={handleOpenNewTx}
        onOpenIntegrations={() => setActiveTab('integrations')}
      />

      {/* Navigation Bars (Desktop Pills + Mobile Bottom Nav) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onOpenNewTransaction={handleOpenNewTx}
            onOpenNewGoal={handleOpenNewGoal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            onOpenNewTransaction={handleOpenNewTx}
            onEditTransaction={handleEditTx}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTab
            onOpenNewGoal={handleOpenNewGoal}
            onEditGoal={handleEditGoal}
            onAddContribution={handleOpenContribution}
          />
        )}

        {activeTab === 'logs' && (
          <AuditLogsTab />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsTab />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTx}
        editingTransaction={editingTx}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <ContributionModal
        isOpen={isContribModalOpen}
        onClose={() => setIsContribModalOpen(false)}
        goal={contribGoal}
        onContribute={addGoalContribution}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
