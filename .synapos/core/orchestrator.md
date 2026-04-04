---
name: synapos-orchestrator
version: 1.6.1
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

### Detecção de Projetos v1 (migração automática)

Verifique se existe a estrutura antiga de sessions (v1.x):
- `docs/sessions/` existe como diretório?
- `docs/.squads/*/output/*/` tem arquivos?

Se sim, avise:
```
📦 Projeto com estrutura v1 detectada.

Para usar squads com a versão atual (v2.0+), é necessário migrar.
  → Execute /migrate:v1-to-v2 para migração guiada

Enquanto isso, você pode continuar criando novos squads.
Sessions v1 existentes não serão afetadas.
```

Se não: nenhuma ação necessária.

---

### PROTOCOLO DE ONBOARDING (primeira vez)

**Use no MÁXIMO 2 AskUserQuestion para todo o onboarding.**

```
AskUserQuestion({
  question: "Olá! Sou o Synapos — framework de orquestração de agents.\n\nPreciso de algumas informações para configurar o ambiente:",
  options: [
    { label: "Nome do projeto/empresa", description: "Ex: Acme Inc, Meu SaaS" },
    { label: "Setor", description: "SaaS, E-commerce, API, Mobile..." },
    { label: "Task tracker", description: "GitHub, Linear, Jira ou nenhum" },
    { label: "Modelo de IA", description: "Claude, GPT-4o, Gemini, Kimi, MiniMax..." }
  ],
  multiSelect: true
})
```

> Se o usuário selecionar apenas "Nome", pergunte o restante via input livre.
> Se o usuário não souber o modelo, assuma `high`.

**Mapeamento de model_capability:**

| Modelo | model_capability |
|---|---|
| Claude Opus/Sonnet, GPT-4o, Gemini 1.5 Pro+ | `high` |
| GPT-4o-mini, Gemini Flash, Claude Haiku | `standard` |
| Kimi, MiniMax, Llama 3.x, modelos locais | `lite` |

**Linguagem:** Se não especificada, use o idioma do sistema ou русский inglês como padrão.

Crie os arquivos e continue para PASSO 2:

**`docs/_memory/company.md`:**
```markdown
---
atualizado: {YYYY-MM-DD}
---
# Perfil

**Nome:** {nome ou 'não informado'}
**Setor:** {setor ou 'não informado'}
**Linguagem de saída:** {pt-BR ou en-US, padrão: pt-BR}
```

**`docs/_memory/preferences.md`:**
```markdown
---
atualizado: {YYYY-MM-DD}
---
# Preferências

**IDE Principal:** Claude Code
**Formato de data:** YYYY-MM-DD
**Task Tracker:** {github | linear | jira | none}
**model_capability:** {high | standard | lite}
**model_name:** {nome do modelo ou 'não informado'}
```

---

## PASSO 2 — MODE DECISION SYSTEM

O orquestrador determina automaticamente o modo de execução cruzando dois fatores: **score de documentação** e **complexidade da tarefa**. Nunca bloqueia — sempre encontra um caminho de execução.

---

### 2.1 — Calcular Score de Documentação

Verifique a existência de cada item e some os pontos:

| Item | Pontos |
|------|--------|
| `docs/_memory/company.md` existe | +30 |
| `docs/tech/` existe com ≥ 1 arquivo `.md` | +20 |
| `docs/business/` existe com ≥ 1 arquivo `.md` | +20 |
| `docs/tech-context/` existe com ≥ 1 arquivo `.md` | +15 |
| Total de arquivos `.md` em `docs/` ≥ 5 | +15 |

**Score total possível: 100**

Armazene como `[DOC_SCORE]` (0–100).

---

### 2.2 — Inferir Complexidade da Tarefa

Pergunte ao usuário o que ele quer fazer. Se já houver contexto da mensagem inicial, use-o diretamente.

```
AskUserQuestion({
  question: "O que você quer fazer?",
  options: [
    { label: "Vou descrever", description: "Ex: corrigir bug no login, criar endpoint de pagamento..." }
  ]
})
```

Com base na descrição, classifique a complexidade:

