---
name: synapos-pipeline-runner
description: Engine de execução de pipelines — gerencia steps, agents, vetos e revisões
---

# SYNAPOS PIPELINE RUNNER v2.10.0

> Responsável por executar pipelines de squads step-by-step.
> Chamado pelo orchestrator após criação ou carregamento de um squad.
>
> v2.0: Sistema de sessions — todos os artefatos de uma feature vivem em
> `docs/.squads/sessions/{feature-slug}/`, compartilhado entre squads.
>
> v2.3: Sistema de memória otimizado — manifest-based caching, memories windowing,
> on-demand architecture.md, atomic state writes.
>
> v2.4: plan.md é artefato estático (state.json é fonte única de progresso),
> architecture.md cacheado em memória por pipeline run, checkpoints da
> pré-execução consolidados em um único checkpoint final.
>
> v2.5: CHANGE GUARD — rastreamento de alterações por step. Todo step inline/subagent
> reporta arquivos alterados (com trechos), arquivos revisados sem alteração e motivo.
>
> v2.6: Pré-execução automática — context.md ausente em session nova aciona pré-exec
> automaticamente sem perguntar ao usuário. Retomadas mantêm comportamento anterior.
>
> v2.7: HANDOFF compacto — cada step emite bloco `## HANDOFF` ao final. depends_on
> injeta apenas o HANDOFF (não o arquivo completo). Full output disponível via
> `needs_full_output_of: step-id`. Reduz overflow de contexto entre steps.
>
> v2.8: GATE-3a estrutural — valida schema do output (seções obrigatórias, formatos)
> antes da validação semântica de veto_conditions. Falhas são precisas e acionáveis.
>
> v2.9: Persona focada por tipo de step — pipeline-runner injeta apenas a seção
> `## Foco por Tipo de Step` do agent (se existir), não a persona inteira.
> Fronteira negativa `## Fora do Meu Escopo` é injetada como fence no prompt.
> CHANGE GUARD para subagent usa `git diff` como fonte primária (self-report como fallback).
>
> v2.10: SESSION REPORT — `session-report.md` gerado automaticamente ao final de todo pipeline.
> Consolida arquivos modificados, gates executados, decisões tomadas e HANDOFF final.
> COMMIT AUTOMÁTICO — FASE 3.4 cria commit git estruturado (opt-in via `auto_commit` no squad.yaml).
> `[SESSION_REPORT_DATA]` acumulado durante execução, escrito uma vez na FASE 3.3.

---

## PROTOCOLO DE EXECUÇÃO

Receba do orchestrator:
- Configuração do squad: `.synapos/squads/{squad-slug}/`
- Feature session: `docs/.squads/sessions/{feature-slug}/`
- Pipeline a executar (ID ou `default`)

Execute os passos abaixo na ordem exata.

---

## CONCEITO: SESSION

Cada feature tem uma **session** — pasta única e permanente compartilhada por todos os squads que trabalham nela.

```
docs/.squads/sessions/{feature-slug}/
├── session.manifest.json  ← índice de cache leve (hashes + timestamps)
├── context.md             ← contexto da feature (investigação)
├── context.snapshot       ← resumo compacto de context.md (~50 tokens), derivado e cacheado
├── architecture.md        ← desenho técnico — carregado on-demand, nunca automático
├── plan.md                ← plano de execução por fases
├── memories.md            ← aprendizados acumulados — janela deslizante (SUMMARY + RECENTES)
├── review-notes.md        ← notas de revisão (atualizado a cada review)
├── state.json             ← estado da feature, atualizado por cada squad
└── state.tmp.json         ← escrita atômica temporária (renomeado para state.json após sucesso)
```

O `{feature-slug}` é o identificador da feature — geralmente o nome da branch (`feat/auth-module`) ou um slug descritivo (`auth-module`).

---

## FASE 1 — INICIALIZAÇÃO

### 1.1 — Carregar contexto

> **Princípio:** A LLM não deve descobrir o projeto. Ela deve receber apenas o que precisa para executar o próximo step.
> Contexto começa mínimo e expande somente quando o step declara necessidade.

**Receba do orchestrator** as variáveis derivadas (nunca releia esses arquivos):
- `[EXECUTION_MODE]` — `quick` | `complete`
- `[MODELO_TIER]` — `high` | `standard` | `lite`
- `[LINGUA]` — ex: `pt-BR`
- `[TASK_TRACKER]` — `none` | `jira` | `linear` | etc.
- `[COMPANY_CONTEXT]` — conteúdo de `docs/_memory/company.md` (Tier 0)
- `[STACK_CONTEXT]` — conteúdo de `docs/_memory/stack.md` (Tier 0, pode ser vazio)

Leia apenas:
```
.synapos/squads/{squad-slug}/squad.yaml   → configuração do squad
```

> **Regra:** `preferences.md`, `company.md` e `stack.md` são lidos **uma única vez** pelo orchestrator. O pipeline-runner reutiliza os valores recebidos — nunca relê do disco.
>
> **Se `[STACK_CONTEXT]` vier vazio:** continue normalmente. Emita **uma única vez** no início do pipeline:
> `⚠️ [STACK] stack.md ausente — agents usarão exemplos genéricos. Execute /setup:discover para gerar.`
> Não repita este aviso por step ou por agent.

Leia `execution_mode` do `squad.yaml` e configure o runner:

| `execution_mode` | Contexto injetado | Gates ativos |
|---|---|---|
| `quick` | Tier 0 + context (snapshot ou completo) + memories RECENTES | GATE-0, GATE-3, GATE-5 |
| `complete` | Tier 0 + context + memories RECENTES + ADRs filtrados por domínio | GATE-0, GATE-3, GATE-5 |

Log ao iniciar:
```
⚙️  [MODE] {Rápido | Completo}
   Gates ativos: GATE-0, GATE-3, GATE-5
```

**Se `execution_mode: quick`:**
- Não tente ler `docs/`, `docs/business/`, `docs/tech/` nem `docs/tech-context/`
- Log adicional: `⚡ [RÁPIDO] Contexto mínimo — ADRs e docs de projeto não injetados`

#### 1.1a — Carregar contexto da feature (com validação de manifest)

1. Leia `docs/.squads/sessions/{feature-slug}/session.manifest.json`

2. **Se o manifest existe:**
   - Compare o hash registrado de `context.md` com o hash atual: `"{tamanho_bytes}-{mtime_com_segundos}"`
   - **Se hash válido (arquivo não mudou):** carregue `context.snapshot` — não carregue `context.md`
   - **Se hash inválido (arquivo mudou):** carregue `context.md` completo, regenere `context.snapshot`, atualize o manifest
   - Log (se snapshot usado): `📦 [MANIFEST] context.snapshot carregado — context.md inalterado`
   - Log (se context.md carregado): `🔄 [MANIFEST] context.md atualizado — snapshot regenerado`

3. **Se o manifest não existe:** carregue `context.md` completo (o manifest será criado na FASE 1.4).

> **Regra — context.snapshot:**
> É um resumo estruturado de ~50 tokens de context.md, gerado uma vez e reutilizado enquanto o arquivo não mudar.
> Contém: o que é a feature, motivação principal, decisões críticas, armadilhas conhecidas.
> Nunca tome decisões de fluxo baseadas apenas no snapshot — use context.md completo quando o step declarar `needs_full_context: true`.

#### 1.1b — Carregar memories (janela deslizante)

Leia `docs/.squads/sessions/{feature-slug}/memories.md`:

**Detecção de formato:**
- Se o arquivo contém `<!-- RECENTES -->`: formato novo — carregue apenas o bloco `<!-- RECENTES -->` (últimas 5 entradas)
- Se o arquivo **não** contém `<!-- RECENTES -->`: formato legado — **migre automaticamente**:
  1. Adicione os blocos ao arquivo (sem mover conteúdo):
     ```markdown
     <!-- SUMMARY -->
     <!-- /SUMMARY -->

     <!-- RECENTES -->
     {conteúdo legado existente vai aqui}
     <!-- /RECENTES -->
     ```
  2. Log: `🔄 [MEMORY] memories.md legado — estrutura de blocos adicionada automaticamente`
  3. Carregue as últimas 5 entradas pelo marcador `## [` mais recentes

**Nunca carregue** o bloco `<!-- SUMMARY -->` por padrão.

Se `entry_count > 10` e o bloco RECENTES não foi consolidado: log `⚠️ [MEMORY] memories.md com {N} entradas — execute /session consolidate`

Log:
```
🧠 [MEMORY] {N} entradas recentes carregadas de memories.md
```

> **Exceção:** Steps que declaram `needs_history: true` recebem também o bloco `<!-- SUMMARY -->` de memories.md.

#### 1.1c — Carregar project-learnings.md

**Se `execution_mode: quick`:** não carregue. Fim desta seção.

**Se `execution_mode: complete`:**
- Verifique se `docs/_memory/project-learnings.md` existe
- **Se existe:** carregue o arquivo completo e inclua no contexto de todos os steps
- Log: `📚 [LEARNINGS] project-learnings.md carregado`
- **Se não existe:** nenhuma ação

---

#### 1.1d — Carregar ADRs (modo complete, filtrado por domínio)

**Se `execution_mode: quick`:** não carregue ADRs. Fim desta seção.

**Se `execution_mode: complete`:**
- Leia o campo `domain` do `squad.yaml`
- Leia apenas os arquivos em `docs/` cujo frontmatter contenha `domain: [...]` com interseção com o domínio do squad
- ADRs sem frontmatter `domain:` recebem tratamento `domain: [*]` — são carregados sempre
- Armazene como `[ADRS_CARREGADOS]` — filtrado, não bloco completo
- Log: `📋 [ADR] {N} ADRs carregados para domínio: {domain}`

