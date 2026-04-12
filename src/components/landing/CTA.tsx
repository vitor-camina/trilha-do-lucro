'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackCtaClick } from '@/lib/tracking';

export function CTA() {
  return (
    <section className="py-16 md:py-24 px-6" style={{ backgroundColor: '#1B5E20' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Descubra a verdade sobre o seu negócio
        </h2>
        <p className="text-green-100 text-lg mb-8 leading-relaxed">
          48% das empresas fecham por falta de controle financeiro.
          Não deixe a sua ser uma delas.
        </p>

        <Link href="/diagnostico" className="inline-block w-full max-w-xs sm:max-w-sm" onClick={() => trackCtaClick('Fazer meu diagnóstico grátis', 'cta')}>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              className="w-full h-16 rounded-2xl text-xl font-extrabold shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)',
                color: '#1B5E20',
                boxShadow: '0 8px 32px rgba(249,168,37,0.55)',
              }}
            >
              Fazer meu diagnóstico grátis
              <ArrowRight className="w-6 h-6 ml-2 flex-shrink-0" />
            </Button>
          </motion.div>
        </Link>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-green-300 mt-4">
          <span>Grátis. Sem cadastro. Resultado imediato.</span>
          <span className="hidden sm:inline text-green-600">•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
            7 dias de garantia incondicional
          </span>
        </div>
      </motion.div>
    </section>
  );
}
