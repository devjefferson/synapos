# Synapos

**Framework de orquestração de agents de IA para desenvolvimento de software**

Instale squads de agents especializados no seu projeto com um único comando. Cada squad executa pipelines estruturados com gates de qualidade, checkpoints humanos e memória persistente entre sessões.

```bash
npx synapos
```

Funciona com **Claude Code**, **Cursor**, **Trae**, **OpenCode** e **Antigravity**.

---

## Índice

- [Como funciona](#como-funciona)
- [Instalação](#instalação)
- [Primeiros passos](#primeiros-passos)
- [Comandos disponíveis](#comandos-disponíveis)
- [Squads e agents](#squads-e-agents)
- [Pipelines](#pipelines)
- [Modos de operação](#modos-de-operação)
- [Gate system](#gate-system)
- [Skills (integrações)](#skills-integrações)
- [Configurar modelo de IA](#configurar-modelo-de-ia)
- [Sessões e memória](#sessões-e-memória)
- [Estrutura de arquivos](#estrutura-de-arquivos)

---

## Como funciona

O Synapos organiza o trabalho em três camadas:

```
Você fala com o orquestrador (/init)
    ↓
O orquestrador cria um squad e carrega o pipeline
    ↓
O pipeline-runner executa steps em sequência
    ↓ ↓ ↓
  gates    agents    checkpoints    memória
```

**Squad** — time de agents especializados para um domínio (backend, frontend, produto, etc.)

**Pipeline** — sequência de steps: cada step tem um agent responsável, um tipo de execução e critérios de qualidade (veto conditions)

**Session** — pasta compartilhada entre todos os squads que trabalham numa mesma feature. Guarda contexto, arquitetura, plano, aprendizados e estado de execução

**Gates** — pontos de validação obrigatórios. Bloqueiam execução se requisitos mínimos não foram atendidos

---

## Instalação

Execute no diretório do seu projeto:

```bash
npx synapos
```

O CLI vai guiar você por dois passos:

1. **Selecione os squads** que quer instalar (multi-select)
2. **Selecione as IDEs** para configurar (multi-select)

Ou passe os squads como argumento direto:

```bash
npx synapos front               # squad de frontend
npx synapos back                # squad de backend
npx synapos front back          # frontend + backend
npx synapos front back devops   # múltiplos squads
```

### Aliases disponíveis

| Alias | Squad | Especialidade |
|-------|-------|---------------|
| `front` | Frontend | React, Vue, CSS, UX/UI, testes |
| `back` | Backend | APIs, banco de dados, segurança |
| `full` | Fullstack | Frontend + Backend integrados |
| `produto` | Produto | Pesquisa, spec, documentação |
| `mobile` | Mobile | React Native, Flutter, iOS, Android |
| `devops` | DevOps | CI/CD, containers, cloud, infra |
| `ia` | IA / Dados | ML, pipelines de dados, LLMs |
| `engineer` | Engineer | Feature engineering completo |

### IDEs suportadas

| IDE | Arquivo gerado |
|-----|----------------|
| Claude Code | `.claude/commands/` |
| Cursor | `.cursor/rules/synapos.mdc` |
| Trae | `.trae/rules.md` |
| OpenCode | `.opencode/commands/` |
| Antigravity | `.antigravity/rules.md` |

---

## Primeiros passos

Escolha o cenário que descreve sua situação:

### Tenho um projeto existente com código

```
1. /init              → onboarding (nome, setor, modelo)
2. /setup:build-tech  → analisa o codebase → gera docs/tech/
3. /setup:build-business → entrevista de produto → gera docs/business/
4. /init              → GATE-0 passa → escolha o squad
```

### Estou começando um produto do zero

```
1. /init
2. /setup:build-business → visão, personas, OKRs, concorrentes
3. /setup:build-tech     → stack, arquitetura inicial, primeiras ADRs
4. /init → Squad Produto → pipeline discovery-spec-handoff
5. Após o handoff → Squad engineer/frontend/backend para implementação
```

### Tenho uma task específica no backlog

```
1. /init (se primeira vez: complete o onboarding)
2. docs/ já existe → GATE-0 passa automaticamente
3. /init → squad → Modo Econômico → quick-spec ou quick-fix
```

### Sou dev solo sem documentação

```
1. /init
2. Escolha Modo Solo → GATE-0 passa com aviso (não bloqueia)
3. Crie documentação quando conveniente
4. Use quick-fix para tarefas pontuais sem overhead
```

---

## Comandos disponíveis

Todos os comandos são executados dentro da sua IDE.

### `/init`

Ponto de entrada principal do framework. Executa na ordem:

1. Verifica `docs/_memory/company.md` — se não existe, inicia o **onboarding**
2. Verifica `docs/` — se vazia, oferece `/setup:build-business` e `/setup:build-tech`
3. Lista squads ativos (`🟢 ativo`, `🟡 pausado`, `✅ concluído`)
4. Se nenhum squad ativo: vai direto para seleção de domínio
5. Cria ou carrega o squad e inicia o pipeline-runner

**Onboarding (primeira vez):**
```
• Nome da empresa ou projeto
• Setor / tipo de projeto
• Linguagem de saída (PT-BR / EN-US)
• Modelo de IA em uso → define model_capability automaticamente
```

---

### `/setup:start`

Orquestrador de documentação. Analisa o estado atual do projeto e exibe o que está faltando:

```
✅ docs/tech-context/   → briefing técnico presente
⚠️ docs/business/       → contexto de negócio ausente
⚠️ docs/tech/           → stack e ADRs ausentes
```

Oferece atalhos para cada comando de setup.

---

### `/setup:build-business`

Gera documentação de contexto de negócio em `docs/business/` a partir de uma entrevista com você.

**Fases:**
1. Descoberta automática — lê código e arquivos existentes para extrair o que já sabe
2. Perguntas ao usuário — visão, personas, concorrentes, OKRs, diferenciais
3. Geração dos arquivos

**Arquivos gerados:**
```
docs/business/
├── index.md
├── business-context.md      → visão, missão, modelo de negócio
├── product-vision.md        → north star, proposta de valor
├── product-strategy.md      → OKRs, roadmap, prioridades
├── competitive_landscape.md → concorrentes e posicionamento
├── customer_communication.md
├── features/                → features mapeadas
├── personas/                → perfis de usuários
└── research/                → insights de pesquisa
```

---

### `/setup:build-tech`

Analisa o codebase e gera documentação técnica em `docs/tech/` e `docs/tech-context/`.

**Fases:**
1. Análise automática do código — stack, padrões, estrutura de pastas
2. Perguntas sobre decisões arquiteturais e convenções
3. Geração dos arquivos

**Arquivos gerados:**
```
docs/tech/
├── index.md
├── architecture.md          → decisões arquiteturais, padrões
├── stack.md                 → linguagens, frameworks, ferramentas
├── business_logic.md        → regras de negócio no código
├── codebase-guide.md        → como navegar o projeto
├── api-spec.md              → contratos de API (se existir)
├── contributing.md          → guia de contribuição
└── adr/                     → Architecture Decision Records

docs/tech-context/
├── project-briefing.md
└── briefing/
    ├── critical-rules.md    → regras críticas que agents devem respeitar
    ├── adrs-summary.md      → resumo das ADRs
    ├── backend-conventions.md
    └── tech-stack.md
```

---

### `/setup:discover`

Análise incremental do codebase. Gera `docs/tech-context/` com um briefing técnico focado em regras críticas, convenções e ADRs.

Use quando o projeto já tem `docs/tech/` mas você quer atualizar as regras que agents devem seguir.

---

### `/set-model`

Altera a configuração de modelo de IA sem re-executar o onboarding completo.

**Fluxo interativo:**
1. Exibe configuração atual
2. Escolha `model_capability` (high / standard / lite)
3. Escolha `model_name` (lista de modelos comuns + texto livre)
4. Opcional: configure `model_fast` + `model_powerful` para roteamento multi-modelo
5. Confirmação com diff antes de salvar

**Efeitos por model_capability:**

| Valor | Contexto injetado | Quando usar |
|-------|---|---|
| `high` | Completo — docs + session files + ADRs na íntegra | Claude Opus/Sonnet, GPT-4o, Gemini Pro |
| `standard` | Completo + CoT prefix + templates de estrutura | Claude Haiku, GPT-4o-mini, Gemini Flash |
| `lite` | Resumo de 30 linhas (~70% de redução) + scope forcing | Kimi, MiniMax, Llama, modelos locais |

**Roteamento multi-modelo** — steps leves (preparação, formatação) usam `model_fast`; steps pesados (implementação, arquitetura) usam `model_powerful`:

```yaml
# docs/_memory/preferences.md
model_fast:     claude-haiku-4-5
model_powerful: claude-opus-4-6
```

---

### `/bump`

Gerenciamento de versão do framework e seus componentes.

**Fluxo:**
1. Identifica o que mudou (agent, template, core, múltiplos)
2. Tipo de mudança: MAJOR / MINOR / PATCH (semver)
3. Atualiza frontmatter do arquivo modificado
4. Atualiza `.synapos/.manifest.json`
5. Atualiza `.synapos/VERSION`
6. Adiciona entrada no CHANGELOG

---

## Squads e agents

Cada squad é um time de agents especializados para um domínio. Agents base são sempre incluídos; agents opcionais são adicionados conforme necessidade.

---

### 🖥️ Frontend

Especialistas em desenvolvimento frontend: qualidade, performance e experiência do usuário.

**Agents base:**

| Agent | Role |
|-------|------|
| Ana Arquitetura | Arquiteta Frontend — decisões de estrutura, componentes, padrões |
| Rodrigo React | Dev Frontend — implementação de componentes e features |
| Renata Revisão | Reviewer Frontend — code review, acessibilidade, qualidade |

**Agents opcionais:**

| Agent | Role |
|-------|------|
| Úrsula UI | UX/UI Designer — especificação visual, design system |
| Tiago Testes | Engenheiro de Testes — unit, integration, E2E |
| Paulo Performance | Engenheiro de Performance — Web Vitals, bundle, otimização |
| Leo Engenheiro | Lead Engineer — investigação, arquitetura, planejamento |

---

### ⚙️ Backend

Especialistas em APIs robustas, segurança e escalabilidade.

**Agents base:**

| Agent | Role |
|-------|------|
| Bruno Base | Arquiteto Backend — design de API, modelagem, padrões |
| Alexandre API | Dev Backend — implementação de endpoints e serviços |
| Roberto Revisão | Reviewer Backend — code review, qualidade, boas práticas |

**Agents opcionais:**

| Agent | Role |
|-------|------|
| Daniela Dados | Arquiteta de Dados — schema, migrations, queries |
| Sérgio Segurança | Engenheiro de Segurança — OWASP, autenticação, auditoria |
| Leo Engenheiro | Lead Engineer — investigação, arquitetura, planejamento |

---

### 📦 Fullstack

Frontend + Backend integrados com coordenação de API contracts.

**Agents base:**

| Agent | Role |
|-------|------|
| Carlos Coordenador | Coordenador Fullstack — alinhamento FE/BE, API contract |
| Ana Arquitetura | Arquiteta Frontend |
| Rodrigo React | Dev Frontend |
| Bruno Base | Arquiteto Backend |
| Alexandre API | Dev Backend |

**Agents opcionais:** Úrsula UI, Tiago Testes, Sérgio Segurança, Renata Revisão, Roberto Revisão, Leo Engenheiro

---

### 📋 Produto

Pesquisa, spec, documentação e handoff para desenvolvimento.

**Agents base:**

| Agent | Role |
|-------|------|
| Priscila Produto | Product Manager — spec, requisitos, priorização |
| Ana Análise | Analista de Negócio — mapeamento de fluxos e regras |
| Tânia Técnica | Tech Writer — documentação, handoff |

**Agents opcionais:**

| Agent | Role |
|-------|------|
| Paulo Pesquisa | Pesquisador — user research, benchmarks, dados |
| Eduardo Estratégia | Estrategista — visão de produto, OKRs |
| Úrsula UX | UX Researcher — fluxos, wireframes, usabilidade |
| Leo Engenheiro | Lead Engineer — viabilidade técnica |

---

### 📱 Mobile

Especialistas em React Native e Flutter: arquitetura, implementação e UX mobile.

**Agents base:**

| Agent | Role |
|-------|------|
| Marina Mobile | Arquiteta Mobile — estrutura, navegação, padrões |
| Felipe Feature | Dev Mobile — implementação de features |
| Viviane Visual | UX Mobile — design, animações, experiência |

**Agents opcionais:** Tiago Testes, Paulo Performance, Renata Revisão, Leo Engenheiro

---

### 🚀 DevOps

CI/CD, containers, cloud, IaC e observabilidade.

**Agents base:**

| Agent | Role |
|-------|------|
| Igor Infra | Arquiteto de Infra — cloud, IaC, arquitetura de deploy |
| Patrícia Pipeline | Engenheira de CI/CD — automação, testes, pipelines |

**Agents opcionais:**

| Agent | Role |
|-------|------|
| Cláudio Containers | Especialista Docker/Kubernetes |
| Osvaldo Observabilidade | Engenheiro de Observabilidade — métricas, logs, alertas |
| Sérgio Segurança | Engenheiro de Segurança |
| Leo Engenheiro | Lead Engineer |

---

### 🤖 IA / Dados

ML, pipelines de dados, LLMs e análise — da exploração ao modelo em produção.

**Agents base:**

| Agent | Role |
|-------|------|
| Larissa LLM | LLM Specialist — prompts, RAG, fine-tuning |
| Diana Dados | Engenheira de Dados — pipelines, ETL, qualidade |
| Nelson Notebook | Analista de Dados — exploração, visualização |

**Agents opcionais:**

| Agent | Role |
|-------|------|
| Marco ML | ML Engineer — treinamento, avaliação, deploy |
| Tânia Técnica | Tech Writer — documentação técnica |
| Leo Engenheiro | Lead Engineer |

---

### 🧠 Engineer

Feature engineering completo guiado por ADRs — investigação, arquitetura, planejamento e execução.

**Agents base:**

| Agent | Role |
|-------|------|
| Leo Engenheiro | Lead Engineer — conduz todo o ciclo da feature |

**Agents opcionais:** Bruno Base, Ana Arquitetura, Carlos Coordenador, Alexandre API, Rodrigo React

---

## Pipelines

Cada domínio tem pipelines para cenários diferentes. Todo pipeline começa com GATE-0.

### Frontend

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `feature-development` | Discovery → Arquitetura → Implementação → Review → Testes → Docs | Features novas de médio/alto impacto |
| `component-development` | Spec → Implementação → Review → Storybook | Componentes isolados do design system |
| `bug-fix` | Diagnóstico → Fix → Testes → Review | Bugs com causa identificada |
| `quick-fix` | Contexto → Execução → Registro | Ajustes pontuais, texto, estilo |

### Backend

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `api-development` | Design de contrato → Implementação → Segurança → Testes → Docs | APIs novas ou breaking changes |
| `database-migration` | Análise → Schema → Migration → Validação | Mudanças de banco de dados |
| `bug-fix` | Diagnóstico → Fix → Testes → Review | Bugs com causa identificada |
| `quick-fix` | Contexto → Execução → Registro | Ajustes pontuais |

### Produto

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `discovery-spec-handoff` | Pesquisa → Personas → Spec → Requisitos → Visual → Arquitetura → Handoff | Features estratégicas com alto impacto |
| `nova-feature` | Valida requisito → verifica docs → gera spec versionada → handoff | Features bem definidas que precisam de spec |
| `refinar-docs` | Versiona doc existente preservando original | Atualização de documentação existente |
| `quick-spec` | Spec rápida em 2 steps | Features com requisitos já claros |
| `quick-fix` | Decisão ou ajuste pontual de produto | Mudanças de texto, fluxo ou prioridade |

### Fullstack

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `integration-feature` | Contrato API → Frontend → Backend → Integração → Review | Features que cruzam FE e BE |
| `bug-fix` | Diagnóstico → Fix (FE/BE) → Integração → Review | Bugs em múltiplas camadas |
| `quick-fix` | Ajuste pontual | Mudanças isoladas |

### Mobile

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `feature-development` | Arquitetura → Design UI → Implementação → Review → Testes | Features novas |
| `bug-fix` | Diagnóstico → Fix → Testes → Review | Bugs com causa identificada |
| `quick-fix` | Contexto → Execução → Registro | Ajustes pontuais |

### DevOps

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `ci-cd-setup` | Infra → Containers → Pipeline CI/CD → Observabilidade → Review | Setup ou reestruturação de infraestrutura |
| `infra-provision` | Design → IaC → Validação → Aprovação → Apply | Provisionamento de recursos cloud |
| `quick-fix` | Ajuste pontual de infra ou CI/CD | Correção de configuração, variáveis |

### IA / Dados

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `ml-feature` | Exploração → Design → Implementação → Avaliação → Deploy | Modelos ou features de ML |
| `data-pipeline` | Design → Implementação → Qualidade → Validação → Deploy | Pipelines de dados novos |
| `quick-fix` | Ajuste pontual em modelo, prompt ou pipeline | Correções isoladas |

### Engineer

| Pipeline | Descrição | Quando usar |
|----------|-----------|-------------|
| `feature-development` | Investigação → Arquitetura → Planejamento → Execução | Qualquer feature guiada por ADRs |

---

### Pré-execução (opcional, mas recomendado)

Antes de qualquer pipeline principal, o framework pode rodar o **pre-execution** para gerar contexto, arquitetura e plano da feature.

```
pre-01  GATE-0 — verificação de integridade
pre-02  Preparação de contexto (fast)
pre-03  Investigação detalhada → context.md
pre-04  Checkpoint: aprovação do contexto
pre-05  Estruturação arquitetural → architecture.md
pre-05b Especificação visual (condicional) → visual-spec.md
pre-06  Checkpoint: aprovação da arquitetura
pre-07  Planejamento de execução → plan.md
pre-08  Checkpoint: aprovação do plano
        ↓
        Pipeline principal começa com os 3 arquivos no contexto
```

Quando ativar: o pipeline-runner pergunta automaticamente se `context.md` ainda não existe na session da feature.

---

## Modos de operação

Ao criar um squad, você escolhe o modo:

### ⚡ Alta Performance

Squad completo com todas as etapas, revisões aprofundadas e documentação máxima. Checkpoints exigem aprovação humana a cada fase.

Use quando: feature crítica para produção, risco estratégico alto, precisão é mais importante que velocidade.

### 💰 Econômico

Agents essenciais, execução direta com menos overhead. Foco em entrega sem cerimônia extra.

Use quando: hotfix, feature incremental com contexto já mapeado, bug com causa clara.

### 🔵 Solo

Zero checkpoints de aprovação (exceto gates com critérios de qualidade). Execução do início ao fim sem interrupções.

Use quando: dev solo, prototipagem, exploração, tarefas simples sem necessidade de revisão.

> Checkpoints com `gate:` definido sempre executam, independente do modo.

---

## Gate system

Gates são validações obrigatórias em pontos críticos do pipeline. Seguem a regra **"Fail Loud, Never Silent"** — qualquer falha bloqueia a execução e informa o motivo.

### GATE-0 — Integridade do Framework e Documentação

Executa no início de **todo** pipeline. Verifica:

- Arquivos core do framework existem
- `docs/_memory/company.md` existe
- `docs/_memory/preferences.md` existe
- Squad configurado com agents válidos
- `docs/` existe e tem pelo menos um arquivo `.md`

**Falha padrão:** bloqueia — execute `/setup:build-business` e/ou `/setup:build-tech`

**Modo Solo:** passa com aviso se `company.md` existe; bloqueia total se não existe

### GATE-1 — Configuração do Squad

Verifica se o squad está completamente configurado antes do primeiro step real:

- `squad.yaml` tem name, domain, description, feature, session
- Todos os agents listados têm `.agent.md` correspondente
- Pipeline referenciado existe

### GATE-2 — Contexto Completo

Antes de steps de implementação:

- Objetivo do squad está claro
- Pelo menos um arquivo de contexto em `docs/`
- `memories.md` foi lido
- `context.md` está no contexto do agent

### GATE-ADR — Respeito às ADRs

Antes de qualquer step de implementação:

- Agent lista cada ADR como `[RESPEITADA]` ou `[NÃO APLICÁVEL]`
- Conflito com ADR aceita = output vetado com `🚫 CONFLITO-ADR: {id} — {motivo}`

### GATE-DECISION — Decisões Autônomas

Automático após cada step. Verifica se o agent tomou decisões fora do escopo sem sinalizar `[DECISÃO PENDENTE]`. Detectado = step reexecutado com instrução corretiva.

### GATE-DESIGN — Qualidade Visual

Para steps de frontend e produto com especificação visual:

- Componentes têm todos os estados mapeados (default, hover, loading, erro, vazio)
- Contraste mínimo definido (WCAG AA)
- Acessibilidade endereçada

---

## Skills (integrações)

Skills são integrações via MCP (Model Context Protocol) que expandem o que os agents podem fazer. Requerem configuração no MCP da sua IDE.

| Skill | Tipo | Domínios | O que faz |
|-------|------|----------|-----------|
| `brave-search` | MCP | produto, ia-dados, backend, fullstack | Pesquisa web via Brave — resultados reais sem rastreamento |
| `github` | MCP | frontend, backend, fullstack, mobile, devops | Issues, PRs, repositórios, code, actions |
| `fetch-url` | MCP | produto, backend, ia-dados, fullstack | Leitura de URLs e extração de conteúdo web |
| `filesystem` | MCP | todos | Acesso avançado ao sistema de arquivos |
| `playwright-browser` | MCP | frontend, fullstack, mobile, produto | Automação de browser — navegação, screenshots, testes E2E |

Quando uma skill cobre a tarefa, o agent **deve** usá-la — skills não são sugestões.

---

## Configurar modelo de IA

Execute `/set-model` a qualquer momento para ajustar a configuração sem re-executar o onboarding.

### model_capability

Controla o nível de adaptação de contexto:

```
high     → contexto completo (padrão para Claude Opus/Sonnet, GPT-4o, Gemini Pro)
standard → CoT prefix + templates (Claude Haiku, GPT-4o-mini, Gemini Flash)
lite     → context pruning 70% + scope forcing (Kimi, MiniMax, Llama, modelos locais)
```

### Roteamento multi-modelo

Configure dois modelos diferentes para steps leves e pesados:

```yaml
# docs/_memory/preferences.md
model_fast:     claude-haiku-4-5     # preparação, formatação, gates
model_powerful: claude-opus-4-6     # implementação, arquitetura, decisões
```

Economia estimada: 40-60% nos tokens de steps leves.

### Estimativa de consumo

| Pipeline | Tokens por run (high) | Tokens por run (lite) |
|----------|----------------------|----------------------|
| Quick Fix | ~25-30k | ~12-15k |
| Feature Frontend/Backend | ~95-130k | ~45-65k |
| Product Discovery + Spec | ~160-190k | ~80-95k |

O pipeline-runner exibe um alerta `⚠️ [BUDGET]` quando o contexto da session ultrapassa 400 linhas (~16k tokens por step).

---

## Sessões e memória

### Session folder

Cada feature tem uma pasta persistente compartilhada por todos os squads que trabalham nela:

```
docs/.squads/sessions/{feature-slug}/
├── context.md          → investigação e background da feature
├── architecture.md     → decisões arquiteturais e componentes
├── plan.md             → fases de execução com agents e estimativas
├── visual-spec.md      → especificação visual (features com UI)
├── memories.md         → aprendizados acumulados (append-only)
├── review-notes.md     → notas de revisão de todos os squads (append-only)
├── state.json          → estado de execução de cada squad
└── pending-approvals.md → checkpoints aguardando aprovação assíncrona
```

O `{feature-slug}` é o identificador da feature — geralmente o nome da branch (`feat/auth-module`) ou um slug descritivo.

### Memória persistente

`memories.md` acumula aprendizados específicos da feature. `project-learnings.md` acumula aprendizados globais para todos os squads do projeto.

Ambos são **append-only** — nunca sobrescritos. Consolidação automática é oferecida ao atingir 10+ entradas.

### Retomar execução

Se um pipeline é interrompido no meio, o state.json preserva o `suspended_at`. Na próxima execução do `/init`, o orquestrador detecta e pergunta se quer retomar de onde parou.

### Checkpoints assíncronos

Para equipes distribuídas, ative no squad:

```yaml
# .synapos/squads/{slug}/squad.yaml
async_checkpoints: true
```

Em vez de bloquear, o pipeline registra o checkpoint em `pending-approvals.md` e encerra. O próximo dev executa `/init → squad → Retomar de onde parou`.

---

## Estrutura de arquivos

Após instalação e primeiros usos, seu projeto terá:

```
seu-projeto/
├── .synapos/
│   ├── core/
│   │   ├── orchestrator.md         → orquestrador principal
│   │   ├── pipeline-runner.md      → engine de execução
│   │   ├── gate-system.md          → sistema de gates
│   │   ├── model-adapter.md        → adaptação para modelos fracos
│   │   ├── skills-engine.md        → gerenciamento de skills
│   │   ├── commands/               → protocolos dos comandos
│   │   └── pipelines/
│   │       └── pre-execution.yaml  → pipeline de pré-execução
│   ├── squad-templates/            → templates por domínio
│   │   ├── frontend/
│   │   ├── backend/
│   │   ├── produto/
│   │   └── ...
│   ├── squads/                     → squads criados (gerado pelo /init)
│   │   └── {slug}/
│   │       ├── squad.yaml
│   │       ├── agents/
│   │       └── pipeline/
│   ├── skills/                     → integrações MCP
│   ├── _memory/                    → templates de memória
│   ├── .manifest.json              → inventário de versões
│   └── VERSION
│
├── docs/
│   ├── _memory/
│   │   ├── company.md              → perfil da empresa
│   │   ├── preferences.md          → modelo, idioma, task tracker
│   │   └── project-learnings.md   → aprendizados globais
│   ├── business/                   → gerado pelo /setup:build-business
│   ├── tech/                       → gerado pelo /setup:build-tech
│   ├── tech-context/               → gerado pelo /setup:discover
│   └── .squads/
│       └── sessions/
│           └── {feature-slug}/     → session de cada feature
│
└── .claude/                        → comandos para Claude Code
    └── commands/
        ├── init.md
        ├── set-model.md
        ├── bump.md
        └── setup/
```

---

## Versão

`2.2.0` — [CHANGELOG](.synapos/CHANGELOG.md)

```
npx synapos --version
```
