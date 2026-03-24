# Guia de Custo de Tokens — Framework Cortex v1.2.3

> Referência para entender e otimizar o consumo de tokens em cada operação do Framework Cortex.

---

## Visão Geral

O Framework Cortex é otimizado para minimizar tokens sem perder segurança e rastreabilidade.
Cada mecanismo tem um custo mensurável. Este guia documenta todos eles.

---

## Overhead Permanente (toda sessão)

Estes arquivos são carregados automaticamente pelo Claude Code no início de toda conversa.

| Arquivo | Tamanho | Tokens | Frequência |
|---|---|---|---|
| `CLAUDE.md` (projeto) | ~7.000 chars | ~1.750 tokens | 1x por sessão |
| `memory/MEMORY.md` (auto memory) | ~354 chars | ~55 tokens | 1x por sessão |
| Seção Re-Init em CLAUDE.md | ~550 chars | ~130 tokens | incluído acima |

**Total automático por sessão:** ~1.800 tokens (fixo, independente do que você fizer).

> A seção "Cortex Re-Init" está embutida no CLAUDE.md — não soma custo adicional.

---

## Custo por Comando

### `/cortex:boot`

| Etapa | Tokens | Condição |
|---|---|---|
| Leitura de `cortex-boot.md` | ~400 tokens | sempre |
| GATE 0 — verificar 4 arquivos | ~20 tokens | sempre |
| PASSO 3.2 — cache hit (fingerprint ok) | ~30 tokens | docs/ não mudou |
| PASSO 3.2 — cache miss (regenerar índices) | ~500 tokens | docs/ mudou |
| PASSO 3.3 — Bash para fingerprint | ~10 tokens | sempre |
| PASSO 3.4 — sessions manifest (cache hit) | ~20 tokens | slugs não mudaram |
| PASSO 3.4 — sessions manifest (rescan) | ~80 tokens | nova session criada |
| PASSO 5.1 — escrever MEMORY.md | ~10 tokens | sempre |
| **Boot com cache hit** | **~490 tokens** | caso comum |
| **Boot com cache miss** | **~1.040 tokens** | docs/ foi editado |

---

### `/cortex:strategy`

| Etapa | Tokens | Condição |
|---|---|---|
| Leitura de `cortex-strategy.md` | ~350 tokens | na ativação |
| Fase 0 — fingerprint (skip se boot ativo) | ~0 tokens | boot na mesma janela |
| Fase 0 — fingerprint (nova janela) | ~30 tokens | sem boot prévio |
| Criação de context.md (conteúdo) | ~300–600 tokens | por feature |
| Criação de architecture.md (conteúdo) | ~400–800 tokens | por feature |
| GATE 2 — checklist | ~50 tokens | ao fechar spec |
| **Ativação típica** | **~400 tokens** | |

---

### `/cortex:execution`

| Etapa | Tokens | Condição |
|---|---|---|
| Leitura de `cortex-execution.md` | ~370 tokens | na ativação |
| PASSO 1 — fingerprint (skip se boot ativo) | ~0 tokens | boot na mesma janela |
| PASSO 2 — identificar session | ~20 tokens | sempre |
| PASSO 4 — ler CORTEX_CONTEXT comprimido | ~80 tokens | sempre |
| GATE 3 — ADR lookup via INDEX (hit) | ~30 tokens | ~80% dos arquivos |
| GATE 3 — ADR lookup via adrs-summary.md (miss) | ~120 tokens | ~20% dos arquivos |
| GATE 4 — Bash timestamps | ~10 tokens | se plan.md existe |
| **Ativação típica** | **~520 tokens** | |
| **Por arquivo implementado (GATE 3)** | **~30–120 tokens** | |

---

### `/engineer:warm-up` e `/product:warm-up` (Warm-up Completo)

Comandos de aquecimento de sessão. Carregam contexto máximo do projeto para dar ao modelo visão completa antes de qualquer tarefa.

