import type { PurposeAnswers, GeneratedStrategy } from '@/types';

/**
 * Gera missão, visão, propósito e valores a partir das respostas do quiz de propósito.
 * As frases são templates preenchidos com as respostas do lojista.
 */
export function generateStrategy(answers: PurposeAnswers): GeneratedStrategy {
  const purpose = buildPurpose(answers.q1);
  const mission = buildMission(answers.q2, answers.q4);
  const vision = buildVision(answers.q3);
  const values = answers.q5.slice(0, 3);

  return { purpose, mission, vision, values };
}

function buildPurpose(q1: string): string {
  const essence = trim(q1);
  if (!essence) return 'Existimos para fazer diferença na vida das pessoas.';
  return `Existimos para ${lowerFirst(essence)}.`;
}

function buildMission(q2: string, q4: string): string {
  const differential = trim(q2);
  const clientPhrase = trim(q4);

  if (!differential && !clientPhrase) {
    return 'Oferecer o melhor atendimento para que nossos clientes saiam satisfeitos.';
  }
  if (!differential) {
    return `Ser a loja que faz nossos clientes dizerem: "${clientPhrase}".`;
  }
  if (!clientPhrase) {
    return `Oferecer ${lowerFirst(differential)} para nossos clientes.`;
  }
  return `Oferecer ${lowerFirst(differential)} para que nossos clientes possam dizer: "${clientPhrase}".`;
}

function buildVision(q3: string): string {
  const change = trim(q3);
  if (!change) return 'Ser referência no nosso mercado nos próximos 3 anos.';
  return `Ser referência em ${lowerFirst(change)} nos próximos 3 anos.`;
}

function trim(s: string): string {
  return (s ?? '').trim().replace(/\.$/, '');
}

function lowerFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}
