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
| `.synapos/core/skills-engine.md` | Descoberta, seleção e aplicação de skills |
| `.synapos/core/context-engine.md` | Memória em camadas, recuperação de contexto e invalidação |
| `.synapos/core/compliance-protocol.md` | Ordem de autoridade, sinais de controle, ADR CHECK |
| `.synapos/core/model-adapter.md` | Adaptação de prompts para modelos de capacidade inferior |
| `.synapos/core/copilot-adapter.md` | Adaptações para IDEs sem suporte nativo a subagentes |
| `docs/_memory/company.md` | Perfil do projeto — nome, setor, linguagem de saída |
| `docs/_memory/preferences.md` | Preferências — IDE, modelo, task tracker, capability |
| `docs/_memory/project-memory.md` | Memória global tipada (regras, decisões, padrões, aprendizados) |
| `docs/_memory/adr-index.md` · `skills-index.md` | Índices — 1 linha por ADR/skill |
| `docs/_memory/roles/{domain}.md` | Padrões descobertos por domínio (ex: UI map do frontend) |

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

## TRACKS DE EXECUÇÃO

| Track | Quando | Fluxo |
|-------|--------|-------|
| `quick` | Mudança localizada, sem decisão nova | contexto → role → skills → executar → revisar (sem squad/session) |
| `standard` | Feature/bug em território conhecido | investigação → padrões → arquitetura → implementação → review |
| `complex` | Ideia vaga, capacidade nova, impacto em ADR | produto (brainstorm → requisitos → spec) → arquitetura → plano → dev → review |

O track é definido pela triagem da tarefa (orchestrator PASSO 2.5). Veja `.synapos/core/orchestrator.md` para a lógica completa.

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
│   ├── stack.md · project-memory.md
│   ├── adr-index.md · skills-index.md
│   └── roles/{domain}.md
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
