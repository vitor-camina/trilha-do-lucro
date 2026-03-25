import type { BusinessClassification, DiagnosticResult } from '@/types';
import { CLASSIFICATIONS, CLASSIFICATION_THRESHOLDS } from './constants';

/**
 * Classifica o negócio com base na margem líquida.
 */
export function classifyBusiness(result: DiagnosticResult): BusinessClassification {
  const { margemLiquida } = result;

  if (margemLiquida < CLASSIFICATION_THRESHOLDS.prejuizo.max) {
    return CLASSIFICATIONS.prejuizo;
  }
  if (margemLiquida < CLASSIFICATION_THRESHOLDS.sobrevivendo.max) {
    return CLASSIFICATIONS.sobrevivendo;
  }
  if (margemLiquida < CLASSIFICATION_THRESHOLDS.estavel.max) {
    return CLASSIFICATIONS.estavel;
  }
  if (margemLiquida < CLASSIFICATION_THRESHOLDS.saudavel.max) {
    return CLASSIFICATIONS.saudavel;
  }
  return CLASSIFICATIONS.escalavel;
}