| Complexidade | Palavras-chave e sinais |
|---|---|
| **LOW** | fix, typo, ajuste, quick, bug simples, texto, estilo, cor, label, tradução |
| **MEDIUM** | feature, endpoint, component, tela, módulo, integração, API, CRUD |
| **HIGH** | arquitetura, refactor, sistema, infra, migração, redesign, segurança, performance |

Se não for possível classificar → assuma `MEDIUM`.

Armazene como `[COMPLEXITY]` (LOW / MEDIUM / HIGH).

---

### 2.3 — Determinar Execution Mode

Aplique as regras na ordem exata:

| Condição | Execution Mode |
|---|---|
| `company.md` não existe e `[DOC_SCORE]` = 0 | **BOOTSTRAP** |
| `[COMPLEXITY]` = LOW | **BOOTSTRAP** |
| `[COMPLEXITY]` = MEDIUM e `[DOC_SCORE]` < 40 | **BOOTSTRAP** |
| `[COMPLEXITY]` = MEDIUM e `[DOC_SCORE]` ≥ 40 | **STANDARD** |
| `[COMPLEXITY]` = HIGH e `[DOC_SCORE]` < 70 | **STANDARD** |
| `[COMPLEXITY]` = HIGH e `[DOC_SCORE]` ≥ 70 | **STRICT** |

Armazene como `[EXECUTION_MODE]` (BOOTSTRAP / STANDARD / STRICT).

---

### 2.4 — Reagir ao Modo

**Se `[EXECUTION_MODE]` = BOOTSTRAP:**

Informe sem bloquear:
```
⚡ Bootstrap Mode
   Score de documentação: {DOC_SCORE}/100
   Complexidade detectada: {COMPLEXITY}

   Executando com contexto mínimo.
   Pipelines disponíveis: quick-fix, bug-fix

   Para desbloquear mais pipelines:
   → /setup:build-tech      (+35 pontos)
   → /setup:build-business  (+40 pontos)
```

Continue para PASSO 3.

**Se `[EXECUTION_MODE]` = STANDARD:**

Informe e continue:
```
🟡 Standard Mode
   Score de documentação: {DOC_SCORE}/100
   Complexidade detectada: {COMPLEXITY}

   Contexto parcial disponível. Gates ativos: GATE-0, GATE-ADR, GATE-DECISION.
```

Continue para PASSO 3.

**Se `[EXECUTION_MODE]` = STRICT:**

Informe e continue:
```
🔴 Strict Mode
   Score de documentação: {DOC_SCORE}/100
   Complexidade detectada: {COMPLEXITY}

   Contexto completo disponível. Todos os gates ativos. Máxima qualidade.
```

Continue para PASSO 3.

---

### 2.5 — Sugestão de upgrade (STANDARD e STRICT)

Se `[DOC_SCORE]` < 100, exiba ao final qual documentação faltante aumentaria o score:

```
💡 Documentação disponível pode melhorar o modo:
   {item ausente} → +{pontos} pontos
   Score atual: {DOC_SCORE}/100 → precisaria de {threshold} para {próximo modo}
```

Exiba apenas como informação — nunca bloqueie.

---

## PASSO 3 — ESCANEAR SQUADS ATIVOS

Verifique se existem subdiretórios em `.synapos/squads/` (ignorar `.gitkeep`).

Para cada diretório encontrado, leia `.synapos/squads/{squad}/squad.yaml` e extraia:
- `name`, `domain`, `status`, `description`, `created_at`

Construa a lista interna de squads ativos.

---

## PASSO 3.5 — VERIFICAR SQUAD TEMPLATES

Verifique se existem subdiretórios em `.synapos/squad-templates/` (ignorar `.gitkeep`).

Armazene como `[HAS_TEMPLATES]` (true / false).

**Se `[HAS_TEMPLATES]` = false:**

```
AskUserQuestion({
  question: "⚠️ Nenhum squad template instalado.\n\nSem templates não é possível criar squads.\n\nTemplates disponíveis: backend, frontend, fullstack, mobile, devops, ia-dados, produto",
  options: [
    { label: "📦 Instalar templates", description: "Instalar todos os templates padrão" },
    { label: "🔍 Ver como instalar", description: "Mostrar comandos npx synapos add" },
    { label: "Encerrar", description: "Fechar o orquestrador" }
  ]
})
```

