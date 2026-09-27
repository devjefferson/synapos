---
name: synapos-context-engine
version: 1.2.0
description: Memória em camadas, recuperação de contexto, escrita de memória, invalidação e política de scan do projeto
---

# SYNAPOS CONTEXT ENGINE

> Princípio: **aprender o projeto uma vez, recuperar só o que a decisão atual precisa.**
> Contexto mínimo suficiente > contexto máximo. Todo arquivo carregado precisa de um "por quê".

---

## 1. CAMADAS DE MEMÓRIA

```
GLOBAL  — docs/_memory/                       (vale para todo o projeto, todas as sessions)
  company.md          identidade do projeto
  preferences.md      preferências (idioma, modelo, tracker)
  stack.md            stack detectada
  project-memory.md   entradas tipadas globais — só o não derivável (DECISION, RULE, FEEDBACK, LEARNING…)
  adr-index.md        1 linha por ADR — mapa para busca (ver adr-standard.md)
  skills-index.md     1 linha por skill — mapa para busca (ver skills-engine.md)

ROLE    — docs/_memory/roles/{domain}.md       (conhecimento de uma role neste projeto)
  padrões de referência, catálogo de reuso, convenções, restrições e skills preferidas do domínio
  gerado por .synapos/core/shared-steps/pattern-discovery.md

SESSION — docs/.squads/sessions/{feature}/     (vale para uma feature)
  context.md          começa com ## Resumo (≤ 5 linhas) — sempre o primeiro bloco lido
  memories.md         entradas tipadas da feature
  spec.md · architecture.md · plan.md · review-notes.md · state.json

TASK    — em contexto, não persistida
  Context Brief do step atual (§3): objetivo, step, contexto carregado e por quê, lacunas
```

**Memória × cache de conhecimento** — dois tipos de conteúdo, com regras diferentes:

| | Memória | Cache de conhecimento |
|---|---|---|
| O quê | o que **não** se deriva do código/git: decisões, regras, preferências, feedback, referências externas, aprendizados | o que **se deriva** do código, persistido para não reanalisar: `stack.md`, mapa de `roles/{domain}.md`, `adr-index.md`, `skills-index.md` |
| Validade | até ser contradita ou substituída | enquanto os `sources` não mudarem (§5.2) |
| Escrita | política do §4 | discovery/indexação, sempre com `sources` + `scanned_at` |

Nunca grave como memória algo que o código responde (lib usada, estrutura de pastas, componente existente): isso é cache e mora no arquivo de conhecimento com `sources`.

Legado: `docs/_memory/project-learnings.md` continua válido — suas entradas são lidas como `LEARNING` global. Novas entradas vão para `project-memory.md`.
`session.manifest.json` e `context.snapshot` de versões antigas são ignorados (substituídos por `## Resumo`).

---

## 2. FORMATO DE ENTRADA

Usado em `project-memory.md`, `memories.md` e na seção de regras de `roles/{domain}.md`:

```markdown
### [TIPO] {regra ou fato em 1 linha — é o que a busca lê}
why: {por que existe — o motivo, incidente ou decisão que a originou}
how: {quando e como aplicar — onde vale, exceções}
scope: {global | role:{domain} | session:{slug} | paths:{glob}} · source: {arquivo | usuário | {step-id}} · confidence: {high|medium|low} · status: {active|stale|conflict|superseded}
created: YYYY-MM-DD · updated: YYYY-MM-DD
```

`why` e `how` são obrigatórios em todo tipo exceto `REFERENCE` e `TEMPORARY`: sem o motivo, a IA não sabe julgar o caso de borda. Datas sempre absolutas — nunca "ontem", "semana passada".

