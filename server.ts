import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state (with initial seed data for demo)
let dbState = {
  users: [
    { id: "u_joao", name: "João", avatarColor: "bg-blue-600", email: "joao@email.com" },
    { id: "u_rafaella", name: "Rafaella", avatarColor: "bg-rose-500", email: "rafaella@email.com" }
  ],
  transactions: [
    {
      id: "tx_1",
      description: "Salário João",
      amount: 6500.00,
      type: "income",
      frequency: "fixed",
      category: "Salário",
      date: new Date().toISOString().slice(0, 7) + "-05",
      dueDate: new Date().toISOString().slice(0, 7) + "-05",
      status: "paid",
      paymentMethod: "transfer",
      assignedTo: "João",
      source: "manual",
      notes: "Salário mensal líquido",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      createdBy: "João"
    },
    {
      id: "tx_2",
      description: "Salário Rafaella",
      amount: 5800.00,
      type: "income",
      frequency: "fixed",
      category: "Salário",
      date: new Date().toISOString().slice(0, 7) + "-05",
      dueDate: new Date().toISOString().slice(0, 7) + "-05",
      status: "paid",
      paymentMethod: "transfer",
      assignedTo: "Rafaella",
      source: "manual",
      notes: "Salário mensal",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      createdBy: "Rafaella"
    },
    {
      id: "tx_3",
      description: "Aluguel & Condomínio",
      amount: 2800.00,
      type: "expense",
      frequency: "fixed",
      category: "Moradia",
      date: new Date().toISOString().slice(0, 7) + "-10",
      dueDate: new Date().toISOString().slice(0, 7) + "-10",
      status: "paid",
      paymentMethod: "boleto",
      assignedTo: "shared",
      source: "manual",
      notes: "Pago via app bancário",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      createdBy: "João"
    },
    {
      id: "tx_4",
      description: "Supermercado Mensal",
      amount: 1450.80,
      type: "expense",
      frequency: "pontual",
      category: "Alimentação",
      date: new Date().toISOString().slice(0, 7) + "-08",
      dueDate: new Date().toISOString().slice(0, 7) + "-08",
      status: "paid",
      paymentMethod: "credit_card",
      assignedTo: "shared",
      source: "google_spark",
      notes: "Importado via Google Spark da Planilha",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdBy: "Google Spark (Planilha)"
    },
    {
      id: "tx_5",
      description: "Energia Elétrica",
      amount: 235.40,
      type: "expense",
      frequency: "fixed",
      category: "Moradia",
      date: new Date().toISOString().slice(0, 7) + "-20",
      dueDate: new Date().toISOString().slice(0, 7) + "-20",
      status: "pending",
      paymentMethod: "pix",
      assignedTo: "shared",
      source: "manual",
      notes: "Vence dia 20",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      createdBy: "Rafaella"
    },
    {
      id: "tx_6",
      description: "Internet Fibra",
      amount: 129.90,
      type: "expense",
      frequency: "fixed",
      category: "Moradia",
      date: new Date().toISOString().slice(0, 7) + "-15",
      dueDate: new Date().toISOString().slice(0, 7) + "-15",
      status: "pending",
      paymentMethod: "credit_card",
      assignedTo: "João",
      source: "manual",
      notes: "Débito automático",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "João"
    },
    {
      id: "tx_7",
      description: "Jantar Restaurante",
      amount: 190.00,
      type: "expense",
      frequency: "pontual",
      category: "Lazer & Viagem",
      date: new Date().toISOString().slice(0, 7) + "-12",
      dueDate: new Date().toISOString().slice(0, 7) + "-12",
      status: "paid",
      paymentMethod: "credit_card",
      assignedTo: "shared",
      source: "manual",
      notes: "Jantar comemorativo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Rafaella"
    }
  ],
  goals: [
    {
      id: "goal_1",
      title: "Sofá Retrátil para Sala",
      targetAmount: 3200.00,
      currentAmount: 2400.00,
      category: "home",
      purchaseUrl: "https://www.mercadolivre.com.br",
      status: "active",
      priority: "high",
      targetDate: "2026-12-15",
      notes: "Modelo 3 lugares em tecido suede cinza",
      contributions: [
        { id: "c1", amount: 1200, date: "2026-06-01", user: "João", notes: "Economia do bônus" },
        { id: "c2", amount: 1200, date: "2026-07-01", user: "Rafaella", notes: "Aporte mensal" }
      ],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      createdBy: "Rafaella"
    },
    {
      id: "goal_2",
      title: "Air Fryer Grande 5.5L",
      targetAmount: 480.00,
      currentAmount: 480.00,
      category: "home",
      purchaseUrl: "https://www.amazon.com.br",
      status: "completed",
      priority: "medium",
      targetDate: "2026-07-20",
      notes: "Comprada na promoção",
      contributions: [
        { id: "c3", amount: 480, date: "2026-07-15", user: "João", notes: "Comprada e entregue" }
      ],
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      createdBy: "João",
      completedAt: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: "goal_3",
      title: "Fundo de Reserva de Emergência",
      targetAmount: 25000.00,
      currentAmount: 16500.00,
      category: "emergency",
      purchaseUrl: "",
      status: "active",
      priority: "high",
      targetDate: "2027-06-30",
      notes: "Meta de 6 meses de gastos fixos guardados no Tesouro Selic",
      contributions: [
        { id: "c4", amount: 10000, date: "2026-01-10", user: "João", notes: "Saldo inicial" },
        { id: "c5", amount: 6500, date: "2026-07-05", user: "Rafaella", notes: "Aporte conjunto" }
      ],
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
      createdBy: "João"
    },
    {
      id: "goal_4",
      title: "Cafeteira Espresso Automática",
      targetAmount: 950.00,
      currentAmount: 350.00,
      category: "personal_joao",
      purchaseUrl: "https://www.amazon.com.br",
      status: "active",
      priority: "low",
      targetDate: "2026-11-20",
      notes: "Para tomar café moído na hora nos fins de semana",
      contributions: [
        { id: "c6", amount: 350, date: "2026-08-01", user: "João", notes: "Primeiro aporte" }
      ],
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      createdBy: "João"
    }
  ],
  auditLogs: [
    {
      id: "log_1",
      entityType: "transaction",
      entityId: "tx_4",
      action: "spark_sync",
      userName: "Google Spark (Planilha)",
      userAvatar: "bg-emerald-600",
      details: "Sincronizou despesa 'Supermercado Mensal' de R$ 1.450,80 via API",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "log_2",
      entityType: "goal",
      entityId: "goal_2",
      action: "goal_complete",
      userName: "João",
      userAvatar: "bg-blue-600",
      details: "Marcou a meta 'Air Fryer Grande 5.5L' como Adquirida / Concluída",
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: "log_3",
      entityType: "transaction",
      entityId: "tx_5",
      action: "create",
      userName: "Rafaella",
      userAvatar: "bg-rose-500",
      details: "Cadastrou conta fixa 'Energia Elétrica' de R$ 235,40",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    transactionsCount: dbState.transactions.length,
    goalsCount: dbState.goals.length,
    logsCount: dbState.auditLogs.length,
    timestamp: new Date().toISOString()
  });
});

