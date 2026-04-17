# Synapos — Guia de Referência

**Contexto persistente por feature para trabalhar com IA em projetos reais.**

Três arquivos de core. Um pipeline de três steps. Um gate que roda shell.

---

## CONCEITOS

### Session
Uma pasta por feature em `docs/.squads/sessions/{feature-slug}/`. Contém:
- `context.md` — o que é, por que, decisões, não fazer
- `memories.md` — aprendizados acumulados (append-only)
- `state.json` — runs do pipeline nesta session

Compartilhada entre roles. Se você abre uma feature com `backend` hoje e com `frontend` amanhã, ambos leem o mesmo contexto.

### Role
Um template em `.synapos/squad-templates/{nome}/` com:
- `template.yaml` — metadados + pipeline inline
- `persona.md` — estilo e princípios do agente

Quando você ativa um role, ele é copiado para `.synapos/squads/{feature-slug}/` e usado pelo pipeline-runner.

### Pipeline
Definido inline no `template.yaml`. Três steps:

1. **investigar** — lê context.md e memories.md, entende a intenção, preenche context.md se novo
2. **executar** — implementa o código, inclui testes
3. **verificar** — roda lint/test/typecheck/build do stack.md (GATE-VERIFY)

### GATE-VERIFY
O único gate real. Executa os comandos definidos em `docs/_memory/stack.md`:

```markdown
## Comandos
- Lint: npm run lint
- Test: npm test
- Typecheck: npx tsc --noEmit
- Build: npm run build
```

Falhou? Tentativa única de correção. Falhou de novo? Escala com a session intacta.

---

## FLUXO DE UMA EXECUÇÃO

```
/init "adicionar webhook de pagamento"
  │
  ├── 1. orchestrator.md detecta contexto (company.md + stack.md)
  ├── 2. infere role "backend" da mensagem
  ├── 3. deriva feature-slug "webhook-pagamento"
  ├── 4. cria docs/.squads/sessions/webhook-pagamento/
  ├── 5. copia template backend → .synapos/squads/webhook-pagamento/
  │
  └── pipeline-runner.md executa:
      ├── investigar → preenche context.md (pode fazer 1 rodada de perguntas)
      ├── executar   → escreve o código + teste
      └── verificar  → roda GATE-VERIFY
```

---

## ARQUIVOS DE PERFIL

Em `docs/_memory/`:

### company.md
Perfil do projeto. Gerado no primeiro `/init` com o nome inferido do diretório.
Edite para incluir: domínio, usuários, fase atual do produto.

### stack.md
Detectada automaticamente por `/setup:discover`. Define:
- Linguagem, framework, package manager, test runner, linter
- **Comandos de verify** (a parte crítica)

Edite livremente. O pipeline-runner sempre usa a versão atual.

### preferences.md
- Linguagem de output (pt-BR padrão)
- Modelo preferido (referência — a IDE decide de fato)

---

## COMANDOS

### /init
Ponto de entrada. Aceita argumento:
- `/init` → menu de sessions ou nova feature
- `/init {intenção}` → executa direto com inferência automática

### /session
- `/session` → lista sessions
- `/session {slug}` → abre específica (resumo + ações)
- `/session consolidate` → compacta memories.md quando crescer demais

### /setup:discover
Escaneia o código, popula `docs/_memory/stack.md` e cria `docs/tech/overview.md`.

### /setup:build-tech
Menu para gerar arquivos em `docs/tech/`: architecture, modules, integrations, testing.

### /setup:build-business
Menu para gerar arquivos em `docs/business/`: vision, personas, okrs, journeys.

### /set-model
Atualiza o modelo em `preferences.md`. A IDE (Claude Code, Cursor, etc.) tem seu próprio seletor — o Synapos só registra a preferência.

### /bump
Versiona o pacote npm.

---

## ROLES INCLUÍDOS

Cada role tem o mesmo pipeline de 3 steps. O que muda:
- `persona.md` — estilo e princípios
- `template.yaml` — instruções específicas do domínio em cada step

| Role | Foco |
|---|---|
| `engineer` | Default genérico — adapta à stack |
| `frontend` | UI, componentes, estado, a11y |
| `backend` | API, schema, auth, transações |
| `fullstack` | Contrato ponta a ponta |
| `mobile` | iOS/Android divergência explícita |
| `devops` | IaC, CI/CD, observabilidade, plan antes de apply |
| `produto` | Problema antes de solução, métricas testáveis |
| `ia-dados` | Reprodutibilidade, baseline, custo |

---

## DECISÕES FORA DO ESCOPO

O agent sinaliza `[?]` quando precisa decidir algo não definido em `context.md`:

```
[?] decisão: adicionar cache?
   A) não agora — endpoint é baixo tráfego
   B) sim — Redis já está no stack
   Recomendação: B
```

O runner detecta `[?]`, apresenta via `AskUserQuestion`, aplica a escolha e continua. Agents nunca decidem sozinhos.

---

## CUSTOMIZANDO

### Adicionar um role próprio
Copie qualquer template de `.synapos/squad-templates/{existente}/` para um novo nome, ajuste `persona.md` e as `instruction` do `template.yaml`.

### Mudar o pipeline de um role
Edite o campo `pipeline:` do `template.yaml`. Você pode:
- Adicionar mais steps (ex: `docs`, `deploy`)
- Ajustar `instruction` de qualquer step
- Definir `gate: verify` em mais de um step

### Mudar o comportamento do GATE-VERIFY
Edite `.synapos/core/gate-system.md`. Ou só ajuste os comandos em `docs/_memory/stack.md` — o gate sempre lê de lá.

---

## COMPATIBILIDADE

Funciona em qualquer IDE que suporte slash-commands + LLMs com tool use:

- Claude Code (nativo)
- Cursor
- Trae
- OpenCode
- Antigravity (regras em `.antigravity/rules.md`)
- Copilot (instruções em `.github/copilot-instructions.md`)

---

## O QUE MUDOU NA V3

Corte brutal. Antes:
- 9 steps com 3 checkpoints síncronos
- 5 "gates" (3 textuais, 0 reais)
- 8 templates com 100+ arquivos duplicados
- orchestrator de 732 linhas, runner de 1005

Agora:
- 3 steps, 0 checkpoints obrigatórios
- 1 gate que roda shell
- 8 templates com 2 arquivos cada
- orchestrator de 242 linhas, runner de 285

O valor real — **sessions persistentes com context.md + memories.md** — ficou intacto. Tudo o resto era cerimônia.

---

## REFERÊNCIAS

- [../.synapos/core/orchestrator.md](../.synapos/core/orchestrator.md)
- [../.synapos/core/pipeline-runner.md](../.synapos/core/pipeline-runner.md)
- [../.synapos/core/gate-system.md](../.synapos/core/gate-system.md)
- [GETTING_STARTED.md](GETTING_STARTED.md)
