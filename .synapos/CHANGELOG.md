# CHANGELOG

Todas as mudanças significativas do Synapos Framework são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

---

## [1.7.0] — 2026-03-30

### Adicionado

#### Core — Model Capability Adapter
- `core/model-adapter.md` v1.0.0 — protocolo de adaptação de prompts para modelos de IA de capacidade inferior
  - Três perfis: `high` (Sonnet/Opus/GPT-4o), `standard` (GPT-4o-mini/Gemini Flash/Haiku), `lite` (Kimi, MiniMax, Llama 3.x, modelos locais)
  - Modo Lite: 6 mecanismos — L1 Persona Simplificada, L2 Context Pruning (resumo 30 linhas), L3 Chain-of-Thought Obrigatório, L4 Template Obrigatório, L5 Scope Forcing, L6 Self-Check Checklist
  - Modo Standard: 2 mecanismos — S1 CoT Prefix, S2 Template Injection
  - Templates de composição de prompt por perfil
  - Fallback automático para `## Quality Criteria` quando agent não tem `## Modo Lite`
- `.manifest.json` — `model_adapter: "1.0.0"` adicionado à seção `core`

#### Agents — Seção `## Modo Lite` (todos os 29 agents)
Cada agent recebeu uma seção `## Modo Lite` ao final do arquivo com:
- Persona simplificada em 1–2 frases (substituindo a seção completa de framework)
- 5 regras obrigatórias explícitas e verificáveis (sem dependência de inferência)
- Template fill-in-the-blank específico do domínio
- Lista "Não faça" com anti-patterns críticos

Agents atualizados:
- **Frontend (6):** `ana-arquitetura-fe`, `rodrigo-react`, `ursula-ui`, `renata-revisao-fe`, `tiago-testes-fe`, `paulo-performance`
- **Backend (5):** `bruno-base`, `alexandre-api`, `daniela-dados`, `sergio-seguranca`, `roberto-revisao-be`
- **Produto (6):** `priscila-produto`, `paulo-pesquisa`, `ana-analise`, `tania-tecnica`, `eduardo-estrategia`, `ursula-ux`
- **Fullstack (1):** `carlos-coordenador`
- **Mobile (3):** `marina-mobile`, `felipe-feature`, `viviane-visual`
- **DevOps (4):** `igor-infra`, `claudio-containers`, `patricia-pipeline`, `osvaldo-observabilidade`
- **IA/Dados (4):** `larissa-llm`, `marco-ml`, `diana-dados`, `nelson-notebook`

### Alterado

#### Core — Orchestrator
- `core/orchestrator.md` — onboarding agora coleta o modelo de IA do usuário (pergunta 6)
- `core/orchestrator.md` — tabela de mapeamento modelo → `model_capability` adicionada
- Template `docs/_memory/preferences.md` atualizado: campos `model_capability` e `model_name` adicionados

#### Core — Pipeline Runner
- `core/pipeline-runner.md` — seção **1.1b** adicionada: verifica `model_capability` na inicialização e carrega `model-adapter.md` se necessário
- `core/pipeline-runner.md` — seção **2.3** atualizada: aplica MODEL-ADAPTER sobre o prompt composto antes de enviar ao agent (apenas steps `subagent` e `inline`)
- Log de ativação do adapter: `🔧 [MODEL-ADAPTER] Modo {standard|lite} ativo — {model_name}`

---

## [1.6.1] — 2026-03-30

### Adicionado

#### Best Practices — Conteúdo
- `content/copywriting.md` v1.0.0 — guia de copywriting: princípios, estrutura AIDA, PAS, headlines, CTA, tom de voz, checklist de qualidade
- `content/linkedin-post.md` v1.0.0 — guia de posts para LinkedIn: anatomia do post, ganchos, formatos (storytelling/listicle/hot take), hashtags, checklist
- `content/blog-post.md` v1.0.0 — guia de artigos para blog: tipos de artigo, estrutura padrão, SEO on-page, intenção de busca, checklist de publicação
- `.manifest.json` — seção `content` adicionada em `best_practices` com os 3 novos arquivos
- `.manifest.json` — `model_adapter: "1.0.0"` adicionado à seção `core` (arquivo existia mas não estava indexado)

### Corrigido

#### Core — Inconsistência de versão
- `core/orchestrator.md` — frontmatter corrigido de `1.0.0` para `1.1.0` (alinhado ao manifest)
- `core/pipeline-runner.md` — frontmatter corrigido de `1.0.0` para `1.1.0` (alinhado ao manifest)
- `core/gate-system.md` — frontmatter corrigido de `1.0.0` para `1.1.0` (alinhado ao manifest)

---

## [1.6.0] — 2026-03-29

### Adicionado

