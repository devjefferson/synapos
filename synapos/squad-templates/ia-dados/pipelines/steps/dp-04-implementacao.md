---
id: dp-04-implementacao
name: "Implementação do Pipeline"
agent: diana-dados
execution: subagent
model_tier: powerful
---

# Implementação do Pipeline de Dados

**Agent:** Diana Dados 🗄️

1. Implemente modelos dbt em 3 camadas (staging → intermediate → mart)
2. Adicione testes de qualidade (not_null, unique, accepted_values, relationships)
3. Documente todas as colunas das tabelas de mart
4. Configure orquestração (Airflow DAG ou equivalente)
5. Garanta idempotência do pipeline

Critérios: idempotente, testado, documentado, sem dados sensíveis expostos.
