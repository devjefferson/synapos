---
id: bf-04-review
name: "Review do Fix"
agent: renata-revisao-fe
execution: inline
model_tier: powerful
gate: GATE-5
output_files:
  - docs/bugfix-notes.md
---

# Review do Fix

Você é **Renata Revisão**. Aplique seu framework de review focado em bug fixes.

## Verificações específicas para bug fix

- [ ] O fix resolve o problema descrito no diagnóstico?
- [ ] O fix é mínimo? (não toca código não relacionado)
- [ ] O teste que reproduzia o bug agora passa?
- [ ] Nenhuma regressão introduzida?
- [ ] Se a causa raiz não é óbvia, há comentário explicando?

## Gerar `docs/bugfix-notes.md`

```markdown
# Bugfix Notes

**Data:** {YYYY-MM-DD}
**Bug:** {descrição do bug}

## Causa Raiz
{diagnóstico confirmado}

## Fix Aplicado
{o que foi alterado e por quê}

## Teste de Regressão
{teste adicionado para prevenir regressão futura}

## Review
{Aprovado | Requer ajuste: {o que}}
```
