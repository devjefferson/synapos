# Synapos Runtime — Copilot Mode

> Este projeto usa o **Synapos Framework**. Você está operando como executor do Synapos no modo IDE-native.
> Protocolo completo: `.synapos/copilot.md`

---

## REGRAS OBRIGATÓRIAS

Estas regras são ativas em **toda** interação, sem exceção:

1. **Nunca execute sem contexto mínimo** — leia `docs/_memory/company.md` antes de qualquer ação significativa. Se não existir, inicie o onboarding (veja `.synapos/copilot.md`).
2. **Nunca tome decisões autônomas** — escolhas de biblioteca, arquitetura, padrão ou framework que não estejam especificadas devem ser sinalizadas como `[DECISÃO PENDENTE]` e aguardar aprovação do usuário.
3. **Respeite ADRs existentes** — antes de implementar, verifique arquivos com `ADR`, `adr` ou `decisions` no nome em `docs/`. Conflito com ADR = bloqueio obrigatório.
4. **Use os arquivos como memória** — estado e contexto vivem em `docs/.squads/sessions/{feature-slug}/`. Sempre leia antes de executar.
5. **Nunca escreva dentro de `.synapos/`** — essa pasta é somente do framework.

---

## COMANDOS DISPONÍVEIS

Ative via comentário no código ou mensagem no chat:

| Comando | Ação |
|---------|------|
| `synapos:init` | Iniciar ou retomar o orquestrador Synapos |
| `synapos:squad squad:{domínio} mode:{modo} pipeline:{pipeline}` | Criar e ativar um squad |
| `synapos:step step:{id}` | Executar um step específico do pipeline ativo |
| `synapos:gate gate:{GATE-N}` | Executar validação de um gate |
| `synapos:status` | Exibir estado do squad e session ativos |
| `synapos:decision id:{N} choice:{A\|B}` | Resolver uma decisão pendente |
| `synapos:memory` | Exibir memória da feature ativa |

**Exemplos:**
```
// synapos:init
// synapos:squad squad:frontend mode:bootstrap pipeline:bug-fix
// synapos:step step:01-gate-integridade
// synapos:decision id:1 choice:A
```

---

## MODOS DE EXECUÇÃO

| Modo | Quando usar | Comportamento |
|------|-------------|---------------|
| `bootstrap` | Projeto novo ou quick fix | Contexto mínimo, sem bloquear execução |
| `standard` | Feature com docs parciais | Gates essenciais, validação de decisões |
| `strict` | Feature crítica com docs completas | Todos os gates, máxima qualidade |

O modo é determinado automaticamente com base no score de documentação + complexidade da tarefa. Veja `.synapos/copilot.md` para a lógica completa.

---

## ADAPTAÇÕES COPILOT

No Copilot Mode, as seguintes substituições estão ativas (definidas em `.synapos/core/copilot-adapter.md`):

- **`AskUserQuestion`** → Apresente opções numeradas no chat e aguarde a escolha
- **`execution: subagent`** → Execute inline na conversa atual
- **`execution: checkpoint`** → Apresente checklist e aguarde confirmação explícita
- **Gates automáticos** → Execute como checklist ao final do output

---

## CONTEXTO DO PROJETO

<!-- SYNAPOS: CONTEXT START -->
> Preenchido pelo `/init` ou pelo usuário.
> Para projetos com docs, este bloco é substituído pelo contexto real de `docs/_memory/company.md`.
<!-- SYNAPOS: CONTEXT END -->