#### 1.1e — Arquivos NÃO carregados automaticamente

Os arquivos abaixo são **on-demand** — somente carregados quando o step declara necessidade:

| Arquivo | Quando carregar |
|---|---|
| `architecture.md` | Step declara `output_files` (via SCOPE GUARD) ou `needs_architecture: true` — **cacheado em memória** após primeira leitura do pipeline run |
| `plan.md` | Step declara `needs_plan: true` — artefato de referência humana, não rastreado automaticamente |
| `review-notes.md` | Step declara `needs_review: true` |
| `docs/` completo | Apenas `execution_mode: complete` E step declara `needs_docs: true` |

> **Motivo:** Carregar esses arquivos em toda execução desperdiça tokens quando o step não os usa.
> architecture.md é carregado on-demand na FASE 2.3b para steps com `output_files`.


### 1.1f — Configurar model-adapter (binding antecipado)

Use `[MODELO_TIER]` recebido do orchestrator. **Não releia `preferences.md`.**

| Valor | Ação |
|---|---|
| `high` ou ausente | Sem adaptação — comportamento normal |
| `standard` | Carregar model-adapter.md e derivar `[CONTEXT_RULES]` agora |
| `lite` | Carregar model-adapter.md e derivar `[CONTEXT_RULES]` agora |

**Se `[MODELO_TIER]` for `standard` ou `lite`:**
1. Leia `.synapos/core/model-adapter.md` agora
2. Derive e armazene `[CONTEXT_RULES]` com os limites de contexto por bloco:
   ```
   [CONTEXT_RULES]
   context_snapshot_only: true         ← nunca injeta context.md completo
   max_memories_entries: 3             ← bloco RECENTES limitado a 3 (não 5)
   no_adrs: true                       ← ADRs não injetados (exceto adr_required: true no step)
   no_architecture_auto: true          ← architecture.md nunca injetado automaticamente
   depends_on_summary: true            ← outputs de steps anteriores recebem resumo, não íntegra
   ```
3. Aplique `[CONTEXT_RULES]` durante a montagem do contexto do step na FASE 2.3 — **antes** de enviar ao agent, não depois

Log:
```
🔧 [MODEL-ADAPTER] Modo {standard|lite} ativo — regras de contexto derivadas
   context_snapshot_only | max_memories: {3|5} | no_adrs: {true|false}
```

### 1.2 — Resolver pipeline

Leia `.synapos/squads/{squad-slug}/pipeline/pipeline.yaml`.

**Se o pipeline.yaml declara `session_files`:**

```yaml
session_files:
  context: context.md
  architecture: architecture.md
  plan: plan.md
```

Esses arquivos ficam na session folder. Toda vez que um step gera um `output_file` que coincide com um `session_files`, o arquivo é salvo na session e injetado automaticamente no contexto de todos os steps subsequentes.

Estrutura esperada do pipeline.yaml:
```yaml
name: "Nome do Pipeline"
description: "Descrição do fluxo"
steps:
  - id: step-id
    name: "Nome do Step"
    agent: agent-id
    file: pipeline/steps/{step-id}.md
    execution: subagent | inline | checkpoint
    model_tier: fast | powerful
    output_files:                     # nomes de arquivo apenas
      - {nome}.md                     # vai para docs/.squads/sessions/{feature-slug}/
    output_schema:                    # opcional — define contrato estrutural do output
      required_sections:              # seções de markdown obrigatórias (## Título)
        - "## Meta"
        - "## Motivação"
      formats:                        # validações de formato específicas
        - field: "## Meta"
          pattern: "Permitir .+ para que .+"   # regex opcional
    veto_conditions:                  # opcional — validação semântica (GATE-3 semântico)
      - "condição que invalida o output"
    needs_full_output_of: step-id     # opcional — injeta output completo de step anterior
                                      # (padrão: injeta apenas o bloco HANDOFF do step)
    on_reject: step-id-anterior       # opcional — loop de revisão
    depends_on: [step-id]             # opcional
```

> **output_schema vs veto_conditions:** `output_schema` valida estrutura (GATE-3a — antes da execução do agente verificar).
> `veto_conditions` valida semântica (GATE-3 — "o output faz sentido?"). São complementares, não redundantes.
> `output_schema` falha com mensagem precisa ("## Meta ausente"); `veto_conditions` falha com mensagem semântica.

### Campo `model_tier` por step

Define a intensidade de processamento esperada para o step:

| Valor | Uso recomendado |
|-------|----------------|
| `fast` | Preparação, leitura, formatação, gates simples |
| `powerful` | Geração de conteúdo, arquitetura, spec, implementação, decisões complexas |

**Padrão quando não definido:** `powerful`.

**Multi-model environments:** Se `docs/_memory/preferences.md` define dois campos:
```yaml
model_fast: claude-haiku-4-5
model_powerful: claude-opus-4-6
```
O pipeline-runner roteia cada step automaticamente:
- `model_tier: fast` → usa `model_fast`
- `model_tier: powerful` → usa `model_powerful`
- Campo não definido → usa `model_powerful`

Se apenas um modelo está configurado em preferences.md, todos os steps usam o mesmo modelo independente do `model_tier`.

### 1.3 — Carregar agents

Para cada agent no squad.yaml, leia o arquivo `.agent.md` correspondente em `.synapos/squads/{squad-slug}/agents/`.

**Carregar compliance-protocol.md (uma vez, shared):**

Leia `.synapos/core/compliance-protocol.md` e armazene como `[COMPLIANCE_PROTOCOL]`.

Injete `[COMPLIANCE_PROTOCOL]` no contexto de **todo** step `inline` ou `subagent`, após as seções do agent (`## Foco por Tipo de Step`), antes da instrução do step. Este bloco substitui as seções `### ADRs`, `### [DECISÃO PENDENTE]` e `### HANDOFF` que antes viviam em cada `.agent.md`.

> **Motivo:** O conteúdo é idêntico para todos os agents. Uma única leitura + injeção por run, em vez de 45 linhas duplicadas em 30 arquivos.

### 1.4 — Inicializar ou retomar session

#### A. Verificar session folder

Verifique se `docs/.squads/sessions/{feature-slug}/` existe.

**Se não existe:** crie a pasta e inicialize os arquivos:

```
docs/.squads/sessions/{feature-slug}/
├── session.manifest.json  ← inicializar com estrutura abaixo
├── context.md             ← template padrão (ver abaixo)
├── context.snapshot       ← gerado após context.md ser preenchido
├── memories.md            ← template padrão com estrutura de blocos
├── review-notes.md        ← inicializar vazio com header
└── state.json             ← inicializar com estrutura abaixo
```

`session.manifest.json` inicial:
```json
{
  "feature": "{feature-slug}",
  "manifest_version": 2,
  "created_at": "{ISO datetime}",
  "files": {
    "context.md":      { "hash": null, "snapshot_valid": false, "loaded_at": null },
    "architecture.md": { "hash": null, "snapshot_valid": false, "loaded_at": null },
    "memories.md":     { "entry_count": 0, "last_entry_at": null }
  },
  "adrs": {
    "loaded_domains": [],
    "loaded_at": null
  }
}
```

> **Hash:** string derivada de tamanho do arquivo + data de modificação (não requer cálculo SHA — apenas uma chave de invalidação).
> **Regra de invalidação:** Se o arquivo foi modificado desde `loaded_at`, o hash é recalculado e `snapshot_valid` volta para `false`.

`state.json` inicial:
```json
{
  "feature": "{feature-slug}",
  "created_at": "{ISO datetime}",
  "updated_at": "{ISO datetime}",
  "squads": {}
}
```

`context.md` inicial:
```markdown
# Contexto: {feature-slug}

> Arquivo central da feature. Lido por todos os roles antes de executar qualquer step.
> Atualizado pelo role que fizer discovery/investigação.

## O que é
{descrição da feature — preenchido na pré-execução ou pelo usuário}

## Por que existe
{motivação de negócio ou técnica}

## Decisões tomadas
{decisões já resolvidas — evita retrabalho}

## O que não fazer
{armadilhas conhecidas, abordagens descartadas}
```

`plan.md` — estrutura esperada quando gerado por pré-execução:

```markdown
# Plano: {feature-slug}

> Gerado em: {YYYY-MM-DD} | Squad: {squad-slug}
> Artefato estático de referência humana — progresso real é rastreado em state.json.

---

## Fases de execução

{descrição das fases — discovery, implementação, review, etc., com agents/skills atribuídos e estimativas}
```

> **Progresso:** `state.json` é a única fonte de verdade. `plan.md` documenta o plano aprovado e não é reescrito durante execução.
> **Escopo de modificação:** a lista de arquivos autorizados para escrita vive em `architecture.md` (seção de arquivos a modificar/criar), não em `plan.md`. O runner lê architecture.md para derivar o SCOPE GUARD.

`memories.md` inicial (com estrutura de janela deslizante):
```markdown
# Memória: {feature-slug}

> Aprendizados acumulados de todos os roles que trabalharam nesta feature.
> O pipeline-runner carrega apenas o bloco RECENTES por padrão.
> Para expandir o histórico completo: use /session consolidate.
>
> [DECISÃO CRÍTICA] — use este marcador em entradas que NUNCA devem ser comprimidas.
> Entradas com [DECISÃO CRÍTICA] são permanentes — não são movidas para SUMMARY.

<!-- SUMMARY -->
<!-- /SUMMARY -->

<!-- RECENTES -->
(preenchido durante execuções)
<!-- /RECENTES -->
```