#### Core — Modo Solo
- `core/orchestrator.md` — novo modo de performance `solo`: checkpoints de aprovação intermediários ignorados automaticamente, GATE-0 flexível para projetos sem documentação completa
- `core/pipeline-runner.md` — comportamento de modo solo: steps `checkpoint` sem `gate:` são pulados com log `⚡ [SOLO]`
- `core/gate-system.md` — GATE-0 com variante para modo solo: aviso em vez de bloqueio quando `docs/` incompleto

#### Core — Memória Transversal de Projeto
- `core/pipeline-runner.md` — carrega `docs/_memory/project-learnings.md` no contexto de todos os agents
- `core/pipeline-runner.md` — FASE 3 agora pergunta sobre aprendizados transversais (além dos aprendizados do squad)
- `core/orchestrator.md` — cria `docs/_memory/project-learnings.md` na inicialização do squad se não existir

#### Core — Task Tracker Configurável
- `_memory/preferences.md` — campo `task_tracker: none | github | linear | jira`
- `core/orchestrator.md` — onboarding agora coleta preferência de task tracker
- `core/pipeline-runner.md` — step `atualizar-tarefa` ignorado automaticamente quando `task_tracker: none`

#### Pipelines — Quick Fix (7 domínios)
- Pipeline `quick-fix` adicionado a todos os templates: frontend, backend, produto, fullstack, mobile, devops, ia-dados
- 3 steps: gate de integridade → contexto rápido (inline) → execução (subagent) → registro (inline)
- Sem checkpoints de aprovação — fluxo direto para mudanças pontuais bem definidas
- Step `qf-03-executar.md` específico por domínio com output adaptado ao contexto (frontend, backend, devops, IA, etc.)

#### Templates — Modo Solo
- Modo `solo` adicionado ao `performance_modes` de todos os 7 templates com conjunto de agents reduzido (sem revisores separados)

### Alterado

#### GUIDE.md
- Documentação do modo solo, quick-fix pipeline, project-learnings e task tracker
- Nova seção "Para o Dev Solo" com configuração recomendada e quando usar cada pipeline

---

## [1.5.0] — 2026-03-25

### Adicionado

#### Agent — Produto
- `ursula-ux` v1.0.0 — UX Researcher (personas, journey mapping, análise competitiva, research baseado em evidência)

#### Pipelines — Produto registrados no template
- `discovery-spec-handoff` registrado em `produto/template.yaml` (arquivos já existiam desde v1.1.0)
- `quick-spec` registrado em `produto/template.yaml` (arquivos já existiam desde v1.1.0)

#### Pipelines — Gestão de tarefas
- Etapa de criação de tarefas adicionada após spec aprovada nos pipelines de produto
- Etapas de verificação e atualização de tarefas adicionadas ao final de todos os pipelines de desenvolvimento (frontend, backend, fullstack, mobile, devops, ia-dados)

### Corrigido

#### GATE-0 — Todos os squads
- Path de verificação corrigido: `.synapos/_memory/company.md` → `docs/_memory/company.md` em todos os squad templates (frontend, backend, fullstack, mobile, devops, ia-dados)

#### Orchestrator
- Skill names corrigidos no menu de onboarding: `/docs-commands/build-business-docs` → `/setup:build-business`, `/docs-commands/build-tech-docs` → `/setup:build-tech`, `/docs-commands/setup-docs` → `/setup:start`

#### Fullstack — bug-fix pipeline
- Step `bf-03-fix` sem `agent` definido — corrigido para `carlos-coordenador`

---

## [1.4.0] — 2026-03-23

### Adicionado

#### Skills iniciais
- `brave-search` v1.0.0 — Skill MCP para pesquisa web (Brave Search API) — usada por squads de Produto e IA
- `playwright-browser` v1.0.0 — Skill MCP para automação de browser, screenshots e testes E2E
- `github` v1.0.0 — Skill MCP para criação de issues, PRs e consulta de repositórios
- `fetch-url` v1.0.0 — Skill MCP para leitura de URLs e extração de conteúdo web
- `filesystem` v1.0.0 — Skill MCP para leitura/escrita avançada de arquivos do projeto

---

## [1.3.0] — 2026-03-23

### Adicionado

#### Squad Templates — Novos domínios
- Template `fullstack` v1.0.0 — combina agents de frontend e backend com agent de integração
- Template `mobile` v1.0.0 — React Native / Flutter: arquiteto mobile, dev, UX mobile, testes
- Template `devops` v1.0.0 — CI/CD, containers, cloud, observabilidade
- Template `ia-dados` v1.0.0 — ML engineer, engenheiro de dados, analista, LLM specialist

#### Agents — Fullstack
- `carlos-coordenador` v1.0.0 — Coordenador Fullstack (integração frontend ↔ backend, contratos de API)

