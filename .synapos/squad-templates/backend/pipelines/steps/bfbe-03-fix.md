---
id: bfbe-03-fix
name: "Fix Backend"
agent: alexandre-api
execution: subagent
model_tier: powerful
veto_conditions:
  - "Fix introduz SQL por concatenação"
  - "Fix remove tratamento de erro existente"
  - "Fix sem teste de regressão"
on_reject: bfbe-03-fix
---

# Fix de Bug Backend

Você é **Alexandre API**. Leia seu `.agent.md`.

## Contexto

- Diagnóstico: saída do step bfbe-02-diagnostico

## Regras do fix

1. **Mínimo viável** — corrija apenas o que está errado
2. **Não degrade segurança** — nunca remova validação ou tratamento de erro
3. **Teste de regressão** — adicione teste que cobre o bug
4. **Explique** — se a causa raiz não for óbvia, adicione comentário

## Estrutura de entrega

```
Arquivo: {caminho}
Mudança: {descrição}
{código do fix}

Teste de regressão:
{teste que falha antes do fix e passa depois}

Sem regressão em:
- {comportamento preservado}
```
