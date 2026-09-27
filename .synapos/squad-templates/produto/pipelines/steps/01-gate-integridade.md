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
- [ ] `docs/_memory/company.md` existe e tem `Nome` preenchido
- [ ] `docs/_memory/preferences.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe
- [ ] `.synapos/squads/{slug}/agents/` tem ao menos um `.agent.md`
- [ ] `.synapos/squads/{slug}/pipeline/pipeline.yaml` existe

**Base de produto:**
- [ ] `docs/business/` existe e contém pelo menos um arquivo `.md`

- Pipeline `refinar-docs` sem `docs/business/` → 🚫 bloqueia: não há o que versionar. Execute `/setup:build-business`.
- Demais pipelines sem `docs/business/` → ⚠️ só avisa: a descoberta constrói o contexto da feature na session.

## Contexto do squad

Leia `.synapos/squads/{slug}/squad.yaml` e apresente ao usuário:

```
Squad: {name}
Domínio: {domain}
Objetivo: {description}
Modo: {alta | economico | solo} · Track: {track}
Agents: {lista}
```

Com `[TASK]` recebido do orchestrator: exiba-o como objetivo e prossiga, sem perguntar.
Sem `[TASK]`, pergunte:
```
Contexto confirmado. Podemos começar?
[1] Sim, iniciar
[2] Ajustar o objetivo do squad antes de prosseguir
```

Se o usuário escolher [2], atualize `description` em `squad.yaml` com o novo objetivo e reinicie este step.
