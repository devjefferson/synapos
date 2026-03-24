# Guia Completo — Framework Cortex

> Como usar o sistema Cortex do início ao fim, incluindo o sistema de Boot e a estratégia anti-alucinação.

---

## O que é o Framework Cortex

O Cortex é um sistema de orquestração multiagente que estrutura o ciclo completo de desenvolvimento de software — do brainstorm até o PR — com foco em:

- Economia de tokens em janelas de contexto
- Separação entre pensamento estratégico e execução técnica
- Consistência arquitetural via ADRs consultadas antes do código
- Persistência de estado entre sessões
- **Prevenção de alucinação via gates de validação obrigatórios**

O Cortex é **genérico** e pode ser instalado em qualquer projeto. O contexto específico do projeto fica em `docs/` — gerado automaticamente na primeira execução.

---

## Arquitetura do Sistema

```
.claude/                            ← Framework genérico (não contém dados do projeto)
├── master/
│   ├── cortex-boot.md              ← Boot + GATE 0 + menu dois níveis
│   ├── cortex-strategy.md          ← STRATEGY → EPIC: feature nova, GATE 2
│   ├── cortex-execution.md         ← EXECUTION → IMPLEMENTAR SPEC: GATE 3/4/5
│   ├── cortex-modify.md            ← STRATEGY → MODIFY: alterar existente, GATE-M
│   ├── cortex-bug.md               ← EXECUTION → BUG CRÍTICO: GATE-B/B2
│   ├── cortex-idea.md              ← STRATEGY → IDEIA: captura leve, backlog
│   └── cortex-init-protocol.md     ← Referência de todos os gates de validação
│
├── commands/cortex/
│   ├── boot.md                     ← /cortex:boot
│   ├── strategy.md                 ← /cortex:strategy
│   ├── execution.md                ← /cortex:execution
│   ├── modify.md                   ← /cortex:modify
│   ├── bug.md                      ← /cortex:bug
│   └── idea.md                     ← /cortex:idea
│
├── agents/                         ← Agentes especializados do projeto
└── guides/
    ├── cortex-system-guide.md      ← Este arquivo
    └── context-window-strategy.md

docs/                               ← Contexto e estado do projeto
├── technical-context/
│   ├── project-briefing.md
│   └── briefing/
│       ├── critical-rules.md       ← Lido pelo Boot e Execution
│       ├── adrs-summary.md         ← Lido pelo Boot e GATE 3
│       └── tech-stack.md           ← Lido pelo Boot
├── business-context/
│   ├── index.md
│   └── backlog/                    ← Ideias capturadas pelo modo IDEIA
└── .cortex/                        ← Artefatos gerados pelo framework
    ├── .cortex-context.json        ← CORTEX_CONTEXT comprimido
    ├── .cortex-fingerprint.json    ← Cache de mtime/checksum de docs/
    ├── .cortex-index.json          ← Índice de ADRs para lookup rápido
    ├── sessions-manifest.json      ← Fonte de verdade de todas as sessions
    └── sessions/<slug>/            ← Estado das features em desenvolvimento
        ├── context.md              ← Spec da feature (validada pelo GATE 2)
        ├── architecture.md         ← Design técnico (validado pelo GATE 2)
        └── plan.md                 ← Plano faseado (validado pelo GATE 4)
```

---

## Sistema de Gates — Anti-Alucinação

O principal risco de alucinação é a IA avançar com contexto incompleto ou inventado.
Os gates são checkpoints obrigatórios que bloqueiam o fluxo quando algo está errado.

