---
description: Analisa projeto existente e gera bootstrap para build-tech e build-business
---

# Setup: From Code — Synapos

> Analisa o codebase existente e gera `docs/_memory/codebase-analysis.md` — um documento estruturado que serve de pré-contexto para `/setup:build-tech` e `/setup:build-business`.
>
> **Este comando não gera documentação final.** Ele alimenta os outros comandos para que as entrevistas sejam curtas e os docs gerados sejam específicos do projeto, não genéricos.

---

## QUANDO USAR

- Projeto já existe com código, mas `docs/` está vazio ou ausente
- Antes de rodar `/setup:build-tech` ou `/setup:build-business` num projeto existente
- Quando você quer que a documentação reflita o que está no código, não só o que você descreve

---

## FASE 1 — VARREDURA DO PROJETO

Execute silenciosamente. Não pergunte nada ao usuário nesta fase.

### 1.1 — Estrutura raiz

Leia a estrutura de diretórios da raiz do projeto (1 nível de profundidade).

Identifique e registre:
- Nome do projeto (de `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, ou nome da pasta raiz)
- Tipo de repositório: monorepo | aplicação única | biblioteca | CLI | outro
- Pastas principais presentes: `src/`, `app/`, `apps/`, `packages/`, `lib/`, `api/`, `web/`, `mobile/`, etc.

### 1.2 — Detectar stack tecnológica

Para cada arquivo de dependências encontrado, leia e extraia as bibliotecas principais:

| Arquivo | O que extrair |
|---|---|
| `package.json` | framework (React/Vue/Next/Express/NestJS/etc), ORM, banco, testes, build tool |
| `pyproject.toml` / `requirements.txt` | framework (FastAPI/Django/Flask), ORM, testes |
| `Cargo.toml` | crates principais (actix, tokio, sqlx, etc) |
| `go.mod` | módulos principais |
| `pom.xml` / `build.gradle` | Spring, Hibernate, etc |
| `Dockerfile` / `docker-compose.yml` | serviços, banco de dados, portas expostas |
| `.env.example` / `.env.template` | variáveis de ambiente (não os valores — só os nomes das keys) |

Se monorepo: leia o `package.json` de cada `apps/*` ou `packages/*`.

### 1.3 — Detectar arquitetura backend

Procure pelas seguintes pastas (adaptando para a linguagem detectada):

```
src/
├── controllers/ ou routes/     → HTTP handlers / rotas
├── services/                   → lógica de negócio
├── repositories/ ou dal/       → acesso a dados
├── models/ ou entities/        → modelos de domínio
├── middlewares/                 → middlewares
├── schemas/ ou dtos/            → validação / contratos
├── shared/ ou common/           → tipos, enums, utils
└── tests/                       → testes
```

Para cada pasta encontrada:
- Leia 2–3 arquivos representativos
- Extraia: padrão de nomenclatura (kebab, camelCase, PascalCase), sufixos usados (`.service.ts`, `.controller.ts`, etc.), padrão arquitetural predominante (MVC, Clean, Hexagonal, etc.)

### 1.4 — Extrair entidades de domínio

Procure por modelos, schemas e tipos que representam o domínio do negócio:

- `*.model.ts`, `*.entity.ts`, `*.schema.ts`, `*.dto.ts`
- Pastas `models/`, `entities/`, `domain/`, `types/`
- Em Python: classes com `BaseModel` (Pydantic), `Model` (Django ORM)
- Em Go: structs com tags json/db

Para cada entidade encontrada:
- Registre o nome
- Registre os campos principais (sem valores — só nomes e tipos)
- Infira o que representa no negócio (ex: `User`, `Order`, `Product`, `Payment`)

### 1.5 — Mapear APIs e endpoints

Procure por definição de rotas:

- Express/Fastify: `router.get(`, `app.post(`, `@Get(`, `@Post(`
- FastAPI: `@app.get(`, `@router.post(`
- Django: `urlpatterns`, `path(`
- Rails: `routes.rb`

Liste os endpoints encontrados agrupados por recurso (ex: `/users`, `/orders`, `/products`).

Não precisa de documentação completa — apenas o mapeamento de quais recursos existem.

### 1.6 — Detectar frontend (se existir)

Procure por pastas: `frontend/`, `web/`, `client/`, `apps/web/`, `apps/frontend/`

Se encontrado:
- Framework: React, Vue, Angular, Svelte, Next.js, Nuxt, outro
- Pastas de componentes, páginas, stores
- Presença de design system (shadcn/ui, MUI, Chakra, Tailwind, etc.)
- Roteamento: React Router, Next.js App Router, etc.

### 1.7 — Detectar mobile (se existir)

Procure por: `mobile/`, `apps/mobile/`, `ios/`, `android/`, arquivos `*.xcodeproj`, `AndroidManifest.xml`, `app.json` (Expo)

Se encontrado: framework (React Native, Flutter, nativo), versão mínima de OS se disponível.

### 1.8 — Detectar CI/CD e infra

Leia se existirem:
- `.github/workflows/*.yml` → pipeline de CI/CD
- `Dockerfile`, `docker-compose.yml` → containerização
- `terraform/`, `pulumi/`, `cdk/` → IaC
- `k8s/`, `helm/` → Kubernetes

Registre apenas: o que existe e qual plataforma de deploy parece ser o alvo (Vercel, AWS, GCP, Railway, etc.)

### 1.9 — Ler README

Leia `README.md` (raiz) se existir. Extraia:
- Descrição do projeto (1–3 frases)
- Instruções de setup/run
- Links mencionados (documentação, demo, etc.)

Se não existir: registre como ausente.

### 1.10 — Detectar testes

Procure por pastas `tests/`, `__tests__/`, `spec/`, arquivos `*.test.ts`, `*.spec.ts`, `*_test.go`, `test_*.py`.

Registre: framework de testes, tipos presentes (unitários, integração, e2e).

---

## FASE 2 — INFERIR CONTEXTO DE NEGÓCIO DO CÓDIGO

Com base no que foi encontrado na Fase 1, infira (sem perguntar ao usuário):

### 2.1 — Tipo de produto

Com base nas entidades, endpoints e estrutura, classifique:
- **SaaS** (tem users, subscriptions, tenants, billing)
- **E-commerce** (tem products, orders, cart, payment)
- **Marketplace** (tem buyers, sellers, listings)
- **Ferramenta interna** (sem auth pública, sem billing)
- **API/SDK** (só backend, sem UI)
- **App mobile** (tem mobile com backend)
- **Outro**: descreva

### 2.2 — Funcionalidades implícitas

Liste as funcionalidades que consegue inferir das entidades e rotas:

Exemplo:
- Autenticação (tem `User`, `/auth/login`, `/auth/register`)
- Gerenciamento de pedidos (tem `Order`, `/orders`)
- Notificações (tem `Notification`, `EmailService`)

### 2.3 — Regras de negócio implícitas

Procure por:
- Validações em schemas/DTOs (campos obrigatórios, formatos, limites)
- Condições em services (lógica `if/else` que representa regra de negócio)
- Enums que representam estados (ex: `OrderStatus`, `UserRole`, `PaymentStatus`)

Liste as principais regras encontradas em linguagem simples.

### 2.4 — Decisões técnicas aparentes

Com base no código, liste decisões que parecem ter sido tomadas:
- "Usa repository pattern — serviços não acessam banco diretamente"
- "Validação centralizada com Zod no controller"
- "Autenticação via JWT, não session"
- "Banco relacional (PostgreSQL via Prisma)"

Estas vão virar ADRs inferidas no `/setup:build-tech`.

---

## FASE 3 — GERAR CODEBASE-ANALYSIS.MD

Salve tudo em `docs/_memory/codebase-analysis.md`.

Use o template abaixo. Preencha apenas o que foi encontrado — use `"não detectado"` para campos ausentes. **Nunca invente informações.**

```markdown
---
gerado_por: /setup:from-code
gerado_em: {YYYY-MM-DD}
versao: 1.0.0
---

# Análise do Codebase — {nome do projeto}

> Documento gerado automaticamente por varredura do código.
> Serve como pré-contexto para /setup:build-tech e /setup:build-business.
> NÃO é documentação final — é insumo para os comandos de documentação.

---

## Identificação

| Campo | Valor |
|---|---|
| Nome | {nome do projeto} |
| Tipo de repositório | {monorepo \| aplicação única \| biblioteca \| CLI} |
| Tipo de produto inferido | {SaaS \| E-commerce \| Ferramenta interna \| API \| outro} |
| README presente | {sim \| não} |

{SE README EXISTIR}
**Descrição (do README):**
> {trecho da descrição do projeto}

---

## Stack Detectada

### Backend
| Camada | Tecnologia |
|---|---|
| Linguagem | {linguagem + versão} |
| Framework | {framework} |
| Banco de dados | {banco} |
| ORM / Query Builder | {ORM} |
| Validação | {biblioteca} |
| Testes | {framework} |
| Runtime | {Node.js versão \| Python versão \| etc} |

### Frontend (se existir)
| Camada | Tecnologia |
|---|---|
| Framework | {React \| Vue \| Next.js \| não detectado} |
| UI Library | {shadcn \| MUI \| Tailwind \| não detectado} |
| Roteamento | {React Router \| Next.js App Router \| não detectado} |

### Mobile (se existir)
| Campo | Valor |
|---|---|
| Framework | {React Native \| Flutter \| nativo \| não detectado} |
| Plataformas | {iOS \| Android \| ambos} |

### Infra / Deploy
| Campo | Valor |
|---|---|
| Containerização | {Docker \| não detectado} |
| CI/CD | {GitHub Actions \| GitLab CI \| não detectado} |
| IaC | {Terraform \| CDK \| não detectado} |
| Deploy target inferido | {Vercel \| AWS \| Railway \| não identificado} |

---

## Arquitetura

**Padrão identificado:** {MVC \| Clean Architecture \| Hexagonal \| Layered \| não identificado}

**Estrutura de pastas (backend):**
```
{árvore ASCII das pastas principais}
```

**Convenções detectadas:**
- Nomenclatura de arquivos: {kebab-case \| camelCase \| PascalCase}
- Sufixos usados: {.service.ts, .controller.ts, .repository.ts, etc}
- Separação de responsabilidades: {descrição em 1 linha}

---

## Entidades de Domínio

| Entidade | Campos principais | O que representa |
|---|---|---|
| {NomeDaEntidade} | {campo1: tipo, campo2: tipo} | {descrição em 1 linha} |

---

## APIs e Recursos

| Recurso | Métodos detectados | Descrição inferida |
|---|---|---|
| /users | GET, POST, PUT, DELETE | Gerenciamento de usuários |
| {recurso} | {métodos} | {descrição} |

---

## Funcionalidades Implícitas

{lista de funcionalidades inferidas das entidades e rotas}
- {funcionalidade 1} — baseado em {evidência no código}
- {funcionalidade 2} — baseado em {evidência no código}

---

## Regras de Negócio Implícitas

{lista de regras inferidas de validações, condições e enums}
- {regra 1}
- {regra 2}

---

## Decisões Técnicas Aparentes (futuras ADRs)

{lista de decisões que parecem ter sido feitas}
- {decisão 1}
- {decisão 2}

---

## Lacunas Identificadas

> O que não foi possível inferir do código e precisará ser respondido nas entrevistas de documentação.

- [ ] {lacuna 1 — ex: "Objetivo de negócio e público-alvo não identificáveis pelo código"}
- [ ] {lacuna 2 — ex: "Estratégia de deploy não confirmada"}
- [ ] {lacuna 3}

---

## Para uso por /setup:build-tech

Perguntas que NÃO precisam ser feitas (já respondidas):
- Stack tecnológica: {resumo}
- Padrão arquitetural: {resumo}
- Entidades de domínio: {resumo}

Perguntas que AINDA devem ser feitas:
- {questão restante 1}
- {questão restante 2}

---

## Para uso por /setup:build-business

Inferências disponíveis:
- Tipo de produto: {tipo}
- Funcionalidades identificadas: {lista resumida}
- Entidades de negócio: {lista resumida}

Informações que NÃO podem ser inferidas do código (obrigatório perguntar):
- Visão e missão do produto
- Público-alvo e personas reais
- Contexto competitivo
- Métricas de sucesso definidas pelo negócio
```

---

## FASE 4 — APRESENTAR RESULTADO

Após salvar o arquivo, informe ao usuário:

```
✅ Análise do codebase concluída!

Arquivo gerado: docs/_memory/codebase-analysis.md

📊 O que foi encontrado:
  Stack:       {resumo em 1 linha}
  Arquitetura: {padrão detectado}
  Entidades:   {N entidades de domínio}
  Endpoints:   {N recursos de API}
  Frontend:    {framework ou "não detectado"}

📋 Lacunas (precisarão ser respondidas nas entrevistas):
  {lista das lacunas identificadas}

🚀 Próximos passos:

  /setup:build-tech      → documentação técnica
                           (entrevista já pré-preenchida com o que foi encontrado)

  /setup:build-business  → documentação de negócio
                           (entrevista focada apenas no que o código não revela)

  /setup:start           → menu completo de documentação
```

**Pare aqui.** Não execute nenhum outro comando automaticamente. Aguarde o usuário decidir o próximo passo.

---

## REGRAS

| Regra | Descrição |
|---|---|
| **Nunca invente** | Se não encontrou, registre "não detectado" — nunca assuma |
| **Não pergunte na Fase 1** | Varredura é 100% autônoma |
| **Não gere docs finais** | A saída é APENAS `codebase-analysis.md` |
| **Lacunas são valiosas** | Identificar o que falta é tão importante quanto o que foi encontrado |
| **Pare no final** | Não encadeie outros comandos automaticamente |
