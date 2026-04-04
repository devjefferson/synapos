---
name: synapos-gate-system
version: 1.5.0
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

**Verificação de documentação — leia `execution_mode` do squad.yaml:**

| `execution_mode` | Comportamento se `docs/` ausente ou incompleta |
|---|---|
| `bootstrap` | Passa com aviso — gates GATE-ADR e GATE-2 desativados |
| `standard` | Passa se `company.md` + pelo menos 1 dir de docs existir; avisa sobre gaps |
| `strict` | Exige `company.md` + `docs/tech/` + `docs/business/` — bloqueia se faltar |

---

**BOOTSTRAP — docs ausentes ou incompletas:**
```
⚡ GATE-0 (Bootstrap Mode) — Score de documentação: {doc_score}/100
   Executando com contexto mínimo.

   Gates ativos neste modo: GATE-DECISION
   Desativados: GATE-ADR, GATE-2, GATE-DESIGN

   Para resultados melhores:
   → /setup:build-tech       (+35 pontos de documentação)
   → /setup:build-business   (+40 pontos de documentação)

Prosseguindo...
```

**STANDARD — docs parcialmente presentes:**
```
🟡 GATE-0 (Standard Mode) — Score de documentação: {doc_score}/100
   Contexto parcial. Executando com gates essenciais.

   Gates ativos: GATE-0, GATE-ADR, GATE-DECISION
   Desativados: GATE-DESIGN (requer docs/business completo)

   Documentação faltante:
   {lista de itens ausentes com pontos correspondentes}

Prosseguindo...
```

**STRICT — docs completas:**
```
🔴 GATE-0 (Strict Mode) — Score de documentação: {doc_score}/100
   Contexto completo. Todos os gates ativos.

✅ GATE-0 aprovado
```

**STRICT sem documentação completa — bloqueia:**
```
🚫 GATE-0 — Documentação insuficiente para Strict Mode

Score atual: {doc_score}/100 (mínimo necessário: 70)

Itens faltantes:
  ✗ {item} — {pontos} pontos

Opções:
  → Crie a documentação: /setup:build-tech e /setup:build-business
  → Execute uma tarefa mais simples (reduz para Standard/Bootstrap automaticamente)
```

**Falha de framework (qualquer modo):** Liste os arquivos faltantes do core e pare.

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

**BOOTSTRAP LITE — verificações mínimas:**
- [ ] Output existe e tem > 50 caracteres
- [ ] Output não é só placeholder (TODO, PLACEHOLDER, [vazio])
- [ ] Não contém decisão autônoma sem sinalização

**Falha:** Aponte a condição violada. Retorne ao step anterior.

---

### GATE-4 — Consistência de Documentação (Produto)

**Quando usar:** Exclusivo para squad de Produto, antes do handoff.

**Verifica (na session folder `docs/.squads/sessions/{feature-slug}/`):**

**Existência + Qualidade:**

| Arquivo | Verificação mínima |
|---------|-------------------|
| `context.md` | Existe, > 100 chars, contém pelo menos 2 seções |
| `architecture.md` ou `spec.md` | Existe, > 200 chars, contém "Critérios de aceite" ou "Definition of Done" |
| `plan.md` | Existe (se pipeline gerou), > 50 chars |
| `review-notes.md` | Existe, > 20 chars |
| `state.json` | Entry existe para este squad com `completed_steps` preenchido |

**Verificação de não-placeholder:**
- Arquivo não pode conter apenas "TODO", "PLACEHOLDER", "[vazio]", ou menos de 3 palavras significativas
- Se `context.md` contém apenas títulos (sem conteúdo real) → falha

**Falha:** Liste os documentos que falharam a verificação com o motivo específico. Não libere o handoff.

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

**Nota:** O pipeline-runner pré-carrega as ADRs e injeta no contexto do agent. O agent NÃO precisa ler docs/ manualmente — as ADRs já estão disponíveis. O gate verifica se o output demonstra conformidade.

**Verifica:**
- [ ] O output **menciona** as ADRs relevantes (`[RESPEITADA]` ou `[NÃO APLICÁVEL]`) — isso é prova de que o agent as considerou
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

**Falha — ADRs não mencionadas:**
```
⚠️  GATE-ADR — AVISO: ADRs não mencionadas no output

O output não demonstra que as ADRs foram consideradas.
Inclua [RESPEITADA] ou [NÃO APLICÁVEL] para cada ADR no output.
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

**Verifica (resumo automático — não bloqueia):**
- Pipeline runner já verificou output_files, state.json, veto_conditions e decisões
- GATE-5 é apenas confirmação visual

**Se tudo OK:**
```
✅ GATE-5 — Pronto para entrega
   Squad pode ser marcado como completed.
```

**Se algo pendiente (warning, não bloqueia):**
```
⚠️  GATE-5 — Itens pendentes detectados:
   {lista}
   Squad será finalizado mesmo assim.
```

---

## GATES POR EXECUTION MODE

O pipeline-runner lê `execution_mode` do squad.yaml e ativa apenas os gates correspondentes:

| Gate | BOOTSTRAP | STANDARD | STRICT |
|---|---|---|---|
| GATE-0 | ✅ (passa com aviso) | ✅ | ✅ |
| GATE-1 | ✅ | ✅ | ✅ |
| GATE-2 | ❌ desativado | ✅ | ✅ |
| GATE-3 | ⚡ **LITE** | ✅ | ✅ |
| GATE-4 | ❌ desativado | ❌ desativado | ✅ |
| GATE-5 | ⚡ **LITE** | ✅ | ✅ |
| GATE-ADR | ❌ desativado | ✅ | ✅ |
| GATE-DECISION | ✅ | ✅ | ✅ |
| GATE-DESIGN | ❌ desativado | ❌ desativado | ✅ |

> **GATE-1 e GATE-DECISION são universais** — ativos em todos os modos, sempre.
> **GATE-DECISION nunca é desativado** — evitar decisões autônomas é princípio inegociável.

### BOOTSTRAP — Filosofia

**Meta: 3 minutos do /init à task rodando.**

BOOTSTRAP assume que:
- Task é simples/bem-definida (bug fix, quick fix)
- Usuário sabe o que quer
- Contexto de negócio não é necessário para começar
- O agente precisa de espaço para agir, não de validações pesadas

**GATE-3 LITE em BOOTSTRAP:**
- Verificar: output existe e tem > 50 chars
- Verificar: não é só placeholder ("TODO", "PLACEHOLDER", "[vazio]")
- Verificar: não contém `[DECISÃO PENDENTE]` sem contexto
- **Não aplica:** vetos de qualidade complexos, validações deadr

**GATE-5 LITE em BOOTSTRAP:**
- Verificar: `output_files` do pipeline foram criados
- **Não bloqueia** — apenas avisa se algo está faltando
- Squad é marcado `completed` mesmo com warning

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
