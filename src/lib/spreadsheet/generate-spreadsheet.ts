import type { DiagnosticInput, DiagnosticResult, BusinessClassification } from '@/types';
import { downloadBlob } from '@/lib/download';
import { generateInsights } from '@/lib/insights';
import { getChecklist } from '@/lib/checklist';

// ─── Paleta de cores (ARGB) ──────────────────────────────────────────────────
const C = {
  headerBg:     'FF1E3A5F',  // azul escuro (cabeçalhos principais)
  subHeaderBg:  'FF2D5986',  // azul médio (sub-cabeçalhos)
  headerText:   'FFFFFFFF',  // branco
  altRow:       'FFF5F7FA',  // cinza muito claro (linhas alternadas)
  inputBg:      'FFFFF9C4',  // amarelo claro (campos de entrada)
  resultBg:     'FFF0F0F0',  // cinza claro (células de resultado/fórmula)
  weekTotalBg:  'FFD9E8FB',  // azul claro (total semanal)
  monthTotalBg: 'FFB8D4F5',  // azul médio claro (total mensal)
  sectionBg:    'FFE8F0FE',  // azul bem claro (seção)
  greenBg:      'FFC6EFCE',  // verde claro (condicional positivo)
  greenText:    'FF1A7A3C',  // verde escuro
  yellowBg:     'FFFFEB9C',  // amarelo claro (condicional atenção)
  yellowText:   'FF8A6A00',  // amarelo escuro
  redBg:        'FFFFC7CE',  // vermelho claro (condicional negativo)
  redText:      'FF9C0006',  // vermelho escuro
  gray:         'FF888888',
  darkGray:     'FF333333',
  borderColor:  'FFCCCCCC',
};

