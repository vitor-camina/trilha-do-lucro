'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackQuizStarted } from '@/lib/tracking';

interface WelcomeScreenProps {
  onStart: () => void;
}

const bullets = [
  'Leva menos de 2 minutos',
  'Não precisa de planilha',
  'Resultado imediato',
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  function handleStart() {
    trackQuizStarted();
    onStart();
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1B5E20 0%, #4CAF50 100%)' }} />

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">

        {/* Logo / brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 2L16 14H2L9 2Z" fill="white" fillOpacity="0.9" />
                <circle cx="9" cy="11" r="2" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#1B5E20' }}>
              Trilha do Lucro
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="text-[1.75rem] leading-tight font-bold text-gray-900 max-w-xs mb-3"
        >
          Descubra em 2 minutos se sua loja está no{' '}
          <span style={{ color: '#1B5E20' }}>lucro</span> ou no{' '}
          <span style={{ color: '#C62828' }}>prejuízo</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="text-base text-gray-500 max-w-sm mb-8 leading-relaxed"
        >
          Responda 6 perguntas simples sobre o seu negócio e receba seu diagnóstico financeiro na hora. É gratuito.
        </motion.p>

        {/* Bullets */}
        <motion.ul
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="flex flex-col gap-3 mb-10 w-full max-w-xs text-left"
        >
          {bullets.map((text) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: '#1B5E20' }}
              >
                ✓
              </span>
              <span className="text-gray-700 font-medium">{text}</span>
            </li>
          ))}
        </motion.ul>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full max-w-xs flex flex-col items-center gap-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
            <Button
              size="lg"
              onClick={handleStart}
              className="w-full h-14 rounded-2xl text-lg font-extrabold text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                boxShadow: '0 6px 24px rgba(27,94,32,0.35)',
              }}
            >
              Começar meu diagnóstico
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>
          </motion.div>

          {/* Social proof */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>+300 lojistas já fizeram</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
