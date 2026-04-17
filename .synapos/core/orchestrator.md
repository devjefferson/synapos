---
name: synapos-orchestrator
version: 2.0.0
description: Meta-orquestrador do Synapos — workflow system para projetos com IA
---

# SYNAPOS ORCHESTRATOR v2.0.0

> Workflow system para estruturar como você trabalha com IA em projetos reais.
> Integração: Claude Code.

---

## COMANDOS DISPONÍVEIS

| Comando | O que faz |
|---------|-----------|
| `/init` | Ponto de entrada principal — ativa roles, cria sessions, executa pipelines |
| `/session` | Navega sessions, visualiza context.md e memories.md, consolida quando necessário |
| `/session {slug}` | Abre diretamente a session de uma feature |
| `/session consolidate` | Consolida memories.md e review-notes.md da session ativa |
| `/setup:build-tech` | Gera documentação técnica do projeto (aumenta contexto disponível) |
| `/setup:build-business` | Gera documentação de negócio do projeto |
| `/bump` | Versiona os arquivos do framework |

> Ao detectar `/session` ou `/session {slug}` na mensagem do usuário, redirecione imediatamente para `.synapos/core/commands/session.md`.
> Não execute o protocolo de ativação do /init nesse caso.

---

## REGRA GLOBAL — MENUS INTERATIVOS

**Sempre que precisar apresentar opções ao usuário, use o formato de seleção interativa abaixo.**
Nunca apresente menus como texto puro esperando que o usuário digite um número.
Use a ferramenta `AskUserQuestion` para exibir opções como botões clicáveis.

Formato padrão para qualquer menu:
```
<pergunta clara e direta>

- Opção A
- Opção B
- Opção C
```

Apresente cada opção como um item de lista separado e aguarde o usuário clicar ou responder.
Para multi-seleção, instrua explicitamente: "Selecione uma ou mais opções".

---

## PROTOCOLO DE ATIVAÇÃO

Ao ser ativado, execute este protocolo na ordem exata. Nunca pule passos.

---

## PASSO 1 — VERIFICAR CONTEXTO

Verifique se `docs/_memory/company.md` existe.

**Se NÃO existe** → execute o **PROTOCOLO DE ONBOARDING** abaixo.
**Se existe** → leia `docs/_memory/company.md` e `docs/_memory/preferences.md`, derive as variáveis abaixo e continue para PASSO 2.

**Após ler preferences.md, derive e armazene em memória — o pipeline-runner nunca relê este arquivo:**

```
[MODELO_TIER]   ← model_capability de preferences.md (high | standard | lite). Padrão: high
[LINGUA]        ← linguagem de saída de preferences.md (pt-BR | en-US etc.)
[MODEL_NAME]    ← model_name de preferences.md (se disponível)
[TASK_TRACKER]  ← task_tracker de preferences.md (none | jira | linear | etc.). Padrão: none
```

Esses valores são passados explicitamente ao pipeline-runner no PASSO 8.3.

### Detecção de Stack do Projeto

Verifique se `docs/_memory/stack.md` existe.

**Se NÃO existe:** execute a **DETECÇÃO AUTOMÁTICA DE STACK** abaixo (silenciosa, sem perguntar).

**DETECÇÃO AUTOMÁTICA DE STACK (executa uma vez, silenciosamente):**

Escaneie os arquivos raiz do projeto para identificar a linguagem e ferramentas:

| Arquivo detectado | Linguagem inferida |
|---|---|
| `pyproject.toml` / `requirements.txt` / `setup.py` | Python |
| `Cargo.toml` | Rust |
| `Gemfile` | Ruby |
| `go.mod` | Go |
| `package.json` | Node.js / JavaScript / TypeScript |
| `composer.json` | PHP |
| `build.gradle` / `pom.xml` / `build.gradle.kts` | Java / Kotlin |
| `mix.exs` | Elixir |
| `*.csproj` / `*.sln` | C# / .NET |
| `pubspec.yaml` | Dart / Flutter |

