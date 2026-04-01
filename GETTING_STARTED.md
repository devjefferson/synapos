# Synapos — Getting Started

> Guia rápido para começar a usar o Synapos Framework v2.0+

---

## Por Onde Começar

Escolha o cenário que melhor descreve sua situação:

### Tenho um projeto existente com código

1. Execute `/init` no Claude Code — responda as perguntas de onboarding (empresa, IDE, modelo, task tracker)
2. Execute `/setup:build-tech` → analisa o codebase e gera `docs/tech/` (stack, ADRs, arquitetura)
3. Execute `/setup:build-business` → entrevista sobre o produto e gera `docs/business/`
4. Execute `/init` novamente → GATE-0 vai passar
5. Escolha seu squad:
   - Backend API → Squad `engineer` ou `backend`
   - Frontend UI → Squad `frontend`
   - Produto/Discovery → Squad `produto`

**Atalho:** Se só quer documentação técnica (sem contexto de negócio), pode pular `/setup:build-business` e usar Modo Solo.

---

### Estou começando um produto do zero

1. Execute `/init`
2. Execute `/setup:build-business` → define visão, personas, concorrentes, OKRs
3. Execute `/setup:build-tech` → define stack, arquitetura inicial, primeiras ADRs
4. Escolha **Squad de Produto** → pipeline `discovery-spec-handoff` para a primeira feature
5. Após o handoff, escolha Squad `engineer` ou `frontend` para implementação

---

### Tenho uma task específica no backlog

1. Execute `/init` (se primeira vez: complete onboarding)
2. Se `docs/` já existe → GATE-0 passa automaticamente
3. Escolha seu squad → **Modo Econômico** → pipeline `quick-spec` ou `quick-fix`
4. Para features bem definidas: `quick-spec` (spec + handoff em 2 steps)
5. Para bugs e ajustes: `quick-fix` (contexto + execução + registro)

---

### Sou dev solo sem documentação

1. Execute `/init`
2. Escolha **Modo Solo** → GATE-0 passa com aviso (não bloqueia)
3. Crie documentação quando conveniente: `/setup:build-business` e `/setup:build-tech`
4. Use `quick-fix` para tarefas pontuais sem overhead de discovery

---

## O GATE-0 Bloqueou — O Que Fazer

GATE-0 verifica a existência de documentação mínima. Se bloqueou:

| Item faltando | Comando para resolver |
|---------------|----------------------|
| `docs/_memory/company.md` | `/init` (onboarding cria automaticamente) |
| `docs/` vazia | `/setup:build-business` e/ou `/setup:build-tech` |
| `docs/` sem nenhum `.md` | `/setup:build-tech` (mínimo necessário) |

**Modo Solo ignora GATE-0** (avisa mas não bloqueia). Use quando quiser avançar sem documentação completa.

---

## Qual Modo Escolher

| Cenário | Modo |
|---------|------|
| Nova feature crítica para produção | **Alta Performance** |
| Feature estratégica com risco de negócio | **Alta Performance** |
| Hotfix ou bugfix simples | **Econômico** |
| Feature incremental com contexto já mapeado | **Econômico** |
| Quick spec para feature bem definida | **Econômico** |
| Prototipação ou exploração | **Solo** |
| Dev solo sem prazo | **Solo** |
| Refatoração sem mudança de comportamento | **Econômico** |
| Mudança pontual de UI (texto, ajuste visual) | **Solo** |

**Regra geral:** Em caso de dúvida entre Econômico e Alta, prefira Econômico — você pode reexecutar em Alta depois.

---

## Qual Pipeline Escolher

| Situação | Pipeline |
|----------|----------|
| Discovery completo de feature nova | `discovery-spec-handoff` (produto) |
| Feature com spec clara, sem discovery | `quick-spec` (produto) |
| Ajuste pontual bem definido | `quick-fix` (qualquer squad) |
| Desenvolvimento de feature técnica | `feature-development` (engineer/backend/frontend) |
| Bug com diagnóstico necessário | `bug-fix` (backend/frontend) |
| Componente React/UI isolado | `component-development` (frontend) |
| API nova ou migração de banco | `api-development` / `database-migration` (backend) |

---

## Entendendo a Session de Feature

Toda execução de squad gera artefatos em `docs/.squads/sessions/{feature-slug}/`:

```
docs/.squads/sessions/minha-feature/
├── context.md          ← investigação: objetivos, motivação, ADRs relevantes
├── architecture.md     ← decisões arquiteturais e componentes afetados
├── plan.md             ← fases de execução com agents e estimativas
├── visual-spec.md      ← especificação visual e design system (se aplicável)
├── spec.md             ← especificação funcional (squad produto)
├── memories.md         ← aprendizados acumulados (append-only)
├── review-notes.md     ← notas de revisão (append-only)
├── open-decisions.md   ← decisões pendentes de escalation
├── state.json          ← estado de todos os squads nesta feature
└── pending-approvals.md ← checkpoints aguardando aprovação assíncrona
```

Múltiplos squads compartilham a mesma pasta de session — não há duplicação de contexto.

---

## Breaking Changes v1 → v2

Se você usava Synapos v1.x, veja o guia de migração em [.synapos/core/commands/migrate/v1-to-v2.md](.synapos/core/commands/migrate/v1-to-v2.md).

---

## Referências

- [CHANGELOG.md](CHANGELOG.md) — histórico completo de versões
- [.synapos/core/orchestrator.md](.synapos/core/orchestrator.md) — fluxo de init e criação de squads
- [.synapos/core/gate-system.md](.synapos/core/gate-system.md) — todos os gates disponíveis
- [.synapos/core/pipeline-runner.md](.synapos/core/pipeline-runner.md) — como os pipelines são executados
