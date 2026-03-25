import type { DiagnosticInput, DiagnosticResult, BusinessClassification, Insight } from '@/types';
import { formatBRL, formatPercent } from './formatters';

/**
 * Gera recomendações personalizadas com base nos dados do lojista.
 */
export function generateInsights(
  input: DiagnosticInput,
  result: DiagnosticResult,
  classification: BusinessClassification
): Insight[] {
  const insights: Insight[] = [];

  // 1. Negócio em prejuízo → urgência
  if (result.lucroReal < 0) {
    const deficit = Math.abs(result.lucroReal);
    insights.push({
      category: 'faturamento',
      title: 'Sua loja está no vermelho',
      message: `Você está perdendo ${formatBRL(deficit)} por mês. Precisa aumentar o faturamento ou cortar gastos urgentemente.`,
      priority: 'alta',
      icon: 'AlertTriangle',
    });
  }

  // 2. Custo de produto muito alto
  if (input.custoProductPercent > 55) {
    insights.push({
      category: 'custo',
      title: 'Custo do produto está alto',
      message: `Você gasta ${formatPercent(input.custoProductPercent)} do faturamento com mercadoria. Tente negociar com fornecedores ou buscar alternativas mais baratas.`,
      priority: 'alta',
      icon: 'TrendingDown',
    });
  }

  // 3. Taxas muito altas
  if (input.taxaPercent > 12) {
    insights.push({
      category: 'custo',
      title: 'Taxas estão pesando',
      message: `Você paga ${formatPercent(input.taxaPercent)} em taxas. Compare maquininhas e considere incentivar pagamento em Pix para reduzir essa fatia.`,
      priority: 'media',
      icon: 'CreditCard',
    });
  }

  // 4. Faturamento abaixo do ponto de equilíbrio
  if (input.faturamento < result.pontoEquilibrio && result.pontoEquilibrio !== Infinity) {
    const falta = result.pontoEquilibrio - input.faturamento;
    insights.push({
      category: 'faturamento',
      title: 'Vendendo abaixo do mínimo',
      message: `Você precisa vender pelo menos ${formatBRL(result.pontoEquilibrio)} por mês para cobrir seus custos. Faltam ${formatBRL(falta)}.`,
      priority: 'alta',
      icon: 'Target',
    });
  }

  // 5. Faturamento abaixo do necessário para salário
  if (input.faturamento < result.faturamentoNecessario && result.faturamentoNecessario !== Infinity) {
    const falta = result.faturamentoNecessario - input.faturamento;
    insights.push({
      category: 'faturamento',
      title: 'Faturamento não cobre seu pró-labore',
      message: `Para pagar todos os custos E tirar ${formatBRL(input.proLabore)} de pró-labore, você precisaria faturar ${formatBRL(result.faturamentoNecessario)}. Faltam ${formatBRL(falta)} por mês.`,
      priority: 'alta',
      icon: 'DollarSign',
    });
  }

  // 6. Margem baixa mas positiva → ajuste de preço
  if (result.margemLiquida > 0 && result.margemLiquida < 10) {
    insights.push({
      category: 'preco',
      title: 'Revise seus preços',
      message: 'Sua margem está apertada. Um aumento de 10% a 15% nos preços pode fazer uma grande diferença no seu lucro sem espantar clientes.',
      priority: 'media',
      icon: 'Tag',
    });
  }

  // 7. Custos fixos altos em relação ao faturamento
  if (input.faturamento > 0) {
    const custoFixoPercent = (input.custosFixos / input.faturamento) * 100;
    if (custoFixoPercent > 35) {
      insights.push({
        category: 'custo',
        title: 'Custos fixos estão altos',
        message: `Seus custos fixos representam ${formatPercent(custoFixoPercent)} do faturamento. O ideal é ficar abaixo de 30%. Renegocie aluguel, reveja contratos e otimize a equipe.`,
        priority: 'media',
        icon: 'Building2',
      });
    }
  }

  // 8. Negócio saudável → dicas de crescimento
  if (classification.level === 'saudavel' || classification.level === 'escalavel') {
    insights.push({
      category: 'crescimento',
      title: 'Hora de crescer!',
      message: 'Seu negócio está saudável. Considere investir em marketing, ampliar o mix de produtos ou abrir um canal de vendas online para escalar.',
      priority: 'baixa',
      icon: 'Rocket',
    });
  }

  // 9. Pró-labore zerado
  if (input.proLabore === 0) {
    insights.push({
      category: 'gestao',
      title: 'Você está se pagando?',
      message: 'Definir um pró-labore é essencial. Sem ele, o "lucro" da loja pode estar mascarando que você trabalha de graça.',
      priority: 'media',
      icon: 'UserCheck',
    });
  }

  // Ordenar por prioridade
  const priorityOrder = { alta: 0, media: 1, baixa: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights.slice(0, 5); // Máximo 5 insights
}
