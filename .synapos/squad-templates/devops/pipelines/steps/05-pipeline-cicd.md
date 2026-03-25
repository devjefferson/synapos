---
id: 05-pipeline-cicd
name: "Configuração do Pipeline CI/CD"
agent: patricia-pipeline
execution: subagent
model_tier: powerful
output_files:
  - cicd-pipeline.md
---

# Configuração do Pipeline CI/CD

**Agent:** Patrícia Pipeline 🔄

## Tarefa

1. Configure workflow de CI (lint, testes, build de imagem)
2. Configure workflow de CD (deploy por ambiente)
3. Defina estratégia de rollback
4. Configure branch protection e aprovações
5. Documente os estágios e triggers

## Critérios

- [ ] CI completo < 10 minutos
- [ ] Secrets nos secrets do repositório (zero no YAML)
- [ ] Smoke tests pós-deploy
- [ ] Rollback documentado e testado
- [ ] Deploy em produção com aprovação manual
