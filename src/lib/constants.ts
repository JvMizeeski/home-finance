import { CategoryInfo, UserProfile } from '../types';

export const DEFAULT_USERS: UserProfile[] = [
  { id: "u_joao", name: "João", avatarColor: "bg-blue-600", email: "joao@email.com" },
  { id: "u_rafaella", name: "Rafaella", avatarColor: "bg-rose-500", email: "rafaella@email.com" }
];

export const CATEGORIES: CategoryInfo[] = [
  { name: "Salário", iconName: "Wallet", color: "text-emerald-700", bgColor: "bg-emerald-50", type: "income" },
  { name: "Renda Extra", iconName: "TrendingUp", color: "text-teal-700", bgColor: "bg-teal-50", type: "income" },
  { name: "Investimentos", iconName: "PieChart", color: "text-cyan-700", bgColor: "bg-cyan-50", type: "income" },
  
  { name: "Moradia", iconName: "Home", color: "text-indigo-700", bgColor: "bg-indigo-50", type: "expense" },
  { name: "Alimentação", iconName: "Utensils", color: "text-amber-700", bgColor: "bg-amber-50", type: "expense" },
  { name: "Transporte", iconName: "Car", color: "text-blue-700", bgColor: "bg-blue-50", type: "expense" },
  { name: "Saúde & Farmácia", iconName: "HeartPulse", color: "text-rose-700", bgColor: "bg-rose-50", type: "expense" },
  { name: "Lazer & Viagem", iconName: "Palmtree", color: "text-purple-700", bgColor: "bg-purple-50", type: "expense" },
  { name: "Educação & Cursos", iconName: "GraduationCap", color: "text-sky-700", bgColor: "bg-sky-50", type: "expense" },
  { name: "Assinaturas & Serviços", iconName: "Tv", color: "text-pink-700", bgColor: "bg-pink-50", type: "expense" },
  { name: "Compras & Casa", iconName: "ShoppingBag", color: "text-orange-700", bgColor: "bg-orange-50", type: "expense" },
  { name: "Pets", iconName: "Dog", color: "text-lime-700", bgColor: "bg-lime-50", type: "expense" },
  { name: "Outros", iconName: "Tag", color: "text-gray-700", bgColor: "bg-gray-100", type: "both" }
];

export const PAYMENT_METHODS = [
  { id: "pix", label: "PIX", icon: "Zap" },
  { id: "credit_card", label: "Cartão de Crédito", icon: "CreditCard" },
  { id: "debit_card", label: "Cartão de Débito", icon: "CreditCard" },
  { id: "boleto", label: "Boleto Bancário", icon: "FileText" },
  { id: "transfer", label: "Transferência / TED", icon: "ArrowLeftRight" },
  { id: "cash", label: "Dinheiro em Espécie", icon: "Banknote" }
];

export const GOAL_CATEGORIES = [
  { id: "home", label: "Casa & Móveis", icon: "Home", color: "bg-indigo-100 text-indigo-800" },
  { id: "personal_joao", label: "Pessoal (João)", icon: "User", color: "bg-blue-100 text-blue-800" },
  { id: "personal_rafaella", label: "Pessoal (Rafaella)", icon: "UserCheck", color: "bg-rose-100 text-rose-800" },
  { id: "travel", label: "Viagem & Férias", icon: "Plane", color: "bg-amber-100 text-amber-800" },
  { id: "emergency", label: "Reserva de Emergência", icon: "ShieldCheck", color: "bg-emerald-100 text-emerald-800" },
  { id: "tech", label: "Eletrônicos & Tech", icon: "Laptop", color: "bg-purple-100 text-purple-800" },
  { id: "other", label: "Outros Objetivos", icon: "Star", color: "bg-gray-100 text-gray-800" }
];
