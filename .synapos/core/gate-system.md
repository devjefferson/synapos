---
name: synapos-gate-system
description: Sistema de quality gates — validação em pontos críticos do pipeline
---

# SYNAPOS GATE SYSTEM v2.1.0

> Gates são pontos de validação obrigatórios. Falha em um gate bloqueia o avanço.
> Princípio: **Fail Loud, Never Silent** — nunca ignore uma falha de gate.

---

## GATES DISPONÍVEIS

Dois gates de validação automática + dois labels de checkpoint + um marcador de conclusão.

---

### GATE-0 — Integridade do Framework

**Quando usar:** No primeiro step de qualquer pipeline. **Obrigatório.**

**Verifica existência:**
- [ ] `.synapos/core/orchestrator.md` existe
- [ ] `.synapos/core/pipeline-runner.md` existe
- [ ] `docs/_memory/company.md` existe
- [ ] `.synapos/squads/{slug}/squad.yaml` existe
- [ ] `.synapos/squads/{slug}/agents/` tem pelo menos um `.agent.md`

**Verifica frescor da session (aviso, não bloqueia):**
- [ ] `docs/.squads/sessions/{feature-slug}/session.manifest.json` existe
- [ ] `context.md` foi atualizado há menos de 14 dias (verificar `files.context.md.loaded_at` no manifest)

Se session.manifest.json não existe → aviso: `⚠️ [GATE-0] session.manifest.json ausente — manifest será criado na inicialização`
Se context.md está stale (> 14 dias desde loaded_at) → aviso:
```
⚠️ [GATE-0] context.md pode estar desatualizado
   Última atualização: {loaded_at do manifest}
   Recomendação: revise context.md antes de prosseguir ou continue com context.snapshot
Prosseguindo mesmo assim...
```

> **Regra:** Frescor é aviso, não bloqueio. O sistema confia no usuário para avaliar se o contexto ainda é válido.

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

---

## LABELS DE CHECKPOINT (usados no pre-execution pipeline)

Não são gates de validação automática — são labels descritivos em steps `execution: checkpoint` que pausam para aprovação do usuário. O pipeline-runner exibe o checkpoint e aguarda confirmação.

### GATE-CONTEXT — Aprovação do Contexto

**Quando usar:** Checkpoint após geração de `context.md` no pre-execution pipeline.

**Comportamento:** pausa e exibe `context.md` para revisão. Usuário aprova, ajusta ou pula.

```
⏸ CHECKPOINT [GATE-CONTEXT]: Contexto gerado — revise antes de prosseguir.
```

### GATE-ARCH — Aprovação da Arquitetura

**Quando usar:** Checkpoint após geração de `architecture.md` no pre-execution pipeline.

**Comportamento:** pausa e exibe `architecture.md` para revisão. Usuário aprova, ajusta ou pula.
GATE-DESIGN também é verificado neste checkpoint se `visual-spec.md` foi gerado.

```
⏸ CHECKPOINT [GATE-ARCH]: Arquitetura gerada — revise antes de prosseguir.
```

---

## MARCADOR DE CONCLUSÃO

### GATE-5 — Ciclo de Vida: Conclusão

**Quando usar:** Último step de qualquer pipeline ao marcar como `completed`.

**Comportamento:** log automático de conclusão. **Nunca bloqueia. Nunca pede confirmação.**
É um marcador de fim de ciclo, não um gate de validação. O pipeline-runner emite automaticamente.

**Log automático (sempre):**
```
✅ Pipeline concluído — {squad-slug} · {feature-slug}
   Arquivos na session: {lista de output_files}
```

**Se itens pendentes detectados (warning, não bloqueia):**
```
⚠️  Itens pendentes ao concluir:
   {lista}
   Squad marcado como completed mesmo assim.
```

> **Por que não bloqueia:** validação de qualidade já foi feita pelo GATE-3 em cada step.
> GATE-5 existe apenas para consistência de log — não adiciona verificação redundante.

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
