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
- [ ] `.synapos/squads/{slug}/agents/` tem ao menos `marina-mobile.agent.md`

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

## Tarefas em aberto

Antes de perguntar sobre a task, verifique:

1. Procure arquivos `docs/specs/*-tasks.md` e liste itens `- [ ]` pendentes
2. Leia `_memory/memories.md` — se houver `Platform:` registrado:
   - **GitHub**: execute `gh issue list --label "feature" --state open`
   - **Linear / Jira**: exiba as tarefas registradas no memories.md

**Se encontrar tarefas em aberto**, apresente e pergunte:

```
Tarefas em aberto:
  - [ ] RF-{N}: {título} {#issue se houver}
  - [ ] RF-{N}: {título}

Qual tarefa vamos trabalhar? (ou descreva uma nova)
```

**Se não houver tarefas**, pergunte:

```
O que vamos implementar nesta sessão?
Inclua: feature/bug, plataforma alvo (iOS/Android/ambas), contexto de produto.
```

Salve a resposta em `_memory/memories.md`:
```markdown
## Sessão {YYYY-MM-DD}
Task: {tarefa selecionada ou descrita}
Issue: {#número | plataforma | local | —}
```

Prossiga.
