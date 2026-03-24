# Seleção de Modo - Exemplos Visuais

Este documento contém exemplos visuais de seleção de modo para o Boot do Cortex.
O menu opera em dois níveis: primeiro a categoria (STRATEGY ou EXECUTION), depois a sub-opção.

## Tela de Seleção — Nível 1: Categoria

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                                                     │
│   CORTEX BOOT - Framework v1.7.0                                    │
│                                                                     │
│   ═══════════════════════════════════════════════════════════   │
│                                                                     │
│   Projeto: <nome do projeto>                                        │
│   Stack: <frameworks principais>                                    │
│   Regras críticas: <N> | ADRs: <N>                                  │
│   Fingerprint: <timestamp>                                          │
│                                                                     │
│   Sessions ativas:                                                  │
│     ✓ epic-001-widget-embed       — closed      ✓ ctx ✓ arch ✓      │
│     ⚠ epic-002-rag-knowledge-base — in_progress ✓ ctx ✓ arch ✓     │
│     ⚠ feature-003-lead-capture   — in_progress ✓ ctx ✗ arch        │
│                                                                     │
│   ═══════════════════════════════════════════════════════════   │
│                                                                     │
│   Selecione a categoria:                                            │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │  [1] 📋 STRATEGY                        (PO / Tech Lead)    │   │
│   │       Planejar ou registrar                                 │   │
│   │       • Feature nova do zero (EPIC)                         │   │
│   │       • Modificar feature existente (MODIFY)                │   │
│   │       • Capturar nova ideia (IDEIA)                         │   │
│   │                                                             │   │
│   │  [2] 🎨 DESIGN                          (Designer)          │   │
│   │       Criar design após spec fechada                        │   │
│   │       • Especificar telas, fluxos e componentes             │   │
│   │       • Corre em paralelo com Dev                           │   │
│   │                                                             │   │
│   │  [3] ⚙️  EXECUTION                       (Dev)              │   │
│   │       Implementar ou corrigir                               │   │
│   │       • Implementar spec existente                          │   │
│   │       • Corrigir bug crítico                                │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Sua escolha [1-3]: _                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tela de Seleção — Nível 2A: STRATEGY

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   📋 STRATEGY — Selecione o tipo de trabalho:                       │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │  [1] 🚀 EPIC                                                │   │
│   │       Feature nova do zero                                  │   │
│   │       • Brainstorm e exploração de requisitos               │   │
│   │       • Spec (context.md + architecture.md)                 │   │
│   │       • Validação contra ADRs e regras críticas             │   │
│   │                                                             │   │
│   │  [2] 🔧 MODIFY                                              │   │
│   │       Alterar feature já implementada                       │   │
│   │       • Lê código existente antes de spec                   │   │
│   │       • Delta spec — só o que muda                          │   │
│   │       • Mapa de impacto + não-regressão                     │   │
│   │                                                             │   │
│   │  [3] 💡 IDEIA                                               │   │
│   │       Capturar nova ideia rapidamente                       │   │
│   │       • Registro leve sem session formal                    │   │
│   │       • Classifica tipo e impacto estimado                  │   │
│   │       • Salva no backlog para refinamento futuro            │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Sua escolha [1-3]: _                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tela de Seleção — Nível 2B: EXECUTION

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ⚙️  EXECUTION — Selecione o tipo de trabalho:                      │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │  [1] ⚙️  IMPLEMENTAR SPEC                                    │   │
│   │       Implementar spec existente                            │   │
│   │       • Requer context.md + architecture.md prontos         │   │
│   │       • GATE 3 (ADR mapping incremental)                    │   │
│   │       • Work em fases com plan.md                           │   │
│   │                                                             │   │
│   │  [2] 🐛 BUG CRÍTICO                                         │   │
│   │       Corrigir bug em produção ou staging                   │   │
│   │       • Root cause obrigatório antes de fix                 │   │
│   │       • Fix mínimo sem refatoração extra                    │   │
│   │       • Verificação de regressão pós-fix                    │   │
│   │                                                             │   │
│   │  [3] 📋 TASK DE PLATAFORMA                                  │   │
│   │       Task do Jira/Linear/Trello/Asana/Monday               │   │
│   │       sem sessão de trabalho iniciada                       │   │
│   │       • Sem context.md + architecture.md                    │   │
│   │       • Cria spec a partir da task da plataforma            │   │
│   │       • Encaminha para /engineer:plan após spec aprovada    │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Sua escolha [1-3]: _                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tela Simplificada - Compacta

