'use client';

import { useState, useEffect } from 'react';
import { useDiagnostic } from '@/hooks/useDiagnostic';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { LoadingScreen } from '@/components/quiz/LoadingScreen';
import { ResultsDashboard } from '@/components/results/ResultsDashboard';
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

  // Detecta retorno pós-pagamento do Hotmart via ?acesso=TL2026x9k.
  // useEffect evita hydration mismatch (window indisponível no servidor).
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowPaymentBanner(params.get('acesso') === 'TL2026x9k');
  }, []);

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

  return (
    <>
      <PaymentConfirmedBanner show={showPaymentBanner} />
      <QuizContainer
        input={input}
        onUpdateField={updateField}
        onSubmit={submitDiagnostic}
      />
    </>
  );
}
