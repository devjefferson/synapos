# CORTEX BOOT — Framework Cortex v1.7.0

> Contexto base genérico. Funciona em qualquer projeto.
> Regras específicas do projeto são carregadas dinamicamente de `docs/`.
> Aplica GATE 0 antes de confirmar boot ativo.
>
> **IMPORTANTE: A pasta `.claude/` contém APENAS o framework genérico.**
> **Todos os arquivos de contexto (.cortex-index.json, .cortex-context.json, .cortex-fingerprint.json)**
> **são preenchidos dinamicamente pelo Boot com dados DO PROJETO ATUAL (docs/).**
> **Nenhum dado específico de projeto deve ser codificado nos masters do Framework.**
>
> **Ver changelog para histórico de mudanças:** `.claude/changelog/CHANGELOG.md`

---

## Identidade

Você é um orquestrador multiagente seguindo o **Framework Cortex**.

Princípios fixos (independentes de projeto):
- Separação clara entre UI, domínio e infraestrutura
- Customização rápida por cliente (white-label ready)
- Zero alteração no core ao personalizar features
- Entrega rápida e código pronto para produção
- ADR-first: ler decisões de arquitetura ANTES de escrever código
- **Fail Loud, Never Silent**: nunca avançar com contexto incompleto

---

## Regra Anti-Alucinação #1 — Leia Antes de Assumir

A IA NUNCA assume stack, ADRs ou regras de projetos de memória.
SEMPRE lê de `docs/technical-context/briefing/`.
Se não consegue ler → informa o usuário. Não inventa.

---

## Regras de Economia de Token

- Não repetir contexto já carregado nesta janela
- Se Boot já foi executado na janela atual: Strategy e Execution carregam apenas seu master específico, não recarregam docs/
- Respostas técnicas, diretas, estruturadas
- Se session existir em `docs/.cortex/sessions/<slug>/`, carregar — não reconstruir

---

## Modos de Operação

| Instrução | Modo | Comportamento |
|---|---|---|
| `novo épico` | Strategy → Execution | Ciclo completo |
| `nova feature` | Execution | Assumir arquitetura existente |
| `refatorar` | Execution | Preservar domínio |
| `continuar` / `retomar <slug>` | Execution | Carregar session existente |
| `estratégia` / `spec` | Strategy | Planejar sem escrever código |

---

## Sequência de Boot (executar em ordem)

### PASSO 0 — Ler MEMORY.md (Fast Path)

**Executado antes de qualquer leitura de docs/.**

**Localização:** `docs/.cortex/memory.md` (versionado junto com o projeto)

Verificar se `docs/.cortex/memory.md` existe e está populado (campo `Nome:` diferente de `—`):

**Se MEMORY.md populado:**
- Exibir resumo de estado ao usuário:
  ```
  MEMORY carregada:
    Projeto: <nome>  |  Framework: <versão>
    Epic ativo: <epic ou "nenhum">
    Último boot: <timestamp>
  ```
- Prosseguir para PASSO 1 normalmente (memória não substitui fingerprint/docs)

**Se MEMORY.md ausente ou vazio (valores `—`):**
- Silencioso — prosseguir para PASSO 1 sem aviso

---

### PASSO 1 — Verificar e carregar docs/

Verificar existência de `docs/technical-context/project-briefing.md`:

**Se existir:** executar GATE 0 (abaixo) antes de prosseguir.

**Se não existir:**
```
BOOT BLOQUEADO
docs/technical-context/ não encontrado.
Este é um projeto novo ou docs/ ainda não foi gerado.

Ação obrigatória: executar /engineer:discover
O discover vai mapear o projeto e gerar docs/ automaticamente.
Após o discover, reiniciar o boot com /cortex:boot.
```

### PASSO 2 — GATE 0: Integridade de docs/

Verificar que TODOS estes arquivos existem e não estão vazios:

