'use client';

import { useState, useEffect } from 'react';
import { useDiagnostic } from '@/hooks/useDiagnostic';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { LoadingScreen } from '@/components/quiz/LoadingScreen';
import { WelcomeScreen } from '@/components/quiz/WelcomeScreen';
import { ResultsDashboard } from '@/components/results/ResultsDashboard';
import { trackQuizCompleted } from '@/lib/tracking';
import { PaymentConfirmedBanner } from '@/components/diagnostico/PaymentConfirmedBanner';

export default function DiagnosticoPage() {
  const {
    phase,
    input,
    result,
    classification,
    insights,
    updateField,
    submitDiagnostic,
    restart,
  } = useDiagnostic();

  const [quizStarted, setQuizStarted] = useState(false);

  // Detecta retorno pós-pagamento do Hotmart via ?acesso=TL2026x9k.
  // useEffect evita hydration mismatch (window indisponível no servidor).
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowPaymentBanner(params.get('acesso') === 'TL2026x9k');
  }, []);

  function handleSubmit() {
    trackQuizCompleted();
    submitDiagnostic();
  }

  if (phase === 'loading') {
    return <LoadingScreen />;
  }

  if (phase === 'result' && result && classification) {
    return (
      <ResultsDashboard
        input={input}
        result={result}
        classification={classification}
        insights={insights}
        onRestart={restart}
      />
    );
  }

  if (!quizStarted) {
    return <WelcomeScreen onStart={() => setQuizStarted(true)} />;
  }

  return (
    <>
      <PaymentConfirmedBanner show={showPaymentBanner} />
      <QuizContainer
        input={input}
        onUpdateField={updateField}
        onSubmit={handleSubmit}
      />
    </>
  );
}
