---
id: 01-gate-integridade
name: "Verificação de Integridade"
execution: checkpoint
gate: GATE-0
---

# Verificação de Integridade — GATE-0

Verifique cada item antes de prosseguir:

- [ ] `.synapos/core/orchestrator.md` existe
- [ ] `.synapos/_memory/company.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe com `description` preenchida
- [ ] `.synapos/squads/{slug}/agents/` tem ao menos um `.agent.md`

## Contexto do squad

Apresente ao usuário:

```
Squad: {name} | Modo: {modo}
Objetivo: {description}
Agents: {lista com ícones}
```

Pergunte:
```
O que vamos implementar nesta sessão?
(descreva a feature, bug ou componente — será usado como contexto pelos agents)
```

Salve a resposta em `_memory/memories.md`:
```markdown
## Sessão {YYYY-MM-DD}
Task: {resposta do usuário}
```

Prossiga.
