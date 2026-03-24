---
id: dm-05-review
name: "Review da Migration"
agent: roberto-revisao-be
execution: inline
model_tier: powerful
gate: GATE-5
output_files:
  - docs/migration-review.md
---

# Review da Migration

Você é **Roberto Revisão**. Foque em segurança de dados e reversibilidade.

## Checklist específica para migrations

- [ ] Migration é transacional (BEGIN/COMMIT)?
- [ ] DOWN (rollback) documentado e executável?
- [ ] ALTER TABLE com dados existentes tem tratamento?
- [ ] Nenhuma coluna NOT NULL adicionada sem DEFAULT em tabela com dados?
- [ ] FKs têm ON DELETE definido?
- [ ] Índices têm justificativa?
- [ ] Nome da migration é descritivo?

## Gerar `docs/migration-review.md`

```markdown
# Migration Review

**Data:** {YYYY-MM-DD}

## Checklist
{resultado de cada item}

## Riscos Identificados
{se houver: descreva o risco e a mitigação}

## Decisão
{Aprovado para staging | Requer ajuste: {o que}}

## Recomendações de Deploy
{ordem de execução se múltiplas migrations, backfill necessário, etc.}
```
