'use client';

import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const percent = ((current + 1) / total) * 100;

  return (
    <div className="w-full px-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">
          Pergunta {current + 1} de {total}
        </span>
        <span className="text-sm font-semibold" style={{ color: '#1B5E20' }}>
          {Math.round(percent)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #1B5E20 0%, #4CAF50 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
