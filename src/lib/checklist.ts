import type { BusinessLevel, ChecklistItem } from '@/types';

const CHECKLISTS: Record<BusinessLevel, ChecklistItem[]> = {
  prejuizo: [
    // 30 dias — emergência
    { phase: '30', task: 'Faça uma auditoria de todos os custos', detail: 'Liste cada gasto fixo e variável. Identifique o que pode ser cortado ou renegociado imediatamente.', category: 'custo' },
    { phase: '30', task: 'Renegocie aluguel e contratos', detail: 'Converse com o locador e fornecedores. Peça desconto ou prazo — o pior que podem dizer é não.', category: 'custo' },
    { phase: '30', task: 'Identifique produtos que dão prejuízo', detail: 'Liste seus 10 produtos mais vendidos e calcule a margem de cada um. Pare de vender os que dão prejuízo.', category: 'preco' },
    { phase: '30', task: 'Revise seus preços urgentemente', detail: 'Aumente os preços em pelo menos 10-15%. Faça isso primeiro nos produtos menos sensíveis a preço.', category: 'preco' },
    // 60 dias — estabilização
    { phase: '60', task: 'Corte custos fixos não essenciais', detail: 'Assinaturas, serviços que não usa, funcionários ociosos. Cada R$100 economizado vai direto pro lucro.', category: 'custo' },
    { phase: '60', task: 'Diversifique formas de pagamento', detail: 'Incentive Pix (taxa zero) e negocie taxas menores na maquininha. Compare pelo menos 3 operadoras.', category: 'custo' },
    { phase: '60', task: 'Crie uma promoção para gerar caixa', detail: 'Liquide estoque parado com desconto. É melhor ter dinheiro no caixa do que mercadoria encalhada.', category: 'faturamento' },
    { phase: '60', task: 'Separe conta pessoal da conta da loja', detail: 'Abra uma conta PJ se ainda não tem. Misturar contas é o erro #1 que faz lojistas perderem o controle.', category: 'gestao' },
    // 90 dias — recuperação
    { phase: '90', task: 'Atinja o ponto de equilíbrio', detail: 'Com os cortes e ajustes de preço, sua meta é zerar o prejuízo nos próximos 30 dias.', category: 'faturamento' },
    { phase: '90', task: 'Implemente controle semanal de caixa', detail: 'Todo sábado, anote quanto entrou e quanto saiu. Use a planilha que você baixou aqui.', category: 'gestao' },
    { phase: '90', task: 'Defina um pró-labore mínimo', detail: 'Mesmo que pequeno, comece a se pagar. Isso força a loja a se sustentar sem depender do seu bolso.', category: 'gestao' },
    { phase: '90', task: 'Refaça o diagnóstico e compare', detail: 'Use o Raio-X novamente para ver sua evolução. O objetivo é sair do vermelho.', category: 'gestao' },
  ],
  sobrevivendo: [
    // 30 dias
    { phase: '30', task: 'Mapeie todos os seus gastos fixos', detail: 'Anote absolutamente tudo que sai da conta da loja todo mês, sem exceção.', category: 'custo' },
    { phase: '30', task: 'Negocie desconto com fornecedores', detail: 'Peça 5-10% de desconto para pagamento à vista ou aumento de volume. Tente com pelo menos 3 fornecedores.', category: 'custo' },
    { phase: '30', task: 'Compare taxas de maquininha', detail: 'Pesquise pelo menos 3 opções. Uma diferença de 2% nas taxas pode ser milhares de reais por ano.', category: 'custo' },
    { phase: '30', task: 'Identifique seus 5 produtos mais lucrativos', detail: 'Foque a energia de venda nesses produtos. Eles são seu motor de lucro.', category: 'preco' },
    // 60 dias
    { phase: '60', task: 'Teste aumentar preços em 10%', detail: 'Comece pelos produtos menos comparáveis (exclusivos ou de nicho). Monitore se afeta as vendas.', category: 'preco' },
    { phase: '60', task: 'Reduza estoque parado', detail: 'Faça uma queima de estoque dos itens que estão há mais de 60 dias sem vender.', category: 'custo' },
    { phase: '60', task: 'Implemente controle financeiro semanal', detail: 'Reserve 30 minutos por semana para anotar entradas e saídas na planilha.', category: 'gestao' },
    { phase: '60', task: 'Incentive pagamento por Pix', detail: 'Ofereça 3-5% de desconto para Pix. Você economiza a taxa da maquininha e recebe na hora.', category: 'custo' },
    // 90 dias
    { phase: '90', task: 'Monte uma reserva de emergência', detail: 'Guarde o equivalente a 1 mês de custos fixos. Isso evita que um mês ruim vire uma crise.', category: 'gestao' },
    { phase: '90', task: 'Sistematize suas compras', detail: 'Defina dias fixos para comprar mercadoria. Compras impulsivas são inimigas da margem.', category: 'gestao' },
    { phase: '90', task: 'Explore um novo canal de venda', detail: 'Se vende só na loja física, teste vender online (Instagram, Mercado Livre). Se já vende online, teste outro marketplace.', category: 'faturamento' },
    { phase: '90', task: 'Refaça o diagnóstico e compare', detail: 'Use o Raio-X novamente. Sua meta é chegar na faixa "Estável" (margem acima de 5%).', category: 'gestao' },
  ],
  estavel: [
    // 30 dias
    { phase: '30', task: 'Formalize seu pró-labore', detail: 'Defina um valor fixo mensal e pague-se como se fosse um funcionário. Não tire valores variáveis.', category: 'gestao' },
    { phase: '30', task: 'Separe contas pessoal e empresarial', detail: 'Se ainda mistura, abra uma conta PJ hoje. É o passo mais importante para ter controle real.', category: 'gestao' },
    { phase: '30', task: 'Comece a usar a planilha de controle', detail: 'Preencha os dados de cada mês. Em 3 meses você terá um histórico valioso para tomar decisões.', category: 'gestao' },
    { phase: '30', task: 'Identifique seus produtos campeões de margem', detail: 'Descubra quais produtos deixam mais lucro (não os mais vendidos, os mais lucrativos).', category: 'preco' },
    // 60 dias
    { phase: '60', task: 'Invista em marketing dos produtos mais lucrativos', detail: 'Direcione verba de divulgação para os produtos com melhor margem, não os mais baratos.', category: 'faturamento' },
    { phase: '60', task: 'Otimize seu estoque', detail: 'Implemente a curva ABC: 20% dos produtos geram 80% do faturamento. Foque neles.', category: 'custo' },
    { phase: '60', task: 'Renegocie pelo menos 2 contratos', detail: 'Aluguel, internet, contador — sempre tem espaço para negociar.', category: 'custo' },
    { phase: '60', task: 'Crie uma meta de faturamento mensal', detail: 'Baseada no faturamento ideal que o diagnóstico calculou. Divida por semana para acompanhar.', category: 'faturamento' },
    // 90 dias
    { phase: '90', task: 'Busque margem de 15%+', detail: 'Com os ajustes de preço e custo, sua meta é migrar para a faixa "Saudável".', category: 'preco' },
    { phase: '90', task: 'Avalie novos canais de venda', detail: 'Loja física, Instagram, marketplace, WhatsApp Business — cada canal é uma fonte de receita.', category: 'faturamento' },
    { phase: '90', task: 'Monte reserva de 2 meses', detail: 'Guarde o equivalente a 2 meses de custos fixos como colchão de segurança.', category: 'gestao' },
    { phase: '90', task: 'Refaça o diagnóstico e compare', detail: 'Use o Raio-X para medir sua evolução. Meta: sair de "Estável" para "Saudável".', category: 'gestao' },
  ],
  saudavel: [
    // 30 dias
    { phase: '30', task: 'Automatize seu controle financeiro', detail: 'Use a planilha todo mês. Considere um sistema simples de gestão se o volume justificar.', category: 'gestao' },
    { phase: '30', task: 'Invista em marketing digital', detail: 'Com margem saudável, é hora de investir 5-10% do faturamento em anúncios para crescer.', category: 'faturamento' },
    { phase: '30', task: 'Diversifique fontes de receita', detail: 'Venda por mais canais, crie combos, ofereça serviços complementares.', category: 'faturamento' },
    { phase: '30', task: 'Documente seus processos', detail: 'Escreva como funciona cada atividade da loja. Isso permite delegar e escalar.', category: 'gestao' },
    // 60 dias
    { phase: '60', task: 'Construa reserva de 3 meses', detail: 'Com a margem que tem, guarde até ter 3 meses de custos fixos como reserva.', category: 'gestao' },
    { phase: '60', task: 'Otimize sua equipe', detail: 'Invista em treinamento ou contrate se necessário. Pessoas boas se pagam com aumento de vendas.', category: 'gestao' },
    { phase: '60', task: 'Negocie volume com fornecedores', detail: 'Com caixa saudável, compre em quantidade maior para conseguir preços melhores.', category: 'custo' },
    { phase: '60', task: 'Teste novos produtos ou serviços', detail: 'Use parte do lucro para testar novos itens. Meça a margem de cada um antes de apostar grande.', category: 'crescimento' },
    // 90 dias
    { phase: '90', task: 'Avalie expansão', detail: 'Novo ponto, franquia, e-commerce próprio — com margem acima de 15% você tem base para crescer.', category: 'crescimento' },
    { phase: '90', task: 'Escale os canais que funcionam', detail: 'Dobre o investimento nos canais de venda que mais dão retorno.', category: 'faturamento' },
    { phase: '90', task: 'Planeje os próximos 12 meses', detail: 'Faça um plano anual com metas de faturamento, margem e investimento por trimestre.', category: 'gestao' },
    { phase: '90', task: 'Refaça o diagnóstico e compare', detail: 'Acompanhe sua evolução. Meta: chegar na faixa "Escalável" (margem acima de 25%).', category: 'gestao' },
  ],
  escalavel: [
    // 30 dias
    { phase: '30', task: 'Documente todos os processos', detail: 'Seu negócio precisa funcionar sem você no dia a dia. Crie manuais e fluxogramas.', category: 'gestao' },
    { phase: '30', task: 'Invista em automação', detail: 'Sistema de gestão (ERP), automação de estoque, emissão automática de notas — libere seu tempo.', category: 'gestao' },
    { phase: '30', task: 'Defina KPIs e metas claras', detail: 'Acompanhe faturamento, margem, ticket médio e custo de aquisição de cliente semanalmente.', category: 'gestao' },
    { phase: '30', task: 'Reinvista parte do lucro', detail: 'Destine 15-20% do lucro para crescimento (marketing, estoque, infraestrutura).', category: 'crescimento' },
    // 60 dias
    { phase: '60', task: 'Explore novos mercados', detail: 'Venda para outras cidades/estados, abra loja online se ainda não tem, teste marketplaces novos.', category: 'crescimento' },
    { phase: '60', task: 'Fortaleça sua marca', detail: 'Invista em identidade visual, embalagens e experiência do cliente. Marca forte permite cobrar mais.', category: 'crescimento' },
    { phase: '60', task: 'Contrate pessoas estratégicas', detail: 'Um bom vendedor ou gerente pode multiplicar seus resultados. Não faça tudo sozinho.', category: 'gestao' },
    { phase: '60', task: 'Negocie parcerias comerciais', detail: 'Busque parcerias com marcas ou lojas complementares para ampliar alcance.', category: 'faturamento' },
    // 90 dias
    { phase: '90', task: 'Planeje expansão multi-canal', detail: 'Loja física + e-commerce + marketplaces + redes sociais. Cada canal é um multiplicador de receita.', category: 'crescimento' },
    { phase: '90', task: 'Considere abrir nova unidade ou franquear', detail: 'Com processos documentados e margem alta, replicar o modelo é o próximo passo lógico.', category: 'crescimento' },
    { phase: '90', task: 'Monte um conselho consultivo', detail: 'Reúna 2-3 pessoas experientes (contador, mentor, empresário) para te aconselhar mensalmente.', category: 'gestao' },
    { phase: '90', task: 'Refaça o diagnóstico periodicamente', detail: 'Use o Raio-X todo mês para garantir que a margem se mantém saudável enquanto cresce.', category: 'gestao' },
  ],
};

/**
 * Retorna o checklist de ações personalizado para o nível do negócio.
 */
export function getChecklist(level: BusinessLevel): ChecklistItem[] {
  return CHECKLISTS[level];
}
