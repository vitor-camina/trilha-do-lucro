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
    <section className="bg-white py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como funciona
          </h2>
          <p className="text-gray-500 text-lg">
            Simples assim. Sem complicação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
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
