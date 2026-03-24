# Relatorio Geral do Projeto

Gere um relatorio executivo completo do projeto para apresentacao ao board, mostrando visao geral, cronograma, metodologia Cortex, ROI total e roadmap.

**Skill utilizada**: `px-presentations` (design system PX Ativos Judiciais)

---

## Etapa 1: Carregar Skill de Apresentacoes

Antes de comecar, leia a skill de apresentacoes para garantir conformidade visual:

```
Ler: .claude/skills/px-presentations/SKILL.md
Ler: .claude/skills/px-presentations/references/slide-templates.md
```

A skill define:
- Paleta de cores PX (Navy #1e3a5f, Amber #f0a500)
- Templates HTML para cada tipo de slide
- Workflow de geracao via html2pptx

---

## Etapa 2: Coleta de Dados Historicos

### 2.1 Metricas Gerais do Repositorio

```bash
# Idade do projeto
echo "=== INFORMACOES DO PROJETO ==="
echo "Primeiro commit: $(git log --reverse --format='%ai' | head -1)"
echo "Ultimo commit: $(git log -1 --format='%ai')"

# Total de commits
echo -e "\n=== ESTATISTICAS GERAIS ==="
echo "Total de commits: $(git rev-list --count HEAD)"

# Contributors totais
echo -e "\n=== CONTRIBUTORS TOTAIS ==="
git shortlog -sn --no-merges

# Linhas de codigo
echo -e "\n=== LINHAS DE CODIGO ==="
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs wc -l 2>/dev/null | tail -1

# Arquivos por tipo
echo -e "\n=== DISTRIBUICAO DE ARQUIVOS ==="
echo "TypeScript (.ts): $(find . -name '*.ts' | wc -l)"
echo "React (.tsx): $(find . -name '*.tsx' | wc -l)"
echo "Markdown (.md): $(find . -name '*.md' | wc -l)"
echo "JSON: $(find . -name '*.json' | wc -l)"

# ADRs
echo -e "\n=== ADRs DOCUMENTADOS ==="
ls -la docs/technical-context/adr/*.md 2>/dev/null | wc -l
```

### 2.2 Analise do README e Documentacao

Leia e analise:
- README.md (status do projeto)
- CHANGELOG.md (historico de releases)
- Estrutura de pastas (arquitetura)

---

## Etapa 3: Mapeamento de Modulos

Analise a estrutura do projeto para listar modulos:

```bash
# Backend features
echo "=== MODULOS BACKEND ==="
ls -d apps/backend/src/features/*/ 2>/dev/null || ls -d src/features/*/ 2>/dev/null

# Frontend pages/components
echo -e "\n=== PAGINAS FRONTEND ==="
ls -d apps/frontend/src/pages/*/ 2>/dev/null || ls -d src/pages/*/ 2>/dev/null

# Shared packages
echo -e "\n=== PACKAGES COMPARTILHADOS ==="
ls packages/ 2>/dev/null
```

Para cada modulo, determine:
- Status: Concluido / Em Progresso / Planejado
- Porcentagem de conclusao
- Features principais

---

## Etapa 4: Calculo Dinamico de ROI Total

O ROI e calculado dinamicamente baseado nas metricas Git do projeto inteiro.

### Formula de Calculo:

```
Linhas Tradicional/Dev/Semana = 750 (baseline industria)
Linhas Cortex/Dev/Semana = linhasTotais / contributors / semanasProjeto

Multiplicador Bruto = Linhas_Cortex / Linhas_Tradicional
Multiplicador Ajustado = min(10, max(1.5, Multiplicador_Bruto))

Equivalente Devs = contributors * multiplicador
Economia Total = (equivalente - real) * R$ 20.000 * meses
```

### Executar Calculo:

```bash
# Coleta de metricas do projeto inteiro
LINHAS=$(git log --oneline --stat | grep -E "^\s+\d+ file" | awk '{sum += $4} END {print sum}')
CONTRIBUTORS=$(git shortlog -sn --no-merges | wc -l)
MESES=7

# Calculo automatico
node .claude/scripts/productivity/calculator.js \
  --lines $LINHAS \
  --contributors $CONTRIBUTORS \
  --months $MESES \
  --accumulated $MESES
```

### Limites do Multiplicador:

- **Minimo**: 1.5x (para garantir ganho minimo)
- **Maximo**: 10.0x (teto conservador acordado)
- **Custo base**: R$ 20.000/dev/mes

### Equivalencia em Desenvolvedores:

O multiplicador de 10x significa:
- Time Real: N pessoas
- Equivalente Tradicional: N * 10 desenvolvedores
- "Trabalho de 10 devs sendo feito por 1"

---

## Etapa 5: Cronograma do Projeto

### Fases do Projeto:

```markdown
### Fase 1: Fundacao (Mes 1-2)
- Setup monorepo
- Arquitetura base
- ADRs fundamentais
- Status: Concluido

### Fase 2: Core Backend (Mes 2-4)
- Auth com Cognito
- Registration Management
- Case Management
- Status: Concluido

### Fase 3: Integracoes (Mes 4-6)
- Integracoes externas
- Case Actions System
- Status: Em Progresso

### Fase 4: Frontend (Mes 5-7)
- Dashboard
- Workflow Pages
- Admin Interface
- Status: Em Progresso

### Fase 5: Deploy (Mes 7-8)
- Production Deployment
- Status: Planejado
```

---

## Etapa 6: Geracao dos Slides HTML

Seguindo a skill `px-presentations`, crie arquivos HTML para cada slide:

### Slide 1: Capa (slide01_capa.html)

Use o template de capa:
- Titulo: "TECH REPORT"
- Ano em destaque: "2026"
- Subtitulo: "Consolidado de entregas tecnologicas"
- Background: gradiente navy

### Slide 2: Visao Geral (slide02_visao.html)

- O que e o projeto (descricao executiva)
- Tech Stack com icones/badges
- Team size
- Timeline geral

### Slide 3: Metodologia Cortex (slide03_metodologia.html)

- "Desenvolvimento AI-First"
- Multiplicador de produtividade: 3.0x
- Comparativo visual Cortex vs. Tradicional
- Features cards com status verde

### Slide 4: Economia Total (slide04_economia.html)

- ROI do projeto: R$ 560.000
- Horas economizadas (total)
- Equivalente em desenvolvedores: "6 devs -> 2 devs"
- Metric cards grandes

### Slide 5: Modulos Entregues (slide05_modulos.html)

- Lista de modulos com status badges
- Verde = concluido, Amarelo = em progresso
- Metric card com total de modulos

### Slide 6: Equipe (slide06_equipe.html)

- Tech Leads: Tarda, Rafael Fiales (CAIO)
- Devs: Tarda, Paiola
- PO: Ana Carolina Barros
- Cards com funcao de cada um

### Slide 7: Obrigado (slide07_obrigado.html)

Use o template final:
- 3 metricas em amarelo (Features, Modulos, Economia)
- Mensagem de visao de futuro
- Footer centralizado

---

## Etapa 7: Gerar PPTX

### Opcao A: Via Node.js (html2pptx) - RECOMENDADO

```bash
# Usar o script de conversao local (tema PX padrao)
node .claude/scripts/html2pptx/convert.js --input reports/general/PROJECT_YYYY --output reports/general/PROJECT_YYYY/general_report.pptx

# Com tema especifico (cortex, minimal, dark)
node .claude/scripts/html2pptx/convert.js --input reports/general/PROJECT_YYYY --output reports/general/PROJECT_YYYY/general_report.pptx --theme cortex

# Listar temas disponiveis
node .claude/scripts/html2pptx/convert.js --list-themes
```

### Opcao B: Via Node.js (html2pptx direto)

```javascript
const { convertHTML2PPTX } = require('html2pptx');

// Converter cada slide
convertHTML2PPTX('slide01_capa.html', 'general_report.pptx')
  .then(result => console.log('Sucesso!', result))
  .catch(error => console.error('Erro:', error));
```

### Opcao C: Via python-pptx (Python)

```bash
python .claude/scripts/reports/pptx_generator.py --type general --output general_report.pptx --data project_metrics.json
```

---

## Etapa 8: Salvar Artefatos

```
reports/
  general/
    [PROJECT]_tech_report_[YYYY]/
      slide01_capa.html
      slide02_visao.html
      slide03_metodologia.html
      slide04_economia.html
      slide05_modulos.html
      slide06_equipe.html
      slide07_obrigado.html
      general_report.pptx
      project_metrics.json
```

---

## Output Esperado

O comando deve produzir:

1. **Metricas Completas** - Dados historicos do projeto
2. **Inventario de Modulos** - Status de cada componente
3. **Calculo ROI Total** - R$ 560.000 economia justificada
4. **Cronograma Visual** - Fases e marcos
5. **Arquivos HTML** - Slides seguindo design system PX
6. **PPTX Final** - Apresentacao pronta para o board
7. **Instrucoes** - Como executar e ajustar

---

## Checklist Final

Antes de finalizar, verifique:

- [ ] Metricas historicas coletadas
- [ ] Todos os modulos mapeados
- [ ] ROI total: R$ 560.000 (4 devs x R$20k x 7 meses)
- [ ] Multiplicador: 3.0x
- [ ] Equipe correta: Tarda, Rafael, Paiola, Ana Carolina
- [ ] Design segue padrao PX (cores, tipografia)
- [ ] SEM EMOJIS na apresentacao
- [ ] Linguagem executiva (nao tecnica)
- [ ] Roadmap definido
- [ ] PPTX gerado e funcional

---

## Referencias

- **Skill**: `.claude/skills/px-presentations/SKILL.md`
- **Templates**: `.claude/skills/px-presentations/references/slide-templates.md`
- **Script Node.js**: `.claude/scripts/html2pptx/convert.js`
- **Script Python**: `.claude/scripts/reports/pptx_generator.py`

---

## Dependencias

Certifique-se de que as dependencias estao instaladas:

```bash
# Node.js
npm install html2pptx pptxgenjs --save-dev

# Python (alternativa)
pip install python-pptx
```