| Tipo | Significa | Normativo? |
|---|---|---|
| `DECISION` | Escolha tomada com o usuário ("cadastro mínimo, completar depois") | **sim** |
| `RULE` | Regra que deve ser seguida ("textos de UI em capitalização de frase") | **sim** |
| `CONSTRAINT` | Limite que não pode ser violado ("não armazenar CPF sem consentimento") | **sim** |
| `PREFERENCE` | Preferência do time sobre o trabalho no projeto | **sim** |
| `FEEDBACK` | Correção dada à IA ou abordagem que o usuário confirmou ("não criar abstração para 1 uso") | **sim** (veio do usuário — grava sem nova confirmação) |
| `LEARNING` | Algo descoberto executando que o código não mostra ("build quebra se o .env não tem API_URL") | não |
| `FACT` | Fato do projeto **não derivável** do código/git ("a API é de outro time; mudanças de contrato passam por eles") | não |
| `REFERENCE` | Onde achar informação fora do repositório (issue tracker, dashboard, doc externa) | não |
| `TEMPORARY` | Válido só nesta feature/execução | não — nunca vai para GLOBAL |

`PATTERN` não é tipo de memória: padrões observáveis no código vivem no mapa de `roles/{domain}.md` (cache). Convenção acordada que o código ainda não mostra → `RULE`.

Entradas legadas (`## [{squad} · {agent}] — data`) são lidas como `LEARNING` com `confidence: medium`. Entradas `[PATTERN]` ou `[FACT]` deriváveis do código são tratadas como cache sem `sources`: verifique antes de usar e mova para a role memory na consolidação.

---

## 3. RECUPERAÇÃO (CONTEXT RETRIEVAL)

### 3.1 Boot — uma vez por conversa (orchestrator)

No Claude Code, o hook `SessionStart` (`.synapos/hooks/claude/session-start.js`) monta este mapa de forma determinística — cabeçalhos, índices, role memories e frescor de cada arquivo de conhecimento — e o injeta como `[MEMORY_MAP]`. Presente no contexto → não refaça. Nas demais IDEs, carregue somente mapas:

```
company.md · preferences.md · stack.md             (pequenos, identidade)
grep "^### \[" docs/_memory/project-memory.md       (só cabeçalhos; arquivo com < ~40 linhas pode ser lido inteiro)
adr-index.md · skills-index.md                      (1 linha por item)
```

Se um mapa não existe, não o construa no boot — ele é construído no primeiro step de track standard/complex que precisar dele (§6). O track quick nunca constrói índices: usa listagem barata (orchestrator → FAST LANE).

### 3.2 Por step — montar o Context Brief

Selecione, nesta ordem, parando quando o step tiver o necessário:

1. **Normativos do escopo** — entradas `RULE | CONSTRAINT | DECISION | PREFERENCE | FEEDBACK` com `status: active` cujo `scope` é `global`, a role atual, a session atual ou `paths` que cobrem os arquivos da tarefa. Sempre incluídas.
2. **Relevantes à tarefa** — `LEARNING | FACT | REFERENCE` cujo resumo cita entidades, componentes, módulos, libs ou áreas que a tarefa toca. Relevância semântica, não igualdade de palavra: "cadastro de clientes" casa com "formulários", "CRUD", "clientes".
3. **Desempate** — escopo mais específico > mais geral; `updated` mais recente > mais antigo; `confidence: high` > `low`.
4. **Role memory** — `roles/{domain}.md` do domínio do step. Ausente ou sem cobertura da área da tarefa → acione pattern discovery (§6) nos tracks standard/complex; no track quick, siga sem ela.
5. **Session** — `## Resumo` de context.md sempre; demais seções e artefatos (spec, architecture, plan) apenas se o step declara ou a decisão depende deles.
6. **ADRs** — linhas do `adr-index.md` com domínio ∩ step e escopo ∩ tarefa. ADR completa só dessas.
7. **Skills** — conforme `skills-engine.md` (descoberta → match → carregar só as relevantes).
8. **Arquivos do projeto** — só os que respondem uma pergunta do step.

Limite prático: até ~8 entradas de memória por step. Se passar disso, a seleção está ampla demais — refine pelo escopo.

**Regra do "por quê":** antes de carregar qualquer arquivo, responda "por que preciso disto para a decisão deste step?". Sem resposta → **não carregue**.

### 3.3 Context Brief — emitir no início de todo step inline/subagent

