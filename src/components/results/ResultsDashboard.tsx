'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle2, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  DiagnosticInput, DiagnosticResult, BusinessClassification, Insight,
  PurposeAnswers, SwotAnswers, SwotCrossing, GeneratedStrategy,
} from '@/types';
import { formatBRL, formatPercent } from '@/lib/formatters';
import { trackBeginCheckout } from '@/lib/tracking';
import { appendUtms } from '@/lib/utm';
import { PRODUCT_DELIVERABLES } from '@/lib/constants';
import { generateStrategy } from '@/lib/strategy-generator';
import { useProgress } from '@/hooks/useProgress';
import { BusinessClassBadge } from './BusinessClassBadge';
import { MetricCard } from './MetricCard';
import { InsightsPanel } from './InsightsPanel';
import { DeliverableButtons } from './DeliverableButtons';
import { ActionChecklist } from './ActionChecklist';
import PurposeQuiz from '@/components/paid/PurposeQuiz';
import SwotQuiz from '@/components/paid/SwotQuiz';
import SwotCrossingComponent from '@/components/paid/SwotCrossing';

const HOTMART_CHECKOUT_URL = process.env.NEXT_PUBLIC_HOTMART_URL || 'https://pay.hotmart.com/W105207264J';

function getLossRange(absLoss: number): string {
  if (absLoss < 2000) return 'entre R$500 e R$3.000';
  if (absLoss <= 5000) return 'entre R$1.000 e R$5.000';
  return 'entre R$3.000 e R$10.000';
}

interface ResultsDashboardProps {
  input: DiagnosticInput;
  result: DiagnosticResult;
  classification: BusinessClassification;
  insights: Insight[];
  onRestart: () => void;
}

