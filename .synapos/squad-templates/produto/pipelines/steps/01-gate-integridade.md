---
id: 01-gate-integridade
name: "Verificação de Integridade"
execution: checkpoint
gate: GATE-0
---

# Verificação de Integridade — GATE-0

Execute o GATE-0 conforme definido em `.synapos/core/gate-system.md`.

## Checklist obrigatória

Verifique cada item antes de prosseguir:

- [ ] `.synapos/core/orchestrator.md` existe
- [ ] `.synapos/core/pipeline-runner.md` existe
- [ ] `.synapos/_memory/company.md` existe e tem `Nome` preenchido
- [ ] `.synapos/_memory/preferences.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe
- [ ] `.synapos/squads/{slug}/agents/` tem ao menos um `.agent.md`
- [ ] `.synapos/squads/{slug}/pipeline/pipeline.yaml` existe

## Contexto do squad

Leia `.synapos/squads/{slug}/squad.yaml` e apresente ao usuário:

```
Squad: {name}
Domínio: {domain}
Objetivo: {description}
Modo: {Alta Performance | Econômico}
Agents: {lista}
```

Pergunte:
```
Contexto confirmado. Podemos começar?
[1] Sim, iniciar pesquisa
[2] Ajustar o objetivo do squad antes de prosseguir
```

Se o usuário escolher [2], atualize `description` em `squad.yaml` com o novo objetivo e reinicie este step.
