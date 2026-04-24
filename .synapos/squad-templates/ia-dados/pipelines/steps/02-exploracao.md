---
id: 02-exploracao
name: "Exploração e Definição"
agent: nelson-notebook
execution: subagent
model_tier: powerful
output_files:
  - data-exploration.md
---

# Exploração e Definição do Problema

**Agent:** Nelson Notebook 📊

## Contexto disponível

- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← leia antes de qualquer decisão
- **ADRs existentes:** `docs/tech-context/briefing/adrs-summary.md` ← verifique conflitos com decisões anteriores

## Tarefa

1. Defina a pergunta de negócio clara
2. Avalie a qualidade e volume dos dados disponíveis
3. Estabeleça o baseline (o que existe hoje? qual é o benchmark?)
4. Identifique as métricas técnicas alinhadas à métrica de negócio
5. Documente limitações conhecidas dos dados

## Output

Salve em `docs/data-exploration.md` com:
- Pergunta de negócio
- Análise exploratória inicial
- Baseline estabelecido
- Métricas de sucesso
- Limitações e riscos dos dados