#### Agents — Mobile
- `marina-mobile` v1.0.0 — Arquiteta Mobile (React Native / Flutter, navegação, performance)
- `felipe-feature` v1.0.0 — Dev Mobile (implementação, estado, integrações nativas)
- `viviane-visual` v1.0.0 — UX Mobile (padrões iOS/Android, gestos, acessibilidade mobile)

#### Agents — DevOps
- `igor-infra` v1.0.0 — Arquiteto de Infra (cloud, IaC, Terraform)
- `claudio-containers` v1.0.0 — Especialista Docker/Kubernetes (orquestração, imagens, redes)
- `patricia-pipeline` v1.0.0 — Engenheira de CI/CD (GitHub Actions, deploys, rollback)
- `osvaldo-observabilidade` v1.0.0 — Observabilidade (logs, métricas, alertas, dashboards)

#### Agents — IA / Dados
- `larissa-llm` v1.0.0 — LLM Specialist (prompts, RAG, fine-tuning, avaliação de modelos)
- `marco-ml` v1.0.0 — ML Engineer (treinamento, feature engineering, deployment de modelos)
- `diana-dados` v1.0.0 — Engenheira de Dados (pipelines, ETL, data quality, dbt)
- `nelson-notebook` v1.0.0 — Analista de Dados (exploração, visualização, storytelling com dados)

---

## [1.2.0] — 2026-03-23

### Adicionado

#### Best Practices — Desenvolvimento
- `dev/code-review.md` — guia de code review: checklist, categorias, tom construtivo
- `dev/testing-strategy.md` — pirâmide de testes, cobertura, testes de contrato
- `dev/api-design.md` — REST e GraphQL: convenções, versionamento, paginação, erros
- `dev/git-workflow.md` — branch strategy, commits semânticos, PRs, squash vs merge

#### Best Practices — Produto
- `product/product-spec.md` — estrutura de spec, critérios de aceite, casos de borda
- `product/user-research.md` — entrevistas, surveys, análise de dados, síntese
- `product/technical-writing.md` — ADRs, decisão log, handoff, clareza e estrutura

#### Best Practices — Catálogo atualizado
- `_catalog.yaml` v1.1.0 — novos arquivos indexados com `whenToUse` e `domains`

---

## [1.1.0] — 2026-03-23

### Adicionado

#### Pipelines — Produto
- `produto/pipelines/discovery-spec-handoff.yaml` — pipeline completo: 8 steps, 15+ documentos
  - `steps/01-gate-integridade.md` — GATE-0 de verificação inicial
  - `steps/02-contexto-negocio.md` — Paulo Pesquisa: research de mercado + benchmarks
  - `steps/03-personas.md` — Paulo Pesquisa: user personas e jobs-to-be-done
  - `steps/04-checkpoint-research.md` — checkpoint: usuário valida direção da pesquisa
  - `steps/05-spec.md` — Priscila Produto: product vision + spec + critérios de aceite
  - `steps/06-requisitos.md` — Ana Análise: RF/RNF com prioridades e rastreabilidade
  - `steps/07-arquitetura.md` — Ana Análise + Tânia Técnica: architecture.md + ADRs
  - `steps/08-handoff.md` — Tânia Técnica: decisions log + checklist + open questions
- `produto/pipelines/quick-spec.yaml` — pipeline rápido: 4 steps (contexto → spec → requisitos → handoff)

#### Pipelines — Frontend
- `frontend/pipelines/feature-development.yaml` — pipeline completo: 6 steps
  - `steps/01-gate-integridade.md`
  - `steps/02-arquitetura.md` — Ana Arquitetura: estrutura de componentes + ADR
  - `steps/03-checkpoint-design.md` — checkpoint: aprovação do approach antes de implementar
  - `steps/04-implementacao.md` — Rodrigo React: componentes + hooks + testes unitários
  - `steps/05-review.md` — Renata Revisão: code review com BLOCKER/SUGGESTION/PRAISE
  - `steps/06-docs.md` — registro de decisões técnicas da feature
- `frontend/pipelines/bug-fix.yaml` — pipeline de bug: 4 steps (diagnóstico → fix → testes → review)
- `frontend/pipelines/component-development.yaml` — pipeline de componente: spec → impl → review → storybook

#### Pipelines — Backend
- `backend/pipelines/api-development.yaml` — pipeline completo: 6 steps
  - `steps/01-gate-integridade.md`
  - `steps/02-design-api.md` — Bruno Base: contrato da API + ADR de decisões arquiteturais
  - `steps/03-checkpoint-contrato.md` — checkpoint: aprovação do contrato antes de implementar
  - `steps/04-implementacao.md` — Alexandre API: endpoints + validação + error handling
  - `steps/05-seguranca.md` — Sérgio Segurança: auditoria OWASP (se incluído no squad)
  - `steps/06-review.md` — Roberto Revisão: code review em 4 camadas
