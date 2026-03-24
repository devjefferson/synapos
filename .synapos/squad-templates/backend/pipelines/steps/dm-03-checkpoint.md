---
id: dm-03-checkpoint
name: "Aprovação do Schema"
execution: checkpoint
---

# Checkpoint — Aprovação do Schema

Antes de escrever a migration, o usuário valida o design.

## Apresentar resumo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEMA PROPOSTO

{lista de tabelas criadas/alteradas}

Índices: {N} novos
Impacto em dados existentes: {resumo}
Rollback possível: {Sim | Atenção: {restrição}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Pergunta

```
[1] Aprovado — gerar migration
[2] Ajustar schema — {o que mudar?}
```
