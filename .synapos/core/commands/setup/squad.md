---
name: setup-squad
version: 1.0.0
description: Cria um novo role (squad) — modo, domínio, configuração e arquivos
---

# SETUP:SQUAD — Criação de Role

> Invocado pelo orchestrator quando não há squad ativo ou o usuário escolhe "✨ Novo role".
> Recebe contexto já carregado pelo orchestrator (não relê company.md, stack.md, preferences.md).
> Ao concluir, retorna ao orchestrator para PASSO 8 (ativação).

---

## PASSO 1 — INFERIR MODO

Tente inferir da mensagem inicial do usuário:

| Sinal | Modo |
|---|---|
| "fix", "bug", "typo", "quick", "ajuste" | `quick` |
| "feature", "arquitetura", "refactor", "sistema", "integração" | `complete` |
| Nenhum sinal claro | perguntar |

Se não for possível inferir:

```
AskUserQuestion({
  question: "Como você quer executar?",
  options: [
    { label: "⚡ Rápido", description: "Executa direto, sem ler documentação do projeto" },
    { label: "🔵 Completo", description: "Lê docs/, injeta ADRs e contexto completo" }
  ]
})
```

Armazene como `[EXECUTION_MODE]` (`quick` / `complete`).

| Modo | O que injeta | Gates ativos |
|---|---|---|
| `quick` | company.md + session files | GATE-0, GATE-3, GATE-5 |
| `complete` | Tudo — docs/, ADRs, session files | GATE-0, GATE-3, GATE-5 |

Log único ao definir: `⚡ Modo Rápido` ou `🔵 Modo Completo`.

---

## PASSO 2 — SELECIONAR DOMÍNIO

Tente inferir da mensagem inicial:

| Sinal | Role |
|---|---|
| "backend", "API", "endpoint", "banco" | `backend` |
| "frontend", "tela", "componente", "UI" | `frontend` |
| "mobile", "app", "iOS", "Android" | `mobile` |
| "infra", "deploy", "CI/CD", "Docker" | `devops` |
| "produto", "spec", "PRD", "discovery" | `produto` |
| "dados", "modelo", "ML", "pipeline de dados" | `ia-dados` |
| Nenhum sinal claro | perguntar |

Se não for possível inferir, faça os seguintes passos **antes** de perguntar:

1. Liste todos os subdiretórios de `.synapos/squad-templates/` — cada um é um template disponível.
2. Para cada template, leia `template.yaml` e extraia: `icon`, `displayName`, `description`.
3. Ordene os templates em ordem alfabética pelo `name` (nome do diretório).
4. Apresente como **lista numerada em markdown** — `AskUserQuestion` suporta no máximo 4 opções e seria truncado. Peça ao usuário que responda digitando o número:

```
Escolha o squad digitando o número:

1. {icon} {displayName} — {description}
2. {icon} {displayName} — {description}
... (um por template, em ordem alfabética)
N. ✨ Customizado — Monte seu próprio role
```

Aguarde o usuário digitar um número e use-o para identificar o template selecionado.

> **Nunca omita templates.** Se `.synapos/squad-templates/` tiver 8 diretórios, a lista deve ter 8 linhas + Customizado. Templates adicionados futuramente aparecem automaticamente.

**Roteamento:**
- Template existente → PASSO 3
- "✨ Customizado" → leia `.synapos/core/role-custom.md` e siga. Ao concluir, retorne ao orchestrator para PASSO 8.

---

## PASSO 3 — CONFIGURAR ROLE

Leia o template: `.synapos/squad-templates/{domínio}/template.yaml`.

### Comportamento por modo

| | Rápido (`quick`) | Completo (`complete`) |
|---|---|---|
| Agents opcionais | não apresenta | apresenta |
| Modo de performance | fixado em `solo` | apresenta opções |
| `execution_mode` no squad.yaml | `quick` | `complete` |

### Modo Rápido: defaults automáticas

- Agents: apenas base do template
- Modo: `solo`
- Nome: auto-gerado `{domínio}-{NNN}`

Log: `⚡ Role criado com defaults (solo, agents base)`

### Modo Completo: pergunte (máximo 1 AskUserQuestion)

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
execution_mode: {quick | complete}
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
  default: {id do pipeline padrão}
  file: pipeline/pipeline.yaml
project_context:
  company: docs/_memory/company.md
  docs_business: docs/business/
  docs_tech: docs/tech/
  docs_context: docs/tech-context/
  session: ""      # preenchido em 4.4
```

### 4.3 — Inicializar project-learnings.md (se não existir)

Verifique se `docs/_memory/project-learnings.md` existe. Se não, crie:

```markdown
# Aprendizados do Projeto

> Aprendizados transversais compartilhados por todos os squads deste projeto.
> Atualizado automaticamente ao final de cada pipeline.

(preenchido durante execuções)
```

### 4.4 — Feature session

Liste as pastas em `docs/.squads/sessions/`.

| Sessions existentes | Ação |
|---|---|
| 0 | Criar nova automaticamente (slug inferido da descrição do squad) |
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

Ao finalizar os 4 passos, retorne ao **orchestrator — PASSO 8** passando:
- Squad recém-criado (slug, modo, agents, pipeline)
- `[EXECUTION_MODE]`