**Nível 1 — Categoria:**
```
CORTEX BOOT v1.7.0 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Projeto: <nome>
Regras: <N> | ADRs: <N> | Sessions: <M>

  [1] 📋 STRATEGY   — Planejar ou registrar      (PO / Tech Lead)
  [2] 🎨 DESIGN     — Criar design de feature    (Designer)
  [3] ⚙️  EXECUTION  — Implementar ou corrigir    (Dev)

Sua escolha [1-3]: _
```

**Nível 2A — Após STRATEGY:**
```
  [1] 🚀 EPIC    — Feature nova do zero
  [2] 🔧 MODIFY  — Alterar feature já implementada
  [3] 💡 IDEIA   — Capturar nova ideia rapidamente

Sua escolha [1-3]: _
```

**DESIGN — Acesso direto (sem sub-menu):**
```
  🎨 DESIGN — Informe o slug da session para iniciar.
  Pré-requisito: GATE 2 aprovado.
```

**Nível 2B — Após EXECUTION:**
```
  [1] ⚙️  IMPLEMENTAR SPEC    — Implementar spec existente
  [2] 🐛 BUG CRÍTICO          — Corrigir bug crítico
  [3] 📋 TASK DE PLATAFORMA   — Jira/Linear/Trello/Asana/Monday sem spec

Sua escolha [1-3]: _
```

## Tela Minimalista - Focada

```
┌────────────────────────────────────────────┐
│  CORTEX v1.7.0                             │
│  Projeto: <nome>                           │
│  <N> sessions ativas                       │
├────────────────────────────────────────────┤
│  Categoria:                                │
│  [1] 📋 STRATEGY  — planejar / registrar   │
│  [2] 🎨 DESIGN    — criar design           │
│  [3] ⚙️  EXECUTION — implementar / corrigir│
├────────────────────────────────────────────┤
│  Após STRATEGY:                            │
│  [1] 🚀 EPIC   [2] 🔧 MODIFY              │
│  [3] 💡 IDEIA                             │
├────────────────────────────────────────────┤
│  Após EXECUTION:                           │
│  [1] ⚙️  IMPLEMENTAR SPEC                 │
│  [2] 🐛 BUG CRÍTICO                       │
│  [3] 📋 TASK DE PLATAFORMA               │
└────────────────────────────────────────────┘
```

## Exemplos de AskUserQuestion

### Implementação Recomendada

```javascript
// CALL 1 — Seleção de Categoria (sempre executado)
AskUserQuestion({
  questions: [{
    header: "Cortex — Selecione a Categoria",
    question: "O que você quer fazer agora?",
    multiSelect: false,
    options: [
      {
        label: "STRATEGY",
        description: "Planejar feature nova, modificar existente, ou capturar ideia (PO / Tech Lead)"
      },
      {
        label: "DESIGN",
        description: "Criar design de feature após spec fechada — corre em paralelo com Dev (Designer)"
      },
      {
        label: "EXECUTION",
        description: "Implementar spec pronta ou corrigir bug crítico (Dev)"
      }
    ]
  }]
})
```

```javascript
// CALL 2A — Sub-opção de STRATEGY (executado se STRATEGY foi selecionado)
AskUserQuestion({
  questions: [{
    header: "STRATEGY — Tipo de Trabalho",
    question: "Qual o tipo de trabalho em STRATEGY?",
    multiSelect: false,
    options: [
      {
        label: "EPIC",
        description: "Feature nova do zero — Brainstorm, Spec, Arquitetura"
      },
      {
        label: "MODIFY",
        description: "Alterar feature já implementada — Lê código existente, delta spec"
      },
      {
        label: "IDEIA",
        description: "Capturar nova ideia rapidamente — Registro leve, salva no backlog"
      }
    ]
  }]
})
```

