---
name: synapos-orchestrator
version: 2.8.0
description: Meta-orquestrador do Synapos — roteamento para roles e pipelines
---

# SYNAPOS ORCHESTRATOR v2.8.0

> Workflow system para estruturar como você trabalha com IA em projetos reais.
> Integração: Claude Code.

---

## CONCEITO

**Synapos simula um squad com uma única IA que muda de papel.**
Arquivos como `squad.yaml`, conceitos como `agent`, `pipeline` e `role` são **papéis simulados** — não são processos paralelos nem múltiplas IAs reais.
O valor está na **mudança estruturada de perspectiva** (arquiteto → dev → revisor), não em orquestração multi-agente.

---

## COMANDOS DISPONÍVEIS

| Comando | O que faz |
|---------|-----------|
| `/init` | Ponto de entrada principal — ativa roles, cria sessions, executa pipelines |
| `/session` | Navega sessions, visualiza context.md e memories.md, consolida quando necessário |
| `/session {slug}` | Abre diretamente a session de uma feature |
| `/session consolidate` | Consolida memories.md e review-notes.md da session ativa |
| `/setup:build-tech` | Gera documentação técnica do projeto |
| `/setup:build-business` | Gera documentação de negócio do projeto |
| `/bump` | Versiona os arquivos do framework |

> Ao detectar `/session` ou `/session {slug}` na mensagem do usuário, redirecione imediatamente para `.synapos/core/commands/session.md`.
> Não execute o protocolo de ativação do /init nesse caso.

---

## REGRA GLOBAL — MENUS INTERATIVOS

Sempre que precisar apresentar opções ao usuário, use `AskUserQuestion` (botões clicáveis).
Nunca apresente menus como texto puro esperando que o usuário digite um número.
Para multi-seleção, instrua explicitamente: "Selecione uma ou mais opções".

---

## PROTOCOLO DE ATIVAÇÃO

Execute os passos abaixo na ordem. O fluxo tem **fast path**: sessões de retomada pulam diretamente para o menu sem configuração.

---

## PASSO 1 — CONTEXTO MÍNIMO

### 1.1 — Onboarding (só na primeira vez)

Verifique se `docs/_memory/company.md` existe.

- **Não existe** → leia `.synapos/core/onboarding.md` e siga aquele protocolo. Ao concluir, continue para 1.2.
- **Existe** → continue para 1.2.

### 1.2 — Carregar perfil e preferências

Leia `docs/_memory/company.md` e `docs/_memory/preferences.md` **uma única vez**.

Derive e armazene em memória (pipeline-runner recebe esses valores — nunca relê os arquivos):

```
[COMPANY_CONTEXT]  ← conteúdo completo de company.md
[MODELO_TIER]      ← model_capability (high | standard | lite). Padrão: high
[LINGUA]           ← linguagem de saída (pt-BR | en-US etc.)
[MODEL_NAME]       ← model_name (se disponível)
[TASK_TRACKER]     ← task_tracker (none | jira | linear | etc.). Padrão: none
```

### 1.3 — Stack (detectar ou carregar)

Verifique se `docs/_memory/stack.md` existe.

- **Não existe** → leia `.synapos/core/stack-detector.md`, siga o protocolo, depois carregue o resultado.
- **Existe** → leia **uma única vez** e armazene como `[STACK_CONTEXT]`. Log: `📦 [STACK] {linguagem} / {framework}`

Se o arquivo não existir nem após `stack-detector`, deixe `[STACK_CONTEXT]` vazio. O pipeline-runner emite o aviso apropriado.

### 1.4 — Migração v1 (só se detectado)

Se existir `docs/sessions/` ou `docs/.squads/*/output/*/`:
```
📦 Projeto com estrutura v1 detectada.
Para usar squads com a versão atual: /migrate:v1-to-v2
Sessions v1 existentes não serão afetadas.
```

---

## PASSO 2 — DETECTAR RETOMADA PRIORITÁRIA

Antes de qualquer outra escolha, varra `.synapos/squads/*/squad.yaml` e leia cada `docs/.squads/sessions/{feature-slug}/state.json`.

**Se existe algum squad com `status: running` em `state.squads[{squad}]`:**

```
AskUserQuestion({
  question: "⚠️ Execução anterior interrompida detectada\n\nSquad: {squad-slug}\nFeature: {feature-slug}\nÚltimo step: {suspended_at}\n\nO que você quer fazer?",
  options: [
    { label: "▶️ Retomar", description: "Continuar de onde parou ({suspended_at})" },
    { label: "🔄 Descartar e ir ao menu", description: "Marcar como descartada e escolher outro role" }
  ]
})
```

