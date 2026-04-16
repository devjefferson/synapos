---
name: synapos-model-adapter
version: 1.2.0
description: Protocolo de adaptação de prompts para modelos de capacidade inferior — compensa limitações sem alterar os outputs esperados
---

# SYNAPOS MODEL ADAPTER v1.1.0

> Ativado automaticamente pelo pipeline-runner quando `model_capability: standard` ou `lite` está definido em `docs/_memory/preferences.md`.
> Garante a mesma qualidade e produtividade independente da capacidade do modelo usado.

---

## QUANDO ATIVAR

> **Binding antecipado:** O adapter é ativado na FASE 1.1e do pipeline-runner — antes de qualquer step.
> As `[CONTEXT_RULES]` derivadas aqui guiam a montagem de contexto de todos os steps.
> **Nunca releia `preferences.md` — use `[MODELO_TIER]` recebido do orchestrator.**

Verifique o valor de `[MODELO_TIER]` (derivado em preferences.md pelo orchestrator):

| Valor | Comportamento |
|---|---|
| `high` (padrão) | Sem adaptação — comportamento normal do pipeline-runner |
| `standard` | Adaptação leve: CoT prefix + template injection quando disponível |
| `lite` | Adaptação completa: todos os mecanismos ativos |

Se o campo não existir, assuma `high` e não aplique nenhuma adaptação.

---

## POR QUE ADAPTAR?

Modelos de capacidade inferior (`lite`) têm dificuldade com:
- **Contexto longo**: perdem instrução de step após muitos tokens de documentação
- **Inferência implícita**: não aplicam princípios abstratos sem instruções explícitas
- **Multi-tarefa**: qualidade cai quando precisam gerar vários artefatos ao mesmo tempo
- **Auto-correção**: não verificam o próprio output contra critérios de qualidade

O adapter compensa cada um desses pontos sem mudar o que é pedido — apenas o **como é pedido**.

---

## PERFIL `standard`

Aplique antes de executar cada step com `execution: subagent` ou `execution: inline`:

### S1 — Chain-of-Thought Prefix

Adicione ao **início** do prompt do step:

```
> PROTOCOLO DE EXECUÇÃO
> Antes de gerar qualquer output, faça mentalmente:
> 1. Qual é a tarefa exata pedida neste step?
> 2. Quais restrições do contexto se aplicam?
> 3. Qual é a estrutura esperada do output?
> Só então comece a gerar o conteúdo.
```

### S2 — Template Injection (se disponível)

Se o step tiver `lite_template:` no frontmatter YAML, injete após as instruções do step:

```
## Estrutura Esperada do Output

Use este template como base — preencha os campos marcados com `[...]`:

{conteúdo do lite_template}
```

---

## PERFIL `lite`

Aplique **todos** os mecanismos abaixo em ordem:

### L1 — Persona Simplificada

Ao carregar o `.agent.md`, verifique se existe a seção `## Modo Lite`:

- **Se existe** → use **apenas** o conteúdo da seção `## Modo Lite` como persona. Ignore o restante do `.agent.md`.
- **Se não existe** → extraia a seção `## Quality Criteria` do agent e reformate como lista de regras:

```
Você é um(a) {role} experiente.

REGRAS OBRIGATÓRIAS (aplique em todo output):
{cada linha da tabela Quality Criteria como regra numerada}
```

### L2 — Context Pruning

Em vez de instruir o agent a "ler toda a pasta docs/", construa e injete um resumo estruturado de no máximo 30 linhas:

```markdown
## Contexto do Projeto

- **Empresa/Projeto:** {nome de docs/_memory/company.md}
- **Setor:** {setor de company.md}
- **Objetivo do squad:** {description do squad.yaml}
- **Stack principal:** {extraia de docs/tech/ ou docs/tech-context/ se disponível, senão omita}

### Regras Críticas
{liste as 3–5 regras mais relevantes de docs/tech-context/briefing/critical-rules.md, se existir}
{se não existir, omita esta seção}

### Aprendizados do Squad
{liste os últimos 3 aprendizados do bloco <!-- RECENTES --> de memories.md, se houver}
{se não houver, escreva: "Nenhum aprendizado registrado ainda."}

### Aprendizados Transversais
{liste os últimos 2 de docs/_memory/project-learnings.md, se existir}
{se não existir, omita esta seção}
```

> **Regra:** No modo `lite`, o agent NÃO recebe instrução para "ler toda a pasta docs/". Recebe apenas este resumo.
> **memories.md:** carregue apenas as últimas 3 entradas do bloco `<!-- RECENTES -->` — nunca o arquivo inteiro.
> **Outputs de steps anteriores (`depends_on`):** em modo `lite`, forneça um resumo estruturado (não a íntegra), exceto se o step declara `preserve_depends_on: true`.
> **ADRs:** não injetados em modo `lite` por padrão. Injetados apenas se o step declara `adr_required: true`. Nunca instrua o agent a ler docs/ para buscá-los.

### L3 — Chain-of-Thought Obrigatório

Adicione ao **início** do prompt:

```
> PROTOCOLO DE EXECUÇÃO — SIGA EXATAMENTE NESTA ORDEM
>
> PASSO 1: Leia todo o contexto acima antes de começar.
> PASSO 2: Identifique a tarefa exata pedida no step.
> PASSO 3: Liste as restrições que se aplicam (das regras acima).
> PASSO 4: Se houver um template abaixo, use-o como estrutura do output.
> PASSO 5: Gere o output completo.
> PASSO 6: Revise seu output contra o checklist ao final antes de responder.
```

