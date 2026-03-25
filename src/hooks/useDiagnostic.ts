'use client';

import { useState, useCallback } from 'react';
import type { DiagnosticInput, DiagnosticResult, BusinessClassification, Insight } from '@/types';
import { runDiagnostic } from '@/lib/calculations';
import { classifyBusiness } from '@/lib/classification';
import { generateInsights } from '@/lib/insights';

export type DiagnosticPhase = 'quiz' | 'loading' | 'result';

export function useDiagnostic() {
  const [phase, setPhase] = useState<DiagnosticPhase>('quiz');
  const [input, setInput] = useState<DiagnosticInput>({
    faturamento: 0,
    custosFixos: 0,
    custoProductPercent: 45,
    taxaPercent: 8,
    proLabore: 0,
    fretePercentual: 0,
  });
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [classification, setClassification] = useState<BusinessClassification | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  const updateField = useCallback((field: keyof DiagnosticInput, value: number) => {
    setInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const submitDiagnostic = useCallback(() => {
    setPhase('loading');

    // Simula processamento com delay para criar expectativa
    setTimeout(() => {
      const diagnosticResult = runDiagnostic(input);
      const businessClass = classifyBusiness(diagnosticResult);
      const generatedInsights = generateInsights(input, diagnosticResult, businessClass);

      setResult(diagnosticResult);
      setClassification(businessClass);
      setInsights(generatedInsights);
      setPhase('result');
    }, 2500);
  }, [input]);

  const restart = useCallback(() => {
    setPhase('quiz');
    setInput({
      faturamento: 0,
      custosFixos: 0,
      custoProductPercent: 45,
      taxaPercent: 8,
      proLabore: 0,
      fretePercentual: 0,
    });
    setResult(null);
    setClassification(null);
    setInsights([]);
  }, []);

  return {
    phase,
    input,
    result,
    classification,
    insights,
    updateField,
    submitDiagnostic,
    restart,
  };
}
