---
name: synapos-gate-system
description: Sistema de quality gates — validação em pontos críticos do pipeline
---

# SYNAPOS GATE SYSTEM v2.0.0

> Gates são pontos de validação obrigatórios. Falha em um gate bloqueia o avanço.
> Princípio: **Fail Loud, Never Silent** — nunca ignore uma falha de gate.

---

## GATES DISPONÍVEIS

Três gates ativos. Nada mais.

---

### GATE-0 — Integridade do Framework

**Quando usar:** No primeiro step de qualquer pipeline. **Obrigatório.**

**Verifica:**
- [ ] `.synapos/core/orchestrator.md` existe
- [ ] `.synapos/core/pipeline-runner.md` existe
- [ ] `docs/_memory/company.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe
- [ ] `.synapos/squads/{slug}/agents/` tem pelo menos um `.agent.md`

**Se modo Completo:** adicionalmente verifica se `docs/` existe com pelo menos 1 arquivo `.md`.

**Falha de framework (qualquer modo):** liste os arquivos faltantes e pare.

**Modo Rápido — docs ausentes:**
```
⚡ GATE-0 (Modo Rápido) — executando sem documentação de projeto.
   Para resultados melhores: execute /setup:build-tech e /setup:build-business
Prosseguindo...
```

**Modo Completo — docs presentes:**
```
✅ GATE-0 — aprovado
```

---

### GATE-3 — Qualidade Mínima do Output

**Quando usar:** Após cada step com `execution: subagent` ou `execution: inline`.

**Verifica:**
- [ ] Output não está vazio
- [ ] Output tem mais de 50 caracteres
- [ ] Output não é placeholder (`TODO`, `PLACEHOLDER`, `[vazio]`, `[...]`)
- [ ] Nenhuma `veto_condition` do step foi violada

**Falha:**
```
🚫 GATE-3 — output inválido

Motivo: {output vazio | placeholder | veto violado}
Reexecutando step...
```

Máximo 2 reexecuções automáticas. Na 3ª falha → escale para o usuário.

**Gate passando:**
```
✅ GATE-3 — output aprovado
```

---

### GATE-5 — Entrega / Handoff

**Quando usar:** Último step de qualquer pipeline antes de marcar como `completed`.

**Comportamento:** apenas confirmação visual. **Nunca bloqueia.**

**Se tudo OK:**
```
✅ GATE-5 — Pronto para entrega
   Squad pode ser marcado como completed.
```

**Se itens pendentes (warning, não bloqueia):**
```
⚠️  GATE-5 — Itens pendentes detectados:
   {lista}
   Squad será finalizado mesmo assim.
```

---

## DECISÕES NO OUTPUT

Não existe mais GATE-DECISION como gate bloqueante.

Quando um agent precisar tomar uma decisão além do escopo do step, ele deve sinalizar no output com `[?]`:

```
[?] Decisão necessária: {descrição curta}
Opções: A) {opção A}  B) {opção B}
Recomendação: {opção e motivo}
```

O pipeline-runner detecta `[?]` no output e apresenta ao usuário para resolução antes de prosseguir. Não reexecuta o step — apenas aguarda a escolha e continua com ela como contexto.

---

## COMO USAR NOS PIPELINES

```yaml
steps:
  - id: gate-integridade
    name: "Verificar Integridade"
    execution: checkpoint
    gate: GATE-0

  - id: implementacao
    name: "Implementar Feature"
    agent: backend-dev
    depends_on: [gate-integridade]
    gate: GATE-3
    veto_conditions:
      - "output sem código implementado"
```

---

## MENSAGENS PADRÃO

**Gate passando:**
```
✅ GATE-{N} — aprovado
```

**Gate falhando:**
```
🚫 GATE-{N} — FALHA

Motivo: {descrição específica}
Itens faltantes:
  ✗ {item 1}
  ✗ {item 2}

Resolva e execute novamente.
```
