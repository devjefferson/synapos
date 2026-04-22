---
id: qf-04-registrar
name: "Registrar Decisão"
execution: inline
model_tier: fast
output_files:
  - quick-fix-log.md
gate: GATE-5
---

# Registrar Decisão

Consolide o quick fix para memória futura.

Crie `docs/.squads/sessions/{feature-slug}/quick-fix-log.md`:

```markdown
# Quick Fix Log
Data: {YYYY-MM-DD}
Objetivo: {resumo em 1 linha}

O que foi feito: {2-3 frases}
Decisão técnica: {por que esta abordagem}
Impacto: {o que isso afeta no sistema}
```

Adicione entrada em `docs/.squads/sessions/{feature-slug}/memories.md` dentro do bloco `<!-- RECENTES -->`:

```markdown
## [{squad-slug} · {agent-id}] — {YYYY-MM-DD}
Quick Fix: {objetivo em 1 linha}
Abordagem: {decisão técnica em 1 frase}
```

Pipeline concluído.
