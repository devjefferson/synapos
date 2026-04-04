---
name: synapos-gate-system
version: 1.4.0
description: Sistema de quality gates — validação em pontos críticos do pipeline
---

# SYNAPOS GATE SYSTEM v1.4.0

> Gates são pontos de validação obrigatórios. Falha em um gate bloqueia o avanço.
> Princípio: **Fail Loud, Never Silent** — nunca ignore uma falha de gate.

---

## GATES DISPONÍVEIS

Use `gate:` nos steps do pipeline.yaml para ativar um gate antes de continuar.

---

### GATE-0 — Integridade do Framework e Documentação do Projeto

**Quando usar:** No primeiro step de qualquer pipeline. **Obrigatório antes de qualquer execução.**

**Verifica — Framework:**
- [ ] `.synapos/core/orchestrator.md` existe
- [ ] `.synapos/core/pipeline-runner.md` existe
- [ ] `docs/_memory/company.md` existe
- [ ] `docs/_memory/preferences.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe
- [ ] `.synapos/squads/{slug}/agents/` tem pelo menos um .agent.md

**Verifica — Documentação do Projeto (obrigatório):**
- [ ] Pasta `docs/` existe na raiz do projeto
- [ ] `docs/` contém pelo menos um arquivo `.md`

**Se `docs/` não existe ou está vazia — avalie o modo do squad:**

Leia `squad.yaml` e verifique `mode` e `bootstrap`:

| Condição | Comportamento |
|---|---|
| `bootstrap: true` | Passa com aviso — ver abaixo |
| `mode: solo` E `company.md` existe | Passa com aviso — ver abaixo |
| `mode: solo` E `company.md` ausente | Bloqueio total |
| `mode: alta` ou `economico` | Bloqueio total |

**Modo padrão — bloqueio (`alta` / `economico` sem bootstrap):**
```
🚫 GATE-0 — Documentação ausente

A pasta docs/ está vazia ou não existe.
Nenhum agent pode executar sem documentação do projeto.

Execute primeiro o fluxo de documentação:
  → /setup:build-business   (contexto de negócio)
  → /setup:build-tech        (contexto técnico, se aplicável)

Após gerar a documentação, execute o pipeline novamente.
```

**Bootstrap Mode (`bootstrap: true` em squad.yaml):**

GATE-0 passa com aviso:
```
⚡ GATE-0 (Bootstrap Mode) — Sem documentação de projeto
docs/ não encontrada. Executando com contexto mínimo.

Pipelines disponíveis: quick-fix e bug-fix
Outputs são funcionais, mas sem conhecimento dos seus padrões e arquitetura.

Para resultados melhores:
  → /setup:build-tech       (stack, padrões, ADRs)
  → /setup:build-business   (produto, personas, contexto)

Prosseguindo...
```

ADR enforcement e GATE-2 são desativados automaticamente em Bootstrap Mode — agents não tentam ler docs/ que não existe.

**Modo Solo sem bootstrap (`mode: solo` e `company.md` existe):**
```
⚠️  GATE-0 (modo solo) — Documentação de projeto ausente
docs/ não contém documentação técnica ou de negócio.
Os agents vão operar com contexto limitado — outputs podem ser menos específicos.

Recomendado (a qualquer momento):
  → /setup:build-business
  → /setup:build-tech

