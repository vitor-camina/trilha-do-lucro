'use client';

import { Progress } from '@/components/ui/progress';

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
      </div>
      <Progress value={percent} className="h-1.5" />
    </div>
  );
}