> **Regra de append:** Novas entradas vão sempre dentro de `<!-- RECENTES -->`, antes do marcador `<!-- /RECENTES -->`.
> **Janela:** Ao atingir mais de 10 entradas em RECENTES, o pipeline-runner avisa para consolidar via `/session consolidate`.
> **Consolidação:** Move entradas antigas do bloco RECENTES para o SUMMARY — exceto entradas com `[DECISÃO CRÍTICA]`.
> **Leitura padrão:** Pipeline-runner carrega apenas o bloco RECENTES. Steps com `needs_history: true` recebem também o SUMMARY.
> **[DECISÃO CRÍTICA]:** Entradas com este marcador nunca são comprimidas. Use para decisões arquiteturais, requisitos regulatórios ou escolhas com impacto de segurança.

`review-notes.md` inicial:
```markdown
# Review Notes: {feature-slug}

> Notas de revisão de todos os roles. Append-only.

(preenchido durante revisões)
```

#### B. Verificar entrada do squad atual no state.json

Leia `state.json` e verifique se existe `state.squads["{squad-slug}"]`.

**Se o orchestrator passou `resume_from: {step-id}` (retomada):**

> O orchestrator já perguntou ao usuário. O pipeline-runner apenas executa.

1. **Validar o step de retomada:**
   - Verifique se `resume_from` corresponde a um step existente no `pipeline.yaml`
   - Se **não existir** no pipeline: log `⚠️ [RESUME] Step '{resume_from}' não encontrado no pipeline — inferindo próximo step`
     - Derive o próximo step: primeiro step do pipeline cujo `id` não está em `completed_steps`
     - Se todos os steps já estão em `completed_steps`: trate como pipeline já concluído → FASE 3 diretamente

2. **Re-injetar outputs de steps anteriores:**
   - Para cada step em `completed_steps`: verifique se ele tem `output_files` no `pipeline.yaml`
   - Para cada `output_file` de step concluído: carregue o arquivo da session folder se existir
   - Esses arquivos entram como "outputs disponíveis" no contexto dos steps subsequentes (via `depends_on` ou injeção direta)
   - Log: `📦 [RESUME] {N} outputs anteriores re-injetados: {lista de arquivos}`

3. **Atualizar state:**
   - Mantenha `completed_steps` existente — não limpe
   - Atualize `current_step: null`, `suspended_at: {resume_from}`, `status: "running"`, `updated_at: {agora}`

4. **Anunciar retomada:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⚡ Retomando pipeline
   Squad:     {squad-slug}
   Feature:   {feature-slug}
   Concluídos: {completed_steps.length}/{total} steps
   Retomando: {nome-do-step} ({resume_from})
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Executar a partir de `resume_from`** — pule todos os steps em `completed_steps`, execute normalmente a partir do step indicado.

**Se o orchestrator passou `resume_from: null` (reinício do zero):**

- O state.json já foi limpo pelo orchestrator (`completed_steps: []`, `suspended_at: null`)
- Trate como nova execução: siga para "nova execução do squad" abaixo
- Log: `🔁 [RESUME] Reinício do zero — pipeline executará todos os {total} steps`

**Se não existe ou `"status": "completed"` / `"discarded"`** — nova execução do squad:

Crie/atualize a entrada do squad no state.json:
```json
{
  "squads": {
    "{squad-slug}": {
      "domain": "{domain}",
      "pipeline": "{pipeline-id}",
      "started_at": "{ISO datetime}",
      "completed_at": null,
      "status": "running",
      "completed_steps": [],
      "current_step": null,
      "suspended_at": null
    }
  }
}
```

Atualize `state.updated_at`.

**A cada step iniciado**, atualize imediatamente `state.squads["{squad-slug}"].suspended_at` com o step atual. Isso garante recuperação precisa se a sessão for interrompida.

### 1.4c — Resiliência do state.json

O state.json é **best-effort** — log de execução, não fonte de verdade crítica.

**Leitura:**
- Tente parsear como JSON
- Se falhar: logue `⚠️ state.json corrompido — reiniciando estado` e reinicialize com estrutura mínima
- Nunca bloqueie a execução por causa do state.json

**Escrita atômica (obrigatória):**
1. Escreva o novo conteúdo em `state.tmp.json`
2. Após escrita bem-sucedida, renomeie `state.tmp.json` → `state.json`
3. Se a escrita de `state.tmp.json` falhar: logue o erro e continue sem interromper o pipeline
4. Nunca escreva diretamente em `state.json` — sempre via `state.tmp.json`

> **Por quê:** Escrita direta pode corromper o arquivo se a execução for interrompida no meio da operação.
> A escrita atômica garante que `state.json` sempre contém um estado válido completo.

**Regra:** agents não escrevem no state.json. Apenas o pipeline-runner.

**Fonte de verdade:** `state.json` é a única fonte de verdade para progresso. `plan.md` é artefato estático da pré-execução (não reescrito durante execução).

### 1.4b — Verificar pre_pipeline

**Validação de segurança:** Antes de acessar `pre_pipeline`, verifique se a chave existe no squad.yaml.

```yaml
# squad.yaml — estrutura válida
pre_pipeline:
  available: true       # boolean
  agent: {id-do-agent-lead}  # string — ID de um agent do squad
```

**Se `pre_pipeline` não existe ou `available: false`:** pule esta seção.

**Se `pre_pipeline.available: true`:**

1. **Validar agente:**
   - Verifique se `pre_pipeline.agent` está preenchido (não vazio/nulo)
   - Verifique se o agent referenciado existe no squad.yaml (em `agents[]`)
   - Se inválido: log `⚠️ pre_pipeline.agent inválido ou não encontrado — pulando pré-execução` e pule

2. **Validar arquivo do pipeline:**
   - Verifique se `.synapos/core/pipelines/pre-execution.yaml` existe
   - Se não existe: log `⚠️ pre-execution.yaml não encontrado — pulando pré-execução` e pule

3. **Se `context.md` já existe na session:** pule — pré-execução já feita.

4. **Se `context.md` não existe E pré-execução válida:** execute automaticamente, sem perguntar.

> **Motivo:** Session nova sem context.md significa que o agente trabalhará sem contexto
> de negócio ou arquitetura — o output inevitavelmente será genérico ou incorreto.
> A pré-execução não é um opcional: é a fundação de tudo o que vem depois.
> Para sessions retomadas (context.md já existe), o comportamento anterior se mantém — pule.

Anuncie ao iniciar:
```
🔍 Session nova detectada — executando pré-execução automaticamente.
   Investigação → Arquitetura → Planejamento → {nome do pipeline principal}
```

1. Leia `.synapos/core/pipelines/pre-execution.yaml`
2. Use `pre_pipeline.agent` como lead do pre-execution
3. Execute os steps do pre-execution (com todos os gates e checkpoints)
4. Os arquivos gerados (context.md, architecture.md, plan.md) vão para a session folder
5. Ao concluir, anuncie:
   ```
   ✅ Pré-execução concluída.
   Session: docs/.squads/sessions/{feature-slug}/
   Arquivos disponíveis: context.md, architecture.md, plan.md
   Iniciando: {nome do pipeline principal}...
   ```
6. Continue para o pipeline principal com session files já no contexto

### 1.5 — Verificação de Squads Paralelos

Ao iniciar a execução, leia `state.json` da feature.

Se existirem outros squads com `"status": "running"` na mesma feature:
```
⚠️  [PARALELO] Outros squads ativos nesta feature:
   {lista de squad-slugs com status running}

Arquivos que este pipeline pode modificar:
   {lista de output_files deste pipeline}

Possível conflito se outro squad também modificar os mesmos arquivos.
Recomendação: coordene com o outro squad antes de sobrescrever arquivos compartilhados.

Continuar? [Enter para sim]
```

Nunca bloqueie — apenas avise e aguarde confirmação.

### 1.6 — Inicializar SESSION_REPORT_DATA

Inicialize em memória (nunca no disco durante execução):

```
[SESSION_REPORT_DATA] = {
  feature: {feature-slug},
  squad: {squad-slug},
  pipeline: {pipeline-name},
  started_at: {ISO datetime},
  steps: [],              ← preenchido a cada step (seção 2.8)
  all_files_changed: [],  ← consolidado de todos os CHANGE GUARD reports
  all_decisions: [],      ← [DECISÃO PENDENTE] resolvidas
  gate_summary: { passed: 0, failed: 0, retries: 0 }
}
```

> `[SESSION_REPORT_DATA]` é acumulado durante toda a execução e escrito como `session-report.md` apenas uma vez na FASE 3.3. Nunca escreva parcialmente durante a execução — o report incompleto é pior que ausente.

### 1.7 — Anunciar início

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline: {nome do pipeline}
Squad:    {squad-slug} | Modo: {Alta Performance | Econômico | Solo}
Feature:  {feature-slug}
Session:  docs/.squads/sessions/{feature-slug}/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## FASE 2 — EXECUÇÃO DE STEPS

Para cada step do pipeline (em ordem, respeitando `depends_on`):

### 2.1 — Atualizar state

```json
{
  "squads": {
    "{squad-slug}": {
      "current_step": "{step-id}",
      "suspended_at": "{step-id}",
      "status": "running"
    }
  },
  "updated_at": "{ISO datetime}"
}
```

