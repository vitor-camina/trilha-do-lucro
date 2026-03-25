'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="bg-blue-600 py-16 md:py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Descubra a verdade sobre o seu negócio
        </h2>
        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
          48% das empresas fecham por falta de controle financeiro.
          Não deixe a sua ser uma delas.
        </p>
        <Link href="/diagnostico">
          <Button
            size="lg"
            className="h-14 px-8 rounded-xl text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
          >
            Fazer meu diagnóstico grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        <p className="text-blue-200 text-sm mt-3">
          Grátis. Sem cadastro. Resultado imediato.
        </p>
      </motion.div>
    </section>
  );
}
