---
id: 06-avaliacao
name: "Avaliação e Validação"
agent: larissa-llm
execution: subagent
model_tier: powerful
output_files:
  - model-evaluation.md
---

# Avaliação e Validação

**Agent:** Larissa LLM 🧠

## Tarefa

1. Execute avaliação no eval set definido no design
2. Compare com o baseline estabelecido na exploração
3. Analise os erros: onde o modelo/pipeline erra e por quê?
4. Traduza métricas técnicas para impacto de negócio
5. Defina se o resultado atinge o threshold de aceite

## Output

Salve em `docs/model-evaluation.md` com:
- Métricas técnicas vs baseline
- Análise de erros
- Tradução para negócio
- Recomendação: DEPLOY | ITERAR | REVER ABORDAGEM
