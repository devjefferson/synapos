---
name: setup-squad
version: 1.0.0
description: Cria um novo role (squad) — modo, domínio, configuração e arquivos
---

# SETUP:SQUAD — Criação de Role

> Invocado pelo orchestrator quando não há squad ativo ou o usuário escolhe "✨ Novo role".
> Recebe contexto já carregado pelo orchestrator (não relê company.md, stack.md, preferences.md).
> Ao concluir, retorna ao orchestrator para PASSO 5 (ativação).

---

## PASSO 1 — TRACK

Use `[TRACK]` da triagem do orchestrator (PASSO 2.5). Se ausente, aplique a triagem agora sobre a descrição do usuário — não pergunte "rápido ou completo".

| Track | Profundidade | Gates |
|---|---|---|
| `quick` | fast lane / quick-fix | ver gate-system.md |
| `standard` | pré-execução (investigação → padrões → arquitetura) + pipeline do domínio | ver gate-system.md |
| `complex` | produto primeiro (se não há spec) + pré-execução completa (com plano) | ver gate-system.md |

Log único: `🧭 Track {track}`.

---

## PASSO 2 — SELECIONAR DOMÍNIO

**Antes de qualquer inferência**, liste os subdiretórios de `.synapos/squad-templates/` e carregue o `template.yaml` de cada um (extraindo `icon`, `displayName`, `description`, e quaisquer palavras-chave de sinal que o yaml exponha). Esses são os **únicos templates disponíveis** — ignore qualquer domínio que não esteja instalado.

Com os templates carregados, infira o domínio pela tarefa (`[TASK]`): área/arquivos que ela toca e o `description` de cada template. Track `complex` sem `spec.md`/`handoff.md` na session → domínio `produto`. Se o template inferido não existir em `.synapos/squad-templates/`, trate como "nenhum sinal claro".

Se não for possível inferir, apresente como **lista numerada em markdown** — `AskUserQuestion` suporta no máximo 4 opções e seria truncado. Peça ao usuário que responda digitando o número:

```
Escolha o squad digitando o número:

1. {icon} {displayName} — {description}
2. {icon} {displayName} — {description}
... (um por template instalado, em ordem alfabética)
N. ✨ Customizado — Monte seu próprio role
```

Aguarde o usuário digitar um número e use-o para identificar o template selecionado.

> **Nunca omita templates instalados.** Se `.synapos/squad-templates/` tiver 3 diretórios, a lista deve ter 3 linhas + Customizado. Templates adicionados futuramente aparecem automaticamente.

**Roteamento:**
- Template existente → PASSO 3
- "✨ Customizado" → leia `.synapos/core/role-custom.md` e siga. Ao concluir, retorne ao orchestrator para PASSO 5.

---

## PASSO 3 — CONFIGURAR ROLE

Leia o template: `.synapos/squad-templates/{domínio}/template.yaml`.

### Comportamento por modo

| | `quick` | `standard` / `complex` |
|---|---|---|
| Agents opcionais | não apresenta | apresenta |
| Modo de performance | fixado em `solo` | apresenta opções |
| `execution_mode` no squad.yaml | `quick` | `standard` / `complex` |

### Track quick: defaults automáticas

- Agents: apenas base do template
- Modo: `solo`
- Nome: auto-gerado `{domínio}-{NNN}`

Log: `⚡ Role criado com defaults (solo, agents base)`

### Tracks standard/complex: pergunte (máximo 1 AskUserQuestion)

```
AskUserQuestion({
  question: "Role: {displayName}\n\nQuer usar defaults ou customizar?",
  options: [
    { label: "✅ Defaults", description: "Agents base + solo + auto-nome" },
    { label: "🔧 Customizar", description: "Escolher agents, modo, nome" }
  ]
})
```

> Agents base são sempre incluídos.
> **Agents exigidos pelo pipeline:** inclua automaticamente todo agent referenciado por um step do pipeline escolhido que não tenha `skip_condition` sobre a ausência dele (ex: review que usa um agent opcional).

**Pipeline:** `pipeline.default` do squad = o escolhido pela triagem — `complex` + produto → `discovery-spec-handoff`; bug → `bug-fix`; `quick` numa session → `quick-fix`; demais → `default` do template.
> Auto-nome: `{domínio}-{NNN}` → backend-001, frontend-002.

---

## PASSO 4 — CRIAR ROLE + FEATURE SESSION

### 4.1 — Estrutura de arquivos

```
.synapos/squads/{squad-slug}/          ← configuração do role (framework)
├── squad.yaml
├── agents/
│   └── (copiar os .agent.md selecionados do template)
└── pipeline/
    ├── pipeline.yaml
    └── steps/

docs/.squads/sessions/{feature-slug}/  ← session (criada pelo pipeline-runner na 1ª execução)
├── context.md
├── architecture.md
├── plan.md
├── memories.md
├── review-notes.md
└── state.json
```

### 4.2 — Gerar squad.yaml

```yaml
name: {squad-slug}
domain: {domínio}
displayName: "{displayName do template}"
description: "{contexto do squad nesta feature}"
status: active
mode: {alta | economico | solo}
execution_mode: {quick | standard | complex}   # legado: complete = standard
created_at: {YYYY-MM-DD}
feature: ""        # preenchido em 4.4
session: ""        # preenchido em 4.4
roles:
  - {papel 1}
  - {papel 2}
agents:
  - {id do agent 1}
  - {id do agent 2}
pipeline:
  default: {id do pipeline escolhido pelo track}
  file: pipeline/pipeline.yaml
pre_pipeline:                # copiado do template.yaml — sem esta chave a pré-execução não roda
  available: {template.pre_pipeline.available}
  agent: {template.pre_pipeline.agent}
project_context:
  company: docs/_memory/company.md
  docs_business: docs/business/
  docs_tech: docs/tech/
  docs_context: docs/tech-context/
  session: ""      # preenchido em 4.4
```

### 4.3 — Memória global

Não crie arquivos de memória vazios. `docs/_memory/project-memory.md`, `adr-index.md`, `skills-index.md` e `roles/{domain}.md` são criados quando há conteúdo real (context-engine.md §6).
`project-learnings.md` existente (legado) continua sendo lido.

### 4.4 — Feature session

Liste as pastas em `docs/.squads/sessions/`.

| Sessions existentes | Ação |
|---|---|
| 0 | Criar nova automaticamente (slug inferido de `[TASK]`) |
| 1 | Usar a existente automaticamente |
| 2+ | Perguntar qual usar |

**Pergunta para 2+ sessions:**

```
AskUserQuestion({
  question: "Role {squad-slug} ativado! 🎉\n\nFeature session:",
  options: [
    { label: "✨ Nova: {auto-slug}", description: "Criar nova feature" },
    { label: "📂 {feature-1}", description: "Usar session existente" }
    // ... uma por session
  ]
})
```

`{feature-slug}` = lowercase, espaços → hífens, sem caracteres especiais.

Após resolver, atualize `feature` e `session` no `squad.yaml`.

---

## CONCLUSÃO

Ao finalizar os 4 passos, retorne ao **orchestrator — PASSO 5** passando:
- Squad recém-criado (slug, modo, agents, pipeline)
- `[TRACK]`
