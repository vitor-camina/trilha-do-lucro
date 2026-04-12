'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackCtaClick } from '@/lib/tracking';

// 2026-04-19 23:59 BRT = 2026-04-20 02:59 UTC
const DEADLINE = new Date('2026-04-20T02:59:00.000Z');

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, target.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return {
    days: Math.floor(timeLeft / 86_400_000),
    hours: Math.floor((timeLeft % 86_400_000) / 3_600_000),
    minutes: Math.floor((timeLeft % 3_600_000) / 60_000),
    seconds: Math.floor((timeLeft % 60_000) / 1000),
    expired: timeLeft === 0,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[26px]">
      <span className="text-sm font-bold leading-none text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-white/50 mt-0.5 leading-none">{label}</span>
    </div>
  );
}

export function Hero() {
  const cd = useCountdown(DEADLINE);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a2e0a 0%, #1B5E20 50%, #2E7D32 100%)',
      }}
    >
      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(249,168,37,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 pt-7 pb-10 md:pt-20 md:pb-20 text-center">

        {/* ① Launch-offer badge with countdown — highest priority above fold */}
        {!cd.expired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 rounded-full mb-5"
            style={{
              backgroundColor: 'rgba(249,168,37,0.18)',
              border: '1px solid rgba(249,168,37,0.45)',
            }}
          >
            <span className="text-sm font-bold" style={{ color: '#F9A825' }}>
              🔥 Oferta de lançamento:{' '}
              <span className="text-white">R$27</span>{' '}
              <span className="line-through text-xs opacity-50 text-white">R$37</span>
            </span>
            <div
              className="flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
            >
              <Digit value={cd.days} label="dias" />
              <span className="text-white/40 font-bold text-sm">:</span>
              <Digit value={cd.hours} label="hrs" />
              <span className="text-white/40 font-bold text-sm">:</span>
              <Digit value={cd.minutes} label="min" />
              <span className="text-white/40 font-bold text-sm">:</span>
              <Digit value={cd.seconds} label="seg" />
            </div>
          </motion.div>
        )}

        {/* ② Headline — emotional and direct */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="text-[1.85rem] leading-tight md:text-5xl font-bold text-white mb-3"
        >
          Seu negócio fatura mas{' '}
          <span className="relative inline-block">
            <span style={{ color: '#F9A825' }}>não sobra dinheiro?</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.45, ease: 'easeOut' }}
              className="absolute left-0 -bottom-1 h-[3px] w-full origin-left rounded-full"
              style={{ background: 'linear-gradient(90deg, #F9A825, #FF8F00)' }}
            />
          </span>
          <br className="hidden sm:block" />
          {' '}
          <span className="text-2xl md:text-4xl font-semibold text-green-200">
            Descubra por quê em 2 minutos
          </span>
        </motion.h1>

        {/* ③ Subheadline — clear benefit */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="text-base md:text-lg font-medium text-green-100 max-w-md mx-auto mb-6 leading-relaxed"
        >
          Diagnóstico gratuito revela onde seu lucro está escapando
        </motion.p>

        {/* ④ CTA button — big and contrasting */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <Link href="/diagnostico" className="w-full max-w-xs sm:max-w-sm" onClick={() => trackCtaClick('Fazer meu diagnóstico grátis', 'hero')}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="w-full h-16 rounded-2xl text-xl font-extrabold shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)',
                  color: '#1B5E20',
                  boxShadow: '0 8px 32px rgba(249,168,37,0.55)',
                  letterSpacing: '-0.01em',
                }}
              >
                Fazer meu diagnóstico grátis
                <ArrowRight className="w-6 h-6 ml-2 flex-shrink-0" />
              </Button>
            </motion.div>
          </Link>

          {/* ⑤ Social proof + guarantee — trust signals right below CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-green-300 pt-1">
            <span>👥 Dezenas de lojistas já fizeram o diagnóstico</span>
            <span className="hidden sm:inline text-green-600">•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
              7 dias de garantia incondicional
            </span>
          </div>

          <p className="text-xs text-green-400/80">Sem cadastro. Resultado na hora.</p>
        </motion.div>

        {/* Decorative compass — below fold on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.32, type: 'spring', stiffness: 180 }}
          className="flex justify-center mt-10 md:mt-14"
        >
          <motion.svg
            width="56"
            height="56"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="20" cy="20" r="18" stroke="#F9A825" strokeWidth="2.5" fill="none" />
            <circle cx="20" cy="20" r="12" fill="#2E7D32" fillOpacity="0.4" />
            <polygon points="20,5 22.5,20 20,17 17.5,20" fill="#F9A825" />
            <polygon points="20,35 17.5,20 20,23 22.5,20" fill="#1B5E20" />
            <circle cx="20" cy="20" r="2.5" fill="#F9A825" />
            <text x="18.5" y="4" fill="#F9A825" fontSize="4" fontWeight="bold" fontFamily="sans-serif">N</text>
          </motion.svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-green-200/50 mt-4 max-w-sm mx-auto leading-relaxed"
        >
          Milhares de lojistas no Brasil não sabem se estão lucrando ou perdendo dinheiro.
        </motion.p>
      </div>
    </section>
  );
}
