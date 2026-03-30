'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a2e0a 0%, #1B5E20 50%, #2E7D32 100%)',
      }}
    >
      {/* Subtle dot-grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(249,168,37,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-14 md:pt-22 md:pb-20 text-center">

        {/* Context hook */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="text-sm font-medium text-green-200 mb-5 max-w-xl mx-auto leading-relaxed"
        >
          Milhares de lojistas no Brasil não sabem se estão lucrando ou perdendo dinheiro.
        </motion.p>

        {/* Floating compass logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <motion.svg
            width="64"
            height="64"
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

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{
            backgroundColor: 'rgba(249,168,37,0.15)',
            color: '#F9A825',
            border: '1px solid rgba(249,168,37,0.3)',
          }}
        >
          Diagnóstico gratuito em 3 minutos
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
        >
          Você sabe se sua loja está{' '}
          <span className="relative inline-block whitespace-nowrap">
            <span style={{ color: '#F9A825' }}>lucrando de verdade?</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
              className="absolute left-0 -bottom-1 h-1 w-full origin-left rounded-full"
              style={{ background: 'linear-gradient(90deg, #F9A825, #FF8F00)' }}
            />
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Descubra em menos de 3 minutos se você está tendo lucro ou só girando dinheiro.
          Responda 5 perguntas simples e receba o diagnóstico completo do seu negócio.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="flex flex-col items-center gap-3"
        >
          <Link href="/diagnostico">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-14 px-10 rounded-xl text-lg font-bold shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)',
                  color: '#1B5E20',
                  boxShadow: '0 6px 24px rgba(249,168,37,0.5)',
                }}
              >
                Fazer meu diagnóstico grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
          <p className="text-sm text-green-300">Sem cadastro. Resultado na hora.</p>
        </motion.div>
      </div>
    </section>
  );
}
