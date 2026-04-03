---
description: Analisa projeto existente e gera bootstrap para build-tech e build-business
---

# Setup: From Code — Synapos

> Analisa o codebase existente e gera `docs/_memory/codebase-analysis.md` — um documento estruturado que serve de pré-contexto para `/setup:build-tech` e `/setup:build-business`.

---

# REGRAS ABSOLUTAS

## Regra 1: ANÁLISE SILENCIOSA — SEM PERGUNTAS

A **Fase 1 é 100% silenciosa.** Apenas leia arquivos e extraia informações. NÃO pergunte nada ao usuário.

## Regra 2: SÓ DETECTAR — NÃO INTERPRETAR

Você PODE detectar:
- Tecnologias (package.json, requirements.txt)
- Estrutura de pastas
- Endpoints de API (rotas no código)
- Entidades/Models
- Configurações (Docker, CI/CD)
- Padrões de nomenclatura

Você NÃO PODE detectar (nunca invente):
- Justificativa para escolhas
- Intenções do time
- Problemas ou dívida técnica
- Roadmap
- Decisões arquiteturais não-óbvias

## Regra 3: VALIDAR COM ASKUSERQUESTION APÓS ANÁLISE

Após analisar tudo, use AskUserQuestion para mostrar os resultados e pedir confirmação.

---

## QUANDO USAR

- Projeto já existe com código, mas `docs/` está vazio ou ausente
- Antes de rodar `/setup:build-tech` ou `/setup:build-business`
- Quando você quer que a documentação reflita o que está no código

---

## FASE 1 — VARREDURA DO PROJETO (SILENCIOSA)

Execute SEM perguntar nada.

### 1.1 — Estrutura raiz

Leia a estrutura de diretórios da raiz do projeto (1 nível de profundidade).

