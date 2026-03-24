---
id: ip-03-iac
name: "Implementação IaC"
agent: igor-infra
execution: subagent
model_tier: powerful
---

# Implementação IaC (Terraform)

**Agent:** Igor Infra ☁️

Implemente a infraestrutura como código seguindo o design aprovado:
1. Organize em módulos reutilizáveis
2. Configure backend remoto para state
3. Use variáveis por ambiente
4. Tags em todos os recursos
5. Execute `terraform validate` e `terraform plan`

Critérios: sem hardcoded secrets, backend remoto configurado, plan sem erros.
