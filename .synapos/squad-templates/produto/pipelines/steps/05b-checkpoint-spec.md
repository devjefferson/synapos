---
id: 05b-checkpoint-spec
name: "Aprovação da Spec"
execution: checkpoint
---

# Checkpoint — Aprovação da Spec

A spec foi gerada. Antes de avançar para requisitos técnicos, o usuário deve revisar e aprovar o conteúdo.

## Apresentar resumo da spec

Leia `docs/product-vision.md` e `docs/spec.md` e apresente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DA SPEC

Product Vision:
  Para: {persona primária}
  Problema: {problema central}
  Solução: {diferencial único}
  North Star: {métrica principal}

Escopo v1 (IN):
  • {feature 1}
  • {feature 2}
  • {feature 3}

Fora do escopo (OUT):
  • {item excluído}

Features principais: {N features com critérios de aceite}
Métricas de sucesso: {N métricas definidas}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Decisão do usuário

```
A spec reflete o que foi alinhado?

[1] Aprovado — prosseguir para requisitos técnicos
[2] Ajustar escopo — o que incluir ou remover?
[3] Revisar product vision — algo está errado
[4] Recomeçar a spec — mudar direção completamente
```

**Se [2] ou [3]:** Registre o feedback em `_memory/memories.md`, retorne ao step 05-spec com as correções.

**Se [4]:** Retorne ao step 04b-alinhamento-estrategico para realinhar a direção antes de reger a spec.

**Se [1]:** Registre em `_memory/memories.md`:
```markdown
## Spec aprovada — {YYYY-MM-DD}
Escopo confirmado: {resumo do IN}
Excluído: {resumo do OUT}
```

Prossiga para o step 06-requisitos.
