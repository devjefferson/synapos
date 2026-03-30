# Synapos — Guia de Uso

> Fluxo completo: da inicialização à entrega

---

## O que é o Synapos

Synapos é um framework de orquestração de agentes de IA para Claude Code. Ele organiza squads especializados que trabalham em sequência, com gates de qualidade, checkpoints humanos e outputs rastreáveis — do discovery de produto até o handoff de desenvolvimento.

**Para quem é:**
| Perfil | O que Synapos faz por você |
|--------|---------------------------|
| **PM / Produto** | Guia você do briefing até uma spec revisada, com critérios de aceite e handoff estruturado |
| **Dev (Frontend / Backend / Fullstack)** | Garante que toda feature começa com arquitetura aprovada e termina com review e docs |
| **Analista** | Extrai e organiza requisitos funcionais e não-funcionais com rastreabilidade automática |

---

## Visão geral do fluxo

```
                        ┌─────────────────────────────────────────────────────┐
                        │                   SYNAPOS                           │
                        └─────────────────────────────────────────────────────┘

  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │  1. SETUP    │───▶│  2. SQUAD    │───▶│  3. PIPELINE │───▶│  4. ENTREGA  │
  │              │    │              │    │              │    │              │
  │ Documentação │    │ Domínio      │    │ Step-by-step │    │ Outputs      │
  │ do projeto   │    │ Agents       │    │ Gates        │    │ Rastreáveis  │
  │ (uma vez só) │    │ Contexto     │    │ Checkpoints  │    │ Memória      │
  └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

O fluxo completo tem **quatro fases**. As fases 1 e 2 acontecem uma única vez por projeto/squad. A fase 3 se repete para cada feature, bug ou spec.

---

## Fase 1 — Setup do Projeto

> **Quem faz:** Qualquer membro do time, uma vez só.
> **Quanto tempo:** 15–30 minutos.

### 1.1 Iniciar o Orchestrator

Execute o comando de inicialização no Claude Code:

```
/init
```

O Orchestrator verifica automaticamente se o contexto do projeto já existe.

**Se for a primeira vez**, ele coleta:
- Nome da empresa/produto
- Setor e contexto de negócio
- Linguagem de saída (PT-BR ou EN-US)
- IDE em uso

E cria dois arquivos que servem de base para todos os squads:

```
docs/
└── _memory/
    ├── company.md       ← perfil da empresa e do produto
    └── preferences.md   ← preferências de output
```

### 1.2 Criar a documentação do projeto

Nenhum squad executa sem documentação. O Orchestrator apresenta o menu:

```
O que você quer fazer?

🔎 Analisar projeto existente       /setup:from-code        ← se já tem código
📋 Criar documentação de negócio   /setup:build-business
🔧 Criar documentação técnica      /setup:build-tech
🚀 Configurar documentação completa /setup:start
```

**Se o projeto já tem código:** execute `/setup:from-code` primeiro. Ele varre todo o codebase e gera `docs/_memory/codebase-analysis.md` — um documento de análise que o `/setup:build-tech` e o `/setup:build-business` vão consumir automaticamente para pular perguntas que já estão respondidas no código. A entrevista passa de ~10 perguntas para 3–5 perguntas focadas no que o código não revela (visão, público-alvo, concorrentes).

Ao final, `docs/` terá:

```
docs/
├── business/            ← personas, mercado, contexto de produto
├── tech/                ← stack, padrões, decisões técnicas
├── tech-context/        ← regras críticas, briefing técnico
└── _memory/             ← company.md + preferences.md
```

**Por que isso importa:** Todos os agentes leem `docs/` antes de executar. Sem documentação, os outputs são genéricos. Com ela, os agentes entendem o produto, a stack e as regras do negócio — e produzem outputs contextualizados.

---

## Fase 2 — Criar o Squad

> **Quem faz:** Dev lead, PM ou analista, dependendo do domínio.
> **Quanto tempo:** 5 minutos.

### 2.1 Escolher o domínio

O Orchestrator lista os templates disponíveis:

```
Qual domínio você precisa trabalhar?

