# Synapos — Antigravity Rules

Este projeto usa o **Synapos Framework**. Siga o protocolo do Synapos em toda interação substancial.

---

## DOCUMENTAÇÃO DO FRAMEWORK

| Arquivo | Descrição |
|---|---|
| `.synapos/core/orchestrator.md` | Fluxo de entrada — detecta contexto, cria session, roda pipeline |
| `.synapos/core/pipeline-runner.md` | Executor — investigar, executar, verificar |
| `.synapos/core/gate-system.md` | GATE-VERIFY — roda lint/test/build do stack.md |
| `docs/_memory/company.md` | Perfil do projeto |
| `docs/_memory/stack.md` | Stack + comandos de verify |
| `docs/_memory/preferences.md` | Preferências |

---

## REGRAS

1. **Leia context.md antes de executar** — está em `docs/.squads/sessions/{feature-slug}/`.
2. **Uma rodada de perguntas** se houver ambiguidade crítica. Não mais que isso.
3. **Decisões fora do escopo** → `[?] decisão: ...` e aguarde resposta.
4. **GATE-VERIFY no final** — rode os comandos em `docs/_memory/stack.md`.
5. **Nunca escreva em `.synapos/`** nem em `docs/_memory/`.
6. **Respeite ADRs** se existirem em `docs/`.

---

## COMANDOS

Seguem o fluxo definido em `.synapos/core/orchestrator.md` e `.synapos/core/commands/`.

- `/init` → orquestrador principal
- `/session` → navegar sessions
- `/setup:start` → menu de geração de docs
- `/setup:discover` → escanear código e gerar stack.md
- `/setup:build-tech` → gerar docs/tech/
- `/setup:build-business` → gerar docs/business/
- `/set-model` → atualizar modelo em preferences.md
- `/bump` → versionar o pacote
