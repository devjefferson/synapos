---
name: synapos-pipeline-runner
version: 1.0.0
description: Engine de execução de pipelines — gerencia steps, agents, vetos e revisões
---

# SYNAPOS PIPELINE RUNNER v1.0.0

> Responsável por executar pipelines de squads step-by-step.
> Chamado pelo orchestrator após criação ou carregamento de um squad.

---

## PROTOCOLO DE EXECUÇÃO

Receba do orchestrator:
- Configuração do squad: `.synapos/squads/{slug}/`
- Runtime do squad: `docs/.squads/{slug}/`
- Pipeline a executar (ID ou `default`)

Execute os passos abaixo na ordem exata.

---

## FASE 1 — INICIALIZAÇÃO

### 1.1 — Carregar contexto

Leia os seguintes arquivos:
```
.synapos/squads/{slug}/squad.yaml      → configuração do squad
docs/.squads/{slug}/_memory/memories.md → aprendizados anteriores
docs/_memory/company.md                → perfil da empresa/usuário
docs/_memory/preferences.md            → preferências de saída
```

### 1.2 — Resolver pipeline

Leia `.synapos/squads/{slug}/pipeline/pipeline.yaml`.

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
    output_files:                     # nomes de arquivo apenas, sem prefixo docs/
      - {nome}.md                     # vai para docs/.squads/{slug}/output/{run_id}/
    veto_conditions:                  # opcional
      - "condição que invalida o output"
    on_reject: step-id-anterior       # opcional — loop de revisão
    depends_on: [step-id]             # opcional
```

### 1.3 — Carregar agents

Para cada agent no squad.yaml, leia o arquivo `.agent.md` correspondente em `.synapos/squads/{slug}/agents/`.

### 1.4 — Criar pasta de run

Crie: `docs/.squads/{slug}/output/{YYYY-MM-DD-HHmmss}/`

Inicialize `state.json`:
```json
{
  "run_id": "{YYYY-MM-DD-HHmmss}",
  "squad": "{slug}",
  "pipeline": "{pipeline-id}",
  "started_at": "{ISO datetime}",
  "current_step": null,
  "completed_steps": [],
  "status": "running"
}
```

### 1.5 — Anunciar início

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline: {nome do pipeline}
Squad: {slug} | Modo: {Alta Performance | Econômico}
Run: {run_id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## FASE 2 — EXECUÇÃO DE STEPS

Para cada step do pipeline (em ordem, respeitando `depends_on`):

### 2.1 — Atualizar state

```json
{ "current_step": "{step-id}", "status": "running" }
```

### 2.2 — Anunciar step

```
▶ [{N}/{total}] {Nome do Step}
   Agent: {icon} {displayName do agent}
```

### 2.3 — Carregar step

Leia o arquivo do step: `.synapos/squads/{slug}/{file}`

**Antes de passar as instruções ao agent, substitua todas as ocorrências de `docs/` no texto do step por `docs/.squads/{slug}/output/{run_id}/`.**

Exemplo: `docs/architecture-decision.md` → `docs/.squads/frontend-001/output/2026-03-24-143000/architecture-decision.md`

Essa substituição garante que o agent escreva e leia no local correto, independente do que está hardcoded no step.

Estrutura esperada do step:
```yaml
---
id: step-id
name: "Nome do Step"
agent: agent-id
execution: subagent | inline | checkpoint
model_tier: fast | powerful
output_files:
  - {nome}.md
veto_conditions:
  - "lista de condições de veto"