📋  Squad de Produto    specs, research, discovery, handoff
🖥️  Squad de Frontend   features, componentes, performance
⚙️  Squad de Backend    APIs, banco de dados, segurança
🔗  Squad Fullstack     integração frontend ↔ backend
📱  Squad Mobile        React Native / Flutter
🚀  Squad DevOps        CI/CD, containers, infra
🤖  Squad IA/Dados      ML, LLM, pipelines de dados
✨  Customizado         montar squad próprio
```

### 2.2 Selecionar agentes

Cada template tem **agentes base** (sempre incluídos) e **agentes opcionais**.

**Exemplo — Squad de Produto:**

| Agente | Papel | Base/Opcional |
|--------|-------|---------------|
| Priscila Produto | Product Manager — spec e critérios de aceite | Base |
| Ana Análise | Analista de negócio — RF/RNF | Base |
| Tânia Técnica | Tech Writer — ADRs e handoff | Base |
| Paulo Pesquisa | Pesquisador — market analysis | Opcional |
| Eduardo Estratégia | Estrategista — OKRs e roadmap | Opcional |
| Úrsula UX | UX Researcher — personas e jornadas | Opcional |

### 2.3 Definir contexto e modo

```
Descreva o objetivo do squad (1-2 frases):
> Feature de pagamento via cartão de crédito

Modo de performance:
⚡ Alta Performance   squad completo, revisões aprofundadas
💰 Econômico          agentes essenciais, execução rápida
🧑‍💻 Solo              para dev solo — checkpoints de aprovação removidos, execução direta
```

**Sobre o modo Solo:** elimina os checkpoints de aprovação intermediários (as pausas onde você aprova o trabalho que você mesmo pediu). Mantém apenas os gates de integridade (GATE-0 e GATE-5). Ideal para dev solo que precisa de resultado rápido sem burocracia de time. O GATE-0 também é mais flexível em modo solo — avisa quando falta documentação em vez de bloquear.

### 2.4 Squad criado

O Synapos gera a estrutura automaticamente:

```
.synapos/squads/produto-001/
├── squad.yaml           ← configuração, agentes selecionados, contexto
├── agents/              ← cópias dos agentes para este squad
└── pipeline/            ← pipeline padrão + steps

docs/.squads/produto-001/
├── _memory/
│   └── memories.md      ← aprendizados acumulados entre runs
└── output/              ← histórico de execuções (preenchido na Fase 3)
```

---

## Fase 3 — Executar o Pipeline

> **Quem faz:** Depende do domínio (PM roda o de produto, dev roda o de feature).
> **Quanto tempo:** Varia por pipeline. Quick Spec: 20–40 min. Feature completa: 1–2h.

Esta é a fase principal. O Pipeline Runner executa os steps em sequência, com gates automáticos e checkpoints para decisão humana.

### 3.1 Estrutura de um pipeline

Todo pipeline é uma lista de steps com responsabilidades claras:

```yaml
steps:
  - id: 01-gate-integridade
    execution: checkpoint     ← pausa para validação
    gate: GATE-0

  - id: 02-contexto
    agent: priscila-produto   ← quem executa
    execution: checkpoint     ← coleta input do usuário
    output_files: [business-context.md]

  - id: 03-spec
    agent: priscila-produto
    execution: subagent       ← executa como subagente autônomo
    model_tier: powerful
    output_files: [spec.md]
    veto_conditions:          ← critérios de qualidade automáticos
      - "Spec sem critérios de aceite"
      - "Sem seção IN/OUT"
    on_reject: 03-spec        ← volta para o step se rejeitado