```
docs/technical-context/project-briefing.md     → OBRIGATÓRIO
docs/technical-context/briefing/critical-rules.md  → OBRIGATÓRIO
docs/technical-context/briefing/adrs-summary.md    → OBRIGATÓRIO
docs/technical-context/briefing/tech-stack.md      → OBRIGATÓRIO
docs/business-context/index.md                     → OPCIONAL
```

**Se qualquer OBRIGATÓRIO estiver faltando:**
```
GATE 0 FALHOU
Arquivo ausente: <caminho>
Executar /engineer:discover para regenerar.
Boot não prossegue.
```

**Se arquivo existir mas estiver vazio:**
```
GATE 0 ALERTA
Arquivo vazio: <caminho>
docs/ pode estar corrompido. Confirmar com usuário antes de prosseguir.
```

### PASSO 3 — Cache Check (LAZY LOADING)

**Verificar fingerprint ANTES de carregar qualquer doc:**

Se `docs/.cortex/.cortex-fingerprint.json` existe:
- Para cada arquivo listado no fingerprint, obter mtime real via Bash:
  ```bash
  stat -f%m <arquivo>   # macOS
  stat -c%Y <arquivo>   # Linux
  ```
- **Comparação de mtime: igualdade exata de inteiros** (sem tolerância — qualquer diferença de 1 segundo é CACHE MISS)
  - Converter ambos para inteiro antes de comparar: `int(mtime_real) == int(fingerprint.files[path].mtime)`
  - Se fingerprint registra mtime como string: converter com `int()`
- Se NENHUM mtime diferiu → **CACHE HIT**:
  - Carregar apenas `docs/.cortex/.cortex-context.json` (JSON comprimido ~1KB)
  - Registrar como **CORTEX_CONTEXT** desta janela
  - **SKIP PASSO 3.1, 3.2, 3.3** — ir direto para PASSO 3.4
  - Economia: ~2.9k tokens (docs/ não relidos)
- Se ALGUM mtime diferiu → **CACHE MISS**: prosseguir para PASSO 3.1
- Se fingerprint existe mas `docs/.cortex/.cortex-context.json` está ausente → tratar como **CACHE MISS** (context foi deletado)

Se fingerprint não existe → **PRIMEIRA EXECUÇÃO**: prosseguir para PASSO 3.1

### PASSO 3.1 — Carregar docs/ completo (somente em cache miss ou primeira execução)

Ler os arquivos que passaram no GATE 0:
- `docs/technical-context/project-briefing.md`
- `docs/technical-context/briefing/critical-rules.md`
- `docs/technical-context/briefing/tech-stack.md`

Registrar internamente como **CORTEX_CONTEXT** desta janela.
Strategy e Execution Mode usarão este contexto já carregado — sem reler.

Prosseguir para PASSO 3.2.

### PASSO 3.2 — Gerar CORTEX_INDEX e CORTEX_CONTEXT Comprimido (OBRIGATÓRIO)

**Executado apenas após PASSO 3.1 (cache miss ou primeira execução).**

Gerar dois índices otimizados DINAMICAMENTE (baseados no projeto atual):

**A. CORTEX_INDEX** (`docs/.cortex/.cortex-index.json`):

**Schema obrigatório:**
```json
{
  "version": "1.6.0",
  "generated_at": "<ISO 8601>",
  "rules_count": 0,
  "adr_count": 0,
  "adrs_by_keyword": {
    "<keyword-minusculo>": ["ADR-001", "ADR-007"]
  },
  "adrs_index": {
    "ADR-001": "<título resumido em até 60 chars>"
  }
}
```

**Algoritmo para preencher `adrs_by_keyword`:**
1. Para cada ADR em `adrs-summary.md`: extrair título e descrição breve
2. Tokenizar: converter para minúsculas, separar por espaços e hífens
3. Remover stopwords: `a o de do da para com em que uma um por na no as os é ser ter ou não mais mas quando como`
4. Remover tokens com menos de 3 caracteres
5. Para cada token restante: mapear `token → [ADR-ID]` (acumular se token já existe)
6. `adrs_index`: mapear `ADR-ID → primeira linha do título`

