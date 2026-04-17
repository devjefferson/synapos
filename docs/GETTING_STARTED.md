# Synapos — Getting Started

> Guia rápido para começar.

---

## Instalar

```bash
npx synapos
```

Escolha a IDE. O Synapos copia `.synapos/` + templates para o seu projeto e cria os slash-commands.

---

## Primeiro uso

```
/init "descreva o que quer fazer"
```

Exemplos:
- `/init corrigir bug do login`
- `/init adicionar endpoint de webhook`
- `/init refatorar query de pedidos para usar índice composto`

Na primeira execução:
1. O Synapos detecta sua stack (package.json, Cargo.toml, go.mod, etc.).
2. Cria `docs/_memory/` com `company.md`, `stack.md`, `preferences.md`.
3. Escolhe um role com base na sua mensagem.
4. Cria `docs/.squads/sessions/{feature-slug}/`.
5. Executa o pipeline: **investigar → executar → verificar**.

---

## Configurar o gate de verify

Edite `docs/_memory/stack.md`:

```markdown
## Comandos
- Install: npm install
- Lint: npm run lint
- Test: npm test
- Typecheck: npx tsc --noEmit
- Build: npm run build
```

O último step do pipeline roda esses comandos. Se algum falhar, o Synapos tenta corrigir uma vez, depois escala.

Sem comandos preenchidos: verify é pulado com aviso.

---

## Retomar uma feature

```
/init            → menu com sessions ativas
/session         → listar
/session {slug}  → abrir diretamente
```

---

## Cenários comuns

### Projeto existente, sem docs
```
/init                → onboarding automático
/setup:discover      → gera stack.md a partir do código
/setup:build-tech    → gera docs/tech/ (opcional)
```

### Começando do zero
```
/init
/setup:build-business → visão, personas, OKRs
/setup:build-tech     → arquitetura inicial
/init "primeira feature"
```

### Bug fix rápido
```
/init corrigir {descrição}
```

Sem checkpoints, sem cerimônia — investiga, corrige, verifica.

---

## Roles disponíveis

| Role | Quando |
|---|---|
| `engineer` | Genérico — default |
| `frontend` | UI, componentes |
| `backend` | APIs, schema |
| `fullstack` | Front + back |
| `mobile` | Apps |
| `devops` | CI/CD, infra |
| `produto` | PRD, spec, discovery |
| `ia-dados` | ML, pipelines, LLM apps |

Role é inferido da mensagem. Se ambíguo, o Synapos pergunta uma vez.

---

## O que vai pra session

Cada `/init` cria (ou retoma):

```
docs/.squads/sessions/{feature-slug}/
├── context.md    ← preenchido no step "investigar"
├── memories.md   ← aprendizados (append-only)
└── state.json    ← histórico de runs
```

Persiste entre conversas.

---

## Referências

- [../.synapos/core/orchestrator.md](../.synapos/core/orchestrator.md) — fluxo de entrada
- [../.synapos/core/pipeline-runner.md](../.synapos/core/pipeline-runner.md) — execução
- [../.synapos/core/gate-system.md](../.synapos/core/gate-system.md) — GATE-VERIFY
- [GUIDE.md](GUIDE.md) — referência completa
