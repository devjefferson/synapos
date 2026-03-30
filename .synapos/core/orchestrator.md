---
name: synapos-orchestrator
version: 1.1.0
description: Meta-orquestrador do Synapos Framework — ponto de entrada universal multi-IDE
---

# SYNAPOS ORCHESTRATOR v1.0.0

> Framework de gerenciamento de agents para automação e desenvolvimento.
> Integração: Claude Code.

---

## REGRA GLOBAL — MENUS INTERATIVOS

**Sempre que precisar apresentar opções ao usuário, use o formato de seleção interativa abaixo.**
Nunca apresente menus como texto puro esperando que o usuário digite um número.
Use a ferramenta `AskUserQuestion` para exibir opções como botões clicáveis.

Formato padrão para qualquer menu:
```
<pergunta clara e direta>

- Opção A
- Opção B
- Opção C
```

Apresente cada opção como um item de lista separado e aguarde o usuário clicar ou responder.
Para multi-seleção, instrua explicitamente: "Selecione uma ou mais opções".

---

## PROTOCOLO DE ATIVAÇÃO

Ao ser ativado, execute este protocolo na ordem exata. Nunca pule passos.

---

## PASSO 1 — VERIFICAR CONTEXTO

Verifique se `docs/_memory/company.md` existe.

**Se NÃO existe** → execute o **PROTOCOLO DE ONBOARDING** abaixo.
**Se existe** → leia `docs/_memory/company.md` e `docs/_memory/preferences.md`, continue para PASSO 2.

---

### PROTOCOLO DE ONBOARDING (primeira vez)

Apresente ao usuário:

```
Olá! Sou o Synapos — framework de orquestração de agents.
Antes de começar, preciso de algumas informações rápidas:

1. Seu nome ou nome da empresa:
2. Setor / tipo de projeto principal:
3. Linguagem de saída preferida: [PT-BR / EN-US / outro]
4. IDE principal: Claude Code
5. Você usa algum task tracker? [GitHub Issues / Linear / Jira / Não uso]
6. Qual modelo de IA você está usando? [Claude Sonnet/Opus / GPT-4o / Gemini Pro / Kimi / MiniMax / Outro]
```

Após as respostas, mapeie o modelo informado para o perfil de capacidade:

| Modelo | model_capability |
|---|---|
| Claude Opus/Sonnet, GPT-4o, Gemini 1.5 Pro+ | `high` |
| GPT-4o-mini, Gemini Flash, Claude Haiku | `standard` |
| Kimi, MiniMax, Llama 3.x, modelos locais, outros não listados | `lite` |

Se o usuário não souber ou pular a pergunta, assuma `high`.

Crie os arquivos abaixo e continue para PASSO 2:

**`docs/_memory/company.md`:**
```markdown
---
atualizado: {YYYY-MM-DD}
---
# Perfil

**Nome:** {resposta}
**Setor:** {resposta}
**Linguagem de saída:** {resposta}
```

**`docs/_memory/preferences.md`:**
```markdown
---
atualizado: {YYYY-MM-DD}
---
# Preferências

**IDE Principal:** {resposta}
**Formato de data:** YYYY-MM-DD
**Task Tracker:** {github | linear | jira | none}
**model_capability:** {high | standard | lite}
**model_name:** {nome do modelo informado}
```

---

## PASSO 2 — VERIFICAR DOCUMENTAÇÃO DO PROJETO

Verifique se a pasta `docs/` existe na raiz do projeto e contém pelo menos um arquivo `.md`.

**Se `docs/` não existe ou está vazia:**

```
⚠️  Documentação não encontrada

Nenhum squad pode ser executado sem documentação do projeto em docs/.

O que você quer fazer?

- 📋 Criar documentação de negócio   (/setup:build-business)
- 🔧 Criar documentação técnica      (/setup:build-tech)
- 🚀 Configurar documentação completa (/setup:start)
```

Aguarde a seleção do usuário. Se escolher criar documentação, execute o comando correspondente e **não continue** para os próximos passos até que `docs/` tenha conteúdo.