// GET all data in one payload
app.get("/api/data", (req, res) => {
  res.json(dbState);
});

// Transactions CRUD
app.get("/api/transactions", (req, res) => {
  res.json(dbState.transactions);
});

app.post("/api/transactions", (req, res) => {
  const data = req.body;
  const newTx = {
    id: data.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    description: data.description || "Sem descrição",
    amount: Number(data.amount) || 0,
    type: data.type || "expense",
    frequency: data.frequency || "pontual",
    category: data.category || "Outros",
    date: data.date || new Date().toISOString().slice(0, 10),
    dueDate: data.dueDate || data.date || new Date().toISOString().slice(0, 10),
    status: data.status || "pending",
    paymentMethod: data.paymentMethod || "pix",
    assignedTo: data.assignedTo || "shared",
    source: data.source || "manual",
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.createdBy || "Usuário"
  };

  dbState.transactions.unshift(newTx);

  // Add audit log
  const log = {
    id: `log_${Date.now()}`,
    entityType: "transaction",
    entityId: newTx.id,
    action: "create",
    userName: newTx.createdBy,
    userAvatar: newTx.createdBy === "Rafaella" ? "bg-rose-500" : newTx.createdBy === "João" ? "bg-blue-600" : "bg-emerald-600",
    details: `Adicionou ${newTx.type === "income" ? "receita" : "despesa"} '${newTx.description}' de R$ ${newTx.amount.toFixed(2)} (${newTx.frequency})`,
    timestamp: new Date().toISOString()
  };
  dbState.auditLogs.unshift(log);

  res.status(201).json({ transaction: newTx, log });
});

app.put("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  const index = dbState.transactions.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Transação não encontrada" });
  }

  const user = req.body.modifiedBy || req.body.userName || "Usuário";
  const oldTx = dbState.transactions[index];
  const updatedTx = {
    ...oldTx,
    ...req.body,
    id: oldTx.id,
    updatedAt: new Date().toISOString(),
    lastModifiedBy: user
  };

  dbState.transactions[index] = updatedTx;

  // Add audit log
  const log = {
    id: `log_${Date.now()}`,
    entityType: "transaction",
    entityId: id,
    action: "update",
    userName: user,
    userAvatar: user === "Rafaella" ? "bg-rose-500" : user === "João" ? "bg-blue-600" : "bg-indigo-600",
    details: `Editou transação '${updatedTx.description}' para R$ ${updatedTx.amount.toFixed(2)} (Status: ${updatedTx.status})`,
    timestamp: new Date().toISOString()
  };
  dbState.auditLogs.unshift(log);

  res.json({ transaction: updatedTx, log });
});

