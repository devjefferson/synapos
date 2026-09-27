---
name: synapos-pipeline-runner
version: 3.0.0
description: Engine de execução de pipelines — tracks, montagem de contexto, steps, gates, handoff entre roles e memória
---

# SYNAPOS PIPELINE RUNNER v3.0.0

> Uma IA, várias roles. O runner troca a role a cada step e entrega a ela **só o contexto que a decisão do step exige**.
> Histórico de versões: `CHANGELOG.md`.

Arquivos que o runner lê uma vez por run e reutiliza:

```
.synapos/core/compliance-protocol.md   → [COMPLIANCE_PROTOCOL] (injetado em todo step inline/subagent)
.synapos/core/context-engine.md        → regras de recuperação, Context Brief, escrita e invalidação de memória
.synapos/core/skills-engine.md         → descoberta e seleção de skills
.synapos/core/gate-system.md           → gates
```

Sob demanda: `change-guard.md` (detalhes do guard), `adr-standard.md` (índice/conflito), `model-adapter.md` (tier standard/lite), `escalation.md` (escalation).

---

## ENTRADAS (do orchestrator — nunca relidas do disco)

| Variável | Conteúdo |
|---|---|
| squad | `.synapos/squads/{squad-slug}/` |
| feature | `{feature-slug}` → session `docs/.squads/sessions/{feature-slug}/` |
| `[TRACK]` | `quick` · `standard` · `complex` (triagem do orchestrator) |
| `[TASK]` | pedido do usuário em 1–3 frases |
| `[MODELO_TIER]` · `[LINGUA]` · `[TASK_TRACKER]` | de preferences.md |
| `[COMPANY_CONTEXT]` · `[STACK_CONTEXT]` | company.md · stack.md (stack pode vir vazio) |
| `[MEMORY_MAP]` | cabeçalhos de project-memory.md + adr-index.md + skills-index.md (context-engine §3.1) |
| `resume_from` | step-id, `null` (reinício) ou ausente |

`[STACK_CONTEXT]` vazio → emita **uma vez**: `⚠️ [STACK] stack.md ausente — use /setup:discover para gerar.`

---

## CAMINHOS — regra única

1. **Todo caminho é literal a partir da raiz do projeto.** O runner nunca reescreve caminhos do step.
2. **Arquivos declarados em `output_files`** são artefatos da feature: salvos em `docs/.squads/sessions/{feature-slug}/{nome}` — mesmo que o texto do step diga `docs/{nome}`.
3. `{session}` no texto de um step = `docs/.squads/sessions/{feature-slug}`.
4. `file:` relativo em `pipeline.yaml` resolve a partir do diretório do squad (`.synapos/squads/{squad-slug}/`); em pipelines do core, a partir de `.synapos/core/pipelines/`.

Instrução injetada no topo de todo step inline/subagent:

```
CAMINHOS
- Artefatos deste step (output_files) → docs/.squads/sessions/{feature-slug}/
- Código do projeto → somente o autorizado pelo SCOPE GUARD (se ativo)
- docs/_memory/ → somente via política de memória (context-engine §4) ou pelo step de discovery
- docs/business/, docs/tech/, docs/tech-context/, ADRs → leitura (escrita só quando o step manda explicitamente)
- .synapos/ → nunca escrever (exceção: .synapos/squads/, criado apenas por /setup:squad)
```

---

## TRACKS — profundidade adaptativa

| Track | Fluxo | Quando |
|---|---|---|
| `quick` | contexto → role → skills → executar → revisar | mudança localizada, sem decisão nova (texto, estilo, fix óbvio) |
| `standard` | contexto → discovery de padrões → arquitetura → 1 checkpoint → executar → review | feature ou bug em território conhecido |
| `complex` | brainstorm → requisitos → arquitetura → plano → desenvolvimento → review → aprendizado | ideia vaga, nova capacidade, cross-domain, impacto em ADR/modelo de dados |