```

### 3.2 Tipos de execução

| Tipo | O que faz | Quando usar |
|------|-----------|-------------|
| `checkpoint` | Pausa e pergunta ao usuário | Coleta de input, validação de direção |
| `inline` | Agente executa na conversa | Revisões, análises rápidas |
| `subagent` | Agente executa de forma autônoma | Produção de documentos, implementações |

### 3.3 O sistema de Gates

Gates são verificações obrigatórias. Falha bloqueia o avanço.

```
GATE-0  ─▶  Integridade do framework e documentação
            ↳ docs/ existe? company.md existe? squad.yaml correto?

GATE-1  ─▶  Configuração do squad
            ↳ Todos os agentes têm .agent.md? Pipeline referenciado existe?

GATE-2  ─▶  Contexto completo
            ↳ Objetivo claro? docs/ tem conteúdo? memories.md foi lido?

GATE-3  ─▶  Qualidade do output
            ↳ Output não vazio? Critérios de qualidade atendidos?

GATE-4  ─▶  Consistência de documentação (Produto)
            ↳ spec.md existe? architecture.md? handoff-checklist.md?

GATE-5  ─▶  Entrega / Handoff
            ↳ Todos os output_files gerados? Steps marcados completos?
```

**GATE-0 é o mais importante.** Se `docs/` estiver vazio, o pipeline para aqui e sugere o setup. Isso evita que agentes produzam outputs descontextualizados.

### 3.4 Exemplo visual — Quick Spec

```
INICIO
  │
  ▼
[GATE-0] Verifica framework e docs/
  │ ✅ OK
  ▼
[Checkpoint] Priscila coleta contexto do usuário
  │  • problema, usuário, solução, escopo IN/OUT, métricas
  │  • gera: business-context.md
  ▼
[Subagent] Priscila escreve a spec
  │  • lê: docs/ + business-context.md
  │  • veto automático: sem critérios de aceite? sem IN/OUT?
  │  • gera: spec.md
  │  • usuário pode rejeitar → volta para reescrever
  ▼
[Subagent] Ana extrai requisitos
  │  • lê: spec.md
  │  • veto automático: RF sem critério? RNF sem número?
  │  • gera: requirements.md
  ▼
[Subagent] Tânia cria handoff ──── [GATE-2] Contexto completo?
  │  • gera: decisions-log.md
  │  • gera: handoff-checklist.md
  ▼
[Checkpoint] Atualizar tarefa no board
  │
  ▼
ENTREGA
```

### 3.5 Exemplo visual — Feature Development (Frontend)

```
INICIO
  │
  ▼
[GATE-0] Verifica framework e docs/
  │
  ▼
[Subagent] Ana Arquitetura documenta estrutura de componentes
  │  • gera: architecture-decision.md
  ▼
[Checkpoint] Usuário aprova o approach
  │  ↳ Se não aprova: ajusta contexto e reexecuta
  ▼
[Subagent] Rodrigo React implementa
  │  • veto: componente async sem loading? prop any sem motivo? key instável?
  │  • usuário pode rejeitar → volta para reimplementar
  ▼
[Inline] Renata Revisão faz code review
  │  • categorias: BLOCKER / SUGGESTION / QUESTION / PRAISE
  │  • gera: review-notes.md
  │  • BLOCKER → volta para Rodrigo reimplementar
  ▼
[Subagent] Ana Arquitetura documenta a feature ──── [GATE-5]
  │  • gera: feature-notes.md
  ▼
[Checkpoint] Atualizar tarefa
  │
  ▼
ENTREGA
```

---

## Fase 4 — Entrega e Memória

### 4.1 Onde ficam os outputs

Todos os documentos gerados ficam em:

```
docs/.squads/{slug}/output/{YYYY-MM-DD-HHmmss}/
├── business-context.md
├── spec.md
├── requirements.md
├── decisions-log.md
├── handoff-checklist.md
└── state.json           ← registro de execução (steps, status, timestamps)
```

Cada run tem sua própria pasta com timestamp. O histórico de execuções nunca é sobrescrito.

### 4.2 Sumário de entrega

Ao final de cada pipeline, o Synapos apresenta:

```
✅ Pipeline concluído!

