# Changelog - Framework Cortex

Histórico de versões e mudanças do Framework Cortex.

---

## [1.7.0] - 2026-03-17

### Delegação declarativa de agents/skills no plan.md + suporte a múltiplos agents

**Motivação:** A delegação de agents e skills era feita por matching semântico on-the-fly no início de cada fase, a cada sessão de execução. Isso causava três problemas: (1) overhead de tokens repetindo a descoberta a cada fase; (2) risco de match incorreto por ambiguidade semântica; (3) skills instaladas via symlink ficavam invisíveis porque o protocolo usava `ls -d` que não segue symlinks. Além disso, o framework não suportava múltiplos agents por fase (paralelo ou sequencial), forçando o usuário a orquestrar manualmente quando duas especialidades eram necessárias na mesma fase.

**Arquivos modificados:**

**`engineer/plan.md` (`.claude` e `.opencode`) — pré-passo + template:**
- Pré-passo obrigatório antes de gerar fases: inventário de agents via `find .claude/agents -name "*.md" -follow` e skills via `find .claude/skills -maxdepth 2 -follow \( -name "SKILL.md" -o -name "SKILL.MD" \)`
- Template de cada `## FASE` agora inclui dois campos declarativos:
  - `> Agents: <agentA | agentB (paralelo), agentA → agentB (sequencial), ou "nenhum">`
  - `> Skill: <nome-da-skill ou "nenhuma">`
- Agents e skills são resolvidos no momento da geração do plan — não na execução

**`cortex-execution.md` — PASSO 4 e Gate de Delegação:**
- Lógica "plan-first": ler `> Agents:` e `> Skill:` do `plan.md` antes de qualquer discovery
- Skip total de semantic matching se já declarado no plan
- Parsing de sintaxe multi-agent:
  - `agentA | agentB` → paralelo (invocar simultaneamente via Agent tool em uma resposta)
  - `agentA → agentB` → sequencial (aguardar output do primeiro antes de invocar o segundo)
  - `agentA` → único (comportamento anterior)
- Skills discovery corrigido: `find .claude/skills -maxdepth 2 -follow \( -name "SKILL.md" -o -name "SKILL.MD" \)` — cobre symlinks e variantes de case (`SKILL.md` / `SKILL.MD`)
- Reporte de início de fase atualizado para exibir modo de execução (paralelo/sequencial)

**`package.json`:** `1.6.1` → `1.7.0`
**`cortex-execution.md`:** header atualizado para `v1.7.0`

### Refinamentos de Algoritmos e Protocolos (pós-1.7.0)

**Motivação:** A versão 1.7.0 introduziu delegação declarativa e suporte a múltiplos agents, mas os masters ainda usavam instruções informais em vários pontos críticos — descrições em prosa onde deveriam existir algoritmos determinísticos. Este conjunto de refinamentos formaliza schemas, algoritmos, gates e protocolos que antes dependiam de interpretação livre do modelo, reduzindo o risco de comportamento divergente entre sessões.

**`cortex-boot.md`:**
- Schemas JSON obrigatórios documentados explicitamente para `CORTEX_INDEX` e `CORTEX_CONTEXT` — campos, tipos e regras de geração formalizados
- Algoritmo formal de tokenização para `adrs_by_keyword`: cada título de ADR é split por espaço, stopwords removidas (`de`, `do`, `da`, `para`, `com`, `em`, `a`, `o`, `e`), tokens restantes indexados individualmente
- Regras de comparação de `mtime` entre `docs/` e `.cortex-context.json` — critério de CACHE HIT/MISS baseado em comparação de epoch inteiro (sem tolerância)
- Ausência de `context.json` tratada explicitamente como CACHE MISS (em vez de erro ou comportamento indefinido)
- Validação de slug via regex formalizada: `^[a-z]{2,4}-[0-9]{3}-[a-z0-9-]+$` — boot rejeita slugs fora do padrão
- Exibição de `Agents: N | Skills: N` no boot output condicionada à presença de `.cortex-agents.json`; omitida silenciosamente se ausente

**`cortex-strategy.md`:**
- Regex de slug formalizada no GATE 1: `^[a-z]{2,4}-[0-9]{3}-[a-z0-9-]+$` — Strategy bloqueia se slug não corresponder
- Algoritmo de extração de keywords com lista de stopwords explícita — mesma lógica do boot, aplicada na Fase 1 para indexação de features
- Verificação de Consistência promovida a algoritmo de 4 pontos bloqueante (antes era sugestão não-bloqueante): (1) slug único no manifesto, (2) ADRs referenciadas existem no índice, (3) dependências externas declaradas têm decisão arquitetural correspondente, (4) escopo não sobrepõe session `in_progress` existente — falha em qualquer ponto bloqueia avanço para GATE 2
- GATE 2 expandido com padrões explícitos de aprovação e rejeição: lista de critérios objetivos que o revisor deve verificar antes de aprovar
- Fase 3 atualizada: inclui agents e skills disponíveis (de `.cortex-agents.json`) como entrada para sugestão de delegação por fase do plan

**`cortex-execution.md`:**
- GATE 3 formalizado com algoritmo de extração de keywords por tipo de arquivo: `.ts`/`.tsx` indexam por nome de componente e hook; `.md` indexam por headings H2/H3; outros por nome do arquivo sem extensão
- GATE 4 expandido com critério de decisão explícito Opção A/B: Opção A (plan desatualizado — regenerar) vs. Opção B (divergência aceitável — documentar e prosseguir) — critério objetivo para escolha baseado em número de arquivos divergentes e criticidade
- Protocolo de confirmação de dependências por tipo formalizado: dependências de pacote (`npm`/`pip`) exigem confirmação antes de instalar; dependências de serviço externo exigem validação de credenciais; dependências internas exigem verificação de existência no disco
- Delegação obrigatória para agents declarados no `plan.md` com gate de falha explícito: se agent declarado não existe em `.cortex-agents.json`, Execution para e reporta erro antes de qualquer execução de fase

**`cortex-idea.md`:**
- Tabela de impacto atualizada com critério objetivo por dimensão (usuários afetados, esforço estimado, reversibilidade) e regra de desempate: em caso de empate entre dois níveis de impacto, o campo `reversibilidade` é o critério de decisão final