- `[TRACK]` do orchestrator prevalece para esta execução. Sem ele, derive de `squad.yaml → execution_mode`: `quick → quick` · `complete → standard` (legado) · `standard`/`complex` literais.
- **Filtro de steps:** step com `tracks: [..]` só executa se `[TRACK]` está na lista. Senão: `⏭️ {step} — fora do track {track}`.
- **`skip_condition`:** avalie a condição contra o estado atual (arquivos da session, agents do squad, skills). Verdadeira → `⏭️ {step} — {condição}`.
- Step pulado conta como satisfeito para o `depends_on` dos seguintes (registre em `completed_steps` com sufixo `:skipped`).

---

## FASE 1 — INICIALIZAÇÃO

### 1.1 Configuração

Leia `squad.yaml` e `pipeline/pipeline.yaml`. Leia os 4 arquivos de core listados no topo.
Agents: leia cada `.agent.md` **quando o primeiro step dele for executar** e mantenha em cache no run.

`[MODELO_TIER]` `standard`/`lite` → leia `.synapos/core/model-adapter.md` e derive `[CONTEXT_RULES]` agora (aplicadas na montagem de contexto, antes de enviar ao agent).

`model_tier` por step: `fast` | `powerful` (padrão `powerful`). Se preferences.md define `model_fast` e `model_powerful`, roteie cada step ao modelo correspondente; senão, um modelo para todos.

Log:
```
⚙️  [TRACK] {quick|standard|complex} · Pipeline: {nome} · Modo: {alta|economico|solo}
```

### 1.2 Session

Se `docs/.squads/sessions/{feature-slug}/` não existe, crie **apenas**:

```
state.json    → { "feature": "{slug}", "created_at": "{ISO}", "updated_at": "{ISO}", "squads": {} }
memories.md   → "# Memória: {slug}\n\n> Entradas tipadas — formato em .synapos/core/context-engine.md §2\n"
```

**Não crie `context.md` vazio.** Ele é criado pelo primeiro step que investiga a feature (pré-execução, `qf-02-contexto` ou produto). Arquivo ausente = contexto ainda não levantado.

Esquema canônico de `context.md` (quem criar, usa este):

```markdown
# Contexto: {feature}

## Resumo
{≤ 5 linhas: o que é · por quê · decisões críticas · o que não fazer}

## Motivação
## Meta
## Escopo
**IN:** … **OUT:** …
## Decisões
{entradas DECISION — context-engine §2}
## O que não fazer
## ADRs Relevantes
## Validação
## Questões Abertas
```

Sessions antigas com `## O que é` / `## Por que existe` continuam válidas: leia-as como Resumo/Motivação. `session.manifest.json` e `context.snapshot` antigos são ignorados.

### 1.3 Retomada

**`resume_from: {step-id}`** (o orchestrator já perguntou):
1. Step não existe no pipeline → `⚠️ [RESUME] '{id}' não encontrado — retomando do primeiro step pendente` (primeiro id fora de `completed_steps`; todos concluídos → FASE 3).
2. Re-injete os artefatos (`output_files`) dos steps concluídos que existirem na session.
3. Mantenha `completed_steps`; `status: running`, `suspended_at: {resume_from}`.
4. Anuncie: `⚡ Retomando {squad} · {feature} — {concluídos}/{total} · a partir de: {step}`

**`resume_from: null`** → execução completa do zero (o orchestrator já limpou o progresso; arquivos da session são mantidos).

**Nova execução** (sem entrada do squad, ou `completed`/`discarded`):
```json
"squads": { "{squad-slug}": { "domain": "{d}", "pipeline": "{id}", "track": "{track}", "started_at": "{ISO}",
  "completed_at": null, "status": "running", "completed_steps": [], "current_step": null, "suspended_at": null } }
```

### 1.4 Pré-execução

Execute `.synapos/core/pipelines/pre-execution.yaml` antes do pipeline principal quando **todas** forem verdadeiras:

- `squad.yaml → pre_pipeline.available: true` e `pre_pipeline.agent` existe em `agents[]`
- `[TRACK]` é `standard` ou `complex`
- `architecture.md` não existe na session **ou** `context.md` não existe / não tem `## Meta` preenchida
- não é retomada de um step do pipeline principal