### L4 — Template Obrigatório

Se o step tiver `lite_template:` no frontmatter YAML:

```
## ESTRUTURA OBRIGATÓRIA DO OUTPUT

Você DEVE usar este template. Preencha todos os campos marcados com `[...]`.
Não deixe nenhum campo vazio ou com placeholder.

{conteúdo do lite_template}
```

Se o step **não tiver** `lite_template:`, mas tiver uma seção `## Documento a gerar` ou bloco de código markdown mostrando a estrutura do documento → extraia esse bloco e apresente como template obrigatório da mesma forma.

### L5 — Scope Forcing

Se o step tiver mais de 1 arquivo em `output_files`:

- Não execute todos de uma vez.
- Instrua explicitamente: **"Nesta execução, gere APENAS `{primeiro arquivo}`. Os demais serão gerados em seguida."**
- Após salvar o primeiro, execute sub-steps para os demais, um por vez.
- Log: `🔧 [SCOPE] Step dividido em {N} sub-execuções por model_capability: lite`

### L6 — Self-Check Checklist

Adicione ao **final** do prompt:

```
---
## ANTES DE FINALIZAR — VERIFIQUE CADA ITEM

☐ O output usa a estrutura do template (se fornecido)?
☐ Todos os campos obrigatórios foram preenchidos (sem `[...]` vazios)?
☐ As restrições e regras do contexto foram respeitadas?
☐ A tarefa pedida foi completamente executada?
☐ Os critérios de qualidade do agent foram atendidos?

Se qualquer item estiver incompleto, complete ANTES de responder.
```

---

## COMPOSIÇÃO FINAL DO PROMPT POR PERFIL

### Modo `high` (padrão — sem mudanças)

```
[Agent Persona completa do .agent.md]
[Contexto Squad: company.md]
[context.snapshot OU context.md completo]
[Memories: bloco RECENTES (últimas 5 entradas)]
[ADRs filtrados por domínio — se modo complete]
[Project Learnings: project-learnings.md, se existir e modo complete]
[Outputs anteriores relevantes: depends_on]
[Instruções do step]
[Skills ativas]
```

> **Nota:** Em modo `high`, o agent **não** recebe instrução de "ler toda a pasta docs/". Os ADRs filtrados são injetados pelo pipeline-runner a partir do cache. architecture.md entra somente via SCOPE GUARD ou `needs_architecture: true`.

### Modo `standard`

```
[CoT Prefix — S1]
[Agent Persona completa do .agent.md]
[Contexto Squad: company.md]
[context.snapshot OU context.md completo]
[Memories: bloco RECENTES (últimas 5 entradas)]
[ADRs filtrados por domínio — se modo complete]
[Outputs anteriores relevantes: depends_on]
[Instruções do step]
[Template — S2, se disponível]
[Skills ativas]
```

### Modo `lite`

```
[CoT Obrigatório — L3]
[Modo Lite da persona OU Quality Criteria como regras — L1]
[Resumo de contexto — L2] ← inclui últimas 3 entradas de memories RECENTES, nunca arquivo inteiro
[Outputs anteriores relevantes: depends_on — RESUMO (não íntegra, exceto preserve_depends_on: true)]
[Instruções do step]
[Template Obrigatório — L4]
[Skills ativas]
[Self-Check Checklist — L6]
```

> **Scope Forcing (L5)** modifica o número de execuções, não a composição do prompt.

---

## LOGS DO ADAPTER

Sempre que o adapter estiver ativo, registre antes de executar o step:

```
🔧 [MODEL-ADAPTER] Modo {standard|lite} ativado — {nome do modelo, se disponível em preferences.md}
   Mecanismos aplicados: {lista dos mecanismos L1/L2/L3/L4/L5/L6 ou S1/S2 ativos}
```

---

## REGRAS DO ADAPTER

| Regra | Descrição |
|---|---|
| **Escopo preservado** | O adapter adapta o *como*, nunca o *quê* — o output esperado é sempre idêntico |
| **Fallback de persona** | Se agent não tem `## Modo Lite`, use Quality Criteria como regras diretas (L1) |
| **Template é estrutura** | O modelo preenche o conteúdo — o template define apenas a forma |
| **Scope Forcing é sequencial** | Sub-steps de um step são apresentados um por vez, aguardando output antes do próximo |
| **Context Pruning em depends_on** | Em modo `lite`, outputs anteriores recebem resumo estruturado (não íntegra). Use `preserve_depends_on: true` no step para forçar íntegra |
| **ADRs vêm do cache filtrado** | ADRs são injetados do cache `[ADRS_CARREGADOS]` (filtrado por domínio). Em modo `lite`, somente se `adr_required: true` no step |
| **Memories windowing** | Em modo `lite`, carregue apenas as 3 entradas mais recentes do bloco RECENTES — nunca o arquivo inteiro |
| **Binding antecipado** | CONTEXT_RULES derivadas na FASE 1.1e, antes de qualquer step — não ao executar cada step |
| **Checkpoints não são afetados** | O adapter só atua em steps `subagent` e `inline` — nunca em `checkpoint` |
| **high é o padrão** | Se `model_capability` não estiver em preferences.md, comportamento é `high` sem log |