app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  const user = (req.query.user as string) || "Usuário";
  const tx = dbState.transactions.find(t => t.id === id);

  if (!tx) {
    return res.status(404).json({ error: "Transação não encontrada" });
  }

  dbState.transactions = dbState.transactions.filter(t => t.id !== id);

  // Add audit log
  const log = {
    id: `log_${Date.now()}`,
    entityType: "transaction",
    entityId: id,
    action: "delete",
    userName: user,
    userAvatar: user === "Rafaella" ? "bg-rose-500" : user === "João" ? "bg-blue-600" : "bg-gray-600",
    details: `Excluiu a transação '${tx.description}' de R$ ${tx.amount.toFixed(2)}`,
    timestamp: new Date().toISOString()
  };
  dbState.auditLogs.unshift(log);

  res.json({ success: true, log });
});

// Goals CRUD
app.get("/api/goals", (req, res) => {
  res.json(dbState.goals);
});

app.post("/api/goals", (req, res) => {
  const data = req.body;
  const newGoal = {
    id: data.id || `goal_${Date.now()}`,
    title: data.title || "Novo Objetivo",
    targetAmount: Number(data.targetAmount) || 0,
    currentAmount: Number(data.currentAmount) || 0,
    category: data.category || "home",
    purchaseUrl: data.purchaseUrl || "",
    status: data.status || "active",
    priority: data.priority || "medium",
    targetDate: data.targetDate || "",
    notes: data.notes || "",
    contributions: data.contributions || [],
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy || "Usuário"
  };

  dbState.goals.unshift(newGoal);

  const log = {
    id: `log_${Date.now()}`,
    entityType: "goal",
    entityId: newGoal.id,
    action: "create",
    userName: newGoal.createdBy,
    userAvatar: newGoal.createdBy === "Rafaella" ? "bg-rose-500" : newGoal.createdBy === "João" ? "bg-blue-600" : "bg-emerald-600",
    details: `Criou o objetivo/desejo '${newGoal.title}' (Meta: R$ ${newGoal.targetAmount.toFixed(2)})`,
    timestamp: new Date().toISOString()
  };
  dbState.auditLogs.unshift(log);

  res.status(201).json({ goal: newGoal, log });
});

app.put("/api/goals/:id", (req, res) => {
  const { id } = req.params;
  const index = dbState.goals.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Objetivo não encontrado" });
  }

  const user = req.body.modifiedBy || req.body.userName || "Usuário";
  const oldGoal = dbState.goals[index];
  const updatedGoal = {
    ...oldGoal,
    ...req.body,
    id: oldGoal.id
  };

  dbState.goals[index] = updatedGoal;

  const log = {
    id: `log_${Date.now()}`,
    entityType: "goal",
    entityId: id,
    action: updatedGoal.status === "completed" && oldGoal.status !== "completed" ? "goal_complete" : "update",
    userName: user,
    userAvatar: user === "Rafaella" ? "bg-rose-500" : user === "João" ? "bg-blue-600" : "bg-indigo-600",
    details: updatedGoal.status === "completed" && oldGoal.status !== "completed"
      ? `Marcou o objetivo '${updatedGoal.title}' como Adquirido / Concluído`
      : `Atualizou o objetivo '${updatedGoal.title}' (Progresso: R$ ${updatedGoal.currentAmount.toFixed(2)} de R$ ${updatedGoal.targetAmount.toFixed(2)})`,
    timestamp: new Date().toISOString()
  };
  dbState.auditLogs.unshift(log);

  res.json({ goal: updatedGoal, log });
});

app.delete("/api/goals/:id", (req, res) => {
  const { id } = req.params;
  const user = (req.query.user as string) || "Usuário";
  const goal = dbState.goals.find(g => g.id === id);

  if (!goal) {
    return res.status(404).json({ error: "Objetivo não encontrado" });
  }

  dbState.goals = dbState.goals.filter(g => g.id !== id);

  const log = {
    id: `log_${Date.now()}`,
    entityType: "goal",
    entityId: id,
    action: "delete",
    userName: user,
    userAvatar: user === "Rafaella" ? "bg-rose-500" : user === "João" ? "bg-blue-600" : "bg-gray-600",
    details: `Excluiu o objetivo '${goal.title}'`,
    timestamp: new Date().toISOString()
  };
  dbState.auditLogs.unshift(log);

  res.json({ success: true, log });
});

// Audit Logs
app.get("/api/logs", (req, res) => {
  res.json(dbState.auditLogs);
});

