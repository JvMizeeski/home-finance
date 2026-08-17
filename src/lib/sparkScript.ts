export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: FINANCASAL - SINCRONIZADOR AUTOMÁTICO DE PLANILHAS
 * =========================================================================
 * Instruções de Instalação:
 * 1. Na sua Planilha Google, vá em: Extensões > Apps Script
 * 2. Apague o código padrão e cole todo este arquivo.
 * 3. Altere a variável APP_API_URL abaixo com a URL da sua aplicação.
 * 4. Salve (Ctrl + S) e clique em "Executar" para autorizar.
 * 5. Volte para a planilha: Um menu "⚡ FinanCasal" aparecerá no topo!
 */

// URL do aplicativo FinanCasal (substitua pela sua URL da Cloud Run ou seu domínio)
const APP_API_URL = "https://SEU_APP_FINANCASAL.run.app/api/sync/spark";

// Token de segurança opcional configurado no .env
const SYNC_TOKEN = "minha_chave_secreta_spark";

/**
 * Cria o menu personalizado quando a planilha abre
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("⚡ FinanCasal")
    .addItem("Sincronizar Linha Selecionada", "syncSelectedRow")
    .addItem("Sincronizar Todas as Linhas Não Enviadas", "syncAllNewRows")
    .addSeparator()
    .addItem("Criar Cabeçalhos Padrão na Planilha", "setupSheetHeaders")
    .addToUi();
}

/**
 * Cria os cabeçalhos padrão na primeira aba da planilha caso esteja vazia
 */
function setupSheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = [
    "Data",
    "Descrição",
    "Valor (R$)",
    "Tipo (Gasto/Ganho)",
    "Frequência (Fixa/Pontual)",
    "Categoria",
    "Status (Pago/Pendente)",
    "Responsável (João/Esposa/Casal)",
    "Vencimento",
    "Sincronizado"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    SpreadsheetApp.getUi().alert("✅ Cabeçalhos configurados com sucesso! Agora você ou o Google Spark podem preencher as linhas.");
  } else {
    SpreadsheetApp.getUi().alert("A planilha já contém dados.");
  }
}

/**
 * Sincroniza a linha atualmente selecionada
 */
function syncSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rowIndex = sheet.getActiveCell().getRow();
  
  if (rowIndex <= 1) {
    SpreadsheetApp.getUi().alert("Por favor, selecione uma linha com dados (abaixo do cabeçalho).");
    return;
  }
  
  const rowData = sheet.getRange(rowIndex, 1, 1, 10).getValues()[0];
  const payload = formatRowToPayload(rowData);
  
  if (!payload.description || !payload.amount) {
    SpreadsheetApp.getUi().alert("A linha precisa conter pelo menos 'Descrição' e 'Valor'.");
    return;
  }
  
  const success = sendToApp([payload]);
  if (success) {
    sheet.getRange(rowIndex, 10).setValue("SIM (" + Utilities.formatDate(new Date(), "GMT-3", "dd/MM HH:mm") + ")");
    SpreadsheetApp.getUi().alert("✅ Linha sincronizada com sucesso e já visível no FinanCasal!");
  }
}

/**
 * Sincroniza todas as linhas que ainda não foram marcadas como sincronizadas
 */
function syncAllNewRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert("Nenhum dado encontrado para sincronizar.");
    return;
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  const itemsToSend = [];
  const rowsToUpdate = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const isSynced = String(row[9] || "").toUpperCase().startsWith("SIM");
    const desc = row[1];
    const amount = row[2];
    
    if (!isSynced && desc && amount) {
      itemsToSend.push(formatRowToPayload(row));
      rowsToUpdate.push(i + 2); // Linha física na planilha
    }
  }
  
  if (itemsToSend.length === 0) {
    SpreadsheetApp.getUi().alert("Todas as linhas já estão sincronizadas com o FinanCasal!");
    return;
  }
  
  const success = sendToApp(itemsToSend);
  if (success) {
    const nowStr = "SIM (" + Utilities.formatDate(new Date(), "GMT-3", "dd/MM HH:mm") + ")";
    rowsToUpdate.forEach(function(r) {
      sheet.getRange(r, 10).setValue(nowStr);
    });
    SpreadsheetApp.getUi().alert("🎉 " + itemsToSend.length + " transações foram sincronizadas em tempo real com o FinanCasal!");
  }
}

/**
 * Gatilho automático onEdit: Quando uma linha for preenchida, envia automaticamente
 */
function onEditTrigger(e) {
  // Você pode configurar um Acionador (Trigger) 'Ao Editar' no Apps Script
  // para sincronizar automaticamente quando o Google Spark inserir uma nova linha!
  try {
    const sheet = e.source.getActiveSheet();
    const row = e.range.getRow();
    if (row > 1) {
      // Pequeno delay ou verificação para evitar envio incompleto
      const rowData = sheet.getRange(row, 1, 1, 10).getValues()[0];
      if (rowData[1] && rowData[2] && !String(rowData[9]).startsWith("SIM")) {
        const payload = formatRowToPayload(rowData);
        if (sendToApp([payload])) {
          sheet.getRange(row, 10).setValue("SIM (" + Utilities.formatDate(new Date(), "GMT-3", "dd/MM HH:mm") + ")");
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Formata os campos da planilha no formato JSON esperado pela API do FinanCasal
 */
function formatRowToPayload(row) {
  let dateStr = "";
  if (row[0] instanceof Date) {
    dateStr = Utilities.formatDate(row[0], "GMT-3", "yyyy-MM-dd");
  } else if (row[0]) {
    dateStr = String(row[0]);
  } else {
    dateStr = Utilities.formatDate(new Date(), "GMT-3", "yyyy-MM-dd");
  }

  let dueStr = "";
  if (row[8] instanceof Date) {
    dueStr = Utilities.formatDate(row[8], "GMT-3", "yyyy-MM-dd");
  } else if (row[8]) {
    dueStr = String(row[8]);
  } else {
    dueStr = dateStr;
  }

  return {
    date: dateStr,
    description: String(row[1] || "").trim(),
    amount: Number(row[2]) || 0,
    type: String(row[3] || "gasto").toLowerCase().includes("ganho") ? "income" : "expense",
    frequency: String(row[4] || "pontual").toLowerCase().includes("fix") ? "fixed" : "pontual",
    category: String(row[5] || "Outros").trim(),
    status: String(row[6] || "pago").toLowerCase().includes("pend") ? "pending" : "paid",
    assignedTo: String(row[7] || "shared").trim(),
    dueDate: dueStr,
    source: "google_spark"
  };
}

/**
 * Faz a chamada HTTP POST para o endpoint do FinanCasal
 */
function sendToApp(items) {
  const payload = {
    sender: "Google Spark (Planilha)",
    token: SYNC_TOKEN,
    transactions: items
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(APP_API_URL, options);
    const code = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (code >= 200 && code < 300) {
      return true;
    } else {
      SpreadsheetApp.getUi().alert("Erro (" + code + ") ao enviar para FinanCasal: " + responseText);
      return false;
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert("Erro de conexão com o FinanCasal: " + e.message);
    return false;
  }
}
`;
