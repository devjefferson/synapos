# CHANGELOG

Todas as mudanças significativas do Synapos Framework são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

---

## [2.7.0] — 2026-04-04

### Modificado

- `orchestrator` v2.0.0 — reescrito: onboarding reduzido a 1 AskUserQuestion, modo inferido automaticamente por palavras-chave, role inferido por contexto. Remoção do Mode Decision System com score (BOOTSTRAP/STANDARD/STRICT → ⚡ Rápido / 🔵 Completo)
- `gate-system.md` v2.0.0 — simplificado de 9 gates para 3 (GATE-0, GATE-3, GATE-5). GATE-DECISION removido e substituído por sinalização `[?]` no output
- `pipeline-runner.md` — injeção de contexto de 10 itens para 5 por modo. Consolidação automática de memories/review-notes removida (agora manual via `/session consolidate`). state.json de crítico para best-effort
- `README.md` — reposicionamento honesto: "workflow system" em vez de "framework de orquestração", seção explícita sobre o que não é (multi-agent real)
- `docs/GUIDE.md` e `docs/GETTING_STARTED.md` — reescritos para refletir fluxo atual (roles, modos Rápido/Completo, gates simplificados)
- `bump.md` — simplificado para versionar apenas `package.json`, não arquivos markdown internos

### Adicionado

- `squad.yaml` — novo campo `roles[]`: lista os papéis simulados do squad (exibido na UI como "atuando como:")
- `.synapos/core/commands/session.md` — novo comando `/session`: lista sessions, abre contexto com `context.md` em destaque, consolida memories manualmente
- `pipeline-runner.md` — templates padronizados para `context.md` e `memories.md` com seções fixas. `context.md` marcado como obrigatório ao entrar em feature existente
- `docs/user-testing/` — material para user testing da Semana 6: guia do testador, formulário de feedback, template de observação, mensagem de recrutamento
- `docs/REFACTOR-PLAN.md` — plano de refatoração de 6 semanas documentado

### Removido

- `version:` do frontmatter dos arquivos core (orchestrator, pipeline-runner, gate-system, skills-engine) — markdown não precisa de semver
- Consolidação automática de memories.md e review-notes.md ao atingir 30 entradas
- Recálculo de score pós-execução (3.2b) — sobra do Mode Decision System
- Budget estimation (1.1b) do pipeline-runner

---

## [2.6.1] — 2026-04-03

### Corrigido

- `orchestrator` v1.6.1 — roteamento explícito no PASSO 5: template selecionado vai para PASSO 6, "Customizado" vai para SQUAD CUSTOMIZADO — impede que os dois caminhos sejam executados em sequência
- `orchestrator` v1.6.1 — removida pergunta de domínio duplicada em SQUAD CUSTOMIZADO (já respondida no PASSO 5)
- `orchestrator` v1.6.1 — removido bloco duplicado de menu "status completed/discarded" em CARREGAR SQUAD EXISTENTE

---

## [2.6.0] — 2026-04-03

### Modificado

- `orchestrator` v1.6.0 — fluxo de criação de squad corrigido: pergunta de feature session movida para após a criação dos arquivos do squad (PASSO 7.5), garantindo que o squad exista antes de vincular uma feature
- `orchestrator` v1.6.0 — adicionado PASSO 3.5 de verificação de squad-templates: bloqueia execução quando nenhum template está instalado e oculta a opção "Criar novo squad" no menu quando `[HAS_TEMPLATES]` = false
- `bin/synapos.js` — instalação simplificada: sem argumentos instala todos os squads por padrão, sem prompt interativo de seleção

---

## [2.5.0] — 2026-04-03

### Adicionado

#### Synapos Copilot Mode (IDE-native Runtime)

- `.github/copilot-instructions.md` — arquivo de instrução de projeto carregado automaticamente pelo GitHub Copilot Chat. Define regras obrigatórias, sistema de comandos via comentário e adaptações ativas do Synapos.
- `.synapos/copilot.md` v1.0.0 — runtime manifest do Copilot Mode. Protocolo completo de ativação, onboarding, mode decision system, criação de squads e execução de pipelines adaptados para o ambiente IDE-native (sem subagentes, sem slash commands).
- `.synapos/core/copilot-adapter.md` v1.0.0 — mapeamento técnico de capacidades Synapos → GitHub Copilot:
  - `AskUserQuestion` → listas numeradas com aguardo de input
  - `execution: subagent` → execução inline com persona declarada
  - `execution: checkpoint` → checklist com confirmação explícita
  - Gates → checklist de validação no output
  - Sistema de comandos via comentário: `// synapos:{comando} {params}`
  - Prompt anchors via blocos HTML em arquivos-chave
  - Mapeamento de limitações e compensações (memória, pipeline, flow control)

