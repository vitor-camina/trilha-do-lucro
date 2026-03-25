import type { DiagnosticInput, DiagnosticResult, BusinessClassification, Insight } from '@/types';
import { formatBRL } from '@/lib/formatters';
import { downloadBlob } from '@/lib/download';

/**
 * Gera e baixa o relatório PDF do diagnóstico.
 * Usa dynamic import para não carregar jspdf no bundle inicial.
 */
export async function generateReport(
  input: DiagnosticInput,
  result: DiagnosticResult,
  classification: BusinessClassification,
  insights: Insight[],
  businessName: string
) {
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ========== HEADER ==========
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Raio-X do Negócio', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(businessName || 'Meu Negócio', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em ${today}`, pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 10;

  // ========== CLASSIFICAÇÃO ==========
  const classColor = hexToRgb(classification.color);
  const classBgColor = hexToRgb(classification.bgColor);

  // Fundo do badge
  doc.setFillColor(classBgColor.r, classBgColor.g, classBgColor.b);
  doc.roundedRect(margin, y, contentWidth, 28, 4, 4, 'F');

  // Texto da classificação
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(classColor.r, classColor.g, classColor.b);
  doc.text(classification.label, pageWidth / 2, y + 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(classification.description, pageWidth / 2, y + 20, { align: 'center', maxWidth: contentWidth - 20 });
  doc.setTextColor(0, 0, 0);
  y += 36;

  // ========== FRASE DE IMPACTO ==========
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  if (result.lucroReal >= 0) {
    doc.setTextColor(22, 163, 74); // green
    doc.text(`Sua loja gera ${formatBRL(result.lucroReal)} de lucro real por mês`, pageWidth / 2, y, { align: 'center' });
  } else {
    doc.setTextColor(220, 38, 38); // red
    doc.text(`Sua loja está perdendo ${formatBRL(Math.abs(result.lucroReal))} por mês`, pageWidth / 2, y, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);
  y += 12;

  // ========== DADOS INFORMADOS ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados informados', margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Item', 'Valor']],
    body: [
      ['Faturamento mensal', formatBRL(input.faturamento)],
      ['Custos fixos', formatBRL(input.custosFixos)],
      ['Custo do produto', `${input.custoProductPercent}%`],
      ['Taxas (cartão/marketplace)', `${input.taxaPercent}%`],
      ['Pró-labore desejado', formatBRL(input.proLabore)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ========== MÉTRICAS ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultado do diagnóstico', margin, y);
  y += 2;

  const margemFormatted = `${result.margemLiquida.toFixed(1)}%`;
  const peFormatted = result.pontoEquilibrio === Infinity ? 'N/A' : formatBRL(result.pontoEquilibrio);
  const fatNecFormatted = result.faturamentoNecessario === Infinity ? 'N/A' : formatBRL(result.faturamentoNecessario);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Métrica', 'Valor', 'O que significa']],
    body: [
      ['Lucro real', formatBRL(result.lucroReal), 'Quanto sobra depois de pagar tudo (incluindo pró-labore)'],
      ['Margem real', margemFormatted, 'De cada R$100 que entra, esse % é lucro'],
      ['Ponto de equilíbrio', peFormatted, 'Mínimo para cobrir custos (sem pró-labore)'],
      ['Faturamento ideal', fatNecFormatted, `Para cobrir tudo + pró-labore de ${formatBRL(input.proLabore)}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 2: { cellWidth: 60 } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ========== INSIGHTS ==========
  if (insights.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Recomendações', margin, y);
    y += 6;

    const priorityColors: Record<string, [number, number, number]> = {
      alta: [220, 38, 38],
      media: [234, 179, 8],
      baixa: [22, 163, 74],
    };

    for (const insight of insights) {
      if (y > 265) {
        doc.addPage();
        y = margin;
      }

      const color = priorityColors[insight.priority] || [100, 100, 100];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(margin + 2, y - 1, 1.5, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(insight.title, margin + 7, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(insight.message, contentWidth - 7);
      doc.text(lines, margin + 7, y);
      y += lines.length * 4 + 4;
    }
  }

  // ========== FOOTER ==========
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Gerado por Raio-X do Negócio', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Download
  const blob = doc.output('blob');
  downloadBlob(blob, `raio-x-${(businessName || 'meu-negocio').toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}
