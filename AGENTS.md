# Synapos Runtime — Codex Mode

> Este projeto usa o **Synapos Framework**. Você está operando como executor do Synapos no modo Codex CLI.
> Protocolo completo: `.synapos/core/orchestrator.md`

---

## REGRAS OBRIGATÓRIAS

Estas regras são ativas em **toda** interação, sem exceção:

1. **Nunca execute sem contexto mínimo** — leia `docs/_memory/company.md` antes de qualquer ação significativa. Se não existir, inicie o onboarding via `.synapos/core/orchestrator.md`.
2. **Nunca tome decisões autônomas** — escolha de biblioteca, arquitetura, padrão ou escopo não definida pelo projeto → `[DECISÃO PENDENTE]` (ou `[?]`) com opções e recomendação; aguarde o usuário. Sinais de controle: `.synapos/core/compliance-protocol.md`.
3. **ADR ativa é regra** — consulte `docs/_memory/adr-index.md` (ou as ADRs em `docs/adrs/`, `docs/adr/`, `docs/tech/adr/`) antes de decidir. Conflito → `[ADR-CONFLICT]`, bloqueio até aprovação. Vale em todos os tracks.
4. **Observe antes de criar** — reutilize padrão, componente ou módulo existente antes de criar algo novo; novo exige justificativa. Use skills relevantes (`skills/`, `.synapos/skills/`, índice em `docs/_memory/skills-index.md`).
5. **Memória por recuperação** — carregue só o que a decisão precisa (`.synapos/core/context-engine.md`). Estado da feature em `docs/.squads/sessions/{feature-slug}/`.
6. **Nunca escreva dentro de `.synapos/`** — essa pasta é somente do framework (exceção: `.synapos/squads/`, criado por `/setup:squad`).

---

## COMANDOS DISPONÍVEIS

Ative digitando o comando na conversa:

| Comando | Ação |
|---------|------|
| `synapos:init` | Iniciar ou retomar o orquestrador Synapos |
| `synapos:session` | Listar sessions ativas e navegar contexto de features |
| `synapos:session slug:{feature}` | Abrir session específica com resumo de context.md |
| `synapos:session consolidate` | Consolidar memories.md e review-notes.md manualmente |
| `synapos:squad squad:{domínio} mode:{modo} pipeline:{pipeline}` | Criar e ativar um role |
| `synapos:step step:{id}` | Executar um step específico do pipeline ativo |
| `synapos:gate gate:{GATE-N}` | Executar validação de um gate |
| `synapos:status` | Exibir estado do role e session ativos |
| `synapos:memory` | Exibir memória da feature ativa |

**Exemplos:**
```
synapos:init
synapos:session
synapos:session slug:auth-module
synapos:squad squad:frontend mode:quick pipeline:bug-fix
synapos:step step:01-gate-integridade
```

---

## TRACKS DE EXECUÇÃO

| Track | Quando | Fluxo |
|-------|--------|-------|
| `quick` | Mudança localizada, sem decisão nova | contexto → role → skills → executar → revisar (sem squad/session) |
| `standard` | Feature/bug em território conhecido | investigação → padrões → arquitetura → implementação → review |
| `complex` | Ideia vaga, capacidade nova, impacto em ADR | produto (brainstorm → requisitos → spec) → arquitetura → plano → dev → review |

O track é definido pela triagem da tarefa (orchestrator PASSO 2.5). Veja `.synapos/core/orchestrator.md` para a lógica completa.

---

## ADAPTAÇÕES CODEX

No Codex Mode, as seguintes substituições estão ativas:

- **`AskUserQuestion`** → Apresente opções numeradas no terminal e aguarde a escolha
- **`execution: subagent`** → Execute inline na conversa atual
- **`execution: checkpoint`** → Apresente checklist e aguarde confirmação explícita
- **Gates automáticos** → Execute como checklist ao final do output

---

## CONTEXTO DO PROJETO

<!-- SYNAPOS: CONTEXT START -->
> Preenchido pelo `synapos:init` ou pelo usuário.
> Para projetos com docs, este bloco é substituído pelo contexto real de `docs/_memory/company.md`.
<!-- SYNAPOS: CONTEXT END -->