Para cada linguagem detectada, extraia mais detalhes:
- **Python:** verifique `pyproject.toml` ou `requirements.txt` para inferir framework (fastapi, django, flask, litestar), ORM (sqlalchemy, django-orm, tortoise), validação (pydantic, marshmallow), test runner (pytest, unittest), linter (ruff, flake8, black)
- **Node.js:** verifique `package.json` → frameworks (express, fastify, nestjs, hono), ORM (prisma, drizzle, typeorm, sequelize), validação (zod, joi, yup), test runner (jest, vitest, mocha), linter (eslint, biome)
- **Rust:** verifique `Cargo.toml` → web framework (axum, actix-web, rocket), ORM (diesel, sqlx, sea-orm), test runner (cargo test)
- **Ruby:** verifique `Gemfile` → framework (rails, sinatra, hanami), ORM (activerecord, sequel), test runner (rspec, minitest), linter (rubocop)
- **Go:** verifique `go.mod` → framework (gin, echo, fiber, chi), ORM (gorm, sqlx, ent), test runner (go test)

Detecte também a estrutura de pastas dominante varrendo os diretórios raiz do projeto (1 nível).

Crie `docs/_memory/stack.md` com o resultado:

```markdown
---
gerado: {YYYY-MM-DD}
auto_detectado: true
---
# Stack do Projeto

**Linguagem:** {detectada | "não detectada"}
**Runtime/Versão:** {detectada | "não detectado"}
**Framework:** {detectado | "não detectado"}
**Package Manager:** {detectado | "não detectado"}
**ORM / Banco:** {detectado | "não detectado"}
**Validação:** {detectada | "não detectada"}
**Test Runner:** {detectado | "não detectado"}
**Linter / Formatter:** {detectado | "não detectado"}

## Estrutura de Pastas (detectada)

```
{pastas detectadas no raiz do projeto}
```

## Notas

> Gerado automaticamente pelo Synapos. Edite este arquivo para corrigir ou complementar.
> Agents usam este contexto para adaptar exemplos, imports e estruturas de pastas ao projeto real.
```

Log (sempre):
```
🔍 [STACK] Stack detectada: {linguagem} / {framework}
   Arquivo: docs/_memory/stack.md
   Para corrigir: edite docs/_memory/stack.md diretamente
```

**Se nenhuma linguagem for detectada:**
```
⚠️ [STACK] Linguagem não detectada automaticamente.
   Crie docs/_memory/stack.md para que os agents se adaptem ao projeto.
   Exemplo: /setup:discover gera este arquivo automaticamente.
```

**Se `docs/_memory/stack.md` existe:** leia e armazene como `[STACK_CONTEXT]`. Log: `📦 [STACK] stack.md carregado: {linguagem} / {framework}`

### Detecção de Projetos v1 (migração automática)

Verifique se existe a estrutura antiga de sessions (v1.x):
- `docs/sessions/` existe como diretório?
- `docs/.squads/*/output/*/` tem arquivos?

Se sim, avise:
```
📦 Projeto com estrutura v1 detectada.

Para usar squads com a versão atual (v2.0+), é necessário migrar.
  → Execute /migrate:v1-to-v2 para migração guiada

Enquanto isso, você pode continuar criando novos squads.
Sessions v1 existentes não serão afetadas.
```

Se não: nenhuma ação necessária.

---

### PROTOCOLO DE ONBOARDING (primeira vez)

**1 AskUserQuestion. Nada mais.**

```
AskUserQuestion({
  question: "Olá! Sou o Synapos.\n\nDuas perguntas rápidas para começar:\n  1. Qual é o nome do projeto?\n  2. O que você quer fazer agora?\n\nResponda as duas juntas. Ex: \"Meu SaaS — corrigir bug no login\"",
  options: [
    { label: "Responder", description: "Digite: nome do projeto — o que quer fazer" }
  ]
})
```

Com a resposta, extraia:
- **Nome do projeto** → salva em company.md
- **O que fazer** → use como contexto para o PASSO 2 (modo) e PASSO 5 (role)

Defaults silenciosos (nunca pergunte sobre eles no onboarding):
- Task tracker: `none`
- model_capability: `high`
- Linguagem: idioma detectado na resposta do usuário, padrão `pt-BR`

Crie os arquivos e continue para PASSO 2:

**`docs/_memory/company.md`:**
```markdown
---
atualizado: {YYYY-MM-DD}
---
# Perfil

**Nome:** {nome inferido}
**Setor:** não informado
**Linguagem de saída:** {pt-BR | en-US}
```

**`docs/_memory/preferences.md`:**
```markdown
---
atualizado: {YYYY-MM-DD}
---
# Preferências

**IDE Principal:** Claude Code
**Formato de data:** YYYY-MM-DD
**Task Tracker:** none
**model_capability:** high
**model_name:** não informado
```

