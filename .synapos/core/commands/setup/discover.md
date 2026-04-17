---
name: synapos-setup-discover
version: 3.0.0
description: Escaneia o código e gera mapa técnico inicial do projeto
---

# /setup:discover

Análise automática do repositório. Preenche `docs/_memory/stack.md` e cria `docs/tech/overview.md` com o mapa técnico.

---

## PROTOCOLO

### 1. Detectar stack

Varra os arquivos da raiz e detecte linguagem + ferramentas:

| Arquivo | Linguagem | O que extrair |
|---|---|---|
| `package.json` | Node/TS | deps, scripts, framework (Next/React/Vue/Svelte/Nest/Express) |
| `pyproject.toml` / `requirements.txt` | Python | framework (Django/FastAPI/Flask), ORM, test runner |
| `Cargo.toml` | Rust | framework, features |
| `go.mod` | Go | módulos, framework |
| `Gemfile` | Ruby | Rails/Sinatra/Hanami |
| `composer.json` | PHP | Laravel/Symfony |
| `*.csproj` | .NET | framework, target |
| `pubspec.yaml` | Flutter/Dart | deps |
| `mix.exs` | Elixir | Phoenix |

Para Node: leia `package.json` completo, detecte scripts úteis (`test`, `lint`, `build`, `typecheck`).

### 2. Mapear estrutura

Liste a árvore de diretórios raiz (2 níveis) ignorando:
- `node_modules`, `.git`, `dist`, `build`, `out`, `.next`, `.nuxt`, `target`, `venv`, `__pycache__`

Identifique pastas convencionais: `src/`, `app/`, `pages/`, `components/`, `lib/`, `services/`, `tests/`, `api/`, `db/`, `migrations/`, `public/`.

### 3. Escrever `docs/_memory/stack.md`

Substitua o arquivo (mantendo estrutura abaixo):

```markdown
# Stack

**Linguagem:** {linguagem}
**Framework:** {framework principal}
**Package manager:** {npm|pnpm|yarn|bun|pip|poetry|cargo|go|bundler|...}
**Test:** {vitest|jest|pytest|cargo test|go test|...}
**Lint:** {eslint|biome|ruff|clippy|golangci-lint|...}
**Typecheck:** {tsc|mypy|...|"—" se não se aplica}

## Comandos
- Install: `{comando}`
- Lint: `{comando}`
- Test: `{comando}`
- Typecheck: `{comando|"-"}`
- Build: `{comando|"-"}`

## Estrutura
{árvore resumida em 10-15 linhas}

## Observações
{1-3 frases sobre convenções observadas: padrão de testes colocation, estrutura MVC, monorepo, etc.}
```

### 4. Escrever `docs/tech/overview.md`

Crie (ou sobrescreva se confirmado):

```markdown
# Visão Técnica

> Gerado automaticamente por `/setup:discover` em {YYYY-MM-DD}.
> Edite livremente.

## Stack
Ver `docs/_memory/stack.md`.

## Módulos principais
{lista derivada das pastas mapeadas, 1 linha por módulo}

## Fluxos observados
{se der para inferir: entrada HTTP → handler → service → repo → banco. Senão, deixe em branco para edição manual.}

## Pontos de atenção
{hardcoded configs, deps desatualizadas óbvias, padrões inconsistentes detectados — apenas o que for claro}
```

### 5. Confirmar

```
✅ Discover concluído
   docs/_memory/stack.md atualizado
   docs/tech/overview.md criado

Próximos passos sugeridos:
- Edite stack.md se algum comando está errado
- Complete docs/tech/overview.md com domínio do negócio
- /setup:build-business para gerar visão de produto
```

---

## REGRAS

- Se `docs/tech/overview.md` já existe: pergunte antes de sobrescrever.
- `stack.md` é sempre sobrescrito — mas preserve comandos customizados se detectar edição.
- Nunca invente dependências que não estão nos manifestos.
- Nunca rode comandos do projeto em discover (leitura apenas).
