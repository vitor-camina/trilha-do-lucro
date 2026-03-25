'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedProgress, PaidStep, PurposeAnswers, SwotAnswers, SwotCrossing, DiagnosticInput } from '@/types';

const STORAGE_KEY = 'raioxnegocio_progress';

const EMPTY_PURPOSE: PurposeAnswers = { q1: '', q2: '', q3: '', q4: '', q5: [] };
const EMPTY_SWOT: SwotAnswers = {
  strengths: ['', '', ''],
  strengthPraise: [],
  weaknesses: ['', '', ''],
  weaknessPain: '',
  opportunities: ['', '', ''],
  opportunityChoices: [],
  threats: ['', '', ''],
  threatChoices: [],
};

function loadFromStorage(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedProgress;
  } catch {
    return null;
  }
}

function saveToStorage(data: SavedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

export function useProgress(financialInput?: DiagnosticInput) {
  const [paidStep, setPaidStep] = useState<PaidStep>('financial');
  const [purposeAnswers, setPurposeAnswers] = useState<PurposeAnswers>(EMPTY_PURPOSE);
  const [swotAnswers, setSwotAnswers] = useState<SwotAnswers>(EMPTY_SWOT);
  const [swotCrossing, setSwotCrossing] = useState<SwotCrossing>({ items: [] });
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Verifica progresso salvo na montagem
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setHasSavedProgress(true);
    }
  }, []);

  const restoreProgress = useCallback(() => {
    const saved = loadFromStorage();
    if (!saved) return;
    setPaidStep(saved.step ?? 'financial');
    if (saved.purposeAnswers) setPurposeAnswers(saved.purposeAnswers);
    if (saved.swotAnswers) setSwotAnswers(saved.swotAnswers);
    if (saved.swotCrossing) setSwotCrossing(saved.swotCrossing);
    setHasSavedProgress(false);
  }, []);

  const dismissSavedProgress = useCallback(() => {
    setHasSavedProgress(false);
  }, []);

  const saveProgress = useCallback((overrides?: Partial<SavedProgress>) => {
    const data: SavedProgress = {
      step: paidStep,
      financial: financialInput,
      purposeAnswers,
      swotAnswers,
      swotCrossing,
      ...overrides,
    };
    saveToStorage(data);
  }, [paidStep, financialInput, purposeAnswers, swotAnswers, swotCrossing]);

  const goToStep = useCallback((step: PaidStep, data?: Partial<SavedProgress>) => {
    setPaidStep(step);
    if (data?.purposeAnswers) setPurposeAnswers(data.purposeAnswers);
    if (data?.swotAnswers) setSwotAnswers(data.swotAnswers);
    if (data?.swotCrossing) setSwotCrossing(data.swotCrossing);

    // Auto-save after step transition
    setTimeout(() => {
      saveToStorage({
        step,
        financial: financialInput,
        purposeAnswers: data?.purposeAnswers ?? purposeAnswers,
        swotAnswers: data?.swotAnswers ?? swotAnswers,
        swotCrossing: data?.swotCrossing ?? swotCrossing,
      });
    }, 0);
  }, [financialInput, purposeAnswers, swotAnswers, swotCrossing]);

  const clearProgress = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* empty */ }
    setPaidStep('financial');
    setPurposeAnswers(EMPTY_PURPOSE);
    setSwotAnswers(EMPTY_SWOT);
    setSwotCrossing({ items: [] });
    setHasSavedProgress(false);
  }, []);

  return {
    paidStep,
    purposeAnswers,
    swotAnswers,
    swotCrossing,
    hasSavedProgress,
    restoreProgress,
    dismissSavedProgress,
    saveProgress,
    goToStep,
    clearProgress,
    setPurposeAnswers,
    setSwotAnswers,
    setSwotCrossing,
  };
}
