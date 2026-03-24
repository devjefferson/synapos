# Relatorio Semanal Executivo

Gere um relatorio semanal para o board executivo da empresa, mostrando o progresso do projeto, entregas da semana, e valor economizado com a metodologia Cortex.

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

## Etapa 2: Coleta de Dados Git

Execute os seguintes comandos para coletar metricas reais do repositorio:

```bash
# Data de referencia (7 dias atras)
echo "=== PERIODO DO RELATORIO ==="
echo "De: $(date -d '7 days ago' '+%d/%m/%Y')"
echo "Ate: $(date '+%d/%m/%Y')"

# Contributors da semana
echo -e "\n=== CONTRIBUTORS DA SEMANA ==="
git shortlog -sn --since="7 days ago" --no-merges

# Total de commits da semana
echo -e "\n=== COMMITS DA SEMANA ==="
git log --oneline --since="7 days ago" --no-merges | wc -l

# Lista de commits (resumo)
echo -e "\n=== ULTIMOS COMMITS ==="
git log --oneline --since="7 days ago" --no-merges | head -20

# Arquivos mais modificados
echo -e "\n=== ARQUIVOS MAIS MODIFICADOS ==="
git log --since="7 days ago" --no-merges --name-only --pretty=format: | sort | uniq -c | sort -rn | head -15

# Estatisticas de codigo
echo -e "\n=== ESTATISTICAS DE CODIGO ==="
git diff --shortstat "HEAD@{7 days ago}" 2>/dev/null || git diff --shortstat HEAD~30
```

---

## Etapa 3: Analise de Issues/PRs

Verifique o GitHub para issues fechadas na semana:

```bash
# Se gh CLI estiver disponivel
gh issue list --state closed --limit 20 --json number,title,closedAt,labels 2>/dev/null || echo "GitHub CLI nao disponivel"

# PRs mergeados
gh pr list --state merged --limit 20 --json number,title,mergedAt 2>/dev/null || echo "GitHub CLI nao disponivel"
```

Se GitHub CLI nao estiver disponivel, analise:
- README.md para features recentes
- CHANGELOG.md para entregas documentadas
- Commits messages para inferir features

---

## Etapa 4: Calculo Dinamico de Economia

O calculo de produtividade e feito dinamicamente baseado nas metricas Git coletadas.

### Formula de Calculo:

```
Linhas Tradicional/Dev/Semana = 750 (baseline industria)
Linhas Cortex/Dev/Semana = linhasAdicionadas / contributors / semanas

Multiplicador Bruto = Linhas_Cortex / Linhas_Tradicional
Multiplicador Ajustado = min(10, max(1.5, Multiplicador_Bruto))

Equivalente Devs = contributors * multiplicador
Economia Mensal = (equivalente - real) * R$ 20.000
```

### Executar Calculo:

```bash
# Calculo automatico via script
node .claude/scripts/productivity/calculator.js \
  --lines <LINHAS_ADICIONADAS> \
  --contributors <NUM_CONTRIBUTORS> \
  --weeks 1 \
  --accumulated 7

# Exemplo com dados reais
node .claude/scripts/productivity/calculator.js -l 150775 -c 2 -w 1 -a 7
```

### Limites do Multiplicador:

- **Minimo**: 1.5x (para garantir ganho minimo)
- **Maximo**: 10.0x (teto conservador acordado)
- **Custo base**: R$ 20.000/dev/mes

### Tabela de Referencia por Complexidade:

| Complexidade | Tradicional | Cortex (10x) | Economia |
|--------------|-------------|--------------|----------|
| TRIVIAL | 40h | 4h | R$ 4.320 |
| SMALL | 160h | 16h | R$ 17.280 |
| MEDIUM | 400h | 40h | R$ 43.200 |
| LARGE | 800h | 80h | R$ 86.400 |
| EPIC | 2000h | 200h | R$ 216.000 |

---

## Etapa 5: Geracao dos Slides HTML

Seguindo a skill `px-presentations`, crie arquivos HTML para cada slide:

### Slide 1: Capa (slide01_capa.html)

Use o template de capa da skill com:
- Titulo: "TECH REPORT"
- Ano em destaque: "2026"
- Background: gradiente navy (#1e3a5f -> #2d4a6f)
- Accent bar amarelo no canto superior direito

### Slide 2: Resumo Executivo (slide02_resumo.html)

Use o template de metricas com:
- Header bar azul + accent amarelo
- 4 metric cards: Commits, Features, Economia, Horas economizadas
- Highlights com border-left amarelo

### Slide 3: Entregas da Semana (slide03_entregas.html)

Use o template com secao e icone:
- Lista de features com status badges (verde = concluido)
- Metric card grande com economia total

### Slide 4: Economia (slide04_economia.html)

- Comparativo equipe tradicional vs Cortex
- Cards com valores de economia
- Multiplicador de produtividade

### Slide 5: Obrigado (slide05_obrigado.html)

Use o template final com:
- 3 metricas em amarelo
- Mensagem de encerramento
- Dados da equipe

---

## Etapa 6: Gerar PPTX

### Opcao A: Via Node.js (html2pptx) - RECOMENDADO

```bash
# Usar o script de conversao local (tema PX padrao)
node .claude/scripts/html2pptx/convert.js --input reports/weekly/YYYY-MM-DD --output reports/weekly/YYYY-MM-DD/weekly_report.pptx

# Com tema especifico (cortex, minimal, dark)
node .claude/scripts/html2pptx/convert.js --input reports/weekly/YYYY-MM-DD --output reports/weekly/YYYY-MM-DD/weekly_report.pptx --theme cortex

# Listar temas disponiveis
node .claude/scripts/html2pptx/convert.js --list-themes
```

### Opcao B: Via Node.js (html2pptx direto)

```javascript
const { convertHTML2PPTX } = require('html2pptx');

// Converter cada slide
convertHTML2PPTX('slide01_capa.html', 'weekly_report.pptx')
  .then(result => console.log('Sucesso!', result))
  .catch(error => console.error('Erro:', error));
```

### Opcao C: Via python-pptx (Python)

```bash
python .claude/scripts/reports/pptx_generator.py --type weekly --output weekly_report.pptx --data metrics.json
```

---

## Etapa 7: Salvar Artefatos

Salve os seguintes arquivos:

```
reports/
  weekly/
    YYYY-MM-DD/
      slide01_capa.html
      slide02_resumo.html
      slide03_entregas.html
      slide04_economia.html
      slide05_obrigado.html
      weekly_report.pptx
      metrics.json
```

---

## Output Esperado

O comando deve produzir:

1. **Analise Git** - Metricas reais coletadas
2. **Tabela de Economia** - Features x Economia calculada
3. **Arquivos HTML** - Slides seguindo design system PX
4. **PPTX Final** - Apresentacao pronta para o board
5. **Instrucoes** - Como visualizar e ajustar se necessario

---

## Checklist Final

Antes de finalizar, verifique:

- [ ] Dados Git coletados e apresentados
- [ ] Contributors identificados
- [ ] Features da semana listadas
- [ ] Economia calculada (base: R$ 80k/mes)
- [ ] Slides seguem design system PX (cores, tipografia)
- [ ] SEM EMOJIS na apresentacao
- [ ] Linguagem executiva (nao tecnica)
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
