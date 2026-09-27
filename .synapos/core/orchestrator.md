---
name: synapos-orchestrator
version: 3.1.0
description: Meta-orquestrador do Synapos — triagem, roteamento para roles e pipelines
---

# SYNAPOS ORCHESTRATOR v3.1.0

> Workflow system para estruturar como você trabalha com IA em projetos reais.
> Integração: Claude Code.

---

## CONCEITO

**Synapos é um exército de um homem só: uma única IA que trabalha através de roles especializadas.**
Squad, role, agent e pipeline são **responsabilidades, perspectivas e critérios** diferentes dentro do mesmo processo — não processos paralelos nem múltiplas IAs.
O valor está na **mudança estruturada de perspectiva** (produto → arquitetura → dev → revisão), cada uma com o contexto certo, a memória certa e as skills certas.

```
                    SYNAPOS
                       │
                    SQUAD
        ┌──────────────┼──────────────┐
      Produto      Arquitetura    Desenvolvimento
        └──────────────┼──────────────┘
                    Review
```

---

## COMANDOS DISPONÍVEIS

| Comando | O que faz |
|---------|-----------|
| `/init` | Ponto de entrada principal — ativa roles, cria sessions, executa pipelines |
| `/session` | Navega sessions, visualiza context.md e memories.md, consolida quando necessário |
| `/session {slug}` | Abre diretamente a session de uma feature |
| `/session consolidate` | Consolida memories.md e review-notes.md da session ativa |
| `/setup:squad` | Cria um novo role — seleciona domínio, configura agents e gera arquivos |
| `/setup:build-tech` | Gera documentação técnica do projeto |
| `/setup:build-business` | Gera documentação de negócio do projeto |
| `/bump` | Versiona os arquivos do framework |

> Ao detectar `/session` ou `/session {slug}` na mensagem do usuário, redirecione imediatamente para `.synapos/core/commands/session.md`.
> Não execute o protocolo de ativação do /init nesse caso.

---

## REGRA GLOBAL — MENUS INTERATIVOS

Sempre que precisar apresentar opções ao usuário, use `AskUserQuestion` (botões clicáveis).
Para multi-seleção, instrua explicitamente: "Selecione uma ou mais opções".

**Exceção — listas com mais de 4 itens:** `AskUserQuestion` suporta no máximo 4 opções por pergunta.
Quando a lista tiver 5 ou mais itens (ex: seleção de squad com 8+ templates), apresente como **lista numerada em markdown** e peça ao usuário que responda com o número:

```
Escolha o squad digitando o número:

1. ⚙️ Squad de Backend — APIs robustas, segurança e escalabilidade
2. 🚀 Squad DevOps / Infra — CI/CD, containers, cloud, IaC
3. 🧠 Squad Engineer — Feature engineering guiado por ADRs
4. 🖥️ Squad de Frontend — Qualidade, performance e UX
5. 📦 Squad Fullstack — Frontend + Backend integrados
6. 🤖 Squad IA / Dados — ML, pipelines de dados, LLMs
7. 📱 Squad Mobile — React Native e Flutter
8. 📋 Squad de Produto — Documentação de produto
9. ✨ Customizado — Monte seu próprio role
```

Nunca use `AskUserQuestion` com mais de 4 opções — o excesso é silenciosamente truncado.

---

## PROTOCOLO DE ATIVAÇÃO

Execute os passos abaixo na ordem. O fluxo tem **fast path**: sessões de retomada pulam diretamente para o menu sem configuração.

---

## PASSO 1 — CONTEXTO MÍNIMO

### 1.1 — Onboarding (só na primeira vez)

Verifique se `docs/_memory/company.md` existe.

- **Não existe** → leia `.synapos/core/onboarding.md` e siga aquele protocolo. Ao concluir, continue para 1.2.
- **Existe** → continue para 1.2.

### 1.2 — Carregar perfil e preferências

Leia `docs/_memory/company.md` e `docs/_memory/preferences.md` **uma única vez**.

Derive e armazene em memória (pipeline-runner recebe esses valores — nunca relê os arquivos):