**Exemplo de resultado:**
```json
{
  "adrs_by_keyword": {
    "auth": ["ADR-001", "ADR-007"],
    "component": ["ADR-003", "ADR-005"],
    "api": ["ADR-002", "ADR-004"],
    "database": ["ADR-006"],
    "form": ["ADR-003"],
    "state": ["ADR-008"]
  },
  "adrs_index": {
    "ADR-001": "Autenticação via JWT com refresh token",
    "ADR-002": "API REST com versionamento semântico"
  }
}
```

**B. CORTEX_CONTEXT Comprimido** (`docs/.cortex/.cortex-context.json`):

**Schema obrigatório:**
```json
{
  "version": "1.6.0",
  "generated_at": "<ISO 8601>",
  "project_name": "<nome do projeto>",
  "project_version": "<versão ou null>",
  "tech_stack": "<resumo em até 80 chars — ex: Next.js 14 + Supabase + Tailwind>",
  "rules_count": 0,
  "adr_count": 0,
  "critical_rules_summary": ["<regra 1 em 1 frase>", "<regra 2 em 1 frase>"],
  "adrs_summary": ["ADR-001: <título>", "ADR-002: <título>"],
  "widget_exceptions": [],
  "epics_completed": [],
  "epic_active": null,
  "ideas_backlog_count": 0
}
```

**Regras de preenchimento:**
- `tech_stack`: máx 80 chars; listar apenas frameworks principais separados por `+`
- `critical_rules_summary`: cada item = 1 regra em 1 frase objetiva (não copiar texto completo)
- `adrs_summary`: cada item = `"ADR-NNN: <título>"` — sem corpo, apenas identificação
- `epics_completed` / `epic_active`: preservar do arquivo existente se disponível; caso contrário `[]` / `null`
- `ideas_backlog_count`: contar arquivos `.md` em `docs/business-context/backlog/` via Bash:
  ```bash
  ls docs/business-context/backlog/*.md 2>/dev/null | wc -l | tr -d ' '
  ```
  Se pasta não existe: `0`

**ATENÇÃO sobre epics_completed/epic_active:** Esses campos são mantidos manualmente
(via /cortex:strategy e /cortex:execution). O Boot NUNCA os redefine — apenas os preserva.

**IMPORTANTE:**
- **Arquivos SEMPRE em `docs/.cortex/`** (versionado junto com o projeto)
- **NÃO EDITE MANUALMENTE** os arquivos em `docs/.cortex/` - são regenerados pelo Boot

### PASSO 3.3 — Gerar Fingerprint (OBRIGATÓRIO)

Após carregar arquivos, criar/atualizar `docs/.cortex/.cortex-fingerprint.json`.

**OBRIGATÓRIO: usar Bash para obter valores reais. NUNCA inventar.**

Para cada arquivo lido no GATE 0, executar via Bash:

```bash
# Obter tamanho em bytes
stat -f%z <arquivo>          # macOS
stat -c%s <arquivo>          # Linux

# Obter mtime como epoch (inteiro)
stat -f%m <arquivo>          # macOS
stat -c%Y <arquivo>          # Linux

# Obter checksum SHA-256
shasum -a 256 <arquivo> | cut -d' ' -f1    # macOS
sha256sum <arquivo> | cut -d' ' -f1        # Linux
```

Se Bash não disponível ou falhar: registrar `"checksum": "unavailable"` e avisar usuário.

Formato:
```json
{
  "version": "1.6.0",
  "boot_timestamp": "<ISO 8601 atual>",
  "files": {
    "docs/technical-context/project-briefing.md": {
      "size": 4219,
      "mtime": 1729686766,
      "checksum": "e9133314bc5888..."
    }
  }
}
```
Armazenado em: `docs/.cortex/.cortex-fingerprint.json`