### 2.2 — Anunciar step

```
▶ [{N}/{total}] {Nome do Step}
   Agent: {icon} {displayName do agent}
```

### 2.3 — Carregar step

Leia o arquivo do step: `.synapos/squads/{squad-slug}/{file}`

**Antes de passar as instruções ao agent, substitua todas as ocorrências de `docs/` no texto do step por `docs/.squads/sessions/{feature-slug}/`.**

Exemplo: `docs/architecture.md` → `docs/.squads/sessions/auth-module/architecture.md`

**Se `model_capability` for `standard` ou `lite` (verificado em 1.1f):**
Aplique o protocolo do MODEL-ADAPTER sobre o prompt composto antes de enviar ao agent.
O adapter atua apenas em steps com `execution: subagent` ou `execution: inline`.
Steps com `execution: checkpoint` nunca são afetados.

### 2.3a — Montar persona do agent (foco por tipo de step + fronteira negativa)

Execute antes de qualquer outro bloco de contexto.

**1. Carregar persona do agent**

Leia o `.agent.md` do agent atribuído ao step.

**2. Extrair foco por tipo de step (se disponível)**

Verifique se o arquivo `.agent.md` contém a seção `## Foco por Tipo de Step`.

- **Se existe:** identifique o tipo do step atual (derivado do id ou nome: `investigacao`, `arquitetura`, `implementacao`, `revisao`, `planejamento`, `diagnostico`, `execucao`, `review`, `docs`, `seguranca`, `integracao`, `design` — use correspondência de substring no id/name do step).
  - Extraia apenas a linha relevante para o tipo atual.
  - Armazene como `[AGENT_FOCUS]`. Injete no prompt **após a seção `## Persona`** e **antes** de qualquer instrução.
  - **Não injete** o restante da persona completa — use apenas `## Identidade` + `[AGENT_FOCUS]` + `## Quality Criteria` + `## Compliance Obrigatório` + `## Modo Lite` (se ativo).
  - Log: `🎯 [PERSONA] Foco injetado para tipo: {tipo-do-step}`

- **Se não existe:** injete a persona completa como antes. Sem log.

> **Motivo:** Uma arquiteta frontend que recebe 200 linhas de persona ao revisar código tem
> princípios de design de componente competindo com os critérios de revisão. O foco reduz
> o ruído e sharpens o comportamento do agente para o que o step realmente requer.

**3. Injetar fronteira negativa (se disponível)**

Verifique se o arquivo `.agent.md` contém a seção `## Fora do Meu Escopo`.

- **Se existe:** injete o conteúdo como bloco de fence **logo após a persona**, antes das instruções do step:

```
⛔ FORA DO MEU ESCOPO — não execute mesmo que pareça útil:
{conteúdo da seção ## Fora do Meu Escopo}
```

- **Se não existe:** continue normalmente.

> **Motivo:** Sem fronteira explícita, agents em modo `inline` fazem role bleed — o arquiteto
> começa a implementar, o reviewer começa a redesenhar. A fence negativa cria um sinal de
> "stay in your lane" mais forte que princípios positivos sozinhos.

---

### 2.3b — SCOPE GUARD (apenas steps com `output_files` definido)

Execute este guard **apenas** em steps que declaram `output_files` no pipeline.yaml com `execution: subagent` ou `execution: inline`. Steps sem `output_files` não recebem SCOPE GUARD.

**Ordem de composição do prompt** (quando MODEL-ADAPTER também está ativo):
```
1. [MODEL-ADAPTER: CoT Prefix — S1/L3, se capability standard/lite]
2. [Agent Persona]
3. [SCOPE LOCK — injetado aqui, após persona]
4. [Contexto + Instrução do step]
```

**1. Carregar e extrair escopo autorizado (on-demand, com cache por pipeline run)**

> `architecture.md` é carregado on-demand neste step — não foi carregado na FASE 1.1.
> A primeira leitura dentro do pipeline run popula `[ARCHITECTURE_CACHE]` (conteúdo + lista de arquivos autorizados).
> Steps subsequentes do mesmo run reutilizam o cache — **nunca releem o arquivo**.

**Lógica:**
1. Se `[ARCHITECTURE_CACHE]` está populado: use o conteúdo e a lista cacheados. Pule para o passo 2 (injetar SCOPE GUARD). Log: `📦 [SCOPE] architecture.md reutilizado do cache`
2. Se `[ARCHITECTURE_CACHE]` está vazio (primeira leitura):
   - Leia `docs/.squads/sessions/{feature-slug}/architecture.md`
   - Extraia a lista de arquivos a modificar/criar (tipicamente em `## Arquivos a modificar`, `## Arquivos afetados`, `## Escopo de modificação` — a veto condition do pre-execution garante que a seção existe)
   - Armazene `[ARCHITECTURE_CACHE] = { content, scope_files }`
   - Atualize `session.manifest.json`: `architecture.md.loaded_at = {agora}`
   - Log: `🔄 [SCOPE] architecture.md carregado (primeira vez neste run)`

> **Invalidação do cache:** `[ARCHITECTURE_CACHE]` vive apenas durante o pipeline run. Se o usuário editar architecture.md entre runs, a próxima execução relê do disco.
> **Quando o SCOPE GUARD autoriza novo arquivo** (ver passo 3 abaixo): o arquivo é adicionado ao `scope_files` do cache E persistido em architecture.md no disco.

- **Se a lista existe:** use-a como escopo autorizado.
- **Se `architecture.md` não existe ou não tem lista de arquivos:** não injete SCOPE GUARD. Log: `⚠️ [SCOPE] architecture.md sem lista de arquivos — SCOPE GUARD desativado para este step`. Continue normalmente sem restrição.

> **Regra de fallback:** ausência de escopo = sem restrição, não escopo mínimo. Nunca derive escopo de `output_files` do pipeline.yaml — esses são session files, não arquivos do projeto.

**2. Injetar SCOPE GUARD no prompt (após persona do agent)**

```
⛔ SCOPE GUARD ATIVO

Você SOMENTE pode criar ou modificar estes arquivos do projeto:
{lista extraída de architecture.md}

PROIBIDO escrever em:
- Qualquer arquivo fora da lista acima
- .synapos/** (framework — nunca alterar)
- docs/ raiz e docs/_memory/ (somente leitura)

Leitura é sempre permitida — nunca há restrição para ler arquivos.

Se perceber necessidade de alterar arquivo fora desta lista:
→ Sinalize com [DECISÃO PENDENTE] e descreva o motivo.
→ NUNCA expanda o escopo silenciosamente.
```

**3. Veto de escopo no output**

Após receber o output do agent, antes de passar para GATE-3, verifique se o output declara explicitamente a intenção de criar ou modificar arquivo fora da lista autorizada (caminhos mencionados no texto do output).

- **Arquivo não autorizado detectado** → não auto-rejeita. Apresente ao usuário imediatamente via AskUserQuestion:
  ```
  ⚠️ [SCOPE GUARD] O agent precisa modificar um arquivo fora do escopo atual.
  
  Arquivo solicitado: {arquivo detectado}
  Escopo autorizado (de architecture.md): {lista atual}
  ```
  ```
  AskUserQuestion({
    question: "O agent quer tocar em '{arquivo}' que não está no escopo de architecture.md.\n\nO que fazer?",
    options: [
      { label: "✅ Autorizar — adicionar ao escopo e continuar", description: "Atualiza architecture.md e prossegue" },
      { label: "🔄 Rejeitar — reexecutar dentro do escopo atual", description: "Máximo 1 retry com instrução reforçada" },
      { label: "📝 Atualizar architecture.md — editar manualmente", description: "Pausa até o usuário editar e retomar" }
    ]
  })
  ```
  - Se **Autorizar**: adicione o arquivo à lista de arquivos autorizados em `architecture.md` **e em `[ARCHITECTURE_CACHE].scope_files`** e continue para GATE-3.
  - Se **Rejeitar**: reexecute o step com instrução de escopo reforçada. Máximo 1 retry. Se falhar novamente, escale.
  - Se **Atualizar**: registre `suspended_at` com o step atual, oriente o usuário a editar `architecture.md` e retomar via `/init`. Ao retomar, `[ARCHITECTURE_CACHE]` é invalidado (novo pipeline run) — architecture.md é relido do disco.
- **Sem violação** → continue para GATE-3 normalmente.

### 2.3c — CHANGE GUARD (steps inline/subagent, ativo por padrão)

Execute este guard em **todos** os steps com `execution: subagent` ou `execution: inline`, a menos que o step declare `change_guard: false` ou o squad.yaml declare `change_guard: false`.

**Verifique a ativação:**
1. Se `squad.yaml.change_guard: false` → pule esta seção inteiramente.
2. Se `pipeline.yaml` → step atual tem `change_guard: false` → pule esta seção.
3. Caso contrário → ativo.

**Para steps com `execution: subagent` — CHANGE GUARD via git diff (fonte primária):**

Ao invés de depender do auto-reporte do agent, o runner captura alterações estruturalmente:

1. **Antes de executar o subagent:** execute `git diff --name-only HEAD` e armazene como `[FILES_BEFORE]`
2. **Após receber o resultado do subagent:** execute `git diff --name-only HEAD` e armazene como `[FILES_AFTER]`
3. **Calcule diff:** `[FILES_CHANGED] = [FILES_AFTER] - [FILES_BEFORE]`
4. Para cada arquivo em `[FILES_CHANGED]`: execute `git diff HEAD -- {arquivo}` para capturar trechos alterados
5. Construa `[CHANGE_GUARD_REPORT]` a partir do diff real — não do auto-reporte do agent
6. Log: `🔍 [CHANGE GUARD] git diff capturado: {N} arquivo(s) alterado(s)`

