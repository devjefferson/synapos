---
id: 03-checkpoint-contrato
name: "Aprovação do Contrato"
execution: checkpoint
---

# Checkpoint — Aprovação do Contrato da API

Antes de implementar, o usuário valida o contrato definido por Bruno Base.

## Apresentar resumo

Leia `docs/api-contract.md` e apresente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO DA API: {nome da feature}

Endpoints:
  {MÉTODO} {rota} — {descrição em 1 linha}
  {MÉTODO} {rota} — {descrição em 1 linha}

Estrutura de camadas:
  {resumo em 2-3 linhas}

{Se houver ADR}: Decisão-chave: {título}

Status codes mapeados: {lista dos erros tratados}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Pergunta ao usuário

```
O contrato está alinhado?

[1] Sim — implementar
[2] Ajustar — {o que mudar no contrato?}
[3] Simplificar — remover endpoint ou campo não necessário agora
```

**Se [2] ou [3]:** Atualize `docs/api-contract.md` e registre em `docs/.squads/sessions/{feature-slug}/memories.md`.

**Se [1]:** Prossiga para implementação.