**`cortex-bug.md` e `cortex-modify.md`:**
- Headers de versão atualizados de versões anteriores para `v1.7.0`

**`.claude/agents/ux-mockup-architect.md`:**
- Removido design system hardcoded (referências específicas ao Enableurs) que tornavam o agent não-portável entre projetos
- Substituído por protocolo de leitura dinâmica de tokens do projeto: ao iniciar, o agent verifica `docs/technical-context/briefing/tech-stack.md` e `docs/technical-context/briefing/design-system.md` para descobrir qual design system, paleta e tipografia o projeto usa — nunca assume valores fixos

---

## [1.6.0] - 2026-03-15

### Inventário automático de Agents e Skills no Boot

**Motivação:** O Cortex não tinha visibilidade dos agents e skills instalados. Durante a execução, a escolha de qual agent invocar era manual ou hardcoded nos commands — sem consulta ao inventário real disponível. Skills instaladas só eram usadas se o command já as referenciasse explicitamente. Isso causava subutilização de capacidades, falta de consistência e overhead desnecessário no contexto de sessão.

**Arquivos novos:**

**`.claude/.cortex-agents.json` (gerado pelo Boot, gitignored):**
- Arquivo de runtime do framework — escopo Claude, não do projeto
- Schema: `{ version, generated_at, agents_count, skills_count, agents: {nome: desc}, skills: {nome: desc} }`
- Gerado na primeira execução e regenerado apenas quando `agents_count` ou `skills_count` mudar
- Em cache hit: skip total — zero overhead entre sessões normais
- CORTEX_CONTEXT **não recebe** esses dados — zero overhead no contexto de sessão contínua

**Arquivos modificados:**

**`cortex-boot.md` — PASSO 3.2-C (novo sub-passo):**
- Scan de `.claude/agents/*.md`: extrai nome + `description:` do frontmatter YAML de cada agent
- Scan de `.claude/skills/*/`: extrai nome + primeira linha descritiva do `SKILL.md`
- Escreve `.claude/.cortex-agents.json` com inventário completo
- PASSO 5 (output do boot) exibe contadores: `Agents: N disponíveis  |  Skills: N disponíveis`
- `memory.md` ganha seção "Recursos Disponíveis" com contadores + ponteiro para o arquivo

**`cortex-execution.md` — PASSO 4 (atualizado):**
- Instrução para carregar `.claude/.cortex-agents.json` **sob demanda** ao delegar fase especializada
- Instrução para verificar campo `skills` antes de gerar documentos ou artefatos visuais
- Regra: nunca assumir que um agent/skill existe — verificar o inventário antes de invocar

**`cortex-strategy.md` — Fase 3 (atualizado):**
- Instrução para carregar `.claude/.cortex-agents.json` ao validar arquitetura
- Sugerir agents por fase especializada ao definir o plan

**`.opencode/instructions.md` — Regra #5 (nova):**
- Regra inegociável: nunca assumir agent/skill sem verificar `.claude/.cortex-agents.json`

**`.opencode/commands/cortex/boot.md`:**
- Passo 5 adicionado: gerar `.claude/.cortex-agents.json` via PASSO 3.2-C

**`.opencode/commands/cortex/execution.md`:**
- Seção de delegação: carregar `.cortex-agents.json` ao iniciar fase especializada ou gerar artefato

**`.opencode/commands/cortex/strategy.md`:**
- Fase 3 atualizada: inclui consulta ao `.cortex-agents.json` para sugerir agents por fase

**`.gitignore`:**
- Adicionado `.claude/.cortex-agents.json` (runtime, não versionado)

**`package.json`:** `1.5.2` → `1.6.0`
**Masters:** todos atualizados de `v1.5.1` para `v1.6.0`

---

## [1.6.1] - 2026-03-15

### Mover geração de `.cortex-agents.json` do Boot para o Discover

**Motivação:** A geração do inventário de agents/skills estava no Boot (PASSO 3.2-C), executando a cada cache miss. Isso adicionava ~883 tokens ao master do Boot (que já consumia ~28% da janela de 64k) e acoplava uma operação de inicialização de projeto ao ciclo de sessão. O inventário de agents/skills não muda entre sessões — só muda quando o framework é atualizado, que é exatamente quando `/engineer:discover` é re-executado.

**Arquivos modificados:**

**`cortex-boot.md` — PASSO 3.2-C removido:**
- Boot enxugado de 7.095 → 6.212 tokens (-883 tokens, -12% do master)
- PASSO 5: exibe `Agents: N | Skills: N` apenas se `.cortex-agents.json` já existir — não bloqueia
- `memory.md`: linha de recursos disponíveis tornou-se opcional (omitida se arquivo ausente)

**`engineer/discover.md` — Fase 4.9 adicionada (`.claude` e `.opencode`):**
- Scan de `.claude/agents/*.md`: extrai nome + `description:` do frontmatter YAML
- Scan de `.claude/skills/*/`: extrai nome + primeira linha do `SKILL.md`
- Gera `.claude/.cortex-agents.json` junto com os demais artefatos do discover

**`.opencode/commands/cortex/boot.md`:**
- Passo 5 removido; nota explicativa: "gerado pelo `/engineer:discover`"

**`package.json`:** `1.6.0` → `1.6.1`

**Fluxo resultante:**
```
/engineer:discover  → gera docs/ + CLAUDE.md + .cortex-agents.json  (setup do projeto)
/cortex:boot        → carrega docs/, valida, exibe menu              (cada sessão)
modes               → carregam .cortex-agents.json sob demanda       (ao delegar)
```

---

## [1.5.7] - 2026-03-12

### 🐙 Nova integração: GitHub Issues

**Motivação:** O framework suportava Linear, Jira, Trello, Asana e Monday.com, mas GitHub Issues — a plataforma de gestão mais usada em projetos open source e times que já trabalham com GitHub — estava ausente. Equipes que gerenciam tasks diretamente no GitHub não tinham suporte nativo.

**Novos arquivos:**