- **Retomar** → passe `resume_from: {suspended_at}` ao pipeline-runner. Pule para PASSO 8.3.
- **Descartar** → atualize `state.squads[{squad}].status = "discarded"` e continue para PASSO 3.

Se não houver squads `running`, continue para PASSO 3.

---

## PASSO 3 — ESCANEAR SQUADS E TEMPLATES

### 3.1 — Squads ativos

Para cada subdiretório em `.synapos/squads/` (ignorar `.gitkeep`), leia `squad.yaml` e extraia:
- `name`, `domain`, `status`, `description`, `created_at`, `displayName`

### 3.2 — Templates disponíveis

Verifique se existem subdiretórios em `.synapos/squad-templates/` (ignorar `.gitkeep`).
Armazene como `[HAS_TEMPLATES]` (true / false).

**Se `[HAS_TEMPLATES] = false` E não há squads ativos:**

```
AskUserQuestion({
  question: "⚠️ Nenhum squad template instalado.\n\nSem templates não é possível criar roles.\n\nTemplates disponíveis: backend, frontend, fullstack, mobile, devops, ia-dados, produto",
  options: [
    { label: "📦 Instalar templates", description: "npx synapos add <template>" },
    { label: "Encerrar", description: "Fechar o orquestrador" }
  ]
})
```

Pare após a ação do usuário.

---

## PASSO 4 — MENU PRINCIPAL

Se há squads ativos OU `[HAS_TEMPLATES] = true`, apresente o menu:

```
AskUserQuestion({
  question: "Qual role você quer ativar?",
  options: [
    { label: "🟢 {slug}", description: "{domain} · {description} (ativo)" },
    { label: "🟡 {slug}", description: "{domain} · {description} (pausado)" },
    // ✨ Novo role — incluir SOMENTE se [HAS_TEMPLATES] = true
  ]
})
```

**Status visual:**
- 🟢 active — role em andamento
- 🟡 paused — pausado, pode retomar
- ✅ completed — entregue

**Roteamento:**
- Squad existente selecionado → **CARREGAR SQUAD EXISTENTE** (seção abaixo)
- "✨ Novo role" → PASSO 5
- "✨ Customizado" (aparece em PASSO 5, não aqui)

**Se não há squads ativos E `[HAS_TEMPLATES] = true`** → vá direto para PASSO 5.

---

## PASSO 5 — INFERIR MODO E ROLE

### 5.1 — Modo (quick vs complete)

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

### 5.2 — Role (domínio do squad)

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

Se não for possível inferir, liste os templates e pergunte:

```
AskUserQuestion({
  question: "Escolha como quer atuar:",
  options: [
    { label: "{icon} {displayName}", description: "{description}" },
    // ... um por template instalado, em ordem alfabética
    { label: "✨ Customizado", description: "Monte seu próprio role" }
  ]
})
```

**Roteamento:**
- Template existente → PASSO 6
- "✨ Customizado" → leia `.synapos/core/role-custom.md` e siga. Depois pule para PASSO 8.

---

## PASSO 6 — CONFIGURAR ROLE

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

## PASSO 7 — CRIAR ROLE + FEATURE SESSION

### 7.1 — Estrutura de arquivos

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

### 7.2 — Gerar squad.yaml

```yaml
name: {squad-slug}
domain: {domínio}
displayName: "{displayName do template}"
description: "{contexto do squad nesta feature}"
status: active
mode: {alta | economico | solo}
execution_mode: {quick | complete}
created_at: {YYYY-MM-DD}
feature: ""        # preenchido em 7.4
session: ""        # preenchido em 7.4
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
  session: ""      # preenchido em 7.4
```

### 7.3 — Inicializar project-learnings.md (se não existir)

Verifique se `docs/_memory/project-learnings.md` existe. Se não, crie:

```markdown
# Aprendizados do Projeto

> Aprendizados transversais compartilhados por todos os squads deste projeto.
> Atualizado automaticamente ao final de cada pipeline.

(preenchido durante execuções)
```

### 7.4 — Feature session

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

## PASSO 8 — ATIVAR ROLE

### 8.1 — Resumo e confirmação

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Role {slug} criado! 🚀

