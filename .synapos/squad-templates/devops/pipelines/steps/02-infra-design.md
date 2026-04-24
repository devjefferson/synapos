---
id: 02-infra-design
name: "Design de Infraestrutura"
agent: igor-infra
execution: subagent
model_tier: powerful
output_files:
  - infra-architecture.md
---

# Design de Infraestrutura

**Agent:** Igor Infra ☁️

## Contexto disponível

- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← leia antes de qualquer decisão
- **ADRs existentes:** `docs/tech-context/briefing/adrs-summary.md` ← verifique conflitos com decisões anteriores

## Tarefa

1. Elabore diagrama de arquitetura da infra
2. Defina todos os componentes e suas versões
3. Documente estimativa de custo mensal por ambiente
4. Defina estratégia de networking (VPC, subnets, security groups)
5. Especifique redundância e alta disponibilidade

## Output

Salve em `docs/infra-architecture.md`.