```
🧭 CONTEXT BRIEF — {step-id | fast-lane} · {role} · track: {track}
Tarefa: {objetivo em 1 linha}
Memória: {N} entradas — {resumos curtos} | nenhuma relevante
Role memory: roles/{domain}.md ({seções usadas}) | ausente → discovery
ADRs: {adr-id — regra} | nenhuma aplicável
Skills: {skill — motivo} · ignoradas: {skill — motivo} | nenhuma
Arquivos: {caminho — motivo}
Lacunas: [CONTEXT_REQUIRED] {o que falta} | nenhuma
```

Máximo ~9 linhas. O Brief é a TASK memory: torna auditável o que foi carregado e por quê. Lacuna aberta → resolva antes de produzir.

---

## 4. ESCRITA (MEMORY WRITE)

### 4.1 Filtro — só grave se passar

```
Será útil novamente em outra tarefa?          não → não grave
É específico deste projeto?                   não → não grave (é conhecimento geral)
O código ou o git responde isto?              sim → não é memória (cache de conhecimento, se valer persistir)
Já está em docs/, ADR, código ou outra entrada? sim → não grave (referencie ou atualize a existente)
É decisão descartada / pensamento temporário? sim → não grave
                                              (exceção: alternativa rejeitada COM motivo que evita retrabalho → DECISION)
```

Nunca grave: conversa trivial, raciocínio intermediário, duplicatas, conteúdo já documentado, segredos.

### 4.2 Destino

| Escopo | Arquivo |
|---|---|
| `global` | `docs/_memory/project-memory.md` |
| `role:{domain}` | `docs/_memory/roles/{domain}.md` (seção `## Regras e aprendizados da role`) se existir; senão `project-memory.md` com `scope: role:{domain}` |
| `session:{slug}` — `DECISION` | `context.md → ## Decisões` (fonte canônica das decisões da feature) |
| `session:{slug}` — demais tipos e `TEMPORARY` | `docs/.squads/sessions/{slug}/memories.md` |

### 4.3 Quando e como

- Candidatos surgem no bloco `Candidatos a memória` do HANDOFF de cada step (compliance-protocol §6). O runner acumula.
- Ao final do pipeline (ou da execução direta), o runner apresenta **uma única** confirmação:
  - `LEARNING | FACT | REFERENCE` com evidência → gravados automaticamente, listados no resumo.
  - `FEEDBACK` → gravado automaticamente (o usuário acabou de dizer).
  - `DECISION | RULE | CONSTRAINT | PREFERENCE` → exigem confirmação do usuário (são normativos).
  - Padrões observados no código → não são memória: atualizam o cache (`roles/{domain}.md`).
  - `TEMPORARY` → só na session; descartados na consolidação.
- **Deduplicar antes de gravar:** busque cabeçalhos com o mesmo assunto. Existe → atualize a entrada (conteúdo + `updated`), não crie outra.

### 4.4 Limite e consolidação

| Arquivo | Limite | Ao passar |
|---|---|---|
| `project-memory.md` | 60 entradas ou 25 KB | consolidar antes de gravar novas |
| `memories.md` (session) | 40 entradas | consolidar ao fim do pipeline |
| `roles/{domain}.md` | ~150 linhas | enxugar o mapa (manter referências e catálogo; cortar detalhe) |

O runner verifica na FASE 3.2. Acima do limite → consolidação (proposta na mesma pergunta de memória):

1. Mesclar entradas sobre o mesmo assunto (mais recente vence, evidência preservada).
2. Converter datas relativas em absolutas.
3. Resolver contradições: com evidência atual → corrigir (não normativa) ou `superseded`; normativa contradita → perguntar.
4. Remover `TEMPORARY` de execuções concluídas e entradas `superseded` há mais de uma consolidação.
5. Mover entradas deriváveis do código para o cache (`roles/{domain}.md`, `stack.md`).
6. Promover da session para GLOBAL o que vale para outras features (normativas com confirmação).

Normativas nunca são apagadas sem confirmação — só mescladas ou marcadas `superseded`.

---

## 5. INVALIDAÇÃO

### 5.1 Verificação no ponto de uso