- Se "Instalar templates": redirecione para instalação (passos definidos no README)
- Se "Ver como instalar": mostre `npx synapos add <template-name>`
- Se "Encerrar": pare aqui

**Pare a execução após a ação do usuário.**

---

## PASSO 4 — MENU PRINCIPAL

**Se existem squads**, monte o menu com AskUserQuestion.

Regra para a opção "Criar novo squad":
- **Inclua** `{ label: "✨ Criar novo squad", description: "Montar um novo squad do zero" }` **apenas se** `[HAS_TEMPLATES]` = true.
- **Se** `[HAS_TEMPLATES]` = false, **não inclua** essa opção e adicione um aviso no `question`: `"\n\n⚠️ Criação de squads indisponível — nenhum template instalado. Execute: npx synapos add <template>"`.

```
AskUserQuestion({
  question: "Olá, {nome do usuário}! Qual squad você quer trabalhar?{aviso se sem templates}",
  options: [
    { label: "🟢 {slug}", description: "{domain} · {description} (ativo)" },
    { label: "🟡 {slug}", description: "{domain} · {description} (pausado)" },
    // ✨ Criar novo squad — incluir SOMENTE se [HAS_TEMPLATES] = true
  ]
})
```

**Status visual:**
- 🟢 active — squad em andamento
- 🟡 paused — pausado, pode retomar
- ✅ completed — entregue

**Se não existem squads e `[HAS_TEMPLATES]` = true** → vá direto para PASSO 5.

**Se não existem squads e `[HAS_TEMPLATES]` = false** → já foi tratado no PASSO 3.5. Este passo nunca será alcançado nesse estado.

---

## PASSO 5 — SELEÇÃO DE DOMÍNIO

> **Pré-condição:** `[HAS_TEMPLATES]` = true (garantido pelo PASSO 3.5).

Liste **todos** os subdiretórios em `.synapos/squad-templates/` e leia `template.yaml` de cada um.

Monte a lista numerada completa e exiba como texto antes do AskUserQuestion:

```
Domínios disponíveis:

  1. {icon} {displayName} — {description}
  2. {icon} {displayName} — {description}
  3. {icon} {displayName} — {description}
  4. {icon} {displayName} — {description}
  5. {icon} {displayName} — {description}
  6. {icon} {displayName} — {description}
  7. {icon} {displayName} — {description}
  8. {icon} {displayName} — {description}
  9. ✨ Customizado — Monte seu próprio squad

Digite o número ou o nome do domínio:
```

```
AskUserQuestion({
  question: "Qual domínio você quer trabalhar?\n\nDomínios disponíveis:\n  1. {icon} {displayName} — {description}\n  2. {icon} {displayName} — {description}\n  3. {icon} {displayName} — {description}\n  4. {icon} {displayName} — {description}\n  5. {icon} {displayName} — {description}\n  6. {icon} {displayName} — {description}\n  7. {icon} {displayName} — {description}\n  8. {icon} {displayName} — {description}\n  9. ✨ Customizado — Monte seu próprio squad\n\nDigite o número ou o nome:",
  options: [
    { label: "1. {icon} {displayName}", description: "{description}" },
    { label: "2. {icon} {displayName}", description: "{description}" },
    { label: "3. {icon} {displayName}", description: "{description}" },
    { label: "4. {icon} {displayName}", description: "{description}" },
    { label: "5. {icon} {displayName}", description: "{description}" },
    { label: "6. {icon} {displayName}", description: "{description}" },
    { label: "7. {icon} {displayName}", description: "{description}" },
    { label: "8. {icon} {displayName}", description: "{description}" },
    { label: "9. ✨ Customizado", description: "Monte seu próprio squad" }
  ]
})
```

> **Importante:** os números dos options acima são gerados dinamicamente — itere sobre todos os subdiretórios encontrados em `.synapos/squad-templates/` em ordem alfabética, atribuindo índice 1, 2, 3… O item "✨ Customizado" é sempre o último.
>
> O usuário pode responder com o número (ex: `3`) ou com o nome do domínio (ex: `backend`). Ambos são aceitos.

**Roteamento obrigatório — execute apenas UM dos caminhos abaixo:**