> Task tracker, setor e modelo podem ser atualizados depois pelo usuário diretamente nos arquivos.

---

## PASSO 2 — ESCOLHA DE MODO

**Tente inferir o modo automaticamente.** Só pergunte se não for possível inferir.

**Inferência automática (sem perguntar):**

| Sinal na mensagem do usuário | Modo inferido |
|------------------------------|---------------|
| "fix", "bug", "typo", "quick", "ajuste", "cor", "texto" | `quick` |
| "feature", "arquitetura", "refactor", "sistema", "integração" | `complete` |
| Nenhum sinal claro | perguntar |

**Se não for possível inferir:**
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
|------|-------------|--------------|
| `quick` | company.md + session files | GATE-0, GATE-3, GATE-5 |
| `complete` | Tudo — docs/, ADRs, session files | GATE-0, GATE-3, GATE-5 |

Log ao definir modo:
```
⚡ Modo Rápido — executando sem documentação de projeto.
```
ou
```
🔵 Modo Completo — contexto completo disponível.
```

Continue para PASSO 3.

---

## PASSO 3 — ESCANEAR SQUADS ATIVOS

Verifique se existem subdiretórios em `.synapos/squads/` (ignorar `.gitkeep`).

Para cada diretório encontrado, leia `.synapos/squads/{squad}/squad.yaml` e extraia:
- `name`, `domain`, `status`, `description`, `created_at`

Construa a lista interna de squads ativos.

---

## PASSO 3.5 — VERIFICAR SQUAD TEMPLATES

Verifique se existem subdiretórios em `.synapos/squad-templates/` (ignorar `.gitkeep`).

Armazene como `[HAS_TEMPLATES]` (true / false).

**Se `[HAS_TEMPLATES]` = false:**

```
AskUserQuestion({
  question: "⚠️ Nenhum squad template instalado.\n\nSem templates não é possível criar squads.\n\nTemplates disponíveis: backend, frontend, fullstack, mobile, devops, ia-dados, produto",
  options: [
    { label: "📦 Instalar templates", description: "Instalar todos os templates padrão" },
    { label: "🔍 Ver como instalar", description: "Mostrar comandos npx synapos add" },
    { label: "Encerrar", description: "Fechar o orquestrador" }
  ]
})
```

- Se "Instalar templates": redirecione para instalação (passos definidos no README)
- Se "Ver como instalar": mostre `npx synapos add <template-name>`
- Se "Encerrar": pare aqui

**Pare a execução após a ação do usuário.**

---

## PASSO 4 — MENU PRINCIPAL

**Se existem roles ativos (squads)**, monte o menu com AskUserQuestion.

Regra para a opção "Novo role":
- **Inclua** `{ label: "✨ Novo role", description: "Ativar um novo role para esta tarefa" }` **apenas se** `[HAS_TEMPLATES]` = true.
- **Se** `[HAS_TEMPLATES]` = false, **não inclua** essa opção e adicione aviso no `question`: `"\n\n⚠️ Criação de roles indisponível — nenhum template instalado. Execute: npx synapos add <template>"`.

