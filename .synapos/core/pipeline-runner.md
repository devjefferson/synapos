---
name: synapos-pipeline-runner
description: Engine de execução de pipelines — gerencia steps, agents, vetos e revisões
---

# SYNAPOS PIPELINE RUNNER v2.3.0

> Responsável por executar pipelines de squads step-by-step.
> Chamado pelo orchestrator após criação ou carregamento de um squad.
>
> v2.0: Sistema de sessions — todos os artefatos de uma feature vivem em
> `docs/.squads/sessions/{feature-slug}/`, compartilhado entre squads.
>
> v2.3: Sistema de memória otimizado — manifest-based caching, memories windowing,
> on-demand architecture.md, atomic state writes.

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

**Receba do orchestrator** as variáveis derivadas (nunca releia preferences.md):
- `[EXECUTION_MODE]` — `quick` | `complete`
- `[MODELO_TIER]` — `high` | `standard` | `lite`
- `[LINGUA]` — ex: `pt-BR`

Leia obrigatoriamente:
```
.synapos/squads/{squad-slug}/squad.yaml   → configuração do squad
docs/_memory/company.md                   → perfil da empresa/usuário (Tier 0)
docs/_memory/stack.md                     → stack do projeto (Tier 0) — se existir
```

> **Se `docs/_memory/stack.md` não existir:** continue normalmente. Emita **uma única vez** no início do pipeline:
> `⚠️ [STACK] stack.md não encontrado — agents usarão exemplos genéricos. Execute /setup:discover para gerar.`
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
| `architecture.md` | Step declara `output_files` (via SCOPE GUARD) ou `needs_architecture: true` |
| `plan.md` | Step usa rastreamento TODO (já presente em FASE 2.3b) |
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
    veto_conditions:                  # opcional
      - "condição que invalida o output"
    on_reject: step-id-anterior       # opcional — loop de revisão
    depends_on: [step-id]             # opcional
```

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

---

## TODO — Steps do pipeline

- [ ] **{step-id}**: {descrição do que será feito}
- [ ] **{step-id}**: {descrição do que será feito}
- [ ] **{step-id}**: {descrição do que será feito}

> Runner marca `[>]` ao iniciar cada step e `[x]` ao concluir. Não adicione steps sem aprovação.

---

## Fases de execução

{descrição das fases — discovery, implementação, review, etc.}
```

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

**Se existe e tem `"status": "running"`** — sessão interrompida:

O orchestrator já detectou isso e perguntou ao usuário antes de chegar aqui.

- Se o orchestrator passou `resume_from: {step-id}`:
  - Pule todos os steps em `completed_steps`
  - Continue a partir de `resume_from`
  - Anuncie:
  ```
  ⚡ Retomando {squad-slug} na feature {feature-slug}
     Steps já concluídos: {completed_steps}
     Continuando a partir de: {resume_from}
  ```

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

**Fonte de verdade:** `state.json` é a fonte de verdade para progresso. `plan.md` é exibição visual para humanos. Em caso de divergência, `state.json` prevalece.

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

4. **Se `context.md` não existe E pré-execução válida:**

```
Esta feature ainda não tem contexto/arquitetura definidos.

Deseja executar a pré-execução antes de [{nome do pipeline principal}]?

- ✅ Sim — Investigação → Arquitetura → Planejamento → {pipeline principal}
- ⏭️ Não — Iniciar direto no {pipeline principal}
```

**Se escolher Sim:**
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

### 1.6 — Anunciar início

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

### 2.3b — SCOPE GUARD (apenas steps com `output_files` definido)

Execute este guard **apenas** em steps que declaram `output_files` no pipeline.yaml com `execution: subagent` ou `execution: inline`. Steps sem `output_files` não recebem SCOPE GUARD.

**Ordem de composição do prompt** (quando MODEL-ADAPTER também está ativo):
```
1. [MODEL-ADAPTER: CoT Prefix — S1/L3, se capability standard/lite]
2. [Agent Persona]
3. [SCOPE LOCK — injetado aqui, após persona]
4. [Contexto + Instrução do step]
```

