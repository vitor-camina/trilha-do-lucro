import type { BusinessClassification, BusinessLevel, QuizQuestion } from '@/types';

// Thresholds de classificação baseados na margem líquida
export const CLASSIFICATION_THRESHOLDS: Record<BusinessLevel, { min: number; max: number }> = {
  prejuizo:      { min: -Infinity, max: 0 },
  sobrevivendo:  { min: 0, max: 5 },
  estavel:       { min: 5, max: 15 },
  saudavel:      { min: 15, max: 25 },
  escalavel:     { min: 25, max: Infinity },
};

// Dados visuais de cada classificação
export const CLASSIFICATIONS: Record<BusinessLevel, BusinessClassification> = {
  prejuizo: {
    level: 'prejuizo',
    label: 'Prejuízo',
    description: 'Seu negócio está gastando mais do que ganha. É hora de agir rápido.',
    color: '#C62828',
    bgColor: '#FFEBEE',
    emoji: '🔴',
  },
  sobrevivendo: {
    level: 'sobrevivendo',
    label: 'Sobrevivendo',
    description: 'Sua loja está no limite. Qualquer imprevisto pode virar um problema sério.',
    color: '#EF6C00',
    bgColor: '#FFF3E0',
    emoji: '🟠',
  },
  estavel: {
    level: 'estavel',
    label: 'Estável',
    description: 'Você tem uma base, mas ainda tem espaço para melhorar e crescer.',
    color: '#F9A825',
    bgColor: '#FFFDE7',
    emoji: '🟡',
  },
  saudavel: {
    level: 'saudavel',
    label: 'Saudável',
    description: 'Parabéns! Seu negócio está bem e com margem para investir no crescimento.',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    emoji: '🟢',
  },
  escalavel: {
    level: 'escalavel',
    label: 'Escalável',
    description: 'Excelente! Seu negócio tem margem de sobra. É hora de pensar em expansão.',
    color: '#1B5E20',
    bgColor: '#E8F5E9',
    emoji: '🏆',
  },
};

// Perguntas do quiz
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'faturamento',
    question: 'Quanto sua loja fatura por mês?',
    subtitle: 'Some tudo que entra no caixa: vendas no cartão, dinheiro, Pix... Não precisa ser exato, uma média já serve.',
    type: 'currency',
    placeholder: 'Ex: 30.000',
    min: 0,
  },
  {
    id: 'custosFixos',
    question: 'Quanto você gasta todo mês para manter a loja aberta?',
    subtitle: 'Aluguel, conta de luz, água, internet, salário de funcionários, contador... Tudo que você paga todo mês, mesmo sem vender nada.',
    type: 'currency',
    placeholder: 'Ex: 8.000',
    min: 0,
  },
  {
    id: 'custoProductPercent',
    question: 'De cada R$100 que você vende, quanto foi o custo do produto?',
    subtitle: 'Se trabalha com vários produtos, pense no principal ou faça uma média. Exemplo: se compra por R$40 e vende por R$100, seu custo é 40%.',
    hint: 'Se não sabe exato, a maioria dos lojistas de moda gasta entre 40% e 60% do preço de venda com o custo do produto.',
    type: 'percent',
    min: 10,
    max: 90,
    step: 1,
    defaultValue: 45,
  },
  {
    id: 'taxaPercent',
    question: 'Quanto paga de taxa quando vende no cartão ou marketplace?',
    subtitle: 'Taxa da maquininha, taxa do Mercado Livre, Shopee, etc. Se não sabe, a maioria fica entre 5% e 12%.',
    type: 'percent',
    min: 0,
    max: 30,
    step: 0.5,
    defaultValue: 8,
  },
  {
    id: 'proLabore',
    question: 'Quanto você quer tirar de pró-labore por mês?',
    subtitle: 'Pró-labore é o "salário do dono". É o valor que você tira da loja para pagar suas contas pessoais. Muitos lojistas esquecem de se pagar — isso é essencial!',
    type: 'currency',
    placeholder: 'Ex: 5.000',
    min: 0,
  },
  {
    id: 'gastosFreteEntrega',
    question: 'Quanto você gasta com frete e entrega por mês?',
    subtitle: 'Inclua tudo: Correios, motoboy, transportadoras, embalagens para envio... Se não tiver ou não souber, pode deixar em zero.',
    type: 'currency',
    placeholder: 'Ex: 800',
    min: 0,
    optional: true,
  },
];
