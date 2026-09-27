---
name: synapos-skills-engine
version: 2.0.0
description: Descoberta, seleção, carga e aplicação de skills — de conhecimento (ux, design-system…) e de ferramenta (MCP, scripts)
---

# SYNAPOS SKILLS ENGINE v2.0.0

> Skills são conhecimento ou capacidade **específicos**, mais precisos que a regra genérica da role.
> Objetivo: **mais precisão com menos contexto** — descobrir todas, carregar só as relevantes, nunca ignorar uma relevante.

---

## 1. TIPOS

| Tipo | O que é | Exemplo |
|---|---|---|
| `knowledge` | Instruções/critérios de um domínio | `skills/ux.md`, design-system, accessibility, best-practices do Synapos |
| `tool` | Ferramenta externa (MCP, script) | playwright-browser, brave-search, github |

`SKILL.md` instalado em `.synapos/skills/{nome}/` declara `type: mcp | script | hybrid | prompt` — `prompt` = knowledge; os demais = tool.

---

## 2. DESCOBERTA (DISCOVER)

### 2.1 Fontes — procure em todas

```
Projeto (maior prioridade — feitas para este projeto)
  skills/**/*.md · docs/skills/**/*.md
  .claude/skills/*/SKILL.md · .agents/skills/*/SKILL.md · .cursor/rules/*.mdc
Instaladas no Synapos
  .synapos/skills/*/SKILL.md
Nativas da IDE/sessão
  skills que a ferramenta de IA lista como disponíveis na conversa atual
Framework (conhecimento base)
  .synapos/core/best-practices/_catalog.yaml
```

### 2.2 Índice — `docs/_memory/skills-index.md`

A descoberta é persistida para não varrer as pastas a cada step:

```markdown
---
scanned_at: YYYY-MM-DD
sources: [skills/, docs/skills/, .claude/skills/, .agents/skills/, .cursor/rules/, .synapos/skills/, .synapos/core/best-practices/]
---
# Skills Index

| id | tipo | domínios | usar quando | caminho |
|----|------|----------|-------------|---------|
| ux | knowledge | frontend, produto | criar/alterar telas, fluxos, formulários | skills/ux.md |
| playwright-browser | tool | frontend | validar UI no browser, screenshots | .synapos/skills/playwright-browser/SKILL.md |
```

- `usar quando` vem do frontmatter (`description`, `whenToUse`) ou do primeiro parágrafo. Não invente gatilhos que a skill não declara.
- **Reindexar** (tracks standard/complex) quando: índice ausente; a listagem das pastas-fonte difere dos `id` do índice (skill nova/removida); ou `sources` mais novos que `scanned_at`. Reindexação é incremental: só adiciona/remove linhas.
- Skills nativas da IDE não entram no índice (mudam por sessão) — são consideradas no match diretamente.

---

## 3. MATCH

Para o step atual:

```
TAREFA → domínio da role + tipo do step + entidades da tarefa
      → comparar com "domínios" e "usar quando" de cada skill do índice (+ nativas + skills: do squad.yaml)
      → relevante se o domínio casa E o gatilho descreve o que o step vai fazer
```

- Skill declarada em `squad.yaml → skills:` é sempre candidata, mas também precisa casar com o step.
- Casamento é semântico: "tela de onboarding" casa com `ux` (telas/fluxos) e `accessibility` (UI), não com `api-design`.
- Selecione no máximo ~3 skills `knowledge` por step. Se mais casam, prefira as de projeto e as mais específicas.

Registre no Context Brief (linha `Skills:`):

```
Skills: ux — tela nova · accessibility — formulário · ignoradas: api-design — sem API neste step
```

**Relevante e disponível = obrigatória.** Ignorar uma skill que casou é falha do step.
Skill nativa genérica da IDE não é obrigatória quando uma skill do projeto ou do Synapos já cobre a mesma necessidade — registre-a em `ignoradas` com o motivo.

---

## 4. CARGA (LOAD)

- Carregue **antes** de executar o step — nunca depois de produzir o output.
- `knowledge`: leia o SKILL.md/arquivo. Se > 200 linhas, leia os cabeçalhos e só as seções que o step usa.
- `tool`: verifique disponibilidade (MCP configurado / runtime presente). Indisponível → registre `⚠️ Skill {x} indisponível — {motivo}` e siga com o fallback declarado no step. Não bloqueia.
- Nunca carregue skills que não casaram "por garantia".

---

## 5. PRIORIDADE E CONFLITO

```
ADR ativa > regra explícita do projeto > contexto da session > padrão existente
> SKILL ESPECÍFICA > regra genérica da role > conhecimento geral
```

(ordem completa: `compliance-protocol.md` §1)

Se a skill contradiz ADR, regra do projeto, requisito explícito ou decisão do usuário:

```
[SKILL-CONFLICT]
Skill: {id} — "{trecho da skill}"
Conflito: {o que a skill manda}
Regra do projeto: {ADR/regra/requisito — fonte}
Decisão necessária: A) seguir o projeto  B) seguir a skill (e atualizar a regra)
```

Nunca escolha em silêncio.

---

## 6. EXECUÇÃO

- Aplique a skill explicitamente. No output, cite o critério usado quando ele determinou uma escolha: `(skill ux: validação inline em formulários)`.
- Tool skill disponível que oferece uma capacidade que a IA não tem nativamente (browser, busca web, API externa) é o caminho obrigatório para essa ação. Ferramentas nativas da IDE (ler, editar, buscar arquivos, terminal) prevalecem sobre skills equivalentes (ex: `filesystem`).
- Steps de review verificam conformidade com as skills listadas no Brief do step revisado.

---

## 7. INSTALAR UMA SKILL (tool/knowledge no Synapos)

```
.synapos/skills/{nome}/SKILL.md     (ou symlink para diretório compartilhado — destino deve estar em .synapos/skills/ ou docs/_memory/)
```

Frontmatter mínimo:

```yaml
---
name: {nome}
type: mcp | script | hybrid | prompt
description: "{o que faz}"
whenToUse: "{gatilho — quando a skill é relevante}"
domains: [frontend, backend, ...]
---
```

- `mcp`: adicione o servidor à config da IDE (`.claude/settings.local.json`, `.cursor/mcp.json`…); requer restart da IDE. Chaves de API só em variáveis de ambiente — nunca no SKILL.md.
- `script`: declare runtime e arquivo (`scripts/run.js`); verifique runtime antes de usar.
- Documente no SKILL.md o comportamento do agent com e sem a skill.
- Skills de projeto (`skills/*.md`) não precisam de instalação: basta existir com `description`/`whenToUse`.