```
GATE 0 — Boot
  → Verifica integridade de docs/ (todos os arquivos obrigatórios existem e não estão vazios)
  → Bloqueante: sem docs/ válido, boot não confirma ativo

GATE 1 — Slug
  → Verifica padrão: tipo-NNN-descricao-kebab-case
  → Bloqueante: slug inválido não cria session

GATE 2 — Spec Fechada (Strategy/Modify → Execution)
  → Verifica completude de context.md e architecture.md
  → Nenhuma seção TODO/vazia aceita
  → Bloqueante: sem GATE 2 aprovado, spec não é considerada fechada

GATE 2 (Delta) — Modify
  → Itens adicionais: "O que existe hoje" lido no código? "Mantendo intacto" definido?
  → Mapa de Impacto preenchido?

GATE 3 — ADR Mapping (por arquivo, durante Execution/Modify/Bug)
  → Mapeia ADRs aplicáveis ANTES de escrever código
  → Lazy: via CORTEX_INDEX primeiro; lê adrs-summary.md só em miss
  → Bloqueante: sem mapeamento, código não é escrito

GATE 4 — Consistência Automática Plan × Architecture (Execution)
  → Verifica 3 dimensões: timestamps, cobertura de arquivos, realidade do disco
  → Não-bloqueante: aguarda decisão do usuário

GATE 5 — Pre-PR Completude
  → Verifica que todas as fases do plan.md estão concluídas
  → Bloqueante: fases pendentes impedem /pre-pr

GATE-M — Mapa de Impacto (Modify)
  → Lista: arquivos a modificar, arquivos novos, dependentes em risco
  → Identifica funcionalidade existente que pode quebrar
  → Confirmação obrigatória se risco alto

GATE-B — Plano de Correção Mínimo (Bug)
  → Root cause identificado no código? Bloqueante se não.
  → Checklist de regressão: quem mais usa o código afetado?

GATE-B2 — Verificação Pós-Fix (Bug)
  → Sintoma original seria resolvido? Arquivos fora do escopo modificados?
  → Bloqueante para PR: falha impede /engineer:pr
```

---

## Regra Anti-Redundância de Tokens

**Problema original:** Boot carregava docs/, então Strategy recarregava docs/ = tokens duplicados.

**Solução implementada:**

```
Na mesma janela:
  /cortex:boot → carrega docs/ uma vez (CORTEX_CONTEXT)
  /cortex:strategy → usa CORTEX_CONTEXT, carrega apenas cortex-strategy.md
  /cortex:execution → usa CORTEX_CONTEXT, carrega apenas cortex-execution.md

Em nova janela (Janela 2):
  /cortex:execution → boot integrado (carrega docs/ uma vez) + execution master
```

Resultado: uma única leitura de docs/ por janela, independente de quantos modos forem ativados.

---

## Fluxo Completo — Do Zero ao PR

```
┌──────────────────────────────────────────────────────────┐
│                      JANELA 1                            │
│               Captação & Planejamento                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  /cortex:boot                                            │
│    → GATE 0: verifica integridade de docs/               │
│    → Carrega CORTEX_CONTEXT (uma vez)                    │
│    → Se docs/ não existe: executa /discover              │
│                                                          │
│  /cortex:strategy                                        │
│    → Usa CORTEX_CONTEXT (sem reler docs/)                │
│    → Fase 1: valida slug (GATE 1)                        │
│    → brainstorm → collect → check → refine               │
│    → spec → light-arch → sync-linear                     │
│    → GATE 2: verifica spec fechada antes do handoff      │
│                                                          │
│  Entrega: context.md + architecture.md (GATE 2 ✓)       │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼ (abrir nova janela — slug: tipo-NNN-descricao)
┌──────────────────────────────────────────────────────────┐
│                      JANELA 2                            │
│                  Execução Técnica                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  /cortex:execution                                       │
│    → Boot integrado: GATE 0 (docs/) + CORTEX_CONTEXT     │
│    → Verifica context.md + architecture.md (BLOQUEANTE)  │
│    → GATE 4: consistência plan × architecture            │
│    → Confirma dependências externas com usuário          │
│                                                          │
│  Por arquivo implementado:                               │
│    → GATE 3: ADR Mapping obrigatório antes do código     │
│    → Implementa seguindo ADRs mapeadas                   │
│    → Valida contra critical-rules.md                     │
│                                                          │
│  Ao finalizar todas as fases:                            │
│    → GATE 5: verifica completude antes de /pre-pr        │
│    → /pre-pr (4 agentes)                                 │
│    → /pr                                                 │
└──────────────────────────────────────────────────────────┘
```

---

## Menu Boot — Dois Níveis

O PASSO 6 do Boot apresenta um menu em dois níveis:

```
Nível 1 — Categoria:
  [1] 📋 STRATEGY   — Planejar ou registrar
  [2] ⚙️  EXECUTION  — Implementar ou corrigir

Nível 2A — após STRATEGY:
  [1] 🚀 EPIC    → cortex-strategy.md   (feature nova do zero)
  [2] 🔧 MODIFY  → cortex-modify.md    (alterar feature existente)
  [3] 💡 IDEIA   → cortex-idea.md      (captura leve, sem session)

Nível 2B — após EXECUTION:
  [1] ⚙️  IMPLEMENTAR SPEC → cortex-execution.md  (spec pronta)
  [2] 🐛 BUG CRÍTICO       → cortex-bug.md        (root cause + fix)
```

