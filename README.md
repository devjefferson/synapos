# Synapos

**AI Agent Orchestration Framework — Multi-IDE**

Instale squads de agents especializados no seu projeto com um único comando. Funciona com Claude Code, Cursor, Trae, OpenCode e Antigravity.

---

## Instalação

Execute no diretório do seu projeto:

```bash
npx synapos
```

O CLI vai guiar você por dois passos:

1. **Selecione os squads** que quer instalar (multi-select)
2. **Selecione as IDEs** para configurar (multi-select)

Ou passe os squads direto como argumento:

```bash
npx synapos front
npx synapos back
npx synapos front back
npx synapos front back devops
```

---

## Squads disponíveis

| Alias | Squad | Especialidade |
|-------|-------|---------------|
| `front` | Frontend | React, Vue, CSS, UX/UI, testes |
| `back` | Backend | APIs, banco de dados, segurança |
| `full` | Fullstack | Frontend + Backend integrados |
| `produto` | Produto | Pesquisa, spec, documentação |
| `mobile` | Mobile | React Native, Flutter, iOS, Android |
| `devops` | DevOps | CI/CD, containers, cloud, infra |
| `ia` | IA / Dados | ML, pipelines de dados, LLMs |

---

## IDEs suportadas

| IDE | Arquivo gerado |
|-----|----------------|
| Claude Code | `.claude/commands/init.md` |
| Cursor | `.cursor/rules/synapos.mdc` |
| Trae | `.trae/rules.md` |
| OpenCode | `.opencode/instructions.md` |
| Antigravity | `.antigravity/rules.md` |

---

## O que é instalado

Após rodar o CLI, seu projeto terá:

```
synapos/
├── core/               — orquestrador, pipeline runner, gate system, skills engine
├── squad-templates/    — templates dos squads selecionados (agents + pipelines)
├── skills/             — integrações (brave-search, github, playwright, etc.)
├── squads/             — squads ativos criados durante o uso
└── _memory/            — memória de contexto (empresa, preferências)
```

---

## Como usar

### Claude Code

Após instalar, abra o projeto no Claude Code e execute:

```
/init
```

O Synapos vai iniciar o onboarding, perguntar sobre seu projeto e apresentar o menu de squads.

---

## Fluxo Completo

```
/setup:start → documentação → /init → squad → pipeline
```

### Passo 1 — Criar a documentação do projeto

Antes de qualquer squad, o projeto precisa ter documentação em `docs/`. Execute:

```
/setup:start
```

O orquestrador analisa o projeto e exibe o estado atual:

| | Documento | Caminho |
|---|---|---|
| ✅ / ⚠️ | Project Briefing | `docs/tech-context/` |
| ✅ / ⚠️ | Contexto de Negócio | `docs/business/` |
| ✅ / ⚠️ | Contexto Técnico | `docs/tech/` |

A partir daí você pode rodar cada comando separado:

| Comando | O que faz |
|---|---|
| `/setup:build-business` | Gera `docs/business/` — personas, mercado, visão, estratégia |
| `/setup:build-tech` | Gera `docs/tech/` — arquitetura, stack, ADRs, guia do codebase |
| `/setup:discover` | Analisa o codebase e gera `docs/tech-context/` — briefing técnico incremental |

Cada comando tem 3 fases: descoberta automática → perguntas ao usuário → geração dos arquivos.

Estrutura gerada:

```
docs/
├── _memory/
│   ├── company.md            ← perfil da empresa/usuário
│   └── preferences.md        ← IDE, idioma, preferências
├── business/
│   ├── index.md
│   ├── business-context.md
│   ├── product-vision.md
│   ├── product-strategy.md
│   ├── competitive_landscape.md
│   ├── customer_communication.md
│   ├── features/
│   ├── personas/
│   └── research/
├── tech/
│   ├── index.md
│   ├── architecture.md
│   ├── stack.md
│   ├── business_logic.md
│   ├── codebase-guide.md
│   ├── api-spec.md
│   ├── contributing.md
│   └── adr/
└── tech-context/
    ├── project-briefing.md
    └── briefing/
        ├── critical-rules.md
        ├── adrs-summary.md
        ├── backend-conventions.md
        └── tech-stack.md
```

---

### Passo 2 — Iniciar o orquestrador

Com a documentação pronta, execute:

```
/init
```

**Primeira vez — onboarding:**

```
1. Seu nome ou nome da empresa
2. Setor / tipo de projeto principal
3. Linguagem de saída preferida (PT-BR / EN-US / outro)
4. IDE principal
```

Cria `docs/_memory/company.md` e `docs/_memory/preferences.md` automaticamente.

**Menu principal** (quando já existem squads):