// ─── Helpers de estilo ────────────────────────────────────────────────────────
function applyHeader(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell: any,
  bgColor = C.headerBg,
  fontSize = 11,
  align: 'left' | 'center' | 'right' = 'center',
) {
  cell.font  = { bold: true, color: { argb: C.headerText }, size: fontSize };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
  cell.alignment = { horizontal: align, vertical: 'middle', wrapText: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySection(cell: any, text: string) {
  cell.value = text;
  cell.font  = { bold: true, color: { argb: C.headerText }, size: 11 };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.subHeaderBg } };
  cell.alignment = { horizontal: 'left', vertical: 'middle' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyAltRow(row: any, cols: number, idx: number) {
  if (idx % 2 === 1) {
    for (let c = 1; c <= cols; c++) {
      row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }
  }
}

// Determina ARGB de badge de classificação baseado no level
function classificationColor(level: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    prejuizo:     { bg: C.redBg,    text: C.redText    },
    sobrevivendo: { bg: C.yellowBg, text: C.yellowText  },
    estavel:      { bg: 'FFFEEFA0', text: '886B2200'    },
    saudavel:     { bg: C.greenBg,  text: C.greenText   },
    escalavel:    { bg: 'FFBBD6FB', text: 'FF1A4F8A'    },
  };
  return map[level] ?? { bg: C.altRow, text: C.darkGray };
}

// Formata número como moeda BRL estático (para células de valor já calculado)
function brl(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

// ─── Função principal ─────────────────────────────────────────────────────────
export async function generateSpreadsheet(
  input:          DiagnosticInput,
  result:         DiagnosticResult,
  classification: BusinessClassification,
  businessName:   string,
) {
  const ExcelJSModule = await import('exceljs');
  // Dynamic import of a CJS module wraps it as { default: module.exports }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ExcelJS = (ExcelJSModule as any).default ?? ExcelJSModule;
  console.log('ExcelJS loaded:', !!ExcelJS, 'Workbook:', typeof ExcelJS?.Workbook);
  const workbook = new ExcelJS.Workbook();
  workbook.creator  = 'Raio-X do Negócio';
  workbook.created  = new Date();

  const insights = generateInsights(input, result, classification);

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 1 — DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  const dash = workbook.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: 'FF1E3A5F' } },
  });
  dash.getColumn(1).width = 30;
  dash.getColumn(2).width = 22;
  dash.getColumn(3).width = 28;
  dash.getColumn(4).width = 16;
  dash.getColumn(5).width = 16;
  dash.getColumn(6).width = 18;

  // — Título principal
  dash.mergeCells('A1:F1');
  const d1 = dash.getCell('A1');
  d1.value = `Raio-X do Negócio — ${businessName || 'Meu Negócio'}`;
  d1.font  = { bold: true, size: 16, color: { argb: C.headerText } };
  d1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  d1.alignment = { horizontal: 'center', vertical: 'middle' };
  dash.getRow(1).height = 32;

  // — Subtítulo/data
  dash.mergeCells('A2:F2');
  const d2 = dash.getCell('A2');
  d2.value = `Gerado em ${new Date().toLocaleDateString('pt-BR')} — Diagnóstico Financeiro para Varejo de Moda`;
  d2.font  = { size: 9, color: { argb: C.gray } };
  d2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  d2.alignment = { horizontal: 'center' };

  dash.getRow(3).height = 6; // espaço

  // ── SEÇÃO: CLASSIFICAÇÃO ──────────────────────────────────────────────────
  dash.mergeCells('A4:F4');
  applySection(dash.getCell('A4'), '  CLASSIFICAÇÃO DO NEGÓCIO');
  dash.getRow(4).height = 22;

  dash.mergeCells('A5:F5');
  const clsBadge = dash.getCell('A5');
  const clsColors = classificationColor(classification.level);
  clsBadge.value = `${classification.emoji}  ${classification.label.toUpperCase()}  —  ${classification.description}`;
  clsBadge.font  = { bold: true, size: 13, color: { argb: clsColors.text } };
  clsBadge.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: clsColors.bg } };
  clsBadge.alignment = { horizontal: 'center', vertical: 'middle' };
  dash.getRow(5).height = 28;

  dash.getRow(6).height = 6;

  // ── SEÇÃO: INDICADORES PRINCIPAIS ───────────────────────────────────────
  dash.mergeCells('A7:F7');
  applySection(dash.getCell('A7'), '  INDICADORES PRINCIPAIS');
  dash.getRow(7).height = 22;

  // Cabeçalho da tabela de indicadores
  const indHeaders = ['Indicador', 'Valor', 'Referência / Meta', 'Status', '', ''];
  indHeaders.forEach((h, i) => {
    const cell = dash.getRow(8).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  dash.getRow(8).height = 20;

  const lucroBom = result.lucroReal >= 0;
  const margemBom = result.margemLiquida >= 15;
  const margemWarn = result.margemLiquida >= 5 && result.margemLiquida < 15;

  const indicadores: Array<{
    label: string;
    value: string;
    ref: string;
    status: string;
    statusBg: string;
    statusText: string;
    valueBg?: string;
    valueText?: string;
  }> = [
    {
      label:      'Lucro Real',
      value:      brl(result.lucroReal),
      ref:        'Positivo = bom',
      status:     lucroBom ? '✓ Positivo' : '✗ Prejuízo',
      statusBg:   lucroBom ? C.greenBg : C.redBg,
      statusText: lucroBom ? C.greenText : C.redText,
      valueBg:    lucroBom ? C.greenBg : C.redBg,
      valueText:  lucroBom ? C.greenText : C.redText,
    },
    {
      label:      'Margem Líquida',
      value:      `${result.margemLiquida.toFixed(1)}%`,
      ref:        '> 15% = Saudável',
      status:     margemBom ? '✓ Saudável' : margemWarn ? '⚠ Atenção' : '✗ Baixa',
      statusBg:   margemBom ? C.greenBg : margemWarn ? C.yellowBg : C.redBg,
      statusText: margemBom ? C.greenText : margemWarn ? C.yellowText : C.redText,
      valueBg:    margemBom ? C.greenBg : margemWarn ? C.yellowBg : C.redBg,
      valueText:  margemBom ? C.greenText : margemWarn ? C.yellowText : C.redText,
    },
    {
      label:      'Ponto de Equilíbrio',
      value:      result.pontoEquilibrio === Infinity ? 'N/A' : brl(result.pontoEquilibrio),
      ref:        'Mínimo para cobrir custos',
      status:     input.faturamento >= result.pontoEquilibrio ? '✓ Acima do PE' : '✗ Abaixo do PE',
      statusBg:   input.faturamento >= result.pontoEquilibrio ? C.greenBg : C.redBg,
      statusText: input.faturamento >= result.pontoEquilibrio ? C.greenText : C.redText,
    },
    {
      label:      'Faturamento Necessário',
      value:      result.faturamentoNecessario === Infinity ? 'N/A' : brl(result.faturamentoNecessario),
      ref:        'Para cobrir tudo + pró-labore',
      status:     input.faturamento >= result.faturamentoNecessario ? '✓ Atingido' : '✗ Não atingido',
      statusBg:   input.faturamento >= result.faturamentoNecessario ? C.greenBg : C.redBg,
      statusText: input.faturamento >= result.faturamentoNecessario ? C.greenText : C.redText,
    },
    {
      label:      'Sobra de Caixa',
      value:      brl(result.sobraCaixa),
      ref:        'Lucro real disponível',
      status:     result.sobraCaixa > 0 ? '✓ Positivo' : '✗ Negativo',
      statusBg:   result.sobraCaixa > 0 ? C.greenBg : C.redBg,
      statusText: result.sobraCaixa > 0 ? C.greenText : C.redText,
      valueBg:    result.sobraCaixa > 0 ? C.greenBg : C.redBg,
      valueText:  result.sobraCaixa > 0 ? C.greenText : C.redText,
    },
  ];

  indicadores.forEach((ind, i) => {
    const row = dash.getRow(9 + i);
    row.height = 22;

    const c1 = row.getCell(1);
    c1.value = ind.label;
    c1.font  = { bold: true, size: 10 };
    if (i % 2 === 1) c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };

    const c2 = row.getCell(2);
    c2.value = ind.value;
    c2.font  = { bold: true, size: 11, color: { argb: ind.valueText ?? C.darkGray } };
    c2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ind.valueBg ?? (i % 2 === 1 ? C.altRow : 'FFFFFFFF') } };
    c2.alignment = { horizontal: 'right' };

    const c3 = row.getCell(3);
    c3.value = ind.ref;
    c3.font  = { size: 9, color: { argb: C.gray } };
    if (i % 2 === 1) c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };

    const c4 = row.getCell(4);
    c4.value = ind.status;
    c4.font  = { bold: true, size: 9, color: { argb: ind.statusText } };
    c4.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ind.statusBg } };
    c4.alignment = { horizontal: 'center', vertical: 'middle' };
    dash.mergeCells(`D${9 + i}:F${9 + i}`);
  });

  dash.getRow(14).height = 6;

  // ── SEÇÃO: META DIÁRIA ────────────────────────────────────────────────────
  dash.mergeCells('A15:F15');
  applySection(dash.getCell('A15'), '  META DIÁRIA DE FATURAMENTO (baseada no Ponto de Equilíbrio)');
  dash.getRow(15).height = 22;

  const metaDiaria = result.pontoEquilibrio === Infinity ? 0 : result.pontoEquilibrio / 30;
  dash.getRow(16).height = 26;
  const md1 = dash.getCell('A16');
  md1.value = 'Meta Diária (PE ÷ 30 dias)';
  md1.font  = { bold: true, size: 11 };

  const md2 = dash.getCell('B16');
  md2.value = brl(metaDiaria);
  md2.font  = { bold: true, size: 13, color: { argb: 'FF1A4F8A' } };
  md2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBD6FB' } };
  md2.alignment = { horizontal: 'center' };

  const md3 = dash.getCell('C16');
  md3.value = 'Para cobrir todos os custos fixos e variáveis';
  md3.font  = { size: 9, color: { argb: C.gray } };

  dash.getRow(17).height = 6;

  // ── SEÇÃO: COMPOSIÇÃO DE CUSTOS ───────────────────────────────────────────
  dash.mergeCells('A18:F18');
  applySection(dash.getCell('A18'), '  COMPOSIÇÃO DE CUSTOS (mês atual)');
  dash.getRow(18).height = 22;

  const costHeaders = ['Item de Custo', 'Valor (R$)', '% do Faturamento', 'Detalhes', '', ''];
  costHeaders.forEach((h, i) => {
    const cell = dash.getRow(19).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  dash.getRow(19).height = 20;

  const fat = input.faturamento;
  const custosProduto   = fat * (input.custoProductPercent / 100);
  const custosTaxas     = fat * (input.taxaPercent / 100);
  const fretePercentual = input.fretePercentual ?? 0;
  const frete           = fat * (fretePercentual / 100);
  const totalCustos     = input.custosFixos + custosProduto + custosTaxas + input.proLabore + frete;

  const custoRows: Array<[string, number, string]> = [
    ['Custos Fixos',           input.custosFixos,         'Aluguel, funcionários, luz...'],
    ['Custo de Produtos',      custosProduto,              `${input.custoProductPercent}% do faturamento`],
    ['Taxas (cartão/mkt)',     custosTaxas,                `${input.taxaPercent}% do faturamento`],
    ['Pró-labore (salário)',   input.proLabore,            'Retirada do dono'],
    ['Frete e Entrega',        frete,                      `${fretePercentual}% do faturamento`],
  ];

  custoRows.forEach(([label, valor, detalhe], i) => {
    const row = dash.getRow(20 + i);
    row.height = 20;
    const pct = fat > 0 ? (valor / fat) * 100 : 0;

    row.getCell(1).value = label;
    row.getCell(1).font  = { size: 10 };
    row.getCell(2).value = brl(valor);
    row.getCell(2).font  = { size: 10, bold: true };
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(3).value = `${pct.toFixed(1)}%`;
    row.getCell(3).font  = { size: 10, color: { argb: pct > 30 ? C.redText : C.darkGray } };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(4).value = detalhe;
    row.getCell(4).font  = { size: 9, color: { argb: C.gray } };
    dash.mergeCells(`D${20 + i}:F${20 + i}`);
    applyAltRow(row, 3, i);
  });

  // Linha de total de custos
  const totalRow = dash.getRow(24);
  totalRow.height = 22;
  const pctTotal = fat > 0 ? (totalCustos / fat) * 100 : 0;
  totalRow.getCell(1).value = 'TOTAL DE CUSTOS';
  totalRow.getCell(1).font  = { bold: true, size: 11 };
  totalRow.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  totalRow.getCell(2).value = brl(totalCustos);
  totalRow.getCell(2).font  = { bold: true, size: 11, color: { argb: C.redText } };
  totalRow.getCell(2).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  totalRow.getCell(2).alignment = { horizontal: 'right' };
  totalRow.getCell(3).value = `${pctTotal.toFixed(1)}%`;
  totalRow.getCell(3).font  = { bold: true, size: 11, color: { argb: pctTotal > 85 ? C.redText : C.greenText } };
  totalRow.getCell(3).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  totalRow.getCell(3).alignment = { horizontal: 'center' };
  dash.mergeCells('D24:F24');

  // Linha de faturamento vs custos
  const compRow = dash.getRow(25);
  compRow.height = 22;
  const saldo = fat - totalCustos;
  compRow.getCell(1).value = 'Faturamento atual';
  compRow.getCell(1).font  = { bold: true, size: 10 };
  compRow.getCell(2).value = brl(fat);
  compRow.getCell(2).font  = { bold: true, size: 10, color: { argb: C.greenText } };
  compRow.getCell(2).alignment = { horizontal: 'right' };
  compRow.getCell(3).value = `Saldo: ${brl(saldo)}`;
  compRow.getCell(3).font  = { bold: true, size: 10, color: { argb: saldo >= 0 ? C.greenText : C.redText } };
  compRow.getCell(3).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: saldo >= 0 ? C.greenBg : C.redBg } };
  dash.mergeCells('D25:F25');

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 2 — DIAGNÓSTICO COMPLETO
  // ══════════════════════════════════════════════════════════════════════════
  const diagColor = classification.color.replace('#', 'FF');
  const diag = workbook.addWorksheet('Diagnóstico Completo', {
    properties: { tabColor: { argb: diagColor } },
  });
  diag.getColumn(1).width = 32;
  diag.getColumn(2).width = 22;
  diag.getColumn(3).width = 36;
  diag.getColumn(4).width = 14;

  // Título
  diag.mergeCells('A1:D1');
  const dg1 = diag.getCell('A1');
  dg1.value = `Raio-X do Negócio — ${businessName || 'Meu Negócio'}`;
  dg1.font  = { bold: true, size: 15, color: { argb: C.headerText } };
  dg1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  dg1.alignment = { horizontal: 'center', vertical: 'middle' };
  diag.getRow(1).height = 30;

  diag.mergeCells('A2:D2');
  const dg2 = diag.getCell('A2');
  dg2.value = `Gerado em ${new Date().toLocaleDateString('pt-BR')}`;
  dg2.font  = { size: 9, color: { argb: C.gray } };
  dg2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  dg2.alignment = { horizontal: 'center' };

  diag.getRow(3).height = 6;

  // ── Dados Informados ─────────────────────────────────────────────────────
  diag.mergeCells('A4:D4');
  applySection(diag.getCell('A4'), '  DADOS INFORMADOS PELO LOJISTA');
  diag.getRow(4).height = 22;

  const inHeaders = ['Campo', 'Valor Informado', 'Descrição'];
  inHeaders.forEach((h, i) => {
    const cell = diag.getRow(5).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  diag.getRow(5).height = 20;

  const inputRows: Array<[string, string, string]> = [
    ['Faturamento Mensal',         brl(input.faturamento),               'Total que entra no caixa por mês'],
    ['Custos Fixos Mensais',       brl(input.custosFixos),               'Aluguel, funcionários, luz, etc.'],
    ['Custo do Produto (%)',       `${input.custoProductPercent}%`,       '% do faturamento gasto com mercadoria'],
    ['Taxas (cartão/marketplace)', `${input.taxaPercent}%`,              '% pago em taxas sobre as vendas'],
    ['Pró-labore Desejado',        brl(input.proLabore),                 'Salário que o dono quer retirar'],
    ['Frete e Entrega (%)',         `${input.fretePercentual ?? 0}%`,     '% do faturamento gasto com frete'],
  ];

  inputRows.forEach(([campo, valor, desc], i) => {
    const row = diag.getRow(6 + i);
    row.height = 20;
    row.getCell(1).value = campo;
    row.getCell(1).font  = { size: 10 };
    row.getCell(2).value = valor;
    row.getCell(2).font  = { bold: true, size: 10 };
    row.getCell(2).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(3).value = desc;
    row.getCell(3).font  = { size: 9, color: { argb: C.gray } };
    applyAltRow(row, 3, i);
  });

  diag.getRow(11).height = 6;

  // ── Resultados ───────────────────────────────────────────────────────────
  diag.mergeCells('A12:D12');
  applySection(diag.getCell('A12'), '  RESULTADOS DO DIAGNÓSTICO');
  diag.getRow(12).height = 22;

  const resHeaders = ['Indicador', 'Resultado', 'O que significa'];
  resHeaders.forEach((h, i) => {
    const cell = diag.getRow(13).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  diag.getRow(13).height = 20;

  const resultRows: Array<[string, string, string, boolean | null]> = [
    [
      'Lucro Real',
      brl(result.lucroReal),
      'Quanto sobra depois de pagar tudo (incluindo o dono)',
      result.lucroReal >= 0,
    ],
    [
      'Margem Líquida',
      `${result.margemLiquida.toFixed(1)}%`,
      'De cada R$100 vendidos, esse % é lucro de verdade',
      result.margemLiquida >= 10,
    ],
    [
      'Ponto de Equilíbrio',
      result.pontoEquilibrio === Infinity ? 'Inatingível' : brl(result.pontoEquilibrio),
      'Faturamento mínimo para não ter prejuízo (sem pró-labore)',
      input.faturamento >= result.pontoEquilibrio,
    ],
    [
      'Faturamento Necessário',
      result.faturamentoNecessario === Infinity ? 'Inatingível' : brl(result.faturamentoNecessario),
      'Faturamento para cobrir tudo + salário do dono',
      input.faturamento >= result.faturamentoNecessario,
    ],
    [
      'Sobra de Caixa',
      brl(result.sobraCaixa),
      'Valor disponível ao final do mês',
      result.sobraCaixa > 0,
    ],
  ];

  resultRows.forEach(([label, valor, desc, positivo], i) => {
    const row = diag.getRow(14 + i);
    row.height = 21;

    row.getCell(1).value = label;
    row.getCell(1).font  = { bold: true, size: 10 };

    const vc = row.getCell(2);
    vc.value = valor;
    vc.font  = {
      bold: true, size: 10,
      color: { argb: positivo === null ? C.darkGray : positivo ? C.greenText : C.redText },
    };
    vc.fill  = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: positivo === null ? C.altRow : positivo ? C.greenBg : C.redBg },
    };
    vc.alignment = { horizontal: 'right' };

    row.getCell(3).value = desc;
    row.getCell(3).font  = { size: 9, color: { argb: C.gray } };
    applyAltRow(row, 3, i);
  });

  diag.getRow(19).height = 6;

  // ── Classificação ─────────────────────────────────────────────────────────
  diag.mergeCells('A20:D20');
  applySection(diag.getCell('A20'), '  CLASSIFICAÇÃO DO NEGÓCIO');
  diag.getRow(20).height = 22;

  diag.getRow(21).height = 20;
  const classColors = classificationColor(classification.level);
  const cl1 = diag.getCell('A21');
  cl1.value = `${classification.emoji} ${classification.label}`;
  cl1.font  = { bold: true, size: 13, color: { argb: classColors.text } };
  cl1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: classColors.bg } };
  cl1.alignment = { horizontal: 'center', vertical: 'middle' };

  const cl2 = diag.getCell('B21');
  cl2.value = classification.description;
  cl2.font  = { size: 10, color: { argb: C.darkGray } };
  cl2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: classColors.bg } };
  diag.mergeCells('B21:D21');

  diag.getRow(22).height = 6;

  // ── Insights ──────────────────────────────────────────────────────────────
  if (insights.length > 0) {
    diag.mergeCells('A23:D23');
    applySection(diag.getCell('A23'), '  INSIGHTS E RECOMENDAÇÕES');
    diag.getRow(23).height = 22;

    const insHdr = ['Prioridade', 'Título', 'Recomendação'];
    insHdr.forEach((h, i) => {
      const cell = diag.getRow(24).getCell(i + 1);
      cell.value = h;
      applyHeader(cell, C.subHeaderBg, 10);
    });
    diag.getRow(24).height = 20;

    insights.forEach((ins, i) => {
      const row = diag.getRow(25 + i);
      row.height = 40;

      const pBg: Record<string, string> = { alta: C.redBg, media: C.yellowBg, baixa: C.greenBg };
      const pTx: Record<string, string> = { alta: C.redText, media: C.yellowText, baixa: C.greenText };
      const pLabel: Record<string, string> = { alta: '🔴 ALTA', media: '🟡 MÉDIA', baixa: '🟢 BAIXA' };

      const p = row.getCell(1);
      p.value = pLabel[ins.priority] ?? ins.priority;
      p.font  = { bold: true, size: 9, color: { argb: pTx[ins.priority] } };
      p.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: pBg[ins.priority] } };
      p.alignment = { horizontal: 'center', vertical: 'middle' };

      const t = row.getCell(2);
      t.value = ins.title;
      t.font  = { bold: true, size: 10 };
      applyAltRow(row, 3, i);

      const m = row.getCell(3);
      m.value = ins.message;
      m.font  = { size: 9, color: { argb: C.darkGray } };
      m.alignment = { wrapText: true, vertical: 'middle' };
      if (i % 2 === 1) m.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 3 — REGISTROS DIÁRIOS
  // ══════════════════════════════════════════════════════════════════════════
  const daily = workbook.addWorksheet('Registros Diários', {
    properties: { tabColor: { argb: 'FF22C55E' } },
  });
  daily.getColumn(1).width = 6;   // Dia
  daily.getColumn(2).width = 13;  // Data
  daily.getColumn(3).width = 18;  // Faturamento
  daily.getColumn(4).width = 16;  // Vendas à Vista
  daily.getColumn(5).width = 16;  // Vendas a Prazo
  daily.getColumn(6).width = 14;  // Devoluções
  daily.getColumn(7).width = 28;  // Observações

  // — Título
  daily.mergeCells('A1:G1');
  const dy1 = daily.getCell('A1');
  dy1.value = `Registros Diários — ${businessName || 'Meu Negócio'}`;
  dy1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  dy1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16653A' } };
  dy1.alignment = { horizontal: 'center', vertical: 'middle' };
  daily.getRow(1).height = 28;

  // — Meta diária no topo
  daily.getRow(2).height = 22;
  const dyMeta1 = daily.getCell('A2');
  dyMeta1.value = 'META DIÁRIA:';
  dyMeta1.font  = { bold: true, size: 11 };
  daily.mergeCells('A2:B2');

  const metaValCell = daily.getCell('C2');
  metaValCell.value = metaDiaria;
  metaValCell.numFmt = 'R$ #,##0.00';
  metaValCell.font  = { bold: true, size: 13, color: { argb: 'FF1A4F8A' } };
  metaValCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBD6FB' } };
  metaValCell.alignment = { horizontal: 'center' };

  const metaInfo = daily.getCell('D2');
  metaInfo.value = 'Verde = bateu a meta  |  Vermelho = abaixo da meta';
  metaInfo.font  = { size: 9, color: { argb: C.gray } };
  daily.mergeCells('D2:G2');

  daily.getRow(3).height = 6;

  // — Cabeçalhos da tabela
  const dyHeaders = ['Dia', 'Data', 'Faturamento\ndo Dia (R$)', 'Vendas\nÀ Vista (R$)', 'Vendas\nA Prazo (R$)', 'Devoluções\n(R$)', 'Observações'];
  dyHeaders.forEach((h, i) => {
    const cell = daily.getRow(4).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, 'FF16653A', 10);
  });
  daily.getRow(4).height = 30;

  // — Estrutura semanal
  // Weeks: 1-7, 8-14, 15-21, 22-28, 29-31
  const weekRanges = [
    { days: [1, 2, 3, 4, 5, 6, 7],     label: 'TOTAL SEMANA 1' },
    { days: [8, 9, 10, 11, 12, 13, 14], label: 'TOTAL SEMANA 2' },
    { days: [15, 16, 17, 18, 19, 20, 21], label: 'TOTAL SEMANA 3' },
    { days: [22, 23, 24, 25, 26, 27, 28], label: 'TOTAL SEMANA 4' },
    { days: [29, 30, 31],               label: 'TOTAL SEMANA 5' },
  ];

  // Mapeamento de dia → número de linha
  const dayToRow: Record<number, number> = {};
  let currentRow = 5;

  const allDataRows: number[] = [];

  for (const week of weekRanges) {
    const weekDataRows: number[] = [];

    for (const day of week.days) {
      const rowNum = currentRow;
      dayToRow[day] = rowNum;
      weekDataRows.push(rowNum);
      allDataRows.push(rowNum);

      const row = daily.getRow(rowNum);
      row.height = 18;

      row.getCell(1).value = day;
      row.getCell(1).font  = { bold: true, size: 9 };
      row.getCell(1).alignment = { horizontal: 'center' };

      // Campos de entrada: Data, Faturamento, À Vista, A Prazo, Devoluções, Obs
      [2, 3, 4, 5, 6, 7].forEach((col) => {
        const c = row.getCell(col);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
        if (col >= 3 && col <= 6) {
          c.numFmt = 'R$ #,##0.00';
        }
      });
      row.getCell(2).numFmt = 'DD/MM/YYYY';
      row.getCell(7).alignment = { wrapText: false };

      // Cor alternada por dia (dentro da semana)
      if ((day % 2) === 0) {
        [1].forEach((col) => {
          row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
        });
      }

      currentRow++;
    }

    // Linha de total semanal
    const totalRowNum = currentRow;
    const weekRow = daily.getRow(totalRowNum);
    weekRow.height = 20;
    currentRow++;

    daily.mergeCells(`A${totalRowNum}:B${totalRowNum}`);
    const wt = weekRow.getCell(1);
    wt.value = week.label;
    wt.font  = { bold: true, size: 9, color: { argb: C.darkGray } };
    wt.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.weekTotalBg } };
    wt.alignment = { horizontal: 'center' };

    [3, 4, 5, 6].forEach((col) => {
      const colLetter = ['C', 'D', 'E', 'F'][col - 3];
      const refs = weekDataRows.map((r) => `${colLetter}${r}`).join('+');
      const tc = weekRow.getCell(col);
      tc.value = { formula: `SUM(${refs})` };
      tc.numFmt = 'R$ #,##0.00';
      tc.font   = { bold: true, size: 9 };
      tc.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.weekTotalBg } };
    });
    weekRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.weekTotalBg } };
  }

  // — Espaço antes do total mensal
  daily.getRow(currentRow).height = 6;
  currentRow++;

  // — Total mensal
  const monthTotalRow = daily.getRow(currentRow);
  monthTotalRow.height = 24;

  daily.mergeCells(`A${currentRow}:B${currentRow}`);
  const mt = monthTotalRow.getCell(1);
  mt.value = 'TOTAL DO MÊS';
  mt.font  = { bold: true, size: 11, color: { argb: C.headerText } };
  mt.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  mt.alignment = { horizontal: 'center' };

  [3, 4, 5, 6].forEach((col) => {
    const colLetter = ['C', 'D', 'E', 'F'][col - 3];
    const refs = allDataRows.map((r) => `${colLetter}${r}`).join('+');
    const tc = monthTotalRow.getCell(col);
    tc.value = { formula: `SUM(${refs})` };
    tc.numFmt = 'R$ #,##0.00';
    tc.font   = { bold: true, size: 11, color: { argb: C.headerText } };
    tc.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  });
  monthTotalRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };

  // — Formatação condicional: faturamento vs meta (coluna C)
  const dataRefs = allDataRows.map((r) => `C${r}`);
  for (const ref of dataRefs) {
    daily.addConditionalFormatting({
      ref,
      rules: [
        {
          type: 'expression',
          formulae: [`AND(${ref}>0,${ref}>=$C$2)`],
          style: {
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.greenBg } },
            font: { color: { argb: C.greenText } },
          },
          priority: 1,
        },
        {
          type: 'expression',
          formulae: [`AND(${ref}>0,${ref}<$C$2)`],
          style: {
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.redBg } },
            font: { color: { argb: C.redText } },
          },
          priority: 2,
        },
      ],
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 4 — PRECIFICAÇÃO DE PRODUTOS
  // ══════════════════════════════════════════════════════════════════════════
  const prec = workbook.addWorksheet('Precificação de Produtos', {
    properties: { tabColor: { argb: 'FFD97706' } },
  });
  prec.getColumn(1).width = 24;  // Nome
  prec.getColumn(2).width = 16;  // Custo Aquisição
  prec.getColumn(3).width = 14;  // % Margem
  prec.getColumn(4).width = 12;  // % Impostos
  prec.getColumn(5).width = 14;  // % Taxas Cartão
  prec.getColumn(6).width = 16;  // Custos Adicionais
  prec.getColumn(7).width = 18;  // PV Sugerido
  prec.getColumn(8).width = 16;  // Lucro/Unid.
  prec.getColumn(9).width = 16;  // MC Unit.
  prec.getColumn(10).width = 12; // Margem %

  // — Título
  prec.mergeCells('A1:J1');
  const pr1 = prec.getCell('A1');
  pr1.value = 'Calculadora de Precificação de Produtos';
  pr1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  pr1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3506' } };
  pr1.alignment = { horizontal: 'center', vertical: 'middle' };
  prec.getRow(1).height = 28;

  // — Subtítulo
  prec.mergeCells('A2:J2');
  const pr2 = prec.getCell('A2');
  pr2.value = 'Preencha custo, margens e taxas — o preço de venda sugerido é calculado automaticamente';
  pr2.font  = { size: 9, color: { argb: C.gray } };
  pr2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  pr2.alignment = { horizontal: 'center' };
  prec.getRow(2).height = 18;

  prec.getRow(3).height = 8;

  // — Fórmula de referência (explicação)
  prec.mergeCells('A4:J4');
  const pr4 = prec.getCell('A4');
  pr4.value = 'Fórmula: Preço de Venda = (Custo + Custos Adicionais) ÷ (1 − % Margem − % Impostos − % Taxas)';
  pr4.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  pr4.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  pr4.alignment = { horizontal: 'center' };
  prec.getRow(4).height = 16;

  prec.getRow(5).height = 8;

  // — Cabeçalhos
  const precHeaders = [
    'Produto / Descrição',
    'Custo de\nAquisição (R$)',
    '% Margem\nDesejada',
    '% Impostos',
    '% Taxas\nCartão',
    'Custos\nAdicionais (R$)',
    'Preço de Venda\nSugerido (R$)',
    'Lucro por\nUnidade (R$)',
    'Margem Contrib.\nUnitária (R$)',
    'Margem\n%',
  ];
  precHeaders.forEach((h, i) => {
    const cell = prec.getRow(6).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, 'FF7C3506', 9);
  });
  prec.getRow(6).height = 32;

  // — Linhas de produtos (20 linhas)
  const inputCols = [1, 2, 3, 4, 5, 6];
  const resultCols = [7, 8, 9, 10];

  for (let i = 0; i < 20; i++) {
    const r = 7 + i;
    const row = prec.getRow(r);
    row.height = 20;

    // Colunas de entrada: fundo amarelo claro
    inputCols.forEach((col) => {
      const c = row.getCell(col);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
      if (col === 2 || col === 6) c.numFmt = 'R$ #,##0.00';
      if (col === 3 || col === 4 || col === 5) c.numFmt = '0.0"%"';
      if (col >= 2 && col <= 6) c.alignment = { horizontal: 'right' };
    });

    // Colunas de resultado: fórmulas + fundo cinza claro
    resultCols.forEach((col) => {
      row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    });

    // G = Preço de Venda Sugerido
    // PV = (B + F) / (1 - C/100 - D/100 - E/100)
    prec.getCell(`G${r}`).value = {
      formula: `IF(1-C${r}/100-D${r}/100-E${r}/100<=0,"ERRO",IF(B${r}+F${r}=0,"",(B${r}+F${r})/(1-C${r}/100-D${r}/100-E${r}/100)))`,
    };
    prec.getCell(`G${r}`).numFmt = 'R$ #,##0.00';
    prec.getCell(`G${r}`).font  = { bold: true, size: 10 };
    prec.getCell(`G${r}`).alignment = { horizontal: 'right' };

    // H = Lucro por Unidade = PV - Custo - Custos Adicionais - PV*(Impostos+Taxas)
    prec.getCell(`H${r}`).value = {
      formula: `IF(OR(G${r}="ERRO",G${r}=""),"",G${r}-B${r}-F${r}-G${r}*(D${r}/100)-G${r}*(E${r}/100))`,
    };
    prec.getCell(`H${r}`).numFmt = 'R$ #,##0.00';
    prec.getCell(`H${r}`).alignment = { horizontal: 'right' };

    // I = Margem de Contribuição Unitária = PV * (1 - D/100 - E/100) - B - F
    prec.getCell(`I${r}`).value = {
      formula: `IF(OR(G${r}="ERRO",G${r}=""),"",G${r}*(1-D${r}/100-E${r}/100)-B${r}-F${r})`,
    };
    prec.getCell(`I${r}`).numFmt = 'R$ #,##0.00';
    prec.getCell(`I${r}`).alignment = { horizontal: 'right' };

    // J = Margem % = H / G
    prec.getCell(`J${r}`).value = {
      formula: `IF(OR(G${r}="ERRO",G${r}="",G${r}=0),"",H${r}/G${r})`,
    };
    prec.getCell(`J${r}`).numFmt = '0.0%';
    prec.getCell(`J${r}`).alignment = { horizontal: 'center' };

    // Cor alternada
    if (i % 2 === 1) {
      [1, 3, 4, 5].forEach((col) => {
        row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3D0' } };
      });
      resultCols.forEach((col) => {
        row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
      });
    }
  }

  // — Linha de totais / médias
  const totRow = prec.getRow(27);
  totRow.height = 22;

  prec.mergeCells('A27:A27');
  const totLabel = totRow.getCell(1);
  totLabel.value = 'TOTAL / MÉDIA';
  totLabel.font  = { bold: true, size: 10, color: { argb: C.headerText } };
  totLabel.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3506' } };
  totLabel.alignment = { horizontal: 'center' };

  // Total custo de aquisição (soma B7:B26)
  totRow.getCell(2).value  = { formula: 'SUM(B7:B26)' };
  totRow.getCell(2).numFmt = 'R$ #,##0.00';
  totRow.getCell(2).font   = { bold: true };
  totRow.getCell(2).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };

  // Médias de % (C, D, E)
  ['C', 'D', 'E'].forEach((col) => {
    const c = totRow.getCell(col);
    c.value  = { formula: `AVERAGEIF(${col}7:${col}26,">0")` };
    c.numFmt = '0.0"%"';
    c.font   = { bold: true };
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    c.alignment = { horizontal: 'center' };
  });

  // Total custos adicionais (F)
  totRow.getCell(6).value  = { formula: 'SUM(F7:F26)' };
  totRow.getCell(6).numFmt = 'R$ #,##0.00';
  totRow.getCell(6).font   = { bold: true };
  totRow.getCell(6).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };

  // Média PV (G)
  totRow.getCell(7).value  = { formula: 'AVERAGEIF(G7:G26,"<>")' };
  totRow.getCell(7).numFmt = 'R$ #,##0.00';
  totRow.getCell(7).font   = { bold: true };
  totRow.getCell(7).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };

  // Total lucro/unit (H)
  totRow.getCell(8).value  = { formula: 'SUM(H7:H26)' };
  totRow.getCell(8).numFmt = 'R$ #,##0.00';
  totRow.getCell(8).font   = { bold: true };
  totRow.getCell(8).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };

  // Total MC unit (I)
  totRow.getCell(9).value  = { formula: 'SUM(I7:I26)' };
  totRow.getCell(9).numFmt = 'R$ #,##0.00';
  totRow.getCell(9).font   = { bold: true };
  totRow.getCell(9).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };

  // Média margem % (J)
  totRow.getCell(10).value  = { formula: 'AVERAGEIF(J7:J26,">0")' };
  totRow.getCell(10).numFmt = '0.0%';
  totRow.getCell(10).font   = { bold: true };
  totRow.getCell(10).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  totRow.getCell(10).alignment = { horizontal: 'center' };

  // — Formatação condicional: margem % na coluna J (verde/amarelo/vermelho)
  prec.addConditionalFormatting({
    ref: 'J7:J26',
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['0.199'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.greenBg } },
          font: { color: { argb: C.greenText } },
        },
        priority: 1,
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: ['0.1', '0.199'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.yellowBg } },
          font: { color: { argb: C.yellowText } },
        },
        priority: 2,
      },
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: ['0.1'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.redBg } },
          font: { color: { argb: C.redText } },
        },
        priority: 3,
      },
    ],
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 5 — CURVA ABC
  // ══════════════════════════════════════════════════════════════════════════
  const abc = workbook.addWorksheet('Curva ABC', {
    properties: { tabColor: { argb: 'FF4C1D95' } },
  });
  abc.getColumn(1).width = 28;
  abc.getColumn(2).width = 20;
  abc.getColumn(3).width = 16;
  abc.getColumn(4).width = 18;
  abc.getColumn(5).width = 16;
  abc.getColumn(6).width = 14;

  // Título
  abc.mergeCells('A1:F1');
  const ab1 = abc.getCell('A1');
  ab1.value = 'Curva ABC — Classificação de Produtos por Faturamento';
  ab1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  ab1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
  ab1.alignment = { horizontal: 'center', vertical: 'middle' };
  abc.getRow(1).height = 28;

  // Recomendação
  abc.mergeCells('A2:F2');
  const ab2 = abc.getCell('A2');
  ab2.value = 'Produtos Classe A = foco máximo. São seus campeões de venda. IMPORTANTE: ordene a tabela pela coluna B (Faturamento) em ordem DECRESCENTE para que o % Acumulado e a classificação funcionem corretamente.';
  ab2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  ab2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9D5FF' } };
  ab2.alignment = { horizontal: 'left', wrapText: true, vertical: 'middle' };
  abc.getRow(2).height = 30;

  abc.getRow(3).height = 6;

  // Totalizador de referência
  abc.mergeCells('A4:C4');
  const ab4label = abc.getCell('A4');
  ab4label.value = 'Total Faturamento (calculado automaticamente):';
  ab4label.font  = { bold: true, size: 10 };

  abc.mergeCells('D4:F4');
  const ab4val = abc.getCell('D4');
  ab4val.value  = { formula: 'SUM(B8:B37)' };
  ab4val.numFmt = 'R$ #,##0.00';
  ab4val.font   = { bold: true, size: 10, color: { argb: 'FF4C1D95' } };
  ab4val.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  ab4val.alignment = { horizontal: 'right' };
  abc.getRow(4).height = 20;

  abc.getRow(5).height = 6;

  // Cabeçalhos
  const abcHeaders = ['Produto / Descrição', 'Faturamento\nMensal (R$)', 'Qtde\nVendida', '% do\nFaturamento', '% Acumulado', 'Classe\nABC'];
  abcHeaders.forEach((h, i) => {
    const cell = abc.getRow(6).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, 'FF4C1D95', 9);
  });
  abc.getRow(6).height = 30;

  // Instrução de ordenação
  abc.mergeCells('A7:F7');
  const ab7 = abc.getCell('A7');
  ab7.value = '⬇ Ordene esta tabela pela coluna B (Faturamento) em ordem DECRESCENTE antes de interpretar a classificação ABC';
  ab7.font  = { size: 8, italic: true, color: { argb: 'FF6D28D9' } };
  ab7.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } };
  ab7.alignment = { horizontal: 'center' };
  abc.getRow(7).height = 16;

  // 30 linhas de produto
  for (let i = 0; i < 30; i++) {
    const r = 8 + i;
    const row = abc.getRow(r);
    row.height = 20;

    // Colunas de entrada: A, B, C
    [1, 2, 3].forEach((col) => {
      const c = row.getCell(col);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.inputBg : 'FFFAF5FF' } };
    });
    row.getCell(2).numFmt = 'R$ #,##0.00';
    row.getCell(3).numFmt = '#,##0';
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(3).alignment = { horizontal: 'right' };

    // D: % do faturamento
    const dCell = row.getCell(4);
    dCell.value = { formula: `IF(SUM(B$8:B$37)=0,"",IF(B${r}="","",B${r}/SUM(B$8:B$37)))` };
    dCell.numFmt = '0.00%';
    dCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.resultBg : 'FFE8E8E8' } };
    dCell.alignment = { horizontal: 'center' };

    // E: % acumulado
    const eCell = row.getCell(5);
    eCell.value = { formula: `IF(D${r}="","",SUM(D$8:D${r}))` };
    eCell.numFmt = '0.00%';
    eCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.resultBg : 'FFE8E8E8' } };
    eCell.alignment = { horizontal: 'center' };

    // F: Classificação ABC
    const fCell = row.getCell(6);
    fCell.value = { formula: `IF(E${r}="","",IF(E${r}<=0.8,"A",IF(E${r}<=0.95,"B","C")))` };
    fCell.font  = { bold: true };
    fCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.resultBg : 'FFE8E8E8' } };
    fCell.alignment = { horizontal: 'center' };
  }

  // Formatação condicional: coluna F — A=verde, B=amarelo, C=vermelho
  abc.addConditionalFormatting({
    ref: 'F8:F37',
    rules: [
      {
        type: 'expression',
        formulae: ['F8="A"'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.greenBg } },
          font: { bold: true, color: { argb: C.greenText } },
        },
        priority: 1,
      },
      {
        type: 'expression',
        formulae: ['F8="B"'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.yellowBg } },
          font: { bold: true, color: { argb: C.yellowText } },
        },
        priority: 2,
      },
      {
        type: 'expression',
        formulae: ['F8="C"'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.redBg } },
          font: { bold: true, color: { argb: C.redText } },
        },
        priority: 3,
      },
    ],
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 6 — MARGEM DE CONTRIBUIÇÃO
  // ══════════════════════════════════════════════════════════════════════════
  const mc = workbook.addWorksheet('Margem de Contribuição', {
    properties: { tabColor: { argb: 'FF0E7490' } },
  });
  mc.getColumn(1).width = 28;
  mc.getColumn(2).width = 18;
  mc.getColumn(3).width = 20;
  mc.getColumn(4).width = 20;
  mc.getColumn(5).width = 14;

  // Título
  mc.mergeCells('A1:E1');
  const mc1 = mc.getCell('A1');
  mc1.value = 'Margem de Contribuição por Produto';
  mc1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  mc1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E4966' } };
  mc1.alignment = { horizontal: 'center', vertical: 'middle' };
  mc.getRow(1).height = 28;

  // Área de resumo / recomendação
  mc.mergeCells('A2:E3');
  const mc2 = mc.getCell('A2');
  mc2.value = 'Produtos com margem acima de 30% = foque neles. Produtos abaixo de 15% = repense ou renegocie.\nMC Unitária = Preço de Venda − Custo Variável Unitário  |  MC% = MC Unitária ÷ Preço de Venda';
  mc2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  mc2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  mc2.alignment = { horizontal: 'left', wrapText: true, vertical: 'middle' };
  mc.getRow(2).height = 22;
  mc.getRow(3).height = 22;

  mc.getRow(4).height = 6;

  // Cabeçalhos
  const mcHeaders = ['Produto / Descrição', 'Preço de\nVenda (R$)', 'Custo Variável\nUnitário (R$)', 'MC Unitária\n(R$)', 'MC\n%'];
  mcHeaders.forEach((h, i) => {
    const cell = mc.getRow(5).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, 'FF0E4966', 9);
  });
  mc.getRow(5).height = 30;

  // Instrução de ordenação
  mc.mergeCells('A6:E6');
  const mc6 = mc.getCell('A6');
  mc6.value = '⬇ Dica: ordene pela coluna E (MC%) de forma DECRESCENTE para ver os produtos mais rentáveis primeiro';
  mc6.font  = { size: 8, italic: true, color: { argb: 'FF0E7490' } };
  mc6.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  mc6.alignment = { horizontal: 'center' };
  mc.getRow(6).height = 16;

  // 30 linhas de produto
  for (let i = 0; i < 30; i++) {
    const r = 7 + i;
    const row = mc.getRow(r);
    row.height = 20;

    // Colunas de entrada: A, B, C
    [1, 2, 3].forEach((col) => {
      row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.inputBg : C.altRow } };
    });
    row.getCell(2).numFmt = 'R$ #,##0.00';
    row.getCell(3).numFmt = 'R$ #,##0.00';
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(3).alignment = { horizontal: 'right' };

    // D: MC Unitária = B - C
    const mcDCell = row.getCell(4);
    mcDCell.value = { formula: `IF(OR(B${r}="",C${r}=""),"",B${r}-C${r})` };
    mcDCell.numFmt = 'R$ #,##0.00';
    mcDCell.font  = { bold: true };
    mcDCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.resultBg : 'FFE8E8E8' } };
    mcDCell.alignment = { horizontal: 'right' };

    // E: MC% = D / B
    const mcECell = row.getCell(5);
    mcECell.value = { formula: `IF(OR(B${r}="",B${r}=0,D${r}=""),"",D${r}/B${r})` };
    mcECell.numFmt = '0.0%';
    mcECell.font  = { bold: true };
    mcECell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.resultBg : 'FFE8E8E8' } };
    mcECell.alignment = { horizontal: 'center' };
  }

  // Linha de totais / médias (linha 37)
  const mcTotRow = mc.getRow(37);
  mcTotRow.height = 22;
  mc.mergeCells('A37:A37');
  mcTotRow.getCell(1).value = 'MÉDIA GERAL';
  mcTotRow.getCell(1).font  = { bold: true, size: 10, color: { argb: C.headerText } };
  mcTotRow.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E4966' } };
  mcTotRow.getCell(1).alignment = { horizontal: 'center' };
  [2, 3, 4].forEach((col) => {
    const letters = ['B', 'C', 'D'];
    const l = letters[col - 2];
    const c = mcTotRow.getCell(col);
    c.value  = { formula: `AVERAGEIF(${l}7:${l}36,"<>")` };
    c.numFmt = 'R$ #,##0.00';
    c.font   = { bold: true };
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    c.alignment = { horizontal: 'right' };
  });
  mcTotRow.getCell(5).value  = { formula: 'AVERAGEIF(E7:E36,">0")' };
  mcTotRow.getCell(5).numFmt = '0.0%';
  mcTotRow.getCell(5).font   = { bold: true };
  mcTotRow.getCell(5).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  mcTotRow.getCell(5).alignment = { horizontal: 'center' };

  // Formatação condicional: MC% coluna E — verde >30%, amarelo 15-30%, vermelho <15%
  mc.addConditionalFormatting({
    ref: 'E7:E36',
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['0.3'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.greenBg } },
          font: { bold: true, color: { argb: C.greenText } },
        },
        priority: 1,
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: ['0.15', '0.3'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.yellowBg } },
          font: { bold: true, color: { argb: C.yellowText } },
        },
        priority: 2,
      },
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: ['0.15'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.redBg } },
          font: { bold: true, color: { argb: C.redText } },
        },
        priority: 3,
      },
    ],
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 7 — PONTO DE EQUILÍBRIO FINANCEIRO
  // ══════════════════════════════════════════════════════════════════════════
  const pef = workbook.addWorksheet('PE Financeiro', {
    properties: { tabColor: { argb: 'FF7E22CE' } },
  });
  pef.getColumn(1).width = 44;
  pef.getColumn(2).width = 22;
  pef.getColumn(3).width = 36;

  // Título
  pef.mergeCells('A1:C1');
  const pe1 = pef.getCell('A1');
  pe1.value = 'Ponto de Equilíbrio Financeiro vs. Contábil';
  pe1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  pe1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
  pe1.alignment = { horizontal: 'center', vertical: 'middle' };
  pef.getRow(1).height = 28;

  // Explicação
  pef.mergeCells('A2:C4');
  const pe2 = pef.getCell('A2');
  pe2.value = 'Lucro não é dinheiro em caixa.\n\nO PE Financeiro considera as saídas reais de dinheiro (parcelas, amortizações) e exclui despesas não-caixa (depreciação). Por isso, o PE Financeiro pode ser maior ou menor que o PE Contábil.';
  pe2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  pe2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } };
  pe2.alignment = { horizontal: 'left', wrapText: true, vertical: 'top' };
  pef.getRow(2).height = 20;
  pef.getRow(3).height = 20;
  pef.getRow(4).height = 20;

  pef.getRow(5).height = 8;

  // Seção: Dados de entrada
  pef.mergeCells('A6:C6');
  applySection(pef.getCell('A6'), '  DADOS DE ENTRADA (preencha os campos em amarelo)');
  pef.getRow(6).height = 22;

  const peInputLabels: Array<[string, string]> = [
    ['Custos Fixos Mensais (R$)',                     'Aluguel, salários, contas fixas...'],
    ['Depreciação Mensal (R$)',                       'Redução do valor de máquinas/equipamentos (não é saída de caixa)'],
    ['Amortizações Mensais (R$)',                     'Pagamento do principal de dívidas'],
    ['Parcelas de Empréstimos/Financiamentos (R$)',   'Total mensal de parcelas pagas em dinheiro'],
    ['Margem de Contribuição Média % (0 a 100)',      'Use a média da aba "Margem de Contribuição"'],
  ];

  peInputLabels.forEach(([label, desc], i) => {
    const r = 7 + i;
    const row = pef.getRow(r);
    row.height = 22;

    row.getCell(1).value = label;
    row.getCell(1).font  = { size: 10, bold: true };
    if (i % 2 === 1) {
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }

    const inp = row.getCell(2);
    inp.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
    inp.numFmt    = i < 4 ? 'R$ #,##0.00' : '0.00';
    inp.alignment = { horizontal: 'right' };

    row.getCell(3).value = desc;
    row.getCell(3).font  = { size: 9, color: { argb: C.gray } };
    if (i % 2 === 1) {
      row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }
  });

  pef.getRow(12).height = 8;

  // Seção: Cálculos
  pef.mergeCells('A13:C13');
  applySection(pef.getCell('A13'), '  CÁLCULOS — PONTOS DE EQUILÍBRIO');
  pef.getRow(13).height = 22;

  ['Indicador', 'Resultado (R$)', 'Como interpretar'].forEach((h, i) => {
    const cell = pef.getRow(14).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  pef.getRow(14).height = 20;

  // B7=CustosFixos, B8=Depreciação, B9=Amortizações, B10=Parcelas, B11=MC%
  const peCalcs: Array<[string, string, string]> = [
    [
      'PE Contábil (inclui depreciação)',
      'IF(B11=0,"— preencha a MC% acima —",B7/(B11/100))',
      'Faturamento mínimo p/ cobrir custos fixos (inclui depreciação)',
    ],
    [
      'PE Financeiro (saídas reais de caixa)',
      'IF(B11=0,"— preencha a MC% acima —",(B7-B8+B9+B10)/(B11/100))',
      'Faturamento mínimo considerando o que realmente sai do caixa',
    ],
    [
      'Diferença (PE Financeiro − PE Contábil)',
      'IF(B11=0,"—",((B7-B8+B9+B10)/(B11/100))-(B7/(B11/100)))',
      'Positivo = PE Financeiro > PE Contábil; Negativo = menor',
    ],
    [
      'Faturamento Necessário POR DIA (PE Fin. ÷ 30)',
      'IF(B11=0,"—",(B7-B8+B9+B10)/(B11/100)/30)',
      'Meta diária mínima para cobrir as saídas reais de caixa',
    ],
    [
      'Faturamento Necessário POR SEMANA (PE Fin. ÷ 4)',
      'IF(B11=0,"—",(B7-B8+B9+B10)/(B11/100)/4)',
      'Meta semanal mínima para cobrir as saídas reais de caixa',
    ],
  ];

  peCalcs.forEach(([label, formula, desc], i) => {
    const r = 15 + i;
    const row = pef.getRow(r);
    row.height = 22;

    row.getCell(1).value = label;
    row.getCell(1).font  = { bold: true, size: 10 };
    if (i % 2 === 1) {
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }

    const vc = row.getCell(2);
    vc.value     = { formula };
    vc.numFmt    = 'R$ #,##0.00';
    vc.font      = { bold: true, size: 11, color: { argb: 'FF1A4F8A' } };
    vc.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBD6FB' } };
    vc.alignment = { horizontal: 'right' };

    row.getCell(3).value     = desc;
    row.getCell(3).font      = { size: 9, color: { argb: C.gray } };
    row.getCell(3).alignment = { wrapText: true };
    if (i % 2 === 1) {
      row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 8 — FLUXO DE CAIXA (12 SEMANAS)
  // ══════════════════════════════════════════════════════════════════════════
  const cf = workbook.addWorksheet('Fluxo de Caixa 12 Sem.', {
    properties: { tabColor: { argb: 'FF065F46' } },
  });
  cf.getColumn(1).width = 30;
  const cfWeekCols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  cfWeekCols.forEach((_, i) => { cf.getColumn(i + 2).width = 14; });

  // Título
  cf.mergeCells('A1:M1');
  const cf1 = cf.getCell('A1');
  cf1.value = 'Fluxo de Caixa — 12 Semanas';
  cf1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  cf1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
  cf1.alignment = { horizontal: 'center', vertical: 'middle' };
  cf.getRow(1).height = 28;

  // Subtítulo
  cf.mergeCells('A2:M2');
  const cf2 = cf.getCell('A2');
  cf2.value = 'Preencha os campos em amarelo. Totais e saldos são calculados automaticamente. Saldo negativo = vermelho | Saldo positivo = verde.';
  cf2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  cf2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  cf2.alignment = { horizontal: 'center' };
  cf.getRow(2).height = 18;

  cf.getRow(3).height = 6;

  // Cabeçalho de semanas (linha 4)
  const cfA4 = cf.getCell('A4');
  cfA4.value = 'Item';
  applyHeader(cfA4, C.headerBg, 10, 'left');
  cfWeekCols.forEach((col, i) => {
    const cell = cf.getCell(`${col}4`);
    cell.value = `Semana ${i + 1}`;
    applyHeader(cell, C.headerBg, 9);
  });
  cf.getRow(4).height = 22;

  // Saldo Inicial (linha 5)
  cf.getRow(5).height = 20;
  cf.getCell('A5').value = 'Saldo Inicial (R$)';
  cf.getCell('A5').font  = { bold: true, size: 10 };
  cf.getCell('A5').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  cf.getCell('B5').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
  cf.getCell('B5').numFmt = 'R$ #,##0.00';
  cf.getCell('B5').alignment = { horizontal: 'right' };
  cfWeekCols.slice(1).forEach((col) => {
    cf.getCell(`${col}5`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
    cf.getCell(`${col}5`).numFmt = 'R$ #,##0.00';
  });

  // ENTRADAS header (linha 6)
  cf.mergeCells('A6:M6');
  applySection(cf.getCell('A6'), '  ENTRADAS');
  cf.getRow(6).height = 20;

  // Linhas de entradas: 7, 8, 9
  const cfEntradasRows: Array<{ r: number; label: string }> = [
    { r: 7,  label: 'Vendas à Vista (R$)' },
    { r: 8,  label: 'Recebimento de Vendas a Prazo (R$)' },
    { r: 9,  label: 'Outras Entradas (R$)' },
  ];
  cfEntradasRows.forEach(({ r, label }, idx) => {
    const row = cf.getRow(r);
    row.height = 20;
    row.getCell(1).value = label;
    row.getCell(1).font  = { size: 10 };
    if (idx % 2 === 1) {
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }
    cfWeekCols.forEach((col) => {
      const c = cf.getCell(`${col}${r}`);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.inputBg : 'FFFFF3D0' } };
      c.numFmt = 'R$ #,##0.00';
      c.alignment = { horizontal: 'right' };
    });
  });

  // Total Entradas (linha 10)
  cf.getRow(10).height = 22;
  cf.getCell('A10').value = 'TOTAL ENTRADAS';
  cf.getCell('A10').font  = { bold: true, size: 10, color: { argb: C.headerText } };
  cf.getCell('A10').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.subHeaderBg } };
  cfWeekCols.forEach((col) => {
    const c = cf.getCell(`${col}10`);
    c.value     = { formula: `SUM(${col}7:${col}9)` };
    c.numFmt    = 'R$ #,##0.00';
    c.font      = { bold: true, color: { argb: C.headerText } };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.subHeaderBg } };
    c.alignment = { horizontal: 'right' };
  });

  // SAÍDAS header (linha 11)
  cf.mergeCells('A11:M11');
  applySection(cf.getCell('A11'), '  SAÍDAS');
  cf.getRow(11).height = 20;

  // Linhas de saídas: 12 a 17
  const cfSaidasRows: Array<{ r: number; label: string }> = [
    { r: 12, label: 'Fornecedores (R$)' },
    { r: 13, label: 'Aluguel (R$)' },
    { r: 14, label: 'Salários (R$)' },
    { r: 15, label: 'Impostos (R$)' },
    { r: 16, label: 'Parcelas / Empréstimos (R$)' },
    { r: 17, label: 'Outras Saídas (R$)' },
  ];
  cfSaidasRows.forEach(({ r, label }, idx) => {
    const row = cf.getRow(r);
    row.height = 20;
    row.getCell(1).value = label;
    row.getCell(1).font  = { size: 10 };
    if (idx % 2 === 1) {
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    }
    cfWeekCols.forEach((col) => {
      const c = cf.getCell(`${col}${r}`);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.inputBg : 'FFFFF3D0' } };
      c.numFmt = 'R$ #,##0.00';
      c.alignment = { horizontal: 'right' };
    });
  });

  // Total Saídas (linha 18)
  cf.getRow(18).height = 22;
  cf.getCell('A18').value = 'TOTAL SAÍDAS';
  cf.getCell('A18').font  = { bold: true, size: 10, color: { argb: C.headerText } };
  cf.getCell('A18').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.subHeaderBg } };
  cfWeekCols.forEach((col) => {
    const c = cf.getCell(`${col}18`);
    c.value     = { formula: `SUM(${col}12:${col}17)` };
    c.numFmt    = 'R$ #,##0.00';
    c.font      = { bold: true, color: { argb: C.headerText } };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.subHeaderBg } };
    c.alignment = { horizontal: 'right' };
  });

  // RESULTADO header (linha 19)
  cf.mergeCells('A19:M19');
  applySection(cf.getCell('A19'), '  RESULTADO');
  cf.getRow(19).height = 20;

  // Saldo da Semana (linha 20)
  cf.getRow(20).height = 22;
  cf.getCell('A20').value = 'Saldo da Semana (Entradas − Saídas)';
  cf.getCell('A20').font  = { bold: true, size: 10 };
  cf.getCell('A20').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
  cfWeekCols.forEach((col) => {
    const c = cf.getCell(`${col}20`);
    c.value     = { formula: `${col}10-${col}18` };
    c.numFmt    = 'R$ #,##0.00';
    c.font      = { bold: true };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    c.alignment = { horizontal: 'right' };
  });

  // Saldo Acumulado (linha 21)
  cf.getRow(21).height = 24;
  cf.getCell('A21').value = 'Saldo Acumulado';
  cf.getCell('A21').font  = { bold: true, size: 10 };
  cf.getCell('A21').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  cfWeekCols.forEach((col, idx) => {
    const c = cf.getCell(`${col}21`);
    if (idx === 0) {
      c.value = { formula: 'B5+B20' };
    } else {
      const prevCol = cfWeekCols[idx - 1];
      c.value = { formula: `${prevCol}21+${col}20` };
    }
    c.numFmt    = 'R$ #,##0.00';
    c.font      = { bold: true, size: 11 };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
    c.alignment = { horizontal: 'right' };
  });

  // Formatação condicional: Saldo da Semana e Saldo Acumulado
  ['B20:M20', 'B21:M21'].forEach((cfRef) => {
    cf.addConditionalFormatting({
      ref: cfRef,
      rules: [
        {
          type: 'cellIs',
          operator: 'lessThan',
          formulae: ['0'],
          style: {
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.redBg } },
            font: { bold: true, color: { argb: C.redText } },
          },
          priority: 1,
        },
        {
          type: 'cellIs',
          operator: 'greaterThan',
          formulae: ['0'],
          style: {
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.greenBg } },
            font: { bold: true, color: { argb: C.greenText } },
          },
          priority: 2,
        },
      ],
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 9 — PRAZO MÁXIMO DE FINANCIAMENTO
  // ══════════════════════════════════════════════════════════════════════════
  const pmf = workbook.addWorksheet('Prazo Máx. Financiamento', {
    properties: { tabColor: { argb: 'FF0E7490' } },
  });
  pmf.getColumn(1).width = 44;
  pmf.getColumn(2).width = 20;
  pmf.getColumn(3).width = 42;

  pmf.mergeCells('A1:C1');
  const pmf1 = pmf.getCell('A1');
  pmf1.value = 'Prazo Máximo de Financiamento a Clientes';
  pmf1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  pmf1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E7490' } };
  pmf1.alignment = { horizontal: 'center', vertical: 'middle' };
  pmf.getRow(1).height = 28;

  pmf.mergeCells('A2:C2');
  const pmf2 = pmf.getCell('A2');
  pmf2.value = 'Descubra o prazo máximo seguro para financiar seus clientes sem comprometer o caixa do negócio';
  pmf2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  pmf2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  pmf2.alignment = { horizontal: 'center' };
  pmf.getRow(2).height = 18;

  pmf.getRow(3).height = 8;

  pmf.mergeCells('A4:C4');
  applySection(pmf.getCell('A4'), '  DADOS DE ENTRADA (preencha os campos em amarelo)');
  pmf.getRow(4).height = 22;

  ['Campo', 'Valor (dias)', 'Descrição'].forEach((h, i) => {
    const cell = pmf.getRow(5).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  pmf.getRow(5).height = 20;

  const pmfInputDefs: Array<[string, string]> = [
    ['PMR — Prazo Médio de Recebimento (dias)',              'Média de dias para receber das vendas a prazo'],
    ['PMP — Prazo Médio de Pagamento a Fornecedores (dias)', 'Média de dias que você tem para pagar seus fornecedores'],
    ['PME — Giro de Estoque (dias)',                         'Quantos dias, em média, a mercadoria fica parada no estoque'],
  ];

  pmfInputDefs.forEach(([label, desc], i) => {
    const r = 6 + i;
    const row = pmf.getRow(r);
    row.height = 22;
    row.getCell(1).value = label;
    row.getCell(1).font  = { bold: true, size: 10 };
    if (i % 2 === 1) row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    const inp = row.getCell(2);
    inp.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
    inp.numFmt    = '0';
    inp.alignment = { horizontal: 'center' };
    row.getCell(3).value = desc;
    row.getCell(3).font  = { size: 9, color: { argb: C.gray } };
    if (i % 2 === 1) row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  });

  pmf.getRow(9).height = 8;

  pmf.mergeCells('A10:C10');
  applySection(pmf.getCell('A10'), '  CÁLCULOS — CICLOS E PRAZO MÁXIMO');
  pmf.getRow(10).height = 22;

  ['Indicador', 'Resultado', 'Como interpretar'].forEach((h, i) => {
    const cell = pmf.getRow(11).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  pmf.getRow(11).height = 20;

  // B6=PMR, B7=PMP, B8=PME
  const pmfCalcDefs: Array<[string, string, string]> = [
    [
      'Ciclo Operacional (PME + PMR)',
      'IF(OR(B6="",B8=""),"— preencha acima —",B8+B6)',
      'Tempo total desde a compra do estoque até receber do cliente',
    ],
    [
      'Ciclo Financeiro (Ciclo Operacional − PMP)',
      'IF(OR(B6="",B7="",B8=""),"— preencha acima —",B8+B6-B7)',
      'Período em que o negócio precisa financiar com capital próprio',
    ],
    [
      'Prazo Máximo Seguro para Financiar Clientes (PMP − PME)',
      'IF(OR(B7="",B8=""),"— preencha acima —",IF(B7-B8>0,B7-B8,"⚠ Risco — PMP menor que PME"))',
      'Nunca financie clientes além deste prazo para não descapitalizar',
    ],
  ];

  pmfCalcDefs.forEach(([label, formula, desc], i) => {
    const r = 12 + i;
    const row = pmf.getRow(r);
    row.height = 22;
    row.getCell(1).value = label;
    row.getCell(1).font  = { bold: true, size: 10 };
    if (i % 2 === 1) row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    const vc = row.getCell(2);
    vc.value     = { formula };
    vc.numFmt    = '0';
    vc.font      = { bold: true, size: 11, color: { argb: 'FF0E7490' } };
    vc.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
    vc.alignment = { horizontal: 'center' };
    row.getCell(3).value     = desc;
    row.getCell(3).font      = { size: 9, color: { argb: C.gray } };
    row.getCell(3).alignment = { wrapText: true };
    if (i % 2 === 1) row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  });

  pmf.getRow(15).height = 8;

  pmf.mergeCells('A16:C16');
  applySection(pmf.getCell('A16'), '  RÉGUA DE COBRANÇA — STATUS POR PRAZO');
  pmf.getRow(16).height = 22;

  ['Faixa de Atraso', 'Status', 'Ação Recomendada'].forEach((h, i) => {
    const cell = pmf.getRow(17).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  pmf.getRow(17).height = 20;

  const pmfFaixas: Array<[string, string, string, string, string]> = [
    ['0 a 15 dias',       'No prazo',         C.greenBg,  C.greenText,  'Nenhuma ação necessária — cliente em dia'],
    ['16 a 30 dias',      'Atenção',           C.yellowBg, C.yellowText, 'Enviar lembrete amigável de cobrança'],
    ['Acima de 30 dias',  'Cobrança urgente',  C.redBg,    C.redText,    'Acionar cobrança formal imediatamente'],
  ];

  pmfFaixas.forEach(([faixa, status, bg, txt, acao], i) => {
    const r = 18 + i;
    const row = pmf.getRow(r);
    row.height = 22;
    row.getCell(1).value = faixa;
    row.getCell(1).font  = { bold: true, size: 10, color: { argb: txt } };
    row.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).value = status;
    row.getCell(2).font  = { bold: true, size: 10, color: { argb: txt } };
    row.getCell(2).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(3).value = acao;
    row.getCell(3).font  = { size: 9, color: { argb: C.darkGray } };
    row.getCell(3).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
  });

  pmf.getRow(21).height = 8;

  pmf.mergeCells('A22:C22');
  const pmfRec = pmf.getCell('A22');
  pmfRec.value = 'RECOMENDAÇÃO: Nunca financie acima do Prazo Máximo Seguro calculado acima. Parcelar além desse prazo descapitaliza o negócio e compromete o fluxo de caixa.';
  pmfRec.font  = { bold: true, size: 10, color: { argb: 'FF0E7490' } };
  pmfRec.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  pmfRec.alignment = { wrapText: true, vertical: 'middle' };
  pmf.getRow(22).height = 36;

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 10 — SIMULADOR DE CENÁRIOS
  // ══════════════════════════════════════════════════════════════════════════
  const sim = workbook.addWorksheet('Simulador de Cenários', {
    properties: { tabColor: { argb: 'FF5B21B6' } },
  });
  sim.getColumn(1).width = 34;
  sim.getColumn(2).width = 22;
  sim.getColumn(3).width = 22;
  sim.getColumn(4).width = 22;

  sim.mergeCells('A1:D1');
  const si1 = sim.getCell('A1');
  si1.value = 'Simulador de Cenários Financeiros';
  si1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  si1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B21B6' } };
  si1.alignment = { horizontal: 'center', vertical: 'middle' };
  sim.getRow(1).height = 28;

  sim.mergeCells('A2:D2');
  const si2 = sim.getCell('A2');
  si2.value = 'Pessimista = 80% do faturamento Realista | Otimista = 120%. Edite a coluna Realista (amarela) para simular.';
  si2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  si2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
  si2.alignment = { horizontal: 'center' };
  sim.getRow(2).height = 18;

  sim.getRow(3).height = 8;

  // Cabeçalhos de coluna
  [
    { label: '',                   bg: C.subHeaderBg, txt: C.headerText  },
    { label: 'Pessimista (−20%)', bg: C.redBg,       txt: C.redText     },
    { label: 'Realista (base)',    bg: C.yellowBg,    txt: C.yellowText  },
    { label: 'Otimista (+20%)',    bg: C.greenBg,     txt: C.greenText   },
  ].forEach(({ label, bg, txt }, i) => {
    const cell = sim.getRow(4).getCell(i + 1);
    cell.value = label;
    cell.font  = { bold: true, size: 11, color: { argb: txt } };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  sim.getRow(4).height = 24;

  sim.getRow(5).height = 6;

  sim.mergeCells('A6:D6');
  applySection(sim.getCell('A6'), '  DADOS DE ENTRADA (edite a coluna Realista)');
  sim.getRow(6).height = 22;

  // Inputs pré-preenchidos com dados do diagnóstico
  const simInputDefs: Array<[string, number, string]> = [
    ['Faturamento (R$)',      input.faturamento,        'R$ #,##0.00'],
    ['% Custo do Produto',    input.custoProductPercent, '0.00"%"'],
    ['Custos Fixos (R$)',     input.custosFixos,         'R$ #,##0.00'],
    ['Pró-labore (R$)',       input.proLabore,           'R$ #,##0.00'],
  ];

  simInputDefs.forEach(([label, value, fmt], i) => {
    const r = 7 + i;
    const row = sim.getRow(r);
    row.height = 22;

    row.getCell(1).value = label;
    row.getCell(1).font  = { bold: true, size: 10 };
    if (i % 2 === 1) row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };

    // Realista (C) — amarelo, pré-preenchido
    const cReal = row.getCell(3);
    cReal.value     = value;
    cReal.numFmt    = fmt;
    cReal.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
    cReal.alignment = { horizontal: 'right' };

    // Pessimista (B) — 80% do faturamento / igual para os demais
    const cPess = row.getCell(2);
    cPess.value     = { formula: i === 0 ? `C${r}*0.8` : `C${r}` };
    cPess.numFmt    = fmt;
    cPess.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    cPess.alignment = { horizontal: 'right' };

    // Otimista (D) — 120% do faturamento / igual para os demais
    const cOtim = row.getCell(4);
    cOtim.value     = { formula: i === 0 ? `C${r}*1.2` : `C${r}` };
    cOtim.numFmt    = fmt;
    cOtim.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    cOtim.alignment = { horizontal: 'right' };
  });

  sim.getRow(11).height = 8;

  sim.mergeCells('A12:D12');
  applySection(sim.getCell('A12'), '  RESULTADOS CALCULADOS');
  sim.getRow(12).height = 22;

  ['Indicador', 'Pessimista', 'Realista', 'Otimista'].forEach((h, i) => {
    const cell = sim.getRow(13).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  sim.getRow(13).height = 20;

  // Linha 14 — Custo Produto R$  (Faturamento × % Custo / 100)
  sim.getRow(14).height = 20;
  sim.getCell('A14').value = 'Custo do Produto (R$)';
  sim.getCell('A14').font  = { size: 10 };
  (['B', 'C', 'D'] as const).forEach((col) => {
    const c = sim.getCell(`${col}14`);
    c.value     = { formula: `${col}7*(${col}8/100)` };
    c.numFmt    = 'R$ #,##0.00';
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    c.alignment = { horizontal: 'right' };
  });

  // Linha 15 — Lucro Real
  const simTaxaPct = input.taxaPercent;
  sim.getRow(15).height = 20;
  sim.getCell('A15').value = 'Lucro Real (R$)';
  sim.getCell('A15').font  = { size: 10 };
  sim.getCell('A15').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  (['B', 'C', 'D'] as const).forEach((col) => {
    const c = sim.getCell(`${col}15`);
    c.value     = { formula: `${col}7-${col}14-${col}9-${col}10-${col}7*(${simTaxaPct}/100)` };
    c.numFmt    = 'R$ #,##0.00';
    c.font      = { bold: true };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    c.alignment = { horizontal: 'right' };
  });

  // Linha 16 — Margem Líquida %
  sim.getRow(16).height = 20;
  sim.getCell('A16').value = 'Margem Líquida (%)';
  sim.getCell('A16').font  = { size: 10 };
  (['B', 'C', 'D'] as const).forEach((col) => {
    const c = sim.getCell(`${col}16`);
    c.value     = { formula: `IF(${col}7=0,0,${col}15/${col}7)` };
    c.numFmt    = '0.0%';
    c.font      = { bold: true };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.resultBg } };
    c.alignment = { horizontal: 'center' };
  });

  // Linha 17 — Classificação
  sim.getRow(17).height = 20;
  sim.getCell('A17').value = 'Classificação';
  sim.getCell('A17').font  = { size: 10 };
  sim.getCell('A17').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  (['B', 'C', 'D'] as const).forEach((col) => {
    const c = sim.getCell(`${col}17`);
    c.value = {
      formula: `IF(${col}15<0,"Prejuizo",IF(${col}16<0.05,"Sobrevivendo",IF(${col}16<0.10,"Estavel",IF(${col}16<0.15,"Saudavel","Escalavel"))))`,
    };
    c.font  = { bold: true, size: 10 };
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    c.alignment = { horizontal: 'center' };
  });

  // Formatação condicional: Margem % linha 16 — verde >15%, amarelo 5-15%, vermelho <5%
  sim.addConditionalFormatting({
    ref: 'B16:D16',
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['0.15'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.greenBg } },
          font: { bold: true, color: { argb: C.greenText } },
        },
        priority: 1,
      },
      {
        type: 'cellIs',
        operator: 'between',
        formulae: ['0.05', '0.15'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.yellowBg } },
          font: { bold: true, color: { argb: C.yellowText } },
        },
        priority: 2,
      },
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: ['0.05'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.redBg } },
          font: { bold: true, color: { argb: C.redText } },
        },
        priority: 3,
      },
    ],
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 11 — MATRIZ SWOT
  // ══════════════════════════════════════════════════════════════════════════
  const swot = workbook.addWorksheet('Matriz SWOT', {
    properties: { tabColor: { argb: 'FF16A34A' } },
  });
  swot.getColumn(1).width = 4;   // margem
  swot.getColumn(2).width = 40;  // Forças / Fraquezas
  swot.getColumn(3).width = 3;   // divisor
  swot.getColumn(4).width = 40;  // Oportunidades / Ameaças

  swot.mergeCells('A1:D1');
  const sw1 = swot.getCell('A1');
  sw1.value = 'Matriz SWOT — Análise Estratégica do Negócio';
  sw1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  sw1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  sw1.alignment = { horizontal: 'center', vertical: 'middle' };
  swot.getRow(1).height = 28;

  swot.mergeCells('A2:D2');
  const sw2 = swot.getCell('A2');
  sw2.value = 'Análise pré-preenchida com base no seu diagnóstico. Adicione mais pontos nas linhas em branco de cada quadrante.';
  sw2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  sw2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  sw2.alignment = { horizontal: 'center' };
  swot.getRow(2).height = 18;

  swot.getRow(3).height = 10;

  // Pontos pré-preenchidos baseados no diagnóstico
  const swotForcas: string[] = [];
  if (result.lucroReal > 0)             swotForcas.push('Negócio lucrativo — gera resultado positivo');
  if (result.margemLiquida >= 15)       swotForcas.push('Margem líquida saudável (acima de 15%)');
  if (result.margemLiquida >= 25)       swotForcas.push('Margem excelente — negócio com potencial escalável');
  if (input.faturamento > 0)            swotForcas.push('Faturamento ativo e recorrente');
  if (swotForcas.length === 0)          swotForcas.push('Negócio em operação — base para crescimento');

  const swotFraquezas: string[] = [];
  if (result.lucroReal < 0)             swotFraquezas.push('Negócio operando com prejuízo');
  if (result.margemLiquida < 5)         swotFraquezas.push('Margem líquida crítica (abaixo de 5%)');
  if (input.custoProductPercent > 55)   swotFraquezas.push(`Custo de produto elevado (${input.custoProductPercent}% — acima de 55%)`);
  if (input.taxaPercent > 12)           swotFraquezas.push(`Taxas de cartão/marketplace altas (${input.taxaPercent}%)`);
  if (result.sobraCaixa < 0)            swotFraquezas.push('Fluxo de caixa negativo — caixa comprometido');
  if (swotFraquezas.length === 0)       swotFraquezas.push('Identificar pontos de melhoria no negócio');

  const swotOportunidades = [
    'Otimizar precificação com base na margem de contribuição',
    'Focar nos produtos Classe A (maior faturamento e margem)',
    'Explorar novos canais de venda (online, marketplaces, WhatsApp)',
    'Fidelizar clientes para aumentar ticket médio e recorrência',
  ];

  const swotAmeacas = [
    'Aumento de custos fixos (aluguel, energia, pessoal)',
    'Inadimplência de clientes comprometendo o caixa',
    'Concorrência agressiva de preços no mercado',
    'Flutuações cambiais afetando custo de mercadorias',
  ];

  // Constantes do layout
  const SWOT_ROWS_PER_Q = 10; // linhas de conteúdo por quadrante (excluindo título)
  const swotTop = 4;           // linha de título dos quadrantes superiores
  const swotBot = swotTop + 1 + SWOT_ROWS_PER_Q + 1; // linha de título dos quadrantes inferiores

  // Helper: preenche coluna B ou D com título + itens + linhas em branco
  const fillSwotCol = (
    col: 'B' | 'D',
    startRow: number,
    title: string,
    bgColor: string,
    txtColor: string,
    items: string[],
  ) => {
    const titleCell = swot.getCell(`${col}${startRow}`);
    titleCell.value = title;
    titleCell.font  = { bold: true, size: 11, color: { argb: txtColor } };
    titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    swot.getRow(startRow).height = 26;

    for (let idx = 0; idx < SWOT_ROWS_PER_Q; idx++) {
      const r = startRow + 1 + idx;
      const cell = swot.getCell(`${col}${r}`);
      if (idx < items.length) {
        cell.value = items[idx];
        cell.font  = { size: 9, color: { argb: C.darkGray } };
      }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { wrapText: true, vertical: 'top' };
      swot.getRow(r).height = 20;
    }
  };

  fillSwotCol('B', swotTop, '  FORCAS (Interno — Positivo)',          'FFC6EFCE', C.greenText,  swotForcas);
  fillSwotCol('D', swotTop, '  OPORTUNIDADES (Externo — Positivo)',    'FFBBD6FB', 'FF1A4F8A',   swotOportunidades);
  fillSwotCol('B', swotBot, '  FRAQUEZAS (Interno — Negativo)',        C.redBg,    C.redText,    swotFraquezas);
  fillSwotCol('D', swotBot, '  AMEACAS (Externo — Negativo)',          'FFFFE0CC', 'FFCC6600',   swotAmeacas);

  // Colorir coluna divisória (C) e linha de separação
  for (let r = swotTop; r <= swotBot + SWOT_ROWS_PER_Q; r++) {
    swot.getCell(`C${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } };
  }
  swot.getRow(swotBot - 1).height = 8;

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 12 — PLANEJAMENTO ESTRATÉGICO
  // ══════════════════════════════════════════════════════════════════════════
  const strat = workbook.addWorksheet('Planejamento Estratégico', {
    properties: { tabColor: { argb: 'FF075985' } },
  });
  strat.getColumn(1).width = 16;
  strat.getColumn(2).width = 32;
  strat.getColumn(3).width = 32;
  strat.getColumn(4).width = 22;
  strat.getColumn(5).width = 18;
  strat.getColumn(6).width = 18;
  strat.getColumn(7).width = 16;

  strat.mergeCells('A1:G1');
  const st1 = strat.getCell('A1');
  st1.value = 'Planejamento Estratégico do Negócio';
  st1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  st1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF075985' } };
  st1.alignment = { horizontal: 'center', vertical: 'middle' };
  strat.getRow(1).height = 28;

  strat.getRow(2).height = 6;

  strat.mergeCells('A3:G3');
  applySection(strat.getCell('A3'), '  VISÃO DO NEGÓCIO');
  strat.getRow(3).height = 22;

  strat.mergeCells('A4:G4');
  const stVis = strat.getCell('A4');
  stVis.value = 'Escreva aqui sua visão: onde você quer que o negócio esteja em 3 anos?';
  stVis.font  = { size: 10, italic: true, color: { argb: C.gray } };
  stVis.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
  stVis.alignment = { wrapText: true, vertical: 'middle' };
  strat.getRow(4).height = 44;

  strat.getRow(5).height = 8;

  strat.mergeCells('A6:G6');
  applySection(strat.getCell('A6'), '  OBJETIVOS POR PERÍODO (pré-preenchidos com base no diagnóstico)');
  strat.getRow(6).height = 22;

  ['Período', 'Objetivo', 'Ação Principal', 'KPI (Indicador)', 'Meta', 'Responsável', 'Status'].forEach((h, i) => {
    const cell = strat.getRow(7).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.subHeaderBg, 10);
  });
  strat.getRow(7).height = 22;

  const isMargemBaixa = result.margemLiquida < 10;
  const isCustoAlto   = input.custoProductPercent > 55;

  const stratRows: Array<[string, string, string, string, string, string, string]> = [
    // Curto prazo — 30 dias
    [
      '30 dias',
      isMargemBaixa ? 'Aumentar margem líquida' : 'Otimizar precificação de produtos',
      isMargemBaixa ? 'Revisar preços e eliminar custos desnecessários' : 'Calcular margem de contribuição por produto',
      'Margem Líquida %',
      isMargemBaixa
        ? `De ${result.margemLiquida.toFixed(0)}% para ${(result.margemLiquida + 5).toFixed(0)}%`
        : '> 15%',
      'Dono(a)',
      'Pendente',
    ],
    [
      '30 dias',
      'Controlar o fluxo de caixa semanal',
      'Preencher a aba Fluxo de Caixa toda semana (30 min)',
      'Semanas com saldo positivo',
      '4 semanas consecutivas',
      'Dono(a)',
      'Pendente',
    ],
    [
      '30 dias',
      isCustoAlto ? 'Renegociar com fornecedores' : 'Identificar produtos mais lucrativos',
      isCustoAlto
        ? 'Solicitar desconto de 5-10% para pagamento à vista'
        : 'Usar a Curva ABC para classificar produtos por margem',
      isCustoAlto ? 'Custo produto %' : 'Produtos Classe A identificados',
      isCustoAlto
        ? `Reduzir de ${input.custoProductPercent}% para ${Math.max(input.custoProductPercent - 5, 40)}%`
        : '≥ 5 produtos Classe A',
      'Dono(a)',
      'Pendente',
    ],
    // Médio prazo — 90 dias
    [
      '90 dias',
      'Atingir o faturamento necessário',
      'Ampliar canais de venda e ações de marketing',
      'Faturamento Mensal',
      result.faturamentoNecessario === Infinity
        ? 'Superar ponto de equilíbrio'
        : `>= ${brl(result.faturamentoNecessario)}`,
      'Dono(a)',
      'Pendente',
    ],
    [
      '90 dias',
      'Montar reserva de emergência',
      'Guardar 10% do lucro mensal até atingir 1 mês de custos fixos',
      'Reserva acumulada (R$)',
      brl(input.custosFixos),
      'Dono(a)',
      'Pendente',
    ],
    [
      '90 dias',
      'Sistematizar processos de compras',
      'Definir dias fixos e critérios objetivos para comprar mercadoria',
      'Compras planejadas vs. impulsivas',
      '100% planejado',
      'Dono(a)',
      'Pendente',
    ],
    // Longo prazo — 1 ano
    [
      '1 ano',
      result.margemLiquida < 15
        ? 'Alcançar margem líquida de 15%+'
        : 'Expandir para novos canais de venda',
      result.margemLiquida < 15
        ? 'Otimizar mix de produtos e renegociar todos os contratos'
        : 'Lançar loja online ou novo marketplace',
      result.margemLiquida < 15 ? 'Margem Líquida' : 'Canais de venda ativos',
      result.margemLiquida < 15 ? '>= 15%' : '>= 3 canais',
      'Dono(a)',
      'Pendente',
    ],
    [
      '1 ano',
      'Aumentar faturamento em 20%',
      'Combinar novos canais, fidelização e mix de produtos otimizado',
      'Faturamento Mensal',
      brl(input.faturamento * 1.2),
      'Dono(a)',
      'Pendente',
    ],
    [
      '1 ano',
      'Refazer o Raio-X e comparar evolução',
      'Usar o Raio-X do Negócio para medir progresso em todas as métricas',
      'Classificação do negócio',
      classification.level === 'prejuizo'
        ? 'Estável'
        : classification.level === 'sobrevivendo'
        ? 'Saudável'
        : 'Escalável',
      'Dono(a)',
      'Pendente',
    ],
  ];

  const stratPeriodColors: Record<string, string> = {
    '30 dias': 'FFE0F2FE',
    '90 dias': 'FFFFF9C4',
    '1 ano':   'FFC6EFCE',
  };

  stratRows.forEach(([periodo, objetivo, acao, kpi, meta, resp, status], i) => {
    const r = 8 + i;
    const row = strat.getRow(r);
    row.height = 22;
    const bg = stratPeriodColors[periodo] ?? C.altRow;
    [periodo, objetivo, acao, kpi, meta, resp, status].forEach((v, col) => {
      const cell = row.getCell(col + 1);
      cell.value = v;
      cell.font  = { size: 9, bold: col === 0 };
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: col === 0 ? 'center' : 'left' };
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 13 — PLANO DE AÇÃO 30/60/90
  // ══════════════════════════════════════════════════════════════════════════
  const plan = workbook.addWorksheet('Plano de Ação 30/60/90', {
    properties: { tabColor: { argb: 'FF0F766E' } },
  });
  plan.getColumn(1).width = 14;
  plan.getColumn(2).width = 42;
  plan.getColumn(3).width = 52;
  plan.getColumn(4).width = 16;
  plan.getColumn(5).width = 20;

  plan.mergeCells('A1:E1');
  const pl1 = plan.getCell('A1');
  pl1.value = 'Plano de Ação 30 / 60 / 90 Dias';
  pl1.font  = { bold: true, size: 14, color: { argb: C.headerText } };
  pl1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
  pl1.alignment = { horizontal: 'center', vertical: 'middle' };
  plan.getRow(1).height = 28;

  plan.mergeCells('A2:E2');
  const pl2 = plan.getCell('A2');
  pl2.value = `Plano personalizado para o nível "${classification.label}" — ${classification.description}. Atualize o Status conforme avança.`;
  pl2.font  = { size: 9, italic: true, color: { argb: C.darkGray } };
  pl2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  pl2.alignment = { horizontal: 'center', wrapText: true };
  plan.getRow(2).height = 18;

  plan.getRow(3).height = 8;

  ['Período', 'Tarefa', 'Detalhe', 'Categoria', 'Status'].forEach((h, i) => {
    const cell = plan.getRow(4).getCell(i + 1);
    cell.value = h;
    applyHeader(cell, C.headerBg, 10);
  });
  plan.getRow(4).height = 22;

  const checklistItems = getChecklist(classification.level);

  const planPeriodColors: Record<string, string> = {
    '30': 'FFE0F2FE',
    '60': 'FFFFF9C4',
    '90': 'FFC6EFCE',
  };
  const planPeriodLabels: Record<string, string> = {
    '30': '30 dias',
    '60': '60 dias',
    '90': '90 dias',
  };

  checklistItems.forEach((item, i) => {
    const r = 5 + i;
    const row = plan.getRow(r);
    row.height = 24;
    const bg = planPeriodColors[item.phase] ?? C.altRow;

    row.getCell(1).value = planPeriodLabels[item.phase] ?? item.phase;
    row.getCell(1).font  = { bold: true, size: 9 };
    row.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    row.getCell(2).value = item.task;
    row.getCell(2).font  = { bold: true, size: 9 };
    row.getCell(2).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(2).alignment = { wrapText: true, vertical: 'middle' };

    row.getCell(3).value = item.detail;
    row.getCell(3).font  = { size: 9, color: { argb: C.darkGray } };
    row.getCell(3).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(3).alignment = { wrapText: true, vertical: 'middle' };

    row.getCell(4).value = item.category;
    row.getCell(4).font  = { size: 9 };
    row.getCell(4).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

    row.getCell(5).value = 'Pendente';
    row.getCell(5).font  = { size: 9 };
    row.getCell(5).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ─── Gera e baixa o arquivo ───────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `raio-x-${(businessName || 'meu-negocio')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}.xlsx`;
  downloadBlob(blob, filename);
}