Identifique e registre:
- Nome do projeto (de `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, ou nome da pasta raiz)
- Tipo de repositório: monorepo | aplicação única | biblioteca | CLI | outro
- Pastas principais presentes: `src/`, `app/`, `apps/`, `packages/`, `lib/`, `api/`, `web/`, `mobile/`, etc.

### 1.2 — Detectar stack tecnológica

Para cada arquivo de dependências encontrado, leia e extraia:

| Arquivo | O que extrair |
|---|---|
| `package.json` | framework, ORM, banco, testes, build tool |
| `pyproject.toml` / `requirements.txt` | framework, ORM, testes |
| `Cargo.toml` | crates principais |
| `go.mod` | módulos principais |
| `pom.xml` / `build.gradle` | frameworks e bibliotecas |
| `Dockerfile` / `docker-compose.yml` | serviços, banco, portas |
| `.env.example` | variáveis de ambiente (só os nomes) |

Se monorepo: leia o `package.json` de cada `apps/*` ou `packages/*`.

### 1.3 — Detectar arquitetura backend

Procure pastas e extraia o padrão:

```
src/
├── controllers/ ou routes/     → HTTP handlers
├── services/                   → lógica de negócio
├── repositories/ ou dal/       → acesso a dados
├── models/ ou entities/        → modelos de domínio
├── middlewares/                 → middlewares
├── schemas/ ou dtos/            → validação
├── shared/ ou common/           → tipos, enums, utils
└── tests/                       → testes
```

### 1.4 — Extrair entidades de domínio

Procure por modelos e tipos:
- `*.model.ts`, `*.entity.ts`, `*.schema.ts`, `*.dto.ts`
- Pastas `models/`, `entities/`, `domain/`, `types/`
- Python: classes com `BaseModel`, `Model`
- Go: structs com tags json/db

Liste os nomes das entidades encontradas.

### 1.5 — Mapear APIs e endpoints

Procure por rotas:
- Express/Fastify: `router.get(`, `app.post(`, `@Get(`, `@Post(`
- FastAPI: `@app.get(`, `@router.post(`
- Django: `urlpatterns`, `path(`
- Rails: `routes.rb`

Agrupe endpoints por recurso (ex: `/users`, `/orders`, `/products`).

### 1.6 — Detectar frontend (se existir)

Procure: `frontend/`, `web/`, `client/`, `apps/web/`, `apps/frontend/`

Se encontrado:
- Framework: React, Vue, Angular, Svelte, Next.js, Nuxt
- Pastas: components, pages, stores
- Design system: shadcn/ui, MUI, Chakra, Tailwind
- Roteamento: React Router, Next.js App Router

### 1.7 — Detectar mobile (se existir)

Procure: `mobile/`, `apps/mobile/`, `ios/`, `android/`, `*.xcodeproj`, `AndroidManifest.xml`, `app.json`

Identifique framework: React Native, Flutter, nativo

### 1.8 — Detectar CI/CD e infra

Leia se existirem:
- `.github/workflows/*.yml`
- `Dockerfile`, `docker-compose.yml`
- `terraform/`, `pulumi/`, `cdk/`
- `k8s/`, `helm/`

Registre: o que existe e plataforma de deploy

### 1.9 — Ler README

Se existir: extraia descrição e instruções.

### 1.10 — Detectar testes

Procure: `tests/`, `__tests__/`, `spec/`, `*.test.ts`, `*.spec.ts`, `*_test.go`, `test_*.py`

Registre: framework de testes, tipos (unitários, integração, e2e)

---

## FASE 2 — APRESENTAR RESULTADOS (VALIDAÇÃO)

### Regra: Use AskUserQuestion

NÃO prossiga sem validar com o usuário.

### 2.1 — Validar Projeto Detectado

```
AskUserQuestion({
  question: "Analisei o projeto e encontrei o seguinte. Confirme:",
  options: [
    { label: "Correto", description: "Prosseguir com análise" },
    { label: "Preciso corrigir", description: "Vou informar o que está errado" }
  ]
})
```

Se "Preciso corrigir", use:

```
AskUserQuestion({
  question: "O que está incorreto?",
  options: [
    { label: "Nome do projeto", description: "Vou informar o nome correto" },
    { label: "Tipo de repositório", description: "Vou informar o tipo correto" },
    { label: "Stack tecnológica", description: "Vou informar a stack correta" },
    { label: "Tudo incorreto", description: "Vou informar tudo do zero" }
  ]
})
```

### 2.2 — Validar Stack Detectada

```
AskUserQuestion({
  question: "Detectei a seguinte stack. Confirme:",
  options: [
    { label: "Stack Correta", description: "Prosseguir" },
    { label: "Corrigir stack", description: "Vou informar a stack correta" }
  ]
})
```

Se "Corrigir", pergunte item por item:

```
AskUserQuestion({
  question: "Qual é o framework web principal?",
  options: [
    { label: "Express.js", description: "Express.js" },
    { label: "Fastify", description: "Fastify" },
    { label: "NestJS", description: "NestJS" },
    { label: "Next.js", description: "Next.js" },
    { label: "FastAPI", description: "FastAPI (Python)" },
    { label: "Django", description: "Django (Python)" },
    { label: "Outro", description: "Vou especificar" }
  ]
})
```

```
AskUserQuestion({
  question: "Qual é o banco de dados?",
  options: [
    { label: "PostgreSQL", description: "PostgreSQL" },
    { label: "MySQL", description: "MySQL" },
    { label: "MongoDB", description: "MongoDB" },
    { label: "SQLite", description: "SQLite" },
    { label: "Redis", description: "Redis" },
    { label: "Não sei", description: "Não tenho certeza" }
  ]
})
```

### 2.3 — Validar Entidades Detectadas

```
AskUserQuestion({
  question: "Encontrei as seguintes entidades de domínio. Confirmar?",
  options: [
    { label: "Corretas", description: "Prosseguir" },
    { label: "Faltam entidades", description: "Vou informar as que faltam" },
    { label: "Entidades erradas", description: "Vou corrigir" }
  ]
})
```

### 2.4 — Validar Estrutura de Pastas

```
AskUserQuestion({
  question: "A estrutura de pastas está correta?",
  options: [
    { label: "Sim, correta", description: "Prosseguir" },
    { label: "Não, preciso corrigir", description: "Vou informar a estrutura correta" }
  ]
})
```

### 2.5 — Confirmar para Gerar

```
AskUserQuestion({
  question: "Pronto para gerar análise do codebase. Confirma?",
  options: [
    { label: "Sim, gerar", description: "Gerar codebase-analysis.md" },
    { label: "Preciso corrigir mais", description: "Voltar e corrigir" }
  ]
})
```

---

## FASE 3 — GERAR CODEBASE-ANALYSIS.MD

**SÓ execute após validação completa.**

Salve em `docs/_memory/codebase-analysis.md`.

### Regras de Conteúdo

**Você PODE incluir:**
- Tecnologias detectadas (validadas)
- Estrutura de pastas (validada)
- Entidades encontradas (validadas)
- Endpoints detectados
- Configurações encontradas

**Você NÃO PODE incluir:**
- Justificativas para escolhas tecnológicas
- "Decisões arquiteturais" não-validadas
- Problemas ou dívida técnica não-discutidos
- Lacunas inventadas

### Template de Saída

```markdown
---
gerado_por: /setup:from-code
gerado_em: {YYYY-MM-DD}
versao: 1.0.0
---

# Análise do Codebase — {nome do projeto}

> Documento gerado automaticamente por varredura do código.
> Serve como pré-contexto para /setup:build-tech e /setup:build-business.

---

## Identificação

| Campo | Valor |
|---|---|
| Nome | {nome.validado} |
| Tipo de repositório | {tipo.validado} |
| README presente | {sim | não} |

---

## Stack Detectada

### Backend
| Camada | Tecnologia |
|---|---|
| Linguagem | {detectado} |
| Framework | {detectado} |
| Banco de dados | {detectado} |
| ORM | {detectado} |
| Testes | {detectado} |

### Frontend (se existir)
| Camada | Tecnologia |
|---|---|
| Framework | {detectado} |
| UI Library | {detectado} |

---

## Arquitetura

**Padrão identificado:** {padrão.detectado}
**Estrutura:** {árvore.validada}

---

## Entidades de Domínio

| Entidade | Campos |
|---|---|
| {nome.validado} | {campos.detectados} |

---

## APIs e Recursos

| Recurso | Métodos |
|---|---|
| {recurso.detectado} | {métodos} |

---

## Lacunas Identificadas

> O que NÃO pode ser detectado pelo código e PRECISA ser validado pelo usuário nas entrevistas.

### Para /setup:build-tech:
- Justificativa para escolhas de tecnologia
- Decisões arquiteturais não-óbvias
- Desafios técnicos do projeto
- Processos de desenvolvimento

### Para /setup:build-business:
- Visão e missão do produto
- Público-alvo e personas
- Concorrentes e diferenciação
- Métricas de sucesso
```

---

## FASE 4 — APRESENTAR RESULTADO

```
✅ Análise do codebase concluída!

Arquivo gerado: docs/_memory/codebase-analysis.md

📊 O que foi detectado (validado):
  Stack:       {resumo}
  Arquitetura: {padrão}
  Entidades:   {N entidades}
  Endpoints:   {N recursos}
  Frontend:    {framework ou "não detectado"}

📋 O que PRECISA ser validado nas entrevistas:
  {lista de lacunas}

🚀 Próximos passos:
  /setup:build-tech      → documentação técnica
  /setup:build-business  → documentação de negócio
```

⛔ **IMPORTANTE: Após finalizar, AGUARDE. NÃO encadeie outros comandos automaticamente.**

---

## REGRAS DE OURO

| Regra | Descrição |
|---|---|
| **Fase 1 silenciosa** | Não pergunte nada ao usuário |
| **Só detectar** | Não interprete, não invente justificativas |
| **Validar após** | Use AskUserQuestion para cada item |
| **NÃO invente** | Se não detectar, marque "não detectado" |
| **Pare no fim** | Aguarde o usuário decidir o próximo passo |