- `backend/pipelines/database-migration.yaml` — pipeline de migração: análise → schema → migration → validação
- `backend/pipelines/bug-fix.yaml` — pipeline de bug: diagnóstico → fix → testes → review

---

## [1.0.0] — 2026-03-23

### Adicionado

#### Core
- `orchestrator.md` v1.0.0 — init multi-IDE com onboarding, menu de domínios, criação e carregamento de squads
- `pipeline-runner.md` v1.0.0 — engine de execução step-by-step com veto conditions, review loops e run history
- `gate-system.md` v1.0.0 — 5 quality gates (GATE-0 integridade → GATE-5 handoff)
- `skills-engine.md` v1.0.0 — gerenciamento de skills MCP, script, hybrid e prompt
- `best-practices/_catalog.yaml` v1.0.0 — catálogo lazy-load de boas práticas

#### Squad Templates
- Template `frontend` v1.0.0 — 6 agents, pipeline feature-development
- Template `backend` v1.0.0 — 5 agents, pipeline api-development
- Template `produto` v1.0.0 — 5 agents, pipeline discovery-spec-handoff (15+ documentos)

#### Agents — Frontend
- `ana-arquitetura-fe` v1.0.0 — Arquiteta Frontend (React, component-driven, ADRs)
- `rodrigo-react` v1.0.0 — Dev Frontend (React, TypeScript, hooks, acessibilidade)
- `ursula-ui` v1.0.0 — UX/UI Designer (design system, a11y, WCAG 2.1)
- `renata-revisao-fe` v1.0.0 — Reviewer Frontend (BLOCKER/SUGGESTION/QUESTION/PRAISE)
- `tiago-testes-fe` v1.0.0 — Engenheiro de Testes (Testing Library, Vitest, Playwright)
- `paulo-performance` v1.0.0 — Engenheiro de Performance (Core Web Vitals, bundle)

#### Agents — Backend
- `bruno-base` v1.0.0 — Arquiteto Backend (DDD, REST, camadas, ADRs)
- `alexandre-api` v1.0.0 — Dev Backend (Node.js, TypeScript, error handling, Zod)
- `daniela-dados` v1.0.0 — Arquiteta de Dados (PostgreSQL, schema, migrations, índices)
- `sergio-seguranca` v1.0.0 — Engenheiro de Segurança (OWASP Top 10, auth, rate limiting)
- `roberto-revisao-be` v1.0.0 — Reviewer Backend (corretude, segurança, arquitetura)

#### Agents — Produto
- `priscila-produto` v1.0.0 — Product Manager (spec, critérios de aceite, escopo)
- `paulo-pesquisa` v1.0.0 — Pesquisador (market analysis, benchmarks, user research)
- `ana-analise` v1.0.0 — Analista de Negócio (RF/RNF, conflitos, rastreabilidade)
- `tania-tecnica` v1.0.0 — Tech Writer (ADRs, decisions log, handoff checklist)
- `eduardo-estrategia` v1.0.0 — Estrategista (OKRs, roadmap, north star, riscos)

#### Infraestrutura
- `VERSION` — arquivo de versão do framework
- `.manifest.json` — inventário completo de versões (framework, core, templates, agents, skills)
- `_memory/company.md` — perfil do usuário/empresa
- `_memory/preferences.md` — preferências de IDE e linguagem

#### Adapters IDE
- `.claude/commands/init.md` — Claude Code
- `.cursor/rules/synapos.mdc` — Cursor
- `.antigravity/rules.md` — Antigravity
- `.opencode/instructions.md` — OpenCode
- `.trae/rules.md` — Trae

---

## Convenção de Versões

### Framework (`.synapos/VERSION`)
| Mudança | Versão |
|---------|--------|
| Quebra de compatibilidade no formato de orchestrator, pipeline ou agent | **MAJOR** |
| Novo squad template, novo domínio, nova feature de core | **MINOR** |
| Melhoria de agent, correção de guia, clareza de documentação | **PATCH** |

### Templates (`template.yaml`)
| Mudança | Versão |
|---------|--------|
| Mudança no formato de template.yaml que quebra squads existentes | **MAJOR** |
| Novo agent opcional, novo pipeline disponível | **MINOR** |
| Melhoria de descrição, ajuste de configuração | **PATCH** |

### Agents (`*.agent.md`)
| Mudança | Versão |
|---------|--------|
| Mudança de role, remoção de seção obrigatória | **MAJOR** |
| Nova task, novo exemplo, novo anti-pattern | **MINOR** |
| Melhoria de texto, correção de exemplo, refinamento de qualidade | **PATCH** |