Se `git` não estiver disponível ou o comando falhar: caia no modo de self-report (instrução abaixo).
Log de fallback: `⚠️ [CHANGE GUARD] git indisponível — usando self-report do agent`

**Para steps com `execution: inline` — CHANGE GUARD via self-report (instrução obrigatória):**

**Injetar instrução no prompt do agent** (após SCOPE GUARD, antes da instrução do step):

```
📋 CHANGE GUARD — instrução obrigatória (modo inline)

Ao concluir sua tarefa, inclua ao final do output o seguinte bloco.
Inclua TODOS os arquivos que você abriu durante a execução — alterados ou não.

---
📋 [CHANGE GUARD]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️  ALTERADOS ({N} arquivo(s))
  {caminho/do/arquivo.ext}
    • L{start}–L{end} — {o que foi alterado} ← linha obrigatória para arquivos alterados

👁️  REVISADOS · SEM ALTERAÇÃO ({N} arquivo(s))
  {caminho/do/arquivo.ext} — {motivo: já estava correto | não aplicável | fora do escopo deste step}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{N} alterado(s) · {N} sem alteração necessária
---

Regras:
- Nunca omita um arquivo consultado, mesmo que a visita tenha sido rápida
- Para arquivos alterados: número de linha é obrigatório (L{start}–L{end})
- Para arquivos não alterados: uma frase objetiva basta
- Arquivos de session (docs/.squads/sessions/) não entram no relatório
- Se nenhum arquivo do projeto foi acessado: escreva "CHANGE GUARD — nenhum arquivo acessado neste step"
```

> **Por que a diferença?** Subagents têm acesso estrutural ao sistema de arquivos — git diff é
> mais confiável que auto-reporte. Inline runs são conversacionais — self-report com linha obrigatória
> é a melhor opção disponível.

**Após receber o output (para steps inline):**

1. Procure o bloco entre `📋 [CHANGE GUARD]` e o segundo `━━━` ao final
2. Extraia e armazene como `[CHANGE_GUARD_REPORT]` para exibição no passo 2.8
3. **Remova o bloco do output** antes de salvar o `output_file` — o change guard não faz parte do artefato
4. Se o bloco **não for encontrado**: logue `⚠️ [CHANGE GUARD] bloco ausente no step "{step-id}" — rastreamento indisponível` e continue normalmente

**Persistência (se `squad.yaml.change_log: true`):**

Faça append em `docs/.squads/sessions/{feature-slug}/change-log.md`:
```markdown
## {step-id} — {YYYY-MM-DD HH:MM}
Squad: {squad-slug} · Agent: {agent-id}

{conteúdo de [CHANGE_GUARD_REPORT]}
```

---

### 2.3d — HANDOFF (steps inline/subagent com depends_on ou que alimentam próximo step)

Execute em **todos** os steps com `execution: subagent` ou `execution: inline` que têm `output_files` ou `depends_on` definido.

**Injetar instrução no prompt do agent** (após instrução do step, antes do fim):

```
📤 HANDOFF — instrução obrigatória

Ao concluir, inclua ao final do output o seguinte bloco.
Este bloco é consumido pelo próximo agente — seja preciso e conciso.

---
## HANDOFF
**Decisões que o próximo agente deve respeitar:**
- {decisão 1 — com justificativa em 1 linha}
- {decisão 2}

**O que foi entregue:**
- {arquivo ou artefato criado/modificado} — {o que contém em 1 frase}

**O que o próximo agente precisa saber:**
- {contexto, restrição ou aviso relevante para o step seguinte}

**Bloqueios ou [DECISÃO PENDENTE]:**
- {se houver} | nenhum
---
```

**Após receber o output do agent:**

1. Procure o bloco entre `## HANDOFF` e o separador `---` no final do output
2. Extraia e armazene como `[HANDOFF_{step-id}]`
3. **Remova o bloco do output** antes de salvar o `output_file` — o HANDOFF não faz parte do artefato
4. Se o bloco **não for encontrado**: logue `⚠️ [HANDOFF] bloco ausente no step "{step-id}" — próximo agente receberá output completo via depends_on` e continue normalmente

**Injeção no step seguinte (via `depends_on`):**

Quando o próximo step declara `depends_on: [step-id]`:
- **Padrão:** injete apenas `[HANDOFF_{step-id}]` como contexto do step anterior (não o arquivo completo)
- **Se o step declara `needs_full_output_of: {step-id}`:** injete o arquivo de output completo (lido da session folder) em vez do HANDOFF
- **Se `[HANDOFF_{step-id}]` não foi capturado:** injete o arquivo de output completo como fallback, com log `📦 [HANDOFF] fallback — injetando output completo de {step-id}`

> **Motivo:** Um arquivo `architecture.md` com 300+ linhas injetado inteiro no contexto do próximo
> step cria ruído que compete com a instrução real. O HANDOFF de ~10 linhas contém apenas o que
> o próximo agente **precisa agir** — decisões, o que foi entregue, restrições. O arquivo completo
> fica disponível via `needs_full_output_of` para steps que genuinamente precisam do conteúdo inteiro.

---

### 2.4 — Executar por modo

**`execution: checkpoint`** — pausa para decisão do usuário. Use menu interativo:
```
⏸ CHECKPOINT: {nome do step}
{pergunta ou contexto do step}

- ✅ Continuar
- ✏️ Ajustar contexto
- ⏭️ Pular este step
```
Aguarde a seleção do usuário. Salve a resposta e continue.

> **Modo Solo** — Se `squad.yaml` tem `mode: solo` E o step checkpoint **não tem** `gate:` definido:
> → Pule o checkpoint automaticamente, sem aguardar input do usuário.
> → Log: `⚡ [SOLO] {nome do step} — checkpoint de aprovação ignorado`
> → Continue para o próximo step imediatamente.
> Checkpoints com `gate:` definido **sempre** executam, independente do modo.

### Checkpoints Assíncronos (para equipes distribuídas)

Se `squad.yaml` tem o campo `async_checkpoints: true`:

Ao invés de bloquear e aguardar input síncrono:
1. Salve o estado: `suspended_at: {step-id}`, `status: "awaiting_approval"`
2. Registre o checkpoint em `docs/.squads/sessions/{feature-slug}/pending-approvals.md`:
   ```markdown
   ## Aprovação Pendente — {step-id} · {YYYY-MM-DD HH:MM}
   
   Squad: {squad-slug}
   Pipeline: {pipeline-name}
   Step: {step-name}
   
   {conteúdo do checkpoint — output do step anterior resumido}
   
   Para aprovar e continuar: execute /init → selecione o squad → "Retomar de onde parou"
   ```
3. Informe:
   ```
   ⏸ [ASYNC] Checkpoint registrado para aprovação assíncrona.
   Arquivo: docs/.squads/sessions/{feature-slug}/pending-approvals.md
   
   Retome quando aprovado: /init → squad → "Retomar de onde parou"
   ```
4. Encerre o pipeline sem erro (não é falha — é pausa deliberada)

Para ativar no squad:
```yaml
# squad.yaml
async_checkpoints: true   # padrão: false
```

**`execution: inline`** — agent executa diretamente na conversa:
- Assuma a persona do agent (lida do .agent.md)
- Execute as instruções do step
- Apresente o output formatado
- Se `output_file` definido → salve o resultado

**Step `update-task`** — Antes de executar qualquer step com id contendo `update-task`, verifique `[TASK_TRACKER]` recebido do orchestrator:
- Se `[TASK_TRACKER]` for `none` ou não informado → pule o step automaticamente.
- Log: `⚡ Task tracker não configurado — step 'update-task' ignorado`
- Continue para o próximo step.

**`execution: subagent`** — agent executa como subagente:
- Lance um subagente com:
  - O conteúdo completo do .agent.md do agent
  - As instruções do step
  - O contexto do squad (company.md + memories.md da session)
  - Os session files disponíveis (context.md, architecture.md, plan.md)
  - Os outputs dos steps anteriores relevantes (via `depends_on`)
  - As instruções de todas as skills ativas (lidas de `.synapos/skills/{skill}/SKILL.md`)
  - A instrução explícita: **"Use as skills disponíveis para executar esta tarefa. Skills são o caminho preferencial — nunca as ignore."**
- Aguarde o resultado
- Se `output_file` definido → salve o resultado

### 2.5 — Aplicar gates automáticos pós-execução

> Antes de aplicar qualquer gate, verifique `execution_mode` do squad.yaml e a tabela de gates ativos em `.synapos/core/gate-system.md`. Gates marcados como desativados para o modo atual são ignorados silenciosamente — sem log, sem falha.

**Ordem de aplicação dos gates (execute nesta sequência):**

```
1. GATE-3a — Estrutural    (se output_schema declarado no pipeline.yaml)
2. GATE-3  — Qualidade     (output não vazio, não placeholder)
3. GATE-3b — Sucesso       (se success_criteria declarado no .md do step)
4. GATE-DECISION           (decisões autônomas detectadas)
5. GATE-ADR                (conflitos com ADRs, quando aplicável)
6. Veto conditions         (condições específicas do step)
```

**GATE-3a — Validação Estrutural (executar PRIMEIRO, antes de qualquer outro gate):**

Execute este gate **apenas** em steps que declaram `output_schema` no pipeline.yaml.