```javascript
// CALL 2B — Sub-opção de EXECUTION (executado se EXECUTION foi selecionado)
AskUserQuestion({
  questions: [{
    header: "EXECUTION — Tipo de Trabalho",
    question: "Qual o tipo de trabalho em EXECUTION?",
    multiSelect: false,
    options: [
      {
        label: "IMPLEMENTAR SPEC",
        description: "Implementar spec existente — GATE 3, Work em fases com plan.md"
      },
      {
        label: "BUG CRÍTICO",
        description: "Corrigir bug — Root cause obrigatório, fix mínimo, verificação pós-fix"
      },
      {
        label: "TASK DE PLATAFORMA",
        description: "Task do Jira/Linear/Trello/Asana/Monday sem spec — cria context.md + architecture.md e encaminha para /engineer:plan"
      }
    ]
  }]
})
```

## Guia de Escolha de Modo

| Situação | Papel | Caminho |
|----------|-------|---------|
| "Quero criar uma feature nova" | PO / Tech Lead | STRATEGY → EPIC |
| "A spec está pronta, vou implementar" | Dev | EXECUTION → IMPLEMENTAR SPEC |
| "Feature X já existe, quero adicionar Y" | PO / Tech Lead | STRATEGY → MODIFY |
| "Tem um bug em produção" | Dev | EXECUTION → BUG CRÍTICO |
| "Login já existe, quero adicionar login social" | PO / Tech Lead | STRATEGY → MODIFY |
| "Tela de dashboard existe, quero adicionar gráfico" | PO / Tech Lead | STRATEGY → MODIFY |
| "Usuário está recebendo erro 500" | Dev | EXECUTION → BUG CRÍTICO |
| "Pagamento está falhando silenciosamente" | Dev | EXECUTION → BUG CRÍTICO |
| "Recebi uma task do Jira/Linear sem spec" | Dev | EXECUTION → TASK DE PLATAFORMA |
| "Peguei uma issue do Trello sem context.md" | Dev | EXECUTION → TASK DE PLATAFORMA |
| "Task nova do Asana/Monday, sem architecture.md" | Dev | EXECUTION → TASK DE PLATAFORMA |
| "Tive uma ideia e quero registrar antes de esquecer" | PO / Tech Lead | STRATEGY → IDEIA |
| "Quero anotar uma melhoria sem abrir spec agora" | PO / Tech Lead | STRATEGY → IDEIA |
| "Captei feedback do usuário e quero estruturar" | PO / Tech Lead | STRATEGY → IDEIA |
| "A spec está fechada, quero criar as telas" | Designer | DESIGN |
| "Preciso especificar os fluxos e componentes visuais" | Designer | DESIGN |
| "Vou trabalhar em paralelo com o Dev nas telas" | Designer | DESIGN |

## Fluxo Após Seleção

