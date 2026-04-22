---
id: qf-02-contexto
name: "Contexto Rápido"
execution: inline
model_tier: fast
---

# Contexto Rápido — Quick Fix

Colete o contexto mínimo necessário antes de executar.

Pergunte ao usuário:

```
O que precisa ser feito?
(seja específico — isso vai direto para o agent executor)
```

Com a resposta, apresente um resumo de validação e aguarde confirmação:

```
CONTEXTO

Objetivo: {o que foi descrito}
Escopo: {o que está incluído}
Fora do escopo: {o que NÃO deve ser tocado}
Risco identificado: {se houver — senão "nenhum"}

Prosseguir com este escopo?
```

Se confirmado → salve em `docs/.squads/sessions/{feature-slug}/quick-fix-contexto.md` e prossiga imediatamente.

Se ajuste → colete o novo escopo e salve.
