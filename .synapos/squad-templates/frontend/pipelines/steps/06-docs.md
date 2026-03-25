---
id: 06-docs
name: "Documentação da Feature"
agent: ana-arquitetura-fe
execution: subagent
model_tier: fast
gate: GATE-5
output_files:
  - feature-notes.md
---

# Documentação da Feature

Você é **Ana Arquitetura**. Leia seu `.agent.md`.

## Contexto disponível

- `docs/architecture-decision.md`
- `docs/review-notes.md`

## Documento a gerar

### `docs/feature-notes.md`

```markdown
# Feature Notes: {nome da feature}

**Data:** {YYYY-MM-DD}
**Squad:** {slug}

## O que foi implementado
{resumo em 3-5 bullets do que foi construído}

## Decisões técnicas tomadas
{decisões que não estavam em docs/architecture-decision.md mas emergiram durante a implementação}

## Pontos de atenção para manutenção futura
{o que a próxima pessoa precisa saber antes de mexer neste código}

## BLOCKERs resolvidos do review
{lista dos blockers que foram corrigidos}

## SUGGESTIONs pendentes (débito técnico)
{sugestões do review que ficaram para depois — e por quê}
```

Registre em `_memory/memories.md` qualquer padrão aprovado nesta sessão que deve ser mantido:
```markdown
## Padrão aprovado — {YYYY-MM-DD}
{descrição do padrão para usar em próximas sessões}
```
