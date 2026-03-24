---
name: synapos-gate-system
version: 1.0.0
description: Sistema de quality gates — validação em pontos críticos do pipeline
---

# SYNAPOS GATE SYSTEM v1.0.0

> Gates são pontos de validação obrigatórios. Falha em um gate bloqueia o avanço.
> Princípio: **Fail Loud, Never Silent** — nunca ignore uma falha de gate.

---

## GATES DISPONÍVEIS

Use `gate:` nos steps do pipeline.yaml para ativar um gate antes de continuar.

---

### GATE-0 — Integridade do Framework

**Quando usar:** No primeiro step de qualquer pipeline.

**Verifica:**
- [ ] `synapos/core/orchestrator.md` existe
- [ ] `synapos/core/pipeline-runner.md` existe
- [ ] `synapos/_memory/company.md` existe
- [ ] `synapos/_memory/preferences.md` existe
- [ ] `synapos/squads/{slug}/squad.yaml` existe
- [ ] `synapos/squads/{slug}/agents/` tem pelo menos um .agent.md

**Falha:** Liste os arquivos faltantes e pare.

---

### GATE-1 — Configuração do Squad

**Quando usar:** Após criação do squad, antes do primeiro step real.

**Verifica:**
- [ ] squad.yaml tem `name`, `domain`, `description` preenchidos
- [ ] Todos os agents listados em squad.yaml têm arquivo .agent.md correspondente
- [ ] Pipeline referenciado em squad.yaml existe

**Falha:** Informe o campo ou arquivo faltante e pare.

---

### GATE-2 — Contexto Completo

**Quando usar:** Antes de steps de implementação/execução (após discovery).

**Verifica:**
- [ ] Objetivo do squad está claro (description no squad.yaml)
- [ ] Ao menos um documento de contexto existe em `synapos/squads/{slug}/docs/`
- [ ] memories.md foi lido e considerado

**Falha:** Informe o que está incompleto. Sugira executar o step de discovery primeiro.

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

**Verifica:**
- [ ] `docs/product-vision.md` existe e não está vazio
- [ ] `docs/spec.md` existe e tem critérios de aceite
- [ ] `docs/architecture.md` existe
- [ ] `docs/decisions-log.md` existe
- [ ] `docs/handoff-checklist.md` existe

**Falha:** Liste os documentos faltantes. Não libere o handoff.

---

### GATE-5 — Entrega / Handoff

**Quando usar:** Último step de qualquer pipeline antes de marcar como completed.

**Verifica:**
- [ ] Todos os `output_file` definidos no pipeline foram gerados
- [ ] state.json marca todos os steps como completos
- [ ] Não há veto_conditions pendentes

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
