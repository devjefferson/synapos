---
id: qf-02-contexto
name: "Contexto Rápido"
execution: inline
model_tier: fast
---

# Contexto Rápido — Quick Fix

Colete o contexto mínimo antes de executar.

1. **Tarefa:** use `[TASK]` recebido do orchestrator. Só pergunte se ele estiver ausente ou ambíguo:
   ```
   O que precisa ser feito? (seja específico — vai direto para o executor)
   ```
2. **Localize o alvo** com busca direcionada (texto, componente, rota, função). Não varra o projeto.
3. **Recupere** (context-engine §3.2): normativos do escopo, ADRs do índice que tocam o alvo, skills que casam.

Apresente e aguarde confirmação:

```
CONTEXTO
Objetivo: {o que foi pedido}
Alvo: {arquivo(s) localizados}
Escopo: {o que está incluído}
Fora do escopo: {o que NÃO será tocado}
Regras aplicáveis: {ADR/memória} | nenhuma
Risco: {se houver} | nenhum
Prosseguir?
```

Confirmado → se `context.md` não existe na session, crie-o com `## Resumo` (objetivo em 1–2 linhas) e `## Escopo` (IN/OUT). Se existe, não altere. Prossiga.
Ajuste → colete o novo escopo e reapresente.
