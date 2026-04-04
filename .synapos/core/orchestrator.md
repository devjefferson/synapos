---
name: synapos-orchestrator
version: 1.5.0
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

**Use AskUserQuestion para cada pergunta.**

```
AskUserQuestion({
  question: "Olá! Sou o Synapos — framework de orquestração de agents.\n\nAntes de começar, qual é o nome da empresa ou projeto?",
  options: [
    { label: "Vou informar", description: "Informar nome" }
  ]
})
```

```
AskUserQuestion({
  question: "Qual é o setor ou tipo de projeto?",
  options: [
    { label: "SaaS / Software", description: "Produto de software como serviço" },
    { label: "E-commerce", description: "Loja virtual / marketplace" },
    { label: "Aplicativo Mobile", description: "App para celulares" },
    { label: "API / Backend", description: "Apenas backend/API" },
    { label: "Ferramenta Interna", description: "Software para uso interno" },
    { label: "Open Source", description: "Projeto open source" },
    { label: "Outro", description: "Vou especificar" }
  ]
})
```

```
AskUserQuestion({
  question: "Qual linguagem de saída preferida?",
  options: [
    { label: "Português (PT-BR)", description: "Documentação em português" },
    { label: "English (EN-US)", description: "Documentação em inglês" },
    { label: "Outro", description: "Vou especificar" }
  ]
})
```

```
AskUserQuestion({
  question: "Qual task tracker você usa?",
  options: [
    { label: "GitHub Issues", description: "Issues do GitHub" },
    { label: "Linear", description: "Linear" },
    { label: "Jira", description: "Jira" },
    { label: "Não uso", description: "Sem task tracker" }
  ]
})
```

```
AskUserQuestion({
  question: "Qual modelo de IA você está usando?",
  options: [
    { label: "Claude Opus/Sonnet", description: "Anthropic Claude premium" },
    { label: "GPT-4o", description: "OpenAI GPT-4o" },
    { label: "Gemini Pro", description: "Google Gemini Pro" },
    { label: "Kimi", description: "Kimi AI" },
    { label: "MiniMax", description: "MiniMax" },
    { label: "Outro", description: "Vou especificar" }
  ]
})
```

Após as respostas, mapeie o modelo para `model_capability`:

| Modelo | model_capability |
|---|---|
| Claude Opus/Sonnet, GPT-4o, Gemini 1.5 Pro+ | `high` |
| GPT-4o-mini, Gemini Flash, Claude Haiku | `standard` |
| Kimi, MiniMax, Llama 3.x, modelos locais | `lite` |

Se o usuário não souber, assuma `high`.

Crie os arquivos e continue para PASSO 2:

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

## PASSO 4 — MENU PRINCIPAL

**Se existem squads**, use AskUserQuestion:

```
AskUserQuestion({
  question: "Olá, {nome do usuário}! Qual squad você quer trabalhar?",
  options: [
    { label: "🟢 {slug}", description: "{domain} · {description} (ativo)" },
    { label: "🟡 {slug}", description: "{domain} · {description} (pausado)" },
    { label: "✨ Criar novo squad", description: "Montar um novo squad do zero" }
  ]
})
```

**Status visual:**
- 🟢 active — squad em andamento
- 🟡 paused — pausado, pode retomar
- ✅ completed — entregue

**Se não existem squads** → vá direto para PASSO 5.

---

## PASSO 5 — SELEÇÃO DE DOMÍNIO

Liste os subdiretórios em `.synapos/squad-templates/` e leia `template.yaml` para cada um.

Monte as opções para AskUserQuestion:

```
AskUserQuestion({
  question: "Qual domínio você quer trabalhar?",
  options: [
    { label: "{icon} {displayName}", description: "{description}" },
    { label: "{icon} {displayName}", description: "{description}" },
    { label: "✨ Customizado", description: "Monte seu próprio squad" }
  ]
})
```

**Se nenhum template for encontrado:** use AskUserQuestion para informar:

```
AskUserQuestion({
  question: "Nenhum squad template instalado.\n\nInstale templates com: npx synapos",
  options: [
    { label: "Voltar", description: "Voltar ao menu" }
  ]
})
```

---

## PASSO 6 — CONFIGURAR SQUAD