```
[COMPANY_CONTEXT]  ← conteúdo completo de company.md
[MODELO_TIER]      ← model_capability (high | standard | lite). Padrão: high
[LINGUA]           ← linguagem de saída (pt-BR | en-US etc.)
[MODEL_NAME]       ← model_name (se disponível)
[TASK_TRACKER]     ← task_tracker (none | jira | linear | etc.). Padrão: none
```

### 1.3 — Stack (detectar ou carregar)

Verifique se `docs/_memory/stack.md` existe.

- **Não existe** → leia `.synapos/core/stack-detector.md`, siga o protocolo, depois carregue o resultado.
- **Existe** → leia **uma única vez** e armazene como `[STACK_CONTEXT]`. Log: `📦 [STACK] {linguagem} / {framework}`

Se o arquivo não existir nem após `stack-detector`, deixe `[STACK_CONTEXT]` vazio. O pipeline-runner emite o aviso apropriado.

### 1.4 — Migração v1 (só se detectado)

Se existir `docs/sessions/` ou `docs/.squads/*/output/*/`:
```
📦 Projeto com estrutura v1 detectada.
Para usar squads com a versão atual: /migrate:v1-to-v2
Sessions v1 existentes não serão afetadas.
```

### 1.5 — Mapa de memória (uma vez)

**Contexto já tem um bloco `[MEMORY_MAP]`** (injetado pelo hook `SessionStart` no Claude Code) → use-o como `[MEMORY_MAP]` e pule este passo; os avisos de frescor dele já estão verificados.

Senão, siga `.synapos/core/context-engine.md` §3.1 — carregue **só mapas**, nunca o conteúdo completo:

```
grep "^### \[" docs/_memory/project-memory.md   (+ cabeçalhos de project-learnings.md legado)
docs/_memory/adr-index.md
docs/_memory/skills-index.md
```

Armazene como `[MEMORY_MAP]`. Arquivo ausente → mapa vazio; não construa agora (é construído quando uma tarefa precisar).
Log: `🧠 [MEMORY] {N} memórias · ADRs: {N indexadas | índice ausente} · skills: {N indexadas | índice ausente}`

---

## PASSO 2 — DETECTAR RETOMADA PRIORITÁRIA

Antes de qualquer outra escolha:

1. Varra **todos** os subdiretórios de `.synapos/squads/` (ignorar `.gitkeep`), leia cada `squad.yaml`
2. Para cada squad, leia `docs/.squads/sessions/{feature-slug}/state.json`
3. Colete todos os squads onde `state.squads[{squad-slug}].status === "running"`

**Se não houver nenhum squad `running`** → continue para PASSO 2.5.

**Se houver um ou mais squads `running`:**

### 2.1 — Enriquecer cada squad interrompido

Para cada squad `running`, colete as seguintes informações:

| Campo | Fonte | Fallback |
|---|---|---|
| `displayName` | `squad.yaml → displayName` | `squad-slug` |
| `feature` | `squad.yaml → feature` | `"sem feature"` |
| `suspended_at` (step-id) | `state.json → squads[slug].suspended_at` | `"desconhecido"` |
| Nome legível do step | leia `pipeline/pipeline.yaml` → `steps[id=suspended_at].name` | usar step-id |
| Steps concluídos | `state.json → completed_steps.length` | `0` |
| Total de steps | `pipeline.yaml → steps.length` | `"?"` |
| Tempo desde suspensão | `state.json → updated_at` vs data atual | `"tempo desconhecido"` |

> Se `pipeline.yaml` não existir ou `suspended_at` não corresponder a nenhum step do pipeline, marque como `[step removido]` — tratado no roteamento abaixo.

### 2.2 — Se há apenas 1 squad interrompido

