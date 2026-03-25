'use client';

import { motion } from 'framer-motion';
import type { BusinessClassification } from '@/types';

interface BusinessClassBadgeProps {
  classification: BusinessClassification;
}

export function BusinessClassBadge({ classification }: BusinessClassBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      className="flex flex-col items-center text-center"
    >
      {/* Badge circular animado */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 0px ${classification.color}20`,
            `0 0 0 20px ${classification.color}00`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-28 h-28 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: classification.bgColor }}
      >
        <span className="text-5xl">{classification.emoji}</span>
      </motion.div>

      {/* Label */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold mb-2"
        style={{ color: classification.color }}
      >
        {classification.label}
      </motion.h2>

      {/* Descrição */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-500 text-base max-w-sm leading-relaxed"
      >
        {classification.description}
      </motion.p>
    </motion.div>
  );
}