Prosseguindo em modo solo com contexto mínimo...
```

**Falha de framework:** Liste os arquivos faltantes e pare.

---

### GATE-1 — Configuração do Squad

**Quando usar:** Após criação do squad, antes do primeiro step real.

**Verifica:**
- [ ] squad.yaml tem `name`, `domain`, `description` preenchidos
- [ ] squad.yaml tem `feature` e `session` preenchidos (obrigatório no modelo v2)
- [ ] Todos os agents listados em squad.yaml têm arquivo .agent.md correspondente
- [ ] Pipeline referenciado em squad.yaml existe

**Falha:** Informe o campo ou arquivo faltante e pare.

---

### GATE-2 — Contexto Completo

**Quando usar:** Antes de steps de implementação/execução (após discovery).

**Verifica:**
- [ ] Objetivo do squad está claro (description no squad.yaml)
- [ ] Ao menos um documento de contexto existe em `docs/` (raiz do projeto)
- [ ] `docs/.squads/sessions/{feature-slug}/memories.md` foi lido e considerado
- [ ] Se `context.md` existe na session, foi carregado no contexto do agent

**Falha:** Informe o que está incompleto. Sugira executar o step de investigação (pré-execução) primeiro.

---

### GATE-3 — Qualidade do Output

**Quando usar:** Antes de steps de revisão ou handoff.

**Verifica (com base nas veto_conditions do step anterior):**
- [ ] Output não está vazio
- [ ] Output atende os critérios mínimos do agent (Quality Criteria do .agent.md)
- [ ] Nenhuma veto_condition foi violada

**Falha:** Aponte a condição violada. Retorne ao step anterior.

---

### GATE-4 — Consistência de Documentação (Produto)

**Quando usar:** Exclusivo para squad de Produto, antes do handoff.

**Verifica (na session folder `docs/.squads/sessions/{feature-slug}/`):**
- [ ] `context.md` existe e não está vazio
- [ ] `architecture.md` ou `spec.md` existe com critérios de aceite
- [ ] `plan.md` existe (se pipeline gerou)
- [ ] `review-notes.md` existe
- [ ] `state.json` tem entrada para este squad com todos os steps concluídos

**Falha:** Liste os documentos faltantes na session. Não libere o handoff.

---

### GATE-DECISION — Bloqueio de Decisões Autônomas

**Quando usar:** Após cada step com `execution: subagent` ou `execution: inline`. Aplicado automaticamente pelo pipeline-runner antes de aceitar qualquer output.

**Princípio:** Nenhum agent pode tomar decisões além do escopo definido no step. Toda decisão deve ser sinalizada e aprovada pelo usuário.

**O que é considerado uma decisão:**
- Escolha de biblioteca, framework ou ferramenta não especificada no step
- Definição de estrutura de dados, schema ou interface não solicitada
- Escolha de padrão arquitetural (MVC, CQRS, Event Sourcing, etc.) não documentada em ADR
- Escolha de biblioteca de componentes UI não especificada no step
- Desvio de padrão documentado no design system sem justificativa
- Escolha de padrão de interação (ex: modal vs. drawer, inline edit vs. form separado) não documentada
- Qualquer "assumindo que..." ou "optei por..." no output

**Como o agent deve sinalizar:**

Quando o agent identifica que precisa tomar uma decisão além do escopo, ele **para** e inclui no output:

```
[DECISÃO PENDENTE] {id-sequencial}
Contexto: {por que essa decisão é necessária}
Opções:
  A) {opção A} — {prós/contras}
  B) {opção B} — {prós/contras}
Recomendação do agent: {opção recomendada e por quê}
Aguardando aprovação para prosseguir.
```

**Verifica:**
- [ ] O output **não** contém decisões implícitas (sem `[DECISÃO PENDENTE]` quando deveria ter)
- [ ] Cada `[DECISÃO PENDENTE]` foi aprovada pelo usuário antes de o agent prosseguir
- [ ] O agent não escolheu unilateralmente entre as opções sem aprovação

**Falha — Decisão implícita detectada:**
```
🚫 GATE-DECISION — FALHA: Decisão autônoma detectada

O agent tomou a seguinte decisão sem aprovação:
"{trecho do output}"

O agent não pode prosseguir com esta decisão.
Reexecutando step com instrução: sinalizar como [DECISÃO PENDENTE].
```

**Falha — Decisão pendente não resolvida:**
```
⏸ GATE-DECISION — AGUARDANDO: Decisão pendente

[DECISÃO PENDENTE] {id}
{conteúdo da decisão pendente}

Selecione uma opção para continuar:
- A) {opção A}
- B) {opção B}
- ✏️ Definir outra opção
```

Aguarde a seleção do usuário. **Nunca resolva automaticamente.**

---

### GATE-ADR — Conformidade com ADRs (Implementação Guiada por ADRs)

**Quando usar:** Obrigatório antes de qualquer step de implementação (`execution: subagent` ou `execution: inline`) quando o projeto tem ADRs em `docs/`.

**Verifica:**
- [ ] O agent leu todas as ADRs disponíveis em `docs/` (arquivos com `ADR`, `adr`, `decisions`, `architecture-decision` no nome ou caminho)
- [ ] O output do step lista explicitamente quais ADRs foram consultadas
- [ ] Nenhuma decisão técnica no output contradiz uma ADR com status `Aceito` ou `Ativo`
- [ ] Se o step CRIA uma nova ADR, ela segue o template padrão (Contexto / Decisão / Alternativas / Consequências)

**Resultado esperado:** Código e documentação conformes com ADRs desde o início — não como revisão posterior.

**Falha — Conflito detectado:**
```
🚫 GATE-ADR — FALHA: Conflito com ADR existente

ADR violada: {adr-id} — {título}
Decisão conflitante no output: {trecho}
Status da ADR: Aceito

O agent não pode prosseguir com decisões que contradizem ADRs aprovadas.
Opções:
  - Revise o output para seguir a ADR
  - Proponha uma nova ADR para substituir a existente (requer aprovação do usuário)
```

**Falha — ADRs não consultadas:**
```
⚠️  GATE-ADR — AVISO: ADRs não referenciadas no output

