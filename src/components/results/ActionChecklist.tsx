'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import type { BusinessLevel, ChecklistItem, ChecklistPhase } from '@/types';
import { getChecklist } from '@/lib/checklist';

interface ActionChecklistProps {
  level: BusinessLevel;
}

const PHASE_LABELS: Record<ChecklistPhase, string> = {
  '30': 'Primeiros 30 dias',
  '60': '30 a 60 dias',
  '90': '60 a 90 dias',
};

export function ActionChecklist({ level }: ActionChecklistProps) {
  const items = getChecklist(level);
  const storageKey = `raiox_checklist_${level}`;

  const [checked, setChecked] = useState<Set<number>>(new Set());

  // Carrega estado do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setChecked(new Set(JSON.parse(saved)));
      }
    } catch {
      // silently fail
    }
  }, [storageKey]);

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // silently fail
      }
      return next;
    });
  }

  // Agrupa por fase
  const phases: ChecklistPhase[] = ['30', '60', '90'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h3 className="text-lg font-bold text-gray-900">
        Plano de Ação 30/60/90 dias
      </h3>

      {phases.map((phase) => {
        const phaseItems = items
          .map((item, originalIndex) => ({ item, originalIndex }))
          .filter(({ item }) => item.phase === phase);

        const completedCount = phaseItems.filter(({ originalIndex }) => checked.has(originalIndex)).length;

        return (
          <div key={phase} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {PHASE_LABELS[phase]}
              </h4>
              <span className="text-xs text-gray-400">
                {completedCount}/{phaseItems.length}
              </span>
            </div>

            <div className="space-y-3">
              {phaseItems.map(({ item, originalIndex }: { item: ChecklistItem; originalIndex: number }) => {
                const isDone = checked.has(originalIndex);
                return (
                  <button
                    key={originalIndex}
                    type="button"
                    onClick={() => toggleItem(originalIndex)}
                    className="w-full text-left flex items-start gap-3 group"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {item.task}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDone ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.detail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
