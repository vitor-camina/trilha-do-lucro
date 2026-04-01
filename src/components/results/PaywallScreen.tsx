'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { DiagnosticInput, DiagnosticResult } from '@/types';

interface PaywallScreenProps {
  onUnlock: () => void;
  hotmartUrl: string;
  input?: DiagnosticInput;
  result?: DiagnosticResult;
}

const PRICE_SALE = process.env.NEXT_PUBLIC_PRICE || '37,00';
const PRICE_ORIGINAL = '197,00';

const DELIVERABLES = [
  { benefit: 'Planilha completa com 6 abas prontas pra usar — pré-preenchida com seus dados reais', tag: 'Planilha Guiada' },
  { benefit: 'Saiba exatamente quanto precisa vender por dia, semana e mês pra cobrir todas as contas', tag: 'Meta de Vendas' },
  { benefit: 'Lista guiada de gastos fixos — identifique onde está sangrando dinheiro todo mês', tag: 'Gastos Fixos' },
  { benefit: 'Calculadora de preço com margens sugeridas pro seu tipo de loja — nunca mais venda no prejuízo', tag: 'Formação de Preço' },
  { benefit: 'Controle mensal completo — veja se o problema é na operação, nos investimentos ou nos financiamentos', tag: 'Meu Dinheiro no Mês' },
  { benefit: 'Plano de ação 30/60/90 dias com checklist passo a passo pra colocar em prática hoje', tag: 'Plano de Ação' },
  { benefit: 'Relatório PDF Raio-X Financeiro completo para imprimir, guardar e consultar quando precisar', tag: 'Relatório PDF' },
];

export function PaywallScreen({ hotmartUrl, input, result }: PaywallScreenProps) {
  const [email, setEmail] = useState('');

  const margem = result?.margemLiquida ?? 0;
  const faturamento = input?.faturamento ?? 0;

  const porMil = Math.round(margem * 10);

  const targetMargem = 0.20;
  const currentMargem = margem / 100;
  const gapMensal = faturamento > 0 ? Math.max(0, (targetMargem - currentMargem) * faturamento) : 0;
  const gapAnual = gapMensal * 12;

  const hasRealData = faturamento > 0 && result != null;

  function handleCTA() {
    if (email) {
      try {
        const leads = JSON.parse(localStorage.getItem('raiox_leads') || '[]');
        leads.push({ email, date: new Date().toISOString() });
        localStorage.setItem('raiox_leads', JSON.stringify(leads));
      } catch {
        // silently fail
      }
    }
    window.open(hotmartUrl, '_blank');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-4 mb-8"
    >
      {/* Blur overlay hint */}
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        <div className="blur-sm opacity-30 pointer-events-none select-none p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-6 bg-gray-300 rounded w-24 mb-1" />
              <div className="h-2 bg-gray-100 rounded w-48" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-gray-100/80">
          <span className="text-sm font-semibold text-brand-primary bg-white/90 px-4 py-2 rounded-full shadow">
            Análise completa bloqueada
          </span>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header verde com headline de dor */}
        <div className="px-6 pt-6 pb-5" style={{ backgroundColor: '#1B5E20' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#F9A825' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#F9A825' }}>
              Diagnóstico Personalizado
            </span>
          </div>
          {hasRealData ? (
            <>
              <h2
                className="text-xl font-bold text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                {margem <= 0
                  ? 'Sua loja está operando no vermelho — cada dia assim aprofunda o buraco.'
                  : `Sua margem é de ${margem.toFixed(1)}% — de cada R$\u00A01.000 que entra, só R$\u00A0${porMil} fica com você.`}
              </h2>
              {gapAnual > 1000 && (
                <p className="text-sm leading-relaxed" style={{ color: '#A5D6A7' }}>
                  Se nada mudar nos próximos 12 meses, você vai deixar aproximadamente{' '}
                  <span className="font-bold" style={{ color: '#F9A825' }}>
                    R$&nbsp;{gapAnual.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>{' '}
                  na mesa — dinheiro que poderia estar no seu bolso.
                </p>
              )}
            </>
          ) : (
            <>
              <h2
                className="text-xl font-bold text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
              >
                Você sabe exatamente quanto está deixando de ganhar todo mês?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#A5D6A7' }}>
                A maioria dos lojistas descobre que a margem real é metade do que imaginava.
                Cada mês sem ajustar a precificação é dinheiro que não volta.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* O que está incluso — 13 itens */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              O que você vai desbloquear agora
            </p>
            <ul className="space-y-2.5">
              {DELIVERABLES.map(({ benefit, tag }) => (
                <li key={tag} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2E7D32' }} />
                  <span className="text-sm text-gray-700 leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ancoragem de preço */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFFDE7', border: '1px solid #F9A825' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#5D4037' }}>
              <span className="font-bold">Para ter esse diagnóstico do zero:</span> um consultor financeiro
              cobra de <span className="font-semibold">R$&nbsp;2.000 a R$&nbsp;5.000</span>. Uma mentoria de
              gestão custa <span className="font-semibold">R$&nbsp;300/mês</span>.
            </p>
            <p className="text-sm font-bold mt-1.5" style={{ color: '#5D4037' }}>
              O Trilha do Lucro entrega tudo isso por menos que uma pizza.
            </p>
          </div>

          {/* Preço com ancoragem visual */}
          <div className="text-center">
            <p className="text-sm text-gray-400 line-through">De R$ {PRICE_ORIGINAL}</p>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-sm font-medium text-gray-600">R$</span>
              <span
                className="text-4xl font-extrabold"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: '#1B5E20' }}
              >
                {PRICE_SALE}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Pagamento único · Acesso imediato · Sem mensalidade</p>
          </div>

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail (para receber o acesso)"
            className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
            style={{ focusRingColor: '#1B5E20' } as React.CSSProperties}
          />

          {/* CTA dourado */}
          <button
            type="button"
            onClick={handleCTA}
            className="w-full py-4 rounded-2xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #F9A825 0%, #FF8F00 100%)',
              color: '#1B5E20',
              fontFamily: 'var(--font-montserrat), sans-serif',
            }}
          >
            DESBLOQUEAR MINHA ANÁLISE COMPLETA
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
          </button>

          {/* Gatilhos de confiança */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2E7D32' }} />
              <p className="text-xs text-gray-600 leading-snug">
                <span className="font-semibold">Garantia de 7 dias</span> — se não fizer sentido para
                seu negócio, devolvemos cada centavo. Sem perguntas.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF8F00' }} />
              <p className="text-xs text-gray-600 leading-snug">
                Cada dia sem ajustar sua precificação, sua margem continua sendo corroída.
                O diagnóstico leva 3 minutos. A mudança pode ser permanente.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2E7D32' }} />
              <p className="text-xs text-gray-600 leading-snug">
                Lojistas que ajustam a precificação com base em dados reais aumentam
                a margem em média{' '}
                <span className="font-semibold" style={{ color: '#2E7D32' }}>8 a 15%</span>.
              </p>
            </div>
          </div>

          {/* Link "já paguei" — redireciona para suporte; acesso real vem via ?acesso=liberado no e-mail */}
          <button
            type="button"
            onClick={() => window.open('https://app.hotmart.com/products/purchased', '_blank')}
            className="w-full text-sm text-center py-1 underline underline-offset-2"
            style={{ color: '#1B5E20' }}
          >
            Já paguei — acessar minha compra
          </button>

        </div>
      </div>
    </motion.div>
  );
}
