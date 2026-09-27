# Claude Code Hooks

> Scripts: `.synapos/hooks/claude/` · instalação: `bin/synapos.js → mergeClaudeHooks` · testes: `tests/hooks.test.js`

## Por quê

Instruções em Markdown são contexto, não imposição — a própria documentação do Claude Code diz que, para garantir um comportamento, o caminho é um hook. Nos cenários de validação da v4, os pontos em que os agentes mais divergiram eram mecânicos: montar o mapa de memória e checar frescor, e a regra de escrita em `.synapos/`. Hooks cobrem exatamente essa faixa: regras verificáveis por script, sem julgamento.

O que continua no protocolo (não dá para verificar por script): triagem, "observe antes de criar", conflito com ADR, seleção de skills.

## Hooks

| Script | Evento | Faz | Falha segura |
|---|---|---|---|
| `session-start.js` | `SessionStart` | injeta `[MEMORY_MAP]`: cabeçalhos de `project-memory.md` (com status), linhas de `adr-index`/`skills-index`, role memories; lista arquivos de conhecimento desatualizados (sources com commit após `scanned_at` ou alterações pendentes) e ADRs/skills fora do índice | fora de projeto Synapos ou em erro → não injeta nada |
| `guard-framework.js` | `PreToolUse` · `Edit\|Write\|MultiEdit\|NotebookEdit` | bloqueia escrita em `.synapos/` exceto `squads/` | repo do framework e `SYNAPOS_ALLOW_FRAMEWORK_EDIT=1` liberam |
| `guard-commit.js` | `PreToolUse` · `Bash` | bloqueia `git add`/`git commit` com `.env*` ou `.synapos/` (fora de `squads/`) no stage — inclui `git add -A`, `.`, `-u`, `commit -a` e arquivos em diretórios não rastreados | comando sem git → não faz nada |

Bloqueio = `exit 2` com a mensagem no stderr, que o Claude Code devolve ao modelo para ele corrigir o curso.

## Instalação

`npx synapos` com a IDE Claude Code mescla em `.claude/settings.json`:
- remove só entradas antigas cujo comando aponta para `.synapos/hooks/claude/`;
- preserva permissões e hooks do usuário;
- é idempotente; `settings.json` inválido não é tocado (aviso).

Os comandos usam `node "${CLAUDE_PROJECT_DIR}/.synapos/hooks/claude/…"` — os scripts atualizam junto com o framework. Node em vez de bash + jq: o Synapos já exige Node e é multiplataforma.

`SYNAPOS_HOOKS=off` desliga todos.

## Validação

- `tests/hooks.test.js`: 28 verificações em repositórios temporários (bloqueios, exceções, frescor, idempotência do merge).
- Ponta a ponta no Claude Code 2.1.76, sobre a fixture: o modelo recebeu o `[MEMORY_MAP]` sem usar ferramentas; uma edição em `.synapos/core/gate-system.md` foi bloqueada antes de escrever; `git add -A && git commit` com `.env` foi bloqueado antes de executar (nenhum commit, nada em stage).

## Limites

- Só Claude Code. Cursor, Codex, Copilot e demais continuam com as regras em instrução.
- O guard de commit analisa o texto do comando; formas indiretas (scripts, aliases) escapam — é piso, não garantia total.