**`.claude/agents/github-issues-sync.md` (novo):**
- Agente especializado em sincronizar `docs/business-context/features/` com GitHub Issues
- Cria issues pai `[Feature]` com labels de prioridade, escopo e status
- Cria sub-issues por RF com referência ao pai via body (`**Parent:** #<number>`)
- Cria Milestones por Módulo automaticamente
- Garante labels necessárias antes de criar issues
- Usa MCP tools (`mcp__github__*`) quando disponíveis, fallback para REST API
- Marker de sincronização `<!-- cortex-feature: <arquivo.md> -->` para idempotência
- Suporta modos: FULL, MODULE, SCOPE, PREVIEW

**`.claude/commands/product/setup-github.md` (novo):**
- 7 passos: verificar estado → detectar `gh` CLI → coletar/validar token → detectar owner → listar/selecionar repo → confirmar → persistir
- Suporte a `gh auth token` como alternativa ao PAT manual
- Valida token via `GET /user` antes de salvar
- Salva `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` em `.claude/.env` (gitignored)
- Registra owner/repo (sem token) em `tech-stack.md` como referência

**`.claude/commands/product/sync-github.md` (novo):**
- 9 passos espelho de `sync-linear.md` adaptado para GitHub Issues
- Detecta credenciais de `.claude/.env`, variáveis de ambiente ou `gh auth token`
- Modos: Completo, Por Módulo, Por Escopo, Preview
- Relatório de preview antes de qualquer mutação
- Mapeamentos documentados: status → state+label, prioridade → label, escopo → label, módulo → milestone

**Arquivo modificado:**

**`.claude/master/cortex-platform-task.md`:**
- Variável `GITHUB_TOKEN` adicionada ao grep de detecção de plataformas (Passo 2)
- GitHub Issues adicionado à tabela de mapeamento de variáveis de ambiente
- Comando de setup `/product:setup-github` referenciado

---

## [1.5.6] - 2026-03-12

### 📋 Novo modo: EXECUTION → TASK DE PLATAFORMA

**Motivação:** Devs que recebem tasks de plataformas como Jira, Linear, Trello, Asana ou Monday.com frequentemente iam direto ao código sem criar spec (`context.md` + `architecture.md`), pulando os gates de qualidade do framework. O novo modo preenche essa lacuna: cria a spec a partir da task e encaminha para o plan antes de qualquer implementação.

**Detecção automática de plataforma:** o modo lê `.claude/.env` para identificar qual plataforma está configurada (ex: `LINEAR_API_KEY`). Se já houver uma configurada, usa diretamente sem perguntar. Se nenhuma, oferece configurar o Linear via `/product:setup-linear` ou continuar com colagem manual.

**Fluxo completo:**
```
/cortex:boot → EXECUTION → [3] TASK DE PLATAFORMA
  → Detectar plataforma (.claude/.env)
  → Capturar conteúdo da task
  → Definir e validar slug
  → Investigação + clarificações → context.md (aprovação)
  → Estruturação arquitetural → architecture.md (aprovação)
  → Verificação de consistência automática
  → Handoff: usuário invoca /engineer:plan
```

---

**Novos arquivos:**

**`.claude/master/cortex-platform-task.md` (novo):**
- 9 passos: verificar CORTEX_CONTEXT → detectar plataforma → definir slug → criar session → context.md → architecture.md → consistência → manifesto → handoff
- Detecção automática via variáveis de ambiente: `LINEAR_API_KEY`, `JIRA_API_TOKEN`, `TRELLO_API_KEY`, `ASANA_ACCESS_TOKEN`, `MONDAY_API_TOKEN`
- Cenário A (1 plataforma): usa direto; Cenário B (múltiplas): pergunta 1 vez; Cenário C (nenhuma): oferece setup ou manual
- NÃO avança automaticamente — aguarda aprovação explícita do usuário em cada etapa

**`.opencode/commands/cortex/platform-task.md` (novo):**
- Espelho do comando `.claude/` para o OpenCode

---

**Arquivos modificados:**

- **`cortex-boot.md`**: sub-menu EXECUTION agora tem `[3] TASK DE PLATAFORMA`, opção adicionada em `AskUserQuestion CALL 2B`, rota para `cortex-platform-task.md`
- **`MODE_SELECTION.md`**: todos os exemplos visuais atualizados (tela completa, compacta, minimalista, tabela de situações, fluxo pós-seleção, AskUserQuestion)
- **`commands/cortex/execution.md`** (`.claude` + `.opencode`): descrição atualizada com os 3 sub-modos
- **`guides/cortex-usability-guide.md`**: nova seção 14 com passo a passo completo, tabelas e tokens estimados; seção de fluxo por papel atualizada; tabelas de referência rápida atualizadas
- **`README.md`**: menu atualizado, nova seção do modo, estrutura de pastas, comandos, fluxos recomendados e use cases

---

## [1.5.5] - 2026-03-11

### 🎨 Janela 3: Design — Nova Janela de Trabalho para Designer

**Motivação:** o time não tinha clareza sobre quando o Designer pode começar a atuar. Design ficava bloqueado aguardando Dev ou iniciava sem spec, gerando retrabalho. A Janela 3 formaliza o papel do Designer no framework, permitindo que Design e Dev rodem em paralelo após GATE 2.

**Fluxo de papéis após GATE 2:**
```
PO/Tech Lead → GATE 2 → ┬─ Designer: DESIGN (design.md) ──┐
                         └─ Dev: EXECUTION (backend/lógica) ┴→ Dev implementa UI após GATE-D
```

---

**Novos arquivos:**

**`master/cortex-design.md` (novo):**
- Janela 3 — Design de Feature
- PASSO 1: Carregar context.md + architecture.md da session
- PASSO 2: Mapear telas, fluxos, componentes e estados
- PASSO 3: Especificar design por tela/fluxo (layout, componentes, estados, interações)
- GATE-D: Checklist de cobertura completa (telas, fluxos, estados, handoff)
- PASSO 5: Gerar `design.md` na session com estrutura padronizada
- Restrição: não escreve código de produção

**`commands/cortex/design.md` (novo):**
- Entrypoint `/cortex:design`
- Solicita slug da session ao ativar

---

**Arquivos modificados:**

