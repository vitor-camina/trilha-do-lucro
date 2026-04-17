'use client';

import type { RangeOption } from '@/types';

interface RangeSelectInputProps {
  options: RangeOption[];
  value: number;
  onChange: (value: number) => void;
  onAutoAdvance: () => void;
}

export function RangeSelectInput({ options, value, onChange, onAutoAdvance }: RangeSelectInputProps) {
  function handleSelect(option: RangeOption) {
    onChange(option.value);
    // Pequeno delay para o usuário ver o destaque antes de avançar
    setTimeout(onAutoAdvance, 120);
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => handleSelect(option)}
            className="w-full px-5 py-4 rounded-2xl border-2 text-left text-lg font-semibold transition-all active:scale-[0.98]"
            style={{
              borderColor: isSelected ? '#1B5E20' : '#E5E7EB',
              backgroundColor: isSelected ? '#E8F5E9' : '#FFFFFF',
              color: isSelected ? '#1B5E20' : '#374151',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