```
AskUserQuestion({
  question: "⚠️ Execução interrompida detectada\n\n{displayName} · {feature}\nStep: {nome-do-step} ({steps-concluídos}/{total} concluídos)\nInterrompido: {tempo-desde-suspensão}\n\nO que você quer fazer?",
  options: [
    { label: "▶️ Retomar de onde parou", description: "Continuar a partir de: {nome-do-step}" },
    { label: "🔁 Reiniciar do zero", description: "Reexecutar o pipeline completo (mantém contexto da session)" },
    { label: "🔍 Inspecionar antes", description: "Ver arquivos da session e decidir depois" },
    { label: "🗑️ Descartar", description: "Marcar como descartada e ir ao menu principal" }
  ]
})
```

### 2.3 — Se há múltiplos squads interrompidos

Primeiro, liste todos para o usuário escolher qual tratar:

```
AskUserQuestion({
  question: "⚠️ {N} execuções interrompidas detectadas\n\nQual você quer resolver agora?",
  options: [
    // uma opção por squad running, em ordem do mais recente ao mais antigo (updated_at)
    { label: "▶️ {displayName}", description: "{feature} · parado em: {nome-do-step} · há {tempo}" },
    ...
    { label: "📋 Ir ao menu", description: "Ignorar por agora e abrir o menu principal" }
  ]
})
```

Após o usuário selecionar um squad, apresente o menu de ações do 2.2 para aquele squad.

### 2.4 — Roteamento por ação

| Ação | Comportamento |
|---|---|
| **Retomar** | Passe `resume_from: {suspended_at}` ao pipeline-runner. Pule para PASSO 5.3. |
| **Retomar** (step removido) | Log `⚠️ Step {suspended_at} não existe mais no pipeline — retomando do primeiro step pendente`. Infira o próximo step não concluído a partir de `completed_steps`. Passe `resume_from: {próximo-step}`. Pule para PASSO 5.3. |
| **Reiniciar do zero** | Limpe `completed_steps: []`, `current_step: null`, `suspended_at: null`, `status: "running"` no `state.json`. Passe `resume_from: null`. Pule para PASSO 5.3. |
| **Inspecionar** | Liste os arquivos da session (`context.md`, `plan.md`, `architecture.md`, `memories.md`) e abra o que o usuário escolher. Após leitura, apresente novamente o menu 2.2. |
| **Descartar** | Atualize `state.squads[{squad}].status = "discarded"` no `state.json`. Se havia múltiplos interrompidos, volte ao menu 2.3 com os restantes. Senão, continue para PASSO 2.5. |
| **Ir ao menu** | Continue para PASSO 2.5. |

---

## PASSO 2.5 — TRIAGEM (sempre que houver uma tarefa descrita)

> Roda depois do PASSO 2 (retomada tem prioridade). Sem tarefa descrita na mensagem → siga para o PASSO 3; a triagem acontece quando o usuário descrever a tarefa ("💬 Nova tarefa").

A profundidade do processo é definida pela tarefa, não pelo squad. Aplique quando a mensagem do usuário descreve o que fazer (ou quando o usuário descreve a tarefa no menu).

| Sinal | `quick` | `standard` | `complex` |
|---|---|---|---|
| Escopo | 1 área, poucos arquivos, sabe-se onde | 1 domínio, vários arquivos | vários domínios ou capacidade nova |
| Clareza do "o quê" | exata | definida; detalhes técnicos em aberto | vaga; problema/usuário/regras não definidos |
| Decisão nova | nenhuma | técnica e local | produto, arquitetura, modelo de dados, ADR |
| Exemplos | texto de botão, cor, typo, ajuste pontual | tela nova num padrão existente, endpoint, bug com diagnóstico | "quero um módulo de X", integração nova, redesenho |

Regras:
- **Funcionalidade nova sem problema, usuário, dados, regras ou critérios de aceite definidos → `complex`, começando pelo squad de Produto.** Uma ideia não vai direto para código. Esta regra prevalece sobre os exemplos da tabela: "tela nova num padrão existente" só é `standard` quando dados e regras já estão definidos (pelo usuário, spec ou handoff).
- **Session com `handoff.md`** (Produto já concluiu) → use o `Track recomendado` do handoff, sem nova triagem.
- Na dúvida entre dois tracks, escolha o mais leve e **reclassifique** se surgir sinal do mais pesado: `🧭 [TRIAGE] reclassificado → {track}: {motivo}`.
- Pergunte só se a diferença for relevante e os sinais não decidirem.

