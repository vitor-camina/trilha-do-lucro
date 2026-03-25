'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QUIZ_QUESTIONS } from '@/lib/constants';
import type { DiagnosticInput } from '@/types';
import { QuizProgress } from './QuizProgress';
import { QuestionScreen } from './QuestionScreen';

interface QuizContainerProps {
  input: DiagnosticInput;
  onUpdateField: (field: keyof DiagnosticInput, value: number) => void;
  onSubmit: () => void;
}

export function QuizContainer({ input, onUpdateField, onSubmit }: QuizContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const totalSteps = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Validação: campos de moeda devem ter valor > 0, percentuais são sempre válidos
  const currentValue = input[currentQuestion.id];
  const isValid = currentQuestion.type === 'percent' || currentValue > 0;

  function handleNext() {
    if (!isValid) return;
    if (isLastStep) {
      onSubmit();
    } else {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (isFirstStep) return;
    setDirection(-1);
    setCurrentStep(currentStep - 1);
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Progresso */}
      <QuizProgress current={currentStep} total={totalSteps} />

      {/* Pergunta */}
      <AnimatePresence mode="wait" custom={direction}>
        <QuestionScreen
          key={currentQuestion.id}
          question={currentQuestion}
          value={currentValue}
          onChange={onUpdateField}
          direction={direction}
        />
      </AnimatePresence>

      {/* Navegação fixa no rodapé */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-shrink-0 h-14 px-6 rounded-xl text-base"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1 h-14 rounded-xl text-lg font-semibold disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)', color: '#1B5E20' }}
        >
          {isLastStep ? (
            'Ver meu Diagnóstico'
          ) : (
            <>
              Próximo
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
