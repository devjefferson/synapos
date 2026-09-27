---
id: 06b-checkpoint-requisitos
name: "Aprovação dos Requisitos"
execution: checkpoint
---

# Checkpoint — Aprovação dos Requisitos

Os requisitos foram gerados. Antes da spec, o usuário valida prioridades, regras de negócio e critérios de aceite.

## Apresentar resumo dos requisitos

Leia `requirements.md` da session e apresente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DOS REQUISITOS

Funcionais:
  P0 (críticos): {N requisitos}
  P1 (importantes): {N requisitos}
  P2 (desejáveis): {N requisitos}

Regras de negócio: {N — lista breve}
Restrições: {N}
Critérios de aceite: {N} (P0 cobertos: {sim|não})
Lacunas [A DEFINIR]: {lista}
Conflitos: {N — lista breve}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Decisão do usuário

```
As prioridades e requisitos estão corretos?

[1] Aprovado — gerar a spec
[2] Ajustar prioridades — mover P0/P1/P2
[3] Adicionar requisito — algo está faltando
[4] Remover requisito — algo está além do escopo
```

**Se [2], [3] ou [4]:** retorne ao step 06-requisitos com o feedback.
Ajustes que são decisões com motivo (ex: "importação por planilha fica fora da v1 porque…") → candidatos `DECISION` para a memória da session.

**Se [1]:** prossiga para a spec.
