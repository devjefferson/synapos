---
name: synapos-gate-system
description: Sistema de quality gates — validação em pontos críticos do pipeline
---

# SYNAPOS GATE SYSTEM v2.3.0

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

### GATE-3a — Validação Estrutural do Output

**Quando usar:** Após cada step com `execution: subagent` ou `execution: inline` que declara `output_schema` no `pipeline.yaml`. Executa **antes** do GATE-3.

**Propósito:** Validar estrutura do output (seções obrigatórias, formatos) com mensagem precisa antes de qualquer validação semântica. Falha estrutural é um defeito distinto de falha de qualidade.

**Verifica (conforme `output_schema` do step):**
- [ ] Cada seção em `required_sections` existe no output (`## Título` ou `# Título`)
- [ ] Campos com `pattern` definido em `formats` correspondem ao regex esperado

**Falha de seção ausente:**
```
🚫 GATE-3a — estrutura inválida

Seção obrigatória ausente: "## Meta"
Output deve conter todas as seções: {lista de required_sections}
Reexecutando step com instrução explícita de formato...
```

**Falha de formato:**
```
🚫 GATE-3a — formato inválido

Campo: ## Meta
Esperado: corresponder a "Permitir .+ para que .+"
Encontrado: "Melhorar a experiência de login" (não satisfaz o padrão)
Reexecutando step com instrução de formato...
```

Máximo 2 reexecuções automáticas. Na 3ª falha → escale para o usuário.

**Gate passando:**
```
✅ GATE-3a — estrutura válida ({N} seções confirmadas)
```

> **Regra:** Steps sem `output_schema` pularão este gate silenciosamente. Nunca log para steps sem schema.

---

### GATE-3 — Qualidade Mínima do Output

**Quando usar:** Após cada step com `execution: subagent` ou `execution: inline`. Executa após GATE-3a (se aplicável).

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

### GATE-3b — Critérios de Sucesso

**Quando usar:** Após GATE-3, apenas para steps cujo arquivo `.md` contém `success_criteria` no frontmatter YAML.

**Propósito:** Validar se o output atingiu os objetivos do step (não apenas se é não-vazio ou não-placeholder). `success_criteria` são definidos pelo autor do step, não pelo pipeline.

**Frontmatter de step com success_criteria:**
```yaml
---
id: 03-investigacao
name: "Investigação"
success_criteria:
  - "context.md contém seção ## Meta com frase mensurável (verbo + ator + resultado)"
  - "context.md contém no mínimo 3 itens em ## Regras Críticas do Projeto"
  - "Todas as perguntas de clarificação foram respondidas antes de gerar o arquivo"
---
```

**Avaliação:** O pipeline-runner verifica cada critério contra o output. Critérios são avaliados semanticamente (não apenas por presença de string).

**Falha:**
```
🚫 GATE-3b — critério de sucesso não atendido

Critério: "context.md contém seção ## Meta com frase mensurável"
Output atual: ## Meta contém "Melhorar login" (não mensurável — falta verbo + ator + resultado)

Reexecutando step com feedback...
```

Máximo 2 reexecuções automáticas com feedback específico do critério não atendido. Na 3ª falha → escale para o usuário.

**Gate passando:**
```
✅ GATE-3b — {N}/{N} critérios atendidos
```

> **Diferença de veto_conditions vs success_criteria:**
> `veto_conditions` (pipeline.yaml) = "o output é inválido se..." (bloqueador binário, sem gradação).
> `success_criteria` (step .md frontmatter) = "o output está completo quando..." (checklist de entrega).
> Veto = output errado. Success = output incompleto.

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

  - id: investigacao
    name: "Investigação"
    agent: lead-engineer
    depends_on: [gate-integridade]
    output_files:
      - context.md
    output_schema:                          # → ativa GATE-3a
      required_sections:
        - "## Motivação"
        - "## Meta"
        - "## Regras Críticas do Projeto"
      formats:
        - field: "## Meta"
          pattern: "Permitir .+ para que .+"
    veto_conditions:                        # → ativa GATE-3 (semântico)
      - "context.md sem Meta mensurável"
    # success_criteria definidos no arquivo do step (.md frontmatter) → ativa GATE-3b

  - id: implementacao
    name: "Implementar Feature"
    agent: backend-dev
    depends_on: [investigacao]
    gate: GATE-3
    veto_conditions:
      - "output sem código implementado"
    needs_full_output_of: investigacao      # injeta context.md completo (não só HANDOFF)
```

### Ordem de execução de gates por step

| Gate | Condição de ativação | Ordem |
|------|---------------------|-------|
| GATE-3a | `output_schema` declarado no pipeline.yaml | 1º |
| GATE-3 | Step com `execution: subagent` ou `inline` | 2º |
| GATE-3b | `success_criteria` no frontmatter do .md do step | 3º |
| GATE-DECISION | Output contém decisão autônoma ou `[DECISÃO PENDENTE]` | 4º |
| GATE-ADR | ADRs existem e modo complete ativo | 5º |
| Veto conditions | `veto_conditions` declaradas no pipeline.yaml | 6º (dentro do GATE-3) |

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