```
🟢 auth-mobile · backend · Sistema de autenticação    (ativo)
🟡 pagamentos-v2 · fullstack · Módulo de pagamentos   (pausado)
✨ Criar novo squad
```

Se não há squads ativos, vai direto para seleção de domínio.

---

### Passo 3 — Criar ou carregar um squad

**Seleção de domínio:**

```
⚙️  Backend   — APIs, serviços, banco de dados
🖥️  Frontend  — Interfaces, componentes, UX
🔀 Fullstack  — Features que cruzam front e back
📱 Mobile     — iOS, Android, React Native
☁️  DevOps    — Infra, CI/CD, containers
📊 IA / Dados — ML, pipelines de dados, LLMs
📋 Produto    — Discovery, spec, handoff
✨ Customizado — Monte seu próprio squad
```

**Configuração do squad:**

1. Agents base (sempre incluídos) + agents opcionais para adicionar
2. Modo de operação: **⚡ Alta Performance** ou **💰 Econômico**
3. Descrição do objetivo (1-2 frases)
4. Nome/slug (ou auto-gerado como `backend-001`)

**Arquivos criados:**

```
.synapos/squads/{slug}/
├── squad.yaml
├── agents/
└── pipeline/
    ├── pipeline.yaml
    └── steps/

docs/.squads/{slug}/
├── _memory/memories.md    ← aprendizados persistentes entre sessões
└── output/                ← resultados de cada execução
```

**Carregando squad existente:**

```
Squad auth-mobile carregado.

▶️  Continuar de onde parou
🔄  Nova execução (manter contexto)
🧠  Ver memória do squad
⏸️  Pausar / arquivar squad
```

---

### Passo 4 — Execução do pipeline

O Pipeline Runner executa os steps em sequência:

```
[GATE-0] Verificando integridade e documentação...   ✅
[Step 1] design-api        → Alexandre (Arquiteto de API)
[Step 2] checkpoint        → aguarda aprovação humana  ⏸
[Step 3] implementacao     → Bruno (Dev Backend)
[Step 4] seguranca         → Sergio (Especialista em Segurança)
[Step 5] review            → Roberto (Revisor de Código)
```

**GATE-0** é obrigatório no início de todo pipeline. Verifica se `docs/` existe, se o framework está íntegro e se o squad está configurado. Falha → bloqueia.

**Checkpoints** aguardam aprovação humana. Você pode aprovar, pedir revisão ou vetar.

Outputs salvos em: `docs/.squads/{slug}/output/{YYYY-MM-DD-HHmmss}/`

---

### Resumo visual

```
/setup:start
    ├── /setup:build-business   → docs/business/
    ├── /setup:build-tech       → docs/tech/
    └── /setup:discover         → docs/tech-context/

/init
    ├── onboarding (1ª vez)     → docs/_memory/
    ├── squads ativos?
    │   ├── sim → selecionar squad existente
    │   └── não → selecionar domínio
    ├── configurar agents + modo + contexto
    ├── criar .synapos/squads/{slug}/
    └── pipeline runner
            ├── GATE-0
            ├── steps (agents + checkpoints)
            └── output → docs/.squads/{slug}/output/
```

---

## Primeira execução

Na primeira vez que o Synapos roda, ele faz o onboarding:

```
Olá! Sou o Synapos — framework de orquestração de agents.
Antes de começar, preciso de algumas informações rápidas:

1. Seu nome ou nome da empresa:
2. Setor / tipo de projeto principal:
3. Linguagem de saída preferida: [PT-BR / EN-US / outro]
4. IDE principal: [Claude / Cursor / Trae / outro]
```

Essas informações são salvas em `docs/_memory/` e usadas em todas as sessões seguintes.

---

## Criando um squad

Após o onboarding, o Synapos apresenta o menu principal:

```
Qual domínio você quer trabalhar?

  ⚙️  Backend
  🖥️  Frontend
  🔀 Fullstack
  📋 Produto
  📱 Mobile
  ☁️  DevOps / Infra
  📊 IA / Dados
  ✨ Customizado
```

Cada squad tem agents base (sempre incluídos) e agents opcionais. Você escolhe o modo de operação:

- **Alta Performance** — squad completo, documentação máxima, revisões aprofundadas
- **Econômico** — agents essenciais, execução rápida

O squad criado fica em `.synapos/squads/{slug}/` com agents, pipeline e memória isolados.

---

## Exemplos de uso rápido

```bash
# Instalar apenas frontend para Claude Code e Cursor
npx synapos front

# Instalar fullstack para múltiplas IDEs
npx synapos full

# Instalar frontend + backend + devops de uma vez
npx synapos front back devops
```

---

## Opções do CLI

```
npx synapos [squad...] [options]

Options:
  -v, --version    Exibe a versão
  -h, --help       Exibe a ajuda
```

---

## Versão

`1.4.0`
