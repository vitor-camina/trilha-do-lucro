'use client';

import { motion } from 'framer-motion';
import type { Insight } from '@/types';
import { getIcon } from '@/lib/icons';

interface InsightsPanelProps {
  insights: Insight[];
}

const priorityStyles = {
  alta: { bg: 'bg-red-50', border: 'border-red-100', badge: 'bg-red-100 text-red-700' },
  media: { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-100 text-amber-700' },
  baixa: { bg: 'bg-green-50', border: 'border-green-100', badge: 'bg-green-100 text-green-700' },
};

const priorityLabels = {
  alta: 'Urgente',
  media: 'Importante',
  baixa: 'Dica',
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 px-1">
        O que fazer agora
      </h3>

      {insights.map((insight, i) => {
        const style = priorityStyles[insight.priority];
        const IconComponent = getIcon(insight.icon);

        return (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 + i * 0.15 }}
            className={`${style.bg} ${style.border} border rounded-2xl p-4`}
          >
            <div className="flex items-start gap-3">
              <IconComponent className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                    {priorityLabels[insight.priority]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
