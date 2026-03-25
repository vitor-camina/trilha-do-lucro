'use client';

import { motion } from 'framer-motion';
import { DollarSign, Target, TrendingUp, ShieldCheck, Clock, Lightbulb } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'Está lucrando ou só girando dinheiro?',
    description: 'Descubra seu lucro real, sem ilusão. Muitos lojistas acham que estão lucrando, mas não estão.',
  },
  {
    icon: Target,
    title: 'Quanto preciso vender no mínimo?',
    description: 'Saiba exatamente o faturamento mínimo para cobrir todos os custos da sua loja.',
  },
  {
    icon: TrendingUp,
    title: 'Meu preço está correto?',
    description: 'Veja se sua margem faz sentido ou se você está vendendo barato demais.',
  },
  {
    icon: ShieldCheck,
    title: 'Meu negócio é saudável?',
    description: 'Receba uma classificação clara: do vermelho ao azul, saiba exatamente onde você está.',
  },
  {
    icon: Clock,
    title: 'Resultado em 3 minutos',
    description: 'Sem planilha complicada, sem consultoria cara. 5 perguntas e pronto.',
  },
  {
    icon: Lightbulb,
    title: 'O que fazer para melhorar',
    description: 'Receba recomendações práticas e personalizadas para o seu negócio crescer.',
  },
];

export function Benefits() {
  return (
    <section className="bg-gray-50 py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que você vai descobrir
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Perguntas que todo lojista deveria saber responder — mas a maioria não sabe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#E8F5E9' }}>
                <benefit.icon className="w-6 h-6" style={{ color: '#1B5E20' }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
