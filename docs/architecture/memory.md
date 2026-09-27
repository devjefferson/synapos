# Memory Architecture

> Spec executável: `.synapos/core/context-engine.md`. Este documento explica o desenho.

## Problema

A v3.5 tinha armazenamento, não memória: `memories.md` era recuperado por **recência** (as 5 últimas entradas), `project-learnings.md` era carregado inteiro no modo completo e nada tinha tipo, escopo, fonte ou validade. Resultado: contexto irrelevante em todo step e conhecimento importante (padrões de UI, regras) que não existia em lugar nenhum — então a IA reanalisava o projeto ou inventava.

## Referência: auto memory do Claude Code

"Claude Memory 2.0" é o nome usado pela mídia; a documentação oficial chama o sistema de **auto memory** ([docs](https://code.claude.com/docs/en/memory)). O que é documentado:

- dois sistemas: `CLAUDE.md` (instruções escritas pelo usuário) e auto memory (notas escritas pelo Claude);
- `MEMORY.md` como índice, uma linha por memória; só as primeiras 200 linhas / 25 KB carregam; o Claude é avisado para enxugar perto do limite;
- um arquivo por memória, lido sob demanda;
- 4 tipos no frontmatter: `user`, `feedback`, `project`, `reference`;
- não salva o que é derivável do código/git (arquitetura, caminhos, fixes) nem o que o `CLAUDE.md` já diz;
- campo `modified` automático: memória é observação datada;
- regras com `paths:` e skills carregam só quando relevantes;
- `CLAUDE.md` é contexto, não imposição — imposição é hook;
- subagentes não herdam a auto memory principal.

A consolidação automática entre sessões ("Auto Dream": mesclar, remover contradições, converter datas relativas, podar o índice) aparece só em fontes de terceiros, em rollout limitado — foi usada como inspiração, não como fato.

O Synapos **não usa** esse sistema (ele é local à máquina e específico do Claude Code; o Synapos é multi-IDE e sua memória é versionada com o projeto). Aplica os princípios abaixo e define como os dois convivem.

## Comparação

| Princípio | Synapos | |
|---|---|---|
| Índice sempre, conteúdo sob demanda | boot lê só cabeçalhos (`grep "^### \["`) + índices de 1 linha | alinhado |
| Relevância decide o que carrega; regras por `paths:` | seleção por escopo/relevância, `scope: paths:`, adr/skills-index | alinhado |
| Memória é observação datada | verificação no ponto de uso, `[STALE]`/`[CONFLICT]` | vai além |
| Subagente não herda memória | runner monta o contexto explicitamente | alinhado |
| Não salvar o derivável | memória só com o não derivável; o derivável vira **cache de conhecimento** com `sources` | alinhado, com o cache como extensão deliberada |
| Estrutura regra → por quê → como aplicar | campos `why` e `how` obrigatórios | alinhado |
| Tipos `feedback` e `reference` | `FEEDBACK` e `REFERENCE` | alinhado |
| Limite do índice + aviso | limites por arquivo (§4.4) verificados na FASE 3.2 | alinhado |
| Consolidação periódica | consolidação disparada pelo limite + `/session consolidate` | inspirado (não automática em background) |
| Imposição via hooks | fora do escopo — regra de convivência aponta hooks para o que precisa ser imposto | proposta futura |

### A divergência deliberada: cache de conhecimento

O Claude Code rederiva do código tudo o que é derivável. O Synapos persiste parte disso — `stack.md`, o mapa de `roles/{domain}.md`, `adr-index.md`, `skills-index.md` — porque o objetivo explícito é **não reanalisar o projeto a cada execução**, e porque o mapa de UI é caro de reconstruir e é o que impede a role Frontend de inventar. Para não repetir o problema de memória obsoleta, o cache é separado da memória: sempre carrega `sources` + `scanned_at` e é invalidado por mudança nesses sources, não por julgamento.

## Camadas

```
GLOBAL   docs/_memory/                     memória: project-memory · cache: stack, adr-index, skills-index
ROLE     docs/_memory/roles/{domain}.md    cache: mapa de padrões do domínio · memória: regras da role
SESSION  docs/.squads/sessions/{slug}/     context.md (## Resumo, ## Decisões), memories.md, artefatos, state.json
TASK     Context Brief (em contexto)       objetivo, step, o que foi carregado e por quê, lacunas
```

## Formato

```markdown
### [RULE] Textos de UI em capitalização de frase
why: padronização pedida pelo time de conteúdo após revisão de UX em 2026-08
how: rótulos, títulos e mensagens; nomes próprios e siglas mantêm a grafia
scope: global · source: usuário · confidence: high · status: active
created: 2026-09-01 · updated: 2026-09-01
```

Tipos: `DECISION` · `RULE` · `CONSTRAINT` · `PREFERENCE` · `FEEDBACK` (normativos) · `LEARNING` · `FACT` (não derivável) · `REFERENCE` · `TEMPORARY`.

## Recuperação

```
normativos do escopo (sempre) → relevantes à tarefa (semântico) → desempate (escopo, recência, confiança)
→ role memory → Resumo da session → ADRs do índice → skills → arquivos justificados
```

~8 entradas por step. O Context Brief lista o que entrou e por quê.

## Escrita

| Tipo | Fluxo |
|---|---|
| LEARNING · FACT · REFERENCE com evidência · FEEDBACK | gravado automaticamente, listado no resumo |
| DECISION · RULE · CONSTRAINT · PREFERENCE | uma confirmação agrupada ao fim do pipeline |
| TEMPORARY | só na session; removido na consolidação |
| padrão observado no código | não é memória — atualiza o cache da role |

## Limites e consolidação

`project-memory.md` 60 entradas / 25 KB · `memories.md` 40 · `roles/{domain}.md` ~150 linhas. Acima disso, a FASE 3.2 propõe consolidar: mesclar duplicatas, datas absolutas, resolver contradições com evidência, remover temporárias e `superseded`, mover o derivável para o cache, promover da session para global. Normativas nunca são apagadas sem confirmação.

## Invalidação

- **Memória:** verificada no ponto de uso. Não normativa contradita → corrigida com `corrigido de:`. Normativa contradita → `[CONFLICT]`, pergunta.
- **Cache:** `git log -1 -- {sources}` mais novo que `scanned_at` → atualização incremental das seções afetadas.
- **ADR substituída:** entradas que a citam → `superseded`.

## Convivência com a memória nativa da IDE

Projeto (decisões, regras, feedback, referências — do time, versionado) → `docs/_memory/`. Perfil e preferências pessoais do usuário → memória nativa da IDE. Sem cópia entre as duas; em conflito sobre o projeto, `docs/_memory/` vale.

## Compatibilidade

`project-learnings.md` continua lido (como LEARNING). Entradas `## [squad · agent]` antigas são lidas como LEARNING; `[PATTERN]`/`[FACT]` deriváveis antigas são tratadas como cache sem sources e migradas na consolidação. `session.manifest.json` e `context.snapshot` são ignorados.
