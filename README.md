# Trilha do Lucro

Ferramenta de diagnóstico financeiro para lojistas — responda perguntas sobre seu negócio e receba um relatório completo com métricas, insights e plano de ação personalizado.

## O que faz

- Quiz guiado com perguntas financeiras (faturamento, custos, margem, etc.)
- Cálculo automático de CMV, margem bruta, ponto de equilíbrio e mais
- Dashboard de resultados com classificação do negócio (Sobrevivência → Escala)
- Exportação de relatório em PDF e planilha Excel personalizada
- Paywall para acesso ao diagnóstico completo e plano de ação

## Tech Stack

- **Framework:** Next.js 16 + React 19 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Componentes:** shadcn/ui, Radix UI, Framer Motion
- **Exportação:** jsPDF, ExcelJS
- **Deploy:** Vercel

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/diagnostico` | Quiz + resultados |

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Deploy

Deploy automático via Vercel. Conecte o repositório GitHub e a Vercel fará o build a cada push na branch `main`.
