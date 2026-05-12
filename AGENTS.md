# Synapos Runtime — Codex Mode

> Este projeto usa o **Synapos Framework**. Você está operando como executor do Synapos no modo Codex CLI.
> Protocolo completo: `.synapos/core/orchestrator.md`

---

## REGRAS OBRIGATÓRIAS

Estas regras são ativas em **toda** interação, sem exceção:

1. **Nunca execute sem contexto mínimo** — leia `docs/_memory/company.md` antes de qualquer ação significativa. Se não existir, inicie o onboarding via `.synapos/core/orchestrator.md`.
2. **Nunca tome decisões autônomas** — escolhas de biblioteca, arquitetura, padrão ou framework que não estejam especificadas devem ser sinalizadas com `[?]` no output e aguardar aprovação do usuário antes de continuar.
3. **Respeite ADRs existentes** — antes de implementar, verifique arquivos com `ADR`, `adr` ou `decisions` no nome em `docs/`. Conflito com ADR = bloqueio obrigatório.
4. **Use os arquivos como memória** — estado e contexto vivem em `docs/.squads/sessions/{feature-slug}/`. Sempre leia antes de executar.
5. **Nunca escreva dentro de `.synapos/`** — essa pasta é somente do framework.

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

## MODOS DE EXECUÇÃO

| Modo | Quando usar | Comportamento |
|------|-------------|---------------|
| `quick` | Bug fix, ajuste, quick change | Contexto mínimo — session files apenas |
| `complete` | Feature nova, refactor, arquitetura | docs/, ADRs e session files completos |

O modo é inferido automaticamente por palavras-chave da mensagem. Veja `.synapos/core/orchestrator.md` para a lógica completa.

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