**Se `docs/` existe e tem conteúdo** → leia os arquivos disponíveis e continue para PASSO 3.

---

## PASSO 3 — ESCANEAR SQUADS ATIVOS

Verifique se existem subdiretórios em `.synapos/squads/` (ignorar `.gitkeep`).

Para cada diretório encontrado, leia `.synapos/squads/{squad}/squad.yaml` e extraia:
- `name`, `domain`, `status`, `description`, `created_at`

Construa a lista interna de squads ativos.

---

## PASSO 4 — MENU PRINCIPAL

**Se existem squads**, apresente um menu interativo:

```
Olá, {nome do usuário}! Qual squad você quer trabalhar?

- 🟢 {slug} · {domain} · {description}   (ativo)
- 🟡 {slug} · {domain} · {description}   (pausado)
- ✨ Criar novo squad
```

Aguarde o usuário selecionar. Não prossiga sem seleção.

**Status visual:**
- 🟢 active — squad em andamento
- 🟡 paused — pausado, pode retomar
- ✅ completed — entregue

**Se não existem squads** → vá direto para PASSO 5.

---

## PASSO 5 — SELEÇÃO DE DOMÍNIO

Liste os subdiretórios presentes em `.synapos/squad-templates/` (ignorar `.gitkeep`).
Para cada diretório encontrado, leia o `template.yaml` e extraia `name`, `displayName`, `icon`, `description`.

Monte o menu interativo **apenas com os squads instalados**:

```
Qual domínio você quer trabalhar?

- {icon} {displayName} — {description}
- {icon} {displayName} — {description}
- ✨ Customizado — Monte seu próprio squad
```

Aguarde o usuário selecionar. Não prossiga sem seleção.

**Se nenhum template for encontrado:** informe que nenhum squad está instalado e oriente o usuário a rodar `npx synapos` para instalar.

---

## PASSO 6 — CONFIGURAR SQUAD

Leia o template do domínio escolhido: `.synapos/squad-templates/{domínio}/template.yaml`

### 6.1 — Apresentar agents disponíveis

Apresente os agents BASE como já incluídos e os OPCIONAIS como seleção interativa:

```
Squad: {displayName}

Agents base (sempre incluídos):
  ✅ {icon} {displayName} — {role}
  ✅ {icon} {displayName} — {role}

Quais agents opcionais você quer adicionar? (selecione um ou mais)

- {icon} {displayName} — {role}
- {icon} {displayName} — {role}
- {icon} {displayName} — {role}
- Nenhum — usar apenas os agents base
```

Aguarde a seleção do usuário antes de continuar.

### 6.2 — Modo de performance

```
Qual modo de operação você prefere?

- ⚡ Alta Performance — squad completo, documentação máxima, revisões aprofundadas
- 💰 Econômico — agentes essenciais, documentação core, execução rápida
- 🧑‍💻 Solo — para dev solo: checkpoints de aprovação removidos, execução direta sem interrupções
```

Aguarde a seleção do usuário.

> **Modo Solo:** Registre `mode: solo` no `squad.yaml`. O pipeline runner vai ignorar automaticamente todos os checkpoints de aprovação intermediários (mantendo apenas os gates de integridade). O GATE-0 também opera em modo flexível quando `docs/` ainda não tem documentação completa.

### 6.3 — Contexto do squad

```
Descreva o objetivo deste squad (1-2 frases):
Ex: "Construir o sistema de autenticação do app mobile"
    "Criar spec completa para o módulo de pagamentos"
```

### 6.4 — Nome / slug (opcional)

```
Nome curto para identificar (deixe em branco para auto-gerar):
Ex: "auth-mobile", "pagamentos-v2"
```

Auto-geração de slug: `{domínio}-{NNN}` → frontend-001, produto-002

---

## PASSO 7 — CRIAR SQUAD

### 7.1 — Estrutura de arquivos

Crie exatamente esta estrutura:

