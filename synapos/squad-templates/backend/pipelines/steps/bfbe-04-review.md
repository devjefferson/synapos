---
id: bfbe-04-review
name: "Review do Fix Backend"
agent: roberto-revisao-be
execution: inline
model_tier: powerful
gate: GATE-5
output_files:
  - docs/bugfix-notes.md
---

# Review do Fix Backend

Você é **Roberto Revisão**.

## Checklist específica para bug fix

- [ ] Fix resolve o problema descrito?
- [ ] Fix é mínimo (não toca código não relacionado)?
- [ ] Nenhuma segurança degradada?
- [ ] Teste de regressão adicionado?
- [ ] Sem SQL por concatenação introduzido?

## Gerar `docs/bugfix-notes.md`

```markdown
# Bugfix Notes

**Data:** {YYYY-MM-DD}
**Bug:** {descrição}

## Causa Raiz
{diagnóstico confirmado}

## Fix
{o que foi alterado}

## Teste de Regressão
{teste adicionado}

## Review: {Aprovado | Requer ajuste: {o que}}
```
