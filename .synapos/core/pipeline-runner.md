---
name: synapos-pipeline-runner
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

Leia os seguintes arquivos na ordem exata:

```
.synapos/squads/{squad-slug}/squad.yaml                         → configuração do squad
docs/_memory/company.md                                        → perfil da empresa/usuário
docs/_memory/preferences.md                                    → preferências de saída
docs/.squads/sessions/{feature-slug}/context.md                → contexto da feature ← LEIA PRIMEIRO, sempre
docs/.squads/sessions/{feature-slug}/memories.md               → memória da feature
docs/.squads/sessions/{feature-slug}/architecture.md           → arquitetura (se existir)
docs/.squads/sessions/{feature-slug}/plan.md                   → plano (se existir)
docs/.squads/sessions/{feature-slug}/review-notes.md           → notas de revisão (se existir)
docs/_memory/project-learnings.md                              → aprendizados transversais (se existir)
```

> **Regra — context.md é obrigatório em feature existente:**
> Se a session folder já existe e `context.md` está presente, leia-o **antes de qualquer outra coisa**.
> O context.md é a memória principal da feature — define o que é, por que existe, decisões tomadas e o que não fazer.
> Ignorar o context.md em feature existente é o erro mais comum de um role novo entrando na feature.

Leia `execution_mode` do `squad.yaml` e configure o runner:

| `execution_mode` | Contexto injetado | Gates ativos |
|---|---|---|
| `quick` | `company.md` + session files | GATE-0, GATE-3, GATE-5 |
| `complete` | Tudo — docs/, ADRs, session files | GATE-0, GATE-3, GATE-5 |

Log ao iniciar:
```
⚙️  [MODE] {Rápido | Completo}
   Gates ativos: GATE-0, GATE-3, GATE-5
```

**Se `execution_mode: quick`:**
- Não tente ler `docs/`, `docs/business/`, `docs/tech/` nem `docs/tech-context/`
- Injete apenas: `company.md` (se existir) + session files + step instructions
- Log adicional: `⚡ [RÁPIDO] Contexto mínimo — ADRs e docs de projeto não injetados`

**Se `execution_mode: complete`:**

Adicionalmente, **pré-carregue os ADRs do projeto uma única vez**:
- Leia todos os arquivos em `docs/` cujo nome contenha `ADR`, `adr`, `decisions` ou `architecture-decision`
- Armazene o conteúdo em memória como `[ADRS_CARREGADOS]`
- Esses ADRs serão injetados diretamente nos steps — agents não precisam ler `docs/` para buscá-los


### 1.1b — Verificar model_capability

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
├── context.md      ← template padrão (ver abaixo)
├── memories.md     ← template padrão (ver abaixo)
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

`memories.md` inicial:
```markdown
# Memória: {feature-slug}

> Aprendizados acumulados de todos os roles que trabalharam nesta feature.
> Append-only. Para consolidar: execute /consolidate.

## Aprendizados
{preenchido durante execuções}

## Armadilhas conhecidas
{preenchido durante execuções}

## Próximos passos sugeridos
{preenchido durante execuções}
```

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

**Escrita:**
- Escreva normalmente após cada mudança de step
- Se a escrita falhar: logue o erro e continue sem interromper o pipeline

**Regra:** agents não escrevem no state.json. Apenas o pipeline-runner.

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

### Modo Rápido (`quick`) — 5 itens

1. **Persona do agent** (conteúdo do `.agent.md`)
2. **Contexto do squad** (`company.md` + descrição do squad + roles[])
3. **Session files** (se existirem: `context.md` → `architecture.md` → `plan.md`)
4. **Outputs anteriores relevantes** (definidos em `depends_on`)
5. **Instrução do step** + base path do squad

```
[Agent Persona] + [Contexto Squad] + [Session Files] + [Outputs Anteriores] + [Instrução do Step] + [Skills Ativas]
```

### Modo Completo (`complete`) — 5 itens + extras

1. **Persona do agent** (conteúdo do `.agent.md`)
2. **Contexto do squad** (`company.md` + descrição + roles[]) + **docs/** do projeto
3. **Session files** (`context.md` → `architecture.md` → `plan.md`) + **memories.md** + **project-learnings.md** (se existir)
4. **ADRs** — injetados do cache `[ADRS_CARREGADOS]`. Agente lista cada ADR como `[RESPEITADA]` ou `[NÃO APLICÁVEL]`. Conflito com ADR aceita = output vetado.
5. **Outputs anteriores relevantes** + **Instrução do step** + base path

```
[Agent Persona] + [Contexto Squad + docs/] + [Session Files + Memória] + [ADRs] + [Outputs Anteriores] + [Instrução do Step] + [Skills Ativas]
```

> **Skills:** quando ativas, o agent DEVE usá-las — não são opcionais.

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
| **State é best-effort** | Atualize state.json a cada mudança de step — falhas não bloqueiam |
| **Falha loud** | Se agent ou arquivo não encontrado, pare e informe |
| **Nunca escreva em .synapos/** | Outputs vão SEMPRE para `docs/.squads/sessions/{feature-slug}/` |
| **Caminhos absolutos** | Todo agent usa caminhos a partir da raiz do projeto |
| **Skills são obrigatórias** | Se uma skill cobre a tarefa, o agent DEVE usá-la |
| **Decisões sinalizam com `[?]`** | Decisão fora do escopo → sinaliza `[?]` no output, aguarda usuário |
| **ADRs somente no modo Completo** | Modo Rápido não injeta ADRs. Modo Completo: conflito com ADR = veto |
| **Sessão recuperável** | `suspended_at` atualizado a cada step. Orquestrador detecta e retoma |
| **Session é compartilhada** | Múltiplos roles trabalham na mesma session. Nunca apague arquivos sem aprovação |
| **review-notes é append-only** | Nunca substitua — sempre acrescente. Consolidação é manual via `/consolidate` |
| **memories é append-only** | Nunca substitua — sempre acrescente. Consolidação é manual via `/consolidate` |
| **Backups simples** | Cria `{filename}.bak` antes de sobrescrever — sem rotação automática |
| **ADRs são pré-carregados** | ADRs lidos uma vez na FASE 1 — subagents não re-leem docs/ |
| **Contexto por modo** | Modo Rápido: 5 itens. Modo Completo: 5 itens + docs/ + ADRs + memories |
