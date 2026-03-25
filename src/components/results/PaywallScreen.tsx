'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaywallScreenProps {
  onUnlock: () => void;
  hotmartUrl: string;
}

export function PaywallScreen({ onUnlock, hotmartUrl }: PaywallScreenProps) {
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(true);

  function handleContinue() {
    if (email) {
      // Salva o email no localStorage para remarketing futuro
      try {
        const leads = JSON.parse(localStorage.getItem('raiox_leads') || '[]');
        leads.push({ email, date: new Date().toISOString() });
        localStorage.setItem('raiox_leads', JSON.stringify(leads));
      } catch {
        // silently fail
      }
    }
    // Redireciona para checkout da Hotmart
    window.open(hotmartUrl, '_blank');
    setShowEmailInput(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* Conteúdo borrado por trás */}
      <div className="blur-sm opacity-40 pointer-events-none select-none px-4 space-y-3">
        {/* Placeholders simulando as métricas */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-6 bg-gray-300 rounded w-24 mb-1" />
                <div className="h-2 bg-gray-100 rounded w-48" />
              </div>
            </div>
          </div>
        ))}

        {/* Placeholder de insights */}
        <div className="mt-4">
          <div className="h-5 bg-gray-200 rounded w-36 mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 mb-3">
              <div className="h-3 bg-gray-200 rounded w-40 mb-2" />
              <div className="h-2 bg-gray-100 rounded w-full mb-1" />
              <div className="h-2 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay do paywall */}
      <div className="absolute inset-0 flex items-start justify-center pt-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mx-4 max-w-sm w-full"
        >
          {/* Ícone */}
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-blue-600" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Desbloqueie seu diagnóstico completo
          </h3>

          {/* O que está incluso */}
          <ul className="text-sm text-gray-600 space-y-2 mb-5">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Lucro real e margem detalhados
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Ponto de equilíbrio e faturamento ideal
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Relatório PDF para baixar e guardar
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Planilha de controle financeiro (12 meses)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Plano de ação 30/60/90 dias personalizado
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Refaça quantas vezes quiser
            </li>
          </ul>

          {/* Preço com ancoragem */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400 line-through mb-1">De R$ 97,00</p>
            <span className="text-3xl font-bold text-gray-900">R$ 37,00</span>
            <p className="text-xs text-gray-400 mt-1">Pagamento único. Acesso imediato.</p>
          </div>

          {/* Input de email */}
          {showEmailInput && (
            <div className="mb-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor email"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">
                Para enviar seu diagnóstico por email
              </p>
            </div>
          )}

          {/* CTA */}
          <Button
            type="button"
            size="lg"
            onClick={handleContinue}
            className="w-full h-13 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700"
          >
            Desbloquear agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Link para já pagou */}
          {!showEmailInput && (
            <button
              type="button"
              onClick={onUnlock}
              className="w-full mt-3 text-sm text-blue-500 hover:text-blue-600 text-center"
            >
              Já paguei — liberar meu acesso
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
