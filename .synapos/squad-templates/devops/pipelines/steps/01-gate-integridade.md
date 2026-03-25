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
- [ ] `.synapos/squads/{slug}/agents/` tem ao menos `igor-infra.agent.md`

**Documentação do projeto (bloqueante):**
- [ ] `docs/tech-context/project-briefing.md` existe
- [ ] `docs/tech-context/briefing/critical-rules.md` existe

Se ausente: 🚫 Execute `/setup:discover` antes de continuar. Implementação sem ADRs cria débito técnico imediato.

## Contexto do squad

```
Squad: {name} | Modo: {modo}
Objetivo: {description}
Agents: {lista com ícones}
```

Pergunte:
```
O que vamos configurar/provisionar nesta sessão?
Inclua: cloud provider, ambientes envolvidos (dev/staging/prod), serviços alvo.
```

Salve a resposta em `_memory/memories.md`:
```markdown
## Sessão {YYYY-MM-DD}
Task: {resposta do usuário}
```

Prossiga.
