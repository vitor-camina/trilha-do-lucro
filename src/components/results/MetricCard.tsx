'use client';

import { motion } from 'framer-motion';
import { getIcon } from '@/lib/icons';

interface MetricCardProps {
  label: string;          // Nome amigável (ex: "Quanto sobra de verdade")
  value: string;          // Valor formatado (ex: "R$ 3.500,00")
  sublabel?: string;      // Explicação extra
  icon: string;           // Nome do ícone Lucide
  positive?: boolean;     // true = verde, false = vermelho
  delay?: number;
}

export function MetricCard({ label, value, sublabel, icon, positive, delay = 0 }: MetricCardProps) {
  const IconComponent = getIcon(icon);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          positive === true ? 'bg-green-50' : positive === false ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <IconComponent className={`w-5 h-5 ${
            positive === true ? 'text-green-500' : positive === false ? 'text-red-500' : 'text-gray-500'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${
            positive === true ? 'text-green-600' : positive === false ? 'text-red-600' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