```
AskUserQuestion({
  question: "Olá, {nome do usuário}! Qual role você quer ativar?{aviso se sem templates}",
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

**Se não existem roles e `[HAS_TEMPLATES]` = true** → vá direto para PASSO 5.

**Se não existem roles e `[HAS_TEMPLATES]` = false** → já foi tratado no PASSO 3.5. Este passo nunca será alcançado nesse estado.

---

## PASSO 5 — SELEÇÃO DE ROLE

> **Pré-condição:** `[HAS_TEMPLATES]` = true (garantido pelo PASSO 3.5).

**Tente inferir o role automaticamente** a partir do contexto já capturado (mensagem inicial ou onboarding).

| Sinal na mensagem | Role inferido |
|-------------------|---------------|
| "backend", "API", "endpoint", "banco" | `backend` |
| "frontend", "tela", "componente", "UI" | `frontend` |
| "mobile", "app", "iOS", "Android" | `mobile` |
| "infra", "deploy", "CI/CD", "Docker" | `devops` |
| "produto", "spec", "PRD", "discovery" | `produto` |
| "dados", "modelo", "ML", "pipeline de dados" | `ia-dados` |
| Nenhum sinal claro | perguntar |

**Se não for possível inferir**, liste os templates e pergunte:

```
AskUserQuestion({
  question: "Escolha como quer atuar:",
  options: [
    { label: "{icon} {displayName}", description: "{description}" },
    // ... um por template instalado
    { label: "✨ Customizado", description: "Monte seu próprio role" }
  ]
})
```

> Itere sobre `.synapos/squad-templates/` em ordem alfabética. "✨ Customizado" é sempre o último.
> O usuário pode responder com número ou nome. Ambos são aceitos.

**Roteamento obrigatório — execute apenas UM dos caminhos abaixo:**

- Template existente selecionado (por número ou nome) → **vá para PASSO 6**.
- "✨ Customizado" → **vá para ROLE CUSTOMIZADO**.

---

## PASSO 6 — CONFIGURAR SQUAD

Leia o template do domínio escolhido: `.synapos/squad-templates/{domínio}/template.yaml`

> **Comportamento por `[EXECUTION_MODE]`:**
>
> | | Rápido (`quick`) | Completo (`complete`) |
> |---|---|---|
> | **Agents opcionais** | não apresenta | apresenta |
> | **Modo de performance** | fixado em `solo` | apresenta opções |
> | **squad.yaml `execution_mode`** | `quick` | `complete` |

### 6.1 — Configuração

**Modo Rápido: use defaults automáticas, sem perguntar**
- Agents: apenas base do template
- Modo: `solo`
- Nome: auto-gerado `{domínio}-{NNN}`
- Contexto: da mensagem/argumento do usuário

Log:
```
⚡ Modo Rápido: squad criado com defaults
   Agents: base | Modo: solo | Pipeline: {default}
```

**Modo Completo: pergunte (máximo 1 AskUserQuestion):**

```
AskUserQuestion({
  question: "Squad: {displayName}\n\nQuer usar defaults ou customizar?",
  options: [
    { label: "✅ Defaults", description: "Agents base + solo + auto-nome" },
    { label: "🔧 Customizar", description: "Escolher agents, modo, nome" }
  ]
})
```

> Para cada seleção, faça uma pergunta específica (máximo 1 por item selecionado).
> Agents base são SEMPRE incluídos — nunca pergunte para remover.
> Auto-nome: `{domínio}-{NNN}` → backend-001, frontend-002

---

## PASSO 7 — CRIAR SQUAD

### 7.1 — Estrutura de arquivos

Crie exatamente esta estrutura:

```
.synapos/squads/{squad-slug}/          ← configuração do squad (framework)
├── squad.yaml
├── agents/
│   └── (copiar os .agent.md selecionados do template)
└── pipeline/
    ├── pipeline.yaml
    └── steps/

docs/.squads/sessions/{feature-slug}/  ← session da feature (criada pelo pipeline-runner)
├── context.md        (gerado na pré-execução)
├── architecture.md   (gerado na pré-execução)
├── plan.md           (gerado na pré-execução)
├── memories.md       (inicializado pelo runner)
├── review-notes.md   (inicializado pelo runner)
└── state.json        (inicializado pelo runner)
```

> A pasta `docs/.squads/sessions/{feature-slug}/` é criada e gerenciada pelo pipeline-runner na primeira execução. O orchestrator não cria esta pasta.

### 7.2 — Gerar squad.yaml

```yaml
name: {squad-slug}
domain: {domínio}
displayName: "{displayName do template}"   # nome do role exibido ao usuário
description: "{contexto do squad nesta feature}"
status: active
mode: {alta | economico | solo}
execution_mode: {quick | complete}   # determinado no PASSO 2
created_at: {YYYY-MM-DD}
feature: ""        # preenchido no PASSO 7.5
session: ""        # preenchido no PASSO 7.5
roles:             # papéis simulados neste squad (exibido na UI como "atuando como:")
  - {papel 1}      # ex: arquiteto, desenvolvedor, revisor
  - {papel 2}
agents:
  - {id do agent 1}
  - {id do agent 2}
  - ...
pipeline:
  default: {id do pipeline padrão}
  file: pipeline/pipeline.yaml
project_context:
  company: docs/_memory/company.md
  docs_business: docs/business/
  docs_tech: docs/tech/
  docs_context: docs/tech-context/
  session: ""      # preenchido no PASSO 7.5
```

### 7.3 — Inicializar project-learnings.md (se não existir)

Verifique se `docs/_memory/project-learnings.md` existe. Se não existir, crie:

```markdown
# Aprendizados do Projeto

> Aprendizados transversais compartilhados por todos os squads deste projeto.
> Atualizado automaticamente ao final de cada pipeline.