Um `context.md` parcial vindo do Produto (brainstorm) não impede a pré-execução: a investigação o completa, preservando o que já existe.

Use `pre_pipeline.agent` como `{lead_agent}`. Os steps da pré-execução também respeitam `tracks:`.
Se a session já tem `spec.md`/`handoff.md` (vindo do squad de produto), a investigação **consome** esses artefatos em vez de reperguntar.

```
🔍 Preparando a feature: investigação → padrões → arquitetura{→ plano} → {pipeline principal}
```

Ao concluir: `✅ Pré-execução concluída — context.md, architecture.md{, plan.md} na session.`
Steps do pipeline principal que regenerariam um artefato já aprovado na pré-execução (ex: `architecture.md`) são pulados pela sua `skip_condition`.

### 1.5 Squads paralelos

Outros squads `running` na mesma feature → avise (não bloqueie) listando os `output_files` que este pipeline pode sobrescrever, e aguarde confirmação.

### 1.6 Estado do run (em memória)

```
[RUN] = { steps: [], files_changed: [], decisions: [], memory_candidates: [], stale_flags: [],
          gates: { passed: 0, failed: 0, retries: 0 }, started_at: {ISO} }
```

---

## FASE 2 — EXECUÇÃO DE STEPS

Para cada step, na ordem, respeitando `depends_on` (hard), `tracks` e `skip_condition`:

### 2.1 Estado e anúncio

`state.json`: `current_step` e `suspended_at` = step atual, `status: running`, `updated_at`.
Escrita de `state.json` é sempre do arquivo completo (se a ferramenta permitir, grave em `state.tmp.json` e renomeie). Falha de escrita → log e continue; JSON corrompido na leitura → reinicialize com estrutura mínima. Só o runner escreve `state.json`.

```
▶ [{N}/{total}] {step} — {icon} {agent}
```

### 2.2 Step `update-task`

`[TASK_TRACKER]` `none`/ausente → `⏭️ update-task — task tracker não configurado`.

### 2.3 Montar o contexto (inline e subagent — idêntico)

Ordem do prompt:

```
1. CAMINHOS
2. [MODEL-ADAPTER prefix]                  (tier standard/lite)
3. Persona focada da role                  (abaixo)
4. ⛔ FORA DO MEU ESCOPO                    (seção do agent, se existir)
5. [COMPLIANCE_PROTOCOL]
6. ⛔ SCOPE GUARD                           (2.4, se ativo)
7. Contexto recuperado                     (context-engine §3.2 — só o selecionado)
8. HANDOFF dos steps de depends_on         (ou output completo se needs_full_output_of)
9. Instrução do step
10. 📋 CHANGE GUARD                          (2.5, inline)
```

**Persona focada:** do `.agent.md`, injete `## Persona → Identidade`, a linha de `## Foco por Tipo de Step` que casa com o id/nome do step (investigacao, arquitetura, implementacao, execucao, review, diagnostico, fix, planejamento, docs, design, seguranca, integracao, spec, handoff…), `## Quality Criteria` e `## Regras Obrigatórias`. Sem `## Foco por Tipo de Step` → persona completa.

**Contexto recuperado (item 7):** siga context-engine §3.2 — Tier 0 (stack + identidade), memória selecionada do `[MEMORY_MAP]`, role memory do domínio, `## Resumo` do context.md, ADRs do índice que casam, skills que casam (skills-engine §3), arquivos justificados. O agent **abre o output com o Context Brief** (context-engine §3.3).

**Expansão declarada no step:**

| Campo | Injeta |
|---|---|
| `needs_full_context: true` | context.md completo |
| `needs_spec: true` | spec.md / requirements.md / handoff.md da session |
| `needs_architecture: true` | architecture.md |
| `needs_plan: true` | plan.md (se existir — track complex) |
| `needs_review: true` | review-notes.md |
| `needs_history: true` | memories.md completo da session |
| `needs_docs: true` | docs de projeto relevantes (docs/business, docs/tech-context) — só o que casa com a tarefa |
| `adr_required: true` | ADRs relevantes mesmo em tier lite |

