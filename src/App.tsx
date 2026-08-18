import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Navigation, TabType } from './components/Navigation';
import { DashboardTab } from './components/DashboardTab';
import { TransactionsTab } from './components/TransactionsTab';
import { GoalsTab } from './components/GoalsTab';
import { SettingsTab } from './components/SettingsTab';
import { TransactionModal } from './components/modals/TransactionModal';
import { GoalModal } from './components/modals/GoalModal';
import { ContributionModal } from './components/modals/ContributionModal';
import { Transaction, GoalItem } from './types';

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
    <div className="h-screen h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-row font-sans relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Ambient Glow Orbs for Frosted Glass Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Desktop Left Sidebar (Fixed / Stays in place) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTx}
      />

      {/* Right Content Column (Independently scrollable) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden relative z-10">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-[1600px] mx-auto pb-24 md:pb-12">
          {/* Date/Profile Toolbar (moved out of a dedicated top header) */}
          <Header />

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

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
