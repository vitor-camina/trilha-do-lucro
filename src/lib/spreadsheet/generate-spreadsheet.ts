import type { DiagnosticInput, DiagnosticResult, BusinessClassification } from '@/types';
import { downloadBlob } from '@/lib/download';

// ─── Paleta de cores (ARGB) ──────────────────────────────────────────────────
const C = {
  headerBg:   'FF1B5E20',  // Verde Floresta
  headerText: 'FFFFFFFF',  // branco
  inputBg:    'FFFFF9C4',  // amarelo claro (campos do usuário)
  inputBdr:   'FFF9A825',  // Dourado (borda dos campos de entrada)
  greenBg:    'FFC8E6C9',  // verde claro (resultado positivo)
  greenText:  'FF1B5E20',  // verde escuro
  redBg:      'FFFFCDD2',  // vermelho claro (resultado negativo)
  redText:    'FFC62828',  // vermelho escuro
  yellowBg:   'FFFFF9C4',  // amarelo claro
  yellowText: 'FFF57F17',  // amarelo escuro
  altRow:     'FFF5F5F5',  // cinza clarinho (linhas alternadas)
  sectionBg:  'FFE8F5E9',  // seção verde clarinho
  gray:       'FF757575',
  darkGray:   'FF212121',
  borderColor:'FFBDBDBD',
  redSection: 'FFFFEBEE',  // sobrevivência
  yelSection: 'FFFFFDE7',  // conforto
  grnSection: 'FFF1F8E9',  // crescimento
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeMerge(ws: any, range: string) {
  try { ws.mergeCells(range); } catch (_e) { /* already merged */ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hdr(cell: any, text: string, size = 11, align: 'left'|'center'|'right' = 'center') {
  cell.value = text;
  cell.font  = { bold: true, color: { argb: C.headerText }, size, name: 'Arial' };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  cell.alignment = { horizontal: align, vertical: 'middle', wrapText: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function label(cell: any, text: string, bold = false, size = 11) {
  cell.value = text;
  cell.font  = { bold, size, name: 'Arial', color: { argb: C.darkGray } };
  cell.alignment = { vertical: 'middle', wrapText: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function inputCell(cell: any, value?: number | string) {
  if (value !== undefined) cell.value = value;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
  cell.border = {
    top:    { style: 'thin', color: { argb: C.inputBdr } },
    bottom: { style: 'thin', color: { argb: C.inputBdr } },
    left:   { style: 'thin', color: { argb: C.inputBdr } },
    right:  { style: 'thin', color: { argb: C.inputBdr } },
  };
  cell.alignment = { horizontal: 'right', vertical: 'middle' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resultCell(cell: any, formula: string, numFmt: string, positive?: boolean) {
  cell.value  = { formula };
  cell.numFmt = numFmt;
  cell.font   = { bold: true, size: 11, name: 'Arial' };
  cell.fill   = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: positive === undefined ? C.altRow : positive ? C.greenBg : C.redBg },
  };
  cell.alignment = { horizontal: 'right', vertical: 'middle' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instrRow(ws: any, row: number, cols: string, text: string) {
  safeMerge(ws, `A${row}:${cols}${row}`);
  const c = ws.getCell(`A${row}`);
  c.value = text;
  c.font  = { italic: true, size: 10, color: { argb: C.gray }, name: 'Arial' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
  ws.getRow(row).height = 28;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sectionRow(ws: any, row: number, cols: string, text: string, bg = C.headerBg) {
  safeMerge(ws, `A${row}:${cols}${row}`);
  const c = ws.getCell(`A${row}`);
  c.value = text;
  c.font  = { bold: true, size: 11, color: { argb: C.headerText }, name: 'Arial' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
  c.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(row).height = 22;
}

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
  workbook.creator = 'Trilha do Lucro';
  workbook.created = new Date();

  const mc = 1
    - (input.custoProductPercent / 100)
    - (input.taxaPercent / 100)
    - (input.fretePercentual / 100);
  const mcSafe = mc <= 0 ? 0.01 : mc; // guard against division by zero

  const peSobrevivencia = input.custosFixos / mcSafe;
  const peConforto      = (input.custosFixos + input.proLabore) / mcSafe;
  const peCrescimento   = (input.custosFixos + input.proLabore) * 1.2 / mcSafe;

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 1 — MEU DIAGNÓSTICO
  // ══════════════════════════════════════════════════════════════════════════
  const diag = workbook.addWorksheet('Meu Diagnóstico', {
    properties: { tabColor: { argb: C.headerBg } },
  });
  diag.getColumn(1).width = 36;
  diag.getColumn(2).width = 22;
  diag.getColumn(3).width = 42;

  // Título
  safeMerge(diag, 'A1:C1');
  const d1 = diag.getCell('A1');
  d1.value = `Trilha do Lucro — ${businessName || 'Meu Negócio'}`;
  d1.font  = { bold: true, size: 16, color: { argb: C.headerText }, name: 'Arial' };
  d1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  d1.alignment = { horizontal: 'center', vertical: 'middle' };
  diag.getRow(1).height = 36;

  // Data
  safeMerge(diag, 'A2:C2');
  const d2 = diag.getCell('A2');
  d2.value = `Diagnóstico Financeiro gerado em ${new Date().toLocaleDateString('pt-BR')}`;
  d2.font  = { italic: true, size: 10, color: { argb: C.gray }, name: 'Arial' };
  d2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } };
  d2.alignment = { horizontal: 'center' };
  diag.getRow(2).height = 18;

  instrRow(diag, 3, 'C', 'Aqui estão os dados que você informou no quiz e o resultado do seu diagnóstico. Confira os números e entenda o que eles significam para o seu negócio.');

  // ── Dados de entrada ─────────────────────────────────────────────────────
  sectionRow(diag, 4, 'C', '  DADOS DO SEU NEGÓCIO (informados no quiz)');

  const inputRows: [string, number, string, string][] = [
    ['Faturamento Mensal',         input.faturamento,            'R$ #,##0.00', 'Quanto entrou no caixa no mês'],
    ['Custos Fixos Mensais',       input.custosFixos,            'R$ #,##0.00', 'Aluguel, salários, contas fixas…'],
    ['Custo do Produto (%)',       input.custoProductPercent,    '0.0"%"',      'Quanto do faturamento vai para pagar fornecedor'],
    ['Taxas e Impostos (%)',       input.taxaPercent,            '0.0"%"',      'Cartão, marketplace, imposto…'],
    ['Frete (%)',                  input.fretePercentual,        '0.0"%"',      'Custo de envio sobre o faturamento'],
    ['Seu Salário (Pró-labore)',   input.proLabore,              'R$ #,##0.00', 'O valor que você tira para pagar suas contas pessoais'],
  ];

  inputRows.forEach(([name, value, fmt, explanation], i) => {
    const r = 5 + i;
    diag.getRow(r).height = 22;
    const a = diag.getCell(`A${r}`);
    a.value = name;
    a.font  = { size: 11, name: 'Arial', color: { argb: C.darkGray } };
    a.fill  = i % 2 === 0
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    a.alignment = { vertical: 'middle' };

    const b = diag.getCell(`B${r}`);
    b.value  = value;
    b.numFmt = fmt;
    b.font   = { bold: true, size: 11, name: 'Arial' };
    b.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputBg } };
    b.alignment = { horizontal: 'right', vertical: 'middle' };

    const c = diag.getCell(`C${r}`);
    c.value = explanation;
    c.font  = { italic: true, size: 10, color: { argb: C.gray }, name: 'Arial' };
    c.fill  = i % 2 === 0
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    c.alignment = { vertical: 'middle', wrapText: true };
  });

  diag.getRow(11).height = 8; // espaço

  // ── Resultados ───────────────────────────────────────────────────────────
  sectionRow(diag, 12, 'C', '  RESULTADO DO SEU DIAGNÓSTICO');

  const lucroPositivo = result.lucroReal >= 0;
  const margemPositiva = result.margemLiquida >= 10;

  const resultRows: [string, string, string, boolean, string][] = [
    [
      'Lucro Real',
      brl(result.lucroReal),
      'R$ #,##0.00',
      lucroPositivo,
      lucroPositivo
        ? `Parabéns! De cada R$100 que entra, R$${(result.margemLiquida).toFixed(0)} sobra pra você.`
        : `Atenção: você está operando com prejuízo de ${brl(Math.abs(result.lucroReal))} por mês.`,
    ],
    [
      'Margem Líquida',
      `${result.margemLiquida.toFixed(1)}%`,
      '0.0"%"',
      margemPositiva,
      margemPositiva
        ? 'Sua margem está saudável. Acima de 10% já é um bom sinal.'
        : 'Margem abaixo de 10% — verifique preços e custos com urgência.',
    ],
    [
      'Ponto de Equilíbrio (Sobrevivência)',
      brl(peSobrevivencia),
      'R$ #,##0.00',
      input.faturamento >= peSobrevivencia,
      input.faturamento >= peSobrevivencia
        ? `Você já passou do ponto mínimo (${brl(peSobrevivencia)}). Ótimo!`
        : `Você ainda não atingiu o mínimo para cobrir seus gastos fixos.`,
    ],
    [
      'Classificação',
      `${classification.emoji} ${classification.label}`,
      '@',
      !['prejuizo', 'sobrevivendo'].includes(classification.level),
      classification.description,
    ],
  ];

  resultRows.forEach(([name, value, , positive, explanation], i) => {
    const r = 13 + i;
    diag.getRow(r).height = 28;

    const a = diag.getCell(`A${r}`);
    a.value = name;
    a.font  = { bold: true, size: 11, name: 'Arial', color: { argb: C.darkGray } };
    a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: positive ? C.greenBg : C.redBg } };
    a.alignment = { vertical: 'middle' };

    const b = diag.getCell(`B${r}`);
    b.value = value;
    b.font  = { bold: true, size: 13, name: 'Arial', color: { argb: positive ? C.greenText : C.redText } };
    b.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: positive ? C.greenBg : C.redBg } };
    b.alignment = { horizontal: 'right', vertical: 'middle' };

    const c = diag.getCell(`C${r}`);
    c.value = explanation;
    c.font  = { italic: true, size: 10, name: 'Arial', color: { argb: positive ? C.greenText : C.redText } };
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: positive ? C.greenBg : C.redBg } };
    c.alignment = { vertical: 'middle', wrapText: true };
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 2 — META DE VENDAS
  // ══════════════════════════════════════════════════════════════════════════
  const meta = workbook.addWorksheet('Meta de Vendas', {
    properties: { tabColor: { argb: 'FF388E3C' } },
  });
  meta.getColumn(1).width = 28;
  meta.getColumn(2).width = 22;
  meta.getColumn(3).width = 22;
  meta.getColumn(4).width = 22;
  meta.getColumn(5).width = 38;

  safeMerge(meta, 'A1:E1');
  hdr(meta.getCell('A1'), 'Meta de Vendas — Trilha do Lucro', 14);
  meta.getRow(1).height = 32;

  instrRow(meta, 2, 'E', 'Veja quanto você precisa vender em cada cenário. Os valores são calculados automaticamente com base no seu diagnóstico.');

  // Cabeçalho da tabela de referência
  sectionRow(meta, 3, 'E', '  FÓRMULA UTILIZADA', C.headerBg);

  safeMerge(meta, 'A4:E4');
  const mf = meta.getCell('A4');
  mf.value = `Margem de Contribuição = 1 − Custo Produto% − Taxas% − Frete% = ${(mc * 100).toFixed(1)}%   |   Meta = Gastos ÷ Margem de Contribuição`;
  mf.font  = { size: 10, italic: true, color: { argb: C.darkGray }, name: 'Arial' };
  mf.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  mf.alignment = { horizontal: 'center', wrapText: true };
  meta.getRow(4).height = 22;

  meta.getRow(5).height = 8;

  // Cabeçalhos da tabela
  ['Cenário', 'Meta Mensal', 'Meta Semanal (÷4)', 'Meta Diária (÷30)', 'O que significa'].forEach((h, i) => {
    const c = meta.getRow(6).getCell(i + 1);
    hdr(c, h, 11);
  });
  meta.getRow(6).height = 22;

  const mcCell = mc; // já calculado
  const scenarioData = [
    {
      label:   '🔴 Sobrevivência',
      monthly: peSobrevivencia,
      bg:      C.redBg,
      text:    C.redText,
      bgLight: C.redSection,
      desc:    `Pra pagar suas contas fixas. Você PRECISA vender pelo menos ${brl(peSobrevivencia)} por mês.`,
    },
    {
      label:   '🟡 Conforto',
      monthly: peConforto,
      bg:      C.yellowBg,
      text:    C.yellowText,
      bgLight: C.yelSection,
      desc:    `Para cobrir gastos fixos + seu salário de ${brl(input.proLabore)}. Meta ideal para o mês.`,
    },
    {
      label:   '🟢 Crescimento',
      monthly: peCrescimento,
      bg:      C.greenBg,
      text:    C.greenText,
      bgLight: C.grnSection,
      desc:    `Cobre tudo + 20% para reinvestir na loja e crescer. Busque este número todo mês!`,
    },
  ];

  scenarioData.forEach((s, i) => {
    const r = 7 + i;
    meta.getRow(r).height = 30;

    const a = meta.getRow(r).getCell(1);
    a.value = s.label;
    a.font  = { bold: true, size: 12, name: 'Arial', color: { argb: s.text } };
    a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: s.bg } };
    a.alignment = { horizontal: 'center', vertical: 'middle' };

    const monthly = s.monthly;
    [monthly, monthly / 4, monthly / 30].forEach((v, j) => {
      const c = meta.getRow(r).getCell(j + 2);
      c.value  = v;
      c.numFmt = 'R$ #,##0.00';
      c.font   = { bold: true, size: 12, name: 'Arial', color: { argb: s.text } };
      c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: s.bgLight } };
      c.alignment = { horizontal: 'right', vertical: 'middle' };
    });

    const e = meta.getRow(r).getCell(5);
    e.value = s.desc;
    e.font  = { size: 10, italic: true, name: 'Arial', color: { argb: s.text } };
    e.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: s.bgLight } };
    e.alignment = { wrapText: true, vertical: 'middle' };
  });

  // Nota explicativa sobre margem de contribuição
  meta.getRow(11).height = 8;
  safeMerge(meta, 'A12:E12');
  const mn = meta.getCell('A12');
  mn.value = `ℹ️  Margem de Contribuição usada: ${(mcCell * 100).toFixed(1)}% — calculada como: 100% − ${input.custoProductPercent}% (produto) − ${input.taxaPercent}% (taxas) − ${input.fretePercentual}% (frete)`;
  mn.font  = { size: 9, italic: true, color: { argb: C.gray }, name: 'Arial' };
  mn.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  mn.alignment = { horizontal: 'center', wrapText: true };
  meta.getRow(12).height = 22;

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 3 — MEUS GASTOS FIXOS
  // ══════════════════════════════════════════════════════════════════════════
  const gastos = workbook.addWorksheet('Meus Gastos Fixos', {
    properties: { tabColor: { argb: 'FFF57F17' } },
  });
  gastos.getColumn(1).width = 36;
  gastos.getColumn(2).width = 22;
  gastos.getColumn(3).width = 20;

  safeMerge(gastos, 'A1:C1');
  hdr(gastos.getCell('A1'), 'Meus Gastos Fixos — Trilha do Lucro', 14);
  gastos.getRow(1).height = 32;

  instrRow(gastos, 2, 'C', 'Preencha os campos em amarelo com seus gastos mensais. Se não tem aquele gasto, deixe zero. O total será calculado automaticamente.');

  // Cabeçalhos
  ['Categoria de Gasto', 'Valor Mensal (R$)', '% do Total'].forEach((h, i) => {
    hdr(gastos.getRow(3).getCell(i + 1), h, 11);
  });
  gastos.getRow(3).height = 22;

  const gastosCategories = [
    'Aluguel',
    'Energia Elétrica / Água',
    'Internet / Telefone',
    'Funcionários (salários + encargos)',
    'Contador / Escritório Contábil',
    'Sistema / Software',
    'Marketing e Publicidade',
    'Seguros',
    'Material de Limpeza / Escritório',
    'Pró-labore (seu salário)',
    'Outros',
  ];
  const proLaboreGastosIdx = gastosCategories.indexOf('Pró-labore (seu salário)');

  const firstDataRow = 4;
  const lastDataRow  = firstDataRow + gastosCategories.length - 1; // row 13

  gastosCategories.forEach((cat, i) => {
    const r = firstDataRow + i;
    gastos.getRow(r).height = 22;

    const a = gastos.getCell(`A${r}`);
    a.value = cat;
    a.font  = { size: 11, name: 'Arial', color: { argb: C.darkGray } };
    a.fill  = i % 2 === 0
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    a.alignment = { vertical: 'middle' };

    // B = valor (amarelo, editável) — pró-labore pré-preenchido com input.proLabore
    const b = gastos.getCell(`B${r}`);
    b.value  = i === proLaboreGastosIdx ? input.proLabore : 0;
    b.numFmt = 'R$ #,##0.00';
    inputCell(b);
    b.alignment = { horizontal: 'right', vertical: 'middle' };

    // C = % do total
    const c = gastos.getCell(`C${r}`);
    c.value  = { formula: `IF(B${lastDataRow + 1}=0,0,B${r}/B${lastDataRow + 1})` };
    c.numFmt = '0.0%';
    c.font   = { size: 11, name: 'Arial' };
    c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Total
  const totR = lastDataRow + 1;
  gastos.getRow(totR).height = 26;
  safeMerge(gastos, `A${totR}:A${totR}`); // no merge needed, just style

  const ta = gastos.getCell(`A${totR}`);
  ta.value = 'TOTAL GASTOS FIXOS';
  ta.font  = { bold: true, size: 12, name: 'Arial', color: { argb: C.headerText } };
  ta.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  ta.alignment = { vertical: 'middle' };

  const tb = gastos.getCell(`B${totR}`);
  tb.value  = { formula: `SUM(B${firstDataRow}:B${lastDataRow})` };
  tb.numFmt = 'R$ #,##0.00';
  tb.font   = { bold: true, size: 12, name: 'Arial', color: { argb: C.headerText } };
  tb.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  tb.alignment = { horizontal: 'right', vertical: 'middle' };

  const tc = gastos.getCell(`C${totR}`);
  tc.value = '100%';
  tc.font  = { bold: true, size: 12, name: 'Arial', color: { argb: C.headerText } };
  tc.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  tc.alignment = { horizontal: 'center', vertical: 'middle' };

  // Nota: total do diagnóstico
  gastos.getRow(totR + 2).height = 22;
  safeMerge(gastos, `A${totR + 2}:C${totR + 2}`);
  const gn = gastos.getCell(`A${totR + 2}`);
  gn.value = `ℹ️  No seu diagnóstico você informou ${brl(input.custosFixos)} de gastos fixos. Pró-labore (${brl(input.proLabore)}) já foi pré-preenchido. Distribua os demais valores pelas categorias acima.`;
  gn.font  = { italic: true, size: 10, color: { argb: C.gray }, name: 'Arial' };
  gn.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  gn.alignment = { wrapText: true, vertical: 'middle' };

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 4 — FORMAÇÃO DE PREÇO
  // ══════════════════════════════════════════════════════════════════════════
  const prec = workbook.addWorksheet('Formação de Preço', {
    properties: { tabColor: { argb: 'FF0277BD' } },
  });
  prec.getColumn(1).width = 26;
  prec.getColumn(2).width = 16;
  prec.getColumn(3).width = 20;
  prec.getColumn(4).width = 20;
  prec.getColumn(5).width = 24;

  safeMerge(prec, 'A1:E1');
  hdr(prec.getCell('A1'), 'Formação de Preço — Trilha do Lucro', 14);
  prec.getRow(1).height = 32;

  instrRow(prec, 2, 'E', 'Coloque o custo do produto e a margem que deseja. A planilha calcula o preço de venda já com impostos e frete.');

  // Tabela de referência de margem
  sectionRow(prec, 3, 'E', '  MARGENS COMUNS POR TIPO DE LOJA (referência)');

  const refData = [
    ['Roupas / Calçados',       '80–120%'],
    ['Acessórios / Bijuterias', '100–200%'],
    ['Alimentos',               '30–50%'],
    ['Eletrônicos',             '20–40%'],
    ['Cosméticos',              '50–100%'],
    ['Pet Shop',                '40–80%'],
  ];

  safeMerge(prec, 'A4:B4');
  hdr(prec.getCell('A4'), 'Tipo de Loja', 10);
  prec.getCell('C4').value = 'Margem Comum';
  hdr(prec.getCell('C4'), 'Margem Comum', 10);
  prec.getRow(4).height = 20;

  refData.forEach(([tipo, margem], i) => {
    const r = 5 + i;
    prec.getRow(r).height = 18;
    safeMerge(prec, `A${r}:B${r}`);
    const a = prec.getCell(`A${r}`);
    a.value = tipo;
    a.font  = { size: 10, name: 'Arial' };
    a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.altRow : 'FFFFFFFF' } };
    a.alignment = { vertical: 'middle' };

    const c = prec.getCell(`C${r}`);
    c.value = margem;
    c.font  = { bold: true, size: 10, name: 'Arial', color: { argb: C.greenText } };
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? C.altRow : 'FFFFFFFF' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  prec.getRow(11).height = 8;

  // Calculadora de preços
  sectionRow(prec, 12, 'E', '  CALCULADORA DE PREÇOS (preencha as colunas em amarelo)');

  const precHdrs = ['Produto', 'Custo Unit. (R$)', 'Margem Desejada (%)', 'Preço Sugerido', 'Com Taxas e Frete'];
  precHdrs.forEach((h, i) => {
    hdr(prec.getRow(13).getCell(i + 1), h, 10);
  });
  prec.getRow(13).height = 22;

  for (let i = 0; i < 10; i++) {
    const r = 14 + i;
    prec.getRow(r).height = 22;

    const a = prec.getCell(`A${r}`);
    a.value = '';
    inputCell(a);
    a.alignment = { horizontal: 'left', vertical: 'middle' };

    const b = prec.getCell(`B${r}`);
    b.value  = 0;
    b.numFmt = 'R$ #,##0.00';
    inputCell(b);

    const c = prec.getCell(`C${r}`);
    c.value  = 0;
    c.numFmt = '0.0"%"';
    inputCell(c);

    // Preço sugerido: custo * (1 + margem/100)
    const d = prec.getCell(`D${r}`);
    d.value  = { formula: `IF(B${r}=0,"",B${r}*(1+C${r}/100))` };
    d.numFmt = 'R$ #,##0.00';
    d.font   = { bold: true, size: 11, name: 'Arial' };
    d.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
    d.alignment = { horizontal: 'right', vertical: 'middle' };

    // Com taxas e frete: preço / (1 - taxaPercent/100 - fretePercentual/100)
    const divisor = 1 - (input.taxaPercent / 100) - (input.fretePercentual / 100);
    const divisorSafe = divisor <= 0 ? 0.01 : divisor;
    const e = prec.getCell(`E${r}`);
    e.value  = { formula: `IF(D${r}="","",D${r}/${divisorSafe})` };
    e.numFmt = 'R$ #,##0.00';
    e.font   = { bold: true, size: 11, name: 'Arial', color: { argb: C.greenText } };
    e.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
    e.alignment = { horizontal: 'right', vertical: 'middle' };
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 5 — MEU DINHEIRO NO MÊS
  // ══════════════════════════════════════════════════════════════════════════
  const fluxo = workbook.addWorksheet('Meu Dinheiro no Mês', {
    properties: { tabColor: { argb: 'FF6A1B9A' } },
  });
  fluxo.getColumn(1).width = 42;
  fluxo.getColumn(2).width = 22;
  fluxo.getColumn(3).width = 40;

  safeMerge(fluxo, 'A1:C1');
  hdr(fluxo.getCell('A1'), 'Meu Dinheiro no Mês — Trilha do Lucro', 14);
  fluxo.getRow(1).height = 32;

  instrRow(fluxo, 2, 'C', 'Preencha os campos em amarelo. Veja para onde o seu dinheiro vai e quanto sobra (ou falta) no final do mês.');

  let fr = 3; // row counter

  // ── SEÇÃO A: OPERACIONAL ─────────────────────────────────────────────────
  fluxo.getRow(fr).height = 8; fr++;

  sectionRow(fluxo, fr, 'C', '  SEÇÃO A — OPERACIONAL (Dinheiro das Vendas)'); fr++;

  // Helper para linha de fluxo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function flxRow(ws: any, r: number, prefix: string, labelText: string, colB: number | { formula: string } | null, fmt: string, note: string, isResult = false) {
    ws.getRow(r).height = 22;
    const a = ws.getCell(`A${r}`);
    a.value = `${prefix} ${labelText}`;
    a.font  = { bold: isResult, size: isResult ? 12 : 11, name: 'Arial', color: { argb: isResult ? C.headerBg : C.darkGray } };
    a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: isResult ? C.greenBg : 'FFFFFFFF' } };
    a.alignment = { vertical: 'middle' };

    const b = ws.getCell(`B${r}`);
    if (colB !== null && typeof colB === 'object' && 'formula' in colB) {
      b.value = colB;
    } else if (colB !== null) {
      b.value = colB as number;
    }
    b.numFmt = fmt;
    if (isResult) {
      b.font = { bold: true, size: 12, name: 'Arial' };
      b.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
    } else if (colB !== null && typeof colB !== 'object') {
      inputCell(b);
    } else {
      b.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
      b.font = { size: 11, name: 'Arial' };
    }
    b.alignment = { horizontal: 'right', vertical: 'middle' };

    const c = ws.getCell(`C${r}`);
    c.value = note;
    c.font  = { italic: true, size: 10, name: 'Arial', color: { argb: C.gray } };
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: isResult ? C.greenBg : 'FFFFFFFF' } };
    c.alignment = { vertical: 'middle', wrapText: true };
  }

  // Rows A
  const rowReceitaVendas = fr;
  flxRow(fluxo, fr, '(+)', 'Receita de Vendas', input.faturamento, 'R$ #,##0.00', 'Quanto entrou de vendas no mês'); fr++;

  const rowCMV = fr;
  fluxo.getRow(fr).height = 22;
  fluxo.getCell(`A${fr}`).value = '(-) Custo das Mercadorias Vendidas';
  fluxo.getCell(`A${fr}`).font  = { size: 11, name: 'Arial', color: { argb: C.darkGray } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowReceitaVendas}*${input.custoProductPercent / 100}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { size: 11, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).value = `Receita × ${input.custoProductPercent}% — custo com fornecedor`;
  fluxo.getCell(`C${fr}`).font  = { italic: true, size: 10, name: 'Arial', color: { argb: C.gray } };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  fr++;

  const rowTaxas = fr;
  fluxo.getRow(fr).height = 22;
  fluxo.getCell(`A${fr}`).value = '(-) Taxas e Impostos sobre Vendas';
  fluxo.getCell(`A${fr}`).font  = { size: 11, name: 'Arial', color: { argb: C.darkGray } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowReceitaVendas}*${input.taxaPercent / 100}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { size: 11, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).value = `Receita × ${input.taxaPercent}% — cartão, marketplace, impostos`;
  fluxo.getCell(`C${fr}`).font  = { italic: true, size: 10, name: 'Arial', color: { argb: C.gray } };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fr++;

  const rowFrete = fr;
  fluxo.getRow(fr).height = 22;
  fluxo.getCell(`A${fr}`).value = '(-) Frete sobre Vendas';
  fluxo.getCell(`A${fr}`).font  = { size: 11, name: 'Arial', color: { argb: C.darkGray } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowReceitaVendas}*${input.fretePercentual / 100}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { size: 11, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).value = `Receita × ${input.fretePercentual}% — custo de envio`;
  fluxo.getCell(`C${fr}`).font  = { italic: true, size: 10, name: 'Arial', color: { argb: C.gray } };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  fr++;

  // Sobra das vendas
  const rowSobraVendas = fr;
  fluxo.getRow(fr).height = 26;
  safeMerge(fluxo, `A${fr}:A${fr}`);
  fluxo.getCell(`A${fr}`).value = '(=) Sobra das Vendas';
  fluxo.getCell(`A${fr}`).font  = { bold: true, size: 12, name: 'Arial', color: { argb: C.headerBg } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowReceitaVendas}-B${rowCMV}-B${rowTaxas}-B${rowFrete}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { bold: true, size: 12, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).value = 'Quanto sobra depois de pagar fornecedor, impostos e frete';
  fluxo.getCell(`C${fr}`).font  = { italic: true, size: 10, bold: true, name: 'Arial', color: { argb: C.greenText } };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  fluxo.getCell(`C${fr}`).alignment = { vertical: 'middle', wrapText: true };
  fr++;

  // Gastos fixos (pré-preenchido mas editável)
  const rowGastosFixos = fr;
  flxRow(fluxo, fr, '(-)', 'Gastos Fixos da Loja', input.custosFixos, 'R$ #,##0.00', 'Aluguel, contas, funcionários… (veja aba Meus Gastos Fixos)'); fr++;

  // Pró-labore
  const rowProLabore = fr;
  flxRow(fluxo, fr, '(-)', 'Seu Salário (Pró-labore)', input.proLabore, 'R$ #,##0.00', 'O que você tira para pagar suas contas pessoais'); fr++;

  // Resultado da operação
  const rowResultOp = fr;
  fluxo.getRow(fr).height = 30;
  fluxo.getCell(`A${fr}`).value = '(=) RESULTADO DA OPERAÇÃO';
  fluxo.getCell(`A${fr}`).font  = { bold: true, size: 13, name: 'Arial', color: { argb: C.headerBg } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowSobraVendas}-B${rowGastosFixos}-B${rowProLabore}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { bold: true, size: 13, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).value = 'Se positivo, sua loja dá lucro operando. Se negativo, o problema está na margem ou nos gastos fixos.';
  fluxo.getCell(`C${fr}`).font  = { italic: true, bold: true, size: 10, name: 'Arial', color: { argb: C.greenText } };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  fluxo.getCell(`C${fr}`).alignment = { vertical: 'middle', wrapText: true };
  fr++;

  fluxo.getRow(fr).height = 8; fr++;

  // ── SEÇÃO B: INVESTIMENTOS ───────────────────────────────────────────────
  sectionRow(fluxo, fr, 'C', '  SEÇÃO B — INVESTIMENTOS (Compras para a Loja)'); fr++;

  flxRow(fluxo, fr, '(-)', 'Compra de Equipamentos', 0, 'R$ #,##0.00', 'Computador, câmera, máquina de cartão…'); fr++;
  const rowInv1 = fr - 1;

  flxRow(fluxo, fr, '(-)', 'Reforma / Melhoria da Loja', 0, 'R$ #,##0.00', 'Pintura, mobiliário, layout…'); fr++;
  const rowInv2 = fr - 1;

  flxRow(fluxo, fr, '(-)', 'Compra de Estoque Extra', 0, 'R$ #,##0.00', 'Investimento em mercadoria além do normal'); fr++;
  const rowInv3 = fr - 1;

  const rowTotalInv = fr;
  fluxo.getRow(fr).height = 26;
  fluxo.getCell(`A${fr}`).value = '(=) Total Investido no Mês';
  fluxo.getCell(`A${fr}`).font  = { bold: true, size: 12, name: 'Arial', color: { argb: C.headerBg } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowInv1}+B${rowInv2}+B${rowInv3}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { bold: true, size: 12, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fr++;

  fluxo.getRow(fr).height = 8; fr++;

  // ── SEÇÃO C: FINANCIAMENTOS ──────────────────────────────────────────────
  sectionRow(fluxo, fr, 'C', '  SEÇÃO C — FINANCIAMENTOS (Empréstimos e Parcelas)'); fr++;

  flxRow(fluxo, fr, '(-)', 'Parcelas de Empréstimo', 0, 'R$ #,##0.00', 'Banco, fintech, BNDES…'); fr++;
  const rowFin1 = fr - 1;

  flxRow(fluxo, fr, '(-)', 'Parcelas de Máquinas / Equipamentos', 0, 'R$ #,##0.00', 'Leasing, financiamento de equipamentos'); fr++;
  const rowFin2 = fr - 1;

  flxRow(fluxo, fr, '(+)', 'Dinheiro Emprestado Recebido', 0, 'R$ #,##0.00', 'Novo crédito recebido no mês'); fr++;
  const rowFin3 = fr - 1;

  const rowSaldoFin = fr;
  fluxo.getRow(fr).height = 26;
  fluxo.getCell(`A${fr}`).value = '(=) Saldo de Financiamentos';
  fluxo.getCell(`A${fr}`).font  = { bold: true, size: 12, name: 'Arial', color: { argb: C.headerBg } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowFin3}-B${rowFin1}-B${rowFin2}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { bold: true, size: 12, name: 'Arial' };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
  fr++;

  fluxo.getRow(fr).height = 8; fr++;

  // ── RESULTADO FINAL ──────────────────────────────────────────────────────
  sectionRow(fluxo, fr, 'C', '  RESULTADO FINAL DO MÊS'); fr++;

  const rowResultFinal = fr;
  fluxo.getRow(fr).height = 36;
  fluxo.getCell(`A${fr}`).value = '(=) QUANTO SOBROU (OU FALTOU) NO MÊS';
  fluxo.getCell(`A${fr}`).font  = { bold: true, size: 14, name: 'Arial', color: { argb: C.headerText } };
  fluxo.getCell(`A${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  fluxo.getCell(`A${fr}`).alignment = { vertical: 'middle' };
  fluxo.getCell(`B${fr}`).value  = { formula: `B${rowResultOp}-B${rowTotalInv}+B${rowSaldoFin}` };
  fluxo.getCell(`B${fr}`).numFmt = 'R$ #,##0.00';
  fluxo.getCell(`B${fr}`).font   = { bold: true, size: 14, name: 'Arial', color: { argb: C.headerText } };
  fluxo.getCell(`B${fr}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  fluxo.getCell(`B${fr}`).alignment = { horizontal: 'right', vertical: 'middle' };
  fluxo.getCell(`C${fr}`).value = 'Verde = sobrou dinheiro. Vermelho = faltou dinheiro no mês.';
  fluxo.getCell(`C${fr}`).font  = { italic: true, bold: true, size: 10, name: 'Arial', color: { argb: C.headerText } };
  fluxo.getCell(`C${fr}`).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  fluxo.getCell(`C${fr}`).alignment = { vertical: 'middle', wrapText: true };
  fr++;

  fluxo.getRow(fr).height = 8; fr++;

  // ── Tabela 12 meses ──────────────────────────────────────────────────────
  sectionRow(fluxo, fr, 'C', `  ACOMPANHAMENTO 12 MESES (preencha mês a mês — Mês 1 pré-preenchido com seu diagnóstico)`);
  fr++;

  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // Precisamos de 13 colunas (A + 12 meses) para a tabela anual
  // Coluna A = rótulo, B–M = Jan–Dez
  for (let col = 2; col <= 13; col++) {
    fluxo.getColumn(col).width = col === 2 ? 22 : 16;
  }
  // Coluna A mantém 42

  // Cabeçalhos dos meses
  const mHdrRow = fr;
  fluxo.getRow(fr).height = 20;
  fluxo.getCell(`A${fr}`).value = 'Indicador';
  hdr(fluxo.getCell(`A${fr}`), 'Indicador', 10);
  months.forEach((m, i) => {
    const cell = fluxo.getRow(fr).getCell(i + 2);
    hdr(cell, m, 10);
  });
  fr++;

  // ── TABELA 12 MESES DETALHADA ─────────────────────────────────────────────
  // Row offsets within the 12-month table (relative to dataStartRow)
  const OFF_OP_HDR      = 0;
  const OFF_RECEITA     = 1;
  const OFF_CUSTO       = 2;
  const OFF_TAXAS       = 3;
  const OFF_FRETE       = 4;
  const OFF_SOBRA       = 5;
  const OFF_GASTOS      = 6;
  const OFF_PROLABORE12 = 7;
  const OFF_RESULT_OP   = 8;
  const OFF_INV_HDR     = 9;
  const OFF_EQUIP       = 10;
  const OFF_REFORMA     = 11;
  const OFF_ESTOQUE     = 12;
  const OFF_TOTAL_INV   = 13;
  const OFF_FIN_HDR     = 14;
  const OFF_PARC_EMP    = 15;
  const OFF_PARC_MAQ    = 16;
  const OFF_DIN_EMP     = 17;
  const OFF_SALDO_FIN   = 18;
  const OFF_RESULT_FINAL = 19;

  const dataStartRow = fr;

  // Cross-sheet references into 'Meus Gastos Fixos'
  // gastosCategories has 11 items: firstDataRow=4, proLabore at index 9 → row 13, totRow=15
  const gfFirstDataRow = 4;
  const gfProLaboreRow = gfFirstDataRow + proLaboreGastosIdx; // row 13
  const gfTotalRow     = gfFirstDataRow + gastosCategories.length; // row 15
  // Gastos Fixos in P&L = total MINUS pró-labore (shown separately to avoid double-counting)
  const fGastosFixos = `'Meus Gastos Fixos'!$B$${gfTotalRow}-'Meus Gastos Fixos'!$B$${gfProLaboreRow}`;
  const fProLaboreXS = `'Meus Gastos Fixos'!$B$${gfProLaboreRow}`;

  // ── Column A: row labels ─────────────────────────────────────────────────
  const rowDefs12: { off: number; lbl: string; kind: 'section'|'input'|'formula'|'result'|'final' }[] = [
    { off: OFF_OP_HDR,       lbl: 'OPERACIONAL',              kind: 'section' },
    { off: OFF_RECEITA,      lbl: '(+) Receita de Vendas',    kind: 'input'   },
    { off: OFF_CUSTO,        lbl: '(-) Custo Mercadorias',    kind: 'formula' },
    { off: OFF_TAXAS,        lbl: '(-) Taxas e Impostos',     kind: 'formula' },
    { off: OFF_FRETE,        lbl: '(-) Frete',                kind: 'formula' },
    { off: OFF_SOBRA,        lbl: '(=) Sobra das Vendas',     kind: 'result'  },
    { off: OFF_GASTOS,       lbl: '(-) Gastos Fixos',         kind: 'formula' },
    { off: OFF_PROLABORE12,  lbl: '(-) Pró-labore',           kind: 'formula' },
    { off: OFF_RESULT_OP,    lbl: '(=) Resultado Operação',   kind: 'result'  },
    { off: OFF_INV_HDR,      lbl: 'INVESTIMENTOS',            kind: 'section' },
    { off: OFF_EQUIP,        lbl: '(-) Equipamentos',         kind: 'input'   },
    { off: OFF_REFORMA,      lbl: '(-) Reforma',              kind: 'input'   },
    { off: OFF_ESTOQUE,      lbl: '(-) Estoque Extra',        kind: 'input'   },
    { off: OFF_TOTAL_INV,    lbl: '(=) Total Investido',      kind: 'result'  },
    { off: OFF_FIN_HDR,      lbl: 'FINANCIAMENTOS',           kind: 'section' },
    { off: OFF_PARC_EMP,     lbl: '(-) Parcelas Empréstimo',  kind: 'input'   },
    { off: OFF_PARC_MAQ,     lbl: '(-) Parcelas Máquinas',    kind: 'input'   },
    { off: OFF_DIN_EMP,      lbl: '(+) Dinheiro Emprestado',  kind: 'input'   },
    { off: OFF_SALDO_FIN,    lbl: '(=) Saldo Financiamentos', kind: 'result'  },
    { off: OFF_RESULT_FINAL, lbl: '(=) RESULTADO FINAL',      kind: 'final'   },
  ];

  rowDefs12.forEach(({ off, lbl, kind }) => {
    const r = dataStartRow + off;
    fluxo.getRow(r).height = kind === 'final' ? 30 : kind === 'section' ? 22 : 20;
    const a = fluxo.getCell(`A${r}`);
    a.value = lbl;
    if (kind === 'section') {
      a.font  = { bold: true, size: 10, name: 'Arial', color: { argb: C.headerText } };
      a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    } else if (kind === 'result') {
      a.font  = { bold: true, size: 10, name: 'Arial', color: { argb: C.greenText } };
      a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
    } else if (kind === 'final') {
      a.font  = { bold: true, size: 11, name: 'Arial', color: { argb: C.headerText } };
      a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    } else {
      a.font  = { size: 10, name: 'Arial', color: { argb: C.darkGray } };
      a.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: off % 2 === 0 ? C.altRow : 'FFFFFFFF' } };
    }
    a.alignment = { vertical: 'middle', wrapText: true };
  });

  // ── Month columns B–M ────────────────────────────────────────────────────
  const rReceita12   = dataStartRow + OFF_RECEITA;
  const rCusto12     = dataStartRow + OFF_CUSTO;
  const rTaxas12     = dataStartRow + OFF_TAXAS;
  const rFrete12     = dataStartRow + OFF_FRETE;
  const rSobra12     = dataStartRow + OFF_SOBRA;
  const rGastos12    = dataStartRow + OFF_GASTOS;
  const rProlabore12 = dataStartRow + OFF_PROLABORE12;
  const rResultOp12  = dataStartRow + OFF_RESULT_OP;
  const rEquip12     = dataStartRow + OFF_EQUIP;
  const rReforma12   = dataStartRow + OFF_REFORMA;
  const rEstoque12   = dataStartRow + OFF_ESTOQUE;
  const rTotalInv12  = dataStartRow + OFF_TOTAL_INV;
  const rParcEmp12   = dataStartRow + OFF_PARC_EMP;
  const rParcMaq12   = dataStartRow + OFF_PARC_MAQ;
  const rDinEmp12    = dataStartRow + OFF_DIN_EMP;
  const rSaldoFin12  = dataStartRow + OFF_SALDO_FIN;
  const rResFinal12  = dataStartRow + OFF_RESULT_FINAL;

  months.forEach((_, mi) => {
    const col = String.fromCharCode('B'.charCodeAt(0) + mi);
    const isM1 = mi === 0;

    // Section header cells — styled, no values
    [dataStartRow + OFF_OP_HDR, dataStartRow + OFF_INV_HDR, dataStartRow + OFF_FIN_HDR].forEach(r => {
      const c = fluxo.getCell(`${col}${r}`);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    });

    // (+) Receita de Vendas — yellow input, Month 1 pre-filled
    const cRec = fluxo.getCell(`${col}${rReceita12}`);
    cRec.value = isM1 ? input.faturamento : null;
    cRec.numFmt = 'R$ #,##0.00';
    inputCell(cRec);
    cRec.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Custo Mercadorias — formula
    const cCusto12 = fluxo.getCell(`${col}${rCusto12}`);
    cCusto12.value = { formula: `${col}${rReceita12}*${input.custoProductPercent / 100}` };
    cCusto12.numFmt = 'R$ #,##0.00';
    cCusto12.font = { size: 10, name: 'Arial' };
    cCusto12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    cCusto12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Taxas e Impostos — formula
    const cTaxas12 = fluxo.getCell(`${col}${rTaxas12}`);
    cTaxas12.value = { formula: `${col}${rReceita12}*${input.taxaPercent / 100}` };
    cTaxas12.numFmt = 'R$ #,##0.00';
    cTaxas12.font = { size: 10, name: 'Arial' };
    cTaxas12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    cTaxas12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Frete — formula
    const cFrete12 = fluxo.getCell(`${col}${rFrete12}`);
    cFrete12.value = { formula: `${col}${rReceita12}*${input.fretePercentual / 100}` };
    cFrete12.numFmt = 'R$ #,##0.00';
    cFrete12.font = { size: 10, name: 'Arial' };
    cFrete12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    cFrete12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (=) Sobra das Vendas — formula
    const cSobra12 = fluxo.getCell(`${col}${rSobra12}`);
    cSobra12.value = { formula: `${col}${rReceita12}-${col}${rCusto12}-${col}${rTaxas12}-${col}${rFrete12}` };
    cSobra12.numFmt = 'R$ #,##0.00';
    cSobra12.font = { bold: true, size: 10, name: 'Arial' };
    cSobra12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
    cSobra12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Gastos Fixos — cross-sheet ref (total minus pró-labore)
    const cGastos12 = fluxo.getCell(`${col}${rGastos12}`);
    cGastos12.value = { formula: fGastosFixos };
    cGastos12.numFmt = 'R$ #,##0.00';
    cGastos12.font = { size: 10, name: 'Arial' };
    cGastos12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    cGastos12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Pró-labore — cross-sheet ref
    const cProlabore12 = fluxo.getCell(`${col}${rProlabore12}`);
    cProlabore12.value = { formula: fProLaboreXS };
    cProlabore12.numFmt = 'R$ #,##0.00';
    cProlabore12.font = { size: 10, name: 'Arial' };
    cProlabore12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    cProlabore12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (=) Resultado Operação — formula
    const cResOp12 = fluxo.getCell(`${col}${rResultOp12}`);
    cResOp12.value = { formula: `${col}${rSobra12}-${col}${rGastos12}-${col}${rProlabore12}` };
    cResOp12.numFmt = 'R$ #,##0.00';
    cResOp12.font = { bold: true, size: 10, name: 'Arial' };
    cResOp12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
    cResOp12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Equipamentos — yellow input
    const cEquip12 = fluxo.getCell(`${col}${rEquip12}`);
    cEquip12.value = isM1 ? 0 : null;
    cEquip12.numFmt = 'R$ #,##0.00';
    inputCell(cEquip12);
    cEquip12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Reforma — yellow input
    const cReforma12 = fluxo.getCell(`${col}${rReforma12}`);
    cReforma12.value = isM1 ? 0 : null;
    cReforma12.numFmt = 'R$ #,##0.00';
    inputCell(cReforma12);
    cReforma12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Estoque Extra — yellow input
    const cEstoque12 = fluxo.getCell(`${col}${rEstoque12}`);
    cEstoque12.value = isM1 ? 0 : null;
    cEstoque12.numFmt = 'R$ #,##0.00';
    inputCell(cEstoque12);
    cEstoque12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (=) Total Investido — formula
    const cTotInv12 = fluxo.getCell(`${col}${rTotalInv12}`);
    cTotInv12.value = { formula: `${col}${rEquip12}+${col}${rReforma12}+${col}${rEstoque12}` };
    cTotInv12.numFmt = 'R$ #,##0.00';
    cTotInv12.font = { bold: true, size: 10, name: 'Arial' };
    cTotInv12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    cTotInv12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Parcelas Empréstimo — yellow input
    const cParcEmp12 = fluxo.getCell(`${col}${rParcEmp12}`);
    cParcEmp12.value = isM1 ? 0 : null;
    cParcEmp12.numFmt = 'R$ #,##0.00';
    inputCell(cParcEmp12);
    cParcEmp12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (-) Parcelas Máquinas — yellow input
    const cParcMaq12 = fluxo.getCell(`${col}${rParcMaq12}`);
    cParcMaq12.value = isM1 ? 0 : null;
    cParcMaq12.numFmt = 'R$ #,##0.00';
    inputCell(cParcMaq12);
    cParcMaq12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (+) Dinheiro Emprestado — yellow input
    const cDinEmp12 = fluxo.getCell(`${col}${rDinEmp12}`);
    cDinEmp12.value = isM1 ? 0 : null;
    cDinEmp12.numFmt = 'R$ #,##0.00';
    inputCell(cDinEmp12);
    cDinEmp12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (=) Saldo Financiamentos — formula
    const cSaldoFin12 = fluxo.getCell(`${col}${rSaldoFin12}`);
    cSaldoFin12.value = { formula: `${col}${rDinEmp12}-${col}${rParcEmp12}-${col}${rParcMaq12}` };
    cSaldoFin12.numFmt = 'R$ #,##0.00';
    cSaldoFin12.font = { bold: true, size: 10, name: 'Arial' };
    cSaldoFin12.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
    cSaldoFin12.alignment = { horizontal: 'right', vertical: 'middle' };

    // (=) RESULTADO FINAL — formula (conditional formatting applied below)
    const cResFinal = fluxo.getCell(`${col}${rResFinal12}`);
    cResFinal.value = { formula: `${col}${rResultOp12}-${col}${rTotalInv12}+${col}${rSaldoFin12}` };
    cResFinal.numFmt = 'R$ #,##0.00';
    cResFinal.font  = { bold: true, size: 11, name: 'Arial', color: { argb: C.headerText } };
    cResFinal.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cResFinal.alignment = { horizontal: 'right', vertical: 'middle' };
  });

  // Conditional formatting for RESULTADO FINAL row: green if ≥0, red if <0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fluxo as any).addConditionalFormatting({
    ref: `B${rResFinal12}:M${rResFinal12}`,
    rules: [
      {
        type: 'cellIs', operator: 'greaterThanOrEqual', formulae: ['0'], priority: 1,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } },
          font: { bold: true, name: 'Arial', color: { argb: C.greenText } },
        },
      },
      {
        type: 'cellIs', operator: 'lessThan', formulae: ['0'], priority: 2,
        style: {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: C.redBg } },
          font: { bold: true, name: 'Arial', color: { argb: C.redText } },
        },
      },
    ],
  });

  void rowResultFinal;

  // ══════════════════════════════════════════════════════════════════════════
  //  ABA 6 — MEU PLANO DE AÇÃO
  // ══════════════════════════════════════════════════════════════════════════
  const plano = workbook.addWorksheet('Meu Plano de Ação', {
    properties: { tabColor: { argb: 'FFE65100' } },
  });
  plano.getColumn(1).width = 14;
  plano.getColumn(2).width = 58;

  safeMerge(plano, 'A1:B1');
  hdr(plano.getCell('A1'), 'Meu Plano de Ação — Trilha do Lucro', 14);
  plano.getRow(1).height = 32;

  instrRow(plano, 2, 'B', 'Use esta lista para dar os próximos passos no seu negócio. Marque cada item conforme você completar. Pequenos passos constantes fazem grande diferença!');

  const planSections: { period: string; bg: string; items: string[] }[] = [
    {
      period: '📅 PRIMEIROS 30 DIAS',
      bg: C.redSection,
      items: [
        '☐  Anotar todos os gastos fixos na aba "Meus Gastos Fixos"',
        '☐  Calcular o preço de 10 produtos principais na aba "Formação de Preço"',
        '☐  Verificar se estou acima ou abaixo da meta de sobrevivência (aba Meta de Vendas)',
        '☐  Separar meu salário (pró-labore) do dinheiro da loja',
      ],
    },
    {
      period: '📅 30 A 60 DIAS',
      bg: C.yelSection,
      items: [
        '☐  Preencher "Meu Dinheiro no Mês" por 30 dias seguidos',
        '☐  Identificar os 3 maiores gastos fixos e buscar formas de reduzir',
        '☐  Revisar os preços dos 5 produtos mais vendidos',
        '☐  Definir a meta de vendas mensal usando a aba Meta de Vendas',
      ],
    },
    {
      period: '📅 60 A 90 DIAS',
      bg: C.grnSection,
      items: [
        '☐  Comparar mês atual com anterior na aba Meu Dinheiro no Mês',
        '☐  Ajustar preços dos produtos com margem abaixo do ideal',
        '☐  Criar meta para o próximo trimestre',
        '☐  Avaliar se precisa cortar algum gasto fixo',
      ],
    },
  ];

  let pr = 3;
  planSections.forEach((section) => {
    plano.getRow(pr).height = 8; pr++;

    safeMerge(plano, `A${pr}:B${pr}`);
    const sh = plano.getCell(`A${pr}`);
    sh.value = section.period;
    sh.font  = { bold: true, size: 13, name: 'Arial', color: { argb: C.headerText } };
    sh.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    sh.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    plano.getRow(pr).height = 26;
    pr++;

    section.items.forEach((item, i) => {
      safeMerge(plano, `A${pr}:B${pr}`);
      const c = plano.getCell(`A${pr}`);
      c.value = item;
      c.font  = { size: 12, name: 'Arial', color: { argb: C.darkGray } };
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? section.bg : 'FFFFFFFF' } };
      c.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
      plano.getRow(pr).height = 24;
      pr++;
    });
  });

  // Nota motivacional
  plano.getRow(pr).height = 8; pr++;
  safeMerge(plano, `A${pr}:B${pr}`);
  const pm = plano.getCell(`A${pr}`);
  pm.value = `💡 Dica: Sua classificação atual é "${classification.emoji} ${classification.label}". ${classification.description} Use este plano para evoluir!`;
  pm.font  = { italic: true, bold: true, size: 11, name: 'Arial', color: { argb: C.greenText } };
  pm.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenBg } };
  pm.alignment = { wrapText: true, vertical: 'middle', indent: 1 };
  plano.getRow(pr).height = 36;

  // ─── Gera e baixa o arquivo ───────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `trilha-lucro-${(businessName || 'meu-negocio')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}.xlsx`;
  downloadBlob(blob, filename);
}