`[CONTEXT_RULES]` (tier standard/lite) são aplicadas sobre esses blocos antes do envio.

**Subagent:** recebe exatamente o contexto montado acima (não "todas as skills", não "todos os docs"). Inline: a IA assume a role na conversa com o mesmo contexto.

### 2.4 SCOPE GUARD

Ativo em steps inline/subagent **que escrevem código do projeto** — tipo `implementacao`, `execucao`, `fix`, `frontend`, `backend`, `integracao` (pelo id/nome) ou `scope_guard: true` — quando `architecture.md` tem a seção `## Principais Arquivos a Modificar/Criar` (ou `## Arquivos a modificar`/`## Escopo de modificação`). `output_files` são artefatos da session e não entram no guard.

- Primeira leitura no run popula `[ARCHITECTURE_CACHE] = { content, scope_files }`; os demais steps reutilizam.
- Sem lista → `⚠️ [SCOPE] sem lista de arquivos — guard desativado neste step` (ausência = sem restrição; nunca derive escopo de `output_files`).

```
⛔ SCOPE GUARD — só crie/modifique: {scope_files}
Leitura é livre. Precisa de outro arquivo? → [DECISÃO PENDENTE]. Nunca expanda em silêncio.
```

Output que menciona escrita fora do escopo → AskUserQuestion: **Autorizar** (adiciona a architecture.md e ao cache) · **Rejeitar** (1 retry com escopo reforçado) · **Editar architecture.md** (suspende; retomada relê o arquivo).

### 2.5 CHANGE GUARD

Ativo em inline/subagent salvo `change_guard: false` (squad ou step). Protocolo e formato: `.synapos/core/change-guard.md`.
- **subagent:** `git status --porcelain` antes e depois (inclui arquivos novos não rastreados); o diff real é a fonte. Sem git → self-report.
- **inline:** injete a instrução de self-report; extraia o bloco `📋 [CHANGE GUARD]` do output antes de salvar; ausente → aviso.
- `change_log: true` no squad → append em `{session}/change-log.md`.

### 2.6 Executar por tipo

**`checkpoint`** — pausa com menu (✅ Continuar · ✏️ Ajustar · ⏭️ Pular). `mode: solo` pula checkpoints **sem** `gate:` nos tracks quick/standard; no track `complex` todo checkpoint de aprovação executa. `async_checkpoints: true` → `status: awaiting_approval`, registra em `{session}/pending-approvals.md`, encerra sem erro (retomada via `/init`).

**`inline`** — a IA assume a role e executa com o contexto de 2.3.

**`subagent`** — lança subagente com o contexto de 2.3; aguarda o resultado. Sem suporte a subagente na IDE → execute inline.

### 2.7 Pós-execução

1. Extraia do output: `## HANDOFF` → `[HANDOFF_{step}]` (inclui `Candidatos a memória` → `[RUN].memory_candidates`); bloco CHANGE GUARD. Remova ambos do artefato. HANDOFF ausente → `⚠️ [HANDOFF] ausente em {step} — próximo step recebe o output completo`. Confira `O que foi entregue` contra o CHANGE GUARD/arquivos da session: item sem correspondência (ex: "commit pronto" sem commit) é removido do HANDOFF.
2. Veto de escopo (2.4).
3. Gates na ordem de `gate-system.md` (3a → 3 + vetos → 3b → DECISION → ADR → HANDOFF). Máximo 2 reexecuções automáticas por falha; na 3ª → usuário.
4. Sinais `[STALE]`/`[CONFLICT]` → `[RUN].stale_flags`.

### 2.8 Salvar

`output_files` → `{session}/{nome}`. Se o arquivo existe, crie `{nome}.bak` antes de sobrescrever. Exceção: `review-notes.md` é append-only — acrescente a nova revisão ao final, sem sobrescrever nem `.bak`.