Documentos gerados:
  📄 business-context.md
  📄 spec.md
  📄 requirements.md
  📄 decisions-log.md
  📄 handoff-checklist.md

Run salvo em: docs/.squads/produto-001/output/2026-03-25-143000/

O que deseja fazer agora?
  [1] Executar pipeline novamente
  [2] Ver um documento gerado
  [3] Voltar ao menu principal
  [4] Pausar squad
```

### 4.3 Memória do squad e do projeto

Ao final, o Synapos faz duas perguntas:

```
Algo que devo lembrar para a próxima execução deste squad?
```
Salvo em `docs/.squads/{slug}/_memory/memories.md` — memória específica do squad.

```
Algo que todos os squads deste projeto devem saber?
```
Salvo em `docs/_memory/project-learnings.md` — memória transversal carregada por **todos os squads** do projeto. Use para decisões de arquitetura, padrões do time, ou aprendizados que valem para frontend, backend e produto ao mesmo tempo.

---

## Fluxos por Perfil

### PM / Produto

**Pipelines recomendados:**

| Pipeline | Quando usar | Outputs |
|----------|-------------|---------|
| `quick-spec` | Feature bem definida, time alinhado | spec.md, requirements.md, handoff-checklist.md |
| `discovery-spec-handoff` | Nova funcionalidade que precisa de research | personas, market analysis, spec, arquitetura, handoff (15+ docs) |
| `refinar-docs` | Versionar spec existente sem perder o original | versão versionada do doc |

**O que você ganha:**
- Spec com critérios de aceite no formato Dado/Quando/Então
- Requisitos funcionais e não-funcionais com priorização
- Handoff checklist pronto para o time de dev
- Histórico rastreável de todas as versões

---

### Dev Frontend / Backend

**Pipelines recomendados:**

| Pipeline | Quando usar | Outputs |
|----------|-------------|---------|
| `quick-fix` | Mudança pontual e rápida — sem aprovações | quick-fix-output.md, quick-fix-log.md |
| `feature-development` | Feature nova no frontend | architecture-decision.md, review-notes.md, feature-notes.md |
| `component-development` | Componente reutilizável | spec, implementação, storybook |
| `bug-fix` | Correção de bug com diagnóstico | diagnóstico, fix documentado, review |
| `api-development` | Endpoint novo ou redesenho | contrato da API, ADR, review de segurança |
| `database-migration` | Mudança de schema | análise de impacto, migration script, validação |

**O que você ganha:**
- Arquitetura decidida antes de implementar (sem retrabalho)
- Code review estruturado com categorias claras
- Veto automático para anti-patterns comuns
- ADRs (Architecture Decision Records) geradas automaticamente

---

### Analista de Negócio

**O que o Synapos entrega para você:**

| Documento | Conteúdo |
|-----------|----------|
| `requirements.md` | RFs com critérios de aceite, RNFs com valores numéricos, priorização MoSCoW |
| `spec.md` | Visão do produto, escopo IN/OUT, critérios de aceite por cenário |
| `decisions-log.md` | Registro de todas as decisões tomadas e por quê |
| `handoff-checklist.md` | Lista verificável de entregáveis para o time de dev |

Esses documentos são gerados pelos agentes com **rastreabilidade explícita**: toda afirmação tem fonte (spec, business-context, ou memória do squad).

---

## Vantagens de usar o Synapos

### 1. Contexto não se perde

Sem Synapos, cada conversa começa do zero. Com Synapos, o histórico do squad (`memories.md`), os outputs anteriores (`output/{run_id}/`) e o contexto do projeto (`docs/`) são carregados automaticamente em cada execução.

### 2. Qualidade garantida por veto automático

Antes de aceitar um output, o Synapos verifica critérios de qualidade. Exemplos:
- Spec sem critério de aceite → rejeitada automaticamente
- RF sem critério de aceite → não passa
- Componente React assíncrono sem loading state → bloqueado
- RNF sem valor numérico (ex: "deve ser rápido") → não aceito

**Resultado:** outputs que chegam para revisão humana já passaram por uma triagem automática.

### 3. Checkpoints humanos nos momentos certos

O Synapos não automatiza tudo. Ele para exatamente nos pontos onde a decisão precisa ser humana:
- Antes de implementar: "A arquitetura está correta?"
- Antes de avançar do research: "Essa direção faz sentido?"
- Antes de encerrar: "Algo para lembrar na próxima vez?"

### 4. Separação clara de responsabilidades

Cada agente tem um papel específico e não ultrapassa seu escopo:
- Priscila escreve spec, não implementa
- Rodrigo implementa, não define arquitetura
- Renata revisa, não reescreve

Isso reduz outputs misturados e facilita saber quem é responsável pelo quê.

### 5. Histórico rastreável

Cada execução fica em `output/{timestamp}/` com `state.json`. Você pode comparar a spec da semana passada com a de hoje, ver quais steps foram executados e quanto tempo cada um levou.

### 6. Squads aprendem com o tempo

O arquivo `memories.md` de cada squad acumula aprendizados entre sessões. Se em uma execução você aprender que "o time de mobile usa componentes compartilhados do design system, não cria novos", isso é salvo e injetado automaticamente nos próximos runs.

---

## Vantagens de seguir o fluxo

| Se você seguir o fluxo | Se você pular etapas |
|------------------------|----------------------|
| GATE-0 garante que o contexto está completo antes de qualquer execução | Agente produz output genérico sem entender o produto |
| Checkpoint de arquitetura antes de implementar evita retrabalho | Dev implementa, PM discorda da abordagem, feature refeita |
| Veto automático filtra outputs de baixa qualidade | Review humano gasta tempo corrigindo coisas que poderiam ser automáticas |
| Handoff checklist gerada pelo Tânia garante entregáveis completos | Dev recebe spec incompleta, abre perguntas no meio da sprint |
| Memória do squad reduz repetição de contexto | Toda sessão começa explicando o mesmo projeto de novo |
| `state.json` mantém rastreabilidade | Impossível saber o que foi gerado e quando |

---

## Para o Dev Solo

O Synapos foi projetado para ser usado solo. Se você é o PM, dev e DevOps do seu projeto ao mesmo tempo, estas configurações eliminam a burocracia de time sem abrir mão da qualidade.

### Configuração recomendada

**No onboarding (`/init`):**
- Task Tracker: `none` — elimina o step `atualizar-tarefa` de todos os pipelines automaticamente

**Ao criar qualquer squad:**
- Modo: `Solo` — remove checkpoints de aprovação intermediários

### Quando usar cada pipeline

```
Mudança rápida e pontual       → quick-fix      (3 steps, sem aprovações)
Bug com diagnóstico necessário → bug-fix         (4 steps, diagnóstico + fix + review)
Feature nova                   → feature-development  (completo com arquitetura)
Spec de produto                → quick-spec      (5 steps, coleta contexto e gera spec)
```

### Sobre o GATE-0 em modo solo

Em modo solo, o GATE-0 não bloqueia se `docs/` ainda não estiver completo. Ele avisa sobre o que falta e deixa você prosseguir. Isso permite usar o Synapos em projetos novos antes de ter documentação completa — e ir criando a documentação conforme o projeto evolui.

### Task tracker

Se você não usa GitHub Issues, Linear ou Jira, defina `task_tracker: none` em `docs/_memory/preferences.md`. O step `atualizar-tarefa` vai ser ignorado automaticamente em todos os pipelines, sem precisar dispensá-lo manualmente a cada execução.

---

## Usando com Modelos de Capacidade Inferior

O Synapos funciona com qualquer modelo de IA. Se você usa um modelo menos capaz que Sonnet/Opus (ex: Kimi, MiniMax, Llama 3.x, GPT-4o-mini), o **Model Capability Adapter** ajusta automaticamente os prompts para compensar as limitações e manter a qualidade dos outputs.

### Perfis de capacidade

| Perfil | Modelos | O que muda |
|--------|---------|------------|
| `high` | Claude Sonnet/Opus, GPT-4o, Gemini 1.5 Pro+ | Nada — comportamento padrão |
| `standard` | GPT-4o-mini, Gemini Flash, Claude Haiku | CoT obrigatório + templates de estrutura injetados |
| `lite` | Kimi, MiniMax, Llama 3.x, modelos locais e outros | Persona simplificada + context pruning + CoT + template fill-in-the-blank + scope forcing + self-check |

### Como configurar

O modelo é coletado automaticamente no onboarding (`/init`). O Orchestrator pergunta:

```
Qual modelo de IA você está usando?
[Claude Sonnet/Opus / GPT-4o / Gemini Pro / Kimi / MiniMax / Outro]
```

E salva em `docs/_memory/preferences.md`:

```markdown
**model_capability:** lite
**model_name:** Kimi K2
```

Para alterar manualmente, edite `docs/_memory/preferences.md` diretamente.

### O que o adapter faz em cada modo

**Modo Standard** — dois ajustes pontuais:
- **S1 — CoT Prefix:** adiciona "Pense passo a passo antes de responder" antes de cada instrução
- **S2 — Template Injection:** se o step tem `lite_template:`, injeta o template para guiar a estrutura do output

**Modo Lite** — seis mecanismos em cascata:

| Mecanismo | O que faz | Por que funciona |
|-----------|-----------|-----------------|
| **L1 — Persona Simplificada** | Substitui a persona completa do agent pela seção `## Modo Lite` | Persona longa em modelo fraco gera outputs genéricos — regras explícitas são mais confiáveis |
| **L2 — Context Pruning** | Ao invés de expor toda a pasta `docs/`, monta um resumo estruturado de 30 linhas | Contexto longo em modelo fraco dilui a instrução principal |
| **L3 — Chain-of-Thought** | Força o modelo a raciocinar antes de gerar o output | Modelos fracos "palpitam" sem raciocinar — CoT obrigatório reduz alucinações |
| **L4 — Template Obrigatório** | Injeta template fill-in-the-blank específico do step | Sem template, modelos fracos inventam estrutura ou omitem seções críticas |
| **L5 — Scope Forcing** | Se um step gera múltiplos arquivos, serializa em sub-execuções de um arquivo por vez | Modelos fracos com múltiplos outputs tendem a misturar conteúdo ou gerar incompleto |
| **L6 — Self-Check** | Ao final, o modelo verifica o próprio output contra um checklist de 5 critérios | Simula a etapa de revisão que modelos fracos naturalmente pulam |

