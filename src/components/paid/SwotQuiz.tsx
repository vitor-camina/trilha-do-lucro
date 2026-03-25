'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SwotAnswers } from '@/types';

// ─── Opções de múltipla escolha ─────────────────────────────────────────────

const STRENGTH_PRAISE_OPTIONS = [
  'Atendimento', 'Variedade', 'Preço', 'Qualidade dos produtos',
  'Localização', 'Ambiente da loja', 'Pós-venda',
];

const WEAKNESS_PAIN_OPTIONS = [
  'Controle financeiro', 'Gestão de estoque', 'Equipe/funcionários',
  'Marketing/divulgação', 'Precificação', 'Inadimplência', 'Fluxo de caixa',
];

const OPPORTUNITY_CHOICE_OPTIONS = [
  'Vender online', 'Ampliar mix de produtos', 'Parcerias com outras lojas',
  'Programa de fidelidade', 'Redes sociais', 'Novos fornecedores', 'Expansão física',
];

const THREAT_CHOICE_OPTIONS = [
  'Concorrência online', 'Aumento de custos', 'Queda no movimento',
  'Inadimplência', 'Mudanças econômicas', 'Perda de funcionários-chave', 'Sazonalidade',
];

// ─── Configuração das 8 sub-etapas ─────────────────────────────────────────

type SwotSubStep =
  | 'strengths-text'
  | 'strengths-choice'
  | 'weaknesses-text'
  | 'weaknesses-choice'
  | 'opportunities-text'
  | 'opportunities-choice'
  | 'threats-text'
  | 'threats-choice';

const SUB_STEPS: SwotSubStep[] = [
  'strengths-text',
  'strengths-choice',
  'weaknesses-text',
  'weaknesses-choice',
  'opportunities-text',
  'opportunities-choice',
  'threats-text',
  'threats-choice',
];

const STEP_LABELS: Record<SwotSubStep, string> = {
  'strengths-text': 'Forças',
  'strengths-choice': 'Forças',
  'weaknesses-text': 'Fraquezas',
  'weaknesses-choice': 'Fraquezas',
  'opportunities-text': 'Oportunidades',
  'opportunities-choice': 'Oportunidades',
  'threats-text': 'Ameaças',
  'threats-choice': 'Ameaças',
};