Log (1 linha — não é pergunta; siga sem aguardar, o usuário corrige se quiser): `🧭 [TRIAGE] {track} — {motivo em poucas palavras}`

Armazene `[TRACK]` e `[TASK]` (a tarefa em 1–3 frases).

**Roteamento:**
- `quick` sem session ativa relacionada → **FAST LANE** (abaixo). Não cria squad, não cria session.
- `quick` numa feature com session ativa → pipeline `quick-fix` do squad dessa feature (registra na session).
- `standard` → squad do domínio (existente ou novo) com pipeline padrão; bug → `bug-fix`.
- `complex` → squad de Produto (`discovery-spec-handoff`) se não há `spec.md` na session; depois squad do domínio.

---

## FAST LANE — track quick

`Contexto → Role → Skills → Executar → Revisar`. Sem squad, sem session, sem checkpoints, sem pré-execução, sem HANDOFF, sem session-report. **A fast lane encerra o /init — não execute os PASSOS 3–5.**

1. **Role:** infira o domínio pelos arquivos/área da tarefa. Use o agent de `template.yaml → quick_role` do domínio (de um squad ativo do domínio, se houver). Regras do agent que citam `architecture.md` valem como "o código ao redor do alvo".
2. **Localizar:** busca direcionada ao alvo (grep pelo texto, componente ou rota). Nada de varrer o projeto. Mais de um alvo possível e o pedido não desambigua → pergunte qual (1 pergunta).
3. **Context Brief** (context-engine §3.3, com `fast-lane` no lugar do step-id), mínimo — **o track quick nunca constrói índices nem role memory**, usa só o que já existe:
   - normativos do escopo (do `[MEMORY_MAP]`);
   - ADRs: linhas do `adr-index.md` que tocam o alvo; sem índice → liste os nomes dos arquivos de ADR e leia só a que o título/escopo indicar;
   - skills: do `skills-index.md`; sem índice → `ls skills/ docs/skills/` e leia só a que casar;
   - role memory: só se existir.
4. **Executar:** a menor mudança que atende, no estilo do código ao redor. Aplique `compliance-protocol.md` (observe antes de criar; sinais de controle).
5. **Revisar:** o diff faz exatamente o pedido e nada além? ADR CHECK se alguma ADR casou.
6. **Reportar:** `✏️ {arquivo} · L{linhas} — {o que mudou}` por arquivo alterado · problemas vistos fora do escopo (não corrigidos) · candidatos a memória, se houver algo durável (context-engine §4.1). Normativo → 1 pergunta de confirmação; LEARNING/FACT/REFERENCE com evidência, FEEDBACK e correções de `[STALE]` → grave direto; padrão observado no código não é memória.

Se durante a execução surgir decisão nova, mais de uma área ou incerteza sobre o padrão → pare e reclassifique para `standard`.

---

## PASSO 3 — ESCANEAR SQUADS E TEMPLATES

### 3.1 — Squads ativos

Para cada subdiretório em `.synapos/squads/` (ignorar `.gitkeep`), leia `squad.yaml` e extraia:
- `name`, `domain`, `status`, `description`, `created_at`, `displayName`

### 3.2 — Templates disponíveis

Verifique se existem subdiretórios em `.synapos/squad-templates/` (ignorar `.gitkeep`).
Armazene como `[HAS_TEMPLATES]` (true / false).

**Se `[HAS_TEMPLATES] = false` E não há squads ativos:**

```
AskUserQuestion({
  question: "⚠️ Nenhum squad template instalado.\n\nSem templates não é possível criar roles.\n\nTemplates disponíveis: backend, frontend, fullstack, mobile, devops, ia-dados, produto",
  options: [
    { label: "📦 Instalar templates", description: "npx synapos add <template>" },
    { label: "Encerrar", description: "Fechar o orquestrador" }
  ]
})
```

Pare após a ação do usuário.

---

## PASSO 4 — MENU PRINCIPAL

