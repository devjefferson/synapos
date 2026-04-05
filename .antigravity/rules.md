# Synapos Runtime — Antigravity Mode

> Este projeto usa o **Synapos Framework**. Você está operando como executor do Synapos no modo Antigravity.
> Protocolo completo: `.synapos/core/orchestrator.md`

---

## DOCUMENTAÇÃO DO FRAMEWORK

Leia os arquivos abaixo antes de executar qualquer ação significativa. Eles definem todo o comportamento esperado:

| Arquivo | Descrição |
|---------|-----------|
| `.synapos/core/orchestrator.md` | Orquestrador principal — fluxo de ativação, modos, squads e sessions |
| `.synapos/core/pipeline-runner.md` | Executor de pipelines — fases, gates, steps e injeção de contexto |
| `.synapos/core/gate-system.md` | Sistema de gates — validações obrigatórias entre steps |
| `.synapos/core/skills-engine.md` | Engine de skills — MCP, scripts e instruções de comportamento |
| `.synapos/core/model-adapter.md` | Adaptação de prompts para modelos de capacidade inferior |
| `.synapos/core/copilot-adapter.md` | Adaptações para IDEs sem suporte nativo a subagentes |
| `docs/_memory/company.md` | Perfil do projeto — nome, setor, linguagem de saída |
| `docs/_memory/preferences.md` | Preferências — IDE, modelo, task tracker, capability |
| `docs/_memory/project-learnings.md` | Aprendizados transversais compartilhados entre todos os squads |

---

## REGRAS OBRIGATÓRIAS

Estas regras são ativas em **toda** interação, sem exceção:

1. **Nunca execute sem contexto mínimo** — leia `docs/_memory/company.md` antes de qualquer ação significativa. Se não existir, inicie o onboarding via `.synapos/core/orchestrator.md`.
2. **Nunca tome decisões autônomas** — escolhas de biblioteca, arquitetura, padrão ou framework que não estejam especificadas devem ser sinalizadas com `[?]` no output e aguardar aprovação do usuário antes de continuar.
3. **Respeite ADRs existentes** — antes de implementar, verifique arquivos com `ADR`, `adr` ou `decisions` no nome em `docs/`. Conflito com ADR = bloqueio obrigatório.
4. **Use os arquivos como memória** — estado e contexto vivem em `docs/.squads/sessions/{feature-slug}/`. Sempre leia antes de executar.
5. **Nunca escreva dentro de `.synapos/`** — essa pasta é somente do framework.

---

## WORKFLOWS DISPONÍVEIS

Ative via painel de workflows do Antigravity:

| Workflow | Ação |
|----------|------|
| `/init` | Iniciar ou retomar o orquestrador Synapos |
| `/session` | Listar sessions ativas e navegar contexto de features |
| `/session {slug}` | Abrir session específica com resumo de context.md |
| `/session consolidate` | Consolidar memories.md e review-notes.md manualmente |
| `/bump` | Versionar o pacote npm do framework |
| `/set-model` | Configurar o modelo de IA utilizado |
| `/setup:start` | Orquestrador de documentação — analisa o projeto e guia a criação de docs/ |
| `/setup:build-tech` | Gerar documentação técnica do projeto |
| `/setup:build-business` | Gerar documentação de contexto de negócio |
| `/setup:discover` | Project Discovery & Context Mapping |

---

## MODOS DE EXECUÇÃO

| Modo | Quando usar | Comportamento |
|------|-------------|---------------|
| `quick` | Bug fix, ajuste, quick change | Contexto mínimo — session files apenas |
| `complete` | Feature nova, refactor, arquitetura | docs/, ADRs e session files completos |

O modo é inferido automaticamente por palavras-chave da mensagem. Veja `.synapos/core/orchestrator.md` para a lógica completa.

---

## ESTRUTURA DO PROJETO

```
.synapos/
├── core/               ← Protocolos do framework (não editar)
│   ├── orchestrator.md
│   ├── pipeline-runner.md
│   ├── gate-system.md
│   ├── skills-engine.md
│   ├── model-adapter.md
│   └── commands/       ← Protocolos de cada workflow
├── squad-templates/    ← Templates de squads disponíveis
├── squads/             ← Squads ativos do projeto
└── skills/             ← Skills instaladas

docs/
├── _memory/            ← Contexto persistente do projeto
│   ├── company.md
│   ├── preferences.md
│   └── project-learnings.md
├── .squads/sessions/   ← Sessions de features
│   └── {feature-slug}/
│       ├── context.md
│       ├── architecture.md
│       ├── plan.md
│       ├── memories.md
│       └── review-notes.md
├── business/           ← Documentação de negócio
└── tech/               ← Documentação técnica
```

---

## CONTEXTO DO PROJETO

<!-- SYNAPOS: CONTEXT START -->
> Preenchido pelo `/init` ou pelo usuário.
> Para projetos com docs, este bloco é substituído pelo contexto real de `docs/_memory/company.md`.
<!-- SYNAPOS: CONTEXT END -->
