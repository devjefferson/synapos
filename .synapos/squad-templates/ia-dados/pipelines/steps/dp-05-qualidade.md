---
id: dp-05-qualidade
name: "Validação de Qualidade de Dados"
agent: nelson-notebook
execution: subagent
model_tier: fast
output_files:
  - data-quality-report.md
---

# Validação de Qualidade de Dados

**Agent:** Nelson Notebook 📊

1. Execute todos os testes dbt
2. Analise o volume de dados (vs esperado)
3. Verifique distribuições das colunas críticas
4. Identifique anomalias ou valores suspeitos
5. Valide que os dados de mart fazem sentido de negócio

Salve relatório em `docs/data-quality-report.md`.