Para cada item em `output_schema.required_sections`:
- Verifique se a seção existe no output (busca literal por `## {seção}` ou `# {seção}`)
- Se alguma seção está ausente: falha imediata com mensagem precisa

```
🚫 GATE-3a — estrutura inválida

Seção obrigatória ausente: "{seção faltante}"
O output deve conter: {lista de required_sections}

Reexecutando step com instrução explícita...
```

Para cada item em `output_schema.formats` (se presente):
- Extraia o conteúdo da seção declarada em `field`
- Se `pattern` definido: verifique correspondência regex
- Se não corresponder: falha com mensagem de formato

```
🚫 GATE-3a — formato inválido

Campo: {field}
Esperado: {pattern}
Encontrado: {primeiros 100 chars do conteúdo atual}

Reexecutando step com instrução de formato...
```

> **Gate-3a nunca faz auto-aprovação:** sempre re-executa o step com instrução reforçada quando falha.
> Máximo 2 reexecuções automáticas. Na 3ª falha → escale para o usuário.
> **Gate-3a passando:** log `✅ GATE-3a — estrutura válida ({N} seções confirmadas)`

**GATE-3b — Critérios de Sucesso (executar DEPOIS do GATE-3):**

Execute este gate **apenas** em steps cujo arquivo `.md` contém frontmatter com `success_criteria`.

O pipeline-runner carrega os critérios ao ler o arquivo do step (seção 2.3). Armazene como `[SUCCESS_CRITERIA_{step-id}]`.

Para cada critério:
- Verifique se o output satisfaz a condição descrita
- Critérios são binários: satisfeito (✅) ou não (❌)

```
🚫 GATE-3b — critério de sucesso não atendido

Critério: "{critério não atendido}"
Total: {N satisfeitos}/{M total}

Reexecutando step com feedback específico...
```

> **Diferença de GATE-3b vs veto_conditions:**
> `veto_conditions` são definidas no pipeline.yaml e avaliam o output como inválido (o step precisa refazer).
> `success_criteria` são definidas no arquivo do step e avaliam se o output atingiu os objetivos (o step está incompleto).
> Veto = output errado. Success_criteria = output certo mas incompleto.

**GATE-DECISION (universal — ativo em todos os modos):**

Antes de aceitar qualquer output de step `inline` ou `subagent`, verifique:

1. O output contém decisões implícitas? (frases como "optei por", "escolhi", "assumindo que", "vou usar", escolha não documentada)
   - **Sim** → aplique GATE-DECISION (falha — decisão autônoma): reexecute o step instruindo o agent a usar `[DECISÃO PENDENTE]`
   - **Não** → continue

2. O output contém `[DECISÃO PENDENTE]`?
   - **Sim** → aplique GATE-DECISION (aguardando): apresente as opções ao usuário e aguarde seleção. **Nunca resolva automaticamente.** Após aprovação, reexecute o step passando a decisão aprovada como contexto.
   - **Não** → continue

**GATE-ADR (quando ADRs existem):**

Se existem ADRs em `docs/`, verifique se o output as referenciou. Se não referenciar, reexecute com instrução explícita. Se contradizer ADR existente, bloqueie e informe.

**Veto conditions (após gates):**

Verifique cada condição em `veto_conditions`:

```
⚠ VETO: {condição violada}
Tentativa {N}/2 — reexecutando step com feedback...
```

- Máximo de 2 tentativas automáticas de reexecução
- Na 3ª falha → apresente ao usuário para decisão

### 2.6 — Salvar output

Se `output_file` ou `output_files` definido:
- Salve em `docs/.squads/sessions/{feature-slug}/{filename}`
- Exemplo: `output_files: [architecture.md]` → `docs/.squads/sessions/auth-module/architecture.md`
- Os valores em `output_files` são **somente o nome do arquivo** — sem prefixo de path

> **Regra:** Todos os outputs vão para `docs/.squads/sessions/{feature-slug}/`. Nunca crie arquivos em `docs/` raiz nem dentro de `.synapos/`.

### Proteção de output_files existentes

Antes de sobrescrever qualquer `output_file` que já existe na session folder:
1. Verifique se o arquivo já existe
2. Se sim: crie cópia de segurança `{filename}.bak` antes de sobrescrever
   - Log: `📦 Backup criado: {filename}.bak`
3. Prossiga com a escrita do novo conteúdo

### 2.7 — Loop de revisão (on_reject)

Se o usuário rejeitar um output:
- Execute o step `on_reject` com o feedback
- Limite: 3 ciclos de revisão por step
- Na 4ª rejeição → pergunte ao usuário como proceder

Se o step gera `review-notes.md`: acrescente as notas ao arquivo existente (nunca substitua — append apenas).

### 2.8 — Marcar step completo

Atualize `state.json` (via escrita atômica — veja 1.4c):
```json
{
  "squads": {
    "{squad-slug}": {
      "completed_steps": [..., "{step-id}"],
      "current_step": null,
      "suspended_at": null
    }
  },
  "updated_at": "{ISO datetime}"
}
```

> **Fonte de verdade única:** `state.json` define progresso. `plan.md` é artefato estático da pré-execução (referência humana) — nunca é reescrito pelo runner.

```
✅ {Nome do Step} — concluído
```

**Se `[CHANGE_GUARD_REPORT]` foi capturado no passo 2.3c**, exiba imediatamente após a linha de conclusão:

```
📋 [CHANGE GUARD] — {Nome do Step}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{conteúdo de [CHANGE_GUARD_REPORT]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Limpe `[CHANGE_GUARD_REPORT]` após exibição — o relatório é por step, não acumulativo.

**Acumular em `[SESSION_REPORT_DATA]`** (obrigatório após cada step inline/subagent):

```
[SESSION_REPORT_DATA].steps += {
  id: "{step-id}",
  name: "{step-name}",
  agent: "{agent-id}",
  gates: [
    // para cada gate executado neste step:
    { gate: "GATE-3a|GATE-3|GATE-3b", result: "pass|fail", attempts: N }
  ],
  files_changed: [
    // extraído de [CHANGE_GUARD_REPORT] ou git diff:
    { path: "{caminho}", lines: "L{start}–L{end}", description: "{o que foi alterado}" }
  ],
  handoff: "[HANDOFF_{step-id}]",   // null se não capturado
  veto_attempts: N,                 // tentativas de reexecução por veto/gate
  decisions_resolved: []            // [DECISÃO PENDENTE] resolvidas neste step
}

// Consolidar files_changed para o nível global:
[SESSION_REPORT_DATA].all_files_changed += files_changed deste step (sem duplicatas por path)

// Atualizar gate_summary:
[SESSION_REPORT_DATA].gate_summary.passed += N gates aprovados
[SESSION_REPORT_DATA].gate_summary.failed += N gates que falharam (mesmo que reexecutados)
[SESSION_REPORT_DATA].gate_summary.retries += veto_attempts + tentativas de gate
```

> **Rastreamento de decisões:** quando um `[DECISÃO PENDENTE]` é apresentado ao usuário e aprovado, registre em `[SESSION_REPORT_DATA].all_decisions`:
> `{ step: "{step-id}", decision: "{descrição}", resolved_as: "{opção aprovada}", at: "{HH:MM}" }`

---

## FASE 3 — FINALIZAÇÃO

### 3.1 — Atualizar state

```json
{
  "squads": {
    "{squad-slug}": {
      "status": "completed",
      "completed_at": "{ISO datetime}",
      "current_step": null,
      "suspended_at": null
    }
  },
  "updated_at": "{ISO datetime}"
}
```

### 3.2 — Atualizar memories

Pergunte ao usuário:
```
Algo importante que devo registrar na memória desta feature? (ENTER para pular)
```

Se houver resposta, acrescente em `docs/.squads/sessions/{feature-slug}/memories.md`:
```markdown
## [{squad-slug} · usuario] — {YYYY-MM-DD}
{texto do usuário}
```

### Formato de autoria (aplicar a todos os novos appends)

Todo append em `memories.md` deve ser inserido **dentro do bloco `<!-- RECENTES -->`**, antes de `<!-- /RECENTES -->`:

```markdown
## [{squad-slug} · {agent-id}] — {YYYY-MM-DD}

{conteúdo do aprendizado}
```

Para aprendizados inseridos diretamente pelo usuário (não por agent), usar:
```markdown
## [{squad-slug} · usuario] — {YYYY-MM-DD}

{conteúdo}
```

**Após cada append em memories.md:**
- Incremente `session.manifest.json` → `files.memories.md.entry_count += 1`
- Atualize `session.manifest.json` → `files.memories.md.last_entry_at = {agora}`
- Se `entry_count > 10`: log `⚠️ [MEMORY] memories.md com {N} entradas — considere /session consolidate`

**Aprendizados transversais do projeto:**
```
Algo que todos os squads deste projeto devem saber? (ENTER para pular)
```

Se houver resposta, acrescente em `docs/_memory/project-learnings.md`:
```markdown
## Aprendizado — {YYYY-MM-DD} [{squad-slug} / {feature-slug}]
{texto do usuário}
```

### 3.3 — Gerar session-report.md

Gere o arquivo `docs/.squads/sessions/{feature-slug}/session-report.md` a partir de `[SESSION_REPORT_DATA]`.

**Este arquivo é a evidência auditável do que o pipeline executou.** Nunca pule este passo — um pipeline sem report não tem rastreabilidade.

```markdown
# Session Report: {feature-slug}

> Gerado automaticamente em {YYYY-MM-DD HH:MM} · Synapos v{VERSION}

