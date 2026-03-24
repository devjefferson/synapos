# Guia de Estratégia de Janelas de Contexto — Framework Cortex

> Referência operacional para gerenciar janelas de contexto e economizar tokens no orquestrador multi-agente (56 agentes).

---

## O Problema

Rodar `/warm-up` em toda nova janela é caro porque ele:
- Lê o README completo
- Lê o master docs index
- Reprocessa toda a visão do produto
- Gera alinhamento estratégico do zero

**Custo estimado por warm-up manual:** 8k–15k tokens por abertura.

---

## A Solução: Sistema de Dois Masters

```
Toda nova janela começa com:

  /cortex:boot   →  carrega contexto fixo pré-embutido (sem leitura de arquivos)
       ↓
  /cortex:strategy   (Janela 1 — planejamento)
  ou
  /cortex:execution  (Janela 2 — implementação)
```

**Custo estimado com boot:** 1k–2k tokens (redução de 80–90%).

---

## Regra das Duas Janelas

### Janela 1 — Captação & Planejamento (Strategy Mode)

**Quando usar:** sempre que o trabalho for pensar, planejar, especificar.

**Ativa com:** `/cortex:strategy`

**Fluxo:**
```
warm-up (mini) → brainstorm → collect → check → refine → spec → light-arch → sync-linear
```

**Entrega:** `context.md` + `architecture.md` + handoff para Janela 2.

---

### Janela 2 — Execução Técnica (Execution Mode)

**Quando usar:** quando spec está fechada e é hora de escrever código.

**Ativa com:** `/cortex:execution`

**Fluxo:**
```
start → plan → work → pre-pr → pr
```

**Requer:** `context.md` + `architecture.md` existentes em `docs/.cortex/sessions/<slug>/`.

---

## Tabela de Decisão — Quando Abrir Nova Janela?

| Situação | Nova Janela? | Janela | Comando |
|---|---|---|---|
| Novo épico (do zero) | Sim | Janela 1 | `/cortex:strategy` |
| Nova feature do mesmo épico | Não | Janela 2 atual | continuar com `/work` |
| Retomar épico após pausa longa | Sim | Janela 2 | `/cortex:execution` |
| Refatoração isolada sem spec nova | Sim | Janela 2 | `/cortex:execution` |
| Bug crítico | Sim | Janela 2 | `/cortex:execution` |
| Mudança de direção estratégica no épico | Sim | Janela 1 | `/cortex:strategy` |
| Continuação do mesmo fluxo (mesmo dia) | Não | Atual | continuar |
| Transição planejamento → código | Sim | Janela 2 | `/cortex:execution` |

---

## Fluxo Completo de um Novo Épico

```
JANELA 1 — Strategy
────────────────────────────────────────
/cortex:strategy
  → brainstorm "<tema do épico>"
  → collect "<feature principal>"
  → check (valida contra master docs)
  → refine "<requisitos>"
  → spec "<nome do épico>"
  → light-arch (propõe estrutura)
  → sync-linear (sincroniza com Linear)

Entrega: context.md + architecture.md salvos em docs/.cortex/sessions/<slug>/


JANELA 2 — Execution
────────────────────────────────────────
/cortex:execution
  → start "<slug do épico>"  (se session não existir ainda)
  → plan
  → work  (fase por fase)
  → pre-pr
  → pr
```

---

## Quando NÃO Precisa de Nova Janela

Se você está **dentro do mesmo épico** e **o contexto ainda está ativo**:

- Não abra nova janela
- Use `/work` diretamente
- O contexto das sessions persiste em `docs/.cortex/sessions/<slug>/`

O sistema foi desenhado para ser **retomável**: `context.md`, `architecture.md` e `plan.md` guardam o estado completo.

---

## Regras de Economia de Token

1. **Não repetir contexto já estabelecido** — se você disse "Next.js 16 + Supabase", não diga de novo
2. **Não pedir warm-up se boot já foi rodado** — boot carrega as regras fixas
3. **Não reexplicar arquitetura validada** — architecture.md é a referência
4. **Respostas diretas e estruturadas** — sem introduções longas

---

## Modos de Operação (Sintaxe Rápida)

| O que dizer | O que acontece |
|---|---|
| `novo épico` | Ciclo completo (Strategy → Execution) |
| `nova feature` | Assumir arquitetura existente, ir direto |
| `refatorar` | Preservar domínio, melhorar estrutura |
| `continuar` | Manter estado atual da session |
| `retomar <slug>` | Carregar session do épico indicado |

---

## Localização dos Arquivos de Contexto

```
.claude/
├── master/
│   ├── cortex-boot.md         ← Contexto fixo (substitui warm-up)
│   ├── cortex-strategy.md     ← Master de planejamento
│   └── cortex-execution.md    ← Master de execução
├── commands/
│   └── cortex/
│       ├── boot.md            ← /cortex:boot
│       ├── strategy.md        ← /cortex:strategy
│       └── execution.md       ← /cortex:execution
└── sessions/
    └── <slug>/
        ├── context.md         ← Entendimento da feature
        ├── architecture.md    ← Design técnico
        └── plan.md            ← Plano de execução faseado
```
