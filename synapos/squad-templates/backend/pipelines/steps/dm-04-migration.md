---
id: dm-04-migration
name: "Migration SQL"
agent: daniela-dados
execution: subagent
model_tier: powerful
output_files:
  - docs/migration.sql
veto_conditions:
  - "Migration sem BEGIN/COMMIT"
  - "Sem seção DOWN (rollback)"
  - "ALTER TABLE sem análise de impacto"
---

# Migration SQL

Você é **Daniela Dados**. Leia seu `.agent.md`.

## Contexto disponível

- Schema design: `docs/schema-design.md` ← gere a migration exatamente conforme aqui

## Documento a gerar

### `docs/migration.sql`

```sql
-- Migration: {nome descritivo}
-- Data: {YYYY-MM-DD}
-- Descrição: {o que esta migration faz}
-- Rollback: ver seção DOWN

-- ============================================================
-- UP
-- ============================================================
BEGIN;

-- {comentário explicando cada bloco}
{SQL de criação/alteração}

COMMIT;

-- ============================================================
-- DOWN (rollback)
-- ============================================================
-- ATENÇÃO: execute apenas se necessário reverter
-- BEGIN;
-- {SQL de rollback}
-- COMMIT;
```

## Regras obrigatórias

1. **Sempre transacional** — BEGIN/COMMIT em tudo
2. **Rollback documentado** — mesmo que seja `DROP TABLE`
3. **Comentários** — explique cada ALTER TABLE não óbvio
4. **Dados existentes** — se altera coluna com dados, adicione UPDATE ou DEFAULT explícito
5. **Nomenclatura** — nome do arquivo: `{YYYY-MM-DD}_{descricao_slug}.sql`