**Squad:** {squad-slug} · **Pipeline:** {pipeline-name}
**Steps concluídos:** {N}/{total} · **Iniciado:** {started_at} · **Concluído:** {agora}

---

## Resumo de Execução

| Step | Agent | Gates | Arquivos Alterados | Retentativas |
|------|-------|-------|--------------------|--------------|
{para cada step em [SESSION_REPORT_DATA].steps:}
| `{id}`: {name} | {agent} | {lista de gates com ✅/❌} | {N} arquivo(s) | {veto_attempts} |

---

## Arquivos Modificados

> Consolidado de todos os CHANGE GUARD reports do pipeline.
> Evidência estrutural de tudo que foi tocado.

{se [SESSION_REPORT_DATA].all_files_changed não está vazio:}
{para cada entry em all_files_changed:}
- `{path}` — step `{step}` · {lines} · {description}

{se all_files_changed está vazio:}
⚠️ Nenhum arquivo rastreado — CHANGE GUARD indisponível (steps inline sem self-report ou git indisponível).

---

## Decisões Registradas

> [DECISÃO PENDENTE] que precisaram de aprovação humana durante o pipeline.

{se [SESSION_REPORT_DATA].all_decisions não está vazio:}
{para cada decisão:}
- **`{step}`** — {decision} → aprovado como: _{resolved_as}_ ({at})

{se all_decisions está vazio:}
Nenhuma decisão fora do escopo foi necessária neste pipeline.

---

## Gates Executados

| Gate | Step | Resultado | Tentativas |
|------|------|-----------|------------|
{para cada gate em cada step:}
| {gate} | `{step-id}` | {✅ aprovado \| 🚫 falhou → reexecutado} | {attempts} |

**Total:** {gate_summary.passed + gate_summary.failed} gates ·
✅ {gate_summary.passed} aprovados ·
{se gate_summary.failed > 0: 🔁 {gate_summary.failed} falharam (reexecutados: {gate_summary.retries}x)}

---

## HANDOFF Final

> Saída estruturada do último step executado — contexto para o próximo squad ou sessão de trabalho.

{conteúdo do [HANDOFF_{último-step-id}] capturado, ou:}
_(HANDOFF não capturado no último step)_

---

_Gerado por Synapos v{VERSION} · Session: `docs/.squads/sessions/{feature-slug}/`_
```

**Regras do session report:**
- Se `session-report.md` já existe (pipeline reexecutado): sobrescreva — cada report reflete a última execução
- Não crie backup `.bak` do report — ele é gerado, não editado manualmente
- Log ao concluir: `📊 [REPORT] session-report.md gerado — {N} steps · {N} arquivos · {N} gates`

---

### 3.4 — Commit automático (opt-in)

**Verificar configuração:**

Leia `auto_commit` do `squad.yaml`:

| Valor | Comportamento |
|-------|--------------|
| `ask` (padrão) | Pergunta ao usuário antes de commitar |
| `true` | Commita automaticamente sem perguntar |
| `false` | Pula este passo silenciosamente |

**Se `auto_commit: false`:** pule sem log.

**Se `auto_commit: ask`:** apresente ao usuário:

```
AskUserQuestion({
  question: "Pipeline concluído. Deseja criar um commit com as alterações?\n\n{N} arquivo(s) modificado(s):\n{lista dos primeiros 5 arquivos de all_files_changed}\n{se > 5: '...e mais {N-5} arquivo(s)'}",
  options: [
    { label: "✅ Commitar agora", description: "Cria commit com mensagem estruturada" },
    { label: "⏭️ Pular", description: "Não commita — você fará isso manualmente" }
  ]
})
```

**Se `auto_commit: true` ou usuário confirmar:**

1. **Derivar tipo de commit** a partir do pipeline:
   ```
   feature-development, feature-*, component-* → feat
   bug-fix, fix-*, quick-fix             → fix
   database-migration, migration-*        → chore(db)
   ci-cd-setup, infra-*                   → ci
   refinar-docs, docs-*                   → docs
   discovery-spec-*, spec-*               → docs
   (qualquer outro)                       → chore
   ```

2. **Montar lista de arquivos a stagear:**
   - Use `[SESSION_REPORT_DATA].all_files_changed` (caminhos extraídos do CHANGE GUARD)
   - Adicione sempre: `docs/.squads/sessions/{feature-slug}/session-report.md`
   - Adicione sempre: `docs/.squads/sessions/{feature-slug}/state.json`
   - **Nunca inclua:** `.synapos/`, arquivos `.env`, arquivos fora do projeto

3. **Gerar mensagem de commit:**

```
{tipo}({feature-slug}): {pipeline-name} — {squad-slug}

Steps: {lista de step-names concluídos, separados por ", "}

Arquivos modificados:
{para cada path em all_files_changed:}
  - {path}

Session: docs/.squads/sessions/{feature-slug}/session-report.md

Co-authored-by: Synapos v{VERSION} <noreply@synapos.dev>
```

4. **Executar:**

```bash
git add {lista de arquivos}
git commit -m "{mensagem estruturada}"
```

5. **Ao concluir:**
```
✅ [GIT] Commit criado: {hash curto} — "{primeira linha da mensagem}"
```

**Se git falhar (não é repo, conflito, etc.):**
```
⚠️ [GIT] Commit não realizado: {motivo}
   Arquivos modificados disponíveis em: docs/.squads/sessions/{feature-slug}/session-report.md
```
Nunca bloqueie a finalização do pipeline por falha de git.

**Campo no squad.yaml:**
```yaml
auto_commit: ask   # ask | true | false (padrão: ask)
```

---

### 3.5 — Apresentar sumário

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline concluído!

Feature:  {feature-slug}
Squad:    {squad-slug}
Session:  docs/.squads/sessions/{feature-slug}/

Arquivos na session:
  📄 {lista de output_files criados/atualizados}
  📊 session-report.md  ← evidência auditável desta execução

{se commit foi criado:}
  🔖 Commit: {hash curto} — "{primeira linha da mensagem}"

O que deseja fazer agora?
  [1] Iniciar outro squad nesta feature
  [2] Ver session-report.md
  [3] Ver um arquivo da session
  [4] Voltar ao menu principal
  [5] Pausar squad
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## INJEÇÃO DE CONTEXTO NOS AGENTS

O contexto injetado depende do `execution_mode` do squad.

### Modo Rápido (`quick`) — contexto mínimo

1. **Persona focada do agent** (seção `## Identidade` + `[AGENT_FOCUS]` do tipo do step + `## Quality Criteria` + `## Compliance Obrigatório` — ou versão Modo Lite se `[MODELO_TIER]: lite`). Se não há `## Foco por Tipo de Step`: usa persona completa.
2. **Fronteira negativa** (seção `## Fora do Meu Escopo` do agent — se existir, injetada como fence `⛔ FORA DO MEU ESCOPO`)
3. **Contexto do squad** (`company.md` + descrição do squad + roles[])
4. **Stack do projeto** (`stack.md` — se existir) — injetado junto da persona, antes de qualquer instrução técnica
5. **Contexto da feature**: `context.snapshot` (se hash válido) ou `context.md` completo (se inválido ou `needs_full_context: true`)
6. **Memória recente**: bloco `<!-- RECENTES -->` de `memories.md` (últimas 5 entradas)
7. **Outputs anteriores**: HANDOFF do step de depends_on (ou output completo se `needs_full_output_of` declarado)
8. **Instrução do step** + base path do squad
9. **[CONTEXT_RULES]** aplicado sobre os blocos acima se `[MODELO_TIER]: standard` ou `lite`

```
[Persona Focada] + [⛔ Fora do Escopo] + [Stack] + [Contexto Squad] + [context.snapshot|context.md] + [Memories RECENTES] + [HANDOFF ou Output Anterior] + [Instrução do Step] + [Skills Ativas]
```

> **Não inclui por padrão:** `architecture.md`, `plan.md`, `review-notes.md`, `docs/`, ADRs.
> Esses arquivos entram apenas via declaração explícita no step ou via SCOPE GUARD (architecture.md).

### Modo Completo (`complete`) — contexto expandido

1. **Persona focada do agent** (mesma lógica do modo rápido — foco por tipo de step se disponível)
2. **Fronteira negativa** (seção `## Fora do Meu Escopo` do agent — se existir)
3. **Contexto do squad** (`company.md` + descrição + roles[])
4. **Stack do projeto** (`stack.md` — se existir) — injetado junto da persona, antes de qualquer instrução técnica
5. **Contexto da feature**: `context.snapshot` (se hash válido) ou `context.md` completo
6. **Memória recente**: bloco `<!-- RECENTES -->` de `memories.md` (últimas 5 entradas)
7. **ADRs filtrados** — do cache `[ADRS_CARREGADOS]` (somente domínio do squad). Conflito com ADR aceita = output vetado.
8. **project-learnings.md** (se existir)
9. **Outputs anteriores**: HANDOFF do step de depends_on (ou output completo se `needs_full_output_of` declarado)
10. **Instrução do step** + base path

```
[Persona Focada] + [⛔ Fora do Escopo] + [Stack] + [Contexto Squad] + [context.snapshot|context.md] + [Memories RECENTES] + [ADRs filtrados] + [Project Learnings] + [HANDOFF ou Output Anterior] + [Instrução do Step] + [Skills Ativas]
```

> **Skills:** quando ativas, o agent DEVE usá-las — não são opcionais.
> **ADRs:** agente lista cada ADR como `[RESPEITADA]` ou `[NÃO APLICÁVEL]`. Conflito com ADR aceita = output vetado.

