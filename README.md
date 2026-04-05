# Synapos

> Workflow system para trabalhar com IA em projetos reais.

Synapos organiza **como você usa LLMs no desenvolvimento** — não é um agente mágico, é uma estrutura que faz a IA trabalhar melhor no seu projeto específico.

```bash
npx synapos
```

---

## O que é

Synapos resolve um problema concreto: **a IA esquece tudo entre conversas**.

Cada feature do seu projeto ganha uma **session** — uma pasta com contexto persistente que qualquer role de IA lê antes de começar a trabalhar. O resultado é uma IA que sabe o que foi decidido, por que, e o que não fazer.

```
docs/.squads/sessions/{feature}/
├── context.md       ← o que é, por que existe, decisões tomadas, o que não fazer
├── memories.md      ← aprendizados acumulados
├── architecture.md  ← desenho técnico
└── plan.md          ← plano de execução
```

Isso persiste entre conversas, entre roles, entre dias.

---

## O que não é

- ❌ Não é multi-agent real — os roles são simulados sequencialmente pelo mesmo modelo
- ❌ Não garante execução determinística — é tão bom quanto o modelo que você usa
- ❌ Não substitui código ou decisões de arquitetura — estrutura o ambiente para a IA trabalhar melhor

---

## Como funciona

```
/init → escolhe um role (backend, frontend, produto...)
      → escolhe modo (⚡ Rápido ou 🔵 Completo)
      → pipeline executa steps
      → contexto salvo na session
```

Roles simulados disponíveis:

```bash
npx synapos add backend
npx synapos add frontend
npx synapos add fullstack
npx synapos add mobile
npx synapos add devops
npx synapos add produto
npx synapos add ia-dados
```

Cada role inclui agents especializados (arquiteto, dev, reviewer) que a IA simula durante a execução.

---

## Modos de execução

| Modo | Quando usar | O que injeta |
|------|-------------|--------------|
| ⚡ Rápido | Bug fix, ajuste, quick change | Contexto da session apenas |
| 🔵 Completo | Feature nova, refactor, arquitetura | Session + docs/ do projeto + ADRs |

---

## O diferencial real: sessions

A maioria das ferramentas de IA trata cada conversa como um começo do zero.

Com Synapos, cada feature acumula contexto ao longo do tempo:

- **Decisões registradas** → a IA não repropõe o que já foi descartado
- **Armadilhas documentadas** → erros não se repetem
- **Contexto compartilhado** → qualquer role que entrar na feature lê o mesmo contexto

```bash
/session              # lista todas as features ativas
/session auth-module  # abre o contexto de uma feature específica
/session consolidate  # compacta memórias quando o arquivo crescer
```

---

## Qualidade integrada

Três gates ativos em todas as execuções:

- **GATE-0** → arquivos obrigatórios existem antes de começar
- **GATE-3** → output não está vazio ou é placeholder
- **GATE-5** → confirmação visual de entrega

Decisões fora do escopo são sinalizadas com `[?]` no output — o role para e aguarda sua aprovação antes de continuar.

---

## Skills (integrações)

```bash
npx synapos add skill brave-search
npx synapos add skill playwright
npx synapos add skill github
```

Skills injetam ferramentas ou instruções no contexto do agent durante a execução.

---

## Estrutura gerada

```
.synapos/               → core do framework (não edite)
  squads/               → configuração dos roles ativos
  squad-templates/      → templates por domínio
  skills/               → integrações instaladas
docs/
  _memory/              → perfil do projeto e preferências
  .squads/sessions/     → contexto persistente por feature
  tech/                 → documentação técnica (opcional)
  business/             → documentação de negócio (opcional)
```

---

## Compatibilidade

Funciona em qualquer IDE com suporte a agentes:

- Claude Code
- Cursor
- Trae
- OpenCode

Compatível com qualquer modelo (Claude, GPT, Gemini, modelos locais).

---

## Instalação

```bash
npx synapos
```

Ou instale um role direto:

```bash
npx synapos add backend
```

---

## Contribua

Projeto open source em evolução.

👉 [Abra uma issue](https://github.com/devjefferson/synapse/issues)
👉 Dê uma estrela se achar útil