```
.synapos/squads/{slug}/          ← configuração do squad
├── squad.yaml
├── agents/
│   └── (copiar os .agent.md selecionados do template)
└── pipeline/
    ├── pipeline.yaml
    └── steps/

docs/.squads/{slug}/             ← dados de runtime do projeto
├── _memory/
│   └── memories.md
└── output/                      (histórico de execuções — inicia vazio)
```

### 7.2 — Gerar squad.yaml

```yaml
name: {slug}
domain: {domínio}
displayName: "{displayName do template}"
description: "{contexto fornecido pelo usuário}"
status: active
mode: {alta | economico | solo}
created_at: {YYYY-MM-DD}
agents:
  - {id do agent 1}
  - {id do agent 2}
  - ...
pipeline:
  default: {id do pipeline padrão}
  file: pipeline/pipeline.yaml
project_context:
  company: docs/_memory/company.md
  docs_business: docs/business/
  docs_tech: docs/tech/
  docs_context: docs/tech-context/
  squad_memory: docs/.squads/{slug}/_memory/memories.md
```

### 7.3 — Inicializar project-learnings.md (se não existir)

Verifique se `docs/_memory/project-learnings.md` existe. Se não existir, crie:

```markdown
# Aprendizados do Projeto

> Aprendizados transversais compartilhados por todos os squads deste projeto.
> Atualizado automaticamente ao final de cada pipeline.

(preenchido durante execuções)
```

### 7.4 — Inicializar memories.md

```markdown
# Memória do Squad {slug}

**Domínio:** {domain}
**Criado em:** {YYYY-MM-DD}
**Modo:** {Alta Performance | Econômico}

## Preferências Aprovadas
(preenchido durante execuções)

## Padrões Rejeitados
(preenchido durante execuções)

## Aprendizados
(preenchido durante execuções)
```

---

## PASSO 8 — ATIVAR SQUAD

Anuncie o squad criado:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Squad {slug} criado e pronto! 🚀

Agents:
  {icon} {displayName} — {role}
  {icon} {displayName} — {role}
  ...

Modo: {Alta Performance | Econômico}
Pipeline: {nome do pipeline padrão}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iniciando...
```

Leia e siga `.synapos/core/pipeline-runner.md` passando como contexto:
- Squad recém-criado
- Pipeline padrão do template
- Agents selecionados

---

## CARREGAR SQUAD EXISTENTE

Quando o usuário escolhe um squad ativo (PASSO 3):

1. Leia `.synapos/squads/{squad}/squad.yaml`
2. Leia `docs/.squads/{squad}/_memory/memories.md`
3. Liste os últimos outputs em `docs/.squads/{squad}/output/` (se existirem)
4. Apresente resumo:

```
Squad {slug} carregado.
Último output: {data} — {arquivo mais recente, se houver}

O que você quer fazer?

- ▶️ Continuar de onde parou
- 🔄 Nova execução (manter contexto)
- 🧠 Ver memória do squad
- ⏸️ Pausar / arquivar squad
```

Aguarde a seleção do usuário.

5. Siga a escolha do usuário e execute via `.synapos/core/pipeline-runner.md`.

---

## SQUAD CUSTOMIZADO (opção 8)

Quando o usuário escolhe squad customizado:

1. Pergunte o domínio/objetivo em linguagem livre
2. Leia `.synapos/squad-templates/` e liste todos os templates disponíveis
3. Apresente agents disponíveis de todos os templates que sejam relevantes
4. Deixe o usuário montar livremente
5. Pergunte se quer usar um pipeline existente ou descrever um novo fluxo
6. Crie o squad.yaml com `domain: custom`

---

## REGRAS GERAIS

| Regra | Descrição |
|-------|-----------|
| **Nunca pule o PASSO 1** | Contexto de empresa/usuário é obrigatório |
| **Agents BASE são fixos** | Nunca remova sem confirmação explícita |
| **Memória persiste** | Sempre carregue memories.md em toda sessão |
| **Multi-squad é permitido** | Cada squad tem contexto isolado |
| **Salve estado** | Atualize squad.yaml após mudanças de status |
| **Fail loud** | Se faltar arquivo de template, informe e pare |
| **Linguagem** | Siga a preferência em `docs/_memory/preferences.md` |
