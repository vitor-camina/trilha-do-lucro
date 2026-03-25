'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Search } from 'lucide-react';

const steps = [
  { icon: Search, text: 'Analisando seus números...' },
  { icon: BarChart3, text: 'Calculando sua margem real...' },
  { icon: TrendingUp, text: 'Gerando seu diagnóstico...' },
];

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 bg-white">
      {/* Animação de pulso */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-8"
      >
        <BarChart3 className="w-10 h-10 text-blue-500" />
      </motion.div>

      {/* Passos animados */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.7, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <step.icon className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">{step.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