export function ResultsDashboard({ input, result, classification, insights, onRestart }: ResultsDashboardProps) {
  const isPositive = result.lucroReal >= 0;
  const [isPaid, setIsPaid] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('teste') === 'trilha2026') return true;
    if (params.get('acesso') === 'TL2026x9k') return true;
    if (localStorage.getItem('raiox_paid') === 'true') return true;
    return false;
  });
  const [showChecklist, setShowChecklist] = useState(false);
  const [strategy, setStrategy] = useState<GeneratedStrategy | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState(HOTMART_CHECKOUT_URL);

  // Personalização do bloco de urgência
  const margem = result.margemLiquida;
  const porMil = Math.round(margem * 10);
  const gapMensal = input.faturamento > 0 ? Math.max(0, (0.20 - margem / 100) * input.faturamento) : 0;
  const gapAnual = gapMensal * 12;

  const {
    paidStep,
    purposeAnswers,
    swotAnswers,
    swotCrossing,
    hasSavedProgress,
    restoreProgress,
    dismissSavedProgress,
    goToStep,
  } = useProgress(input);

  // Strip ?acesso=TL2026x9k from URL after granting access (runs once on mount)
  useEffect(() => {
    if (!isPaid) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('acesso') === 'TL2026x9k') {
      localStorage.setItem('raiox_paid', 'true');
      window.history.replaceState({}, '', window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computa URL do Hotmart com UTMs capturados (sessionStorage) no cliente
  useEffect(() => {
    setCheckoutUrl(appendUtms(HOTMART_CHECKOUT_URL));
  }, []);

  function handleUnlock() {
    setIsPaid(true);
    localStorage.setItem('raiox_paid', 'true');
  }

  // ─── Handlers de transição entre etapas pagas ────────────────────────────

  function handlePurposeComplete(answers: PurposeAnswers) {
    goToStep('swot', { purposeAnswers: answers });
  }

  function handleSwotComplete(answers: SwotAnswers) {
    goToStep('crossing', { swotAnswers: answers });
  }

  function handleCrossingComplete(crossing: SwotCrossing) {
    const generated = generateStrategy(purposeAnswers);
    setStrategy(generated);
    goToStep('strategy', { swotCrossing: crossing });
  }

  // Se estamos numa das telas de wizard pago, renderiza só ela (fullscreen)
  if (isPaid && paidStep === 'purpose') {
    return (
      <PurposeQuiz
        initial={purposeAnswers}
        onComplete={handlePurposeComplete}
        onBack={() => goToStep('financial')}
      />
    );
  }

  if (isPaid && paidStep === 'swot') {
    return (
      <SwotQuiz
        initial={swotAnswers}
        onComplete={handleSwotComplete}
        onBack={() => goToStep('purpose')}
      />
    );
  }

  if (isPaid && paidStep === 'crossing') {
    return (
      <SwotCrossingComponent
        swotAnswers={swotAnswers}
        initial={swotCrossing}
        onComplete={handleCrossingComplete}
        onBack={() => goToStep('swot')}
      />
    );
  }

  // ─── Tela principal ────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] pb-8" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header com logo */}
      <div className="flex items-center justify-center py-4 px-6" style={{ backgroundColor: '#1B5E20' }}>
        <div className="flex items-center gap-3">
          {/* SVG bússola inline */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="20" cy="20" r="18" stroke="#F9A825" strokeWidth="2.5" fill="none" />
            <circle cx="20" cy="20" r="12" fill="#2E7D32" fillOpacity="0.3" />
            {/* Agulha norte — dourada, aponta para cima */}
            <polygon points="20,5 22.5,20 20,17 17.5,20" fill="#F9A825" />
            {/* Agulha sul — verde escuro */}
            <polygon points="20,35 17.5,20 20,23 22.5,20" fill="#1B5E20" />
            <circle cx="20" cy="20" r="2.5" fill="#F9A825" />
            {/* Marcadores cardeais */}
            <text x="18.5" y="4" fill="#F9A825" fontSize="4" fontWeight="bold" fontFamily="sans-serif">N</text>
          </svg>
          <div>
            <p className="text-xs font-semibold text-green-300 leading-none tracking-widest uppercase">
              Trilha do
            </p>
            <p className="text-xl font-extrabold leading-none tracking-wide" style={{ color: '#F9A825', fontFamily: 'var(--font-montserrat), sans-serif' }}>
              LUCRO
            </p>
          </div>
        </div>
      </div>

      {/* Banner "continuar de onde parou" */}
      {hasSavedProgress && isPaid && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-white px-5 py-3 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#1B5E20' }}
        >
          <p className="text-sm font-medium">Você tem uma análise salva. Continuar de onde parou?</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={restoreProgress}
              className="text-xs font-bold bg-white rounded-lg px-3 py-1.5"
              style={{ color: '#1B5E20' }}
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={dismissSavedProgress}
              className="text-xs hover:text-white" style={{ color: '#4CAF50' }}
            >
              Ignorar
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── RESULTADO BÁSICO (grátis) ─────────────────────────────────── */}

      {/* Classificação */}
      <div className="bg-white pt-3 pb-3 px-6">
        <BusinessClassBadge classification={classification} />
      </div>

      {/* Frase de impacto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white border-t border-gray-100 px-6 py-2"
      >
        <p className="text-center text-gray-700 text-sm leading-snug">
          {result.lucroReal >= 0 ? (
            <>Seu negócio está <span className="font-bold text-green-600">no positivo</span> — veja como proteger e ampliar esse resultado</>
          ) : (
            <>Seu negócio está com <span className="font-bold text-red-600">Prejuízo</span> — estimamos{' '}
              <span className="font-bold text-red-600">{getLossRange(Math.abs(result.lucroReal))}/mês</span>
            </>
          )}
        </p>
      </motion.div>

      {/* ═══ BLOCOS DE CONVERSÃO — apenas para não-pagantes ═══════════════ */}
      {!isPaid && (
        <>
          {/* Separador visual */}
          <div
            className="mx-4 mt-2 h-px"
            style={{ background: 'linear-gradient(to right, transparent, #1B5E20 40%, #1B5E20 60%, transparent)' }}
          />

          {/* 1. Bloco de transição + CTA primário */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mx-4 mt-4 rounded-2xl overflow-hidden"
            style={{ border: '2px solid #1B5E20' }}
          >
            {/* Cabeçalho verde */}
            <div className="px-5 py-4" style={{ backgroundColor: '#1B5E20' }}>
              <p className="text-white font-bold text-lg leading-snug mb-1">
                O que está causando isso?
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: '#A5D6A7' }}>
                Descubra exatamente onde cortar gastos, quanto precisa vender por dia, e receba sua planilha pré-preenchida com seus dados.
              </p>
            </div>

            {/* Botão + ancoragem + trust signals + badge de urgência */}
            <div className="bg-white px-5 py-4">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackBeginCheckout}
                className="flex items-center justify-center w-full h-16 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                }}
              >
                {isPositive ? 'Ver meu plano pra aumentar o lucro — R$27' : 'Ver meu plano pra sair do prejuízo — R$27'}
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </a>

              {/* Ancoragem de preço */}
              <p className="mt-2 text-xs text-center text-gray-500">
                {isPositive
                  ? 'Menos que o custo de uma pizza pra proteger seu negócio.'
                  : 'Menos do que 1 dia do prejuízo que você está tendo.'}
              </p>

              {/* Trust signals */}
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2E7D32' }} />
                  <p className="text-xs text-gray-600 leading-snug">
                    <span className="font-semibold">Garantia de 7 dias</span> — devolvemos cada centavo, sem perguntas.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2E7D32' }} />
                  <p className="text-xs text-gray-600 leading-snug">
                    Lojistas que ajustam a precificação com dados reais aumentam a margem em média{' '}
                    <span className="font-semibold" style={{ color: '#2E7D32' }}>8 a 15%</span>.
                  </p>
                </div>
              </div>

              {/* Badge de urgência */}
              <div
                className="mt-3 flex items-center justify-center rounded-xl py-2 px-4"
                style={{ backgroundColor: '#FFFDE7', border: '1px solid #F9A825' }}
              >
                <span className="text-sm font-semibold text-center" style={{ color: '#E65100' }}>
                  ⏰ Oferta de lançamento — preço sobe pra R$37 em breve
                </span>
              </div>
            </div>
          </motion.div>

          {/* 2. Prévia borrada — cria curiosidade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mx-4 mt-4 relative overflow-hidden rounded-2xl"
          >
            <div className="blur-md opacity-60 pointer-events-none select-none p-4 space-y-2">
              {[
                { label: 'Seu faturamento ideal', value: 'R$ 18.750' },
                { label: 'Break-even diário', value: 'R$ 412' },
                { label: 'Margem que você deveria ter', value: '22,4%' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-xl font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(245,245,245,0.85) 40%)' }}
            >
              <span className="text-lg">🔒</span>
              <span
                className="text-sm font-semibold bg-white/95 px-4 py-2 rounded-full shadow"
                style={{ color: '#1B5E20' }}
              >
                Desbloqueie para ver seus números reais
              </span>
            </div>
          </motion.div>

          {/* 3. Prova social */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15 }}
            className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <p className="text-sm font-semibold text-gray-800">
                +300 lojistas já fizeram o diagnóstico
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📊</span>
              <p className="text-sm text-gray-600 leading-snug">
                <span className="font-semibold text-gray-800">Dados do SEBRAE:</span> lojistas que conhecem suas margens reais têm{' '}
                <span className="font-semibold" style={{ color: '#2E7D32' }}>3x mais chance</span> de sobreviver os primeiros 5 anos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2E7D32' }} />
              <p className="text-sm text-gray-600 leading-snug">
                <span className="font-semibold text-gray-800">Garantia total de 7 dias</span> — se não gostar, devolvemos cada centavo sem perguntas.
              </p>
            </div>
          </motion.div>

          {/* 5. O que vem no Trilha do Lucro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-5"
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: '#1B5E20' }}
            >
              O que vem no Trilha do Lucro
            </h3>
            <ul className="space-y-2.5">
              {PRODUCT_DELIVERABLES.map(({ benefit, tag }) => (
                <li key={tag} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: '#2E7D32' }}
                  />
                  <span className="text-sm text-gray-700 leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 6. Segundo CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="px-4 mt-4"
          >
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackBeginCheckout}
              className="flex items-center justify-center w-full h-16 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform gap-2"
              style={{
                background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)',
                color: '#1B5E20',
                fontFamily: 'var(--font-montserrat), sans-serif',
              }}
            >
              {isPositive ? 'Ver meu plano pra aumentar o lucro — R$27' : 'Ver meu plano pra sair do prejuízo — R$27'}
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </a>
          </motion.div>

          {/* 7. FAQ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            {[
              {
                q: 'Pra quem é o Trilha do Lucro?',
                a: 'Para lojistas e empreendedores que faturam mas não veem dinheiro sobrar. Se você sente que trabalha muito e no fim do mês o caixa não fecha, este produto é pra você.',
              },
              {
                q: 'Preciso saber de finanças?',
                a: 'Não. A linguagem é direta e prática — sem termos técnicos. Se você sabe quanto fatura e quanto gasta, já dá pra começar.',
              },
              {
                q: 'Como eu acesso depois de comprar?',
                a: 'O acesso é imediato. Você recebe o link no e-mail cadastrado na Hotmart assim que o pagamento é confirmado.',
              },
              {
                q: 'E se eu não gostar?',
                a: 'Garantia de 7 dias incondicional. Devolução total, sem perguntas.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group border-b border-gray-100 last:border-b-0">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none text-sm font-medium text-gray-800">
                  {q}
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </motion.div>

          {/* 8. Bloco de urgência "DIAGNÓSTICO PERSONALIZADO" */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mx-4 mt-4 rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-5" style={{ backgroundColor: '#1B5E20' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#F9A825' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#F9A825' }}>
                  Diagnóstico Personalizado
                </span>
              </div>
              <h2
                className="text-xl font-bold text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                {margem <= 0
                  ? 'Sua loja está operando no vermelho — cada dia assim aprofunda o buraco.'
                  : `Sua margem é de ${margem.toFixed(1)}% — de cada R$\u00A01.000 que entra, só R$\u00A0${porMil} fica com você.`}
              </h2>
              {gapAnual > 1000 && (
                <p className="text-sm leading-relaxed" style={{ color: '#A5D6A7' }}>
                  Se nada mudar nos próximos 12 meses, você vai deixar aproximadamente{' '}
                  <span className="font-bold" style={{ color: '#F9A825' }}>
                    R$&nbsp;{gapAnual.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>{' '}
                  na mesa — dinheiro que poderia estar no seu bolso.
                </p>
              )}
            </div>
            <div className="bg-white px-6 py-5 space-y-3">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackBeginCheckout}
                className="w-full py-4 rounded-2xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)',
                  color: '#1B5E20',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                }}
              >
                {isPositive ? 'Ver meu plano pra aumentar o lucro — R$27' : 'Ver meu plano pra sair do prejuízo — R$27'}
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => window.open('https://app.hotmart.com/products/purchased', '_blank')}
                className="w-full text-sm text-center py-1 underline underline-offset-2"
                style={{ color: '#1B5E20' }}
              >
                Já paguei — acessar minha compra
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* ═══ CONTEÚDO PAGO ═══════════════════════════════════════════════ */}
      {isPaid && (
        <div className="mt-4">
          {/* Métricas detalhadas */}
          <div className="px-4 space-y-3">
            <MetricCard
              label="Quanto sobra de verdade"
              value={formatBRL(result.lucroReal)}
              sublabel="Lucro real depois de pagar tudo (incluindo seu pró-labore)"
              icon="Wallet"
              positive={isPositive}
              delay={0.5}
            />
            <MetricCard
              label="Sua margem real"
              value={formatPercent(result.margemLiquida)}
              sublabel="De cada R$100 que entra, esse % é lucro"
              icon="Percent"
              positive={result.margemLiquida > 10}
              delay={0.6}
            />
            <MetricCard
              label="Mínimo para não ter prejuízo"
              value={result.pontoEquilibrio === Infinity ? 'Impossível calcular' : formatBRL(result.pontoEquilibrio)}
              sublabel="Faturamento mínimo para cobrir seus custos (sem contar pró-labore)"
              icon="Target"
              positive={input.faturamento >= result.pontoEquilibrio}
              delay={0.7}
            />
            <MetricCard
              label="Faturamento ideal"
              value={result.faturamentoNecessario === Infinity ? 'Impossível calcular' : formatBRL(result.faturamentoNecessario)}
              sublabel={`Para cobrir tudo + seu pró-labore de ${formatBRL(input.proLabore)}`}
              icon="TrendingUp"
              positive={input.faturamento >= result.faturamentoNecessario}
              delay={0.8}
            />
          </div>

          {/* Insights / Recomendações */}
          <div className="px-4 mt-6">
            <InsightsPanel insights={insights} />
          </div>

          {/* Materiais para download */}
          <div className="px-4 mt-6">
            <DeliverableButtons
              input={input}
              result={result}
              classification={classification}
              insights={insights}
              onShowChecklist={() => setShowChecklist(!showChecklist)}
              checklistVisible={showChecklist}
            />
          </div>

          {/* Checklist 30/60/90 */}
          {showChecklist && (
            <div className="px-4 mt-4">
              <ActionChecklist level={classification.level} />
            </div>
          )}

          {/* Resultado da estratégia gerada */}
          {paidStep === 'strategy' && (strategy || purposeAnswers.q1) && (
            <StrategyResult
              strategy={strategy ?? generateStrategy(purposeAnswers)}
              swotAnswers={swotAnswers}
              swotCrossing={swotCrossing}
              onRedo={() => goToStep('purpose')}
            />
          )}
        </div>
      )}

      {/* Botão refazer — sempre visível */}
      <div className="px-4 mt-8">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onRestart}
          className="w-full h-14 rounded-xl text-base"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Refazer diagnóstico
        </Button>
      </div>
    </div>
  );
}

