---
id: 01-gate-integridade
name: "Verificação de Integridade"
execution: checkpoint
gate: GATE-0
---

# Verificação de Integridade — GATE-0

Execute o GATE-0 de `.synapos/core/gate-system.md`: framework ausente **bloqueia**; documentação de projeto ausente (`docs/tech-context/`, ADRs, `docs/_memory/roles/devops.md`) **só avisa** — o Context Brief registra a lacuna.

## Tarefa

1. `[TASK]` recebido do orchestrator ou `## Resumo` de `context.md` já preenchido (pré-execução rodou / session existente) → **não pergunte**. Exiba em 1 linha e prossiga.
2. Senão, verifique tarefas em aberto: itens `- [ ]` em `docs/specs/*-tasks.md` e, se `state.json → squads[{squad}].issue` indicar plataforma, as issues abertas (`gh issue list --state open` para GitHub).
3. Apresente as tarefas encontradas ou pergunte:

```
O que vamos configurar/provisionar nesta sessão?
Inclua: cloud provider, ambientes envolvidos (dev/staging/prod), serviços alvo.
```

O runner registra em `state.json → squads[{squad}]`: `task: {tarefa}` e `issue: {#número | plataforma | local | —}`.
Não escreva a tarefa em `memories.md` nem em `context.md` — context.md é criado pela investigação/contexto.

```
Squad: {name} · Track: {track} · Agents: {lista com ícones}
Tarefa: {tarefa}
```

Prossiga.
