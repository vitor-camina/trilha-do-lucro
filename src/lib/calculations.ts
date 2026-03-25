import type { DiagnosticInput, DiagnosticResult } from '@/types';

/**
 * Calcula o lucro real: o que sobra depois de pagar tudo (incluindo o salário do dono).
 */
export function calculateLucroReal(input: DiagnosticInput): number {
  const { faturamento, custosFixos, custoProductPercent, taxaPercent, proLabore, gastosFreteEntrega = 0 } = input;
  const custosProduto = faturamento * (custoProductPercent / 100);
  const taxas = faturamento * (taxaPercent / 100);
  return faturamento - custosFixos - custosProduto - taxas - proLabore - gastosFreteEntrega;
}

/**
 * Calcula a margem líquida: quanto % do faturamento é lucro de verdade.
 */
export function calculateMargemLiquida(input: DiagnosticInput): number {
  if (input.faturamento === 0) return 0;
  const lucro = calculateLucroReal(input);
  return (lucro / input.faturamento) * 100;
}

/**
 * Calcula o ponto de equilíbrio: o mínimo que precisa vender para não ter prejuízo
 * (sem contar o salário do dono).
 */
export function calculatePontoEquilibrio(input: DiagnosticInput): number {
  const { custosFixos, custoProductPercent, taxaPercent, gastosFreteEntrega = 0 } = input;
  const margemContribuicao = 1 - (custoProductPercent / 100) - (taxaPercent / 100);
  if (margemContribuicao <= 0) return Infinity;
  return (custosFixos + gastosFreteEntrega) / margemContribuicao;
}

/**
 * Calcula o faturamento necessário para cobrir tudo + salário do dono.
 */
export function calculateFaturamentoNecessario(input: DiagnosticInput): number {
  const { custosFixos, custoProductPercent, taxaPercent, proLabore, gastosFreteEntrega = 0 } = input;
  const margemContribuicao = 1 - (custoProductPercent / 100) - (taxaPercent / 100);
  if (margemContribuicao <= 0) return Infinity;
  return (custosFixos + proLabore + gastosFreteEntrega) / margemContribuicao;
}

/**
 * Executa o diagnóstico completo.
 */
export function runDiagnostic(input: DiagnosticInput): DiagnosticResult {
  const lucroReal = calculateLucroReal(input);
  const margemLiquida = calculateMargemLiquida(input);
  const pontoEquilibrio = calculatePontoEquilibrio(input);
  const faturamentoNecessario = calculateFaturamentoNecessario(input);

  return {
    lucroReal,
    margemLiquida,
    pontoEquilibrio,
    faturamentoNecessario,
    sobraCaixa: lucroReal,
  };
}
