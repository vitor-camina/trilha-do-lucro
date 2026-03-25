'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PurposeAnswers } from '@/types';

const VALUES_OPTIONS = [
  'Qualidade',
  'Atendimento próximo',
  'Preço justo',
  'Inovação',
  'Tradição',
  'Confiança',
  'Agilidade',
  'Exclusividade',
  'Sustentabilidade',
  'Compromisso com o cliente',
];

interface PurposeQuizProps {
  initial: PurposeAnswers;
  onComplete: (answers: PurposeAnswers) => void;
  onBack: () => void;
}

export default function PurposeQuiz({ initial, onComplete, onBack }: PurposeQuizProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<PurposeAnswers>(initial);

  const TOTAL = 5;

  function updateText(field: keyof Omit<PurposeAnswers, 'q5'>, value: string) {
    setAnswers(prev => ({ ...prev, [field]: value }));
  }

  function toggleValue(val: string) {
    setAnswers(prev => {
      const current = prev.q5;
      if (current.includes(val)) {
        return { ...prev, q5: current.filter(v => v !== val) };
      }
      if (current.length >= 3) return prev; // máx 3
      return { ...prev, q5: [...current, val] };
    });
  }

  const isValid = useCallback((): boolean => {
    if (step === 0) return answers.q1.trim().length > 0;
    if (step === 1) return answers.q2.trim().length > 0;
    if (step === 2) return answers.q3.trim().length > 0;
    if (step === 3) return answers.q4.trim().length > 0;
    if (step === 4) return answers.q5.length >= 1;
    return false;
  }, [step, answers]);

  function handleNext() {
    if (!isValid()) return;
    if (step === TOTAL - 1) {
      onComplete(answers);
    } else {
      setDirection(1);
      setStep(s => s + 1);
    }
  }

  function handleBack() {
    if (step === 0) {
      onBack();
    } else {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }

  const progress = ((step + 1) / TOTAL) * 100;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Cabeçalho com progresso */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
            <Target className="w-4 h-4" style={{ color: '#1B5E20' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: '#1B5E20' }}>Propósito & Valores</span>
          <span className="ml-auto text-xs text-gray-400">{step + 1} / {TOTAL}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <motion.div
            className="h-1.5 rounded-full" style={{ backgroundColor: '#1B5E20' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ x: direction * 260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -260, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex flex-col flex-1 px-6 py-6"
        >
          {step === 0 && (
            <TextStep
              question="Se sua loja não existisse, qual vazio ela deixaria na vida das pessoas ou na comunidade?"
              subtitle="Pense no impacto real que sua loja tem nas pessoas ao redor."
              value={answers.q1}
              onChange={v => updateText('q1', v)}
              placeholder="Ex: Meus clientes não teriam onde encontrar produtos de qualidade perto de casa, com atendimento humano..."
            />
          )}
          {step === 1 && (
            <TextStep
              question="O que você faz na sua loja que nenhum concorrente próximo faz, e por que isso importa para seus clientes?"
              subtitle="Qual é o seu diferencial de verdade? Pode ser atendimento, produto exclusivo, condições especiais..."
              value={answers.q2}
              onChange={v => updateText('q2', v)}
              placeholder="Ex: Ofereço consultoria personalizada na hora da compra, o cliente sai com certeza do que está levando..."
            />
          )}
          {step === 2 && (
            <TextStep
              question="Que mudança você gostaria de ver no seu mercado ou na sua comunidade que sua loja ajuda a realizar?"
              subtitle="Qual o papel maior da sua loja? O que você quer transformar?"
              value={answers.q3}
              onChange={v => updateText('q3', v)}
              placeholder="Ex: Quero que as pessoas do bairro tenham acesso a produtos de qualidade sem precisar ir ao centro..."
            />
          )}
          {step === 3 && (
            <TextStep
              question="Se um cliente descrevesse sua loja em uma frase, o que você gostaria que ele dissesse?"
              subtitle="Qual a melhor coisa que alguém poderia falar da sua loja?"
              value={answers.q4}
              onChange={v => updateText('q4', v)}
              placeholder="Ex: É a loja onde eu me sinto em casa e sei que vou sair bem atendido..."
            />
          )}
          {step === 4 && (
            <ValuesStep
              selected={answers.q5}
              onToggle={toggleValue}
            />
          )}
        </motion.div>
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
          disabled={!isValid()}
          className="flex-1 h-14 rounded-xl text-base font-semibold disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)', color: '#1B5E20' }}
        >
          {step === TOTAL - 1 ? 'Próxima etapa' : (
            <>Próximo <ArrowRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-componentes internos ───────────────────────────────────────────────

interface TextStepProps {
  question: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

function TextStep({ question, subtitle, value, onChange, placeholder }: TextStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{question}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full p-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none leading-relaxed" onFocus={e => { e.currentTarget.style.borderColor='#1B5E20'; e.currentTarget.style.boxShadow='0 0 0 1px #4CAF50'; }} onBlur={e => { e.currentTarget.style.borderColor=''; e.currentTarget.style.boxShadow=''; }}
      />
    </div>
  );
}

interface ValuesStepProps {
  selected: string[];
  onToggle: (val: string) => void;
}

function ValuesStep({ selected, onToggle }: ValuesStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">
        Escolha os 3 valores que mais representam o jeito da sua loja funcionar
      </h2>
      <p className="text-sm text-gray-500">
        Selecione até 3 valores.{' '}
        <span className={selected.length >= 3 ? 'font-semibold' : 'text-gray-400'} style={selected.length >= 3 ? { color: '#1B5E20' } : {}}>
          {selected.length}/3 selecionados
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {VALUES_OPTIONS.map(val => {
          const isSelected = selected.includes(val);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onToggle(val)}
              disabled={isDisabled}
              className={[
                'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                isSelected
                  ? 'text-white shadow-sm'
                  : isDisabled
                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50',
              ].join(' ')}
              style={isSelected ? { backgroundColor: '#1B5E20', borderColor: '#1B5E20' } : {}}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
}
