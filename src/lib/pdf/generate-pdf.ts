import type { DiagnosticInput, DiagnosticResult, BusinessClassification } from '@/types';
import { formatBRL } from '@/lib/formatters';
import { downloadBlob } from '@/lib/download';

// ─── Character normalization (jsPDF built-in fonts don't support Latin extended) ──
function nt(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
}

// ─── Brand Colors ────────────────────────────────────────────────────────────
const VERDE  = { r: 27,  g: 94,  b: 32  };   // #1B5E20
const VERDE_LIGHT = { r: 200, g: 230, b: 201 }; // #C8E6C9
const OURO   = { r: 249, g: 168, b: 37  };   // #F9A825
const OURO_LIGHT = { r: 255, g: 249, b: 196 }; // #FFF9C4
const WHITE  = { r: 255, g: 255, b: 255 };
const GRAY_DARK  = { r: 33,  g: 33,  b: 33  };
const GRAY_MID   = { r: 97,  g: 97,  b: 97  };
const GRAY_LIGHT = { r: 245, g: 245, b: 245 };
const GRAY_BDR   = { r: 189, g: 189, b: 189 };
const RED    = { r: 198, g: 40,  b: 40  };
const RED_LIGHT = { r: 255, g: 205, b: 210 };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 100, g: 100, b: 100 };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setFill(doc: any, c: { r: number; g: number; b: number }) {
  doc.setFillColor(c.r, c.g, c.b);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setTextC(doc: any, c: { r: number; g: number; b: number }) {
  doc.setTextColor(c.r, c.g, c.b);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setDrawC(doc: any, c: { r: number; g: number; b: number }) {
  doc.setDrawColor(c.r, c.g, c.b);
}

// ─── Recommendation text by classification level ─────────────────────────────
function getRecommendations(level: string): string[] {
  switch (level) {
    case 'prejuizo':
      return [
        '🔴 Revise urgentemente seus precos - sua margem atual nao cobre os custos.',
        '🔴 Liste todos os custos fixos e corte os nao essenciais imediatamente.',
        '🔴 Negocie prazos com fornecedores para aliviar o fluxo de caixa.',
        '🔴 Defina um prazo claro (30 dias) para reavaliar a viabilidade do negocio.',
      ];
    case 'sobrevivendo':
      return [
        '🟠 Aumente o ticket medio com combos ou produtos complementares.',
        '🟠 Revise o preco dos 3 produtos mais vendidos - ha espaco para ajuste.',
        '🟠 Reduza custos variaveis: negocie frete e taxas de cartao.',
        '🟠 Meta nos proximos 60 dias: atingir o ponto de equilibrio.',
      ];
    case 'estavel':
      return [
        '🟡 Voce esta estavel - mas estabilidade nao e crescimento.',
        '🟡 Invista em marketing de baixo custo: redes sociais e indicacoes.',
        '🟡 Crie um programa de fidelidade simples para aumentar a recorrencia.',
        '🟡 Separe uma reserva de emergencia equivalente a 2 meses de custos fixos.',
      ];
    case 'saudavel':
      return [
        '🟢 Negocio saudavel! Hora de escalar com mais consistencia.',
        '🟢 Documente seus processos para se preparar para crescimento.',
        '🟢 Explore novos canais de venda (marketplace, atacado, online).',
        '🟢 Reinvista parte do lucro em estoque e marketing.',
      ];
    case 'escalavel':
      return [
        '✅ Parabens - seu negocio tem base solida para escalar.',
        '✅ Considere contratar um colaborador para escalar as operacoes.',
        '✅ Busque parcerias estrategicas para ampliar distribuicao.',
        '✅ Automatize processos repetitivos para liberar seu tempo.',
      ];
    default:
      return ['Analise suas metricas e trace um plano de acao para o proximo mes.'];
  }
}

function getDiagnosis(result: DiagnosticResult, input: DiagnosticInput, level: string): string {
  const faltaParaEquilibrio = result.pontoEquilibrio - input.faturamento;
  const faltaParaIdeal = result.faturamentoNecessario - input.faturamento;

  if (level === 'prejuizo') {
    return `Com o faturamento atual de ${formatBRL(input.faturamento)}, sua loja esta operando com prejuizo de ${formatBRL(Math.abs(result.lucroReal))} por mes. Isso significa que voce precisa aumentar o faturamento em ${faltaParaEquilibrio > 0 ? formatBRL(faltaParaEquilibrio) : 'valores significativos'} so para cobrir os custos basicos, sem contar seu pro-labore. E urgente revisar precos e cortar gastos.`;
  }
  if (level === 'sobrevivendo') {
    return `Sua loja paga as contas, mas ainda nao gera lucro real. Faltam ${faltaParaIdeal > 0 ? formatBRL(faltaParaIdeal) : 'R$ 0'} de faturamento para voce cobrir tudo, incluindo o seu salario de ${formatBRL(input.proLabore)}. Com ajustes estrategicos de preco e reducao de custos, voce pode virar o jogo em 60 dias.`;
  }
  if (level === 'estavel') {
    return `Voce atingiu o ponto de equilibrio e gera uma margem de ${result.margemLiquida.toFixed(1)}%. O lucro real de ${formatBRL(result.lucroReal)} por mes e o inicio - mas ainda ha espaco para crescer. Foque em aumentar o ticket medio e fidelizar seus clientes.`;
  }
  if (level === 'saudavel') {
    return `Otimo trabalho! Com margem liquida de ${result.margemLiquida.toFixed(1)}% e lucro real de ${formatBRL(result.lucroReal)} por mes, seu negocio esta saudavel. Voce esta acima do ponto de equilibrio e tem base para investir no crescimento.`;
  }
  return `Sua loja opera com excelencia: margem liquida de ${result.margemLiquida.toFixed(1)}% e lucro real de ${formatBRL(result.lucroReal)} ao mes. Voce tem folego financeiro para escalar. Continue monitorando os indicadores e busque novas oportunidades de crescimento.`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Gera e baixa o Raio-X Financeiro em PDF com identidade visual Trilha do Lucro.
 * Dynamic import para não carregar jsPDF no bundle inicial (evita SSR).
 */
export async function generatePDF(
  input: DiagnosticInput,
  result: DiagnosticResult,
  classification: BusinessClassification,
  businessName: string
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297
  const margin = 18;
  const cw = pageW - margin * 2;                    // content width
  let y = 0;

  // ═══════════════════════════════════════════════════════════════
  // HEADER BAND — verde floresta
  // ═══════════════════════════════════════════════════════════════
  setFill(doc, VERDE);
  doc.rect(0, 0, pageW, 42, 'F');

  // Compass icon (simplified — concentric circles)
  const iconX = margin + 8;
  const iconY = 21;
  doc.setLineWidth(0.4);
  setFill(doc, OURO);
  setDrawC(doc, OURO);
  doc.circle(iconX, iconY, 6, 'F');
  setFill(doc, VERDE);
  doc.circle(iconX, iconY, 3.5, 'F');
  // north arrow
  setFill(doc, WHITE);
  doc.triangle(iconX, iconY - 5, iconX - 1.5, iconY, iconX + 1.5, iconY, 'F');

  // Title
  setTextC(doc, WHITE);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(nt('Raio-X Financeiro'), iconX + 12, 17);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, OURO);
  doc.text(nt('Trilha do Lucro'), iconX + 12, 24);

  // Date right-aligned
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(8);
  setTextC(doc, { r: 200, g: 230, b: 200 });
  doc.text(nt(today), pageW - margin, 20, { align: 'right' });

  // Business name right-aligned
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, WHITE);
  doc.text(nt(businessName || 'Meu Negocio'), pageW - margin, 27, { align: 'right' });

  y = 52;

  // ═══════════════════════════════════════════════════════════════
  // CLASSIFICATION BADGE
  // ═══════════════════════════════════════════════════════════════
  const classColor = hexToRgb(classification.color);
  const classBgColor = hexToRgb(classification.bgColor);

  setFill(doc, classBgColor);
  setDrawC(doc, classColor);
  doc.setLineWidth(1.2);
  doc.roundedRect(margin, y, cw, 26, 5, 5, 'FD');

  // Emoji label
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, classColor);
  doc.text(nt(`${classification.emoji}  ${classification.label}`), pageW / 2, y + 10, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, GRAY_MID);
  doc.text(nt(classification.description), pageW / 2, y + 19, { align: 'center', maxWidth: cw - 10 });

  y += 34;

  // ═══════════════════════════════════════════════════════════════
  // IMPACT SENTENCE
  // ═══════════════════════════════════════════════════════════════
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  if (result.lucroReal >= 0) {
    setTextC(doc, VERDE);
    doc.text(nt(`Lucro real: ${formatBRL(result.lucroReal)} / mes`), pageW / 2, y, { align: 'center' });
  } else {
    setTextC(doc, RED);
    doc.text(nt(`Prejuizo: ${formatBRL(Math.abs(result.lucroReal))} / mes`), pageW / 2, y, { align: 'center' });
  }
  setTextC(doc, GRAY_DARK);
  y += 12;

  // ═══════════════════════════════════════════════════════════════
  // METRICS TABLE — two columns
  // ═══════════════════════════════════════════════════════════════
  const sectionTitle = (title: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, VERDE);
    doc.text(nt(title), margin, y);
    doc.setLineWidth(0.3);
    setDrawC(doc, VERDE);
    doc.line(margin, y + 1.5, margin + cw, y + 1.5);
    y += 7;
  };

  sectionTitle('Metricas principais');

  const margemFormatted = `${result.margemLiquida.toFixed(1)}%`;
  const peFormatted = result.pontoEquilibrio === Infinity ? 'Inviável' : formatBRL(result.pontoEquilibrio);
  const fatNecFormatted = result.faturamentoNecessario === Infinity ? 'Inviável' : formatBRL(result.faturamentoNecessario);
  const sobraFormatted = formatBRL(result.sobraCaixa);

  const metricsData: [string, string, string, string][] = [
    ['Faturamento mensal',          formatBRL(input.faturamento),   'Custo do produto',    `${input.custoProductPercent}%`],
    ['Custos fixos mensais',         formatBRL(input.custosFixos),   'Taxas (cartao/mkt)',  `${input.taxaPercent}%`],
    ['Pro-labore desejado',          formatBRL(input.proLabore),     'Frete',               `${input.fretePercentual}%`],
    ['Ponto de equilibrio',          peFormatted,                    'Faturamento ideal',   fatNecFormatted],
    ['Margem liquida',               margemFormatted,                'Sobra real no caixa', sobraFormatted],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: metricsData.map(([l1, v1, l2, v2]) => [l1, v1, l2, v2]),
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
    columnStyles: {
      0: { fontStyle: 'normal', textColor: [GRAY_MID.r, GRAY_MID.g, GRAY_MID.b] as [number,number,number], cellWidth: 55 },
      1: { fontStyle: 'bold',   textColor: [GRAY_DARK.r, GRAY_DARK.g, GRAY_DARK.b] as [number,number,number], cellWidth: 35 },
      2: { fontStyle: 'normal', textColor: [GRAY_MID.r, GRAY_MID.g, GRAY_MID.b] as [number,number,number], cellWidth: 55 },
      3: { fontStyle: 'bold',   textColor: [GRAY_DARK.r, GRAY_DARK.g, GRAY_DARK.b] as [number,number,number], cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: [GRAY_LIGHT.r, GRAY_LIGHT.g, GRAY_LIGHT.b] as [number,number,number] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 12;

  // ═══════════════════════════════════════════════════════════════
  // MARGIN HEALTH BAR
  // ═══════════════════════════════════════════════════════════════
  sectionTitle('Saude da margem');

  const barY = y;
  const barH = 10;
  const barW = cw;
  const barX = margin;

  // Background track
  setFill(doc, GRAY_LIGHT);
  setDrawC(doc, GRAY_BDR);
  doc.setLineWidth(0.2);
  doc.roundedRect(barX, barY, barW, barH, 3, 3, 'FD');

  // Colored fill proportional to margin (capped 0–40%)
  const marginRaw = result.margemLiquida;
  const clampedPct = Math.max(0, Math.min(marginRaw, 40)) / 40;
  const fillW = barW * clampedPct;

  // Color based on margin: red < 5%, yellow 5-15%, green >15%
  let barColor = RED;
  if (marginRaw >= 15) barColor = VERDE;
  else if (marginRaw >= 5) barColor = { r: OURO.r, g: OURO.g, b: OURO.b };

  if (fillW > 0.5) {
    setFill(doc, barColor);
    doc.roundedRect(barX, barY, fillW, barH, 3, 3, 'F');
  }

  // Labels below bar
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, RED);
  doc.text('0%', barX + 1, barY + barH + 5);
  setTextC(doc, OURO);
  doc.text('5%', barX + barW * (5 / 40) - 3, barY + barH + 5);
  setTextC(doc, VERDE);
  doc.text('15%', barX + barW * (15 / 40) - 4, barY + barH + 5);
  doc.text('40%+', barX + barW - 8, barY + barH + 5);

  // Current margin marker
  if (clampedPct > 0) {
    const markerX = barX + fillW;
    setFill(doc, GRAY_DARK);
    setDrawC(doc, GRAY_DARK);
    doc.setLineWidth(0.3);
    doc.line(markerX, barY - 1, markerX, barY + barH + 1);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, GRAY_DARK);
    const labelX = Math.min(markerX + 1, barX + barW - 15);
    doc.text(margemFormatted, labelX, barY - 2);
  }

  y = barY + barH + 14;

  // ═══════════════════════════════════════════════════════════════
  // DIAGNOSIS TEXT
  // ═══════════════════════════════════════════════════════════════
  sectionTitle('Diagnostico');

  const diagnosis = getDiagnosis(result, input, classification.level);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, GRAY_DARK);
  const diagLines = doc.splitTextToSize(nt(diagnosis), cw);
  doc.text(diagLines, margin, y);
  y += diagLines.length * 5 + 10;

  // ═══════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════
  // Check if we need a new page
  if (y > pageH - 70) {
    doc.addPage();
    y = margin + 5;
  }

  sectionTitle('Plano de acao');

  const recs = getRecommendations(classification.level);
  for (const rec of recs) {
    if (y > pageH - 30) {
      doc.addPage();
      y = margin + 5;
    }

    // Pill background
    const recLines = doc.splitTextToSize(nt(rec), cw - 8);
    const pillH = recLines.length * 5 + 6;

    setFill(doc, GRAY_LIGHT);
    doc.roundedRect(margin, y - 4, cw, pillH, 2, 2, 'F');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, GRAY_DARK);
    doc.text(recLines, margin + 4, y + 1);
    y += pillH + 3;
  }

  // ═══════════════════════════════════════════════════════════════
  // CALL-TO-ACTION BOX (dourado)
  // ═══════════════════════════════════════════════════════════════
  if (y > pageH - 40) {
    doc.addPage();
    y = margin + 5;
  }
  y += 6;

  setFill(doc, OURO_LIGHT);
  setDrawC(doc, OURO);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, cw, 22, 4, 4, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, { r: 120, g: 70, b: 0 });
  doc.text('Proximo passo', margin + 6, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, { r: 90, g: 60, b: 0 });
  const nextStep = 'Abra a planilha de controle financeiro (incluida no pacote) e registre suas movimentacoes mensais. Quanto mais dados voce tiver, mais preciso sera o seu diagnostico.';
  const ctaLines = doc.splitTextToSize(nextStep, cw - 12);
  doc.text(ctaLines, margin + 6, y + 15);

  // ═══════════════════════════════════════════════════════════════
  // FOOTER on each page
  // ═══════════════════════════════════════════════════════════════
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer band
    setFill(doc, VERDE);
    doc.rect(0, pageH - 14, pageW, 14, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, { r: 200, g: 230, b: 200 });
    doc.text('Gerado pela Trilha do Lucro - trilhadolucro.com.br', margin, pageH - 5.5);
    setTextC(doc, { r: 200, g: 230, b: 200 });
    doc.text(`Pagina ${i} de ${totalPages}`, pageW - margin, pageH - 5.5, { align: 'right' });
  }

  // ─── Download ────────────────────────────────────────────────────────────────
  const slug = (businessName || 'meu-negocio')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
  const blob = doc.output('blob');
  downloadBlob(blob, `raio-x-financeiro-${slug}.pdf`);
}
