export type TransactionType = 'income' | 'expense';

export type BillFrequency = 'fixed' | 'pontual' | 'installment';

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'boleto';

export type TransactionStatus = 'paid' | 'pending';

export type GoalCategory = 'home' | 'personal_joao' | 'personal_rafaella' | 'travel' | 'emergency' | 'tech' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  role?: string;
  avatarColor: string;
  email?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  frequency: BillFrequency;
  category: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  assignedTo: string; // 'João', 'Rafaella', 'shared'
  source: 'manual' | 'google_spark' | 'supabase_sync' | 'import';
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  user: string;
  notes?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: GoalCategory;
  purchaseUrl?: string;
  imageUrl?: string;
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  targetDate?: string;
  notes?: string;
  contributions: GoalContribution[];
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'transaction' | 'goal' | 'fixed_bill' | 'system' | 'sync';
  entityId?: string;
  action: 'create' | 'update' | 'delete' | 'mark_paid' | 'goal_contribute' | 'goal_complete' | 'spark_sync' | 'supabase_sync';
  userName: string;
  userAvatar: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface CategoryInfo {
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  type: 'income' | 'expense' | 'both';
}