- Se o usuário selecionou um template existente (por número ou nome) → **vá para PASSO 6**. Não execute SQUAD CUSTOMIZADO.
- Se o usuário selecionou "✨ Customizado" ou digitou `9` (ou o índice correspondente) → **vá para SQUAD CUSTOMIZADO**. Não execute PASSO 6.

---

## PASSO 6 — CONFIGURAR SQUAD

Leia o template do domínio escolhido: `.synapos/squad-templates/{domínio}/template.yaml`

> **Restrições por `[EXECUTION_MODE]`:**
>
> | | BOOTSTRAP | STANDARD | STRICT |
> |---|---|---|---|
> | **Pipelines disponíveis** | quick-fix, bug-fix | todos | todos |
> | **Agents opcionais** | não apresenta | apresenta | apresenta |
> | **Modo de performance** | fixado em `solo` | apresenta opções | apresenta opções |
> | **squad.yaml `execution_mode`** | `bootstrap` | `standard` | `strict` |

### 6.1 — Configuração (BOOTSTRAP = ZERO perguntas)

**BOOTSTRAP: Use defaults automáticas, sem perguntar**
- Agents: apenas base do template
- Modo: `solo`
- Nome: auto-gerado `{domínio}-{NNN}`
- Contexto: da mensagem/argumento do usuário

Log:
```
⚡ BOOTSTRAP: squad criado com defaults
   Agents: base | Modo: solo | Pipeline: {default}
```

**STANDARD/STRICT:pergunte (máximo 1 AskUserQuestion):**

```
AskUserQuestion({
  question: "Squad: {displayName}\n\nQuer usar defaults ou customizar?",
  options: [
    { label: "✅ Defaults", description: "Agents base + solo + auto-nome" },
    { label: "🔧 Customizar", description: "Escolher agents, modo, nome" }
  ]
})
```
  ],
  multiSelect: true
})
```

> Para cada seleção, faça uma pergunta específica (máximo 1 por item selecionado).
> Agents base são SEMPRE incluídos — nunca pergunte para remover.
> Auto-nome: `{domínio}-{NNN}` → backend-001, frontend-002

---

## PASSO 7 — CRIAR SQUAD

### 7.1 — Estrutura de arquivos

Crie exatamente esta estrutura:

```
.synapos/squads/{squad-slug}/          ← configuração do squad (framework)
├── squad.yaml
├── agents/
│   └── (copiar os .agent.md selecionados do template)
└── pipeline/
    ├── pipeline.yaml
    └── steps/

docs/.squads/sessions/{feature-slug}/  ← session da feature (criada pelo pipeline-runner)
├── context.md        (gerado na pré-execução)
├── architecture.md   (gerado na pré-execução)
├── plan.md           (gerado na pré-execução)
├── memories.md       (inicializado pelo runner)
├── review-notes.md   (inicializado pelo runner)
└── state.json        (inicializado pelo runner)
```

> A pasta `docs/.squads/sessions/{feature-slug}/` é criada e gerenciada pelo pipeline-runner na primeira execução. O orchestrator não cria esta pasta.

### 7.2 — Gerar squad.yaml

```yaml
name: {squad-slug}
domain: {domínio}
displayName: "{displayName do template}"
description: "{contexto do squad nesta feature}"
status: active
mode: {alta | economico | solo}
execution_mode: {bootstrap | standard | strict}   # determinado pelo Mode Decision System no PASSO 2
doc_score: {0-100}                                # score de documentação no momento da criação
created_at: {YYYY-MM-DD}
feature: ""        # preenchido no PASSO 7.5
session: ""        # preenchido no PASSO 7.5
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
  session: ""      # preenchido no PASSO 7.5
```

### 7.3 — Inicializar project-learnings.md (se não existir)

Verifique se `docs/_memory/project-learnings.md` existe. Se não existir, crie:

```markdown
# Aprendizados do Projeto

> Aprendizados transversais compartilhados por todos os squads deste projeto.
> Atualizado automaticamente ao final de cada pipeline.