---

## [2.1.0] — 2026-04-01

### Adicionado

#### GATE-DESIGN — Conformidade com Design System e Acessibilidade
- Novo gate `GATE-DESIGN` no `gate-system.md` v1.3.0 — verifica antes de qualquer step que gera spec de componente ou fluxo de UI:
  - Todos os 6 estados de componente especificados (default, hover, focus, disabled, loading, error)
  - Contraste de texto ≥ 4.5:1 (WCAG 2.1 AA) declarado como valor numérico
  - Estado vazio (`empty state`) documentado para listas e views de dados
  - Estado de erro com mensagem e ação de recuperação
  - Componentes novos verificados no design system antes de propor
  - Tokens de design usados (sem valores hardcoded)
  - 3 mensagens de falha distintas: estados incompletos, contraste, componente não justificado

#### Step de Especificação Visual (Visual-Spec)
- `.synapos/squad-templates/engineer/pipeline/steps/visual-spec.md` — step de especificação visual para pipeline engineer
- `.synapos/squad-templates/produto/pipelines/steps/06c-visual-spec.md` — step `06c-visual-spec` para pipeline `discovery-spec-handoff` do squad produto
- Step `pre-05b-visual-spec` adicionado ao `core/pipelines/pre-execution.yaml` — inserido entre arquitetura e checkpoint, com `skip_condition` para squads sem agent de design

#### Novos Comandos
- `.synapos/core/commands/debug/session.md` v1.0.0 — diagnóstico e recovery de sessions corrompidas ou travadas (state.json inválido, squad stuck em running, checkpoint assíncrono pendente, squad bloqueado por escalation)
- `.synapos/core/commands/migrate/v1-to-v2.md` v1.0.0 — guia de migração passo a passo de projetos v1.x para v2.0+

#### GETTING_STARTED.md
- `GETTING_STARTED.md` criado na raiz — guia de onboarding por tipo de projeto (existente, greenfield, task específica, dev solo), tabelas de modo e pipeline, estrutura de session, referências

#### Async Checkpoints para Equipes Distribuídas
- Campo `async_checkpoints: true` em `squad.yaml` — quando ativo, checkpoints não bloqueiam sincronamente; pipeline suspende em `awaiting_approval`, registra em `pending-approvals.md` e encerra sem erro
- Orchestrator detecta `status: "awaiting_approval"` ao retomar e apresenta checkpoint para aprovação

#### Protocolo de Escalation de Decisões
- Seção `PROTOCOLO DE ESCALATION DE DECISÕES` no `orchestrator.md` — para decisões que PM não pode resolver sozinho
- Arquivo `open-decisions.md` na session — registra decisões pendentes com `escalation_owner` e `status`
- Status `blocked` no squad — bloqueia execução e orienta retomada após resolução

### Modificado

#### `gate-system.md` v1.2.0 → v1.3.0
- `GATE-ADR` expandido: novo bloco `GATE-ADR — AUSÊNCIA` detecta decisões arquiteturais sem ADR correspondente (não apenas conflitos com ADRs existentes)
- `GATE-DECISION` expandido: adicionados exemplos de decisões de design (biblioteca de componentes, desvio de design system, padrão de interação)

#### `pipeline-runner.md` v2.0.0 → v2.1.0
- Seção 1.4c: proteção e resiliência do `state.json` — leitura com fallback, backup automático em corrupção, escrita com validação JSON antes de sobrescrever
- Proteção de `output_files` existentes: backup versionado (`{filename}.v{N}.bak`) antes de sobrescrever artefatos quando há trabalho anterior
- Consolidação periódica de `memories.md`: gatilho automático ao atingir 10 seções, oferece consolidação ao usuário
- Formato de autoria em `memories.md`: todo append inclui `[{squad-slug} · {agent-id}] — {data}`
- Verificação de squads paralelos: aviso quando outros squads com `status: running` na mesma feature podem conflitar
- `model_tier` documentado: tabela `fast`/`powerful`, padrão `powerful`, roteamento multi-model via `preferences.md`