| Etapa | Tokens | Condição |
|---|---|---|
| Leitura de `README.md` (raiz) | ~1.500 tokens | sempre — arquivo de 6 KB |
| Leitura do Master Docs index (`~/{project}`) | ~250–500 tokens | se existir |
| Listagem de `docs/` | ~125 tokens | sempre |
| **Warm-up completo (típico)** | **~1.875 tokens** | |
| **Warm-up completo (máximo)** | **~2.125 tokens** | |

> Nenhum cache condicional — releem tudo a cada invocação.
> `engineer:warm-up` e `product:warm-up` são equivalentes (mesmas etapas, ordem diferente).

---

### Warm-up Mini

Versão reduzida que confia no `CLAUDE.md` já carregado automaticamente (overhead permanente de ~1.750 tokens/sessão) e carrega apenas o mínimo incremental necessário.

| Etapa | Tokens | Condição |
|---|---|---|
| `CLAUDE.md` (já auto-loaded) | ~0 tokens extra | overhead permanente, não repete |
| `memory/MEMORY.md` (já auto-loaded) | ~0 tokens extra | overhead permanente, não repete |
| Listagem de `docs/` | ~125 tokens | para saber o que está disponível |
| **Warm-up mini (total extra)** | **~125 tokens** | |

> Em vez de reler o `README.md` (~1.500 tokens), confia no `CLAUDE.md` que já contém stack,
> padrões obrigatórios, arquitetura de rotas, RBAC, aliases e utilitários do projeto.

---

### Por Que a Mudança e as Vantagens

O warm-up completo foi projetado antes de projetos adotarem `CLAUDE.md` denso com contexto de projeto. Com o `CLAUDE.md` deste repositório (~7.000 chars, ~1.750 tokens), o `README.md` (6.044 bytes, ~1.500 tokens) tornou-se **largamente redundante**: stack, padrões, comandos, arquitetura e regras já estão no overhead permanente.

| Critério | Warm-up Completo | Warm-up Mini |
|---|---|---|
| Custo extra por ativação | ~1.875 tokens | ~125 tokens |
| Redundância com `CLAUDE.md` | Alta — README repete stack e padrões | Nenhuma |
| Acesso a Master Docs externos | Sim — lê índice completo | Somente quando solicitado |
| Cache condicional | Não — relê sempre | N/A — não lê arquivos pesados |
| Adequado para sessões curtas | Não — overhead alto | Sim |
| Adequado para projetos sem `CLAUDE.md` | Sim | Não recomendado |
| Complementar ao `/cortex:boot` | Redundante — boot já carrega contexto | Desnecessário após boot |

**Vantagens do Warm-up Mini:**

1. **~15x mais barato** — ~125 tokens vs ~1.875 tokens de overhead por ativação
2. **Zero redundância** — `CLAUDE.md` já entrega stack, padrões, ADRs resumidos e arquitetura
3. **Resposta mais ágil** — menos arquivos lidos antes de iniciar o trabalho real
4. **Composto com Cortex** — quando `/cortex:boot` já carregou `CORTEX_CONTEXT`, o warm-up completo é duplamente redundante; o mini é suficiente
5. **Economia acumulada** — em sessões com compactações múltiplas, cada reativação economiza ~1.750 tokens

**Quando ainda usar o Warm-up Completo:**
- Projeto sem `CLAUDE.md` configurado ou com `CLAUDE.md` mínimo
- README.md contém informações ausentes do `CLAUDE.md` (diagramas, decisões históricas)
- Acesso aos Master Docs externos é necessário para a sessão específica
- Onboarding de novo colaborador sem contexto prévio do projeto

---

### Comparativo: Warm-up Completo vs Mini vs Boot Cortex