Leia o template do domínio escolhido: `.synapos/squad-templates/{domínio}/template.yaml`

> **Restrições por `[EXECUTION_MODE]` — aplique antes de qualquer pergunta:**
>
> | | BOOTSTRAP | STANDARD | STRICT |
> |---|---|---|---|
> | **Pipelines disponíveis** | quick-fix, bug-fix | todos | todos |
> | **Agents opcionais** | não apresenta | apresenta | apresenta |
> | **Modo de performance** | fixado em `solo` | apresenta opções | apresenta opções |
> | **squad.yaml `execution_mode`** | `bootstrap` | `standard` | `strict` |
>
> Em **BOOTSTRAP**: se o template não tiver `quick-fix` nem `bug-fix`, ofereça `quick-fix` como opção genérica.

### 6.1 — Agents disponíveis (SELEÇÃO INTERATIVA)

**Use AskUserQuestion para apresentar os agents.**

```
AskUserQuestion({
  question: "Squad: {displayName}\n\nAgents base (sempre incluídos):\n  ✅ {icon} {displayName} — {role}\n  ✅ {icon} {displayName} — {role}\n\nQuais agents opcionais você quer adicionar?",
  multiSelect: true,
  options: [
    { label: "{icon} {displayName}", description: "{role}" },
    { label: "{icon} {displayName}", description: "{role}" },
    { label: "{icon} {displayName}", description: "{role}" },
    { label: "Nenhum adicional", description: "Usar apenas agents base" }
  ]
})
```

Aguarde a seleção. Agents base são sempre incluídos.

### 6.2 — Modo de performance (SELEÇÃO INTERATIVA)

**Use AskUserQuestion:**

```
AskUserQuestion({
  question: "Qual modo de operação você prefere?",
  options: [
    {
      label: "⚡ Alta Performance",
      description: "Squad completo, documentação máxima, revisões aprofundadas — para features críticas"
    },
    {
      label: "💰 Econômico",
      description: "Docs core, execução rápida, menos checkpoints — para tasks bem definidas"
    },
    {
      label: "🧑‍💻 Solo",
      description: "Para dev solo: sem checkpoints de aprovação, execução direta — para quick fixes"
    }
  ]
})
```

> **Importante:** O modo de performance NÃO afeta quais agents são instalados.
> - Agents base → sempre incluídos
> - Agents opcionais selecionados → sempre incluídos
>
> O modo afeta apenas:
> - Quantidade de etapas de documentação/revisão
> - Exigência de aprovação em checkpoints intermediários
> - Nível de detalhamento dos outputs

> **Modo Solo:** Registre `mode: solo` no `squad.yaml`. O pipeline runner ignora checkpoints de aprovação intermediários (mantendo gates de integridade).

### 6.3 — Nome / slug do squad (SELEÇÃO OU INPUT)

**Use AskUserQuestion com opção de input:**

```
AskUserQuestion({
  question: "Qual nome para identificar este squad?",
  options: [
    { label: "Auto-gerar", description: "Gerar: {domínio}-001" },
    { label: "Definir nome", description: "Vou informar o nome" }
  ]
})
```

Se "Definir nome": peça input livre.
Auto-geração: `{domínio}-{NNN}` → backend-001, frontend-002

### 6.4 — Contexto do squad (INPUT LIVRE)

**Use AskUserQuestion com input:**

```
AskUserQuestion({
  question: "Descreva o objetivo deste squad (1-2 frases):",
  options: [
    { label: "Vou describir", description: "Ex: Implementar endpoints de autenticação" }
  ]
})
```

Seção 6.5 — Feature Session (SELEÇÃO INTERATIVA)

**Use AskUserQuestion:**

```
AskUserQuestion({
  question: "Este squad trabalha em qual feature?",
  options: [
    { label: "📂 Session existente", description: "Selecionar feature já criada" },
    { label: "✨ Nova feature", description: "Criar nova feature session" }
  ]
})
```

**Se "Session existente":**
Liste as pastas em `docs/.squads/sessions/` com AskUserQuestion:

```
AskUserQuestion({
  question: "Selecione a feature session:",
  options: [
    { label: "{feature-slug}", description: "{descrição do state.json}" },
    { label: "{feature-slug}", description: "{descrição}" }
  ]
})
```