// ─── StrategyResult ──────────────────────────────────────────────────────────

interface StrategyResultProps {
  strategy: GeneratedStrategy;
  swotAnswers: SwotAnswers;
  swotCrossing: SwotCrossing;
  onRedo: () => void;
}

function StrategyResult({ strategy, swotAnswers, swotCrossing, onRedo }: StrategyResultProps) {
  const topCrossings = [...swotCrossing.items]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 mt-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900">Sua Estratégia</h2>
        <button
          type="button"
          onClick={onRedo}
          className="text-xs hover:opacity-80"
          style={{ color: '#1B5E20' }}
        >
          Refazer análise
        </button>
      </div>

      {/* Propósito, Missão, Visão */}
      {[
        { label: 'Propósito', text: strategy.purpose, color: 'border-l-green-600' },
        { label: 'Missão', text: strategy.mission, color: 'border-l-green-500' },
        { label: 'Visão', text: strategy.vision, color: 'border-l-purple-500' },
      ].map(({ label, text, color }) => (
        <div key={label} className={`bg-white rounded-2xl border border-gray-100 p-4 border-l-4 ${color}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm text-gray-800 leading-relaxed">{text}</p>
        </div>
      ))}

      {/* Valores */}
      {strategy.values.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Valores</p>
          <div className="flex flex-wrap gap-2">
            {strategy.values.map(v => (
              <span key={v} className="px-3 py-1 text-sm font-medium bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SWOT resumida */}
      <SwotSummary answers={swotAnswers} />

      {/* Top cruzamentos */}
      {topCrossings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Principais oportunidades estratégicas
          </p>
          <div className="space-y-3">
            {topCrossings.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  item.score >= 4 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.score}
                </span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {item.type === 'SO' ? 'Força × Oportunidade' :
                     item.type === 'ST' ? 'Força × Ameaça' :
                     item.type === 'WO' ? 'Fraqueza × Oportunidade' : 'Fraqueza × Ameaça'}
                  </p>
                  <p className="text-sm text-gray-700">{item.itemA} → {item.itemB}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── SwotSummary ─────────────────────────────────────────────────────────────

interface SwotSummaryProps {
  answers: SwotAnswers;
}

function SwotSummary({ answers }: SwotSummaryProps) {
  const quadrants = [
    {
      label: 'Forças', color: 'text-green-700', bg: 'bg-green-50',
      items: [...answers.strengths.filter(s => s.trim()), ...answers.strengthPraise],
    },
    {
      label: 'Fraquezas', color: 'text-red-600', bg: 'bg-red-50',
      items: [...answers.weaknesses.filter(s => s.trim()), answers.weaknessPain].filter(Boolean),
    },
    {
      label: 'Oportunidades', color: 'text-green-700', bg: 'bg-green-50',
      items: [...answers.opportunities.filter(s => s.trim()), ...answers.opportunityChoices],
    },
    {
      label: 'Ameaças', color: 'text-orange-600', bg: 'bg-orange-50',
      items: [...answers.threats.filter(s => s.trim()), ...answers.threatChoices],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Matriz SWOT</p>
      <div className="grid grid-cols-2 gap-3">
        {quadrants.map(({ label, color, bg, items }) => (
          <div key={label} className={`rounded-xl p-3 ${bg}`}>
            <p className={`text-xs font-bold mb-2 ${color}`}>{label}</p>
            <ul className="space-y-1">
              {items.slice(0, 4).map((item, i) => (
                <li key={i} className="text-xs text-gray-700 leading-snug">• {item}</li>
              ))}
              {items.length === 0 && (
                <li className="text-xs text-gray-400 italic">Nenhum item</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
