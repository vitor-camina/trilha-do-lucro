'use client';

import { CheckCircle2 } from 'lucide-react';

interface PaymentConfirmedBannerProps {
  show: boolean;
}

/**
 * Banner exibido no topo do quiz quando o usuário chega via ?acesso=TL2026x9k
 * (redirecionamento pós-pagamento do Hotmart). Explica que o quiz é o próximo
 * passo pra gerar o diagnóstico personalizado — evita confusão de "paguei e
 * caí num quiz de novo?".
 */
export function PaymentConfirmedBanner({ show }: PaymentConfirmedBannerProps) {
  if (!show) return null;

  return (
    <div className="w-full bg-emerald-50 border-b border-emerald-200 px-5 py-4">
      <div className="max-w-2xl mx-auto flex items-start gap-3">
        <CheckCircle2
          className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-bold text-emerald-900 leading-snug">
            Pagamento confirmado!
          </p>
          <p className="text-sm text-emerald-800 leading-snug mt-1">
            Preencha seus dados abaixo em 2 minutos pra gerar seu diagnóstico
            personalizado e liberar sua planilha pré-preenchida com os números
            da sua loja.
          </p>
        </div>
      </div>
    </div>
  );
}
