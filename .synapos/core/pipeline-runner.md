---
name: synapos-pipeline-runner
version: 2.2.0
description: Engine de execução de pipelines — gerencia steps, agents, vetos e revisões
---

# SYNAPOS PIPELINE RUNNER v2.2.0

> Responsável por executar pipelines de squads step-by-step.
> Chamado pelo orchestrator após criação ou carregamento de um squad.
>
> v2.0: Sistema de sessions — todos os artefatos de uma feature vivem em
> `docs/.squads/sessions/{feature-slug}/`, compartilhado entre squads.

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
├── context.md         ← contexto da feature (investigação)
├── architecture.md    ← desenho técnico (arquitetura)
├── plan.md            ← plano de execução por fases
├── memories.md        ← aprendizados acumulados de todos os squads
├── review-notes.md    ← notas de revisão (atualizado a cada review)
└── state.json         ← estado da feature, atualizado por cada squad
```

O `{feature-slug}` é o identificador da feature — geralmente o nome da branch (`feat/auth-module`) ou um slug descritivo (`auth-module`).

---

## FASE 1 — INICIALIZAÇÃO

### 1.1 — Carregar contexto

Leia os seguintes arquivos:
```
.synapos/squads/{squad-slug}/squad.yaml                         → configuração do squad
docs/.squads/sessions/{feature-slug}/memories.md               → memória da feature (todos os squads)
docs/.squads/sessions/{feature-slug}/review-notes.md           → notas de revisão (se existir)
docs/.squads/sessions/{feature-slug}/context.md                → contexto da feature (se existir)
docs/.squads/sessions/{feature-slug}/architecture.md           → arquitetura (se existir)
docs/.squads/sessions/{feature-slug}/plan.md                   → plano (se existir)
docs/_memory/company.md                                        → perfil da empresa/usuário
docs/_memory/preferences.md                                    → preferências de saída
docs/_memory/project-learnings.md                              → aprendizados transversais (se existir)
```

Adicionalmente, **pré-carregue os ADRs do projeto uma única vez**:
- Leia todos os arquivos em `docs/` cujo nome contenha `ADR`, `adr`, `decisions` ou `architecture-decision`
- Armazene o conteúdo em memória como `[ADRS_CARREGADOS]`
- Esses ADRs serão injetados diretamente nos steps — agents não precisam ler `docs/` para buscá-los

Conte as seções de segundo nível (`##`) em `memories.md` e `review-notes.md` e armazene os valores como `[MEMORIES_COUNT]` e `[REVIEW_NOTES_COUNT]` para uso nas fases 2 e 3.

### 1.1b — Estimativa de Budget de Contexto

Com base nos arquivos carregados em 1.1, estime o volume de contexto da session:

1. Some o número de linhas de `context.md` + `architecture.md` + `plan.md` (se existirem)
2. Some o número de linhas de `memories.md` + `review-notes.md`

| Linhas totais (session files) | Ação |
|---|---|
| < 400 linhas | Sem alerta — contexto saudável |
| 400–700 linhas | Alerta amarelo: contexto crescendo |
| > 700 linhas | Alerta laranja: considere ativar `model_capability: standard` |

Se o total ultrapassar **400 linhas**, exiba ao anunciar o pipeline:
```
⚠️  [BUDGET] Session com contexto elevado:
   context.md + architecture.md + plan.md: ~{N} linhas
   memories.md + review-notes.md: ~{N} linhas
   Total: ~{soma} linhas (~{soma/25}k tokens estimados por step)

   Dica: ative model_capability: standard em docs/_memory/preferences.md
   para comprimir o contexto automaticamente.
```

Nenhuma execução é bloqueada — apenas alerta informativo.

### 1.1c — Verificar model_capability

Leia o campo `model_capability` de `docs/_memory/preferences.md`:

| Valor | Ação |
|---|---|
| `high` ou ausente | Continuar normalmente — sem adaptação |
| `standard` | Ativar MODEL-ADAPTER em modo standard antes de cada step |
| `lite` | Ativar MODEL-ADAPTER em modo lite antes de cada step |

Se `model_capability` for `standard` ou `lite`, leia `.synapos/core/model-adapter.md` **agora** e mantenha o protocolo em memória para aplicar em cada step da FASE 2.

Log ao anunciar início do pipeline:
```
🔧 [MODEL-ADAPTER] Modo {standard|lite} ativo — {model_name se disponível, senão "modelo não especificado"}
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
├── memories.md     ← inicializar vazio com header
├── review-notes.md ← inicializar vazio com header
└── state.json      ← inicializar com estrutura abaixo
```

`state.json` inicial:
```json
{
  "feature": "{feature-slug}",
  "created_at": "{ISO datetime}",
  "updated_at": "{ISO datetime}",
  "squads": {}
}
```

