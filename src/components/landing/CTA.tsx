'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
        <Link href="/diagnostico" onClick={() => trackCtaClick('Fazer meu diagnóstico grátis', 'cta')}>
          <Button
            size="lg"
            className="h-14 px-8 rounded-xl text-lg font-semibold shadow-lg" style={{ background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)', color: '#1B5E20' }}
          >
            Fazer meu diagnóstico grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        <p className="text-green-200 text-sm mt-3">
          Grátis. Sem cadastro. Resultado imediato.
        </p>
      </motion.div>
    </section>
  );
}
