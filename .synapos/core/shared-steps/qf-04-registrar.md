---
id: qf-04-registrar
name: "Registrar"
execution: inline
model_tier: fast
output_files:
  - quick-fix-log.md
gate: GATE-5
---

# Registrar

Crie `{session}/quick-fix-log.md`:

```markdown
# Quick Fix Log
Data: {YYYY-MM-DD}
Objetivo: {1 linha}
O que foi feito: {2–3 frases}
Arquivos: {lista}
Decisão técnica: {por que esta abordagem}
```

Memória: registre **somente** se passou no filtro de context-engine §4.1 (algo que será útil de novo e que o código não mostra — uma armadilha, uma regra confirmada, um feedback do usuário), com `why` e `how`. Use o formato de entrada tipada e o destino por escopo (§4.2). Nada durável → não grave.

Pipeline concluído.
