import type { BusinessClassification, BusinessLevel, QuizQuestion } from '@/types';

// Thresholds de classificacao baseados na margem liquida
export const CLASSIFICATION_THRESHOLDS: Record<BusinessLevel, { min: number; max: number }> = {
  prejuizo:      { min: -Infinity, max: 0 },
  sobrevivendo:  { min: 0, max: 5 },
  estavel:       { min: 5, max: 15 },
  saudavel:      { min: 15, max: 25 },
  escalavel:     { min: 25, max: Infinity },
};

// Dados visuais de cada classificacao
export const CLASSIFICATIONS: Record<BusinessLevel, BusinessClassification> = {
  prejuizo: {
    level: 'prejuizo',
    label: "Prejuízo",
    description: "Seu negócio está gastando mais do que ganha. É hora de agir rápido.",
    color: '#C62828',
    bgColor: '#FFEBEE',
    emoji: '🔴',
  },
  sobrevivendo: {
    level: 'sobrevivendo',
    label: "Sobrevivendo",
    description: "Sua loja está no limite. Qualquer imprevisto pode virar um problema sério.",
    color: '#EF6C00',
    bgColor: '#FFF3E0',
    emoji: '🟠',
  },
  estavel: {
    level: 'estavel',
    label: "Estável",
    description: "Você tem uma base, mas ainda tem espaço para melhorar e crescer.",
    color: '#F9A825',
    bgColor: '#FFFDE7',
    emoji: '🟡',
  },
  saudavel: {
    level: 'saudavel',
    label: "Saudável",
    description: "Parabéns! Seu negócio está bem e com margem para investir no crescimento.",
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    emoji: '🟢',
  },
  escalavel: {
    level: 'escalavel',
    label: "Escalável",
    description: "Excelente! Seu negócio tem margem de sobra. É hora de pensar em expansão.",
    color: '#1B5E20',
    bgColor: '#E8F5E9',
    emoji: '🏆',
  },
};

// Deliverables do produto pago (fonte canonica — usada em PaywallScreen e ResultsDashboard)
export const PRODUCT_DELIVERABLES: Array<{ benefit: string; tag: string }> = [
  { benefit: "Saiba o preço mínimo de cada produto — nunca mais vender no prejuízo sem perceber", tag: 'Planilha Guiada' },
  { benefit: "Meta diária de vendas em reais — chega de sentir, começa a gerir", tag: 'Meta de Vendas' },
  { benefit: "Os 3 lugares onde seu dinheiro some antes de chegar em você", tag: 'Gastos Fixos' },
  { benefit: "Formação de preço passo a passo — cada venda contribui pro lucro", tag: 'Formação de Preço' },
  { benefit: "Acompanhamento mês a mês — você sabe se está avançando ou perdendo terreno", tag: 'Meu Dinheiro no Mês' },
  { benefit: "O que fazer amanhã de manhã — passo a passo para 30, 60 e 90 dias", tag: 'Plano de Ação' },
  { benefit: "Relatório em PDF para consultar sempre — decisões com dados, não com achismo", tag: 'Relatório PDF' },
];

// Perguntas do quiz — ordem: fáceis (range_select) primeiro, técnicas (%) depois
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'faturamento',
    question: "Quanto sua loja fatura por mês?",
    subtitle: "Some tudo que entra no caixa: vendas no cartão, dinheiro, Pix... Escolha a faixa mais próxima.",
    type: 'range_select',
    options: [
      { label: 'Até R$ 10 mil', value: 7500 },
      { label: 'R$ 10 mil – R$ 30 mil', value: 20000 },
      { label: 'R$ 30 mil – R$ 50 mil', value: 40000 },
      { label: 'R$ 50 mil – R$ 100 mil', value: 75000 },
      { label: 'Mais de R$ 100 mil', value: 125000 },
    ],
  },
  {
    id: 'custosFixos',
    question: "Quanto você gasta todo mês para manter a loja aberta?",
    subtitle: "Aluguel, luz, água, internet, salários, contador... Tudo que você paga mesmo sem vender nada.",
    type: 'range_select',
    options: [
      { label: 'Até R$ 3 mil', value: 1500 },
      { label: 'R$ 3 mil – R$ 8 mil', value: 5500 },
      { label: 'R$ 8 mil – R$ 15 mil', value: 11500 },
      { label: 'R$ 15 mil – R$ 30 mil', value: 22500 },
      { label: 'Mais de R$ 30 mil', value: 40000 },
    ],
  },
  {
    id: 'proLabore',
    question: "Quanto você quer tirar de pró-labore por mês?",
    subtitle: "É o \"salário do dono\" — o valor que você tira para pagar suas contas pessoais.",
    type: 'range_select',
    options: [
      { label: 'Até R$ 2 mil', value: 1000 },
      { label: 'R$ 2 mil – R$ 5 mil', value: 3500 },
      { label: 'R$ 5 mil – R$ 8 mil', value: 6500 },
      { label: 'R$ 8 mil – R$ 15 mil', value: 11500 },
      { label: 'Mais de R$ 15 mil', value: 20000 },
    ],
  },
  {
    id: 'custoProductPercent',
    question: "De cada R$100 que você vende, quanto foi o custo do produto?",
    subtitle: "Se trabalha com vários produtos, pense no principal ou faça uma média. Exemplo: se compra por R$40 e vende por R$100, seu custo é 40%.",
    hint: "Se não sabe exato, a maioria dos lojistas de moda gasta entre 40% e 60% do preço de venda com o custo do produto.",
    type: 'percent',
    min: 10,
    max: 90,
    step: 1,
    defaultValue: 45,
  },
  {
    id: 'taxaPercent',
    question: "Quanto paga de taxa quando vende no cartão ou marketplace?",
    subtitle: "Taxa da maquininha, taxa do Mercado Livre, Shopee, etc. Se não sabe, a maioria fica entre 5% e 12%.",
    type: 'percent',
    min: 0,
    max: 30,
    step: 0.5,
    defaultValue: 8,
  },
  {
    id: 'fretePercentual',
    question: "Percentual médio gasto com frete sobre vendas (%)",
    subtitle: "De cada R$100 que você vende, quanto vai para frete? Inclua Correios, motoboy, transportadoras... Se não tiver ou não souber, pode deixar em zero.",
    type: 'percent',
    min: 0,
    max: 30,
    step: 0.5,
    defaultValue: 0,
    optional: true,
  },
];