on_reject: step-id
---
# Instruções do step em markdown
```

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

**`execution: inline`** — agent executa diretamente na conversa:
- Assuma a persona do agent (lida do .agent.md)
- Execute as instruções do step
- Apresente o output formatado
- Se `output_file` definido → salve o resultado

**`execution: subagent`** — agent executa como subagente:
- Lance um subagente com:
  - O conteúdo completo do .agent.md do agent
  - As instruções do step
  - O contexto do squad (company.md + memories.md)
  - Os outputs dos steps anteriores relevantes (via `depends_on`)
  - As instruções de todas as skills ativas (lidas de `.synapos/skills/{skill}/SKILL.md`)
  - A instrução explícita: **"Use as skills disponíveis para executar esta tarefa. Skills são o caminho preferencial — nunca as ignore."**
- Aguarde o resultado
- Se `output_file` definido → salve o resultado

### 2.5 — Aplicar veto conditions

Antes de aceitar o output, verifique cada condição em `veto_conditions`:

```
⚠ VETO: {condição violada}
Tentativa {N}/2 — reexecutando step com feedback...
```

- Máximo de 2 tentativas automáticas de reexecução
- Na 3ª falha → apresente ao usuário para decisão

### 2.6 — Salvar output

Se `output_file` ou `output_files` definido:
- Crie o arquivo em `docs/.squads/{slug}/output/{run_id}/{filename}`
- Exemplo: `output_files: [architecture-decision.md]` → `docs/.squads/frontend-001/output/2026-03-24-143000/architecture-decision.md`
- Os valores em `output_files` são **somente o nome do arquivo** — sem prefixo `docs/`

> **Regra:** Todos os outputs de agents vão APENAS para `docs/.squads/{slug}/output/{run_id}/`. Nunca crie arquivos em `docs/` raiz nem dentro de `.synapos/`.

### 2.7 — Loop de revisão (on_reject)

Se o usuário rejeitar um output:
- Execute o step `on_reject` com o feedback
- Limite: 3 ciclos de revisão por step
- Na 4ª rejeição → pergunte ao usuário como proceder

### 2.8 — Marcar step completo

```json
{ "completed_steps": [..., "{step-id}"] }
```

```
✅ {Nome do Step} — concluído
```

---

## FASE 3 — FINALIZAÇÃO

### 3.1 — Atualizar state

```json
{
  "status": "completed",
  "completed_at": "{ISO datetime}"
}
```

Salve cópia de state.json em `docs/.squads/{slug}/output/{run_id}/state.json`.

### 3.2 — Atualizar memories

Pergunte ao usuário:
```
Algo que devo lembrar para a próxima vez? (ENTER para pular)
```

Se houver resposta, adicione em `docs/.squads/{slug}/_memory/memories.md`:
```markdown
## Aprendizado — {YYYY-MM-DD}
{texto do usuário}
```

### 3.3 — Apresentar sumário

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline concluído!

Documentos gerados:
  📄 {lista de output_files criados}

Run salvo em: docs/.squads/{slug}/output/{run_id}/

O que deseja fazer agora?
  [1] Executar pipeline novamente (nova versão)
  [2] Ver um documento gerado
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
4. **Memória do squad** (memories.md — preferências e aprendizados)
5. **Outputs anteriores relevantes** (definidos em `depends_on`)
6. **Instruções do step** (arquivo do step)
7. **Base path do squad** (caminho absoluto para todas as operações de arquivo)

A ordem de composição sempre é:
```
[Agent Persona] + [Contexto Squad] + [docs/ do projeto] + [Memória] + [Outputs Anteriores] + [Instrução do Step] + [Skills Ativas]
```

> **Regra:** Quando há skills ativas, o agent DEVE usá-las para executar a tarefa. Skills não são sugestões — são o caminho preferencial. Nunca execute manualmente o que uma skill já oferece.

> **Regra:** Nenhum agent pode executar sem antes ler a pasta `docs/` da raiz. Se `docs/` não existe ou está vazia, o runner deve bloquear e solicitar que o usuário execute o fluxo de documentação primeiro.

### Caminhos de arquivo

Todo agent executado recebe como primeira instrução:

```
IMPORTANTE — TODOS OS CAMINHOS SÃO ABSOLUTOS A PARTIR DA RAIZ DO PROJETO.
NUNCA crie arquivos dentro de .synapos/ — essa pasta é somente do framework.

LEITURA (documentação compartilhada — nunca escreva aqui):
- {PROJECT_ROOT}/docs/business/
- {PROJECT_ROOT}/docs/tech/
- {PROJECT_ROOT}/docs/tech-context/

ESCRITA (sempre use caminhos absolutos):
- Outputs gerados:    {PROJECT_ROOT}/docs/.squads/{slug}/{arquivo}
- Memória do squad:   {PROJECT_ROOT}/docs/.squads/{slug}/_memory/memories.md
- Histórico de run:   {PROJECT_ROOT}/docs/.squads/{slug}/output/{run_id}/{arquivo}

REGRA CRÍTICA: Se as instruções do step mencionarem um caminho como
"docs/spec.md" ou "docs/architecture.md", interprete como:
  → {PROJECT_ROOT}/docs/.squads/{slug}/spec.md
  → {PROJECT_ROOT}/docs/.squads/{slug}/architecture.md
Nunca crie a pasta docs/ dentro de .synapos/ ou de qualquer subpasta do framework.
```

Substitua `{slug}` e `{run_id}` pelos valores reais do squad ativo antes de injetar.

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
| **Nunca escreva em .synapos/** | Outputs vão SEMPRE para `docs/.squads/{slug}/` |
| **Caminhos absolutos** | Todo agent usa caminhos a partir da raiz do projeto |
| **Skills são obrigatórias** | Se uma skill cobre a tarefa, o agent DEVE usá-la — nunca a ignore em favor de execução manual |
