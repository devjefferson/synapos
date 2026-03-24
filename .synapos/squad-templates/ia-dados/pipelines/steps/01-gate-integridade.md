---
id: 01-gate-integridade
name: "Verificação de Integridade"
execution: checkpoint
gate: GATE-0
---

# Verificação de Integridade — GATE-0

- [ ] `.synapos/core/orchestrator.md` existe
- [ ] `.synapos/_memory/company.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe com `description` preenchida
- [ ] `.synapos/squads/{slug}/agents/` tem ao menos `larissa-llm.agent.md` ou `diana-dados.agent.md`

## Contexto do squad

```
Squad: {name} | Modo: {modo}
Objetivo: {description}
Agents: {lista com ícones}
```

Pergunte:
```
O que vamos construir nesta sessão?
Inclua: problema de negócio, dados disponíveis, métrica de sucesso esperada.
```

Salve a resposta em `_memory/memories.md`:
```markdown
## Sessão {YYYY-MM-DD}
Task: {resposta do usuário}
```

Prossiga.
