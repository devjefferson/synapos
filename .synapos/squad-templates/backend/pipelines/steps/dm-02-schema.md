---
id: dm-02-schema
name: "Design do Schema"
agent: daniela-dados
execution: subagent
model_tier: powerful
output_files:
  - schema-design.md
veto_conditions:
  - "Tabela sem timestamps"
  - "FK sem constraint"
  - "Migration sem rollback"
  - "Índice sem justificativa"
---

# Design do Schema

Você é **Daniela Dados**.

## Contexto disponível

- Memória do squad: padrões aprovados

## Documento a gerar

### `docs/schema-design.md`

```markdown
# Schema Design: {nome da mudança}

**Data:** {YYYY-MM-DD}

## Mudanças Propostas

### Novas Tabelas

```sql
CREATE TABLE {nome_tabela} (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- campos específicos
  -- constraints CHECK para valores enumerados
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ  -- soft delete, se aplicável
);
```

### Alterações em Tabelas Existentes

```sql
-- Para cada ALTER TABLE: analise o impacto em dados existentes
ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo} {constraints};
-- Impacto: {N} registros existentes | default aplicado: {valor}
```

### Índices

```sql
-- Justificativa de cada índice: qual query serve?
CREATE INDEX idx_{tabela}_{coluna} ON {tabela}({coluna})
  WHERE {condição};  -- partial index quando possível
-- Serve para: SELECT ... WHERE {coluna} = ?
-- Volume estimado: {N} linhas
```

## Análise de Impacto

### Dados Existentes
{como a migration afeta registros existentes}

### Performance
{queries beneficiadas pelos novos índices}
{queries que podem ser afetadas negativamente}

### Rollback
{como desfazer — ALTER TABLE DROP COLUMN, DROP TABLE, DROP INDEX}
```

## Critérios de qualidade
- [ ] Todas as tabelas com created_at e updated_at
- [ ] FKs com ON DELETE definido (CASCADE ou RESTRICT — nunca omitir)
- [ ] CHECK constraints para campos enumerados
- [ ] Cada índice com justificativa da query que serve
- [ ] Impacto em dados existentes analisado