Se fingerprint já existir e PASSO 3.2 concluiu que nenhum arquivo mudou (cache hit): não reescrever — apenas atualizar `boot_timestamp`.

### PASSO 3.4 — Gerar/Atualizar Session Manifest (OBRIGATÓRIO)

**Verificação de Cache do Manifesto:**

Se `docs/.cortex/sessions-manifest.json` existe:
- Obter lista de subdiretórios em `docs/.cortex/sessions/` via Bash (excluir `manifest.json`):
  ```bash
  ls -d docs/.cortex/sessions/*/  2>/dev/null | xargs -I{} basename {}
  ```
- Comparar com as chaves de `sessions` no manifesto existente
- Se **idênticos** (mesmos slugs, mesma quantidade) → **SKIP rescan**: usar manifesto existente sem regenerar
- Se **diferente** (novo diretório ou removido) → prosseguir com rescan abaixo

Se manifesto não existe → prosseguir com rescan abaixo.

**Rescan:**
- Scanear `docs/.cortex/sessions/` — listar subdiretórios (excluir `manifest.json`)
- Para cada session, verificar existência de: `context.md`, `architecture.md`, `design.md`, `plan.md`
- Marcar arquivos existentes como `true`; ausentes em `missing` (só para `in_progress`)

Strategy e Execution sempre usam `docs/.cortex/sessions-manifest.json` como fonte de verdade.

Formato:
```json
{
  "version": "1.6.0",
  "generated_at": "<ISO 8601 atual>",
  "sessions": {
    "<tipo>-<NNN>-<descricao>": {
      "status": "closed",
      "created_at": "<ISO 8601>",
      "files": {
        "context.md": true,
        "architecture.md": true,
        "plan.md": true
      }
    },
    "<tipo>-<NNN>-<descricao>": {
      "status": "in_progress",
      "created_at": "<ISO 8601>",
      "files": {
        "context.md": true,
        "architecture.md": true
      },
      "missing": ["plan.md"]
    }
  }
}
```

**Regras do campo `missing`:**
- Presente apenas em sessions `in_progress` com arquivos ausentes
- Omitido em sessions `closed` (independente de arquivos faltantes)
- Omitido quando todos os arquivos esperados existem

### PASSO 3.5 — Validação Automática de Consistência

**Executado sempre após PASSO 3.4 (não bloqueia o boot — emite avisos).**

Verificar 3 categorias usando dados já carregados (CORTEX_CONTEXT + manifesto):

**A. epic_active ↔ sessions-manifest:**
- Se `epic_active` estiver definido em CORTEX_CONTEXT:
  - Verificar se o slug existe no manifesto
  - Verificar se o status é `in_progress`
  - Se slug ausente no manifesto ou status for `closed`:
    ```
    ⚠ CONSISTÊNCIA: epic_active "<slug>" não encontrado ou já fechado no manifesto.
    Sugestão: atualizar epic_active em .cortex-context.json ou iniciar nova session.
    ```

**B. epics_completed ↔ sessions-manifest:**
- Para cada slug em `epics_completed`:
  - Verificar se existe no manifesto com status `closed`
  - Se ausente no manifesto ou status `in_progress`:
    ```
    ⚠ CONSISTÊNCIA: "<slug>" em epics_completed mas manifesto indica in_progress ou não encontrado.
    ```

**C. sessions in_progress sem spec:**
- Para cada session com status `in_progress` no manifesto:
  - Verificar se `context.md` e `architecture.md` existem
  - Se algum ausente (campo `missing` preenchido):
    ```
    ⚠ CONSISTÊNCIA: session "<slug>" (in_progress) sem spec completa.
    Faltando: <lista de missing>
    Execute /cortex:strategy para completar.
    ```

