'use client';

import { Slider } from '@/components/ui/slider';

interface PercentSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showCostExample?: boolean; // Só mostra exemplo "Compro por X, vendo por 100" para custo de produto
}

export function PercentSlider({ value, onChange, min = 0, max = 100, step = 1, showCostExample = false }: PercentSliderProps) {
  return (
    <div className="w-full max-w-xs mx-auto space-y-6">
      {/* Número grande */}
      <div className="text-center">
        <span className="text-5xl font-bold text-gray-900">{value}%</span>
      </div>

      {/* Slider */}
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />

      {/* Exemplo visual — só para custo de produto */}
      {showCostExample && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Exemplo:</p>
          <p className="text-base text-gray-700">
            Compro por <span className="font-bold text-red-500">R${value}</span>,
            vendo por <span className="font-bold text-green-600">R$100</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sobram R${100 - value} para pagar custos e gerar lucro
          </p>
        </div>
      )}
    </div>
  );
}
