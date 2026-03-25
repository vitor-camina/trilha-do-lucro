'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  DiagnosticInput, DiagnosticResult, BusinessClassification, Insight,
  PurposeAnswers, SwotAnswers, SwotCrossing, GeneratedStrategy,
} from '@/types';
import { formatBRL, formatPercent } from '@/lib/formatters';
import { generateStrategy } from '@/lib/strategy-generator';
import { useProgress } from '@/hooks/useProgress';
import { BusinessClassBadge } from './BusinessClassBadge';
import { MetricCard } from './MetricCard';
import { InsightsPanel } from './InsightsPanel';
import { PaywallScreen } from './PaywallScreen';
import { DeliverableButtons } from './DeliverableButtons';
import { ActionChecklist } from './ActionChecklist';
import PurposeQuiz from '@/components/paid/PurposeQuiz';
import SwotQuiz from '@/components/paid/SwotQuiz';
import SwotCrossingComponent from '@/components/paid/SwotCrossing';

// URL do checkout da Hotmart — substituir pela URL real do produto
const HOTMART_CHECKOUT_URL = process.env.NEXT_PUBLIC_HOTMART_URL || 'https://hotmart.com/pt-br';

interface ResultsDashboardProps {
  input: DiagnosticInput;
  result: DiagnosticResult;
  classification: BusinessClassification;
  insights: Insight[];
  onRestart: () => void;
}

export function ResultsDashboard({ input, result, classification, insights, onRestart }: ResultsDashboardProps) {
  const isPositive = result.lucroReal >= 0;
  const [isPaid, setIsPaid] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [strategy, setStrategy] = useState<GeneratedStrategy | null>(null);

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

  // Verifica acesso pago
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('acesso') === 'liberado') {
      setIsPaid(true);
      localStorage.setItem('raiox_paid', 'true');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (localStorage.getItem('raiox_paid') === 'true') {
      setIsPaid(true);
    }
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

  // ─── Tela principal (financial + strategy resultado) ────────────────────

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-8">
      {/* Banner "continuar de onde parou" */}
      {hasSavedProgress && isPaid && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-blue-600 text-white px-5 py-3 flex items-center justify-between gap-3"
        >
          <p className="text-sm font-medium">Você tem uma análise salva. Continuar de onde parou?</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={restoreProgress}
              className="text-xs font-bold bg-white text-blue-600 rounded-lg px-3 py-1.5"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={dismissSavedProgress}
              className="text-xs text-blue-200 hover:text-white"
            >
              Ignorar
            </button>
          </div>
        </motion.div>
      )}

      {/* Header com classificação — GRÁTIS */}
      <div className="bg-white pt-8 pb-6 px-6">
        <BusinessClassBadge classification={classification} />
      </div>

      {/* Frase de impacto — GRÁTIS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white border-t border-gray-100 px-6 py-4"
      >
        <p className="text-center text-gray-700 text-base leading-relaxed">
          {result.lucroReal >= 0 ? (
            <>Sua loja gera <span className="font-bold text-green-600">{formatBRL(result.lucroReal)}</span> de lucro real por mês</>
          ) : (
            <>Sua loja está perdendo <span className="font-bold text-red-600">{formatBRL(Math.abs(result.lucroReal))}</span> por mês</>
          )}
        </p>
      </motion.div>

      {/* Resumo dos dados informados — GRÁTIS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Dados informados
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Faturamento</p>
            <p className="font-semibold text-gray-900">{formatBRL(input.faturamento)}</p>
          </div>
          <div>
            <p className="text-gray-400">Custos fixos</p>
            <p className="font-semibold text-gray-900">{formatBRL(input.custosFixos)}</p>
          </div>
          <div>
            <p className="text-gray-400">Custo do produto</p>
            <p className="font-semibold text-gray-900">{input.custoProductPercent}%</p>
          </div>
          <div>
            <p className="text-gray-400">Taxas</p>
            <p className="font-semibold text-gray-900">{input.taxaPercent}%</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400">Pró-labore desejado</p>
            <p className="font-semibold text-gray-900">{formatBRL(input.proLabore)}</p>
          </div>
        </div>
      </motion.div>

      {/* PAYWALL ou conteúdo pago */}
      {!isPaid ? (
        <div className="mt-4">
          <PaywallScreen onUnlock={handleUnlock} hotmartUrl={HOTMART_CHECKOUT_URL} />
        </div>
      ) : (
        <>
          {/* Métricas detalhadas — PAGO */}
          <div className="px-4 mt-4 space-y-3">
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

          {/* Insights / Recomendações — PAGO */}
          <div className="px-4 mt-6">
            <InsightsPanel insights={insights} />
          </div>

          {/* Materiais para download — PAGO */}
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

          {/* Checklist 30/60/90 — PAGO */}
          {showChecklist && (
            <div className="px-4 mt-4">
              <ActionChecklist level={classification.level} />
            </div>
          )}

          {/* ─── Análise Estratégica ─────────────────────────────────────── */}
          {paidStep === 'financial' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-4 mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    Análise Estratégica completa
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Crie o propósito, missão, visão e valores da sua loja — e monte sua matriz SWOT com cruzamentos estratégicos personalizados.
                  </p>
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => goToStep('purpose')}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Iniciar análise estratégica
                  </Button>
                </div>
              </div>
            </motion.div>
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
        </>
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
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          Refazer análise
        </button>
      </div>

      {/* Propósito, Missão, Visão */}
      {[
        { label: 'Propósito', text: strategy.purpose, color: 'border-l-blue-500' },
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
      label: 'Oportunidades', color: 'text-blue-700', bg: 'bg-blue-50',
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