```
STRATEGY → EPIC
  ↓ Carregar: cortex-strategy.md
  ↓ Fase 0: Warm-up Mini → validar fingerprint
  ↓ Fase 1: Validar slug
  ↓ Fase 2: Brainstorm
  ↓ Fase 3: Validação contra docs/ (lazy)
  ↓ Fase 4: Spec (context.md + architecture.md)
  ↓ GATE 2 → handoff para Execution
  ↓ /product:task → criar issue de rastreamento
  ↓ [paralelo] Designer → DESIGN | Dev → EXECUTION

STRATEGY → MODIFY
  ↓ Carregar: cortex-modify.md
  ↓ FASE 0: Capturar objetivo
  ↓ FASE 1: Ler código existente (obrigatório)
  ↓ FASE 2: GATE-M — Mapa de Impacto
  ↓ FASE 3: Delta spec (context.md + architecture.md)
  ↓ GATE 2 (delta) → handoff para Execution
  ↓ /product:task → criar issue de rastreamento
  ↓ [paralelo] Designer → DESIGN | Dev → EXECUTION

STRATEGY → IDEIA
  ↓ Carregar: cortex-idea.md
  ↓ PASSO 1: Capturar descrição da ideia
  ↓ PASSO 2: Classificar tipo e impacto estimado
  ↓ PASSO 3: Estruturar nota de backlog (sem spec formal)
  ↓ PASSO 4: Salvar em docs/business-context/backlog/
  ↓ /product:task → criar issue de rastreamento
  ↓ Opcional: evoluir para STRATEGY → EPIC quando pronto

DESIGN
  ↓ Carregar: cortex-design.md
  ↓ PASSO 1: Carregar context.md + architecture.md da session
  ↓ PASSO 2: Mapear telas, fluxos e componentes
  ↓ PASSO 3: Especificar design por tela/fluxo
  ↓ GATE-D → cobertura completa
  ↓ PASSO 5: Gerar design.md na session
  ↓ Dev prossegue com UI após GATE-D aprovado

EXECUTION → IMPLEMENTAR SPEC
  ↓ Carregar: cortex-execution.md
  ↓ PASSO 1: Validar CORTEX_CONTEXT + fingerprint
  ↓ PASSO 2: Identificar session via manifesto
  ↓ PASSO 5: GATE 4 — consistência automática
  ↓ Work em fases → GATE 3 por arquivo
  ↓ GATE 5 → Pre-PR → PR

EXECUTION → BUG CRÍTICO
  ↓ Carregar: cortex-bug.md
  ↓ PASSO 1: Bug Report
  ↓ PASSO 2: Diagnosticar Root Cause (obrigatório)
  ↓ PASSO 3: GATE-B — Plano de Correção Mínimo
  ↓ PASSO 4: Aplicar fix (ADR-First)
  ↓ PASSO 5: GATE-B2 — Verificação Pós-Fix
  ↓ PASSO 6: PR de Bug

EXECUTION → TASK DE PLATAFORMA
  ↓ Carregar: cortex-platform-task.md
  ↓ PASSO 1: Verificar CORTEX_CONTEXT
  ↓ PASSO 2: Capturar task (Jira/Linear/Trello/Asana/Monday)
  ↓ PASSO 3: Definir e validar slug
  ↓ PASSO 4: Criar estrutura da session
  ↓ PASSO 5: Investigação → context.md (clarificações + aprovação)
  ↓ PASSO 6: Estruturação arquitetural → architecture.md (aprovação)
  ↓ PASSO 7: Verificação de consistência automática
  ↓ PASSO 8: Atualizar manifesto
  ↓ PASSO 9: Handoff → usuário invoca /engineer:plan

```

## Ícones Recomendados

| Modo | Ícone |
|-------|--------|
| Strategy | 📋 |
| EPIC | 🚀 |
| Design | 🎨 |
| Execution | ⚙️ |
| Modify | 🔧 |
| Bug | 🐛 |
| Platform Task | 📋 |
| Ideia | 💡 |
| Brainstorm | 🧠 |
| Spec | 📝 |
| Arquitetura | 🏗️ |
| Gate | 🔒 |
| Gate-D (Design) | 🎨 |
| Success | ✅ |
| Warning | ⚠️ |
| Error | ❌ |
| Root Cause | 🔍 |
| Impacto | 💥 |
| Backlog | 📥 |
| Handoff | 🤝 |

## Papéis e Janelas

| Papel | Janela | Quando entra |
|-------|--------|--------------|
| PO / Tech Lead | STRATEGY | Desde o início — dirige IDEIA, EPIC, MODIFY |
| Designer | DESIGN (Janela 3) | Após GATE 2 aprovado — corre em paralelo com Dev |
| Dev | EXECUTION (Janela 2) | Após GATE 2 aprovado — pode iniciar backend antes do design.md |