### Expansão on-demand (qualquer modo)

Steps que declaram campos especiais recebem contexto adicional:

| Campo no step | Contexto adicional injetado |
|---|---|
| `needs_full_context: true` | `context.md` completo (ignora snapshot) |
| `needs_history: true` | Bloco `<!-- SUMMARY -->` de memories.md |
| `needs_architecture: true` | `architecture.md` completo |
| `needs_review: true` | `review-notes.md` |
| `adr_required: true` | ADRs injetados mesmo em modo `lite` |
| `output_files: [...]` | SCOPE GUARD ativa → carrega architecture.md on-demand |

### Caminhos de arquivo

Todo agent executado recebe como primeira instrução:

```
IMPORTANTE — TODOS OS CAMINHOS SÃO ABSOLUTOS A PARTIR DA RAIZ DO PROJETO.
NUNCA crie arquivos dentro de .synapos/ — essa pasta é somente do framework.

LEITURA (documentação compartilhada — nunca escreva aqui):
- {PROJECT_ROOT}/docs/business/
- {PROJECT_ROOT}/docs/tech/
- {PROJECT_ROOT}/docs/tech-context/

LEITURA + ESCRITA (session da feature ativa):
- {PROJECT_ROOT}/docs/.squads/sessions/{feature-slug}/

REGRA CRÍTICA: Todos os arquivos gerados pelo agent vão para:
  {PROJECT_ROOT}/docs/.squads/sessions/{feature-slug}/{arquivo}

Nunca crie arquivos em docs/ raiz, em .synapos/ ou em outros subdiretórios.
```

Substitua `{feature-slug}` e `{squad-slug}` pelos valores reais antes de injetar.

---

## REGRAS DO RUNNER

| Regra | Descrição |
|-------|-----------|
| **Ordem é sagrada** | Execute steps na ordem do pipeline.yaml |
| **depends_on é hard** | Nunca execute step sem seus pré-requisitos completos |
| **Veto máximo 2x** | Após 2 tentativas, escale para o usuário |
| **Review máximo 3x** | Após 3 rejeições, pergunte como proceder |
| **Sempre salve** | Nunca perca output gerado — salve antes de continuar |
| **State é best-effort mas atômico** | Sempre escreva via state.tmp.json → renomear para state.json. Falhas não bloqueiam execução |
| **Falha loud** | Se agent ou arquivo não encontrado, pare e informe |
| **Nunca escreva em .synapos/** | Outputs vão SEMPRE para `docs/.squads/sessions/{feature-slug}/` |
| **Caminhos absolutos** | Todo agent usa caminhos a partir da raiz do projeto |
| **Skills são obrigatórias** | Se uma skill cobre a tarefa, o agent DEVE usá-la |
| **Decisões sinalizam com `[?]`** | Decisão fora do escopo → sinaliza `[?]` no output, aguarda usuário |
| **ADRs somente no modo Completo** | Modo Rápido não injeta ADRs. Modo Completo: conflito com ADR = veto |
| **Sessão recuperável** | `suspended_at` atualizado a cada step. Orquestrador detecta, enriquece contexto e retoma |
| **Resume valida step** | Ao retomar, verifica se `resume_from` existe no pipeline. Se não, infere próximo step não concluído |
| **Resume re-injeta outputs** | Ao retomar, carrega outputs dos steps já concluídos para contexto dos steps subsequentes |
| **Reinício do zero preserva session** | `resume_from: null` limpa progresso mas mantém context.md, memories.md e demais arquivos da session |
| **Session é compartilhada** | Múltiplos roles trabalham na mesma session. Nunca apague arquivos sem aprovação |
| **review-notes é append-only** | Nunca substitua — sempre acrescente. Consolidação é manual via `/consolidate` |
| **memories é append-only com janela** | Novas entradas vão no bloco RECENTES. Ao atingir 10+, sugerir consolidação. Nunca delete entradas |
| **Backups simples** | Cria `{filename}.bak` antes de sobrescrever — sem rotação automática |
| **ADRs são filtrados por domínio** | ADRs carregados na FASE 1.1d em modo complete, somente os do domínio do squad |
| **Contexto por modo** | Modo Rápido: Tier 0 + snapshot + memories RECENTES. Modo Completo: + ADRs filtrados + project-learnings + memories SUMMARY (se needs_history) |
| **Manifest controla cache** | session.manifest.json rastreia hashes — evita re-leitura de arquivos inalterados |
| **architecture.md é on-demand** | Nunca carregado na FASE 1.1. Entra apenas via SCOPE GUARD (output_files) ou needs_architecture |
| **Arquivos _memory lidos uma vez** | Orchestrator lê `preferences.md`, `company.md` e `stack.md` no PASSO 1 e passa como `[MODELO_TIER]`, `[LINGUA]`, `[TASK_TRACKER]`, `[COMPANY_CONTEXT]`, `[STACK_CONTEXT]`. Pipeline-runner nunca relê esses arquivos |
| **stack.md é Tier 0** | Recebido como `[STACK_CONTEXT]` do orchestrator. Injetado em TODOS os agents, antes de qualquer instrução técnica. Agents adaptam linguagem, exemplos e estrutura de pastas ao stack detectado |
| **Stack adaptation é obrigatória** | Se stack.md existe, agents NÃO usam exemplos hardcoded — adaptam para a linguagem/framework declarados. Princípios são imutáveis; exemplos concretos seguem o stack |
| **state.json é fonte única de progresso** | plan.md é artefato estático da pré-execução — nunca reescrito pelo runner |
| **SCOPE GUARD por architecture.md** | Escopo lido da lista de arquivos em architecture.md — ausência = sem restrição (warning), nunca deriva de pipeline output_files |
| **SCOPE GUARD só em steps com output_files** | Steps sem output_files não recebem SCOPE GUARD — evita context waste em steps de revisão/formatação |
| **Escopo expandido = [DECISÃO PENDENTE]** | Se agent precisar de arquivo fora do escopo, sinaliza e aguarda aprovação — nunca expande silenciosamente |
| **SCOPE GUARD pergunta, não rejeita** | Violação de escopo → AskUserQuestion imediato (autorizar / rejeitar / editar architecture.md). Nunca auto-rejeita — a decisão é sempre do humano |
| **architecture.md cacheado por run** | Primeira leitura (via SCOPE GUARD ou needs_architecture) carrega e armazena em `[ARCHITECTURE_CACHE]`. Steps subsequentes reutilizam o cache durante o mesmo pipeline run |
| **CHANGE GUARD ativo por padrão** | Subagent usa git diff como fonte primária (confiável). Inline usa self-report com linha obrigatória. Ausência do bloco (inline) gera aviso, nunca falha |
| **CHANGE GUARD não polui artefato** | Bloco `[CHANGE GUARD]` é extraído do output antes de salvar output_file — nunca contamina o conteúdo gerado |
| **CHANGE GUARD desativável** | `change_guard: false` em squad.yaml (todo o squad) ou em step no pipeline.yaml (step específico) |
| **change-log.md opcional** | `change_log: true` em squad.yaml persiste relatórios em `docs/.squads/sessions/{feature-slug}/change-log.md` |
| **Pré-execução é obrigatória para sessions novas** | Se context.md não existe e pre_pipeline válido: executa automaticamente sem perguntar. Sessions retomadas (context.md existe) pulam pré-exec |
| **HANDOFF comprime depends_on** | Por padrão, depends_on injeta apenas o bloco HANDOFF (não o output completo). Use `needs_full_output_of` para injetar o arquivo completo quando necessário |
| **HANDOFF não polui artefato** | Bloco `## HANDOFF` extraído do output antes de salvar output_file |
| **GATE-3a é estrutural, GATE-3 é semântico** | GATE-3a executa PRIMEIRO se output_schema declarado. Falha estrutural = mensagem precisa. GATE-3 valida qualidade mínima. GATE-3b valida critérios de sucesso do step |
| **Persona focada reduz ruído** | Se agent tem `## Foco por Tipo de Step`: injeta apenas o foco relevante + Identity + Quality Criteria + Compliance. Persona completa como fallback |
| **Fronteira negativa é fence explícito** | Se agent tem `## Fora do Meu Escopo`: injetado como bloco `⛔ FORA DO MEU ESCOPO` antes das instruções do step |
| **success_criteria é por step** | Lido do frontmatter do arquivo .md do step. Validado pelo GATE-3b após GATE-3 |
| **output_schema é por pipeline step** | Declarado no pipeline.yaml. Validado pelo GATE-3a antes de qualquer outro gate |
| **SESSION_REPORT_DATA é acumulado durante execução** | Inicializado na FASE 1.6. Cada step contribui via seção 2.8. Escrito em disco uma única vez na FASE 3.3 |
| **session-report.md é sempre gerado** | Nunca pule a FASE 3.3 — o report é a evidência auditável do pipeline. Sobrescreve execuções anteriores |
| **Commit é opt-in por padrão** | `auto_commit: ask` no squad.yaml. Nunca commita silenciosamente sem que `true` esteja explícito |
| **Commit inclui session-report.md e state.json** | Esses dois arquivos são sempre incluídos no stage, independente do CHANGE GUARD |
| **Commit nunca bloqueia** | Falha de git → avisa e segue para sumário. Pipeline não pode falhar por causa de commit |
| **Tipo de commit é derivado do pipeline** | `feature-*` → `feat`, `bug-fix` → `fix`, `migration-*` → `chore(db)`, etc. Nunca deixe em branco |
