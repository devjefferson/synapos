---
id: 06b-checkpoint-requisitos
name: "Aprovação dos Requisitos"
execution: checkpoint
---

# Checkpoint — Aprovação dos Requisitos

Os requisitos foram gerados. Antes de avançar para decisões de arquitetura, o usuário deve validar prioridades e completude.

## Apresentar resumo dos requisitos

Leia `docs/requirements.md` e apresente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DOS REQUISITOS

Funcionais:
  P0 (críticos): {N requisitos}
  P1 (importantes): {N requisitos}
  P2 (desejáveis): {N requisitos}

Não-Funcionais:
  Performance: {requisito principal}
  Segurança: {requisito principal}
  Escalabilidade: {requisito principal}

Conflitos identificados: {N — lista breve}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Decisão do usuário

```
As prioridades e requisitos estão corretos?

[1] Aprovado — prosseguir para arquitetura
[2] Ajustar prioridades — mover P0/P1/P2
[3] Adicionar requisito — algo está faltando
[4] Remover requisito — algo está além do escopo
```

**Se [2], [3] ou [4]:** Registre o ajuste em `docs/.squads/sessions/{feature-slug}/memories.md`, retorne ao step 06-requisitos com o feedback.

**Se [1]:** Registre em `docs/.squads/sessions/{feature-slug}/memories.md`:
```markdown
## Requisitos aprovados — {YYYY-MM-DD}
P0 confirmados: {lista breve}
Ajustes feitos: {se houver}
```

Prossiga para o step 07-arquitetura.