// Supabase Configuration Persistence (Get and Save)
let persistedSupabaseConfig = {
  url: process.env.SUPABASE_URL || "https://sicwxjvlxkjmzddzqkmi.supabase.co",
  anonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpY3d4anZseGtqbXpkZHpxa21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTY4OTYsImV4cCI6MjEwMjU3Mjg5Nn0.HEnyJOZr7C9hyZAD2M1Ze0PqA-LHn9fXHLlEhU4WbXQ"
};

app.get("/api/config/supabase", (req, res) => {
  res.json(persistedSupabaseConfig);
});

app.post("/api/config/supabase", (req, res) => {
  const { url, anonKey } = req.body;
  persistedSupabaseConfig = {
    url: url || "",
    anonKey: anonKey || ""
  };
  res.json({ success: true, config: persistedSupabaseConfig });
});

// Reset / Wipe All Database Rows
app.post("/api/reset", (req, res) => {
  const user = req.body.user || "Usuário";
  dbState.transactions = [];
  dbState.goals = [];
  dbState.auditLogs = [
    {
      id: `log_${Date.now()}`,
      entityType: "system",
      action: "delete",
      userName: user,
      userAvatar: "bg-rose-600",
      details: "Zerou todas as linhas e registros do banco de dados",
      timestamp: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    message: "Todas as tabelas foram zeradas com sucesso.",
    transactions: [],
    goals: [],
    auditLogs: dbState.auditLogs
  });
});

// ==========================================
// ⚡ GOOGLE SPARK & PLANILHAS WEBHOOK API
// ==========================================
// Endpoint for Google Sheets Apps Script / Google Spark integration
app.post("/api/sync/spark", (req, res) => {
  try {
    const payload = req.body;
    const author = payload.sender || payload.user || "Google Spark (Planilha)";
    
    // Support single item or batch array of rows
    const items = Array.isArray(payload.items) 
      ? payload.items 
      : Array.isArray(payload.transactions) 
      ? payload.transactions 
      : [payload];

    const added: any[] = [];

    for (const item of items) {
      if (!item || (!item.description && !item.amount && !item.descricao && !item.valor)) {
        continue;
      }

      const description = item.description || item.descricao || item.item || "Lançamento via Planilha";
      const rawAmount = item.amount !== undefined ? item.amount : item.valor !== undefined ? item.valor : 0;
      const amount = Math.abs(typeof rawAmount === "string" ? parseFloat(rawAmount.replace(/[^\d.,-]/g, '').replace(',', '.')) : Number(rawAmount)) || 0;
      
      const rawType = (item.type || item.tipo || "despesa").toLowerCase();
      const type = (rawType.includes("ganho") || rawType.includes("receita") || rawType.includes("income") || rawType.includes("salario") || (Number(rawAmount) > 0 && rawType === "entrada")) ? "income" : "expense";
      
      const rawFreq = (item.frequency || item.frequencia || item.tipo_conta || "pontual").toLowerCase();
      const frequency = (rawFreq.includes("fix") || rawFreq.includes("recorrente")) ? "fixed" : "pontual";

      const category = item.category || item.categoria || "Outros";
      const date = item.date || item.data || new Date().toISOString().slice(0, 10);
      const dueDate = item.dueDate || item.vencimento || date;
      const rawStatus = (item.status || item.situacao || "pago").toLowerCase();
      const status = (rawStatus.includes("pend") || rawStatus.includes("aberto") || rawStatus.includes("a pagar")) ? "pending" : "paid";
      const assignedTo = item.assignedTo || item.responsavel || item.quem || "shared";

      const newTx = {
        id: `spark_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        description,
        amount,
        type,
        frequency,
        category,
        date: String(date).slice(0, 10),
        dueDate: String(dueDate).slice(0, 10),
        status,
        paymentMethod: item.paymentMethod || item.forma_pagamento || "pix",
        assignedTo,
        source: "google_spark",
        notes: item.notes || item.observacoes || "Sincronizado automaticamente da Planilha Google Spark",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: author
      };

      dbState.transactions.unshift(newTx);
      added.push(newTx);
    }

    if (added.length > 0) {
      const log = {
        id: `log_${Date.now()}`,
        entityType: "transaction",
        entityId: added[0].id,
        action: "spark_sync",
        userName: author,
        userAvatar: "bg-emerald-600",
        details: `Sincronizou ${added.length} registro(s) via Google Spark / Planilha (${added.map(a => a.description).slice(0, 2).join(', ')}${added.length > 2 ? '...' : ''})`,
        timestamp: new Date().toISOString()
      };
      dbState.auditLogs.unshift(log);

      return res.status(200).json({
        success: true,
        message: `${added.length} registro(s) sincronizado(s) com sucesso em tempo real!`,
        syncedCount: added.length,
        items: added
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Nenhum dado válido encontrado para sincronizar no formato esperado."
      });
    }
  } catch (err: any) {
    console.error("Error in /api/sync/spark:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