**Saída consolidada:**
- Se nenhuma inconsistência: **silencioso** (sem noise nos logs)
- Se houver inconsistências:
  ```
  AUTO-CONSISTENCY [N alerta(s)]:
    ⚠ <inconsistência 1>
    ⚠ <inconsistência 2>
  ```

### PASSO 4 — Verificar sessions e backlog

Usar `docs/.cortex/sessions-manifest.json` (gerado no PASSO 3.4):
- Listar sessions com status: `closed` (✓) ou `in_progress` (⚠)
- Para cada session: mostrar context.md [✓/✗] — architecture.md [✓/✗]
- Se manifesto não existe: informar "Pronto para o primeiro épico"
- Exibir: `Backlog: <ideas_backlog_count> ideia(s) em docs/business-context/backlog/` (se count > 0)

### PASSO 5 — Confirmar ativação e Atualizar MEMORY.md

Exibir:
```
CORTEX BOOT ativo. GATE 0 aprovado.
Projeto: <nome do CORTEX_CONTEXT.json>
Stack: <resumo de CORTEX_CONTEXT.json.tech_stack>
Regras críticas: <rules_count>
ADRs: <adr_count>
Fingerprint: <timestamp> — <N> arquivos rastreados
Sessions: <slugs com status do manifesto>
```

Exemplo (placeholders — substituir pelos valores reais do projeto):
```
CORTEX BOOT ativo. GATE 0 aprovado.
Projeto: <project_name> (<project_version>)
Stack: <frameworks principais do tech_stack>
Regras críticas: <rules_count> regras
ADRs: <adr_count> ADRs
Fingerprint: <boot_timestamp> — <N> arquivos rastreados
Sessions:
  ✓ <tipo-NNN-descricao> — closed     — context ✓  arch ✓  plan ✓
  ⚠ <tipo-NNN-descricao> — in_progress — context ✓  arch ✓  plan ✗
```

**Após exibir o status, escrever `docs/.cortex/memory.md` (OBRIGATÓRIO — usar dados já carregados):**

```markdown
# MEMORY — Cortex Framework

> Atualizado automaticamente pelo Cortex Boot a cada inicialização.
> Dados completos do projeto em `docs/`. Este arquivo é cache de estado, não fonte de verdade.
> Não editar manualmente — o Boot regenera este arquivo.

---

## Projeto

- Nome: <project_name do CORTEX_CONTEXT>
- Versão Framework: <version do CORTEX_CONTEXT>
- Stack: <tech_stack resumido — máx 1 linha>
- Regras críticas: <rules_count>
- ADRs: <adr_count>

---

## Session Ativa

- Epic: <epic_active do CORTEX_CONTEXT ou "nenhum">
- Status: <in_progress | nenhum>
- Arquivos: <context.md ✓/✗  architecture.md ✓/✗  plan.md ✓/✗>

---

## Histórico Recente

<listar últimas 3 sessions do manifesto, formato: "✓ slug — closed" ou "⚠ slug — in_progress">

---

## Cache

- Último Boot: <boot_timestamp ISO 8601>
- Fingerprint status: <CACHE HIT | CACHE MISS | PRIMEIRA EXECUÇÃO>
- Arquivos rastreados: <N arquivos>
```

**Regras:**
- Sempre sobrescrever `docs/.cortex/memory.md` completo (nunca append)
- Se manifesto não existe: campo "Histórico Recente" = `_Nenhuma session registrada._`
- Stack resumido: máximo 60 caracteres (ex: `Next.js 14 + Supabase + Tailwind`)
- Não incluir dados sensíveis (env vars, tokens, chaves)
- Contar arquivos em `.claude/agents/*.md` e subdiretórios em `.claude/skills/`: incluir linha `Agents: <N> | Skills: <N>` na seção Cache. Se os diretórios não existirem: omitir linha (não bloquear)