#### `orchestrator.md` v1.2.0 → v1.3.0
- Guia "qual modo escolher": tabela de 10 cenários → modo recomendado, com regra de desempate
- Verificação de skills pré-pipeline: detecta skills mencionadas nos steps e avisa se não instaladas
- Detecção de projetos v1: detecta `docs/sessions/` e `docs/.squads/*/output/*/`, orienta `/migrate:v1-to-v2`

#### `pre-execution.yaml` v1.0.0 → v1.1.0
- Step `pre-05b-visual-spec` inserido entre arquitetura e checkpoint de arquitetura
- Comentário de GATE-DESIGN adicionado ao checkpoint

#### `discovery-spec-handoff.yaml` (produto)
- Step `06c-visual-spec` inserido após checkpoint de requisitos
- `depends_on` do step de arquitetura atualizado para incluir `06c-visual-spec`

#### `ursula-ui.agent.md` v1.1.0 → v1.2.0
- Campo `gates_owned: [GATE-DESIGN]` adicionado ao frontmatter
- Seção `## Autoria e Rastreabilidade` adicionada — define formato obrigatório de cabeçalho nos outputs

#### Quality Criteria — 13 agents (PATCH)
Todos convertidos para tabela com 3 colunas (Critério / Mínimo Aceitável / Como Verificar):
- `leo-engenheiro` — de lista para tabela
- Frontend: `rodrigo-react`, `tiago-testes-fe`, `paulo-performance`, `renata-revisao-fe`
- Backend: `alexandre-api`, `daniela-dados`, `sergio-seguranca`, `roberto-revisao-be`
- Produto: `priscila-produto`, `paulo-pesquisa`, `ana-analise`, `eduardo-estrategia`

---

## [2.0.0] — 2026-04-01

### Adicionado

#### Squad Template — Engineer
- `engineer` squad template v1.0.0 — novo template universal para engenharia de software
- `leo-engenheiro.agent.md` v1.0.0 — Lead Engineer agent com framework de Investigação → Arquitetura → Planejamento
- `engineer/pipelines/feature-development.yaml` v1.0.0 — pipeline de 9 steps com 3 checkpoints obrigatórios (investigação, arquitetura, planejamento antes da execução)
- `leo-engenheiro` adicionado como agent opcional em todos os 7 squad templates existentes

#### Pre-Execution Pipeline Universal
- `core/pipelines/pre-execution.yaml` v1.0.0 — pipeline universal de preparação (GATE-0 → investigação → arquitetura → planejamento)
- Campo `pre_pipeline` adicionado em todos os 7 squad templates — qualquer squad pode encadear o pipeline de preparação antes do principal
- Placeholder `{lead_agent}` resolvido do `squad.yaml → pre_pipeline.agent`

#### Gate System — Novos Gates
- `GATE-DECISION` — bloqueia decisões autônomas dos agents; exige protocolo `[DECISÃO PENDENTE]` para qualquer escolha fora do escopo do step
- `GATE-ADR` — bloqueia implementação que conflite com ADRs existentes; exige que o agent liste explicitamente cada ADR como `[RESPEITADA]` ou `[NÃO APLICÁVEL]`

#### Compliance Obrigatório em Todos os Agents
- Bloco `## Compliance Obrigatório` adicionado em todos os 30 agents existentes
- Protocolo `[DECISÃO PENDENTE]` — agents devem parar e sinalizar qualquer decisão além do escopo com opções e recomendação
- Protocolo de Verificação de ADRs — agents lêem todas as ADRs antes de implementar e listam conformidade explicitamente

#### Session Model v2 — Modelo de Output Unificado
- Nova estrutura `docs/.squads/sessions/{feature-slug}/` — pasta de sessão compartilhada entre todos os squads que trabalham na mesma feature
- `state.json` multi-squad: rastreamento unificado por feature com histórico de cada squad como chave no dict `squads`
- Campo `suspended_at` no `state.json` — permite retomada precisa após interrupção de sessão
- `memories.md` movida para nível de feature (antes era por squad/run)
- `session_files` declarados nos pipelines (`context.md`, `architecture.md`, `plan.md`) — injetados automaticamente em todos os steps subsequentes