**1. Carregar e extrair escopo autorizado (on-demand)**

> `architecture.md` é carregado on-demand neste step — não foi carregado na FASE 1.1.
> Este é o único ponto onde architecture.md entra no contexto, garantindo que não haja carregamento desnecessário.

Leia `docs/.squads/sessions/{feature-slug}/architecture.md` e extraia a lista de arquivos a modificar/criar (tipicamente em seção nomeada `## Arquivos a modificar`, `## Arquivos afetados`, `## Escopo de modificação` ou equivalente — a veto condition do pre-execution garante que essa seção existe).

- **Se a lista existe:** use-a como escopo autorizado. Atualize `session.manifest.json`: `architecture.md.loaded_at = {agora}`.
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

**3. Atualizar TODO do plan.md**

Se `plan.md` existe e contém a seção `## TODO — Steps do pipeline`:
- Marque o step atual como em andamento: `- [ ] **{step-id}**: ...` → `- [>] **{step-id}**: ...`
- Log: `📋 [TODO] {step-id} em andamento`

**4. Veto de escopo no output**

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
  - Se **Autorizar**: adicione o arquivo à lista de arquivos autorizados em `architecture.md` e continue para GATE-3.
  - Se **Rejeitar**: reexecute o step com instrução de escopo reforçada. Máximo 1 retry. Se falhar novamente, escale.
  - Se **Atualizar**: registre `suspended_at` com o step atual, oriente o usuário a editar `architecture.md` e retomar via `/init`.
- **Sem violação** → continue para GATE-3 normalmente.

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

Se `plan.md` existe e contém a seção `## TODO — Steps do pipeline`:
- Marque o step como concluído: `- [>] **{step-id}**: ...` → `- [x] **{step-id}**: ...`
- Log: `✅ [TODO] {step-id} concluído`

> **Fonte de verdade:** state.json é quem define o progresso. plan.md é apenas exibição. Se divergirem, state.json prevalece.

```
✅ {Nome do Step} — concluído
```

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

### 3.3 — Apresentar sumário

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline concluído!

Feature:  {feature-slug}
Squad:    {squad-slug}
Session:  docs/.squads/sessions/{feature-slug}/

Arquivos na session:
  📄 {lista de output_files criados/atualizados}

O que deseja fazer agora?
  [1] Iniciar outro squad nesta feature
  [2] Ver um arquivo da session
  [3] Voltar ao menu principal
  [4] Pausar squad
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## INJEÇÃO DE CONTEXTO NOS AGENTS

O contexto injetado depende do `execution_mode` do squad.

### Modo Rápido (`quick`) — contexto mínimo

1. **Persona do agent** (conteúdo do `.agent.md` — ou versão Modo Lite se `[MODELO_TIER]: lite`)
2. **Contexto do squad** (`company.md` + descrição do squad + roles[])
3. **Stack do projeto** (`stack.md` — se existir) — injetado junto da persona, antes de qualquer instrução técnica
4. **Contexto da feature**: `context.snapshot` (se hash válido) ou `context.md` completo (se inválido ou `needs_full_context: true`)
5. **Memória recente**: bloco `<!-- RECENTES -->` de `memories.md` (últimas 5 entradas)
6. **Outputs anteriores relevantes** (definidos em `depends_on`)
7. **Instrução do step** + base path do squad
8. **[CONTEXT_RULES]** aplicado sobre os blocos acima se `[MODELO_TIER]: standard` ou `lite`

```
[Agent Persona] + [Stack do Projeto] + [Contexto Squad] + [context.snapshot|context.md] + [Memories RECENTES] + [Outputs Anteriores] + [Instrução do Step] + [Skills Ativas]
```

> **Não inclui por padrão:** `architecture.md`, `plan.md`, `review-notes.md`, `docs/`, ADRs.
> Esses arquivos entram apenas via declaração explícita no step ou via SCOPE GUARD (architecture.md).