### Seção `## Modo Lite` nos agents

Cada agent tem uma seção `## Modo Lite` ao final do arquivo. Ela é ativada pelo L1 e substitui a persona completa quando `model_capability: lite`.

Estrutura:
```markdown
## Modo Lite

> Ativado pelo MODEL-ADAPTER quando `model_capability: lite` em preferences.md.
> Use APENAS esta seção como persona — ignore o restante do arquivo.

Você é [papel em 1–2 frases diretas].

### Regras Obrigatórias

1. [regra explícita e verificável]
2. [regra explícita e verificável]
...

### Template de [Entregável Principal]

```markdown
## [Seção]
[campo preenchível]
```

### Não faça
- [anti-pattern crítico]
```

**Se um agent não tiver `## Modo Lite`**, o adapter usa a seção `## Quality Criteria` do agent como fallback — convertendo cada linha da tabela em uma regra obrigatória explícita.

### Como adicionar `lite_template:` em um step de pipeline

Para steps que geram documentos críticos, você pode definir um template de fallback diretamente no `pipeline.yaml`:

```yaml
- id: 03-spec
  agent: priscila-produto
  execution: subagent
  model_tier: powerful
  output_files: [spec.md]
  lite_template: |
    ## Spec: [Título da Feature]
    **Problema:** [descrição do problema]
    **Solução:** [descrição da solução proposta]
    **Escopo IN:** [o que está incluído]
    **Escopo OUT:** [o que não está incluído]
    ### Critérios de Aceite
    - Dado [contexto] Quando [ação] Então [resultado esperado]
```

