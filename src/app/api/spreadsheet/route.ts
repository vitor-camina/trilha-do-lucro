import { NextRequest } from 'next/server';
import { generateSpreadsheet } from '@/lib/spreadsheet/generate-spreadsheet';
import type { DiagnosticInput, DiagnosticResult, BusinessClassification } from '@/types';

export async function POST(req: NextRequest) {
  const { input, result, classification, businessName } = await req.json() as {
    input: DiagnosticInput;
    result: DiagnosticResult;
    classification: BusinessClassification;
    businessName: string;
  };

  const { buffer, filename } = await generateSpreadsheet(input, result, classification, businessName);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