#### Orchestrator — Recuperação de Sessão
- Detecção de execução interrompida: ao carregar squad existente, `orchestrator.md` verifica `status: "running"` no `state.json` e oferece retomada antes do menu normal
- Step 6.3 no fluxo de criação de squad: associar feature session (selecionar existente ou criar nova)
- Campo `feature` e `session` adicionados como obrigatórios no `squad.yaml`

### Modificado

#### `pipeline-runner.md` v1.1.0 → v2.0.0 ⚠️ Breaking
- Todos os caminhos de output migrados de `docs/.squads/{slug}/output/{run_id}/` para `docs/.squads/sessions/{feature-slug}/`
- Novo formato `state.json`: squads como dict com chave `{squad-slug}`, campos `started_at`, `completed_at`, `status`, `completed_steps`, `current_step`, `suspended_at`
- Seção 1.4b: suporte ao encadeamento `pre_pipeline`
- Seção 2.3: substituição de path agora aponta para `docs/.squads/sessions/{feature-slug}/`
- Ordem de injeção de contexto atualizada: inclui `[Session Files]` (context → architecture → plan) e `[ADRs existentes]`
- Novas regras: "Session é compartilhada", "review-notes é append-only", "memories é append-only"

#### `gate-system.md` v1.1.0 → v1.2.0
- GATE-1: verifica campos `feature` e `session` no `squad.yaml` (obrigatórios no modelo v2)
- GATE-2: path de `memories.md` atualizado para `docs/.squads/sessions/{feature-slug}/memories.md`
- GATE-4: verifica arquivos na session folder em vez de caminhos hardcoded antigos
- GATE-5: verifica `state.squads["{squad-slug}"].completed_steps` no novo formato

#### `orchestrator.md` v1.1.0 → v1.2.0
- Squad.yaml template atualizado: campos `feature`, `session`, `project_context.session` com path da session
- Removido campo `squad_memory` (substituído pelo modelo de sessão compartilhada)

#### `skills-engine.md` v1.0.0 → v1.1.0
- Bloco de injeção de contexto atualizado para nova ordem: `[Session Files: context.md → architecture.md → plan.md]`, `[ADRs existentes]`, `[Memória da Feature: sessions/{feature-slug}/memories.md]`, `[Aprendizados transversais: docs/_memory/project-learnings.md]`

#### `versioning.md` v1.0.0 → v1.1.0
- Seção "Versionamento de Squads Instanciados" reescrita: substituída referência a `output/{run-id}/` e `_memory/memories.md` pelo novo modelo de `sessions/{feature-slug}/state.json`

#### Squad Templates — todos os 7 templates receberam bump MINOR
- `frontend` v1.2.0 → v1.3.0
- `backend` v1.2.0 → v1.3.0
- `produto` v2.1.0 → v2.2.0
- `fullstack` v1.1.0 → v1.2.0
- `mobile` v1.1.0 → v1.2.0
- `devops` v1.1.0 → v1.2.0
- `ia-dados` v1.1.0 → v1.2.0

#### Agents — todos os 30 agents receberam bump PATCH (v1.0.0 → v1.1.0)
- Bloco `## Compliance Obrigatório` adicionado (ADR verification + `[DECISÃO PENDENTE]` protocol)
- Exceptions: `ana-arquitetura-fe`, `bruno-base`, `tania-tecnica` — já tinham conteúdo de ADR; receberam apenas o protocolo `[DECISÃO PENDENTE]`
- `leo-engenheiro` — já incluía compliance completo desde a criação

### Corrigido

#### `discover.md` (commands/setup) — CLAUDE.md template seção 4.8
- `docs/.synapos/sessions/` → `docs/.squads/sessions/`
- `docs/.synapos/memory.md` → removido (arquivo não existe no novo modelo)
- `.claude/master/`, `.claude/agents/`, `.claude/commands/` → `.synapos/core/`, `.synapos/squads/`, `.synapos/core/commands/`
- `docs/tech-context/` → `docs/tech/`
- `docs/business-context/` → `docs/business/`
- `docs/tech-context/briefing/adrs-summary.md` → `docs/tech/adr/`
- Adicionada entrada `docs/_memory/` na tabela do framework

### Removido
- Modelo de output por run (`docs/.squads/{slug}/output/{run_id}/`) — substituído por sessions compartilhadas
- Campo `squad_memory` no `squad.yaml` — substituído por `session` apontando para `docs/.squads/sessions/{feature-slug}/`

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

### Modificado

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

### Modificado

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
