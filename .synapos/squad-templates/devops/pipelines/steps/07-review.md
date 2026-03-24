---
id: 07-review
name: "Review Final de Infra"
agent: igor-infra
execution: inline
model_tier: powerful
output_files:
  - docs/infra-review.md
gate: GATE-5
---

# Review Final de Infra

**Agent:** Igor Infra ☁️

## Escopo do Review

- Segurança: IAM least privilege, secrets management, portas expostas
- Custo: otimizações possíveis, sizing adequado
- Resiliência: redundância, backups, estratégia de failover
- Observabilidade: logs, métricas, alertas completos
- IaC: código bem estruturado, sem drift

## Formato

Use: `BLOCKER:` / `SUGGESTION:` / `QUESTION:` / `PRAISE:`
Salve em `docs/infra-review.md`.
