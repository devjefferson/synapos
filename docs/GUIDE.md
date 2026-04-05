# Synapos — Guia de Referência

**Workflow system para trabalhar com IA em projetos reais.**

Roles simulados, sessions persistentes, pipelines estruturados.

```bash
npx synapos
```

---

## Índice

- [Como funciona](#como-funciona)
- [Instalação](#instalação)
- [Comandos](#comandos)
- [Roles disponíveis](#roles-disponíveis)
- [Pipelines](#pipelines)
- [Modos de execução](#modos-de-execução)
- [Gate system](#gate-system)
- [Sessions e memória](#sessions-e-memória)
- [Skills](#skills)
- [Configurar modelo](#configurar-modelo)
- [Estrutura de arquivos](#estrutura-de-arquivos)

---

## Como funciona

```
/init
  → onboarding (1 pergunta na primeira vez)
  → modo inferido ou escolhido (⚡ Rápido / 🔵 Completo)
  → role selecionado ou inferido
  → pipeline executa steps em sequência
  → contexto salvo na session da feature
```

**Role** — configuração de agents especializados para um domínio. Internamente armazenado como `squad`, exibido como "role" na interface.

**Session** — pasta persistente compartilhada por todos os roles que trabalham numa mesma feature. Sobrevive entre conversas.

**Pipeline** — sequência de steps com agents, gates e critérios de qualidade.

**Gates** — validações obrigatórias em pontos críticos. Falha bloqueia o avanço.

---

## Instalação

```bash
npx synapos
```

Ou instale roles específicos diretamente:

```bash
npx synapos add backend
npx synapos add frontend
npx synapos add fullstack
npx synapos add mobile
npx synapos add devops
npx synapos add produto
npx synapos add ia-dados
```

### IDEs suportadas

| IDE | Arquivo gerado |
|-----|----------------|
| Claude Code | `.claude/commands/` |
| Cursor | `.cursor/rules/synapos.mdc` |
| Trae | `.trae/rules.md` |
| OpenCode | `.opencode/commands/` |

---

## Comandos

### `/init`

Ponto de entrada principal. Executa na ordem:

1. Verifica `docs/_memory/company.md` — se não existe, inicia onboarding (1 pergunta)
2. Infere modo pela mensagem ou pergunta uma vez
3. Infere role pela mensagem ou lista os disponíveis
4. Cria ou carrega o squad e inicia o pipeline-runner

**Onboarding (primeira vez) — 1 AskUserQuestion:**
```
"Qual é o nome do projeto e o que você quer fazer?"
→ Ex: "Meu SaaS — corrigir bug no login"
```
O restante (task tracker, modelo, linguagem) usa defaults silenciosos e pode ser ajustado depois.

---

### `/session`

Navega sessions sem passar pelo fluxo do `/init`.

```
/session                  → lista todas as sessions com resumo
/session {slug}           → abre session específica com context.md em destaque
/session consolidate      → consolida memories.md e review-notes.md manualmente
```

Use `/session` quando quiser ver o estado de uma feature, retomar contexto ou compactar memórias acumuladas.

---

### `/setup:build-tech`

Analisa o codebase e gera documentação técnica em `docs/tech/` e `docs/tech-context/`.

**Arquivos gerados:**
```
docs/tech/
├── architecture.md       → decisões arquiteturais, padrões
├── stack.md              → linguagens, frameworks, ferramentas
├── business_logic.md     → regras de negócio no código
├── codebase-guide.md     → como navegar o projeto
├── api-spec.md           → contratos de API (se existir)
└── adr/                  → Architecture Decision Records

docs/tech-context/
├── critical-rules.md     → regras que agents devem respeitar
├── adrs-summary.md       → resumo das ADRs
└── tech-stack.md
```

Ativa o **Modo Completo** automaticamente nas próximas execuções.

---

### `/setup:build-business`

Gera documentação de contexto de negócio em `docs/business/` a partir de uma entrevista.

**Arquivos gerados:**
```
docs/business/
├── business-context.md      → visão, missão, modelo de negócio
├── product-vision.md        → north star, proposta de valor
├── product-strategy.md      → OKRs, roadmap, prioridades
├── competitive_landscape.md → concorrentes e posicionamento
├── personas/                → perfis de usuários
└── features/                → features mapeadas
```

---

### `/setup:discover`

Análise incremental. Gera `docs/tech-context/` com briefing focado em regras críticas e ADRs. Use para atualizar o contexto sem re-executar o build completo.

---

### `/set-model`

Altera a configuração de modelo sem re-executar o onboarding.

```
/set-model → model_capability (high / standard / lite) → model_name
```

Opcional: configure dois modelos para steps leves e pesados:

```yaml
# docs/_memory/preferences.md
model_fast:     claude-haiku-4-5
model_powerful: claude-opus-4-6
```

---

### `/bump`

Versiona o pacote npm. Atualiza `package.json` e `CHANGELOG.md`.

```
/bump           → pergunta: PATCH / MINOR / MAJOR
/bump minor     → executa diretamente
```

---

## Roles disponíveis

Roles são configurações de agents especializados por domínio.
Internamente: `squad.yaml`. Na interface: "role".

### 🖥️ Frontend

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Ana Arquitetura | Arquiteta — estrutura, componentes, padrões |
| Rodrigo React | Dev — implementação de features |
| Renata Revisão | Reviewer — code review, acessibilidade |

Opcionais: Úrsula UI, Tiago Testes, Paulo Performance, Leo Engenheiro

---

### ⚙️ Backend

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Bruno Base | Arquiteto — design de API, modelagem |
| Alexandre API | Dev — implementação de endpoints |
| Roberto Revisão | Reviewer — qualidade, boas práticas |

Opcionais: Daniela Dados, Sérgio Segurança, Leo Engenheiro

---

### 📦 Fullstack

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Carlos Coordenador | Coordenador — alinhamento FE/BE, API contract |
| Ana Arquitetura | Arquiteta Frontend |
| Bruno Base | Arquiteto Backend |
| Rodrigo React | Dev Frontend |
| Alexandre API | Dev Backend |

Opcionais: Úrsula UI, Tiago Testes, Sérgio Segurança, Leo Engenheiro

---

### 📋 Produto

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Priscila Produto | Product Manager — spec, requisitos |
| Ana Análise | Analista — mapeamento de fluxos |
| Tânia Técnica | Tech Writer — documentação, handoff |

Opcionais: Paulo Pesquisa, Eduardo Estratégia, Úrsula UX, Leo Engenheiro

---

### 📱 Mobile

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Marina Mobile | Arquiteta — estrutura, navegação |
| Felipe Feature | Dev — implementação |
| Viviane Visual | UX Mobile — design, animações |

Opcionais: Tiago Testes, Paulo Performance, Leo Engenheiro

---

### 🚀 DevOps

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Igor Infra | Arquiteto — cloud, IaC |
| Patrícia Pipeline | Engenheira — CI/CD, automação |

Opcionais: Cláudio Containers, Osvaldo Observabilidade, Sérgio Segurança

---

### 🤖 IA / Dados

| Agent (persona) | Papel simulado |
|-----------------|----------------|
| Larissa LLM | LLM Specialist — prompts, RAG |
| Diana Dados | Engenheira de Dados — pipelines, ETL |
| Nelson Notebook | Analista — exploração, visualização |

Opcionais: Marco ML, Tânia Técnica, Leo Engenheiro

---

## Pipelines

Cada role tem pipelines para cenários diferentes.

### Frontend

| Pipeline | Quando usar |
|----------|-------------|
| `feature-development` | Feature nova de médio/alto impacto |
| `component-development` | Componente isolado do design system |
| `bug-fix` | Bug com causa identificada |
| `quick-fix` | Ajuste pontual, texto, estilo |

### Backend

| Pipeline | Quando usar |
|----------|-------------|
| `api-development` | API nova ou breaking change |
| `database-migration` | Mudança de banco de dados |
| `bug-fix` | Bug com causa identificada |
| `quick-fix` | Ajuste pontual |

### Produto

| Pipeline | Quando usar |
|----------|-------------|
| `discovery-spec-handoff` | Feature estratégica, discovery completo |
| `nova-feature` | Feature definida que precisa de spec |
| `quick-spec` | Spec rápida para requisitos já claros |
| `quick-fix` | Ajuste pontual de produto |

### Fullstack

| Pipeline | Quando usar |
|----------|-------------|
| `integration-feature` | Feature que cruza FE e BE |
| `bug-fix` | Bug em múltiplas camadas |
| `quick-fix` | Mudança isolada |

### Mobile

| Pipeline | Quando usar |
|----------|-------------|
| `feature-development` | Feature nova |
| `bug-fix` | Bug identificado |
| `quick-fix` | Ajuste pontual |

### DevOps

| Pipeline | Quando usar |
|----------|-------------|
| `ci-cd-setup` | Setup ou reestruturação de infra |
| `infra-provision` | Provisionamento de recursos cloud |
| `quick-fix` | Correção de configuração |

### IA / Dados

| Pipeline | Quando usar |
|----------|-------------|
| `ml-feature` | Modelo ou feature de ML |
| `data-pipeline` | Pipeline de dados novo |
| `quick-fix` | Correção isolada |

### Pré-execução (opcional)

Se `context.md` não existe na session, o runner oferece rodar a pré-execução antes do pipeline principal:

```
Investigação → context.md
Arquitetura  → architecture.md
Planejamento → plan.md
↓
Pipeline principal começa com os 3 arquivos no contexto
```

---

## Modos de execução

Escolhido no PASSO 2 do `/init`. Inferido automaticamente quando possível.

### ⚡ Rápido

Executa sem ler documentação do projeto. Injeta apenas session files e `company.md`.

**Quando o modo é inferido automaticamente:** mensagem contém "fix", "bug", "typo", "ajuste", "quick".

**Use para:** bug fix, ajuste rápido, quick change sem impacto arquitetural.

### 🔵 Completo

Injeta docs/, ADRs, session files e memories. Gates e validações completas.

**Quando o modo é inferido automaticamente:** mensagem contém "feature", "arquitetura", "refactor", "sistema".

**Use para:** feature nova, mudança arquitetural, qualquer coisa que precise de contexto completo do projeto.

---

## Gate system

Três gates ativos. Princípio: **Fail Loud, Never Silent**.

### GATE-0 — Integridade

Executa no início de todo pipeline. Verifica:
- Arquivos core do framework existem (`.synapos/core/`)
- `docs/_memory/company.md` existe
- Squad configurado com agents válidos

**Modo Rápido:** passa com aviso se docs/ ausente — nunca bloqueia por falta de documentação.
**Modo Completo:** passa se `company.md` + pelo menos `docs/` existem.

### GATE-3 — Qualidade mínima do output

Após cada step `inline` ou `subagent`. Verifica:
- Output não está vazio
- Tem mais de 50 caracteres
- Não é placeholder (`TODO`, `PLACEHOLDER`, `[vazio]`)
- Nenhuma `veto_condition` do step foi violada

Máximo 2 reexecuções automáticas. Na 3ª falha → escala para o usuário.

### GATE-5 — Entrega

Último step de qualquer pipeline. Confirmação visual apenas — **nunca bloqueia**.

### Decisões no output

Decisões fora do escopo são sinalizadas com `[?]` pelo agent:

```
[?] Decisão necessária: qual biblioteca de cache usar?
Opções: A) Redis  B) Memcached
Recomendação: Redis — já usado no projeto
```

O runner detecta `[?]`, apresenta as opções ao usuário e aguarda escolha antes de continuar.

---

## Sessions e memória

### Session folder

Cada feature tem uma pasta persistente compartilhada por todos os roles:

```
docs/.squads/sessions/{feature-slug}/
├── context.md       ← O que é / Por que existe / Decisões tomadas / O que não fazer
├── memories.md      ← Aprendizados / Armadilhas / Próximos passos
├── architecture.md  ← Decisões arquiteturais (gerado na pré-execução)
├── plan.md          ← Plano de execução (gerado na pré-execução)
├── review-notes.md  ← Notas de revisão (append-only)
└── state.json       ← Log de execução (best-effort)
```

> **context.md é obrigatório ao entrar em feature existente.** Todo role lê o context.md antes de qualquer step. É o arquivo que evita retrabalho e contradições entre roles.

### Memória

`memories.md` e `review-notes.md` são **append-only** — nunca sobrescritos.

Para consolidar quando crescerem demais:
```
/session consolidate
```

`project-learnings.md` em `docs/_memory/` acumula aprendizados transversais para todos os roles do projeto.

### Retomar execução interrompida

Se um pipeline é interrompido, `state.json` preserva o último step. Na próxima execução, o orquestrador detecta e oferece retomar de onde parou.

### Checkpoints assíncronos (equipes distribuídas)

```yaml
# .synapos/squads/{slug}/squad.yaml
async_checkpoints: true
```

Em vez de bloquear e aguardar, o pipeline registra o checkpoint em `pending-approvals.md` e encerra. O próximo dev executa `/init → retomar de onde parou`.

---

## Skills

Integrações via MCP que expandem o que os agents podem fazer.

| Skill | O que faz |
|-------|-----------|
| `brave-search` | Pesquisa web — benchmarks, concorrentes, documentação |
| `github` | Issues, PRs, repositórios, code, actions |
| `fetch-url` | Leitura de URLs e extração de conteúdo |
| `filesystem` | Acesso avançado ao sistema de arquivos |
| `playwright-browser` | Browser automation — screenshots, testes E2E |

```bash
npx synapos add skill brave-search
```

Quando uma skill cobre a tarefa em execução, o agent deve usá-la — não é opcional.

---

## Configurar modelo

### model_capability

Controla o nível de adaptação de contexto:

| Valor | Quando usar | Efeito |
|-------|-------------|--------|
| `high` | Claude Opus/Sonnet, GPT-4o, Gemini Pro | Contexto completo sem adaptação |
| `standard` | Claude Haiku, GPT-4o-mini, Gemini Flash | CoT prefix + templates de estrutura |
| `lite` | Kimi, MiniMax, Llama, modelos locais | Resumo de contexto, ~70% menos tokens |

Ajuste com `/set-model` a qualquer momento.

### Roteamento multi-modelo

```yaml
# docs/_memory/preferences.md
model_fast:     claude-haiku-4-5     # steps leves: gates, formatação
model_powerful: claude-opus-4-6     # steps pesados: implementação, arquitetura
```

---

## Estrutura de arquivos

```
seu-projeto/
├── .synapos/
│   ├── core/
│   │   ├── orchestrator.md         → fluxo do /init
│   │   ├── pipeline-runner.md      → engine de execução
│   │   ├── gate-system.md          → GATE-0, GATE-3, GATE-5
│   │   ├── skills-engine.md        → gerenciamento de skills
│   │   ├── model-adapter.md        → adaptação para modelos fracos
│   │   └── commands/
│   │       ├── session.md          → protocolo do /session
│   │       ├── bump.md             → protocolo do /bump
│   │       └── setup/              → protocolos do /setup:*
│   ├── squad-templates/            → templates por domínio
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── produto/
│   │   └── ...
│   ├── squads/                     → roles criados (gerado pelo /init)
│   │   └── {slug}/
│   │       ├── squad.yaml          → configuração do role
│   │       ├── agents/             → .agent.md dos agents
│   │       └── pipeline/           → pipeline.yaml + steps/
│   └── skills/                     → integrações instaladas
│
├── docs/
│   ├── _memory/
│   │   ├── company.md              → perfil do projeto
│   │   ├── preferences.md          → modelo, idioma, task tracker
│   │   └── project-learnings.md   → aprendizados globais
│   ├── business/                   → gerado pelo /setup:build-business
│   ├── tech/                       → gerado pelo /setup:build-tech
│   ├── tech-context/               → gerado pelo /setup:discover
│   └── .squads/
│       └── sessions/
│           └── {feature-slug}/     → context, memories, state por feature
│
└── .claude/                        → comandos instalados para Claude Code
    └── commands/
        ├── init.md
        ├── session.md
        ├── set-model.md
        ├── bump.md
        └── setup/
```
