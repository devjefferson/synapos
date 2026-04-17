---
name: synapos-setup-build-tech
version: 3.0.0
description: Gera documentação técnica do projeto em docs/tech/
---

# /setup:build-tech

Gera `docs/tech/` com arquitetura, módulos e decisões técnicas.

---

## PROTOCOLO

### 1. Verificar pré-requisitos

- `docs/_memory/stack.md` existe e está preenchido? Se não → sugira rodar `/setup:discover` primeiro e pare.

### 2. Analisar o código

Leia `docs/_memory/stack.md`. Depois escaneie:
- Pontos de entrada (main, index, app, server).
- Organização de módulos em `src/`, `app/`, `lib/` ou equivalente.
- Camadas (controller/service/repo, handler/usecase/adapter, MVC, etc.).
- Dependências externas relevantes (banco, cache, fila, API externa).
- Padrões de teste.

### 3. Apresentar estrutura proposta

```
AskUserQuestion({
  question: "Docs técnicos — quais arquivos gerar?",
  options: [
    { label: "📐 architecture.md", description: "Visão geral da arquitetura e camadas" },
    { label: "📦 modules.md", description: "Mapa de módulos e responsabilidades" },
    { label: "🔌 integrations.md", description: "Integrações externas (DB, APIs, filas)" },
    { label: "🧪 testing.md", description: "Estratégia e convenções de testes" },
    { label: "📋 Todos", description: "Gerar os 4 arquivos" }
  ],
  multiSelect: true
})
```

### 4. Gerar

Para cada arquivo selecionado, crie em `docs/tech/{nome}.md` seguindo as plantas abaixo. Preencha com dados reais observados no código — nunca invente.

**`architecture.md`:**
```markdown
# Arquitetura

## Visão geral
{1 parágrafo: o que a aplicação faz e como está organizada em alto nível}

## Camadas
{lista das camadas encontradas, com responsabilidade de cada}

## Fluxo de uma request típica
{rastreie uma rota/comando de ponta a ponta: entrada → validação → lógica → persistência → resposta}

## Decisões arquiteturais
{inferidas do código — ex: "usa Repository Pattern", "DI por construtor", "eventos in-memory". Se não der para inferir, deixe em branco.}
```

**`modules.md`:**
```markdown
# Módulos

Para cada módulo principal:

## {nome do módulo}
- **Responsabilidade:** {1 linha}
- **Arquivos:** {paths principais}
- **Depende de:** {outros módulos}
- **Usado por:** {outros módulos}
```

**`integrations.md`:**
```markdown
# Integrações

## Banco de dados
- Tecnologia: {postgres|mysql|sqlite|mongo|...}
- ORM/Driver: {prisma|drizzle|sqlalchemy|gorm|...}
- Migrations: {localização e ferramenta}

## APIs externas
{lista com onde são chamadas}

## Filas / eventos
{se existirem}

## Cache
{se existir}
```

**`testing.md`:**
```markdown
# Testes

## Runners
{unit, integration, e2e}

## Convenções
{colocation vs pasta separada; nomeação; mocks; fixtures}

## Como rodar
{comandos de stack.md repetidos aqui para contexto}

## Cobertura observada
{alta|média|baixa baseada em contagem — não invente %}
```

### 5. Confirmar

```
✅ Tech docs gerados em docs/tech/
   Arquivos: {lista}

Revise os arquivos e complete com contexto específico do projeto.
```

---

## REGRAS

- Nunca invente padrões que não estão no código.
- Se um arquivo já existe: pergunte antes de sobrescrever.
- Inclua paths/arquivos reais como referência (ex: `src/auth/middleware.ts:42`).