O adapter injeta esse template no prompt quando `model_capability` for `standard` ou `lite`. Em modo `high`, o campo é ignorado.

---

## Best Practices

O Synapos inclui um catálogo de boas práticas que os agentes carregam automaticamente quando relevante. Você também pode consultá-las diretamente.

### Catálogo completo

| ID | Arquivo | Quando é carregado | Domínios |
|----|---------|-------------------|----------|
| `code-review` | `dev/code-review.md` | Reviews de código em qualquer linguagem | frontend, backend, fullstack, mobile |
| `testing-strategy` | `dev/testing-strategy.md` | Definição ou execução de estratégia de testes | frontend, backend, fullstack, mobile |
| `api-design` | `dev/api-design.md` | Projeto ou documentação de APIs REST/GraphQL | backend, fullstack |
| `git-workflow` | `dev/git-workflow.md` | Branches, commits e PRs | frontend, backend, fullstack, mobile, devops |
| `product-spec` | `product/product-spec.md` | Escrita de especificações de produto | produto |
| `user-research` | `product/user-research.md` | Pesquisa de usuário ou mercado | produto |
| `technical-writing` | `product/technical-writing.md` | ADRs, decisions log, handoff, documentação técnica | produto, backend, frontend |
| `copywriting` | `content/copywriting.md` | Textos persuasivos para qualquer canal | custom |
| `linkedin-post` | `content/linkedin-post.md` | Posts para LinkedIn | custom |
| `blog-post` | `content/blog-post.md` | Artigos para blog | custom |