`memories.md` inicial:
```markdown
# Memória da Feature: {feature-slug}

> Aprendizados acumulados de todos os squads que trabalharam nesta feature.
> Atualizado ao final de cada pipeline.

(preenchido durante execuções)
```

`review-notes.md` inicial:
```markdown
# Review Notes: {feature-slug}

> Notas de revisão de todos os squads. Acrescentadas, nunca substituídas.

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

### 1.4c — Proteção e Resiliência do state.json

**Leitura segura:**
Antes de usar o `state.json`, execute:
1. Tente parsear o conteúdo como JSON
2. Se falhar (JSON malformado): crie backup automático em `state.json.bak.{ISO-timestamp}` e informe:
   ```
   ⚠️  state.json corrompido. Backup salvo em state.json.bak.{timestamp}.
   Reiniciando state da feature. Histórico preservado no backup.
   ```
3. Reinicialize com estrutura mínima (`{ "feature": "{slug}", "created_at": "...", "squads": {} }`)

**Escrita segura:**
Antes de persistir qualquer escrita no `state.json`:
1. Serialize o objeto atualizado para string
2. Valide que é JSON válido
3. Se inválido: descarte a escrita, log de erro, não sobrescreva o arquivo existente
4. Se válido: sobrescreva (nunca usar append direto — sempre reescrever o arquivo completo com o objeto completo)

**Regra:** O state.json nunca deve ser editado diretamente por agents. Apenas o pipeline-runner escreve nele.

### 1.4b — Verificar pre_pipeline

Verifique se o `squad.yaml` tem a chave `pre_pipeline`:

```yaml
pre_pipeline:
  available: true
  agent: {id-do-agent-lead}
```

**Se `pre_pipeline.available: true` E `context.md` ainda não existe na session:**

Pergunte ao usuário:

```
Esta feature ainda não tem contexto/arquitetura definidos.

Deseja executar a pré-execução antes de [{nome do pipeline principal}]?

- ✅ Sim — Investigação → Arquitetura → Planejamento → {pipeline principal}
- ⏭️ Não — Iniciar direto no {pipeline principal}
```

**Se escolher Sim:**
1. Leia `.synapos/core/pipelines/pre-execution.yaml`
2. Resolva `{lead_agent}` pelo valor de `pre_pipeline.agent` no squad.yaml
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

**Se `context.md` já existe na session:** pule — a pré-execução já foi feita.

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

**Se `model_capability` for `standard` ou `lite` (verificado em 1.1c):**
Aplique o protocolo do MODEL-ADAPTER sobre o prompt composto antes de enviar ao agent.
O adapter atua apenas em steps com `execution: subagent` ou `execution: inline`.
Steps com `execution: checkpoint` nunca são afetados.

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

**Step `atualizar-tarefa`** — Antes de executar qualquer step com id contendo `atualizar-tarefa`, verifique `docs/_memory/preferences.md`:
- Se `task_tracker: none` ou campo ausente → pule o step automaticamente.
- Log: `⚡ Task tracker não configurado — step 'atualizar-tarefa' ignorado`
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

**GATE-DECISION (sempre, automático):**

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
2. Se sim E se `state.squads["{squad-slug}"].completed_steps` não está vazio (ou seja, há trabalho anterior):
   - Crie cópia de segurança: `{filename}.v{N}.bak` onde N é o número de versões `.bak` existentes + 1
   - Log: `📦 Backup criado: {filename}.v{N}.bak`
3. Prossiga com a escrita do novo conteúdo

Isso protege `context.md`, `architecture.md`, `spec.md` e outros artefatos centrais de reescritas acidentais.

**Retenção de backups:** Mantenha no máximo **3 arquivos `.bak`** por output file. Ao criar um novo backup quando já existem 3 versões, delete o mais antigo antes de criar o novo.
Log: `🗑️ Backup antigo removido: {filename}.v{N-2}.bak → novo: {filename}.v{N+1}.bak`

### 2.7 — Loop de revisão (on_reject)

Se o usuário rejeitar um output:
- Execute o step `on_reject` com o feedback
- Limite: 3 ciclos de revisão por step
- Na 4ª rejeição → pergunte ao usuário como proceder

Se o step gera `review-notes.md`: acrescente as notas ao arquivo existente (nunca substitua — append apenas).

### 2.8 — Marcar step completo

Atualize `state.json`:
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

### Consolidação de memories.md

Após cada append, conte o número de seções de segundo nível (`##`) em `memories.md`.

Se ≥ 10 seções: apresente ao usuário:
```
📝 memories.md acumula {N} entradas.
Deseja consolidar para facilitar a leitura?
  [1] Sim — resumir entradas antigas em bloco único preservando todas as informações
  [2] Não — manter como está
```

Se o usuário escolher consolidar:
1. Crie seção `## Consolidado até {YYYY-MM-DD}` com resumo estruturado de todas as entradas
2. Marque as entradas antigas com comentário `<!-- consolidado em {data} -->`
3. Não delete nenhuma entrada — apenas reorganize

