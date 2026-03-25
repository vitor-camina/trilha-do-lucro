'use client';

import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

function formatDisplay(num: number): string {
  if (num === 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function CurrencyInput({ value, onChange, placeholder }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatDisplay(value));

  // Sincroniza state local quando o value de props muda (ex: troca de pergunta)
  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }
    const num = parseInt(raw, 10);
    setDisplayValue(formatDisplay(num));
    onChange(num);
  }

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder || '0'}
        className="w-full pl-14 pr-4 py-4 text-3xl font-bold text-center bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
        autoComplete="off"
      />
    </div>
  );
}