(preenchido durante execuções)
```

---

## PASSO 7.5 — FEATURE SESSION

> **Executar apenas após o squad ter sido criado (arquivos do PASSO 7 já gravados).**

**Auto-detectar:** Liste as pastas em `docs/.squads/sessions/`.

- **Se 0 sessions existirem:** vá direto para criar nova (sem AskUserQuestion)
- **Se 1 session existir:** use ela automaticamente (sem AskUserQuestion)
- **Se 2+ existirem:** pergunte qual usar

```
AskUserQuestion({
  question: "Squad {squad-slug} criado! 🎉\n\nFeature session:",
  options: [
    { label: "✨ Nova: {auto-slug}", description: "Criar nova feature" },
    { label: "📂 {feature-1}", description: "Usar session existente" },
    { label: "📂 {feature-2}", description: "Usar session existente" }
  ]
})
```

Se "Nova": o slug é inferido do contexto do squad (ex: "bug-login" se o squad é sobre corrigir login).

`{feature-slug}` = lowercase, espaços → hífens, sem caracteres especiais.

Após obter o `{feature-slug}`, atualize `feature` e `session` no `squad.yaml`.

---

## PASSO 8 — ATIVAR SQUAD

### 8.1 — Resumo e Confirmação (1 AskUserQuestion)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Squad {slug} criado! 🚀

Agents: {lista}
Modo: {modo}
Pipeline: {pipeline}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**BOOTSTRAP:** iniciar direto sem AskUserQuestion
```
⚡ Iniciando squad {slug}...
```

**STANDARD/STRICT:** pedir confirmação
```
AskUserQuestion({
  question: "Squad pronto. Iniciar execução?",
  options: [
    { label: "▶️ Iniciar", description: "Executar o pipeline" },
    { label: "Revisar squad.yaml", description: "Ver antes de rodar" }
  ]
})
```

### 8.2 — Verificação automática de Skills

Silenciosamente antes de iniciar:
1. Leia os steps do pipeline
2. Verifique skills necessárias
3. Se skill ausente: log `⚠️ Skill {x} não encontrada — continuando sem ela`
4. Não bloqueia — apenas alerta

### 8.3 — Iniciar Pipeline

Após confirmação, leia e siga `.synapos/core/pipeline-runner.md` passando:
- Squad recém-criado
- Pipeline padrão do template
- Agents selecionados

---

## PROTOCOLO DE ESCALATION DE DECISÕES

Use quando um PM, agent ou usuário encontra uma decisão que não pode resolver sozinho.

**Gatilhos para escalation:**
- Decisão impacta mais de 1 squad ativo na mesma feature
- ADR proposta contradiz ADR existente com status `Aceito` ou `Ativo`
- Decisão técnica requer aprovação de stakeholder externo (CEO, CTO, cliente)
- Decisão com risco de negócio (mudança de modelo de preços, breaking change de API pública)

**Protocolo:**
1. Crie `[DECISÃO PENDENTE]` com id sequencial global (formato: `[DECISÃO PENDENTE] {feature-slug}-{N}`)
2. Registre em `docs/.squads/sessions/{feature-slug}/open-decisions.md`:
   ```markdown
   ## [DECISÃO PENDENTE] {feature-slug}-{N} — {YYYY-MM-DD}
   
   Contexto: {por que essa decisão é necessária}
   Opções:
     A) {opção A} — {prós/contras}
     B) {opção B} — {prós/contras}
   Recomendação: {opção e justificativa}
   
   requires_escalation: true
   escalation_owner: {A DEFINIR — preencha com o responsável}
   status: pending
   ```
3. Bloqueie o squad: `status → "blocked"`
4. Informe:
   ```
   ⏸ SQUAD BLOQUEADO — Escalation necessário
   
   Decisão pendente: {feature-slug}-{N}
   Arquivo: docs/.squads/sessions/{feature-slug}/open-decisions.md
   
   Preencha `escalation_owner` e resolva a decisão.
   Retome com /init → selecionar squad → "Retomar de onde parou".
   ```

**Ao retomar squad com status "blocked":**
1. Verifique `open-decisions.md`
2. Liste decisões com `status: pending`
3. Para cada uma: peça resolução ao usuário
4. Ao resolver: atualize `status: resolved` + registre a decisão tomada
5. Mude squad para `status: running` e retome

---

## CARREGAR SQUAD EXISTENTE

Quando o usuário escolhe um squad ativo (PASSO 3):

1. Leia `.synapos/squads/{squad-slug}/squad.yaml`
2. Extraia `feature` e `session` do squad.yaml
3. Leia `docs/.squads/sessions/{feature-slug}/state.json` (se existir)
4. Leia `docs/.squads/sessions/{feature-slug}/memories.md` (se existir)

### DETECTAR EXECUÇÃO INTERROMPIDA

No `state.json`, verifique `state.squads["{squad-slug}"]`:

**Se existe e tem `"status": "running"`** — sessão interrompida. Use AskUserQuestion:

```
AskUserQuestion({
  question: "⚠️ Execução anterior interrompida detectada\n\nSquad: {squad-slug}\nFeature: {feature-slug}\nÚltimo step: {suspended_at}\n\nO que você quer fazer?",
  options: [
    { label: "▶️ Retomar", description: "Continuar de onde parou ({suspended_at})" },
    { label: "🔄 Descartar", description: "Iniciar nova execução deste squad" }
  ]
})
```

- Se **Retomar**: passe `resume_from: {suspended_at}` para o pipeline-runner e execute.
- Se **Descartar**: atualize `state.squads["{squad-slug}"].status = "discarded"` e continue.

**Se `status` é `"completed"`, `"discarded"` ou não existe** → menu padrão:

```
AskUserQuestion({
  question: "Squad {squad-slug} carregado.\nFeature: {feature-slug}\n\nSquads que já trabalharam: {lista}\n\nO que você quer fazer?",
  options: [
    { label: "🔄 Nova execução", description: "Executar novamente (manter contexto)" },
    { label: "🧠 Ver memória", description: "Abrir memories.md da feature" },
    { label: "📂 Ver arquivos", description: "Ver arquivos da session" },
    { label: "⏸️ Pausar", description: "Pausar/arquivar squad" }
  ]
})
```

Aguarde a seleção do usuário.

5. Siga a escolha do usuário e execute via `.synapos/core/pipeline-runner.md`.

---

## SQUAD CUSTOMIZADO

Quando o usuário escolhe "✨ Customizado" no PASSO 5.

> O domínio já foi identificado como "customizado" — não pergunte novamente.

### Orientações:
- **Minimum:** 1 agent (base)
- **Recommended for feature:** 2-3 agents (base + 1-2 relevantes)
- **Avoid:** selecionar todos — overhead sem benefício
- Agents base são sempre incluídos — não precisam ser selecionados

### Passo 1 — Selecionar agents

```
AskUserQuestion({
  question: "Squad Customizado\n\nSelecione agents adicionais (além dos base):",
  options: [
    { label: "🧑‍💻 Dev Fullstack", description: "Para features integradas" },
    { label: "🎨 Designer/UX", description: "Para features com UI" },
    { label: "🔧 DevOps", description: "Para features com infra" },
    { label: "✅ Nenhum — só base", description: "Agents base apenas" }
  ],
  multiSelect: true
})
```

### Passo 2 — Selecionar pipeline

```
AskUserQuestion({
  question: "Qual pipeline para este squad?",
  options: [
    { label: "Feature Development", description: "Discovery → Arquitetura → Implementação → Review" },
    { label: "Bug Fix", description: "Diagnóstico → Fix → Testes → Review" },
    { label: "Quick Fix", description: "Mudança rápida sem aprovações" }
  ]
})
```

### Passo 3 — Criar squad.yaml

- Domain: `custom`
- DisplayName: `Squad Customizado`
- Mode: `solo` (padrão para custom)

---

## REGRAS GERAIS

| Regra | Descrição |
|-------|-----------|
| **SEMPRE use AskUserQuestion** | Qualquer interação com usuário deve usar janela interativa |
| **Nunca pule o PASSO 1** | Contexto de empresa/usuário é obrigatório |
| **Agents BASE são fixos** | Nunca remova sem confirmação explícita |
| **Memória persiste** | Sempre carregue memories.md em toda sessão |
| **Multi-squad é permitido** | Cada squad tem contexto isolado |
| **Salve estado** | Atualize squad.yaml após mudanças de status |
| **Fail loud** | Se faltar arquivo de template, informe e pare |
| **Linguagem** | Siga a preferência em `docs/_memory/preferences.md` |
