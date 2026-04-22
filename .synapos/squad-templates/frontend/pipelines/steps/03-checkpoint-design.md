---
id: 03-checkpoint-design
name: "Aprovação do Approach"
execution: checkpoint
---

# Checkpoint — Aprovação do Approach Arquitetural

Antes de implementar, o usuário valida a estrutura proposta.

## Apresentar resumo

Leia `docs/architecture-decision.md` e apresente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPROACH PROPOSTO: {nome da feature}

Componentes principais:
  {lista simplificada da estrutura}

Estado:
  {resumo das decisões de estado}

{Se tiver ADR}: Decisão-chave: {título do ADR}

Ponto de atenção: {se houver}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Pergunta ao usuário

```
O approach está alinhado com o que você esperava?

[1] Sim — implementar
[2] Ajustar estrutura — o que mudar?
[3] Simplificar — remover partes que não são necessárias agora
```

**Se [2] ou [3]:** Atualize `docs/architecture-decision.md` com o ajuste e registre em `docs/.squads/sessions/{feature-slug}/memories.md`. Retorne ao step 02-arquitetura se necessário.

**Se [1]:** Prossiga para implementação.
