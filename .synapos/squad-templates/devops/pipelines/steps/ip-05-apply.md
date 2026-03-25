---
id: ip-05-apply
name: "Apply e Smoke Test"
agent: patricia-pipeline
execution: subagent
model_tier: fast
output_files:
  - provision-report.md
gate: GATE-5
---

# Apply e Smoke Test

**Agent:** Patrícia Pipeline 🔄

Após aprovação do plan:
1. Execute `terraform apply` (ou documente os comandos para execução manual)
2. Valide os recursos provisionados
3. Execute smoke tests (health check dos serviços, conectividade de rede)
4. Documente o estado final

Salve relatório em `docs/provision-report.md`.