**Se "Nova feature":**

```
AskUserQuestion({
  question: "Qual é o nome/slug da nova feature?",
  options: [
    { label: "Vou informar", description: "Ex: auth-module, feat/pagamentos" }
  ]
})
```

`{feature-slug}` = lowercase, espaços → hífens, sem caracteres especiais.

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
feature: {feature-slug}
session: docs/.squads/sessions/{feature-slug}/
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
  session: docs/.squads/sessions/{feature-slug}/
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

## PASSO 8 — ATIVAR SQUAD

### 8.1 — Resumo e Confirmação

**Use AskUserQuestion antes de iniciar:**

```
AskUserQuestion({
  question: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSquad {slug} criado e pronto! 🚀\n\nAgents:\n  {icon} {displayName} — {role}\n  {icon} {displayName} — {role}\n\nModo: {Alta Performance | Econômico}\nPipeline: {nome do pipeline padrão}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  options: [
    { label: "▶️ Iniciar Squad", description: "Executar o pipeline agora" },
    { label: "Revisar Squad", description: "Verificar configurações antes de iniciar" },
    { label: "Cancelar", description: "Voltar sem iniciar" }
  ]
})
```

### 8.2 — Verificação de Skills

Antes de iniciar o pipeline:
1. Leia os arquivos de steps do pipeline
2. Busque por menções a skills nos steps
3. Para cada skill, verifique se `.synapos/skills/{skill-name}/SKILL.md` existe

Se alguma skill não está instalada:
```
AskUserQuestion({
  question: "⚠️ Skills não instaladas detectadas no pipeline:\n  ✗ {skill-name-1}\n  ✗ {skill-name-2}\n\nEstas skills melhoram a qualidade dos outputs mas não são obrigatórias.",
  options: [
    { label: "Continuar sem skills", description: "Prosseguir mesmo sem as skills" },
    { label: "Instalar skills primeiro", description: "Cancelar e instalar as skills" }
  ]
})
```

Se todas as skills estão instaladas:
```
✅ Skills verificadas: {lista de skills disponíveis}
```

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

**Se `status` é `"completed"`, `"discarded"` ou não existe entrada para este squad** → menu padrão:

```
Squad {squad-slug} carregado.
Feature: {feature-slug}
Session: docs/.squads/sessions/{feature-slug}/

Squads que já trabalharam nesta feature:
  {lista de state.squads com status e completed_at}

O que você quer fazer?

- 🔄 Nova execução deste squad (manter contexto da session)
- 🧠 Ver memória da feature
- 📂 Ver arquivos da session
- ⏸️ Pausar / arquivar squad
```

Aguarde a seleção do usuário.

5. Siga a escolha do usuário e execute via `.synapos/core/pipeline-runner.md`.

---

## SQUAD CUSTOMIZADO

Quando o usuário escolhe squad customizado:

1. **Pergunte o domínio/objetivo com AskUserQuestion:**

```
AskUserQuestion({
  question: "Qual é o objetivo deste squad customizado?",
  options: [
    { label: "Backend API", description: "Foco em endpoints e lógica de servidor" },
    { label: "Frontend Web", description: "Foco em UI e experiência do usuário" },
    { label: "Fullstack", description: "Frontend + Backend juntos" },
    { label: "Mobile", description: "App iOS/Android" },
    { label: "DevOps/Infra", description: "Infraestrutura e pipelines" },
    { label: "Outro", description: "Vou descrever o objetivo" }
  ]
})
```

2. Leia `.synapos/squad-templates/` e liste todos os agents disponíveis com AskUserQuestion (multi-select)

3. **Seleção de pipeline:**

```
AskUserQuestion({
  question: "Qual pipeline usar?",
  options: [
    { label: "Feature Development", description: "Discovery → Arquitetura → Implementação → Review" },
    { label: "Bug Fix", description: "Diagnóstico → Fix → Testes → Review" },
    { label: "Quick Fix", description: "Mudança rápida sem aprovações" },
    { label: "Customizado", description: "Descrever um novo fluxo" }
  ]
})
```

4. Crie o squad.yaml com `domain: custom`

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