**`master/cortex-boot.md` — PASSO 6:**
- Menu Nível 1 expandido: `[1-2]` → `[1-3]`
- Nova opção: `[2] 🎨 DESIGN — Criar design de feature (Designer)`
- DESIGN acesso direto (sem sub-menu de segundo nível)
- Tabela de roteamento atualizada: `DESIGN → cortex-design.md`
- CALL 1 do AskUserQuestion atualizado com 3 opções (STRATEGY, DESIGN, EXECUTION)

**`master/cortex-boot.md` — PASSO 3.4:**
- Rescan de sessions agora verifica também `design.md` (além de context.md, architecture.md, plan.md)

**`master/cortex-strategy.md` — Fase 5 (após GATE 2):**
- Adicionado bloco de paralelismo: Designer inicia `/cortex:design`, Dev inicia `/cortex:execution`
- Dev aguarda `design.md` (GATE-D) antes de implementar componentes visuais

**`changelog/MODE_SELECTION.md`:**
- Tela Nível 1 atualizada com opção DESIGN
- Tela Simplificada e Minimalista atualizadas
- Fluxo após seleção: DESIGN adicionado com seus 5 passos
- Guia de escolha de modo: coluna "Papel" adicionada + 3 linhas de cenários de Design
- Ícones: 🎨 DESIGN, 🤝 Handoff
- Nova tabela: **Papéis e Janelas** — mapeia Papel → Janela → Quando entra

---

## [1.5.4] - 2026-03-11

### 🎯 `/product:task` ao Final de Todo Fluxo STRATEGY

**Motivação:** após concluir qualquer fluxo de Strategy (EPIC, MODIFY ou IDEIA), o rastreamento da entrega no gestor de tarefas era um passo manual e frequentemente esquecido. A adição do `/product:task` como step obrigatório ao final de cada fluxo garante que toda spec fechada ou ideia registrada gere uma issue de rastreamento automaticamente.

**`master/cortex-strategy.md` — Fase 5 (GATE 2):**
- Adicionado: `**Após GATE 2 aprovado:** executar /product:task para criar issue de rastreamento da feature.`

**`master/cortex-modify.md` — FASE 4 (GATE 2 Delta):**
- Adicionado: `**Após GATE 2 aprovado:** executar /product:task para criar issue de rastreamento da modificação.`

**`master/cortex-idea.md` — PASSO 5 (Confirmar Captura):**
- Adicionado: `**Após confirmar captura:** executar /product:task para criar issue de rastreamento da ideia.`

**`changelog/MODE_SELECTION.md` — Fluxo Após Seleção:**
- Todos os 3 ramos de STRATEGY atualizados com step `↓ /product:task → criar issue de rastreamento`

---

## [1.5.3] - 2026-03-10

### 🧠 Gerenciamento de Memória — MEMORY.md

**Motivação:** o boot não persistia estado entre sessões. A cada nova janela, o AI precisava recarregar todo `docs/` do zero, sem nenhuma "memória" de sessões anteriores.

**`master/cortex-boot.md` — PASSO 0 (novo):**
- Antes de qualquer ação, Boot lê `docs/.cortex/memory.md` como fast path
- Se o arquivo existe: exibe resumo de estado (projeto, sessão ativa, histórico recente)
- Se não existe: continua boot normalmente sem erro

**`master/cortex-boot.md` — PASSO 6 expandido:**
- Após exibir status de confirmação, Boot escreve `docs/.cortex/memory.md` (OBRIGATÓRIO)
- Contém: projeto, versão, stack, regras, ADRs, session ativa, histórico das últimas 3 sessions, cache info
- Hierarquia explícita: `CORTEX_CONTEXT` = fonte de verdade; `memory.md` = cache derivado, nunca o inverso
- Sobrescreve completo a cada boot (nunca append)

**PASSO 8 removido como step standalone:**
- O conteúdo foi incorporado ao PASSO 6 — memória escrita antes da interação PASSO 7
- Boot agora termina em PASSO 7 (seleção de modo interativa — último step, nada após)

**`commands/cortex/boot.md`:**
- Referência atualizada: "PASSO 0 a 8" → "PASSO 0 a 7"

---

### 📊 Tracking de Backlog — ideas_backlog_count

**`master/cortex-boot.md` — PASSO 3.2:**
- Novo campo `ideas_backlog_count` no CORTEX_CONTEXT: conta arquivos em `docs/business-context/backlog/`

**PASSO 5 (exibição de status):**
- Exibe `Backlog: N ideia(s) em docs/business-context/backlog/` quando count > 0
- Silencioso quando backlog vazio (sem noise)

---

### ⚡ Otimização de Tokens — cortex-init-protocol.md

**`master/cortex-init-protocol.md` — reescrito (~212 → ~35 linhas):**
- Removidas todas as definições duplicadas de GATES (já existem nos masters)
- Mantido apenas: tabela de referência rápida de gates + tabela de erros
- Economia estimada: **~500 tokens por leitura do protocolo**

---

### ♻️ Anti-Redundância — cortex-strategy.md Fase 0

**`master/cortex-strategy.md` — Fase 0 condicional:**
- Se Boot rodou na mesma janela → SKIP de fingerprint re-validation e manifest re-read
- Se nova janela → valida fingerprint e lê manifesto normalmente
- Elimina dupla validação quando Strategy é ativado após Boot na mesma sessão
- Economia estimada: **~120 tokens por ativação de Strategy pós-Boot**

---

### 📄 CLAUDE.md — Gerado pelo /engineer:discover

**`commands/engineer/discover.md` — Fase 4.8 (nova):**
- Ao final do discover, gera `CLAUDE.md` na raiz do projeto com dados reais do projeto
- Conteúdo: nome, stack (tabela), instruções de inicialização, regras críticas (top 3–5), ADRs ativos (alto impacto), estrutura do framework, comandos principais, seção memory
- Regras: nome extraído do `package.json`, stack máx 60 chars, nunca inventar dados
- CLAUDE.md deixa de ser arquivo estático — é artefato gerado e atualizado pelo discover

---

### 🐛 Fix — MODE_SELECTION.md Tela 2B

**`MODE_SELECTION.md` — Tela de Seleção Nível 2B (EXECUTION):**
- Corrigido: `Sua escolha [1-3]: _` → `[1-2]: _`
- EXECUTION tem apenas 2 sub-opções (IMPLEMENTAR SPEC e BUG CRÍTICO), não 3

---