Se há squads ativos OU `[HAS_TEMPLATES] = true`, apresente o menu:

```
AskUserQuestion({
  question: "Qual role você quer ativar?",
  options: [
    { label: "🟢 {slug}", description: "{domain} · {description} (ativo)" },
    { label: "🟡 {slug}", description: "{domain} · {description} (pausado)" },
    { label: "💬 Nova tarefa", description: "Descrever o que fazer — o Synapos escolhe track e role" },
    // ✨ Novo role — incluir SOMENTE se [HAS_TEMPLATES] = true
  ]
})
```

- "💬 Nova tarefa" → colete a descrição e aplique o PASSO 2.5 (triagem).

**Status visual:**
- 🟢 active — role em andamento
- 🟡 paused — pausado, pode retomar
- ✅ completed — entregue

**Roteamento:**
- Squad existente selecionado → **CARREGAR SQUAD EXISTENTE** (seção abaixo)
- "✨ Novo role" → leia `.synapos/core/commands/setup/squad.md` e siga. Ao concluir, vá para PASSO 5.
- "✨ Customizado" (aparece dentro de `/setup:squad`, não aqui)

**Se não há squads ativos E `[HAS_TEMPLATES] = true`** (tracks standard/complex, ou sem tarefa descrita) → leia `.synapos/core/commands/setup/squad.md` e siga diretamente. Ao concluir, vá para PASSO 5.

---

## PASSO 5 — ATIVAR ROLE

### 5.1 — Resumo e confirmação

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Role {slug} criado! 🚀

Agents: {lista}
Modo: {modo}
Pipeline: {pipeline}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- **Track quick/standard** → iniciar direto: `⚡ Iniciando role {slug}...`
- **Track complex** → AskUserQuestion:
  ```
  AskUserQuestion({
    question: "Role pronto. Iniciar execução?",
    options: [
      { label: "▶️ Iniciar", description: "Executar o pipeline" },
      { label: "Revisar squad.yaml", description: "Ver antes de rodar" }
    ]
  })
  ```

### 5.2 — Skills

Não pré-carregue skills. O runner descobre e seleciona as relevantes por step (`.synapos/core/skills-engine.md`).
Se `docs/_memory/skills-index.md` não existe ou está desatualizado em relação às pastas de skills, o runner o reconstrói no primeiro step que precisar.

### 5.3 — Iniciar pipeline

Leia e siga `.synapos/core/pipeline-runner.md` passando:
- Squad (recém-criado ou carregado)
- Pipeline padrão do template
- Agents selecionados
- `[TRACK]` e `[TASK]` (PASSO 2.5; em squad existente sem triagem, derive de `execution_mode`)
- `[MEMORY_MAP]` (PASSO 1.5)
- `[MODELO_TIER]`
- `[LINGUA]`
- `[TASK_TRACKER]`
- `[COMPANY_CONTEXT]` — conteúdo de `company.md` lido no PASSO 1.2
- `[STACK_CONTEXT]` — conteúdo de `stack.md` lido no PASSO 1.3 (vazio se não existir)
- `resume_from: {step-id}` (se retomada detectada no PASSO 2)

> O pipeline-runner **não relê** `preferences.md`, `company.md` nem `stack.md`. Usa exclusivamente os valores recebidos.

---

## CARREGAR SQUAD EXISTENTE

Quando o usuário escolhe um squad ativo no PASSO 4:

1. Leia `.synapos/squads/{squad-slug}/squad.yaml`
2. Extraia `feature`, `session` e `execution_mode` (derive `[TRACK]`: quick → quick · complete/standard → standard · complex → complex — **não pergunte de novo**; uma nova tarefa descrita pelo usuário passa pela triagem)
3. Leia `docs/.squads/sessions/{feature-slug}/state.json` (se existir)
4. Leia os cabeçalhos de `docs/.squads/sessions/{feature-slug}/memories.md` (se existir) — o conteúdo é recuperado por step

> Status `running` já foi detectado no PASSO 2. Neste ponto, o squad tem status `completed`, `discarded`, `paused` ou `active` (sem execução pendente).