### 2.9 Revisão (`on_reject`)

Output rejeitado (usuário ou review com BLOCKER) → execute o step `on_reject` com o feedback. Máximo 3 ciclos; na 4ª → pergunte como proceder.

### 2.10 Concluir step

`state.json`: adicione a `completed_steps`, limpe `current_step`/`suspended_at`.
```
✅ {step} — concluído
{CHANGE GUARD report, se houver}
```
Acumule em `[RUN].steps`: `{ id, agent, gates: [{gate, result, attempts}], files_changed, handoff, decisions }`.

---

## HANDOFF ENTRE ROLES

Cada role deixa um artefato; a próxima o lê em vez de reconstruir o trabalho.

| Role | Artefato (session) | Consumido por | Como |
|---|---|---|---|
| Produto | `spec.md` (+ `requirements.md`, `handoff.md`) | investigação / arquitetura | `needs_spec: true` · investigação não repergunta o que a spec responde |
| Investigação | `context.md` | todos | `## Resumo` sempre; completo via `needs_full_context` |
| Discovery de padrões | `roles/{domain}.md` + Âncora no HANDOFF | arquitetura, implementação | âncora copiada para `architecture.md ## Referência no Projeto` |
| Arquitetura | `architecture.md` | implementação, review | SCOPE GUARD + `needs_architecture` |
| Planejamento (complex) | `plan.md` | execução por fases | `needs_plan` |
| Desenvolvimento | código + CHANGE GUARD | review | diff real + HANDOFF |
| Review | `review-notes.md` | on_reject / próximo ciclo | `needs_review` |

Entre steps do mesmo pipeline, `depends_on` injeta só `[HANDOFF_{step}]`. `needs_full_output_of: {step}` injeta o artefato completo.

---

## FASE 3 — FINALIZAÇÃO

### 3.1 Estado

`state.json`: `status: completed`, `completed_at`, limpe `current_step`/`suspended_at`. `squad.yaml`: `status: completed`, `updated_at`.

### 3.2 Memória

Aplique `context-engine.md` §4 sobre `[RUN].memory_candidates` + `[RUN].stale_flags`:

1. Filtre (§4.1) e deduplique contra o `[MEMORY_MAP]` e o `memories.md` da session. Padrões deriváveis do código → cache (`roles/{domain}.md`), não memória.
2. Grave automaticamente `LEARNING | FACT | REFERENCE` com evidência e `FEEDBACK`; `TEMPORARY` só na session.
2b. Verifique os limites (context-engine §4.4); acima deles, inclua a consolidação na pergunta abaixo.
3. **Uma** AskUserQuestion para os normativos e os conflitos:

```
AskUserQuestion({
  question: "Memória desta execução\n\nGravadas automaticamente:\n{lista}\n\nPrecisam de confirmação:\n{[DECISION|RULE|…] resumo · escopo}\n\nConflitos/obsoletas:\n{[STALE|CONFLICT] …}",
  options: [
    { label: "✅ Gravar todas", description: "Normativas + atualizações de obsoletas" },
    { label: "✏️ Escolher", description: "Indicar quais gravar ou ajustar" },
    { label: "➕ Adicionar algo", description: "Registrar uma memória que não está na lista" },
    { label: "⏭️ Não gravar normativas", description: "Mantém só as automáticas" }
  ]
})
```

Nada a confirmar e nada gravado → pule sem perguntar.

### 3.3 session-report.md

Sobrescreva `{session}/session-report.md` (sem `.bak`) a partir de `[RUN]`:

```markdown
# Session Report: {feature}
> {YYYY-MM-DD HH:MM} · Synapos v{VERSION} · Squad: {squad} · Pipeline: {pipeline} · Track: {track}

## Steps
| Step | Agent | Gates | Arquivos | Retentativas |
|------|-------|-------|----------|--------------|

## Arquivos Modificados
- `{path}` — {step} · {linhas} · {descrição}
{vazio → "⚠️ Nenhum arquivo rastreado (CHANGE GUARD indisponível)"}

## Decisões
- **{step}** — {decisão} → {opção aprovada}
{vazio → "Nenhuma decisão fora do escopo."}

## Memória
{gravadas · confirmadas · marcadas stale}

## HANDOFF Final
{[HANDOFF] do último step}
```

