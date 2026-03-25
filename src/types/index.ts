// Dados de entrada do quiz
export interface DiagnosticInput {
  faturamento: number;       // Faturamento mensal (quanto entra no caixa)
  custosFixos: number;       // Custos fixos mensais (aluguel, luz, funcionários...)
  custoProductPercent: number; // % do faturamento que é custo de produto
  taxaPercent: number;       // % de taxas (cartão, marketplace)
  proLabore: number;         // Salário desejado do dono
  gastosFreteEntrega: number; // Gastos mensais com frete e entrega (opcional, default 0)
}

// Resultado do diagnóstico
export interface DiagnosticResult {
  lucroReal: number;           // Lucro real após todas as deduções
  margemLiquida: number;       // Margem líquida em %
  pontoEquilibrio: number;     // Faturamento mínimo para não ter prejuízo
  faturamentoNecessario: number; // Faturamento necessário para cobrir tudo + salário
  sobraCaixa: number;          // Quanto sobra de verdade
}

// Classificação do negócio
export type BusinessLevel = 'prejuizo' | 'sobrevivendo' | 'estavel' | 'saudavel' | 'escalavel';

export interface BusinessClassification {
  level: BusinessLevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
}

// Insight/Recomendação
export type InsightPriority = 'alta' | 'media' | 'baixa';
export type InsightCategory = 'preco' | 'custo' | 'faturamento' | 'gestao' | 'crescimento';

export interface Insight {
  category: InsightCategory;
  title: string;
  message: string;
  priority: InsightPriority;
  icon: string; // nome do ícone Lucide
}

// Configuração de cada pergunta do quiz
export type QuestionType = 'currency' | 'percent';

export interface QuizQuestion {
  id: keyof DiagnosticInput;
  question: string;
  subtitle: string;
  hint?: string;
  type: QuestionType;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  placeholder?: string;
  optional?: boolean; // se true, valor 0 é permitido
}

// Checklist de ações 30/60/90 dias
export type ChecklistPhase = '30' | '60' | '90';

export interface ChecklistItem {
  phase: ChecklistPhase;
  task: string;
  detail: string;
  category: InsightCategory;
}

// ─── FLUXO PAGO: ANÁLISE ESTRATÉGICA ───────────────────────────────────────

// Respostas das 5 perguntas de propósito/missão/visão/valores
export interface PurposeAnswers {
  q1: string; // vazio que a loja deixaria
  q2: string; // diferencial único
  q3: string; // mudança que a loja ajuda a realizar
  q4: string; // frase que o cliente diria
  q5: string[]; // valores escolhidos (máx 3)
}

// Respostas das perguntas guiadas de SWOT
export interface SwotAnswers {
  // Forças
  strengths: string[];       // até 3 campos texto
  strengthPraise: string[];  // múltipla escolha: o que os clientes elogiam

  // Fraquezas
  weaknesses: string[];      // até 3 campos texto
  weaknessPain: string;      // escolha: área com mais dor de cabeça

  // Oportunidades
  opportunities: string[];         // até 3 campos texto
  opportunityChoices: string[];    // múltipla escolha

  // Ameaças
  threats: string[];         // até 3 campos texto
  threatChoices: string[];   // múltipla escolha
}

// Cruzamento individual do SWOT
export type SwotCrossingType = 'SO' | 'ST' | 'WO' | 'WT';

export interface SwotCrossingItem {
  type: SwotCrossingType;
  itemA: string; // Força ou Fraqueza
  itemB: string; // Oportunidade ou Ameaça
  score: number; // 1–5
}

// Conjunto de todos os cruzamentos
export interface SwotCrossing {
  items: SwotCrossingItem[];
}

// Estratégia gerada automaticamente
export interface GeneratedStrategy {
  purpose: string;
  mission: string;
  vision: string;
  values: string[];
}

// Diagnóstico completo (financeiro + estratégico)
export interface FullDiagnostic {
  financial: DiagnosticInput;
  result: DiagnosticResult;
  purposeAnswers?: PurposeAnswers;
  swotAnswers?: SwotAnswers;
  swotCrossing?: SwotCrossing;
  strategy?: GeneratedStrategy;
}

// Progresso salvo no localStorage
export type PaidStep = 'financial' | 'purpose' | 'swot' | 'crossing' | 'strategy';

export interface SavedProgress {
  step: PaidStep;
  financial?: DiagnosticInput;
  purposeAnswers?: PurposeAnswers;
  swotAnswers?: SwotAnswers;
  swotCrossing?: SwotCrossing;
}
