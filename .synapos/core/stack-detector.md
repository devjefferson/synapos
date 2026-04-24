---
name: synapos-stack-detector
version: 1.0.0
description: Detecção automática de stack do projeto — executada uma vez, gera docs/_memory/stack.md
---

# STACK DETECTOR

> Carregado apenas quando `docs/_memory/stack.md` não existe.
> O orchestrator detecta a ausência e lê este arquivo on-demand.
> Após gerar `stack.md`, este arquivo nunca mais é carregado no projeto.

---

## PROTOCOLO

Escaneie os arquivos raiz do projeto para identificar a linguagem e ferramentas.

### Mapa de detecção por arquivo

| Arquivo detectado | Linguagem inferida |
|---|---|
| `pyproject.toml` / `requirements.txt` / `setup.py` | Python |
| `Cargo.toml` | Rust |
| `Gemfile` | Ruby |
| `go.mod` | Go |
| `package.json` | Node.js / JavaScript / TypeScript |
| `composer.json` | PHP |
| `build.gradle` / `pom.xml` / `build.gradle.kts` | Java / Kotlin |
| `mix.exs` | Elixir |
| `*.csproj` / `*.sln` | C# / .NET |
| `pubspec.yaml` | Dart / Flutter |

### Extração de detalhes por linguagem

- **Python:** verifique `pyproject.toml` ou `requirements.txt` para inferir framework (fastapi, django, flask, litestar), ORM (sqlalchemy, django-orm, tortoise), validação (pydantic, marshmallow), test runner (pytest, unittest), linter (ruff, flake8, black)
- **Node.js:** verifique `package.json` → frameworks (express, fastify, nestjs, hono), ORM (prisma, drizzle, typeorm, sequelize), validação (zod, joi, yup), test runner (jest, vitest, mocha), linter (eslint, biome)
- **Rust:** verifique `Cargo.toml` → web framework (axum, actix-web, rocket), ORM (diesel, sqlx, sea-orm), test runner (cargo test)
- **Ruby:** verifique `Gemfile` → framework (rails, sinatra, hanami), ORM (activerecord, sequel), test runner (rspec, minitest), linter (rubocop)
- **Go:** verifique `go.mod` → framework (gin, echo, fiber, chi), ORM (gorm, sqlx, ent), test runner (go test)

Detecte também a estrutura de pastas dominante varrendo os diretórios raiz do projeto (1 nível).

---

## ARQUIVO GERADO

Crie `docs/_memory/stack.md` com o resultado:

```markdown
---
gerado: {YYYY-MM-DD}
auto_detectado: true
---
# Stack do Projeto

**Linguagem:** {detectada | "não detectada"}
**Runtime/Versão:** {detectada | "não detectado"}
**Framework:** {detectado | "não detectado"}
**Package Manager:** {detectado | "não detectado"}
**ORM / Banco:** {detectado | "não detectado"}
**Validação:** {detectada | "não detectada"}
**Test Runner:** {detectado | "não detectado"}
**Linter / Formatter:** {detectado | "não detectado"}

## Estrutura de Pastas (detectada)

```
{pastas detectadas no raiz do projeto}
```

## Notas

> Gerado automaticamente pelo Synapos. Edite este arquivo para corrigir ou complementar.
> Agents usam este contexto para adaptar exemplos, imports e estruturas de pastas ao projeto real.
```

---

## LOGS

**Sucesso:**
```
🔍 [STACK] Stack detectada: {linguagem} / {framework}
   Arquivo: docs/_memory/stack.md
   Para corrigir: edite docs/_memory/stack.md diretamente
```

**Nenhuma linguagem detectada:**
```
⚠️ [STACK] Linguagem não detectada automaticamente.
   Crie docs/_memory/stack.md manualmente ou execute /setup:discover.
```

---

## APÓS CONCLUIR

Retorne ao orchestrator. `stack.md` agora existe e será carregado como `[STACK_CONTEXT]` no fluxo principal.
