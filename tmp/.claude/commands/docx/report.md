# Geracao de Documento DOCX Estruturado

Gere um documento Word (.docx) profissional a partir de conteudo estruturado como relatorios, documentacao tecnica, propostas comerciais, ou relatorios de consultoria.

**Skill utilizada**: `docx` (criacao e edicao de documentos Word)

---

## Parametros de Entrada

O usuario deve fornecer:
- **Tipo de documento**: technical | executive | proposal | consulting | general
- **Titulo**: Titulo principal do documento
- **Fonte de dados**: Arquivo(s) de entrada (markdown, json, txt) ou conteudo direto
- **Saida**: Caminho do arquivo .docx de saida

Argumento opcional: `$ARGUMENTS` (tipo de documento e caminho de saida)

---

## Etapa 1: Carregar Skill DOCX

Antes de comecar, leia a skill de documentos para garantir conformidade:

```
Ler: .claude/skills/docx/SKILL.MD
```

A skill define:
- Uso do docx-js para criacao de novos documentos
- Configuracoes de pagina (US Letter vs A4)
- Estilos de heading, listas, tabelas
- Regras criticas (nunca usar \n, sempre usar Paragraph)

---

## Etapa 2: Identificar Tipo de Documento

### Tipos Suportados:

| Tipo | Descricao | Estrutura Tipica |
|------|-----------|------------------|
| `technical` | Documentacao tecnica, arquitetura, APIs | Sumario, Visao Geral, Detalhes Tecnicos, Diagramas |
| `executive` | Relatorios executivos para board | Resumo Executivo, Metricas, Conclusoes |
| `proposal` | Propostas comerciais | Contexto, Solucao, Investimento, Cronograma |
| `consulting` | Relatorios de consultoria | Diagnostico, Recomendacoes, Plano de Acao |
| `general` | Documento generico | Flexivel conforme conteudo |

---

## Etapa 3: Coletar Conteudo

### 3.1 Se fonte for arquivo Markdown:

```bash
# Ler arquivo de entrada
cat <arquivo_entrada>.md
```

### 3.2 Se fonte for documentacao do projeto:

```bash
# Coletar informacoes do projeto
echo "=== README ==="
cat README.md 2>/dev/null | head -100

echo -e "\n=== CHANGELOG ==="
cat CHANGELOG.md 2>/dev/null | head -50

echo -e "\n=== ESTRUTURA ==="
find . -type f -name "*.md" | head -20
```

### 3.3 Se fonte for dados JSON:

```bash
# Ler dados estruturados
cat <arquivo_dados>.json | jq '.'
```

---

## Etapa 4: Estruturar Conteudo

Organize o conteudo em secoes logicas baseado no tipo:

### Template: Documento Tecnico

```markdown
1. Sumario (Table of Contents)
2. Resumo Executivo
3. Visao Geral
   - Objetivo
   - Escopo
   - Publico-alvo
4. Arquitetura
   - Diagrama de componentes
   - Stack tecnologica
   - Fluxos de dados
5. Detalhamento Tecnico
   - Modulos
   - APIs
   - Banco de dados
6. Requisitos
   - Funcionais
   - Nao-funcionais
7. Cronograma
8. Anexos
```

### Template: Relatorio Executivo

```markdown
1. Resumo Executivo
2. Contexto
3. Metricas e KPIs
   - Cards de metricas
   - Graficos de progresso
4. Entregas do Periodo
5. Riscos e Mitigacoes
6. Proximos Passos
7. Conclusao
```

### Template: Proposta Comercial

```markdown
1. Carta de Apresentacao
2. Sobre a Empresa
3. Entendimento do Desafio
4. Solucao Proposta
   - Descricao
   - Diferenciais
   - Beneficios
5. Escopo de Trabalho
   - Incluso
   - Nao incluso
6. Investimento
   - Tabela de precos
   - Condicoes de pagamento
7. Cronograma
8. Equipe
9. Cases de Sucesso
10. Termos e Condicoes
```

### Template: Relatorio de Consultoria

```markdown
1. Sumario Executivo
2. Metodologia
3. Diagnostico
   - Situacao Atual
   - Problemas Identificados
   - Analise de Causa Raiz
4. Recomendacoes
   - Curto prazo
   - Medio prazo
   - Longo prazo
5. Plano de Acao
   - Acoes prioritarias
   - Responsaveis
   - Prazos
6. Investimento Estimado
7. ROI Esperado
8. Proximos Passos
```

---

## Etapa 5: Gerar Script docx-js

Crie um script Node.js para gerar o documento:

### Estrutura Base