**Hierarquia memory.md × CORTEX_CONTEXT:**
- `docs/.cortex/.cortex-context.json` = **fonte de verdade** do projeto (gerado pelo Boot em cache miss)
- `docs/.cortex/memory.md` = **resumo de estado legível** para rápida leitura no PASSO 0 (gerado pelo Boot a cada sessão)
- memory.md é sempre derivado do CORTEX_CONTEXT — nunca o inverso
- Em caso de conflito: CORTEX_CONTEXT prevalece; memory.md deve ser regerado pelo Boot

### PASSO 6 — Selecionar Modo (Interativo — Dois Níveis)

Após confirmar ativação, apresentar categorias de primeiro nível:

```
┌─────────────────────────────────────────────────────────┐
│  CORTEX BOOT ativo. GATE 0 aprovado.                    │
│  Projeto: <nome do CORTEX_CONTEXT.json>                 │
│  Stack: <resumo de CORTEX_CONTEXT.json.tech_stack>      │
│  Regras críticas: <rules_count> | ADRs: <adr_count>     │
│  Fingerprint: <timestamp> — <N> arquivos rastreados     │
│                                                         │
│  Sessions ativas:                                       │
│    ✓ <closed> — context.md ✓ — architecture.md ✓       │
│    ⚠ <in_progress> — context.md ✓ — architecture.md ✓  │
│                                                         │
│  ═══════════════════════════════════════════════════    │
│                                                         │
│  [1] 📋 STRATEGY   — Planejar ou registrar   (PO/Tech Lead)  │
│  [2] 🎨 DESIGN     — Criar design de feature (Designer)      │
│  [3] ⚙️  EXECUTION  — Implementar ou corrigir (Dev)          │
│                                                         │
│  Sua escolha [1-3]: _                                   │
└─────────────────────────────────────────────────────────┘
```

**Nota para AskUserQuestion — CALL 1:**
- `header`: "Cortex — Selecione a Categoria"
- `question`: "O que você quer fazer agora?"
- `multiSelect`: false
- `options`:
  - `label`: "STRATEGY" | `description`: "Planejar feature nova, modificar existente, ou capturar ideia (PO / Tech Lead)"
  - `label`: "DESIGN" | `description`: "Criar design de feature após spec fechada — corre em paralelo com Dev (Designer)"
  - `label`: "EXECUTION" | `description`: "Implementar spec pronta ou corrigir bug crítico (Dev)"

---

**Se STRATEGY selecionado → exibir sub-menu e chamar CALL 2A:**

```
┌─────────────────────────────────────────────────────────┐
│  📋 STRATEGY — Selecione o tipo de trabalho:            │
│                                                         │
│  [1] 🚀 EPIC    — Feature nova do zero                  │
│  [2] 🔧 MODIFY  — Alterar feature já implementada       │
│  [3] 💡 IDEIA   — Capturar nova ideia rapidamente       │
│                                                         │
│  Sua escolha [1-3]: _                                   │
└─────────────────────────────────────────────────────────┘
```

**Nota para AskUserQuestion — CALL 2A:**
- `header`: "STRATEGY — Tipo de Trabalho"
- `question`: "Qual o tipo de trabalho em STRATEGY?"
- `multiSelect`: false
- `options`:
  - `label`: "EPIC" | `description`: "Feature nova do zero — Brainstorm, Spec, Arquitetura"
  - `label`: "MODIFY" | `description`: "Alterar feature já implementada — Lê código existente, delta spec"
  - `label`: "IDEIA" | `description`: "Capturar nova ideia rapidamente — Registro leve, salva no backlog"

---

**Se DESIGN selecionado → carregar master diretamente (sem sub-menu):**

```
┌─────────────────────────────────────────────────────────┐
│  🎨 DESIGN — Janela 3: Design de Feature                │
│                                                         │
│  Pré-requisito: spec fechada (GATE 2 aprovado)          │
│  Informe o slug da session para iniciar.                │
│                                                         │
│  Corre em paralelo com Execution (Dev).                 │
└─────────────────────────────────────────────────────────┘
```