Agents: {lista}
Modo: {modo}
Pipeline: {pipeline}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- **Modo Rápido** → iniciar direto: `⚡ Iniciando role {slug}...`
- **Modo Completo** → AskUserQuestion:
  ```
  AskUserQuestion({
    question: "Role pronto. Iniciar execução?",
    options: [
      { label: "▶️ Iniciar", description: "Executar o pipeline" },
      { label: "Revisar squad.yaml", description: "Ver antes de rodar" }
    ]
  })
  ```

### 8.2 — Verificação automática de skills

Silenciosamente antes de iniciar:
1. Leia os steps do pipeline
2. Verifique skills necessárias
3. Se skill ausente: log `⚠️ Skill {x} não encontrada — continuando sem ela`
4. Não bloqueia

### 8.3 — Iniciar pipeline

Leia e siga `.synapos/core/pipeline-runner.md` passando:
- Squad (recém-criado ou carregado)
- Pipeline padrão do template
- Agents selecionados
- `[EXECUTION_MODE]`
- `[MODELO_TIER]`
- `[LINGUA]`
- `[TASK_TRACKER]`
- `[COMPANY_CONTEXT]` — conteúdo de `company.md` lido no PASSO 1.2
- `[STACK_CONTEXT]` — conteúdo de `stack.md` lido no PASSO 1.3 (vazio se não existir)
- `resume_from: {step-id}` (se retomada detectada no PASSO 2)

> O pipeline-runner **não relê** `preferences.md`, `company.md` nem `stack.md`. Usa exclusivamente os valores recebidos.

---

## CARREGAR SQUAD EXISTENTE

Quando o usuário escolhe um squad ativo no PASSO 4:

1. Leia `.synapos/squads/{squad-slug}/squad.yaml`
2. Extraia `feature`, `session` e `execution_mode` (use este como `[EXECUTION_MODE]` — **não pergunte de novo**)
3. Leia `docs/.squads/sessions/{feature-slug}/state.json` (se existir)
4. Leia `docs/.squads/sessions/{feature-slug}/memories.md` (se existir)

> Status `running` já foi detectado no PASSO 2. Neste ponto, o squad tem status `completed`, `discarded`, `paused` ou `active` (sem execução pendente).

**Menu de ações:**

```
AskUserQuestion({
  question: "Role {squad-slug} carregado.\nFeature: {feature-slug}\n\nRoles que já trabalharam: {lista}\n\nO que você quer fazer?",
  options: [
    { label: "🔄 Nova execução", description: "Executar novamente (manter contexto)" },
    { label: "🧠 Ver memória", description: "Abrir memories.md da feature" },
    { label: "📂 Ver arquivos", description: "Ver arquivos da session" },
    { label: "⏸️ Pausar", description: "Pausar/arquivar role" }
  ]
})
```

Para "Nova execução" → pule para PASSO 8.3 com o `[EXECUTION_MODE]` lido do squad.yaml.

---

## ESCALATION DE DECISÕES

Se durante execução um agent encontra decisão que precisa ser escalada, o **pipeline-runner** carrega `.synapos/core/escalation.md` on-demand. Este fluxo não faz parte do orchestrator.

---

## REGRAS GERAIS

| Regra | Descrição |
|-------|-----------|
| **SEMPRE use AskUserQuestion** | Qualquer interação com usuário deve usar janela interativa |
| **Onboarding é lazy** | `onboarding.md` carrega apenas quando `company.md` não existe |
| **Stack detection é lazy** | `stack-detector.md` carrega apenas quando `stack.md` não existe |
| **Role customizado é lazy** | `role-custom.md` carrega apenas quando usuário escolhe "Customizado" |
| **Escalation é do runner** | Vive em `escalation.md`, invocado pelo pipeline-runner — nunca pelo orchestrator |
| **Retomada é prioridade 1** | PASSO 2 detecta `running` antes de qualquer outra pergunta |
| **Modo persiste no squad** | `execution_mode` salvo em squad.yaml; nunca perguntar de novo ao retomar |
| **UI: "role"** | O usuário vê "role" (papel) na UI. Arquivos internos mantêm `squad` por compatibilidade |
| **Agents BASE são fixos** | Nunca remova sem confirmação explícita |
| **Memória persiste** | Sempre carregue memories.md em toda sessão |
| **Múltiplos roles são permitidos** | Cada squad tem contexto isolado |
| **Salve estado** | Atualize squad.yaml após mudanças de status |
| **Fail loud** | Se faltar arquivo de template, informe e pare |
| **Linguagem** | Siga a preferência em `docs/_memory/preferences.md` |