## [1.5.2] - 2026-03-10

### 🗂️ Menu Boot — Dois Níveis com Categorias

**Motivação:** o menu flat de 5 opções misturava ações de natureza diferente (planejar vs. executar). O novo menu agrupa por intenção, tornando a navegação mais clara.

**`master/cortex-boot.md` — PASSO 7 reescrito:**
- Nível 1: duas categorias — `STRATEGY` e `EXECUTION`
- Nível 2A (após STRATEGY): `EPIC`, `MODIFY`, `IDEIA`
- Nível 2B (após EXECUTION): `IMPLEMENTAR SPEC`, `BUG CRÍTICO`
- Dois `AskUserQuestion` em sequência (CALL 1 → CALL 2A ou CALL 2B)
- Tabela de resolução final mapeando sub-opção → master file

**`MODE_SELECTION.md` — todos os exemplos visuais atualizados:**
- Três boxes ASCII: nível 1, nível 2A, nível 2B
- Telas compacta e minimalista atualizadas
- Três blocos AskUserQuestion: CALL 1, CALL 2A, CALL 2B
- Guia de escolha com caminho de dois níveis (ex: `STRATEGY → EPIC`)
- Fluxo pós-seleção prefixado com rota de dois níveis
- Ícone 🚀 adicionado para EPIC

---

### 📁 Sessions — Movidas para `docs/.cortex/sessions/`

**Motivação:** `.claude/` contém apenas o framework genérico. Sessions são estado do projeto — devem ficar junto com os demais artefatos do projeto em `docs/`.

**Caminho anterior:** `.claude/sessions/<slug>/`
**Caminho novo:** `docs/.cortex/sessions/<slug>/`

**Arquivos atualizados (35+ referências em 12 arquivos):**
- `.claude/master/` — todos os 5 masters (boot, strategy, execution, modify, bug)
- `.claude/guides/` — cortex-usability-guide.md, context-window-strategy.md
- `.claude/commands/engineer/` — start.md, plan.md, work.md
- `.claude/changelog/CHANGELOG.md`
- `.claude/agents/lovable-backend-mapper.md`
- `.agent/workflows/` — cortex-boot.md, e-start.md, e-plan.md, e-work.md
- `.cursor/commands/engineer/` — start.md, plan.md, work.md

**Tabela de responsabilidades atualizada em `cortex-boot.md`:**
```
docs/.cortex/sessions/   ← Estado das features em desenvolvimento (projeto)
```

---

## [1.5.1] - 2026-03-04

### 🔐 Linear — Credenciais em `.claude/.env`

**Mudança de paradigma no armazenamento de credenciais Linear:**

Antes, a API Key ficava apenas como env var de sessão (`export LINEAR_API_KEY=...`) e os IDs em `tech-stack.md`. Agora, **todas** as credenciais são persistidas em `.claude/.env` (gitignored), eliminando a necessidade de re-exportar a cada sessão.

**`.gitignore`:**
- Adicionadas entradas explícitas: `.claude/.env` e `.claude/.env.*`

**`agents/linear-config-setup.md`:**
- PASSO 1: verifica `.claude/.env` como fonte primária (antes verificava `tech-stack.md`)
- PASSO 3: coleta API Key diretamente via `AskUserQuestion` (sem `export` manual)
- PASSO 8: salva `LINEAR_API_KEY`, `LINEAR_ORG_SLUG`, `LINEAR_TEAM_ID` e `LINEAR_PROJECT_ID` em `.claude/.env` via Write; registra apenas IDs (sem key) em `tech-stack.md` como referência opcional
- PASSO 9: valida existência de `.claude/.env` e exibe variáveis mascaradas
- Regras de segurança e tabela de erros atualizadas para referenciar `.claude/.env`

**`commands/product/setup-linear.md`:**
- Tabela de credenciais: coluna "Armazenamento" atualizada para `.claude/.env`
- Fluxo de execução: passo 7 explicita os 4 campos salvos em `.claude/.env`
- Seção Segurança reescrita
- Resolução de problemas: removida referência a `export LINEAR_API_KEY`

**`commands/product/sync-linear.md`:**
- Passo 1: carrega credenciais de `.claude/.env` como fonte primária, env vars como fallback
- Mensagem de bloqueio atualizada para orientar ao `.claude/.env`
- Seção Configuração: mostra formato do `.claude/.env` (antes mostrava `tech-stack.md`)
- Regra de segurança #6 atualizada

---

### 🐛 Fix — Versão do Framework nos JSONs Gerados pelo Boot

**`master/cortex-boot.md`:**
- Campo `version` nos JSONs gerados estava fixo em `"1.2.1"` — corrigido para `"1.5.1"`
- Afetava: `.cortex-fingerprint.json` e `sessions-manifest.json`
- Corrigidas 3 ocorrências (instrução + 2 exemplos de formato JSON)

---

## [1.5.1] - 2026-03-03

### 💡 Novo Modo: Ideia (Captação Rápida)

**Quinta janela de operação adicionada ao framework:**

- **`cortex-idea.md`** (novo master): fluxo de 6 passos para captura leve de ideias
  - Classifica tipo: `feature | melhoria | oportunidade | divida-tecnica | research`
  - Classifica impacto: `alto | médio | baixo`
  - Gera nota estruturada em `docs/business-context/backlog/<slug>.md`
  - Sem gates bloqueantes, sem session formal, sem validação de ADRs
  - Tempo estimado: 2–5 min (vs 30–90 min do Strategy)

- **`commands/cortex/idea.md`** (novo comando): entrypoint `/cortex:idea`

- **`cortex-boot.md`** atualizado:
  - Seleção de modo expandida de [1-4] → [1-5]
  - Rota `[5] ideia → .claude/master/cortex-idea.md`
  - AskUserQuestion atualizado com quinta opção

- **`MODE_SELECTION.md`** atualizado para v1.5.1:
  - Tela full, simplificada e minimalista incluem `[5] 💡 IDEIA`
  - Guia de escolha de modo com 3 novos cenários de ideia
  - Fluxo pós-seleção para Janela 5

---

### 🔧 Integração Linear — Configuração Guiada

**Novo agente `linear-config-setup`:**