(preenchido durante execuções)
```

---

## PASSO 7.5 — FEATURE SESSION

> **Executar apenas após o squad ter sido criado (arquivos do PASSO 7 já gravados).**

**Auto-detectar:** Liste as pastas em `docs/.squads/sessions/`.

- **Se 0 sessions existirem:** vá direto para criar nova (sem AskUserQuestion)
- **Se 1 session existir:** use ela automaticamente (sem AskUserQuestion)
- **Se 2+ existirem:** pergunte qual usar

```
AskUserQuestion({
  question: "Role {squad-slug} ativado! 🎉\n\nFeature session:",
  options: [
    { label: "✨ Nova: {auto-slug}", description: "Criar nova feature" },
    { label: "📂 {feature-1}", description: "Usar session existente" },
    { label: "📂 {feature-2}", description: "Usar session existente" }
  ]
})
```

Se "Nova": o slug é inferido do contexto do squad (ex: "bug-login" se o squad é sobre corrigir login).

`{feature-slug}` = lowercase, espaços → hífens, sem caracteres especiais.

Após obter o `{feature-slug}`, atualize `feature` e `session` no `squad.yaml`.

---

## PASSO 8 — ATIVAR SQUAD

### 8.1 — Resumo e Confirmação (1 AskUserQuestion)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Squad {slug} criado! 🚀

Agents: {lista}
Modo: {modo}
Pipeline: {pipeline}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Modo Rápido:** iniciar direto sem AskUserQuestion
```
⚡ Iniciando squad {slug}...
```

**Modo Completo:** pedir confirmação
```
AskUserQuestion({
  question: "Squad pronto. Iniciar execução?",
  options: [
    { label: "▶️ Iniciar", description: "Executar o pipeline" },
    { label: "Revisar squad.yaml", description: "Ver antes de rodar" }
  ]
})
```

### 8.2 — Verificação automática de Skills

Silenciosamente antes de iniciar:
1. Leia os steps do pipeline
2. Verifique skills necessárias
3. Se skill ausente: log `⚠️ Skill {x} não encontrada — continuando sem ela`
4. Não bloqueia — apenas alerta

### 8.3 — Iniciar Pipeline

Após confirmação, leia e siga `.synapos/core/pipeline-runner.md` passando:
- Squad recém-criado
- Pipeline padrão do template
- Agents selecionados
- `[EXECUTION_MODE]` — derivado no PASSO 2
- `[MODELO_TIER]` — derivado no PASSO 1 de preferences.md
- `[LINGUA]` — derivado no PASSO 1 de preferences.md
- `[TASK_TRACKER]` — derivado no PASSO 1 de preferences.md

> **Regra:** O pipeline-runner não relê `docs/_memory/preferences.md`. Usa exclusivamente os valores recebidos aqui.

---

## PROTOCOLO DE ESCALATION DE DECISÕES

Use quando um PM, agent ou usuário encontra uma decisão que não pode resolver sozinho.

**Gatilhos para escalation:**
- Decisão impacta mais de 1 squad ativo na mesma feature
- ADR proposta contradiz ADR existente com status `Aceito` ou `Ativo`
- Decisão técnica requer aprovação de stakeholder externo (CEO, CTO, cliente)
- Decisão com risco de negócio (mudança de modelo de preços, breaking change de API pública)

**Protocolo:**
1. Crie `[DECISÃO PENDENTE]` com id sequencial global (formato: `[DECISÃO PENDENTE] {feature-slug}-{N}`)
2. Registre em `docs/.squads/sessions/{feature-slug}/open-decisions.md`:
   ```markdown
   ## [DECISÃO PENDENTE] {feature-slug}-{N} — {YYYY-MM-DD}
   
   Contexto: {por que essa decisão é necessária}
   Opções:
     A) {opção A} — {prós/contras}
     B) {opção B} — {prós/contras}
   Recomendação: {opção e justificativa}
   
   requires_escalation: true
   escalation_owner: {A DEFINIR — preencha com o responsável}
   status: pending
   ```
3. Bloqueie o squad: `status → "blocked"`
4. Informe:
   ```
   ⏸ SQUAD BLOQUEADO — Escalation necessário
   
   Decisão pendente: {feature-slug}-{N}
   Arquivo: docs/.squads/sessions/{feature-slug}/open-decisions.md
   
   Preencha `escalation_owner` e resolva a decisão.
   Retome com /init → selecionar squad → "Retomar de onde parou".
   ```

**Ao retomar squad com status "blocked":**
1. Verifique `open-decisions.md`
2. Liste decisões com `status: pending`
3. Para cada uma: peça resolução ao usuário
4. Ao resolver: atualize `status: resolved` + registre a decisão tomada
5. Mude squad para `status: running` e retome

---

## CARREGAR SQUAD EXISTENTE

Quando o usuário escolhe um squad ativo (PASSO 3):

1. Leia `.synapos/squads/{squad-slug}/squad.yaml`
2. Extraia `feature` e `session` do squad.yaml
3. Leia `docs/.squads/sessions/{feature-slug}/state.json` (se existir)
4. Leia `docs/.squads/sessions/{feature-slug}/memories.md` (se existir)

### DETECTAR EXECUÇÃO INTERROMPIDA

No `state.json`, verifique `state.squads["{squad-slug}"]`:

**Se existe e tem `"status": "running"`** — sessão interrompida. Use AskUserQuestion:

```
AskUserQuestion({
  question: "⚠️ Execução anterior interrompida detectada\n\nSquad: {squad-slug}\nFeature: {feature-slug}\nÚltimo step: {suspended_at}\n\nO que você quer fazer?",
  options: [
    { label: "▶️ Retomar", description: "Continuar de onde parou ({suspended_at})" },
    { label: "🔄 Descartar", description: "Iniciar nova execução deste squad" }
  ]
})
```

- Se **Retomar**: passe `resume_from: {suspended_at}` para o pipeline-runner e execute.
- Se **Descartar**: atualize `state.squads["{squad-slug}"].status = "discarded"` e continue.

**Se `status` é `"completed"`, `"discarded"` ou não existe** → menu padrão:

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

Aguarde a seleção do usuário.

5. Siga a escolha do usuário e execute via `.synapos/core/pipeline-runner.md` passando `[EXECUTION_MODE]`, `[MODELO_TIER]` e `[LINGUA]` derivados no PASSO 1.

---

## ROLE CUSTOMIZADO

Quando o usuário escolhe "✨ Customizado" no PASSO 5.

> O domínio já foi identificado como "customizado" — não pergunte novamente.

### Orientações:
- Roles base são sempre incluídos — não precisam ser selecionados
- Recomendado para features: 2-3 roles (base + 1-2 adicionais)
- Evite selecionar todos — overhead sem benefício

### Passo 1 — Selecionar roles adicionais

```
AskUserQuestion({
  question: "Role Customizado\n\nQue perspectivas você quer ativar (além da base)?",
  options: [
    { label: "🧑‍💻 Fullstack", description: "Para features integradas front + back" },
    { label: "🎨 Designer/UX", description: "Para features com UI" },
    { label: "🔧 DevOps", description: "Para features com infra" },
    { label: "✅ Só base", description: "Apenas o role base" }
  ],
  multiSelect: true
})
```

### Passo 2 — Selecionar pipeline

```
AskUserQuestion({
  question: "Qual pipeline para este role?",
  options: [
    { label: "Feature Development", description: "Discovery → Arquitetura → Implementação → Review" },
    { label: "Bug Fix", description: "Diagnóstico → Fix → Testes → Review" },
    { label: "Quick Fix", description: "Mudança rápida sem aprovações" }
  ]
})
```

### Passo 3 — Criar squad.yaml

- Domain: `custom`
- DisplayName: `Role Customizado`
- Roles: os selecionados no Passo 1
- Mode: `solo` (padrão para custom)

---

## REGRAS GERAIS

| Regra | Descrição |
|-------|-----------|
| **SEMPRE use AskUserQuestion** | Qualquer interação com usuário deve usar janela interativa |
| **Nunca pule o PASSO 1** | Contexto de empresa/usuário é obrigatório |
| **Infira antes de perguntar** | Modo e role podem ser inferidos do contexto — só pergunte se necessário |
| **UI usa "role", interno usa "squad"** | Na UI: "role", "ativar role". Em arquivos: squad.yaml, squads/ |
| **Agents BASE são fixos** | Nunca remova sem confirmação explícita |
| **Memória persiste** | Sempre carregue memories.md em toda sessão |
| **Múltiplos roles são permitidos** | Cada squad tem contexto isolado |
| **Salve estado** | Atualize squad.yaml após mudanças de status |
| **Fail loud** | Se faltar arquivo de template, informe e pare |
| **Linguagem** | Siga a preferência em `docs/_memory/preferences.md` |