ADRs disponíveis não foram listadas pelo agent.
Reexecutando step com instrução explícita de consulta às ADRs.
```

**Falha — Decisão sem ADR correspondente:**
```
⚠️  GATE-ADR — AUSÊNCIA: Decisão arquitetural sem ADR

O output contém decisão de alto impacto sem ADR correspondente:
"{trecho da decisão}"

Opções:
  - Crie uma nova ADR para documentar esta decisão antes de prosseguir
  - Use [DECISÃO PENDENTE] para aguardar aprovação do usuário

Decisões que requerem ADR: escolha de framework, banco de dados, padrão arquitetural,
estratégia de cache, política de autenticação, estrutura de dados principal.
```

---

### GATE-DESIGN — Conformidade com Design System e Acessibilidade

**Quando usar:** Em steps de frontend/produto que geram especificações de componente, fluxos de UI ou documentação visual. Aplicado automaticamente em steps onde o agent tem `tasks` contendo `design-system`, `component-spec` ou `ux-review`.

**Verifica:**
- [ ] Todos os estados de componente especificados: default, hover, focus, disabled, loading, error
- [ ] Contraste de texto ≥ 4.5:1 (WCAG 2.1 AA) — valor numérico declarado no output
- [ ] Estado vazio (`empty state`) documentado para listas e views de dados
- [ ] Estado de erro com mensagem clara e ação de recuperação
- [ ] Componentes novos justificados — existência verificada no design system antes de propor novo
- [ ] Responsividade: breakpoints mobile e desktop definidos (se aplicável ao componente)
- [ ] Tokens de design usados (sem valores hardcoded de cor, espaçamento ou tipografia)

**Output esperado:** Seção `## Verificação GATE-DESIGN` no arquivo de spec com cada item marcado como `✅` ou `⚠️ Justificativa`.

**Falha — estados faltando:**
```
🚫 GATE-DESIGN — FALHA: Estados de componente incompletos

Componente(s) com estados faltando:
  ✗ {componente}: falta {estados ausentes}

Todo componente interativo deve ter todos os 6 estados especificados.
Adicione os estados antes de prosseguir.
```

**Falha — contraste:**
```
🚫 GATE-DESIGN — FALHA: Contraste insuficiente ou não verificado

Requisito: ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande (WCAG 2.1 AA)
Pendente: {lista de elementos sem contraste declarado}

Declare o ratio de contraste ou ajuste as cores.
```

**Falha — componente não justificado:**
```
⚠️  GATE-DESIGN — AVISO: Componente novo sem verificação de design system

Componente(s) propostos sem verificação se existem no design system:
  ? {nome do componente}

Verifique se já existe antes de propor. Se não existe, documente a justificativa.
```

**Gate passando:**
```
✅ GATE-DESIGN — Design System e Acessibilidade: aprovado
```

---

### GATE-5 — Entrega / Handoff

**Quando usar:** Último step de qualquer pipeline antes de marcar como completed.

**Verifica:**
- [ ] Todos os `output_file` definidos no pipeline foram gerados em `docs/.squads/sessions/{feature-slug}/`
- [ ] `state.json` marca `state.squads["{squad-slug}"].completed_steps` com todos os steps do pipeline
- [ ] Não há veto_conditions pendentes
- [ ] Não há `[DECISÃO PENDENTE]` não resolvida nos arquivos da session

**Falha:** Liste o que está faltando. Não marque o squad como completed.

---

## COMO USAR NOS PIPELINES

No `pipeline.yaml`, adicione `gate:` em um step:

```yaml
steps:
  - id: gate-contexto
    name: "Validar Contexto"
    execution: checkpoint
    gate: GATE-2
    # Não tem agent — é validação automática

  - id: implementacao
    name: "Implementar Feature"
    agent: rodrigo-react
    depends_on: [gate-contexto]
    ...
```

Ou como validação inline antes de continuar um step:

```yaml
  - id: spec-final
    name: "Spec Final"
    agent: priscila-produto
    gate: GATE-4    # Gate executado ANTES de aceitar o output
    ...
```

---

## VETO CONDITIONS vs GATES

| | Veto Conditions | Gates |
|--|----------------|-------|
| **Escopo** | Output de um step específico | Marco estrutural do pipeline |
| **Foco** | Qualidade do conteúdo gerado | Existência e consistência de artefatos |
| **Retentativa** | Automática (até 2x) | Bloqueia até usuário resolver |
| **Exemplo** | "Output sem critérios de aceite" | "Todos os docs de handoff existem" |

---

## MENSAGENS DE GATE

**Gate passando:**
```
✅ GATE-{N} — {nome}: aprovado
```

**Gate falhando:**
```
🚫 GATE-{N} — {nome}: FALHA

Motivo: {descrição específica}
Itens faltantes:
  ✗ {item 1}
  ✗ {item 2}

Resolva e execute novamente.
```