- Fluxo interativo de 9 passos para configurar a integração com o Linear
- Valida API Key via `{ viewer { name email } }` antes de salvar qualquer coisa
- Descobre Org Slug automaticamente via `{ organization { urlKey } }`
- Lista times e projetos disponíveis para seleção interativa (sem precisar copiar UUIDs manualmente)
- Persiste configuração em `docs/technical-context/briefing/tech-stack.md`
- **API Key nunca escrita em arquivo** — somente orientação para env var

**Novo comando `/product:setup-linear`:**

- Entrypoint do agente de configuração Linear
- Tabela de credenciais, fluxo e resolução de problemas documentados
- Pré-requisito claro: rodar `/docs-commands:build-tech-docs` antes se `tech-stack.md` não existir

---

### 🛡️ Segurança — Remoção de Credenciais Hardcoded

**`commands/product/sync-linear.md` e `agents/linear-project-sync.md`:**

- Removidas: API Key real (`lin_api_...`), Team ID, Project ID e Org Slug hardcoded
- Substituídos por: `$LINEAR_API_KEY`, `<LINEAR_TEAM_ID>`, `<LINEAR_PROJECT_ID>`, `<LINEAR_ORG_SLUG>`
- Adicionado Passo 1 para carregar config de `docs/technical-context/briefing/tech-stack.md`
- Labels de módulos agora lidos dinamicamente do Linear na hora do sync
- Exemplos de issues e queries substituídos por placeholders genéricos

---

### 📖 Documentação — README Reescrito

**README.md:**

- Seção "Modos Cortex" documenta os 5 modos com fases e comandos de cada um
- Adicionado pré-requisito obrigatório: `/docs-commands:*` antes do `/cortex:boot`
- Diagrama "Modelo de Cinco Janelas" (substituiu Modelo de Duas Janelas)
- Seção "Como Gerar a Documentação" com ordem de execução e tabela do que cada comando gera
- Tabela de comandos `/product:*` inclui `/product:setup-linear` e `/product:sync-linear`
- Seção Product Managers inclui fluxo de configuração Linear (primeira vez)

---

### 🔢 Versão

- `package.json`: `1.0.0` → `1.5.1`
- `package-lock.json`: regenerado via `npm install`
- Masters `cortex-boot`, `cortex-strategy`, `cortex-execution`, `cortex-modify`, `cortex-bug`: alinhados para `v1.5.1`

---

## [1.4.0] - 2026-03-02

### 🛡️ Validação de Consistência Automática

**cortex-boot.md — PASSO 3.5 (novo):**

Executado sempre após PASSO 3.4, sem bloquear o boot. Verifica 3 categorias:

- **A. epic_active ↔ manifesto**: se `epic_active` definido em CORTEX_CONTEXT, verifica se o slug existe no manifesto com status `in_progress`. Alerta se ausente ou `closed`.
- **B. epics_completed ↔ manifesto**: para cada slug em `epics_completed`, verifica status `closed` no manifesto. Alerta se `in_progress` ou ausente.
- **C. sessions in_progress sem spec**: para cada session `in_progress`, alerta se `context.md` ou `architecture.md` estiverem ausentes (campo `missing` preenchido).
- Saída **silenciosa** quando sem inconsistências (sem noise). Com inconsistências: bloco `AUTO-CONSISTENCY [N alerta(s)]`.

**cortex-execution.md — GATE 4 estendido (3 verificações):**

- **Verificação 1** (existente): timestamps `plan.md` vs `architecture.md` via Bash
- **Verificação 2** (nova): cobertura — arquivos em `architecture.md › Estrutura de Arquivos` não encontrados em `plan.md` → alerta por arquivo
- **Verificação 3** (nova): realidade do disco — arquivos de fases `✓ concluída` verificados via `test -f` no Bash; arquivos ausentes no disco mas marcados como ✓ → alerta
- Saída consolidada: `GATE 4 ✓` se limpo; bloco de alertas se inconsistente

---

## [1.3.0] - 2026-03-02

### ⚡ Lazy Loading de Master Docs (Fase 3)

**cortex-boot.md — PASSO 3 reestruturado:**