---

## Tabela de Decisão — Nova Janela ou Não?

| Situação | Caminho no Menu | Comando |
|---|---|---|
| Novo épico do zero | STRATEGY → EPIC | `/cortex:strategy` |
| Nova feature do mesmo épico | EXECUTION → IMPLEMENTAR SPEC | `/engineer:work` |
| Retomar épico após pausa | EXECUTION → IMPLEMENTAR SPEC | `/cortex:execution` |
| Alterar feature já existente | STRATEGY → MODIFY | `/cortex:modify` |
| Bug em produção ou staging | EXECUTION → BUG CRÍTICO | `/cortex:bug` |
| Refatoração isolada | EXECUTION → IMPLEMENTAR SPEC | `/cortex:execution` |
| Mudança de direção estratégica | STRATEGY → EPIC | `/cortex:strategy` |
| Capturar ideia rapidamente | STRATEGY → IDEIA | `/cortex:idea` |

---

## Padrão de Slug (obrigatório)

```
<tipo>-<NNN>-<descricao-kebab-case>

Tipos:
  epic      → novo épico
  feature   → feature incremental
  bug       → correção de bug
  refactor  → refatoração

Exemplos:
  epic-004-landing-page
  feature-012-user-auth
  bug-001-fab-overlay-mobile
  refactor-003-api-routes
```

---

## Referência de Comandos

### Cortex

| Comando | Quando usar | Gates |
|---|---|---|
| `/cortex:boot` | Toda nova janela | GATE 0 + AUTO-CONSISTENCY |
| `/cortex:strategy` | Feature nova do zero | GATE 1, 2 |
| `/cortex:execution` | Spec fechada, implementar | GATE 3, 4, 5 |
| `/cortex:modify` | Alterar feature já implementada | GATE-M, GATE 2 (delta), GATE 3 |
| `/cortex:bug` | Corrigir bug crítico | GATE-B, GATE 3, GATE-B2 |

### Produto (inalterados)

| Comando | Fase |
|---|---|
| `/product:brainstorm` | Exploração |
| `/product:collect` | Linear |
| `/product:check` | Validação |
| `/product:refine` | Refinamento |
| `/product:spec` | PRD |
| `/product:light-arch` | Arquitetura |
| `/product:sync-linear` | Sincronização |

### Engenharia (inalterados)

| Comando | Fase |
|---|---|
| `/engineer:start` | Inicializa session |
| `/engineer:plan` | Plano faseado |
| `/engineer:work` | Implementação |
| `/engineer:pre-pr` | Validação pré-PR |
| `/engineer:pr` | PR |
| `/engineer:discover` | Gera docs/ |

---

## Problemas que o Sistema Previne

| Problema | Gate que previne |
|---|---|
| docs/ incompleto ou corrompido | GATE 0 |
| Slug inconsistente entre sessions | GATE 1 |
| Spec incompleta passando para execução | GATE 2 |
| ADRs ignoradas durante implementação | GATE 3 |
| Plan desatualizado em relação à arquitetura | GATE 4 (verificação 1) |
| Arquivos em architecture.md não cobertos no plan | GATE 4 (verificação 2) |
| Fases marcadas ✓ mas arquivos não existem no disco | GATE 4 (verificação 3) |
| PR aberto com fases pendentes | GATE 5 |
| Modificar feature sem entender o que existe | GATE-M (Modify) |
| Fix aplicado sem root cause identificado | GATE-B (Bug) |
| Fix que introduz regressão | GATE-B2 (Bug) |
| epic_active / epics_completed fora de sincronia | PASSO 3.5 — Auto-Consistency |
| IA inventando stack/regras de memória | Regra Anti-Alucinação (todos os gates) |
| Context duplicado entre modes na mesma janela | Regra Anti-Redundância |

---

## Instalação em Novo Projeto

```
1. Copiar para o novo projeto:
   .claude/master/          (6 arquivos)
   .claude/commands/cortex/ (5 arquivos)
   .claude/guides/          (esta documentação)

2. Abrir nova janela → /cortex:boot

3. Boot detecta docs/ ausente → executa /engineer:discover

4. Discover gera docs/technical-context/briefing/ automaticamente

5. Boot retoma com CORTEX_CONTEXT do novo projeto
   Cortex operacional.
```