Log: `📊 [REPORT] session-report.md — {N} steps · {N} arquivos · {N} gates`

### 3.4 Commit (opt-in)

`squad.yaml → auto_commit`: `ask` (padrão — pergunta) · `true` (commita) · `false` (pula).

- Tipo pelo pipeline: `feature-*`/`component-*` → `feat` · `bug-fix`/`quick-fix`/`fix-*` → `fix` · `*migration*` → `chore(db)` · `ci-cd-*`/`infra-*` → `ci` · `refinar-docs`/`*spec*`/`discovery-*` → `docs` · outro → `chore`.
- Stage: `[RUN].files_changed` + `{session}/session-report.md` + `{session}/state.json`. Nunca `.synapos/`, `.env*`, arquivos fora do projeto.
- Mensagem: `{tipo}({feature}): {pipeline} — {squad}` + steps + arquivos + `Session: {session}/session-report.md`.
- Falha de git → `⚠️ [GIT] commit não realizado: {motivo}` e siga. Nunca bloqueia.

### 3.5 Sumário (GATE-5)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline concluído — {feature} · {squad} · track {track}
Session: docs/.squads/sessions/{feature}/
Artefatos: {output_files} · 📊 session-report.md
{🔖 Commit: {hash} — "{mensagem}"}

[1] Outro squad nesta feature  [2] Ver session-report.md  [3] Ver arquivo da session
[4] Menu principal             [5] Pausar squad
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## CONTRATO DO pipeline.yaml

```yaml
steps:
  - id: step-id
    name: "Nome"
    agent: agent-id                 # ausente em checkpoint
    file: pipeline/steps/{id}.md
    execution: inline | subagent | checkpoint
    model_tier: fast | powerful
    tracks: [standard, complex]     # opcional — sem o campo, roda em todos
    skip_condition: "texto"         # opcional
    depends_on: [step-id]
    output_files: [arquivo.md]      # só o nome → vai para a session
    output_schema: { required_sections: ["## X"], formats: [{ field: "## X", pattern: "regex" }] }
    veto_conditions: ["condição que invalida o output"]
    needs_full_output_of: step-id
    needs_*: true                   # ver 2.3
    gate: GATE-N
    on_reject: step-id
    change_guard: false             # opcional
```

`success_criteria` fica no frontmatter do `.md` do step (GATE-3b). Campos do `pipeline.yaml` prevalecem sobre o frontmatter.

---

## REGRAS DO RUNNER

| Regra | |
|---|---|
| Ordem e `depends_on` são hard | Nunca execute step sem pré-requisito concluído |
| Contexto mínimo suficiente | Nada entra no prompt sem "por quê" (context-engine §3.2) |
| Skills antes de executar | Descoberta e carga acontecem na montagem de contexto de **todo** step inline/subagent |
| ADR vale em todos os tracks | Consulta pelo índice; conflito bloqueia (adr-standard §4) |
| Caminhos literais | Nunca reescreva caminhos; `output_files` → session |
| Sinais nunca são auto-resolvidos | `[DECISÃO PENDENTE]`, `[CONTEXT_REQUIRED]`, `[ADR-CONFLICT]`, `[SKILL-CONFLICT]` param o fluxo |
| Veto/gate: 2 retries · review: 3 ciclos | Depois disso, decisão do usuário |
| Sempre salve | Nunca perca output — salve antes de seguir; `.bak` antes de sobrescrever |
| Session é compartilhada | Várias roles, mesma session. Nunca apague arquivos sem aprovação |
| Fail loud | Agent, step ou template ausente → pare e informe |
| Nunca escreva em `.synapos/` | exceto `.synapos/squads/`, criado por `/setup:squad` |