- **Cache Check movido para antes da leitura de docs/**
  - Anterior: PASSO 3 sempre lia 3 arquivos de docs/ (~3.1KB each) → PASSO 3.2 verificava cache
  - Novo: PASSO 3 verifica fingerprint PRIMEIRO
    - **CACHE HIT**: carrega apenas `docs/.cortex/.cortex-context.json` (~0.7KB) → pula PASSO 3.1, 3.2, 3.3
    - **CACHE MISS / Primeira execução**: prossegue para PASSO 3.1 (leitura completa)
  - Economia estimada: **~2.9k tokens por boot em cache hit**

- **PASSO 3.1 criado** (novo): carregamento completo de docs/, executado apenas em cache miss
- **PASSO 3.2 simplificado**: removida verificação de cache interna (delegada ao PASSO 3)

**cortex-strategy.md — Fase 3 lazy:**

- ADR lookup via CORTEX_INDEX antes de ler adrs-summary.md (espelha GATE 3 do Execution)
- Regras críticas lidas de `critical_rules_summary` no CORTEX_CONTEXT (JSON); leitura completa só se precisar do texto integral
- Economia estimada: **~400 tokens por session de Strategy (sem miss)**

### 📊 Performance Acumulada (desde v1.2.0)

| Operação | v1.2.0 | v1.3.0 | Economia Total |
|---|---|---|---|
| Boot (cache hit) | ~800 tokens | ~180 tokens | **~78%** |
| Boot (cache miss) | ~800 tokens | ~800 tokens | 0% (necessário) |
| Strategy Fase 3 | ~450 tokens | ~50 tokens | **~89%** |
| Execution GATE 3 | ~150 tokens | ~30 tokens | **~80%** |

---

## [1.2.3] - 2026-03-02

### ♻️ Refactor — Eliminação de Duplicação

- **Removido: cópia fallback de arquivos Cortex para `.claude/`**
  - Problema: PASSO 3.2 step C e PASSO 3.4 copiavam 4 arquivos de `docs/.cortex/` → `.claude/` a cada boot
  - Arquivos duplicados removidos: `.claude/.cortex-context.json`, `.claude/.cortex-fingerprint.json`, `.claude/.cortex-index.json`, `docs/.cortex/sessions/manifest.json`
  - Motivo: o "fallback" não tinha valor prático — se `docs/` não existe, GATE 0 já bloqueia o boot
  - Resultado: zero redundância, zero escrita desnecessária, zero risco de dados defasados em `.claude/`

- **`docs/.cortex/` é agora a única localização dos arquivos de estado**
  - Toda leitura e escrita diretamente em `docs/.cortex/`
  - Sem cópias, sem sincronização, sem divergência de schema

---

## [1.2.2] - 2026-02-23

### 🐛 Correções Críticas

- **PASSO 3.4 — Cache do manifesto (tipo incompatível)**
  - Anterior: comparava `stat` (epoch inteiro) com `generated_at` (ISO 8601) — tipos incompatíveis, comparação sempre falharia
  - Fix: substituído por comparação de conjuntos de slugs: `ls docs/.cortex/sessions/*/` vs chaves de `sessions` no manifesto
  - Resultado: cache hit/miss correto e determinístico, sem risco de alucinação

- **PASSO 5 — Referência quebrada**
  - Anterior: referenciava "PASSO 3.6" (não existe) e `docs/.cortex/sessions/manifest.json` como fonte de verdade
  - Fix: corrigido para "PASSO 3.4" e `docs/.cortex/sessions-manifest.json`

- **MODE_SELECTION.md — versão desatualizada**
  - Corrigido v1.2.0 → v1.2.1 (duas ocorrências)

- **epics_completed/epic_active — ausentes da spec de geração**
  - PASSO 3.2: adicionada regra explícita de preservação — Boot nunca redefine, apenas preserva

### 🛡️ Anti-Alucinação

- **PASSO 3.3 — Fingerprint via Bash obrigatório**
  - Substituídas instruções vagas por comandos Bash explícitos para `size`, `mtime` e `checksum`
  - macOS: `stat -f%z`, `stat -f%m`, `shasum -a 256`
  - Linux: `stat -c%s`, `stat -c%Y`, `sha256sum`
  - Fallback documentado: `"checksum": "unavailable"` se Bash falhar

- **GATE 4 — Timestamps via Bash obrigatório**
  - cortex-execution.md: adicionados comandos `stat` antes da comparação plan.md vs architecture.md
  - Elimina risco de inventar datas de modificação

- **GATE 2 — Checklists unificados**
  - cortex-init-protocol.md: adicionados campos ausentes `## Dependências Externas` (context.md) e `## ADRs Aplicáveis` (architecture.md)
  - Adicionada nota de autoridade: em conflito com masters, masters prevalecem

### ⚡ Performance / Economia de Tokens

- **PASSO 3.2 — Cache condicional de CORTEX_INDEX/CONTEXT**
  - Regeneração só ocorre quando fingerprint detecta mudança em `docs/`
  - Economia estimada: ~300 tokens por Boot sem mudanças em docs/

- **PASSO 3.4 — Cache condicional do manifesto**
  - Rescan de `docs/.cortex/sessions/` só ocorre quando lista de slugs mudou
  - Economia estimada: ~50 tokens por Boot estável

- **GATE 3 — Formato compacto**
  - cortex-execution.md: substituída tabela markdown por formato inline por arquivo
  - Redução de ~60% nos tokens de GATE 3 (~1500 → ~600 por session de 15 arquivos)

- **Fingerprint skip — janela com Boot ativo**
  - cortex-strategy.md e cortex-execution.md: skip explícito quando Boot já rodou na mesma janela
  - Elimina dupla validação de fingerprint (~120 tokens poupados por ativação)

### 🌐 Genericidade

- **Exemplos nos masters — dados hardcoded removidos**
  - PASSO 6 (cortex-boot.md): substituídos "Chatbot IA Genérico", "Next.js 16...", slugs reais por `<project_name>`, `<frameworks>`, `<tipo-NNN-descricao>`
  - Strategy Fase 0: substituídos 5 slugs reais do projeto por `<tipo-NNN-descricao>`
  - Execution PASSO 1: alinhado com o mesmo padrão

- **Manifesto — formato v1.2.1 no spec**
  - Atualizado campo `version` para `"1.2.1"` na spec do PASSO 3.4
  - Campo `missing`: omitido para sessions `closed`, presente apenas para `in_progress` com arquivos ausentes

- **CORTEX_CONTEXT — campo `version` adicionado ao spec**
  - PASSO 3.2: `"version": "1.2.1"` explicitado como campo obrigatório da geração

### 🔄 Manifesto — Sincronização

- **PASSO 3.4 — Sync explícito**
  - Adicionada instrução de cópia `docs/.cortex/sessions-manifest.json` → `docs/.cortex/sessions/manifest.json` após geração
  - `docs/.cortex/sessions-manifest.json`: fonte de verdade (versionada)
  - `docs/.cortex/sessions/manifest.json`: fallback local

---

## [1.2.1] - 2026-02-23

### 🐛 Correções

- **CORREÇÃO CRÍTICA**: Prioridade de busca ajustada
  - Arquivos finais SEMPRE em `docs/.cortex/` (versionados com o projeto)
  - Templates em `.claude/` como fallback (para projetos sem docs/)
  - Boot lê de `docs/.cortex/` primeiro, fallback para `.claude/`
  - Soluciona problema: Boot esperava encontrar arquivos em `.claude/` mas eles estavam em `docs/`
  - Atualiza masters em `.claude/` para refletir nova localização

---

## [1.2.0] - 2026-02-23

### 🚀 Novas Funcionalidades

**Fase 1: Session Manifest + Fingerprint**
- Novo arquivo: `docs/.cortex/sessions/manifest.json`
  - Rastreia todas as sessions com status consolidado
  - Lista arquivos existentes (context.md, architecture.md, plan.md)
  - Lista arquivos ausentes (missing)
  - Marca status como "closed" ou "in_progress"

- Novo arquivo: `.claude/.cortex-fingerprint.json`
  - Registra hash SHA-256 de cada arquivo do GATE 0
  - Detecta mudanças em `docs/` automaticamente
  - Impede uso de contexto desatualizado