### Best Practices de Conteúdo (domínio `custom`)

As práticas de conteúdo são usadas por squads customizados voltados para criação de textos e comunicação.

**`copywriting.md`** — para textos persuasivos em qualquer canal:
- Frameworks AIDA e PAS com exemplos práticos
- Fórmulas de headline e CTAs por contexto
- Guia de tom de voz e processo de revisão

**`linkedin-post.md`** — para posts de LinkedIn:
- Anatomia do post (gancho → corpo → CTA → hashtags)
- Fórmulas de gancho que param o scroll
- Formatos por objetivo: storytelling, listicle, hot take
- Melhores horários e frequência ideal

**`blog-post.md`** — para artigos de blog:
- 7 tipos de artigo com objetivo e quando usar
- Estrutura padrão com template em markdown
- SEO on-page: checklist de keyword, meta description, URL, alt text
- Comprimento ideal por tipo e checklist de publicação

---

## Referências

| Arquivo | Descrição |
|---------|-----------|
| `.synapos/core/orchestrator.md` | Protocolo de inicialização e criação de squads |
| `.synapos/core/pipeline-runner.md` | Engine de execução de steps e outputs |
| `.synapos/core/gate-system.md` | Definição dos 6 quality gates |
| `.synapos/core/model-adapter.md` | Protocolo de adaptação para modelos de capacidade inferior |
| `.synapos/core/skills-engine.md` | Gerenciamento de skills MCP e externas |
| `.synapos/core/best-practices/_catalog.yaml` | Catálogo de boas práticas — carregue apenas o relevante |
| `.synapos/squad-templates/{domínio}/template.yaml` | Configuração de cada template de squad |
| `.synapos/CHANGELOG.md` | Histórico de versões do framework |
| `.synapos/.manifest.json` | Inventário de versões de todos os componentes |