| Operação | Tokens extras | Cache? | Redundante com CLAUDE.md? |
|---|---|---|---|
| Warm-up completo | ~1.875 tokens | Não | Sim (~70% overlap) |
| Warm-up mini | ~125 tokens | N/A | Não |
| `/cortex:boot` (cache hit) | ~490 tokens | Sim | Não — complementar |
| `/cortex:boot` (cache miss) | ~1.040 tokens | Sim | Não — complementar |

---

## Anti-Perda de Contexto (v1.2.3)

Mecanismo implementado para sobreviver à compactação automática do Claude Code.

| Componente | Tokens | Quando carregado |
|---|---|---|
| `memory/MEMORY.md` | ~55 tokens | Sempre (auto memory) |
| Seção Re-Init no `CLAUDE.md` | ~130 tokens | Sempre (projeto) |
| Escrita no MEMORY.md por transição | ~10 tokens | 1x por ativação de modo |

**Formato da linha de estado (linha 2 do MEMORY.md):**
```
last_boot:<ISO> mode:<modo> session:<slug> project:<nome> rules:<N> adrs:<N>
```

**Modos registrados:**
| Valor | Quando |
|---|---|
| `boot_complete` | Após `/cortex:boot` |
| `strategy` | Durante Strategy Mode |
| `strategy_closed` | Após GATE 2 aprovado |
| `execution` | Durante Execution Mode |

**Fluxo pós-compactação:**
```
Compactação ocorre
  → CLAUDE.md + MEMORY.md recarregados automaticamente (~1.800 tokens fixos)
  → MEMORY.md revela modo e session ativa
  → CLAUDE.md rule dispara re-init: ler docs/.cortex/ (~160 tokens)
  → AI informa usuário e aguarda antes de escrever código
Total pós-compactação: ~160 tokens (vs ~490–1.040 de um boot completo)
```

**ROI:**
- Overhead fixo adicionado: ~185 tokens/sessão
- Custo de compactação sem mecanismo: ~490–1.040 tokens (boot completo)
- Break-even: 1 compactação a cada ~3–6 sessões

---

## Comparativo: Antes vs Depois (v1.2.0 → v1.2.3)

| Operação | v1.1.0 | v1.2.0 | v1.2.3 |
|---|---|---|---|
| Boot (cache hit) | ~1.500 tokens | ~490 tokens | ~490 tokens |
| Boot (cache miss) | ~3.000 tokens | ~1.040 tokens | ~1.040 tokens |
| GATE 3 por arquivo | ~150 tokens | ~30 tokens | ~30 tokens |
| Pós-compactação | ~1.500 tokens | ~1.040 tokens | **~160 tokens** |
| Overhead permanente | ~0 tokens | ~0 tokens | **+185 tokens** |

---

## Tabela de Decisão — Quando o Custo Vale?

| Situação | Custo estimado | Vale? |
|---|---|---|
| Sessão curta, sem compactação | +185 tokens overhead | Sim — segurança vale |
| Sessão longa com 1 compactação | Economia de ~880 tokens | Sim |
| Sessão com 3+ compactações | Economia de ~2.500+ tokens | Definitivamente |
| Projeto novo sem docs/ | N/A — precisa de `/engineer:discover` | N/A |

---

## Regras de Economia

1. **Nunca repetir contexto já carregado** — se boot rodou, Strategy/Execution fazem skip de fingerprint
2. **Cache condicional** — CORTEX_INDEX/CONTEXT só regeneram quando fingerprint detecta mudança
3. **GATE 3 incremental** — ~80% dos arquivos resolvem via INDEX sem reler `adrs-summary.md`
4. **MEMORY.md compacto** — estado em 1 linha, sem verbosidade desnecessária
5. **Manifesto com skip** — sessions manifest só faz rescan quando lista de slugs muda

---

## Referências

- `context-window-strategy.md` — estratégia de janelas (Strategy vs Execution)
- `cortex-boot.md` — implementação do boot e dos passos de cache
- `CHANGELOG.md` — histórico de otimizações por versão
