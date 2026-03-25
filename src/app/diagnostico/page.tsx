'use client';

import { useDiagnostic } from '@/hooks/useDiagnostic';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { LoadingScreen } from '@/components/quiz/LoadingScreen';
import { ResultsDashboard } from '@/components/results/ResultsDashboard';

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
    <QuizContainer
      input={input}
      onUpdateField={updateField}
      onSubmit={submitDiagnostic}
    />
  );
}
