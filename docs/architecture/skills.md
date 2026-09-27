# Skill Discovery Architecture

> Spec executável: `.synapos/core/skills-engine.md`.

## Problema

Na v3.5, "skill" significava só integração instalada em `.synapos/skills/` (MCP/script), listada manualmente no `squad.yaml` e injetada **em bloco** apenas em steps `subagent`. Consequências:

- uma skill do projeto (`skills/ux.md`, `.claude/skills/*`) era invisível;
- o catálogo `core/best-practices/` (11 guias com `whenToUse`) nunca era usado;
- steps `inline` (review, investigação, quick-fix) nunca recebiam skill;
- quando recebiam, recebiam todas — contexto sem filtro.

## Desenho

```
TASK → domínio + tipo do step + entidades
     → DISCOVER (5 fontes, cacheadas em skills-index.md)
     → MATCH (domínio ∩ gatilho "usar quando")
     → LOAD (só as que casaram, antes de executar)
     → EXECUTE (critério citado quando decide algo)
     → REVIEW (conformidade verificada)
```

| Fase | Decisão de desenho |
|---|---|
| Discovery | fontes em ordem de especificidade: projeto (`skills/`, `docs/skills/`, `.claude/skills/`, `.agents/skills/`, `.cursor/rules/`) → instaladas (`.synapos/skills/`) → nativas da IDE → best-practices |
| Índice | `docs/_memory/skills-index.md`, 1 linha por skill, com `sources`/`scanned_at`; reindexa quando a listagem das pastas muda |
| Match | semântico, por step; ≤3 skills de conhecimento por step; declaradas no squad.yaml são candidatas, não automáticas |
| Load | antes da execução, no Context Brief (`Skills: usando … · ignoradas: … — motivo`) |
| Prioridade | skill específica > regra genérica da role > conhecimento geral; mas abaixo de ADR, regra do projeto, contexto da session e padrão existente |
| Conflito | `[SKILL-CONFLICT]` com skill × regra × fonte; nunca escolha silenciosa |
| Execução | "relevante e disponível = obrigatória"; tool skill que cobre a ação é o caminho obrigatório |

## Por que um índice e não "leia a pasta de skills"

Ler todas as skills em todo step é o problema original. O índice custa ~1 linha por skill, permite o match sem abrir nenhum arquivo e só é reconstruído quando as pastas mudam.

## Tipos

`knowledge` (critérios, instruções — ux, design-system, a11y, best-practices) e `tool` (MCP, script — playwright, busca, github). O frontmatter `whenToUse` + `domains` é o que alimenta o match; skills sem esses campos usam `description`/primeiro parágrafo, sem inventar gatilhos.
