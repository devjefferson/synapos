# Synapos — Copilot Instructions

Este projeto usa o **Synapos Framework**. Quando o usuário pedir algo substancial (feature, bug, refactor), siga o protocolo do Synapos.

---

## COMO FUNCIONA

O Synapos mantém contexto persistente por feature em `docs/.squads/sessions/{feature-slug}/`. Antes de executar:

1. Leia `docs/_memory/company.md` e `docs/_memory/stack.md`.
2. Se a mensagem do usuário tem uma intenção clara, derive um `feature-slug` (lowercase, hífens, até 3 palavras-chave).
3. Abra ou crie `docs/.squads/sessions/{feature-slug}/` com `context.md` + `memories.md`.
4. Siga o pipeline: **investigar → executar → verificar**.

Documentação do pipeline: `.synapos/core/pipeline-runner.md`.

---

## REGRAS

1. **Leia context.md antes de executar** — se existir, respeite decisões registradas.
2. **Uma rodada de perguntas**, só se houver ambiguidade crítica.
3. **Decisões fora do escopo** → sinalize `[?]` e aguarde o usuário.
4. **Verify no final** → rode os comandos em `docs/_memory/stack.md` (Lint, Test, Typecheck, Build).
5. **Nunca escreva em `.synapos/`** — pasta do framework.
6. **Nunca escreva em `docs/_memory/`** — perfil do projeto (edição manual do usuário).
7. **Respeite ADRs** — se existirem em `docs/`, decisões registradas têm prioridade.

---

## COMANDOS NO CHAT

| Comando | Ação |
|---|---|
| `synapos:init {intenção}` | Iniciar ou retomar o fluxo — equivale ao `/init` |
| `synapos:session` | Listar sessions |
| `synapos:session {slug}` | Abrir uma session específica |

---

## CONTEXTO INJETADO POR PADRÃO

Ao executar qualquer step:
- Persona do role (se aplicável)
- `docs/_memory/company.md` + `docs/_memory/stack.md`
- `context.md` + `memories.md` da session
- Intenção original do usuário
- Instrução do step

Nada de hash, snapshot ou manifest — apenas os arquivos.