Antes de basear uma decisão numa entrada que cita arquivo, dependência, componente ou padrão, verifique-a de forma barata (arquivo existe? grep encontra? `package.json`/manifesto ainda lista?).

| Resultado | Ação |
|---|---|
| Confirmada | use |
| Contradita, entrada **não normativa** | siga a evidência atual; reporte `[STALE]`; ao gravar, **corrija a mesma entrada** (conteúdo + `updated` + `corrigido de: {valor antigo} — evidência: {caminho}`) — nunca crie uma segunda |
| Contradita, entrada **normativa** (RULE/DECISION/CONSTRAINT) | não escolha: reporte `[CONFLICT] memória diz X, projeto mostra Y` e pergunte qual vale |
| Não verificável barato | use com a ressalva `confidence` da entrada |

Nunca sobrescreva em silêncio. Atualização exige evidência (arquivo lido) ou confirmação do usuário.
Contradição percebida de passagem (sem estar usando a entrada) também é reportada e corrigida pela mesma regra.

### 5.2 Frescor dos arquivos de conhecimento

`stack.md`, `roles/*.md`, `adr-index.md` e `skills-index.md` têm frontmatter:

```yaml
scanned_at: 2026-09-27
sources: [package.json, src/components/, src/app/]   # de onde o conhecimento foi derivado
```

Checagem barata ao usar: `git log -1 --format=%cs -- {sources}` mais novo que `scanned_at` → possivelmente stale → atualize **incrementalmente só esse arquivo e só as seções afetadas**. Sem git: compare datas de modificação; sem forma de comparar → use e registre a ressalva.

Quando uma ADR é substituída (`supersedes`), entradas que a citam passam a `status: superseded`.

---

## 6. POLÍTICA DE SCAN DO PROJETO

Análise profunda **só** quando:

1. o arquivo de conhecimento necessário não existe;
2. ele está stale pelos `sources` (§5.2);
3. a tarefa exige conhecimento ausente da memória (lacuna que o Brief não resolveu);
4. o usuário pede reanálise (`/setup:discover` ou "reanalise").

Fora disso: **scan direcionado** — somente a área que a tarefa toca, e o resultado é persistido (em `roles/{domain}.md`, `stack.md` ou `project-memory.md`) para não repetir.

```
discovery (1ª vez ou stale) → conhecimento persistido → atualizações incrementais → recuperação direcionada
```

`roles/{domain}.md` registra `coverage:` (áreas já mapeadas). Tarefa em área já coberta e fresca → nenhum scan.

---

## 7. CONVIVÊNCIA COM A MEMÓRIA NATIVA DA IDE

IDEs têm memória própria (ex: auto memory do Claude Code em `~/.claude/projects/<projeto>/memory/`, local à máquina). O Synapos não a substitui nem a duplica:

| Conteúdo | Onde |
|---|---|
| Decisões, regras, restrições, feedback e referências **do projeto** — valem para o time e para qualquer IDE | `docs/_memory/` (versionado) |
| Perfil e preferências **pessoais** do usuário (papel, estilo de comunicação, hábitos de trabalho) | memória nativa da IDE |

- Não copie entradas de uma para a outra.
- Conflito entre as duas sobre o projeto → `docs/_memory/` vale (é compartilhada e versionada); reporte `[CONFLICT]`.
- Instrução que precisa ser **imposta**, não só lembrada (bloquear escrita, rodar validação), não é memória: é hook da IDE.

---

## 8. SESSION

- `context.md` começa com `## Resumo` (≤ 5 linhas: o que é · por quê · decisões críticas · o que não fazer). Quem altera context.md atualiza o Resumo. O Resumo substitui o antigo `context.snapshot`.
- `memories.md` usa o formato do §2. Consolidação (`/session consolidate` ou automática pelo limite do §4.4): mesmos passos do §4.4.
- Artefatos de handoff entre roles (`spec.md`, `architecture.md`, `review-notes.md`) são lidos pela próxima role em vez de reconstruir o trabalho (ver pipeline-runner §Handoff entre roles).