### Formato de autoria (aplicar a todos os novos appends)

Todo append em `memories.md` deve seguir o formato:
```markdown
## [{squad-slug} · {agent-id}] — {YYYY-MM-DD}

{conteúdo do aprendizado}
```

Para aprendizados inseridos diretamente pelo usuário (não por agent), usar:
```markdown
## [{squad-slug} · usuario] — {YYYY-MM-DD}

{conteúdo}
```

### Consolidação de review-notes.md

Após cada append em `review-notes.md`, atualize o contador `[REVIEW_NOTES_COUNT]`.

Se ≥ 10 seções (`##`): apresente ao usuário:
```
📝 review-notes.md acumula {N} entradas de revisão.
Deseja consolidar para facilitar a leitura?
  [1] Sim — agrupar revisões antigas em bloco único preservando todo o conteúdo
  [2] Não — manter como está
```

Se o usuário escolher consolidar:
1. Crie seção `## Revisões Consolidadas até {YYYY-MM-DD}` com resumo estruturado de todas as entradas antigas
2. Marque entradas antigas com `<!-- consolidado em {data} -->`
3. Não delete nenhuma entrada — apenas reorganize

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

Ao executar qualquer step, o agent recebe automaticamente:

1. **Conteúdo do próprio .agent.md** (persona, princípios, framework)
2. **Contexto do squad** (company.md + objetivo do squad)
3. **Documentação do projeto** (`docs/` na raiz — **obrigatório**, leia todos os arquivos disponíveis)
4. **Session files** (leia na ordem abaixo, se existirem):
   - `docs/.squads/sessions/{feature-slug}/context.md`
   - `docs/.squads/sessions/{feature-slug}/architecture.md`
   - `docs/.squads/sessions/{feature-slug}/plan.md`
5. **ADRs do projeto** — injetados a partir do cache `[ADRS_CARREGADOS]` pré-lido na FASE 1. O agent **não precisa ler docs/** para buscá-los — recebe o conteúdo diretamente. Liste cada ADR como `[RESPEITADA]` ou `[NÃO APLICÁVEL]`. Conflito = output vetado.
6. **Memória da feature** (`docs/.squads/sessions/{feature-slug}/memories.md`)
7. **Aprendizados transversais** (`docs/_memory/project-learnings.md` — se existir)
8. **Outputs anteriores relevantes** (definidos em `depends_on`)
9. **Instruções do step** (arquivo do step)
10. **Base path do squad** (caminho absoluto para todas as operações de arquivo)

A ordem de composição sempre é:
```
[Agent Persona] + [Contexto Squad] + [docs/ do projeto] + [Session Files] + [ADRs] + [Memória da Feature] + [Project Learnings] + [Outputs Anteriores] + [Instrução do Step] + [Skills Ativas]
```

> **Regra ADR — Não-Negociável:** Conflito com ADR existente = `🚫 CONFLITO-ADR: {adr-id} — {motivo}` e output bloqueado.

> **Regra:** Quando há skills ativas, o agent DEVE usá-las. Skills não são sugestões.

> **Regra:** Nenhum agent executa sem ler `docs/` da raiz. Sem documentação = bloqueio.

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
| **State é real-time** | Atualize state.json a cada mudança de step |
| **Falha loud** | Se agent ou arquivo não encontrado, pare e informe |
| **Nunca escreva em .synapos/** | Outputs vão SEMPRE para `docs/.squads/sessions/{feature-slug}/` |
| **Caminhos absolutos** | Todo agent usa caminhos a partir da raiz do projeto |
| **Skills são obrigatórias** | Se uma skill cobre a tarefa, o agent DEVE usá-la |
| **Zero decisões autônomas** | Toda decisão fora do escopo = `[DECISÃO PENDENTE]` obrigatório |
| **ADRs são lei** | Antes de implementação, agents leem ADRs. Conflito = veto |
| **Sessão recuperável** | `suspended_at` atualizado a cada step. Orquestrador detecta e retoma |
| **Session é compartilhada** | Múltiplos squads trabalham na mesma session. Nunca apague arquivos existentes sem aprovação |
| **review-notes é append-only** | Nunca substitua review-notes.md — sempre acrescente. Consolidar ao atingir 10+ entradas |
| **memories é append-only** | Nunca substitua memories.md — sempre acrescente. Consolidar ao atingir 10+ entradas |
| **Backups limitados a 3** | Máximo 3 arquivos `.bak` por output file — delete o mais antigo antes de criar novo |
| **ADRs são pré-carregados** | ADRs lidos uma vez na FASE 1 e injetados diretamente — subagents não re-leem docs/ |
| **Budget é monitorado** | Estime linhas da session na inicialização — alerte acima de 400 linhas |
