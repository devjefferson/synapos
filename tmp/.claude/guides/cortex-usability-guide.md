# Guia de Usabilidade — Framework Cortex

> Referência prática para cada situação do dia a dia.
> Para cada cenário: qual janela abrir, qual comando rodar, o que esperar.

---

## Índice

1. [Iniciando projeto do zero](#1-iniciando-projeto-do-zero)
2. [Novo épico](#2-novo-épico)
3. [Nova feature](#3-nova-feature)
4. [Bug](#4-bug)
5. [Bug crítico](#5-bug-crítico)
6. [Modificar feature existente](#6-modificar-feature-existente)
7. [Mudança de prioridade](#7-mudança-de-prioridade)
8. [Documentar nova feature](#8-documentar-nova-feature)
9. [Documentar novo épico](#9-documentar-novo-épico)
10. [Captação de ideia](#10-captação-de-ideia)
11. [Capturar ideia rápida (modo IDEIA)](#11-capturar-ideia-rápida-modo-ideia)
12. [Refinar tarefa ou quebrar épico](#12-refinar-tarefa-ou-quebrar-épico)
13. [Design de feature (Janela 3)](#13-design-de-feature-janela-3)
14. [Task de plataforma sem spec (Jira/Linear/Trello/Asana/Monday)](#14-task-de-plataforma-sem-spec)
15. [Fluxo completo por papel do time](#15-fluxo-completo-por-papel-do-time)

---

## 1. Iniciando Projeto do Zero

**Contexto:** Projeto novo, sem `docs/`, sem sessions, sem ADRs.

### Janelas necessárias: 1

### Passo a passo

```
JANELA 1

/cortex:boot
  → Boot detecta ausência de docs/
  → Executa /engineer:discover automaticamente
  → Discover mapeia README, código existente, dependências
  → Gera docs/technical-context/briefing/ (critical-rules, adrs, tech-stack)
  → GATE 0 aprovado

Resultado esperado:
  CORTEX BOOT ativo. GATE 0 aprovado.
  Projeto: <nome detectado>
  Stack: <stack detectada>
  Regras críticas: <N> carregadas
  ADRs: <N> ativas
  Sessions: nenhuma
```

**Após o boot:**

```
  → Menu: STRATEGY → EPIC
  → /cortex:strategy
  → Criar primeiro épico (ver cenário 2)
```

### O que esperar

O discover vai gerar a estrutura abaixo. Se o projeto for novo sem código, ele cria uma estrutura mínima baseada no README:

```
docs/technical-context/
  project-briefing.md
  briefing/
    critical-rules.md
    adrs-summary.md
    tech-stack.md
```

### Sinais de problema

| Sinal | O que fazer |
|---|---|
| discover falhou sem gerar docs/ | Verificar se README existe; criar um básico e rodar novamente |
| critical-rules.md vazio | Criar ADRs básicas manualmente antes de prosseguir |
| GATE 0 bloqueado após discover | Verificar quais arquivos ainda estão faltando |

---

## 2. Novo Épico

**Contexto:** Projeto já inicializado. Novo ciclo de desenvolvimento começa do zero.

### Janelas necessárias: 2

### Janela 1 — Planejamento

```
/cortex:boot
  → GATE 0 verifica docs/ (já existe)
  → CORTEX_CONTEXT carregado

/cortex:strategy
  → Fase 0: confirma que não há session anterior para este épico
  → Fase 1: definir slug  →  epic-<NNN>-<descricao>
  → Fase 2: brainstorm do épico
  → Fase 3: validação contra docs/ e ADRs
  → Fase 4: criação de context.md + architecture.md
  → Fase 5: GATE 2 — checklist de completude

/product:brainstorm "<tema do épico>"
/product:collect "<feature principal>"
/product:check
/product:refine "<requisitos>"
/product:spec "<nome do épico>"
/product:light-arch
/product:sync-linear

→ GATE 2 aprovado
→ Handoff: "Spec fechada. Slug: epic-<NNN>-<descricao>"
```

### Janela 2 — Design (Designer) e Execução (Dev) em paralelo

Após GATE 2, Designer e Dev podem trabalhar simultaneamente:

```
┌─ JANELA 2A — DESIGN (Designer) ──────────────────────────┐
│                                                            │
│  /cortex:design                                            │
│    → Informa slug: epic-<NNN>-<descricao>                  │
│    → Carrega context.md + architecture.md                  │
│    → Mapeia telas, fluxos e componentes                    │
│    → Especifica estados (normal/loading/error/empty)       │
│    → GATE-D: cobertura completa de todos os fluxos         │
│    → Gera design.md na session                             │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌─ JANELA 2B — EXECUTION (Dev) ─────────────────────────────┐
│                                                            │
│  /cortex:execution                                         │
│    → Informa slug: epic-<NNN>-<descricao>                  │
│    → Boot integrado: GATE 0                                │
│    → Verifica context.md + architecture.md                 │
│    → GATE 4: plan × architecture                           │
│                                                            │
│  /engineer:plan                                            │
│    → Cria plan.md faseado                                  │
│    → Fases de backend/lógica primeiro (não dependem design) │
│                                                            │
│  /engineer:work  → fases de backend                        │
│    → GATE 3 (ADR mapping) por arquivo                      │
│                                                            │
│  [aguardar design.md — GATE-D aprovado]                    │
│                                                            │
│  /engineer:work  → fases de UI/componentes                 │
│    → Ler design.md antes de implementar componentes visuais │
│    → GATE 3 por arquivo                                    │
│                                                            │
│  /engineer:pre-pr  → GATE 5                                │
│  /engineer:pr                                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Regra de paralelismo

| Dev pode fazer sem design.md | Dev aguarda design.md |
|---|---|
| Backend / API endpoints | Componentes de UI |
| Lógica de negócio | Telas e layouts |
| Migrations e banco | Fluxos de navegação |
| Testes unitários de domínio | Integração de formulários |

### Duração típica por janela

| Janela | Papel | Duração esperada | Tokens estimados |
|---|---|---|---|
| Janela 1 (Strategy) | PO / Tech Lead | 30–90 min | 8k–20k |
| Janela 2A (Design) | Designer | 1–4h | 8k–16k |
| Janela 2B (Execution) | Dev | 2–8h | 20k–60k |

---

## 3. Nova Feature

**Contexto:** Feature incremental dentro de um épico já em andamento. Architecture e context já existem.

### Janelas necessárias: 1 (Execution direta)

> Se a feature muda arquitetura existente → abrir Janela 1 brevemente para atualizar architecture.md

### Passo a passo

```
JANELA 2 (ou janela atual se épico em andamento)

/cortex:execution
  → Informa slug do épico pai: epic-<NNN>-<descricao>
  → OU criar slug da feature: feature-<NNN>-<descricao>

Se architecture.md já cobre esta feature:
  → Ir direto para /engineer:work
  → GATE 3 por arquivo

Se a feature não estava na architecture:
  → Atualizar architecture.md (adicionar seção da nova feature)
  → Verificar GATE 2 novamente (context + architecture completos?)
  → Então /engineer:plan + /engineer:work
```

### Decisão: mesma session ou nova session?

| Situação | Ação |
|---|---|
| Feature está listada em architecture.md do épico | Mesma session, nova fase no plan.md |
| Feature é nova e pequena (< 3 arquivos) | Mesma session, atualizar architecture.md |
| Feature é grande ou muda arquitetura significativamente | Nova session: feature-<NNN>-<descricao> |

---

## 4. Bug

**Contexto:** Bug não crítico identificado. Pode ser corrigido com calma.

### Janelas necessárias: 1

### Passo a passo

```
JANELA 2

/cortex:execution
  → Slug: bug-<NNN>-<descricao-curta>
  → Boot integrado: GATE 0
  → Verificar se existe session anterior para este bug

Se session não existe:
  → Criar context.md mínimo:
      Objetivo: corrigir <comportamento errado>
      Escopo.Incluído: fix do bug específico
      Escopo.Excluído: refatorações não relacionadas
      Dependências: nenhuma (ou listar se houver)

  → Criar architecture.md mínimo:
      Visão Geral: onde está o bug + causa raiz identificada
      Arquivos a modificar: <lista>
      ADRs Aplicáveis: <mapeadas do adrs-summary.md>
      Trade-offs: nenhum (ou listar se houver)

/engineer:plan  →  plano simples (1–2 fases)
/engineer:work
  → GATE 3 por arquivo modificado
/engineer:pre-pr
/engineer:pr
```

### Sinais de que o bug virou épico

- Corrigir o bug exige mudar arquitetura
- Fix impacta mais de 5 arquivos
- Causa raiz está em design, não em código

Nesse caso: fechar a session de bug e criar `refactor-<NNN>-<descricao>`.

---

## 5. Bug Crítico

**Contexto:** Bug em produção ou staging. Precisa de correção imediata. Pipeline enxuto — sem spec completo.

### Janelas necessárias: 1

### Passo a passo

```
JANELA 2 (abrir imediatamente)

/cortex:boot
  → GATE 0 rápido + CORTEX_CONTEXT carregado

EXECUTION → BUG CRÍTICO  ← selecionar no menu de modos
  → Carrega cortex-bug.md

PASSO 1: Bug Report
  → Sintoma: <o que o usuário vê>
  → Reprodução: <como reproduzir>
  → Stack trace: <erro completo>
  → Impacto: <usuários / funcionalidade bloqueada>
  → Slug automático: bug-<NNN>-<descricao-curta>

PASSO 2: Diagnosticar Root Cause (obrigatório)
  → Ler arquivos indicados no stack trace
  → Identificar linha/lógica exata da causa
  → NUNCA pular esta etapa

PASSO 3: GATE-B — Plano de Correção Mínimo
  → Listar arquivos a modificar
  → Checklist de regressão: quem mais usa o código afetado?

PASSO 4: Fix
  → GATE 3 por arquivo (mesmo em emergência — previne alucinação)
  → Apenas o fix — sem refatoração extra

PASSO 5: GATE-B2 — Verificação Pós-Fix
  → Sintoma original seria resolvido? ✓
  → "Quem mais chama" verificado? ✓
  → Nenhum arquivo fora do escopo modificado? ✓

PASSO 6: PR de Bug
  → Template específico: sintoma + root cause + fix + risco de regressão
```

### Regras do modo bug crítico

- **Não aplicar fix sem root cause** — nunca tratar sintoma sem entender causa
- **Não pular GATE 3** mesmo sob pressão — é quando mais se erra
- Abrir issue de follow-up para refatoração pós-hotfix se necessário
- Slug do follow-up: `refactor-<NNN>-pos-hotfix-<descricao>`

### Sinais de que o bug virou épico

- Corrigir o bug exige mudar arquitetura
- Fix impacta mais de 5 arquivos
- Causa raiz está em design, não em código

Nesse caso: fechar a session de bug e criar `refactor-<NNN>-<descricao>`.

---

## 6. Modificar Feature Existente

**Contexto:** Feature já está implementada. Você quer adicionar ou alterar algo nela.
Ex: login existe → adicionar login social. Dashboard existe → adicionar gráfico de barras.

### Janelas necessárias: 2

### Quando usar este modo (vs Execution)

| Situação | Modo |
|---|---|
| Feature nova do zero com spec | Strategy → Execution |
| Feature existe, quero adicionar algo | **Modify** |
| Feature existe, só fazer um ajuste pequeno (< 3 linhas) | Execution direta |

### Janela 1 — Delta Spec

```
/cortex:boot
  → CORTEX_CONTEXT carregado

STRATEGY → MODIFY  ← selecionar no menu de modos
  → Carrega cortex-modify.md

FASE 0: Capturar objetivo
  "O que existe hoje?"  →  <descrever implementação atual>
  "O que você quer adicionar/mudar?"  →  <descrever o delta>
  Slug: feature-<NNN>-<descricao-kebab-case>

FASE 1: Ler código existente (obrigatório antes de qualquer spec)
  → IA lê os arquivos relevantes
  → Registra: estrutura atual, padrões em uso, pontos de extensão

FASE 2: GATE-M — Mapa de Impacto
  → Arquivos a modificar (com motivo)
  → Arquivos novos a criar
  → Arquivos dependentes em risco
  → Funcionalidade existente que pode quebrar

FASE 3: Delta Spec
  → context.md com seção "O que existe hoje" + "O que muda" + "Mantendo intacto"
  → architecture.md com "Arquivos a Modificar" (antes → depois) + Mapa de Impacto

GATE 2 (delta)  →  spec fechada
  → Entrega: "Spec fechada. Slug: feature-<NNN>-<descricao>"
```

### Janela 2 — Execução

```
/cortex:execution
  → Slug: feature-<NNN>-<descricao>
  → Ler architecture.md "Arquivos a Modificar"
  → Re-ler cada arquivo existente antes de editar
  → GATE 3 por arquivo
  → Ao finalizar: verificar "Mantendo intacto" ainda está intacto
  → /engineer:pre-pr → /engineer:pr
```

### O que é diferente do Execution padrão

| Execution | Modify |
|---|---|
| Parte de uma spec nova | Parte do código existente |
| context.md describe a feature completa | context.md descreve só o delta |
| architecture.md lista arquivos a criar | architecture.md lista arquivos a modificar + mapa de impacto |
| Foco: entregar correto | Foco: entregar correto sem quebrar o que existe |

---

## 7. Mudança de Prioridade

**Contexto:** Épico em andamento foi desprioritizado. Outro épico precisa começar ou retomar.

### Passo a passo

```
JANELA ATUAL (épico em andamento)

Antes de parar:
  → Atualizar plan.md com status atual de cada fase
  → Marcar fases incompletas como "⚠ pausado"
  → Anotar: "Motivo da pausa: mudança de prioridade — <data>"
  → Salvar qualquer contexto importante como comentário no plan.md

Fechar janela.
```

```
NOVA JANELA 1 (novo épico de maior prioridade)

/cortex:boot
  → CORTEX_CONTEXT carregado
  → Sessions listadas: [épico pausado aparece aqui]

/cortex:strategy
  → Novo slug: epic-<NNN>-<novo-epico>
  → Fluxo normal de Strategy
```

### Retomando o épico pausado depois

```
NOVA JANELA 2

/cortex:execution
  → Slug: epic-<NNN>-<epico-pausado>
  → Boot + GATE 0
  → Verifica context.md + architecture.md
  → GATE 4: plan.md vs architecture.md (verificar se algo mudou durante a pausa)
  → Exibe status: "Fases pausadas: [lista]"
  → Continuar de onde parou
```

### O que NÃO fazer

- Não apagar a session do épico pausado
- Não modificar architecture.md do épico pausado sem documentar a razão
- Não misturar código de dois épicos na mesma janela

---

## 8. Documentar Nova Feature

**Contexto:** Feature já implementada. Precisa de documentação técnica e de produto.

### Janelas necessárias: 1

### Passo a passo

```
JANELA 1 (documentação)

/cortex:boot
  → CORTEX_CONTEXT carregado

Verificar o que existe:
  → docs/.cortex/sessions/<slug>/context.md     → base do contexto
  → docs/.cortex/sessions/<slug>/architecture.md → base técnica
  → docs/.cortex/sessions/<slug>/plan.md        → o que foi implementado

/engineer:docs
  → Invoca @branch-documentation-writer
  → Analisa mudanças do branch atual
  → Gera/atualiza documentação:
      docs/technical-context/    → se houver mudanças técnicas
      docs/business-context/     → se houver impacto de produto

Se quiser documentação mais completa (API, arquitetura):
  → /docs-commands:build-tech-docs   → documentação técnica
  → /docs-commands:build-business-docs → documentação de produto
```

### O que documentar por tipo de feature

| Tipo | Documentação obrigatória | Documentação recomendada |
|---|---|---|
| API endpoint novo | Contrato da API (params, response, erros) | Exemplos de uso |
| UI feature | Comportamento esperado (4 estados) | Screenshots ou mocks |
| Integração externa | Env vars + setup + fallbacks | Diagrama de fluxo |
| Background job | Schedule + inputs + outputs | Monitoring |

---

## 9. Documentar Novo Épico

**Contexto:** Épico completo (todas as features entregues). Documentação completa do ciclo.

### Janelas necessárias: 1

### Passo a passo

```
JANELA 1 (documentação de épico)

/cortex:boot
  → CORTEX_CONTEXT carregado

Preparação: reunir materiais do épico
  → docs/.cortex/sessions/<slug>/context.md
  → docs/.cortex/sessions/<slug>/architecture.md
  → docs/.cortex/sessions/<slug>/plan.md
  → docs/business-context/brainstorm/<slug>-*.md  (se existir)

Documentação técnica:
  /engineer:docs
    → Atualiza docs/technical-context/ com as mudanças do épico

Documentação de produto:
  /docs-commands:build-business-docs
    → Atualiza FEATURE_CATALOG.md no business-context
    → Atualiza PRODUCT_STRATEGY.md se épico muda roadmap

Sincronização Linear:
  /product:sync-linear
    → Marca épico como Done no Linear
    → Adiciona link para documentação nos comentários das issues

Backlog:
  → Atualizar docs/backlog/EPIC-<NNN>-*.md com status "Entregue"
  → Adicionar seção "Resultado e Aprendizados" no backlog doc
```

### Estrutura sugerida para documentação de épico

```markdown
# EPIC-NNN — <nome>

## Status: Entregue — <data>

## Problema que resolveu
[1–2 parágrafos]

## O que foi construído
[Lista de features entregues com links para código]

## Métricas de impacto
[Se disponíveis]

## Decisões arquiteturais tomadas
[Links para ADRs criadas/modificadas durante o épico]

## Aprendizados
[O que funcionou, o que mudar no próximo épico]

## Débito técnico identificado
[Issues de follow-up criadas]
```

---

## 10. Captação de Ideia

**Contexto:** Uma ideia surgiu — pode ser de qualquer fonte (usuário, reunião, observação). Ainda não é requisito confirmado.

### Janelas necessárias: 1

### Passo a passo

```
JANELA 1 (produto)

/cortex:boot
  → CORTEX_CONTEXT carregado

Cenário A: Ideia bruta, sem clareza ainda
  /product:brainstorm "<tema da ideia>"
    → Exploração estruturada
    → 3+ alternativas de abordagem
    → Análise de trade-offs
    → Salva em docs/business-context/brainstorm/<slug>-<data>.md

Cenário B: Ideia já tem forma — só precisa ser capturada
  /product:collect "<descrição da ideia>"
    → Entende o que está sendo pedido
    → Pergunta de clarificação se necessário
    → Cria issue no Linear (backlog)

Cenário C: Ideia precisa ser validada contra produto atual
  /product:check "<ideia>"
    → Valida contra docs/business-context/
    → Lista alinhamentos e conflitos
    → Recomenda próximo passo
```

### Onde as ideias ficam

```
Ideia bruta      → docs/business-context/brainstorm/<slug>-<data>.md
Ideia capturada  → Linear (backlog via /collect)
Ideia validada   → docs/backlog/ (via /spec quando aprovada)
```

### Quando uma ideia vira épico

Uma ideia sobe para épico quando:
- Foi validada contra produto atual (/check)
- Tem pelo menos um brainstorm salvo
- Foi aprovada pelo time / PO
- Tem prioridade no roadmap

Nesse caso → ir para cenário 2 (Novo Épico).

---

## 11. Capturar Ideia Rápida (Modo IDEIA)

**Contexto:** Uma ideia surgiu e precisa ser registrada agora, sem abrir spec formal nem criar session. Leva 2–5 minutos.

### Janelas necessárias: 1

### Quando usar este modo (vs product:brainstorm)

| Situação | Modo |
|---|---|
| Ideia bruta, precisa de exploração estruturada | `/product:brainstorm` |
| Ideia já tem forma, só quer registrar no backlog | **STRATEGY → IDEIA** |
| Feedback de usuário captado na hora | **STRATEGY → IDEIA** |
| Melhoria identificada durante código | **STRATEGY → IDEIA** |

### Passo a passo

```
JANELA 1

/cortex:boot
  → GATE 0 + CORTEX_CONTEXT carregado

Menu: STRATEGY → IDEIA
  → Carrega cortex-idea.md

PASSO 1: Descrever a ideia em linguagem natural
PASSO 2: Classificar tipo + impacto estimado
  Tipos:   feature | melhoria | oportunidade | divida-tecnica | research
  Impacto: alto | médio | baixo

PASSO 3: Gerar nota de backlog
  → Salva automaticamente em docs/business-context/backlog/<slug>.md

PASSO 4: Confirmar captura
  → "Ideia registrada: <título> [tipo] [impacto]"

Opcional: evoluir para STRATEGY → EPIC quando pronto
```

### O que NÃO é o modo IDEIA

- Não cria session (`docs/.cortex/sessions/`)
- Não gera context.md nem architecture.md
- Não abre issue no Linear automaticamente (usar `/product:collect` para isso)

---

## 12. Refinar Tarefa ou Quebrar Épico

**Contexto A — Refinar:** Uma tarefa está vaga, mal especificada ou com dependências não claras.
**Contexto B — Quebrar:** Um épico ficou grande demais (> 3 semanas de trabalho ou > 8 features).

### Cenário A: Refinar tarefa vaga

```
JANELA 1

/cortex:boot
  → CORTEX_CONTEXT carregado

/product:refine "<descrição vaga da tarefa>"
  → Processo de clarificação em 3 fases:
      Fase 1: perguntas para eliminar ambiguidade
      Fase 2: sumário do entendimento para aprovação
      Fase 3: geração do requisito refinado em markdown

/product:check "<requisito refinado>"
  → Valida se refinamento está alinhado com produto

Se aprovado:
  → Atualizar issue no Linear via /product:collect
  → Ou atualizar context.md da session se feature já tem session
```

### Cenário B: Quebrar épico grande

```
JANELA 1

/cortex:boot
  → CORTEX_CONTEXT carregado

Verificar épico atual:
  → Ler docs/.cortex/sessions/<slug>/context.md
  → Ler docs/.cortex/sessions/<slug>/architecture.md
  → Ler docs/backlog/EPIC-<NNN>-*.md

/product:refine "<nome do épico>"
  → Identificar quais features são MVP (mínimo para valor real)
  → Identificar quais features são incrementais (podem vir depois)
  → Propor quebra em sub-épicos ou milestones

Resultado esperado:
  EPIC-NNN (original)     → renomear para EPIC-NNN-v1 (MVP)
  EPIC-NNN-v2             → novo épico com features incrementais
  EPIC-NNN-v3             → futuro (se aplicável)

/product:sync-linear
  → Atualizar estrutura de épicos no Linear
  → Mover features entre épicos conforme quebra aprovada
```

### Sinais de que um épico precisa ser quebrado

| Sinal | Ação |
|---|---|
| Architecture.md tem > 15 arquivos a criar | Quebrar em 2 épicos |
| Plan.md tem > 10 fases | Revisar escopo |
| Feature do épico depende de outra feature do mesmo épico | Separar em sequência clara |
| Épico em andamento há > 3 semanas sem PR | Avaliar redução de escopo |

---

## 13. Design de Feature (Janela 3)

**Contexto:** Spec fechada com GATE 2 aprovado. Designer precisa traduzir a spec em telas, fluxos e componentes antes ou durante a implementação do Dev.

### Quando usar

| Situação | Usar Design? |
|---|---|
| Feature tem UI visível para o usuário | Sim |
| Feature é só backend / API | Não (ir direto para Execution) |
| Bug crítico em produção | Não (tempo não permite) |
| Modificação pequena de UI (< 2 componentes) | Opcional |

### Janelas necessárias: 1 (em paralelo com Execution)

### Passo a passo

```
JANELA 2A — DESIGN

/cortex:boot
  → GATE 0 + CORTEX_CONTEXT carregado

Menu: DESIGN
  → Carrega cortex-design.md
  → Informa slug da session: <tipo>-<NNN>-<descricao>

PASSO 1: Carregar spec
  → Lê context.md + architecture.md da session
  → Confirma: "Session carregada. Objetivo: <objetivo>"

PASSO 2: Mapear telas e fluxos
  → IA identifica telas, fluxos, componentes e estados a partir da spec
  → Exibe mapa para confirmação: "X telas, Y fluxos, Z componentes"
  → Ajustar antes de prosseguir se necessário

PASSO 3: Especificar por tela/fluxo
  → Para cada tela: layout, componentes, estados (normal/loading/error/empty)
  → Para cada fluxo: trigger → passos → destino
  → Interações: ação do usuário → resultado esperado

GATE-D: Cobertura completa
  → Todos os fluxos do context.md cobertos?
  → Estados definidos para cada tela?
  → Notas de handoff para Dev preenchidas?
  → Se falhar: listar itens pendentes e completar

PASSO 5: Gerar design.md
  → Salvo em: docs/.cortex/sessions/<slug>/design.md
  → Manifesto atualizado: files.design.md = true

→ Sinalizar para Dev: "design.md pronto — GATE-D aprovado"
```

### O que design.md contém

```markdown
# Design: <nome da feature>

**Status:** ready
Telas e Fluxos: [especificações por tela]
Cobertura de Requisitos: [mapeamento context → tela]
Assets e Links: [Figma, Zeplin, etc.]
Handoff para Dev: [edge cases visuais, tokens, variantes]
```

### Sinais de que o Design Mode não é suficiente

| Sinal | Ação |
|---|---|
| Design levanta requisito não previsto na spec | Parar → PO abre issue → atualizar context.md |
| Tela precisa de dado não previsto na architecture | Parar → Tech Lead atualiza architecture.md |
| Feature não tem UI real | Fechar Design Mode, Dev vai direto para Execution |

---

## 14. Task de Plataforma Sem Spec

**Contexto:** Dev recebe uma task de uma plataforma de gestão (Jira, Linear, Trello, Asana, Monday.com) que ainda **não tem sessão de trabalho iniciada** — sem `context.md` nem `architecture.md`. Em vez de ir direto para o código, o modo cria a spec a partir da task e encaminha para o plan.

### Quando usar este modo

| Situação | Modo |
|---|---|
| Task do Jira/Linear com spec completa já existente | EXECUTION → IMPLEMENTAR SPEC |
| Task nova sem context.md + architecture.md | **EXECUTION → TASK DE PLATAFORMA** |
| Bug reportado na plataforma | EXECUTION → BUG CRÍTICO |
| Modificar feature existente com task do Linear | STRATEGY → MODIFY |

### Janelas necessárias: 1 (+ nova janela para implementação)

### Passo a passo

```
JANELA 1 — Spec a partir da task

/cortex:boot
  → GATE 0 + CORTEX_CONTEXT carregado

Menu: EXECUTION → TASK DE PLATAFORMA
  → Carrega cortex-platform-task.md

PASSO 1: Verificar CORTEX_CONTEXT
  → Contexto carregado pelo Boot

PASSO 2: Detectar plataforma configurada
  → Lê .claude/.env automaticamente
  → Se 1 plataforma configurada (ex: LINEAR_API_KEY):
      "Plataforma detectada: Linear ✓"
      → Direto para colagem da task

  → Se múltiplas configuradas:
      → Pergunta 1 vez qual usar (mostra só as configuradas)

  → Se nenhuma configurada:
      ┌───────────────────────────────────────────────────┐
      │  ⚠ Nenhuma plataforma configurada                 │
      │                                                   │
      │  [1] Configurar Linear → /product:setup-linear   │
      │  [2] Continuar manual  → colar conteúdo da task  │
      └───────────────────────────────────────────────────┘

Cole o conteúdo da task:
  → Título / nome da issue
  → Descrição
  → Critérios de aceite / definition of done
  → ID da issue (se disponível)

PASSO 3: Definir slug
  → IA sugere slug baseado no título
  → Validar padrão: <tipo>-<NNN>-<descricao-kebab-case>
  → Confirmar antes de criar qualquer arquivo

PASSO 4: Criar session
  → docs/.cortex/sessions/<slug>/ criado
  → Manifesto atualizado (in_progress)

PASSO 5: Investigação → context.md
  → IA analisa a task + clarificações (3–5 perguntas)
  → Identifica: motivação, meta, estratégia, dependências, limitações
  → Gera context.md com regras críticas do projeto incorporadas
  → Aguarda aprovação explícita do usuário

PASSO 6: Estruturação arquitetural → architecture.md
  → IA examina código existente e aplica ADRs
  → Mapeia: componentes, dependências, arquivos a criar/modificar
  → Gera architecture.md com verificação de consistência automática
  → Aguarda aprovação explícita do usuário

PASSO 9: Handoff
  → "Spec criada. context.md ✓ architecture.md ✓"
  → "Invoque /engineer:plan para continuar"
```

```
JANELA 2 — Implementação (nova janela após aprovação da spec)

/engineer:plan
  → Lê context.md + architecture.md da session
  → Cria plan.md faseado

/engineer:work
  → GATE 3 (ADR mapping) por arquivo
  → GATE 4 (plan × architecture)

/engineer:pre-pr → /engineer:pr
```

### Diferença: Plataforma configurada vs manual

| Cenário | O que acontece |
|---|---|
| Linear configurado (`.claude/.env` tem `LINEAR_API_KEY`) | Detecta automaticamente, pula a pergunta de plataforma |
| Múltiplas plataformas configuradas | Pergunta 1 vez qual usar (só as configuradas) |
| Nenhuma configurada | Oferece configurar o Linear ou continuar manualmente |
| Continuar manual | Pergunta 1 vez "De qual plataforma vem esta task?" e aceita qualquer resposta |

### Configurar a integração com o Linear

Se o Linear ainda não está configurado:

```bash
/product:setup-linear
  → Guia interativo: API Key → Org → Team → Project
  → Salva em .claude/.env (gitignored)
  → Após setup: retornar ao PASSO 2 do Platform Task
```

### Tokens estimados

| Fase | Tokens estimados |
|---|---|
| Investigação + context.md | 3k–8k |
| Arquitetura + architecture.md | 5k–12k |
| Total (sem implementação) | 8k–20k |

---

## 15. Fluxo Completo por Papel do Time

**Referência rápida de quando cada papel entra e o que faz.**

### PO / Tech Lead

```
/cortex:boot
  → Menu: STRATEGY

Cenário: nova feature
  → STRATEGY → EPIC → Strategy completo → GATE 2
  → /product:task → criar issue de rastreamento

Cenário: modificação
  → STRATEGY → MODIFY → Delta spec → GATE 2
  → /product:task → criar issue de rastreamento

Cenário: ideia rápida
  → STRATEGY → IDEIA → Nota de backlog
  → /product:task → criar issue de rastreamento

PO NÃO entra em: DESIGN nem EXECUTION
```

### Designer

```
/cortex:boot
  → Menu: DESIGN (Janela 3)
  → Pré-requisito: GATE 2 aprovado pela PO/Tech Lead

→ Informa slug da session
→ Design completo → GATE-D aprovado
→ design.md gerado na session

Designer NÃO entra antes de: GATE 2 aprovado
Designer NÃO escreve código de produção
```

### Dev

```
/cortex:boot
  → Menu: EXECUTION

Cenário: implementar feature com UI (spec pronta)
  → EXECUTION → IMPLEMENTAR SPEC
  → /engineer:plan → fases backend primeiro
  → /engineer:work → backend/lógica
  → [aguardar design.md — GATE-D aprovado]
  → /engineer:work → UI/componentes (lendo design.md)
  → /engineer:pre-pr → /engineer:pr

Cenário: implementar feature sem UI (spec pronta)
  → EXECUTION → IMPLEMENTAR SPEC
  → /engineer:plan + /engineer:work
  → /engineer:pre-pr → /engineer:pr

Cenário: task do Jira/Linear/Trello/Asana/Monday sem spec
  → EXECUTION → TASK DE PLATAFORMA
  → Detecta plataforma (.claude/.env)
  → Captura task → define slug
  → Investigação + clarificações → context.md (aprovação)
  → Estruturação arquitetural → architecture.md (aprovação)
  → Nova janela → /engineer:plan + /engineer:work + PR

Cenário: bug crítico
  → EXECUTION → BUG CRÍTICO
  → Root cause → fix mínimo → verificação → PR

Dev NÃO entra antes de: GATE 2 aprovado
(exceto TASK DE PLATAFORMA — que cria a spec como parte do fluxo)
```

### Tabela resumo de papéis

| Papel | Janela | Pré-requisito | Entrega |
|-------|--------|---------------|---------|
| PO / Tech Lead | STRATEGY (Janela 1) | Boot com GATE 0 | context.md + architecture.md (GATE 2) |
| Designer | DESIGN (Janela 3) | GATE 2 aprovado | design.md (GATE-D) |
| Dev | EXECUTION (Janela 2) | GATE 2 aprovado | PR com código |
| Dev | EXECUTION → TASK DE PLATAFORMA | Boot com GATE 0 + task de plataforma | context.md + architecture.md → /engineer:plan |

---

## Referência Rápida — Qual modo para cada situação

```
Situação                                   Papel           Menu                              Comando
─────────────────────────────────────────────────────────────────────────────────────────────────────
Projeto do zero                            PO/Tech Lead    Boot → STRATEGY → EPIC            /cortex:boot
Novo épico do zero                         PO/Tech Lead    STRATEGY → EPIC                   /cortex:strategy
Feature nova com spec pronta               Dev             EXECUTION → IMPLEMENTAR SPEC      /cortex:execution
Task do Jira/Linear/Trello sem spec        Dev             EXECUTION → TASK DE PLATAFORMA    /cortex:execution [3]
Criar design após GATE 2                   Designer        DESIGN                            /cortex:design
Feature X existe → adicionar Y             PO/Tech Lead    STRATEGY → MODIFY                 /cortex:modify
Bug em produção                            Dev             EXECUTION → BUG CRÍTICO           /cortex:bug
Bug não crítico (pode esperar)             Dev             EXECUTION → BUG CRÍTICO           /cortex:bug
Nova feature (dentro de épico)             Dev             —                                 /engineer:work
Ideia rápida sem spec                      PO/Tech Lead    STRATEGY → IDEIA                  /cortex:idea
Mudança de prioridade                      PO/Tech Lead    Salvar estado                     /cortex:boot em nova janela
Documentar feature                         Dev             —                                 /engineer:docs
Documentar épico                           Dev             —                                 /engineer:docs + sync
Captação de ideia estruturada              PO/Tech Lead    —                                 /product:brainstorm
Refinar tarefa                             PO/Tech Lead    —                                 /product:refine
Quebrar épico                              PO/Tech Lead    —                                 /product:refine + sync
```

## Guia Rápido de Escolha

| Pergunta | Papel | Caminho no Menu |
|---|---|---|
| Tenho uma ideia nova sem código ainda? | PO / Tech Lead | STRATEGY → EPIC |
| Tenho spec pronta e vou implementar? | Dev | EXECUTION → IMPLEMENTAR SPEC |
| Recebi uma task do Jira/Linear/Trello sem spec? | Dev | EXECUTION → TASK DE PLATAFORMA |
| Já existe implementação e quero estender? | PO / Tech Lead | STRATEGY → MODIFY |
| Tem bug reportado que precisa de fix? | Dev | EXECUTION → BUG CRÍTICO |
| Quero registrar uma ideia rapidamente? | PO / Tech Lead | STRATEGY → IDEIA |
| Spec fechada, preciso criar o design das telas? | Designer | DESIGN |

---

## Comandos de Emergência

| Situação | Comando |
|---|---|
| docs/ desatualizado após mudanças grandes | `/engineer:discover` |
| Session com dados inconsistentes | Editar manualmente context.md / architecture.md, depois `/cortex:execution` |
| PR com conflito de merge | Resolver conflito → `/engineer:pre-pr` novamente |
| Linear fora de sincronia | `/product:sync-linear` |
| Sem ideia do estado atual do projeto | `/cortex:boot` + listar sessions |
