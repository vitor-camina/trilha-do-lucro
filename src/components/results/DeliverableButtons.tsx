'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Table2, ListChecks, Download, Loader2 } from 'lucide-react';
import type { DiagnosticInput, DiagnosticResult, BusinessClassification, Insight } from '@/types';

interface DeliverableButtonsProps {
  input: DiagnosticInput;
  result: DiagnosticResult;
  classification: BusinessClassification;
  insights: Insight[];
  onShowChecklist: () => void;
  checklistVisible: boolean;
}

export function DeliverableButtons({
  input,
  result,
  classification,
  insights,
  onShowChecklist,
  checklistVisible,
}: DeliverableButtonsProps) {
  const [businessName, setBusinessName] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingXlsx, setLoadingXlsx] = useState(false);

  async function handleDownloadPdf() {
    setLoadingPdf(true);
    try {
      const { generateReport } = await import('@/lib/pdf/generate-report');
      await generateReport(input, result, classification, insights, businessName);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setLoadingPdf(false);
    }
  }

  async function handleDownloadXlsx() {
    console.log('Download started');
    setLoadingXlsx(true);
    try {
      const { generateSpreadsheet } = await import('@/lib/spreadsheet/generate-spreadsheet');
      await generateSpreadsheet(input, result, classification, businessName);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setLoadingXlsx(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="space-y-4"
    >
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
        Seus materiais
      </h3>

      {/* Input do nome do negócio */}
      <div>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Nome do seu negócio (para o relatório)"
          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" style={{ outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor='#1B5E20'} onBlur={e => e.currentTarget.style.borderColor=''}
        />
      </div>

      {/* Botões */}
      <div className="space-y-3">
        {/* PDF */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={loadingPdf}
          className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Relatório PDF completo</p>
            <p className="text-xs text-gray-500">Diagnóstico + métricas + recomendações</p>
          </div>
          {loadingPdf ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Planilha */}
        <button
          type="button"
          onClick={handleDownloadXlsx}
          disabled={loadingXlsx}
          className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Table2 className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Planilha de controle financeiro</p>
            <p className="text-xs text-gray-500">12 meses pré-configurada com seus dados</p>
          </div>
          {loadingXlsx ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Checklist */}
        <button
          type="button"
          onClick={onShowChecklist}
          className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F5E9' }}>
            <ListChecks className="w-6 h-6" style={{ color: '#1B5E20' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Plano de ação 30/60/90 dias</p>
            <p className="text-xs text-gray-500">Checklist personalizado para seu nível</p>
          </div>
          <div className={`w-5 h-5 text-gray-400 transition-transform ${checklistVisible ? 'rotate-90' : ''}`}>
            ›
          </div>
        </button>
      </div>
    </motion.div>
  );
}
