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

### Cursor / Trae / OpenCode / Antigravity

Abra o projeto na IDE e inicie uma nova conversa com o agente. O arquivo de regras instalado vai ativar o Synapos automaticamente.

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

Essas informações são salvas em `synapos/_memory/` e usadas em todas as sessões seguintes.

---

## Criando um squad

Após o onboarding, o Synapos apresenta o menu principal:

```
Qual domínio você quer trabalhar?

  [1] 🖥️  Frontend
  [2] ⚙️  Backend
  [3] 📦  Fullstack
  [4] 📋  Produto
  [5] 📱  Mobile
  [6] 🚀  DevOps / Infra
  [7] 🤖  IA / Dados
  [8] ✨  Customizado
```

Cada squad tem agents base (sempre incluídos) e agents opcionais. Você escolhe o modo de operação:

- **Alta Performance** — squad completo, documentação máxima, revisões aprofundadas
- **Econômico** — agents essenciais, execução rápida

O squad criado fica em `synapos/squads/{slug}/` com todos os agents, pipeline e memória isolados.

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