**Fase 2: CORTEX_INDEX + CORTEX_CONTEXT Comprimido**
- Novo arquivo: `.claude/.cortex-index.json`
  - Indexa ADRs por keyword para lookup rápido
  - Mapeamento `adrs_by_keyword` e `adrs_by_category`
  - Lista todas as ADRs com título resumido
  - Conta regras e ADRs

- Novo arquivo: `.claude/.cortex-context.json`
  - Versão comprimida do contexto do projeto
  - Inclui: project_name, tech_stack, critical_rules_summary
  - Inclui: adrs_summary, rules_count, adr_count

### ⚡ Melhorias de Performance

| Operação | Antes | Depois | Economia |
|----------|--------|---------|----------|
| Boot (carregar contexto) | ~800 tokens | ~200 tokens | **75%** |
| GATE 3 (arquivo típico) | ~150 tokens | ~30 tokens | **80%** |
| Warm-up (sessions) | ~N × 50 tokens | ~50 tokens | **~90%** |
| PASSO 4 (Execution) | ~400 tokens | ~50 tokens | **87.5%** |

### 🔄 Mudanças de Comportamento

**cortex-boot.md**
- PASSO 3.2: Gera CORTEX_INDEX e CORTEX_CONTEXT dinamicamente
- PASSO 3.3: Gera fingerprint de arquivos
- PASSO 3.4: Gera/atualiza session manifesto
- PASSO 6: Exibe informações do CORTEX_CONTEXT comprimido
- **PASSO 7: Seleção de modo interativa** (NOVO)
  - Tela ASCII art com visual aprimorado
  - Opções numeradas [1/2/3] com ícones e descrições
  - Integração com AskUserQuestion para seleção interativa
- **CORREÇÃO v1.2.1** (NOVO):
  - Prioridade de busca ajustada: `docs/.cortex/` primeiro, `.claude/` como fallback
  - Arquivos finais SEMPRE escritos em `docs/.cortex/` (versionados com o projeto)
  - Templates em `.claude/` atualizados como cópia de referência
  - Soluciona problema: Boot esperava encontrar arquivos em `.claude/` mas eles estavam em `docs/`

**cortex-strategy.md**
- Warm-up (mini) valida fingerprint antes de usar contexto
- Warm-up (mini) usa manifesto para verificar sessions
- Ao criar session: atualiza manifesto automaticamente
- Ao aprovar GATE 2: marca session como "closed"

**cortex-execution.md**
- PASSO 1: Valida fingerprint antes de continuar
- PASSO 2: Identifica session via manifesto
- PASSO 4: Usa CORTEX_CONTEXT comprimido
- GATE 3: Lookup incremental via CORTEX_INDEX
  - ~80% dos casos encontram ADRs via INDEX
  - Apenas quando necessário: relê `adrs-summary.md` completo
- Durante o Work: atualiza manifesto ao criar plan.md
- **Arquivos de contexto movidos para docs/.cortex/** (NOVO)
  - `.cortex-context.json` → `docs/.cortex/.cortex-context.json`
  - `.cortex-fingerprint.json` → `docs/.cortex/.cortex-fingerprint.json`
  - `.cortex-index.json` → `docs/.cortex/.cortex-index.json`
  - `sessions/manifest.json` → `docs/.cortex/sessions-manifest.json`

### 🛡️ Melhorias de Segurança

- **Detecta mudanças em docs/**: Fingerprint impede uso de contexto desatualizado
- **Single Source of Truth**: Dados do projeto ficam em `docs/`
- **Genericidade garantida**: `.claude/` contém apenas framework genérico

### 🏗️ Arquitetura

```
.claude/                           # APENAS framework genérico
├── changelog/                     # Versionamento de mudanças (NOVO)
│   ├── CHANGELOG.md            # Este arquivo
│   └── MODE_SELECTION.md        # Exemplos visuais de seleção de modo (NOVO)
├── .cortex-index.json             # Template vazio (preenchido dinamicamente)
├── .cortex-context.json           # Template vazio (preenchido dinamicamente)
├── .cortex-fingerprint.json       # Será gerado pelo Boot
├── master/
│   ├── cortex-boot.md             # Framework genérico
│   ├── cortex-strategy.md         # Framework genérico
│   └── cortex-execution.md       # Framework genérico
└── sessions/
    └── manifest.json             # Será gerado/atualizado pelo Boot

docs/                             # DADOS ESPECÍFICOS DO PROJETO
└── technical-context/
    └── briefing/                 # Fonte única de dados
```

### 📝 Notas Importantes

- **Template vs Dados**: Os arquivos `.cortex-index.json` e `.cortex-context.json`
  são **templates vazios** que são preenchidos dinamicamente pelo Boot.

- **Independência de Projeto**: O Framework Cortex agora funciona em QUALQUER projeto
  sem modificar a pasta `.claude/`. Basta ter `docs/technical-context/` estruturado.

- **Regeneração Automática**: Se `docs/` mudar, o Boot detecta via fingerprint
  e regera os índices automaticamente.

---

## [1.1.0] - 2026-02-20

### 🚀 Versão Inicial

Framework Cortex v1.0.0 - Versão inicial do orquestrador multiagente.

**Funcionalidades Principais:**
- Modo Strategy: Captação & Planejamento (Janela 1)
- Modo Execution: Execução Técnica (Janela 2)
- Boot: Carrega contexto do projeto de `docs/`
- ADR-First: Lê decisões de arquitetura antes de escrever código
- Fail Loud, Never Silent: Nunca avança com contexto incompleto

**Arquitetura:**
- MVVM adaptado para Next.js
- Zustand para gerenciamento de estado
- shadcn/ui como design system exclusivo
- Server Components e Client Components

---

## Como Contribuir

Ao fazer mudanças no Framework Cortex:

1. Atualizar o número da versão no formato `[MAJOR].[MINOR].[PATCH]`
2. Adicionar entrada em CHANGELOG.md com:
   - Versão
   - Data
   - Categoria (Novas Funcionalidades, Melhorias, Correções)
   - Descrição detalhada
3. Seguir princípios:
   - Genericidade: `.claude/` não deve conter dados do projeto
   - Performance: Buscar economia de tokens
   - Segurança: Fail Loud, Never Silent

---

## Roadmap

### [1.5.1] - Planejado

- Integração com Git para versionamento de sessions
