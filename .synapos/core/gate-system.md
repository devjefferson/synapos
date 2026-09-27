---
name: synapos-gate-system
version: 3.0.0
description: Quality gates — validação em pontos críticos do pipeline
---

# SYNAPOS GATE SYSTEM v3.0.0

> Gate só existe se produz uma verificação concreta sobre um artefato. **Fail loud, never silent.**
> Máximo 2 reexecuções automáticas por gate; na 3ª falha → escale ao usuário.

---

## ATIVAÇÃO POR TRACK

| Gate | quick | standard | complex |
|---|---|---|---|
| GATE-0 integridade | ✅ | ✅ | ✅ |
| GATE-3a estrutura (se `output_schema`) | ✅ | ✅ | ✅ |
| GATE-3 qualidade + vetos | ✅ | ✅ | ✅ |
| GATE-3b critérios de sucesso (se `success_criteria`) | — | ✅ | ✅ |
| GATE-DECISION sinais de controle | ✅ | ✅ | ✅ |
| GATE-ADR | ✅ (se o índice tem ADR relevante) | ✅ | ✅ |
| GATE-HANDOFF | — | ✅ (se o step declara) | ✅ |
| GATE-5 conclusão | ✅ | ✅ | ✅ |

Ordem por step: `GATE-3a → GATE-3 (+vetos) → GATE-3b → GATE-DECISION → GATE-ADR → GATE-HANDOFF`.

---

## GATE-0 — Integridade

**Bloqueia** (framework quebrado):
- `.synapos/core/orchestrator.md` e `.synapos/core/pipeline-runner.md` existem
- `docs/_memory/company.md` existe
- `.synapos/squads/{slug}/squad.yaml` existe e `agents/` tem ao menos um `.agent.md`

**Avisa, nunca bloqueia** (contexto de projeto):
- `docs/tech-context/`, `docs/business/`, ADRs ou `roles/{domain}.md` ausentes → `⚠️ [GATE-0] {item} ausente — {efeito}. Para gerar: /setup:discover`
- Arquivo de conhecimento stale pelos `sources` (context-engine §5.2) → `⚠️ [GATE-0] {arquivo} possivelmente desatualizado — atualização incremental quando usado`

Falta de documentação nunca impede uma tarefa quick/standard. O efeito é o Context Brief registrar a lacuna.

---

## GATE-3a — Estrutura do output

Ativo quando o step declara `output_schema`. Verifica cada `required_sections` (`## Título`) e cada `formats.pattern`.

```
🚫 GATE-3a — seção obrigatória ausente: "{seção}" | formato inválido em {field}: esperado {pattern}
```

---

## GATE-3 — Qualidade mínima + vetos

Verifica:
- output não vazio, não placeholder (`TODO`, `PLACEHOLDER`, `[...]`, `{preencher}`)
- nenhuma `veto_condition` do step violada
- **criação sem justificativa de reuso**: novo arquivo/componente/módulo/abstração sem citar o que foi procurado e por que não serve (compliance-protocol §2) = veto
- **afirmação sem evidência**: fato sobre o projeto, métrica, citação ou valor de design não rastreável a arquivo lido ou ao usuário = veto

```
🚫 GATE-3 — {output vazio | placeholder | veto: {condição} | criação sem justificativa | afirmação sem evidência}
```

---

## GATE-3b — Critérios de sucesso

Ativo quando o `.md` do step tem `success_criteria` no frontmatter. Cada critério é binário (✅/❌), avaliado semanticamente.

> Veto = output errado. Success criteria = output incompleto.

---

## GATE-DECISION — Sinais de controle

Detecta no output os sinais de `compliance-protocol.md` §3:

| Detectado | Ação do runner |
|---|---|
| `[DECISÃO PENDENTE]` / `[?]` | Apresenta opções ao usuário (AskUserQuestion), aguarda, reexecuta o step com a decisão aprovada |
| `[CONTEXT_REQUIRED]` | Resolve a lacuna (lê o arquivo, consulta memória ou pergunta ao usuário) e reexecuta |
| `[ADR-CONFLICT]` | Bloqueia — fluxo de `adr-standard.md` §4 |
| `[SKILL-CONFLICT]` | Apresenta skill × regra, aguarda decisão |
| `[STALE]` / `[CONFLICT]` | Registra para atualização de memória no final; `[CONFLICT]` normativo pergunta antes de seguir |
| Decisão implícita não coberta pela ordem de autoridade ("optei por", "assumindo que", lib nova não citada) | Reexecuta 1× pedindo sinalização explícita |

Nunca resolva um sinal automaticamente.

---

## GATE-ADR — Conformidade arquitetural

Ativo em steps de arquitetura, implementação e review quando `adr-index.md` tem ADR relevante para o domínio/escopo.

- `ADR CHECK` presente e coerente com o índice → ✅
- ADR relevante ausente do check → reexecuta com a ADR injetada
- `Conformidade: NÃO` sem `[ADR-CONFLICT]` → 🚫 bloqueia (não existe violação silenciosa)

---

## GATE-HANDOFF — Completude do handoff entre roles

Ativo em steps de handoff (produto → dev, arquitetura → dev). O artefato precisa conter, com conteúdo real:

```
Problema · Objetivo · Escopo IN/OUT · Requisitos funcionais · Regras de negócio
Critérios de aceite (Dado/Quando/Então) · Decisões de UX · Restrições técnicas · Contexto relevante · Questões abertas
```

Seção sem informação → `[A DEFINIR: quem decide]`, nunca vazia nem inventada. `Critérios de aceite` ausentes = 🚫.

Aliases legados: `GATE-2` e `GATE-4` = GATE-HANDOFF.

---

## LABELS DE CHECKPOINT

Não validam — pausam para aprovação humana (`execution: checkpoint`):

- `GATE-CONTEXT` — revisar context.md
- `GATE-ARCH` — revisar architecture.md
- `GATE-DESIGN` — revisar visual-spec.md (vetos do step de visual-spec)

Checkpoint com `gate:` sempre executa, mesmo em `mode: solo`.

---

## GATE-5 — Conclusão

Marcador de fim de ciclo. Nunca bloqueia, nunca pergunta. Emite:

```
✅ Pipeline concluído — {squad} · {feature}
   Arquivos na session: {lista}
⚠️ Pendências: {lista, se houver}
```
