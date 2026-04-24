---
id: 06-review
name: "Code Review Mobile"
agent: renata-revisao-fe
execution: inline
model_tier: powerful
output_files:
  - review-notes.md
gate: GATE-5
---

# Code Review Mobile

**Agent:** Renata Revisão 🔍

## Escopo

> Use a stack definida em `docs/_memory/stack.md` para referências de performance e tipagem.

- Qualidade do código e componentes
- Tratamento de estados (loading/error/empty/success)
- Performance (virtualização de listas, memoization quando aplicável)
- Tipagem segura (sem tipos genéricos não justificados)
- Padrões de plataforma respeitados (iOS/Android quando relevante)

## Formato

Use: `BLOCKER:` / `SUGGESTION:` / `QUESTION:` / `PRAISE:`
Salve em `docs/.squads/sessions/{feature-slug}/review-notes.md`