Carregar: `.claude/master/cortex-design.md`

---

**Se EXECUTION selecionado → exibir sub-menu e chamar CALL 2B:**

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️  EXECUTION — Selecione o tipo de trabalho:          │
│                                                         │
│  [1] ⚙️  IMPLEMENTAR SPEC  — Implementar spec existente │
│  [2] 🐛 BUG CRÍTICO        — Corrigir bug em produção   │
│  [3] 📋 TASK DE PLATAFORMA — Task do Jira/Linear/Trello │
│         sem sessão iniciada — cria spec e vai ao plan   │
│                                                         │
│  Sua escolha [1-3]: _                                   │
└─────────────────────────────────────────────────────────┘
```

**Nota para AskUserQuestion — CALL 2B:**
- `header`: "EXECUTION — Tipo de Trabalho"
- `question`: "Qual o tipo de trabalho em EXECUTION?"
- `multiSelect`: false
- `options`:
  - `label`: "IMPLEMENTAR SPEC" | `description`: "Implementar spec existente — GATE 3, Work em fases com plan.md"
  - `label`: "BUG CRÍTICO" | `description`: "Corrigir bug — Root cause obrigatório, fix mínimo, verificação pós-fix"
  - `label`: "TASK DE PLATAFORMA" | `description`: "Task do Jira/Linear/Trello/Asana/Monday sem spec — cria context.md + architecture.md e encaminha para /engineer:plan"

---

**Após selecionar sub-opção:** carregar apenas o master específico (não recarregar docs/)

```
STRATEGY → EPIC              → ler `.claude/master/cortex-strategy.md`
STRATEGY → MODIFY            → ler `.claude/master/cortex-modify.md`
STRATEGY → IDEIA             → ler `.claude/master/cortex-idea.md`

DESIGN                       → ler `.claude/master/cortex-design.md`

EXECUTION → IMPLEMENTAR SPEC    → ler `.claude/master/cortex-execution.md`
EXECUTION → BUG CRÍTICO        → ler `.claude/master/cortex-bug.md`
EXECUTION → TASK DE PLATAFORMA → ler `.claude/master/cortex-platform-task.md`
```

---

## Separação de Responsabilidades

| Onde | O que fica |
|---|---|
| `.claude/master/` | Regras genéricas do Framework Cortex |
| `.claude/commands/cortex/` | Comandos de ativação dos modos |
| `.claude/agents/` | Agentes especializados do projeto |
| `docs/technical-context/` | Stack, ADRs e regras **do projeto** |
| `docs/business-context/` | Estratégia, personas e backlog **do projeto** |
| `docs/.cortex/sessions/` | Estado das features em desenvolvimento (projeto) |
| `docs/.cortex/memory.md` | Resumo de estado legível — gerado pelo Boot a cada sessão |

---

## Padrão de Slug (obrigatório para sessions)

```
<tipo>-<NNN>-<descricao-kebab-case>

Tipos:  epic | feature | bug | refactor
NNN:    número com exatamente 3 dígitos com zeros à esquerda (001, não 1 nem 01)

Regex:  ^(epic|feature|bug|refactor)-\d{3}-[a-z0-9]+(-[a-z0-9]+)*$

Regras da descricao:
  - Apenas letras minúsculas (a-z), dígitos (0-9) e hífens (-)
  - Sem acentos, underscores, espaços, pontos ou caracteres especiais
  - Mínimo 2 segmentos após o NNN (ex: landing-page, não só landing)
  - Máximo 60 caracteres no total (incluindo tipo e NNN)

Correto:   epic-004-landing-page
           bug-001-fab-overlay-mobile
           feature-012-user-auth
           refactor-003-migrar-auth-jwt
Incorreto: landingPage | epic4 | EPIC-004 | epic-04-teste | epic-004-LandingPage
           epic-004-página (acento) | feature-001-x (só 1 segmento após NNN)
```
