'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { QuizQuestion, DiagnosticInput } from '@/types';
import { CurrencyInput } from './CurrencyInput';
import { PercentSlider } from './PercentSlider';

interface QuestionScreenProps {
  question: QuizQuestion;
  value: number;
  onChange: (field: keyof DiagnosticInput, value: number) => void;
  direction: number; // 1 para frente, -1 para trás
}

export function QuestionScreen({ question, value, onChange, direction }: QuestionScreenProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <motion.div
      key={question.id}
      initial={{ x: direction * 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction * -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col items-center justify-center flex-1 px-6 py-8"
    >
      {/* Pergunta */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3 leading-tight">
        {question.question}
      </h2>

      {/* Subtexto explicativo */}
      <p className="text-base text-gray-500 text-center mb-8 max-w-sm leading-relaxed">
        {question.subtitle}
      </p>

      {/* Input */}
      {question.type === 'currency' ? (
        <CurrencyInput
          value={value}
          onChange={(v) => onChange(question.id, v)}
          placeholder={question.placeholder}
        />
      ) : (
        <PercentSlider
          value={value}
          onChange={(v) => onChange(question.id, v)}
          min={question.min}
          max={question.max}
          step={question.step}
          showCostExample={question.id === 'custoProductPercent'}
        />
      )}

      {/* Dica expandível */}
      {question.hint && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="mt-6 flex items-center gap-1 text-sm hover:opacity-80 transition-colors" style={{ color: '#1B5E20' }}
        >
          {showHint ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showHint ? 'Esconder dica' : 'Não sabe? Veja uma dica'}
        </button>
      )}
      {showHint && question.hint && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-gray-500 text-center max-w-sm rounded-xl p-3" style={{ backgroundColor: '#E8F5E9' }}
        >
          {question.hint}
        </motion.p>
      )}
    </motion.div>
  );
}