### Modo Completo (`complete`) — contexto expandido

1. **Persona do agent** (conteúdo do `.agent.md`)
2. **Contexto do squad** (`company.md` + descrição + roles[])
3. **Stack do projeto** (`stack.md` — se existir) — injetado junto da persona, antes de qualquer instrução técnica
4. **Contexto da feature**: `context.snapshot` (se hash válido) ou `context.md` completo
5. **Memória recente**: bloco `<!-- RECENTES -->` de `memories.md` (últimas 5 entradas)
6. **ADRs filtrados** — do cache `[ADRS_CARREGADOS]` (somente domínio do squad). Conflito com ADR aceita = output vetado.
7. **project-learnings.md** (se existir)
8. **Outputs anteriores relevantes** + **Instrução do step** + base path

```
[Agent Persona] + [Stack do Projeto] + [Contexto Squad] + [context.snapshot|context.md] + [Memories RECENTES] + [ADRs filtrados] + [Project Learnings] + [Outputs Anteriores] + [Instrução do Step] + [Skills Ativas]
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
| **Sessão recuperável** | `suspended_at` atualizado a cada step. Orquestrador detecta e retoma |
| **Session é compartilhada** | Múltiplos roles trabalham na mesma session. Nunca apague arquivos sem aprovação |
| **review-notes é append-only** | Nunca substitua — sempre acrescente. Consolidação é manual via `/consolidate` |
| **memories é append-only com janela** | Novas entradas vão no bloco RECENTES. Ao atingir 10+, sugerir consolidação. Nunca delete entradas |
| **Backups simples** | Cria `{filename}.bak` antes de sobrescrever — sem rotação automática |
| **ADRs são filtrados por domínio** | ADRs carregados na FASE 1.1d em modo complete, somente os do domínio do squad |
| **Contexto por modo** | Modo Rápido: Tier 0 + snapshot + memories RECENTES. Modo Completo: + ADRs filtrados + project-learnings + memories SUMMARY (se needs_history) |
| **Manifest controla cache** | session.manifest.json rastreia hashes — evita re-leitura de arquivos inalterados |
| **architecture.md é on-demand** | Nunca carregado na FASE 1.1. Entra apenas via SCOPE GUARD (output_files) ou needs_architecture |
| **preferences.md lido uma vez** | Orchestrator lê e passa [MODELO_TIER] + [LINGUA]. Pipeline-runner nunca relê preferences.md |
| **stack.md é Tier 0** | Carregado na FASE 1.1 junto com company.md. Injetado em TODOS os agents, antes de qualquer instrução técnica. Agents adaptam linguagem, exemplos e estrutura de pastas ao stack detectado |
| **Stack adaptation é obrigatória** | Se stack.md existe, agents NÃO usam exemplos hardcoded — adaptam para a linguagem/framework declarados. Princípios são imutáveis; exemplos concretos seguem o stack |
| **state.json vs plan.md** | state.json é fonte de verdade do progresso. plan.md é exibição visual. Em divergência, state.json prevalece |
| **SCOPE GUARD por architecture.md** | Escopo lido da lista de arquivos em architecture.md — ausência = sem restrição (warning), nunca deriva de pipeline output_files |
| **SCOPE GUARD só em steps com output_files** | Steps sem output_files não recebem SCOPE GUARD — evita context waste em steps de revisão/formatação |
| **Escopo expandido = [DECISÃO PENDENTE]** | Se agent precisar de arquivo fora do escopo, sinaliza e aguarda aprovação — nunca expande silenciosamente |
| **SCOPE GUARD pergunta, não rejeita** | Violação de escopo → AskUserQuestion imediato (autorizar / rejeitar / editar architecture.md). Nunca auto-rejeita — a decisão é sempre do humano |
| **TODO é rastreado** | plan.md rastreia TODO — runner marca `[>]` ao iniciar e `[x]` ao concluir cada step via 2.3b e 2.8 |
