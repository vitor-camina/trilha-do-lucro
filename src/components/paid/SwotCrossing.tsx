'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SwotAnswers, SwotCrossing, SwotCrossingItem, SwotCrossingType } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Retorna até os top-3 itens não-vazios de um array */
function top3(arr: string[]): string[] {
  return arr.filter(s => s.trim().length > 0).slice(0, 3);
}

/** Combina texto + choices de um quadrante */
function mergeItems(textItems: string[], choiceItems: string[]): string[] {
  const all = [...textItems.filter(s => s.trim()), ...choiceItems];
  // Deduplica e pega top 3
  return [...new Set(all)].slice(0, 3);
}

// Rótulos e cores por tipo de cruzamento
const CROSSING_CONFIG: Record<SwotCrossingType, { label: string; question: string; color: string; bg: string }> = {
  SO: {
    label: 'Força × Oportunidade',
    question: 'De 1 a 5, o quanto essa força ajuda a aproveitar essa oportunidade?',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  ST: {
    label: 'Força × Ameaça',
    question: 'De 1 a 5, o quanto essa força ajuda a reduzir essa ameaça?',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  WO: {
    label: 'Fraqueza × Oportunidade',
    question: 'De 1 a 5, o quanto essa fraqueza atrapalha aproveitar essa oportunidade?',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
  },
  WT: {
    label: 'Fraqueza × Ameaça',
    question: 'De 1 a 5, o quanto essa fraqueza piora diante dessa ameaça?',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
  },
};

// ─── Geração de cruzamentos ──────────────────────────────────────────────────

function buildCrossings(swot: SwotAnswers): SwotCrossingItem[] {
  const strengths = mergeItems(swot.strengths, []);
  const weaknesses = mergeItems(swot.weaknesses, []);
  const opportunities = mergeItems(swot.opportunities, swot.opportunityChoices);
  const threats = mergeItems(swot.threats, swot.threatChoices);

  const items: SwotCrossingItem[] = [];

  const addPairs = (type: SwotCrossingType, listA: string[], listB: string[]) => {
    for (const a of top3(listA)) {
      for (const b of top3(listB)) {
        items.push({ type, itemA: a, itemB: b, score: 3 });
      }
    }
  };

  addPairs('SO', strengths, opportunities);
  addPairs('ST', strengths, threats);
  addPairs('WO', weaknesses, opportunities);
  addPairs('WT', weaknesses, threats);

  return items.slice(0, 36); // máx 36
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface SwotCrossingProps {
  swotAnswers: SwotAnswers;
  initial: SwotCrossing;
  onComplete: (crossing: SwotCrossing) => void;
  onBack: () => void;
}

export default function SwotCrossing({ swotAnswers, initial, onComplete, onBack }: SwotCrossingProps) {
  const generatedItems = useMemo(() => buildCrossings(swotAnswers), [swotAnswers]);

  // Inicializa com os cruzamentos gerados; mantém scores de initial se já existirem
  const [items, setItems] = useState<SwotCrossingItem[]>(() => {
    if (initial.items.length > 0) return initial.items;
    return generatedItems;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = items.length;
  const current = items[currentIndex];
  const config = current ? CROSSING_CONFIG[current.type] : null;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 100;

  function updateScore(index: number, score: number) {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], score };
      return next;
    });
  }

  function handleNext() {
    if (currentIndex === total - 1) {
      onComplete({ items });
    } else {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  }

  function handleBack() {
    if (currentIndex === 0) {
      onBack();
    } else {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-4">
        <p className="text-gray-500 text-center">
          Não foram gerados cruzamentos. Volte e preencha ao menos um item em cada quadrante.
        </p>
        <Button onClick={onBack} variant="outline" className="rounded-xl">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Cabeçalho */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <GitMerge className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-sm font-semibold text-amber-600">Cruzamento SWOT</span>
          <span className="ml-auto text-xs text-gray-400">{currentIndex + 1} / {total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <motion.div
            className="bg-amber-500 h-1.5 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card de cruzamento */}
      <AnimatePresence mode="wait" custom={direction}>
        {current && config && (
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction * 260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col flex-1 px-6 py-6 gap-5"
          >
            {/* Tipo do cruzamento */}
            <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
              {config.label}
            </span>

            {/* Os dois itens */}
            <div className={`rounded-2xl border p-4 ${config.bg} flex flex-col gap-3`}>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {current.type.startsWith('S') ? 'Força' : 'Fraqueza'}
                </p>
                <p className="text-sm font-semibold text-gray-800">{current.itemA}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {current.type.endsWith('O') ? 'Oportunidade' : 'Ameaça'}
                </p>
                <p className="text-sm font-semibold text-gray-800">{current.itemB}</p>
              </div>
            </div>

            {/* Pergunta de avaliação */}
            <p className="text-base font-medium text-gray-700 leading-snug">
              {config.question}
            </p>

            {/* Botões de pontuação 1-5 */}
            <ScoreButtons
              value={current.score}
              onChange={score => updateScore(currentIndex, score)}
            />

            {/* Legenda */}
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Pouco relevante</span>
              <span>Muito relevante</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegação */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleBack}
          className="flex-shrink-0 h-14 px-5 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          className="flex-1 h-14 rounded-xl text-base font-semibold bg-amber-500 hover:bg-amber-600"
        >
          {currentIndex === total - 1 ? 'Gerar estratégia' : (
            <>Próximo <ArrowRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── ScoreButtons ────────────────────────────────────────────────────────────

interface ScoreButtonsProps {
  value: number;
  onChange: (score: number) => void;
}

function ScoreButtons({ value, onChange }: ScoreButtonsProps) {
  const SCORES = [1, 2, 3, 4, 5];
  const colors = ['bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-lime-100 text-lime-700', 'bg-green-100 text-green-700'];
  const activeColors = ['bg-red-500 text-white', 'bg-orange-500 text-white', 'bg-yellow-500 text-white', 'bg-lime-500 text-white', 'bg-green-500 text-white'];

  return (
    <div className="flex gap-3 justify-center">
      {SCORES.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={[
            'w-12 h-12 rounded-2xl text-lg font-bold transition-all',
            value === s ? activeColors[i] : colors[i],
          ].join(' ')}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
