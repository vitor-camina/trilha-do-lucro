'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
        >
          <BarChart3 className="w-4 h-4" />
          Diagnóstico gratuito em 3 minutos
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
        >
          Você sabe se sua loja está{' '}
          <span className="text-blue-600">lucrando de verdade?</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Descubra em menos de 3 minutos se você está tendo lucro ou só girando dinheiro.
          Responda 5 perguntas simples e receba o diagnóstico completo do seu negócio.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/diagnostico">
            <Button
              size="lg"
              className="h-14 px-8 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Fazer meu diagnóstico grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-3">Sem cadastro. Resultado na hora.</p>
        </motion.div>
      </div>
    </section>
  );
}