const QUADRANT_COLORS: Record<string, string> = {
  'Forças': 'text-green-600',
  'Fraquezas': 'text-red-500',
  'Oportunidades': 'text-blue-600',
  'Ameaças': 'text-orange-500',
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface SwotQuizProps {
  initial: SwotAnswers;
  onComplete: (answers: SwotAnswers) => void;
  onBack: () => void;
}

export default function SwotQuiz({ initial, onComplete, onBack }: SwotQuizProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<SwotAnswers>(initial);

  const currentSub = SUB_STEPS[stepIndex];
  const label = STEP_LABELS[currentSub];
  const TOTAL = SUB_STEPS.length;
  const progress = ((stepIndex + 1) / TOTAL) * 100;

  // ─── Helpers de atualização ────────────────────────────────────────────

  function updateTextField(
    field: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    index: number,
    value: string,
  ) {
    setAnswers(prev => {
      const arr = [...prev[field]] as string[];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }

  function toggleMulti(
    field: 'strengthPraise' | 'opportunityChoices' | 'threatChoices',
    val: string,
  ) {
    setAnswers(prev => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
      };
    });
  }

  function setSingle(field: 'weaknessPain', val: string) {
    setAnswers(prev => ({ ...prev, [field]: val }));
  }

  // ─── Validação por sub-etapa ───────────────────────────────────────────

  const isValid = useCallback((): boolean => {
    switch (currentSub) {
      case 'strengths-text':
        return answers.strengths.some(s => s.trim().length > 0);
      case 'strengths-choice':
        return answers.strengthPraise.length > 0;
      case 'weaknesses-text':
        return answers.weaknesses.some(s => s.trim().length > 0);
      case 'weaknesses-choice':
        return answers.weaknessPain.trim().length > 0;
      case 'opportunities-text':
        return answers.opportunities.some(s => s.trim().length > 0);
      case 'opportunities-choice':
        return answers.opportunityChoices.length > 0;
      case 'threats-text':
        return answers.threats.some(s => s.trim().length > 0);
      case 'threats-choice':
        return answers.threatChoices.length > 0;
      default:
        return false;
    }
  }, [currentSub, answers]);

  function handleNext() {
    if (!isValid()) return;
    if (stepIndex === TOTAL - 1) {
      onComplete(answers);
    } else {
      setDirection(1);
      setStepIndex(i => i + 1);
    }
  }

  function handleBack() {
    if (stepIndex === 0) {
      onBack();
    } else {
      setDirection(-1);
      setStepIndex(i => i - 1);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Cabeçalho */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-purple-600" />
          </div>
          <span className={`text-sm font-semibold ${QUADRANT_COLORS[label] ?? 'text-purple-600'}`}>
            Análise SWOT — {label}
          </span>
          <span className="ml-auto text-xs text-gray-400">{stepIndex + 1} / {TOTAL}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <motion.div
            className="bg-purple-500 h-1.5 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Conteúdo da sub-etapa */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSub}
          custom={direction}
          initial={{ x: direction * 260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -260, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex flex-col flex-1 px-6 py-6 gap-5"
        >
          {currentSub === 'strengths-text' && (
            <TextFields
              question="Cite até 3 coisas que sua loja faz melhor que a concorrência:"
              subtitle="Pense no que seus clientes mais valorizam e o que você realmente domina."
              values={answers.strengths}
              placeholders={[
                'Ex: Atendimento personalizado e paciente',
                'Ex: Produtos que não encontram em outras lojas',
                'Ex: Facilidade no pagamento e parcelamento',
              ]}
              onChange={(i, v) => updateTextField('strengths', i, v)}
            />
          )}
          {currentSub === 'strengths-choice' && (
            <MultiChoiceStep
              question="Seus clientes costumam elogiar o quê?"
              subtitle="Selecione todas as opções que se aplicam."
              options={STRENGTH_PRAISE_OPTIONS}
              selected={answers.strengthPraise}
              onToggle={v => toggleMulti('strengthPraise', v)}
              multi
            />
          )}
          {currentSub === 'weaknesses-text' && (
            <TextFields
              question="O que você sente que precisa melhorar na sua loja?"
              subtitle="Seja honesto — identificar fraquezas é o primeiro passo para superá-las."
              values={answers.weaknesses}
              placeholders={[
                'Ex: Não tenho controle do estoque',
                'Ex: Pouca presença nas redes sociais',
                'Ex: Dificuldade em contratar bons funcionários',
              ]}
              onChange={(i, v) => updateTextField('weaknesses', i, v)}
            />
          )}
          {currentSub === 'weaknesses-choice' && (
            <SingleChoiceStep
              question="Qual dessas áreas te dá mais dor de cabeça?"
              subtitle="Escolha a que mais impacta seu dia a dia."
              options={WEAKNESS_PAIN_OPTIONS}
              selected={answers.weaknessPain}
              onSelect={v => setSingle('weaknessPain', v)}
            />
          )}
          {currentSub === 'opportunities-text' && (
            <TextFields
              question="Existe alguma tendência ou mudança no mercado que pode beneficiar sua loja?"
              subtitle="Pense em comportamentos dos clientes, novas tecnologias ou mudanças no bairro."
              values={answers.opportunities}
              placeholders={[
                'Ex: Mais pessoas buscando produtos locais',
                'Ex: Crescimento do bairro com novos moradores',
                'Ex: Aumento da demanda por entrega em casa',
              ]}
              onChange={(i, v) => updateTextField('opportunities', i, v)}
            />
          )}
          {currentSub === 'opportunities-choice' && (
            <MultiChoiceStep
              question="Quais dessas oportunidades fazem sentido para você?"
              subtitle="Selecione as que têm mais potencial para o seu negócio."
              options={OPPORTUNITY_CHOICE_OPTIONS}
              selected={answers.opportunityChoices}
              onToggle={v => toggleMulti('opportunityChoices', v)}
              multi
            />
          )}
          {currentSub === 'threats-text' && (
            <TextFields
              question="O que te preocupa no mercado ou no cenário atual?"
              subtitle="Quais fatores externos podem prejudicar sua loja?"
              values={answers.threats}
              placeholders={[
                'Ex: Novo supermercado abrindo perto',
                'Ex: Aumento dos preços dos fornecedores',
                'Ex: Queda nas vendas em determinados meses',
              ]}
              onChange={(i, v) => updateTextField('threats', i, v)}
            />
          )}
          {currentSub === 'threats-choice' && (
            <MultiChoiceStep
              question="Quais desses riscos são reais para o seu negócio?"
              subtitle="Selecione os que mais te preocupam."
              options={THREAT_CHOICE_OPTIONS}
              selected={answers.threatChoices}
              onToggle={v => toggleMulti('threatChoices', v)}
              multi
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navegação */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleBack}
          className="flex-shrink-0 h-14 px-5 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={!isValid()}
          className="flex-1 h-14 rounded-xl text-base font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-40"
        >
          {stepIndex === TOTAL - 1 ? 'Próxima etapa' : (
            <>Próximo <ArrowRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

interface TextFieldsProps {
  question: string;
  subtitle: string;
  values: string[];
  placeholders: string[];
  onChange: (index: number, value: string) => void;
}

function TextFields({ question, subtitle, values, placeholders, onChange }: TextFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{question}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
      <div className="flex flex-col gap-3">
        {values.map((val, i) => (
          <input
            key={i}
            type="text"
            value={val}
            onChange={e => onChange(i, e.target.value)}
            placeholder={placeholders[i] ?? `Item ${i + 1}`}
            className="w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
        ))}
      </div>
    </div>
  );
}

interface MultiChoiceStepProps {
  question: string;
  subtitle: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  multi: boolean;
}

function MultiChoiceStep({ question, subtitle, options, selected, onToggle }: MultiChoiceStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{question}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={[
                'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:bg-purple-50',
              ].join(' ')}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SingleChoiceStepProps {
  question: string;
  subtitle: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}

function SingleChoiceStep({ question, subtitle, options, selected, onSelect }: SingleChoiceStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{question}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={[
              'w-full px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all',
              selected === opt
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:bg-purple-50',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