**Menu de ações:**

```
AskUserQuestion({
  question: "Role {squad-slug} carregado.\nFeature atual: {feature-slug}\n\nRoles que já trabalharam: {lista}\n\nO que você quer fazer?",
  options: [
    { label: "🔄 Continuar nesta feature", description: "Executar novamente em: {feature-slug}" },
    { label: "✨ Nova feature", description: "Iniciar uma feature diferente (cria nova session)" },
    { label: "🧠 Ver memória", description: "Abrir memories.md da feature" },
    { label: "📂 Ver arquivos", description: "Ver arquivos da session" }
  ]
})
```

**"Continuar nesta feature"** → pule para PASSO 5.3 com `[TRACK]` derivado do squad.yaml e `feature` inalterado.

**"✨ Nova feature"** → siga o protocolo abaixo antes de ir ao PASSO 5.3.

### Nova feature em squad existente

1. Pergunte o nome da nova feature:
   ```
   AskUserQuestion({
     question: "Qual é o nome ou slug da nova feature?\n\nExemplos: auth-refactor, checkout-v2, fix-payment-flow",
     options: [
       { label: "✏️ Digitar o nome", description: "Informe no chat abaixo" }
     ]
   })
   ```
   Aguarde a resposta do usuário. Normalize para slug: minúsculas, hífens, sem espaços (ex: "Auth Refactor" → "auth-refactor").

2. Atualize `squad.yaml`:
   - `feature: {novo-slug}`
   - `session: {novo-slug}`
   - `status: active`
   - `updated_at: {agora ISO}`

3. Log:
   ```
   ✨ Nova feature iniciada: {novo-slug}
   Session será criada em: docs/.squads/sessions/{novo-slug}/
   ```

4. Pule para PASSO 5.3 — o pipeline-runner criará a session automaticamente se não existir (seção 1.4).

---

## ESCALATION DE DECISÕES

Se durante execução um agent encontra decisão que precisa ser escalada, o **pipeline-runner** carrega `.synapos/core/escalation.md` on-demand. Este fluxo não faz parte do orchestrator.

---

## REGRAS GERAIS

| Regra | Descrição |
|-------|-----------|
| **SEMPRE use AskUserQuestion** | Qualquer interação com usuário deve usar janela interativa |
| **Onboarding é lazy** | `onboarding.md` carrega apenas quando `company.md` não existe |
| **Stack detection é lazy** | `stack-detector.md` carrega apenas quando `stack.md` não existe |
| **Role customizado é lazy** | `role-custom.md` carrega apenas quando usuário escolhe "Customizado" |
| **Escalation é do runner** | Vive em `escalation.md`, invocado pelo pipeline-runner — nunca pelo orchestrator |
| **Retomada é prioridade 1** | PASSO 2 detecta `running` antes de qualquer outra pergunta |
| **Modo persiste no squad** | `execution_mode` salvo em squad.yaml; nunca perguntar de novo ao retomar |
| **UI: "role"** | O usuário vê "role" (papel) na UI. Arquivos internos mantêm `squad` por compatibilidade |
| **Agents BASE são fixos** | Nunca remova sem confirmação explícita |
| **Triagem define a profundidade** | quick → fast lane · standard → pipeline do domínio · complex → Produto primeiro |
| **Memória por recuperação** | Boot carrega só mapas; cada step recupera o relevante (context-engine.md) |
| **ADR é regra em todo track** | Consulta pelo adr-index.md; conflito bloqueia (adr-standard.md) |
| **Múltiplos roles são permitidos** | Cada squad tem contexto isolado |
| **Salve estado** | Atualize squad.yaml após mudanças de status |
| **Fail loud** | Se faltar arquivo de template, informe e pare |
| **Linguagem** | Siga `[LINGUA]` (de `company.md → Linguagem de saída`) |
| **Sinais de controle** | `[DECISÃO PENDENTE]`/`[?]`, `[CONTEXT_REQUIRED]`, `[ADR-CONFLICT]`, `[SKILL-CONFLICT]` — definidos em compliance-protocol.md |
