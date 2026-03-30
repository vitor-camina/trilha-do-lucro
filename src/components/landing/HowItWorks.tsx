'use client';

import { motion } from 'framer-motion';
import { MessageSquareText, BarChart3, Rocket } from 'lucide-react';

const steps = [
  {
    icon: MessageSquareText,
    number: '1',
    title: 'Responda 5 perguntas',
    description: 'Perguntas simples sobre faturamento, custos e pró-labore. Leva menos de 3 minutos.',
  },
  {
    icon: BarChart3,
    number: '2',
    title: 'Receba seu diagnóstico',
    description: 'Descubra seu lucro real, sua margem, e em que estágio seu negócio está.',
  },
  {
    icon: Rocket,
    number: '3',
    title: 'Saiba o que fazer',
    description: 'Receba recomendações práticas para melhorar seus resultados e crescer.',
  },
];

export function HowItWorks() {
  return (
    <section
      className="py-16 md:py-24 px-6"
      style={{ background: 'linear-gradient(180deg, #f0faf0 0%, #ffffff 100%)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como funciona
          </h2>
          <p className="text-gray-500 text-lg">Simples assim. Sem complicação.</p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden md:block absolute top-8 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px"
            style={{
              background: 'linear-gradient(90deg, #1B5E20 0%, #F9A825 50%, #1B5E20 100%)',
              opacity: 0.3,
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="relative text-center rounded-2xl p-6 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 2px 12px rgba(27,94,32,0.08)',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#1B5E20' }}
              >
                <step.icon className="w-8 h-8 text-white" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