```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak, TableOfContents, LevelFormat } = require('docx');
const fs = require('fs');

// Configuracoes de pagina US Letter
const PAGE_WIDTH = 12240;  // 8.5 inches in DXA
const PAGE_HEIGHT = 15840; // 11 inches in DXA
const MARGIN = 1440;       // 1 inch margins

// Cores corporativas (ajustar conforme necessidade)
const COLORS = {
  primary: '1e3a5f',      // Navy
  secondary: 'f0a500',    // Amber
  text: '333333',
  muted: '666666',
  border: 'CCCCCC'
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Arial', size: 24 } // 12pt
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
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: COLORS.primary },
        paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: COLORS.text },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
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
          text: '•',
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
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'TITULO DO DOCUMENTO', size: 18, color: COLORS.muted })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Pagina ', size: 18, color: COLORS.muted }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLORS.muted }),
              new TextRun({ text: ' de ', size: 18, color: COLORS.muted }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: COLORS.muted })
            ]
          })
        ]
      })
    },
    children: [
      // CONTEUDO AQUI
    ]
  }]
});

// Salvar documento
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('output.docx', buffer);
  console.log('Documento gerado: output.docx');
});
```

### Funcoes Auxiliares

```javascript
// Criar titulo de secao
function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    children: [new TextRun(text)]
  });
}

// Criar paragrafo normal
function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: 200 },
    ...options,
    children: [new TextRun({ text, size: 24, ...options.run })]
  });
}

// Criar lista com bullets
function createBulletList(items) {
  return items.map(item => new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text: item, size: 24 })]
  }));
}

// Criar tabela simples
function createTable(headers, rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      borders,
      shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22 })]
      })]
    }))
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      borders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: String(cell), size: 22 })]
      })]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows]
  });
}

// Criar caixa de destaque
function createHighlightBox(title, content) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.secondary };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: border, bottom: border, right: border,
                   left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.secondary } },
        shading: { fill: 'FFF9E6', type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 120 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 24, color: COLORS.primary })]
          }),
          new Paragraph({
            spacing: { before: 80 },
            children: [new TextRun({ text: content, size: 22 })]
          })
        ]
      })]
    })]
  });
}
```

---

## Etapa 6: Executar Geracao

### Salvar e executar o script:

```bash
# Criar diretorio de saida
mkdir -p reports/docs/$(date +%Y-%m-%d)

# Salvar script
# (o script sera salvo como generate_doc.js no diretorio de saida)

# Executar
node reports/docs/$(date +%Y-%m-%d)/generate_doc.js
```

---

## Etapa 7: Validar Documento

```bash
# Verificar se o arquivo foi criado
ls -la reports/docs/$(date +%Y-%m-%d)/*.docx

# Opcional: Converter para PDF para visualizacao
soffice --headless --convert-to pdf reports/docs/$(date +%Y-%m-%d)/*.docx --outdir reports/docs/$(date +%Y-%m-%d)/
```

---

## Etapa 8: Salvar Artefatos

```
reports/
  docs/
    YYYY-MM-DD/
      generate_doc.js       # Script de geracao
      documento.docx        # Documento final
      documento.pdf         # PDF (opcional)
      source_data.json      # Dados fonte (se aplicavel)
```

---

## Output Esperado

O comando deve produzir:

1. **Analise do conteudo fonte** - Identificacao da estrutura
2. **Script docx-js** - Codigo Node.js para geracao
3. **Documento .docx** - Arquivo Word pronto para uso
4. **Instrucoes** - Como visualizar, editar e regenerar

---

## Checklist Final

Antes de finalizar, verifique:

- [ ] Tipo de documento identificado corretamente
- [ ] Estrutura segue o template apropriado
- [ ] Estilos de heading configurados (Heading1, Heading2, Heading3)
- [ ] Listas usam numbering config (NUNCA unicode bullets)
- [ ] Tabelas tem width e columnWidths definidos
- [ ] Pagina configurada para US Letter (12240 x 15840 DXA)
- [ ] Header e footer configurados
- [ ] SEM uso de \n (usar Paragraph separados)
- [ ] SEM emojis no documento
- [ ] Documento .docx gerado e funcional

---

## Exemplos de Uso

### Exemplo 1: Documentacao Tecnica

```bash
/docx:report technical docs/architecture.md output.docx
```

### Exemplo 2: Relatorio Executivo

```bash
/docx:report executive "Relatorio Q1 2026"
```

### Exemplo 3: Proposta Comercial

```bash
/docx:report proposal data/proposta.json proposta_cliente.docx
```

---

## Dependencias

Certifique-se de que as dependencias estao instaladas:

```bash
# Instalar docx-js
npm install docx --save-dev

# Opcional: LibreOffice para conversao PDF
sudo apt install libreoffice-core libreoffice-writer
```

---

## Referencias

- **Skill**: `.claude/skills/docx/SKILL.MD`
- **Documentacao docx-js**: https://docx.js.org/
- **Repositorio**: https://github.com/dolanmiu/docx
