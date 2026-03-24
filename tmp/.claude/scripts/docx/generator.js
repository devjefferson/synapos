#!/usr/bin/env node

/**
 * DOCX Generator v2.0 - Gerador de documentos Word estruturados
 *
 * Uso:
 *   node generator.js --type technical --title "Titulo" --input data.json --output doc.docx
 *   node generator.js -t executive -T "Relatorio Q1" -o relatorio.docx
 *
 * Tipos suportados: technical, executive, proposal, consulting, general
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak, TableOfContents, LevelFormat,
        convertInchesToTwip, Tab, TabStopType, TabStopPosition } = require('docx');
const fs = require('fs');
const path = require('path');

// Configuracoes de pagina US Letter
const PAGE = {
  WIDTH: 12240,   // 8.5 inches in DXA
  HEIGHT: 15840,  // 11 inches in DXA
  MARGIN: 1440    // 1 inch margins
};

// Cores corporativas
const COLORS = {
  primary: '1e3a5f',
  secondary: 'f0a500',
  text: '333333',
  muted: '666666',
  light: '999999',
  border: 'CCCCCC',
  success: '28a745',
  warning: 'ffc107',
  danger: 'dc3545',
  white: 'FFFFFF',
  lightBg: 'F5F7FA'
};

// Parse argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: 'general',
    title: 'Documento',
    input: null,
    output: 'output.docx',
    author: 'Cortex'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-t':
      case '--type':
        options.type = args[++i];
        break;
      case '-T':
      case '--title':
        options.title = args[++i];
        break;
      case '-i':
      case '--input':
        options.input = args[++i];
        break;
      case '-o':
      case '--output':
        options.output = args[++i];
        break;
      case '-a':
      case '--author':
        options.author = args[++i];
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
DOCX Generator v2.0 - Gerador de documentos Word estruturados

Uso:
  node generator.js [opcoes]

Opcoes:
  -t, --type <tipo>      Tipo de documento (technical|executive|proposal|consulting|general)
  -T, --title <titulo>   Titulo do documento
  -i, --input <arquivo>  Arquivo de dados JSON (opcional)
  -o, --output <arquivo> Arquivo de saida (.docx)
  -a, --author <autor>   Nome do autor
  -h, --help             Mostra esta ajuda

Exemplos:
  node generator.js -t technical -T "Arquitetura do Sistema" -o arquitetura.docx
  node generator.js -t executive -T "Relatorio Q1" -i dados.json -o relatorio.docx
`);
}

// Classe auxiliar para construcao de documentos
class DocxBuilder {
  constructor(options) {
    this.options = options;
  }

  // Criar espacamento vertical
  emptyParagraph(count = 1) {
    const paragraphs = [];
    for (let i = 0; i < count; i++) {
      paragraphs.push(new Paragraph({ children: [] }));
    }
    return paragraphs;
  }

  // Titulo de capa centralizado
  coverTitle(text, size = 72) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({
        text,
        size,
        bold: true,
        font: 'Arial',
        color: COLORS.primary
      })]
    });
  }

  // Subtitulo de capa
  coverSubtitle(text, size = 28) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({
        text,
        size,
        font: 'Arial',
        color: COLORS.muted
      })]
    });
  }

  // Heading com numeracao
  heading(text, level = 1) {
    const headingLevel = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3
    }[level] || HeadingLevel.HEADING_1;

    return new Paragraph({
      heading: headingLevel,
      spacing: { before: level === 1 ? 400 : 300, after: 200 },
      children: [new TextRun({
        text,
        bold: true,
        size: level === 1 ? 36 : (level === 2 ? 28 : 24),
        font: 'Arial',
        color: COLORS.primary
      })]
    });
  }

  // Paragrafo normal com opcoes
  paragraph(text, options = {}) {
    return new Paragraph({
      spacing: { after: 200, line: 360 },
      alignment: options.align || AlignmentType.JUSTIFIED,
      children: [new TextRun({
        text,
        size: options.size || 24,
        bold: options.bold || false,
        italics: options.italic || false,
        font: 'Arial',
        color: options.color || COLORS.text
      })]
    });
  }

  // Paragrafo com multiplos runs (negrito parcial, etc)
  richParagraph(runs, options = {}) {
    return new Paragraph({
      spacing: { after: 200, line: 360 },
      alignment: options.align || AlignmentType.JUSTIFIED,
      children: runs.map(run => new TextRun({
        text: run.text,
        size: run.size || 24,
        bold: run.bold || false,
        italics: run.italic || false,
        font: 'Arial',
        color: run.color || COLORS.text
      }))
    });
  }

  // Lista com bullets
  bulletList(items) {
    return items.map(item => new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { after: 120, line: 340 },
      children: [new TextRun({ text: item, size: 24, font: 'Arial' })]
    }));
  }

  // Lista numerada
  numberedList(items) {
    return items.map(item => new Paragraph({
      numbering: { reference: 'numbers', level: 0 },
      spacing: { after: 120, line: 340 },
      children: [new TextRun({ text: item, size: 24, font: 'Arial' })]
    }));
  }

  // Tabela profissional
  table(headers, rows, options = {}) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
    const borders = { top: border, bottom: border, left: border, right: border };

    const headerRow = new TableRow({
      tableHeader: true,
      children: headers.map(h => new TableCell({
        borders,
        shading: { fill: options.headerColor || COLORS.primary, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: h,
            bold: true,
            color: COLORS.white,
            size: 22,
            font: 'Arial'
          })]
        })]
      }))
    });

    const dataRows = rows.map((row, rowIndex) => new TableRow({
      children: row.map(cell => new TableCell({
        borders,
        shading: rowIndex % 2 === 1 ? { fill: COLORS.lightBg, type: ShadingType.CLEAR } : undefined,
        margins: { top: 80, bottom: 80, left: 150, right: 150 },
        children: [new Paragraph({
          children: [new TextRun({
            text: String(cell),
            size: 22,
            font: 'Arial',
            color: COLORS.text
          })]
        })]
      }))
    }));

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows]
    });
  }

  // Caixa de destaque
  highlightBox(title, content, accentColor = COLORS.secondary) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top: border, bottom: border, right: border,
            left: { style: BorderStyle.SINGLE, size: 32, color: accentColor }
          },
          shading: { fill: 'FFFBF0', type: ShadingType.CLEAR },
          margins: { top: 150, bottom: 150, left: 250, right: 150 },
          children: [
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({
                text: title,
                bold: true,
                size: 26,
                font: 'Arial',
                color: COLORS.primary
              })]
            }),
            new Paragraph({
              spacing: { line: 340 },
              children: [new TextRun({
                text: content,
                size: 24,
                font: 'Arial',
                color: COLORS.text
              })]
            })
          ]
        })]
      })]
    });
  }

  // Card de metrica
  metricCard(value, label, bgColor = COLORS.primary) {
    const isLight = bgColor === COLORS.secondary || bgColor === COLORS.warning;
    const textColor = isLight ? COLORS.primary : COLORS.white;

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE }
          },
          shading: { fill: bgColor, type: ShadingType.CLEAR },
          margins: { top: 250, bottom: 250, left: 200, right: 200 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: value,
                bold: true,
                size: 64,
                font: 'Arial',
                color: textColor
              })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 100 },
              children: [new TextRun({
                text: label,
                size: 22,
                font: 'Arial',
                color: textColor
              })]
            })
          ]
        })]
      })]
    });
  }

  // Linha separadora
  separator() {
    return new Paragraph({
      spacing: { before: 200, after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border }
      },
      children: []
    });
  }

  // Quebra de pagina
  pageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
  }

  // Sumario (TOC) - IMPORTANTE: requer atualizacao manual no Word
  toc(title = 'Sumario') {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
        children: [new TextRun({
          text: title,
          bold: true,
          size: 36,
          font: 'Arial',
          color: COLORS.primary
        })]
      }),
      new TableOfContents('Sumario', {
        hyperlink: true,
        headingStyleRange: '1-3',
        stylesWithLevels: [
          { styleName: 'Heading1', level: 1 },
          { styleName: 'Heading2', level: 2 },
          { styleName: 'Heading3', level: 3 }
        ]
      }),
      new Paragraph({
        spacing: { before: 200 },
        children: [new TextRun({
          text: '(Clique com botao direito e selecione "Atualizar Campo" para atualizar o sumario)',
          size: 18,
          italics: true,
          font: 'Arial',
          color: COLORS.light
        })]
      })
    ];
  }
}

// ============================================
// GERADORES POR TIPO DE DOCUMENTO
// ============================================

function generateExecutiveDoc(builder, data) {
  const children = [];
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // === CAPA ===
  children.push(...builder.emptyParagraph(6));
  children.push(builder.coverTitle(builder.options.title));
  children.push(...builder.emptyParagraph(1));
  children.push(builder.coverSubtitle(data?.period || 'Relatorio Executivo'));
  children.push(builder.coverSubtitle(today, 24));
  children.push(...builder.emptyParagraph(3));

  if (data?.version) {
    children.push(builder.coverSubtitle(`Versao ${data.version}`, 22));
  }

  children.push(builder.pageBreak());

  // === SUMARIO ===
  children.push(...builder.toc());
  children.push(builder.pageBreak());

  // === 1. RESUMO EXECUTIVO ===
  children.push(builder.heading('1. Resumo Executivo', 1));

  if (data?.summary) {
    children.push(builder.paragraph(data.summary));
  }

  if (data?.highlight) {
    children.push(...builder.emptyParagraph(1));
    children.push(builder.highlightBox('Destaque Principal', data.highlight));
  }

  children.push(...builder.emptyParagraph(1));

  // === 2. METRICAS E KPIS ===
  children.push(builder.heading('2. Metricas e KPIs', 1));

  children.push(builder.paragraph(
    'A tabela abaixo apresenta os principais indicadores de desempenho do projeto no periodo analisado:'
  ));
  children.push(...builder.emptyParagraph(1));

  if (data?.metrics && Array.isArray(data.metrics)) {
    children.push(builder.table(
      ['Metrica', 'Valor Atual', 'Meta', 'Status'],
      data.metrics
    ));
  } else {
    children.push(builder.table(
      ['Metrica', 'Valor Atual', 'Meta', 'Status'],
      [
        ['Entregas', '15', '12', 'Acima da meta'],
        ['Bugs Criticos', '0', '0', 'Na meta'],
        ['Satisfacao', '4.5/5', '4.0/5', 'Acima da meta']
      ]
    ));
  }

  children.push(...builder.emptyParagraph(1));

  // === 3. ENTREGAS DO PERIODO ===
  children.push(builder.heading('3. Entregas do Periodo', 1));

  children.push(builder.paragraph(
    'As seguintes entregas foram concluidas durante o periodo de analise:'
  ));

  if (data?.deliverables && Array.isArray(data.deliverables)) {
    children.push(...builder.bulletList(data.deliverables));
  } else {
    children.push(...builder.bulletList([
      'Modulo de autenticacao implementado e testado',
      'Dashboard de metricas finalizado',
      'Integracao com sistema externo concluida',
      'Documentacao tecnica atualizada'
    ]));
  }

  children.push(...builder.emptyParagraph(1));

  // === 4. RISCOS E MITIGACOES ===
  children.push(builder.heading('4. Riscos e Mitigacoes', 1));

  children.push(builder.paragraph(
    'A matriz de riscos identifica os principais pontos de atencao e as estrategias de mitigacao adotadas:'
  ));
  children.push(...builder.emptyParagraph(1));

  if (data?.risks && Array.isArray(data.risks)) {
    children.push(builder.table(
      ['Risco', 'Probabilidade', 'Impacto', 'Mitigacao'],
      data.risks
    ));
  } else {
    children.push(builder.table(
      ['Risco', 'Probabilidade', 'Impacto', 'Mitigacao'],
      [
        ['Atraso no cronograma', 'Media', 'Alto', 'Buffer de 2 semanas adicionado'],
        ['Escopo adicional', 'Alta', 'Medio', 'Processo de change request implementado']
      ]
    ));
  }

  children.push(...builder.emptyParagraph(1));

  // === 5. PROXIMOS PASSOS ===
  children.push(builder.heading('5. Proximos Passos', 1));

  children.push(builder.paragraph(
    'As seguintes atividades estao planejadas para o proximo periodo:'
  ));

  if (data?.nextSteps && Array.isArray(data.nextSteps)) {
    children.push(...builder.numberedList(data.nextSteps));
  } else {
    children.push(...builder.numberedList([
      'Finalizar desenvolvimento do modulo de relatorios',
      'Iniciar fase de testes de integracao',
      'Preparar ambiente de homologacao',
      'Realizar treinamento com usuarios-chave'
    ]));
  }

  children.push(...builder.emptyParagraph(1));

  // === 6. CONCLUSAO ===
  children.push(builder.heading('6. Conclusao', 1));

  children.push(builder.paragraph(
    data?.conclusion ||
    'O projeto continua progredindo conforme planejado, com todas as metricas principais dentro ou acima das metas estabelecidas. A equipe mantem o foco na qualidade das entregas e no cumprimento dos prazos acordados.'
  ));

  children.push(...builder.emptyParagraph(2));
  children.push(builder.separator());
  children.push(builder.paragraph(
    `Documento gerado em ${today}`,
    { align: AlignmentType.CENTER, size: 20, color: COLORS.light }
  ));

  return children;
}

function generateTechnicalDoc(builder, data) {
  const children = [];
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // === CAPA ===
  children.push(...builder.emptyParagraph(6));
  children.push(builder.coverTitle(builder.options.title));
  children.push(...builder.emptyParagraph(1));
  children.push(builder.coverSubtitle('Documentacao Tecnica'));
  children.push(builder.coverSubtitle(`Versao ${data?.version || '1.0'} - ${today}`, 24));
  children.push(builder.pageBreak());

  // === SUMARIO ===
  children.push(...builder.toc());
  children.push(builder.pageBreak());

  // === 1. RESUMO EXECUTIVO ===
  children.push(builder.heading('1. Resumo Executivo', 1));

  children.push(builder.paragraph(
    data?.summary ||
    'Este documento descreve a arquitetura, componentes e especificacoes tecnicas do sistema, servindo como referencia para a equipe de desenvolvimento e stakeholders tecnicos.'
  ));

  if (data?.highlight) {
    children.push(...builder.emptyParagraph(1));
    children.push(builder.highlightBox('Visao Geral', data.highlight));
  }

  children.push(...builder.emptyParagraph(1));

  // === 2. VISAO GERAL ===
  children.push(builder.heading('2. Visao Geral', 1));

  children.push(builder.heading('2.1 Objetivo', 2));
  children.push(builder.paragraph(
    data?.objective ||
    'Definir a arquitetura e componentes do sistema de forma clara e objetiva, estabelecendo padroes e diretrizes para o desenvolvimento.'
  ));

  children.push(builder.heading('2.2 Escopo', 2));
  children.push(builder.paragraph(
    data?.scope ||
    'Este documento abrange todos os componentes principais do sistema, incluindo frontend, backend, banco de dados e integracoes externas.'
  ));

  children.push(builder.heading('2.3 Publico-alvo', 2));
  children.push(...builder.bulletList([
    'Desenvolvedores da equipe tecnica',
    'Arquitetos de software',
    'Tech Leads e gestores tecnicos',
    'Equipe de DevOps e infraestrutura'
  ]));

  children.push(...builder.emptyParagraph(1));

  // === 3. ARQUITETURA ===
  children.push(builder.heading('3. Arquitetura do Sistema', 1));

  children.push(builder.heading('3.1 Stack Tecnologica', 2));
  children.push(builder.paragraph('O sistema utiliza as seguintes tecnologias principais:'));

  if (data?.stack && Array.isArray(data.stack)) {
    children.push(...builder.bulletList(data.stack));
  } else {
    children.push(...builder.bulletList([
      'Frontend: React 18 + TypeScript + TailwindCSS',
      'Backend: Node.js 20 + Express + TypeScript',
      'Banco de Dados: PostgreSQL 15 + Redis',
      'Infraestrutura: AWS (ECS, RDS, S3, CloudFront)',
      'CI/CD: GitHub Actions + Docker'
    ]));
  }

  children.push(...builder.emptyParagraph(1));

  children.push(builder.heading('3.2 Componentes do Sistema', 2));
  children.push(builder.paragraph('A tabela abaixo descreve os principais componentes:'));
  children.push(...builder.emptyParagraph(1));

  if (data?.components && Array.isArray(data.components)) {
    children.push(builder.table(
      ['Componente', 'Tecnologia', 'Descricao'],
      data.components
    ));
  } else {
    children.push(builder.table(
      ['Componente', 'Tecnologia', 'Descricao'],
      [
        ['API Gateway', 'AWS API Gateway', 'Roteamento e autenticacao de requisicoes'],
        ['Backend API', 'Node.js + Express', 'Logica de negocios e processamento'],
        ['Database', 'PostgreSQL', 'Persistencia de dados transacionais'],
        ['Cache', 'Redis', 'Cache de sessoes e dados frequentes'],
        ['Frontend', 'React + TypeScript', 'Interface do usuario']
      ]
    ));
  }

  children.push(...builder.emptyParagraph(1));

  // === 4. REQUISITOS ===
  children.push(builder.heading('4. Requisitos do Sistema', 1));

  children.push(builder.heading('4.1 Requisitos Funcionais', 2));

  if (data?.functionalReqs && Array.isArray(data.functionalReqs)) {
    children.push(...builder.numberedList(data.functionalReqs));
  } else {
    children.push(...builder.numberedList([
      'O sistema deve permitir autenticacao de usuarios via SSO',
      'O sistema deve registrar logs de todas as operacoes criticas',
      'O sistema deve gerar relatorios em formatos PDF e Excel',
      'O sistema deve suportar notificacoes em tempo real',
      'O sistema deve permitir integracao via API REST'
    ]));
  }

  children.push(...builder.emptyParagraph(1));

  children.push(builder.heading('4.2 Requisitos Nao-Funcionais', 2));

  if (data?.nonFunctionalReqs && Array.isArray(data.nonFunctionalReqs)) {
    children.push(...builder.numberedList(data.nonFunctionalReqs));
  } else {
    children.push(...builder.numberedList([
      'Tempo de resposta da API menor que 200ms (p95)',
      'Disponibilidade minima de 99.9% (SLA)',
      'Suporte a 1.000 usuarios simultaneos',
      'Backup automatico diario com retencao de 30 dias',
      'Conformidade com LGPD e melhores praticas de seguranca'
    ]));
  }

  children.push(...builder.emptyParagraph(1));

  // === 5. METRICAS ===
  if (data?.metrics && Array.isArray(data.metrics)) {
    children.push(builder.heading('5. Metricas do Projeto', 1));
    children.push(builder.paragraph('Indicadores atuais do projeto:'));
    children.push(...builder.emptyParagraph(1));
    children.push(builder.table(
      ['Metrica', 'Valor', 'Meta', 'Status'],
      data.metrics
    ));
    children.push(...builder.emptyParagraph(1));
  }

  // === 6. CONSIDERACOES FINAIS ===
  children.push(builder.heading('6. Consideracoes Finais', 1));

  children.push(builder.paragraph(
    'Este documento deve ser mantido atualizado conforme evolucao do sistema. Qualquer alteracao significativa na arquitetura deve passar por revisao tecnica e atualizacao desta documentacao.'
  ));

  children.push(...builder.emptyParagraph(1));
  children.push(builder.highlightBox(
    'Importante',
    'Para duvidas ou sugestoes sobre este documento, entre em contato com a equipe de arquitetura.'
  ));

  children.push(...builder.emptyParagraph(2));
  children.push(builder.separator());
  children.push(builder.paragraph(
    `Documento gerado em ${today}`,
    { align: AlignmentType.CENTER, size: 20, color: COLORS.light }
  ));

  return children;
}

function generateProposalDoc(builder, data) {
  const children = [];
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // === CAPA ===
  children.push(...builder.emptyParagraph(6));
  children.push(builder.coverTitle(builder.options.title));
  children.push(...builder.emptyParagraph(1));
  children.push(builder.coverSubtitle('Proposta Comercial'));
  children.push(builder.coverSubtitle(today, 24));
  children.push(builder.pageBreak());

  // === SUMARIO ===
  children.push(...builder.toc());
  children.push(builder.pageBreak());

  // === 1. APRESENTACAO ===
  children.push(builder.heading('1. Apresentacao', 1));
  children.push(builder.paragraph(
    data?.about ||
    'Somos uma empresa especializada em solucoes tecnologicas inovadoras, com experiencia comprovada no desenvolvimento de sistemas de alta qualidade e performance.'
  ));

  children.push(...builder.emptyParagraph(1));

  // === 2. ENTENDIMENTO DO DESAFIO ===
  children.push(builder.heading('2. Entendimento do Desafio', 1));
  children.push(builder.paragraph(
    data?.challenge ||
    'Compreendemos que sua empresa busca uma solucao que permita otimizar processos, reduzir custos operacionais e aumentar a produtividade da equipe.'
  ));

  children.push(...builder.emptyParagraph(1));

  // === 3. SOLUCAO PROPOSTA ===
  children.push(builder.heading('3. Solucao Proposta', 1));
  children.push(builder.paragraph(
    data?.solution ||
    'Nossa solucao consiste em uma plataforma completa que endereca todos os pontos identificados, oferecendo:'
  ));

  children.push(builder.heading('3.1 Diferenciais', 2));
  children.push(...builder.bulletList(data?.differentials || [
    'Experiencia comprovada no segmento',
    'Equipe altamente qualificada e certificada',
    'Metodologia agil de desenvolvimento',
    'Suporte tecnico 24/7',
    'Garantia de qualidade e SLA definido'
  ]));

  children.push(...builder.emptyParagraph(1));

  // === 4. INVESTIMENTO ===
  children.push(builder.heading('4. Investimento', 1));
  children.push(builder.paragraph('Apresentamos abaixo os valores para implementacao da solucao:'));
  children.push(...builder.emptyParagraph(1));

  children.push(builder.table(
    ['Item', 'Descricao', 'Valor'],
    data?.pricing || [
      ['Setup Inicial', 'Configuracao e personalizacao', 'R$ 15.000,00'],
      ['Desenvolvimento', 'Implementacao completa', 'R$ 80.000,00'],
      ['Treinamento', 'Capacitacao da equipe', 'R$ 5.000,00'],
      ['Suporte Mensal', 'Manutencao e suporte', 'R$ 3.000,00/mes']
    ]
  ));

  children.push(...builder.emptyParagraph(1));
  children.push(builder.highlightBox(
    'Investimento Total',
    data?.totalInvestment || 'R$ 100.000,00 + R$ 3.000,00/mes (suporte)'
  ));

  children.push(...builder.emptyParagraph(1));

  // === 5. CRONOGRAMA ===
  children.push(builder.heading('5. Cronograma', 1));
  children.push(builder.paragraph('O projeto sera executado nas seguintes fases:'));
  children.push(...builder.emptyParagraph(1));

  children.push(builder.table(
    ['Fase', 'Atividade', 'Duracao'],
    data?.timeline || [
      ['1', 'Levantamento de requisitos', '2 semanas'],
      ['2', 'Desenvolvimento - Sprint 1', '4 semanas'],
      ['3', 'Desenvolvimento - Sprint 2', '4 semanas'],
      ['4', 'Testes e homologacao', '2 semanas'],
      ['5', 'Deploy e treinamento', '1 semana']
    ]
  ));

  children.push(...builder.emptyParagraph(1));

  // === 6. VALIDADE ===
  children.push(builder.heading('6. Validade da Proposta', 1));
  children.push(builder.paragraph(
    'Esta proposta tem validade de 30 (trinta) dias a partir da data de emissao. Apos este periodo, os valores e condicoes poderao ser revisados.'
  ));

  children.push(...builder.emptyParagraph(2));
  children.push(builder.separator());
  children.push(builder.paragraph(
    `Documento gerado em ${today}`,
    { align: AlignmentType.CENTER, size: 20, color: COLORS.light }
  ));

  return children;
}

function generateConsultingDoc(builder, data) {
  const children = [];
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // === CAPA ===
  children.push(...builder.emptyParagraph(6));
  children.push(builder.coverTitle(builder.options.title));
  children.push(...builder.emptyParagraph(1));
  children.push(builder.coverSubtitle('Relatorio de Consultoria'));
  children.push(builder.coverSubtitle(today, 24));
  children.push(builder.pageBreak());

  // === SUMARIO ===
  children.push(...builder.toc());
  children.push(builder.pageBreak());

  // === 1. SUMARIO EXECUTIVO ===
  children.push(builder.heading('1. Sumario Executivo', 1));
  children.push(builder.paragraph(
    data?.executiveSummary ||
    'Este relatorio apresenta os resultados da analise realizada, identificando pontos de melhoria e recomendacoes para otimizacao dos processos e sistemas da organizacao.'
  ));

  if (data?.highlight) {
    children.push(...builder.emptyParagraph(1));
    children.push(builder.highlightBox('Principais Descobertas', data.highlight));
  }

  children.push(...builder.emptyParagraph(1));

  // === 2. METODOLOGIA ===
  children.push(builder.heading('2. Metodologia', 1));
  children.push(builder.paragraph(
    data?.methodology ||
    'A analise foi conduzida utilizando metodologia estruturada, combinando diferentes tecnicas de levantamento e analise:'
  ));

  children.push(...builder.bulletList(data?.methodologySteps || [
    'Entrevistas com stakeholders-chave',
    'Analise de documentacao existente',
    'Observacao de processos em operacao',
    'Benchmarking com melhores praticas de mercado',
    'Workshops de validacao com a equipe'
  ]));

  children.push(...builder.emptyParagraph(1));

  // === 3. DIAGNOSTICO ===
  children.push(builder.heading('3. Diagnostico', 1));

  children.push(builder.heading('3.1 Situacao Atual', 2));
  children.push(builder.paragraph(
    data?.currentSituation ||
    'A analise da situacao atual revelou uma organizacao com processos estabelecidos, porem com oportunidades significativas de melhoria em termos de eficiencia e automacao.'
  ));

  children.push(builder.heading('3.2 Problemas Identificados', 2));
  children.push(...builder.numberedList(data?.problems || [
    'Processos manuais e demorados que consomem tempo excessivo da equipe',
    'Falta de integracao entre sistemas, gerando retrabalho',
    'Dados descentralizados dificultando tomada de decisao',
    'Ausencia de metricas claras de desempenho',
    'Documentacao desatualizada ou inexistente'
  ]));

  children.push(...builder.emptyParagraph(1));

  // === 4. RECOMENDACOES ===
  children.push(builder.heading('4. Recomendacoes', 1));
  children.push(builder.paragraph('Com base no diagnostico, recomendamos as seguintes acoes:'));
  children.push(...builder.emptyParagraph(1));

  children.push(builder.table(
    ['Prioridade', 'Recomendacao', 'Impacto', 'Esforco'],
    data?.recommendations || [
      ['Alta', 'Automatizar processos criticos', 'Alto', 'Medio'],
      ['Alta', 'Implementar integracao entre sistemas', 'Alto', 'Alto'],
      ['Media', 'Criar dashboard de indicadores', 'Medio', 'Baixo'],
      ['Media', 'Atualizar documentacao de processos', 'Medio', 'Baixo'],
      ['Baixa', 'Capacitar equipe em novas ferramentas', 'Medio', 'Baixo']
    ]
  ));

  children.push(...builder.emptyParagraph(1));

  // === 5. PLANO DE ACAO ===
  children.push(builder.heading('5. Plano de Acao', 1));
  children.push(builder.paragraph('Propomos o seguinte plano de implementacao:'));
  children.push(...builder.emptyParagraph(1));

  children.push(builder.table(
    ['Acao', 'Responsavel', 'Prazo', 'Status'],
    data?.actionPlan || [
      ['Definir requisitos detalhados', 'Equipe TI', '2 semanas', 'Pendente'],
      ['Selecionar fornecedor/solucao', 'Compras + TI', '3 semanas', 'Pendente'],
      ['Implementar fase piloto', 'TI + Operacoes', '6 semanas', 'Pendente'],
      ['Rollout completo', 'TI', '4 semanas', 'Pendente'],
      ['Avaliacao de resultados', 'Gestao', '2 semanas', 'Pendente']
    ]
  ));

  children.push(...builder.emptyParagraph(1));

  // === 6. ROI ESPERADO ===
  children.push(builder.heading('6. ROI Esperado', 1));
  children.push(builder.highlightBox(
    'Retorno sobre Investimento',
    data?.roi ||
    'Com a implementacao das recomendacoes, estimamos uma economia anual de R$ 250.000,00 atraves da reducao de 40% no tempo de processos manuais e eliminacao de retrabalho por falta de integracao.'
  ));

  children.push(...builder.emptyParagraph(1));

  // === 7. PROXIMOS PASSOS ===
  children.push(builder.heading('7. Proximos Passos', 1));
  children.push(...builder.numberedList([
    'Apresentar relatorio para stakeholders-chave',
    'Validar priorizacao das recomendacoes',
    'Definir orcamento e recursos necessarios',
    'Iniciar execucao do plano de acao',
    'Estabelecer checkpoints de acompanhamento'
  ]));

  children.push(...builder.emptyParagraph(2));
  children.push(builder.separator());
  children.push(builder.paragraph(
    `Documento gerado em ${today}`,
    { align: AlignmentType.CENTER, size: 20, color: COLORS.light }
  ));

  return children;
}

function generateGeneralDoc(builder, data) {
  const children = [];
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // === CAPA ===
  children.push(...builder.emptyParagraph(6));
  children.push(builder.coverTitle(builder.options.title));
  children.push(...builder.emptyParagraph(1));
  children.push(builder.coverSubtitle(today, 24));
  children.push(builder.pageBreak());

  // === SUMARIO ===
  children.push(...builder.toc());
  children.push(builder.pageBreak());

  // Conteudo do data ou padrao
  if (data?.sections && Array.isArray(data.sections)) {
    for (const section of data.sections) {
      children.push(builder.heading(section.title, section.level || 1));

      if (section.content) {
        children.push(builder.paragraph(section.content));
      }

      if (section.bullets && Array.isArray(section.bullets)) {
        children.push(...builder.bulletList(section.bullets));
      }

      if (section.numbered && Array.isArray(section.numbered)) {
        children.push(...builder.numberedList(section.numbered));
      }

      if (section.table) {
        children.push(...builder.emptyParagraph(1));
        children.push(builder.table(section.table.headers, section.table.rows));
      }

      if (section.highlight) {
        children.push(...builder.emptyParagraph(1));
        children.push(builder.highlightBox(section.highlight.title, section.highlight.content));
      }

      children.push(...builder.emptyParagraph(1));
    }
  } else {
    // Conteudo padrao
    children.push(builder.heading('1. Introducao', 1));
    children.push(builder.paragraph(
      'Este documento apresenta informacoes relevantes sobre o tema em questao, organizadas de forma estruturada para facilitar a compreensao.'
    ));

    children.push(...builder.emptyParagraph(1));

    children.push(builder.heading('2. Desenvolvimento', 1));
    children.push(builder.paragraph(
      'Nesta secao sao apresentados os detalhes e analises pertinentes ao assunto abordado.'
    ));

    children.push(builder.heading('2.1 Topico A', 2));
    children.push(builder.paragraph('Descricao do primeiro topico...'));

    children.push(builder.heading('2.2 Topico B', 2));
    children.push(builder.paragraph('Descricao do segundo topico...'));

    children.push(...builder.emptyParagraph(1));

    children.push(builder.heading('3. Conclusao', 1));
    children.push(builder.paragraph(
      'As consideracoes finais e proximos passos sao apresentados nesta secao de encerramento do documento.'
    ));
  }

  children.push(...builder.emptyParagraph(2));
  children.push(builder.separator());
  children.push(builder.paragraph(
    `Documento gerado em ${today}`,
    { align: AlignmentType.CENTER, size: 20, color: COLORS.light }
  ));

  return children;
}

// ============================================
// FUNCAO PRINCIPAL
// ============================================

async function main() {
  const options = parseArgs();

  console.log(`\nDOCX Generator v2.0`);
  console.log(`===================`);
  console.log(`Tipo: ${options.type}`);
  console.log(`Titulo: ${options.title}`);
  console.log(`Saida: ${options.output}`);

  // Carregar dados de entrada se fornecido
  let data = {};
  if (options.input && fs.existsSync(options.input)) {
    console.log(`Entrada: ${options.input}`);
    const content = fs.readFileSync(options.input, 'utf-8');
    data = JSON.parse(content);
  }

  const builder = new DocxBuilder(options);

  // Gerar conteudo baseado no tipo
  let children;
  switch (options.type) {
    case 'technical':
      children = generateTechnicalDoc(builder, data);
      break;
    case 'executive':
      children = generateExecutiveDoc(builder, data);
      break;
    case 'proposal':
      children = generateProposalDoc(builder, data);
      break;
    case 'consulting':
      children = generateConsultingDoc(builder, data);
      break;
    default:
      children = generateGeneralDoc(builder, data);
  }

  // Criar documento com estilos completos
  const doc = new Document({
    creator: options.author,
    title: options.title,
    description: `Documento gerado por Cortex DOCX Generator v2.0`,
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 24 }
        }
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 36, bold: true, font: 'Arial', color: COLORS.primary },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, font: 'Arial', color: COLORS.primary },
          paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 24, bold: true, font: 'Arial', color: COLORS.text },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
        },
        {
          id: 'TOC1',
          name: 'TOC 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: { size: 24, font: 'Arial' },
          paragraph: { spacing: { before: 120, after: 60 } }
        },
        {
          id: 'TOC2',
          name: 'TOC 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: { size: 22, font: 'Arial' },
          paragraph: { spacing: { before: 60, after: 60 }, indent: { left: 440 } }
        }
      ]
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        },
        {
          reference: 'numbers',
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE.WIDTH, height: PAGE.HEIGHT },
          margin: { top: PAGE.MARGIN, right: PAGE.MARGIN, bottom: PAGE.MARGIN, left: PAGE.MARGIN }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border } },
              spacing: { after: 200 },
              children: [new TextRun({
                text: options.title,
                size: 20,
                font: 'Arial',
                color: COLORS.muted
              })]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border } },
              spacing: { before: 200 },
              children: [
                new TextRun({ text: 'Pagina ', size: 20, font: 'Arial', color: COLORS.muted }),
                new TextRun({ children: [PageNumber.CURRENT], size: 20, font: 'Arial', color: COLORS.muted }),
                new TextRun({ text: ' de ', size: 20, font: 'Arial', color: COLORS.muted }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20, font: 'Arial', color: COLORS.muted })
              ]
            })
          ]
        })
      },
      children
    }]
  });

  // Salvar documento
  const buffer = await Packer.toBuffer(doc);

  // Criar diretorio se necessario
  const outputDir = path.dirname(options.output);
  if (outputDir && outputDir !== '.' && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(options.output, buffer);
  console.log(`\nDocumento gerado com sucesso: ${options.output}`);
  console.log(`\nNOTA: Abra o documento no Word e pressione Ctrl+A, F9 para atualizar o sumario.`);
}

main().catch(err => {
  console.error('Erro ao gerar documento:', err.message);
  process.exit(1);
});
