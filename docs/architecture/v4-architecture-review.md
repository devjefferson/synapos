# Synapos v4 — Architecture Review

> Auditoria da v3.5.0 e desenho da v4.0.0.
> Especificações executáveis: `.synapos/core/`. Este documento explica **por quê**.

---

## 1. Diagnóstico da v3.5

A auditoria leu orchestrator, pipeline-runner, gates, compliance, skills, ADR, session, os 7 squads e os comandos de setup. Os problemas se agrupam em cinco causas-raiz.

### 1.1 Bugs estruturais (o sistema não fazia o que dizia)

| # | Problema | Evidência (v3.5) | Efeito |
|---|---|---|---|
| B1 | Pré-execução nunca rodava em session nova | runner §1.4 cria `context.md` (template) ao inicializar a session; §1.4b pula a pré-execução "se `context.md` já existe" | investigação, arquitetura e plano pulados em toda feature nova |
| B2 | Reescrita de caminhos quebrava leituras | runner §2.3: "substitua **todas** as ocorrências de `docs/` por `docs/.squads/sessions/{slug}/`" | `docs/tech-context/briefing/critical-rules.md`, ADRs e `docs/business/` citados nos steps apontavam para a session (inexistentes) |
| B3 | Caminho relativo quebrado | `frontend/feature-development.yaml` → `../../../core/shared-steps/update-task.md` (os demais usam `../../core`) | step `update-task` do FE não resolvia |
| B4 | Agent inexistente | `produto/discovery-spec-handoff.yaml` usa `ursula-ui` (o squad tem `ursula-ux`) | step de visual-spec sem role |
| B5 | Gates referenciados e não definidos | GATE-2, GATE-4 (produto), GATE-DESIGN, GATE-ADR usados; gate-system define só 0, 3a, 3, 3b, 5 | gates sem comportamento — "regra no papel" |
| B6 | `/setup:discover` sobrescrevia `CLAUDE.md` | discover §6.8: "Criar ou sobrescrever" | apagava instruções do usuário |

B3–B5 agora são detectados por `npm test` (`tests/validate-framework.js`), que falha na v3.5 com 14 erros.

### 1.2 Regras contraditórias

| Conflito | Onde |
|---|---|
| GATE-DECISION existe (runner §2.5: reexecuta) × "não existe mais" (gate-system) | runner × gate-system × REFACTOR-PLAN |
| `[?]` × `[DECISÃO PENDENTE]` como sinal de decisão | AGENTS.md/gate-system × compliance/agents |
| GATE-0 "bloqueante" sem docs (5 squads) × "Modo Rápido prossegue sem docs" | steps `01-gate-integridade` × gate-system |
| 3 esquemas de `context.md` | runner (O que é/Por que existe) × investigação (Motivação/Meta…) × gate FE (escreve O que é) |
| 5 localizações de ADR, 2 vocabulários de status | adr-standard (`docs/adrs/`, accepted) × discover (4 pastas, "Aceito/Ativo") × runner (frontmatter em `docs/`) |
| ADR é "lei" × ADRs desligadas no modo rápido e no tier lite | compliance/agents × runner §1.1d × model-adapter |
| `plan.md` estático × steps que marcam fases no `plan.md` | runner × `09-execucao` |
| 3 sistemas de modo | quick/complete (runner) × alta/economico/solo (templates) × BOOTSTRAP/STANDARD/STRICT (copilot-adapter) |

### 1.3 O framework induzia invenção

| Onde | O que pedia | Resultado provável |
|---|---|---|
| FE `02-arquitetura` | árvore de pastas pronta (`components/`, `hooks/`, `types/`, `use{Feature}Query.ts`) | estrutura genérica em vez da do projeto |
| FE `04-implementacao` | "estrutura padrão" com `<Skeleton/>`, `<ErrorMessage/>`, `<EmptyState/>`, `useQuery` | componentes e libs inexistentes no projeto |
| `ana-arquitetura-fe` regra 3 | "server → React Query, global → Zustand" | lib escolhida pela role, não pelo projeto |
| `visual-spec` / `cd-02-spec` | "token ex: `--color-primary-500`", "ratio ex: 4.8:1", `#{hex}` | tokens e contrastes inventados |
| Produto `02-contexto-negocio` | veto "menos de 3 concorrentes", "sem benchmarks" | concorrentes/números fabricados |
| Produto `03-personas` | veto "sem citação de usuário real" | citações fabricadas |
| `06-requisitos`, `nf-04-spec` | RNF pré-preenchido ("< 200ms p99", "99% uptime"); veto "RNF sem número" | métricas inventadas |
| `05-arquitetura` (engineer) | "ADRs Aplicadas com **pelo menos 1** entrada" | ADR citada à força quando não há nenhuma |
| `bf-02-diagnostico` | "Usuários afetados: {estimativa}" | número inventado |

Nenhum desses é resolvido com "não invente" no prompt: o próprio template pedia o valor. A correção é remover o pedido e trocar por evidência (caminho de arquivo) ou `[A DEFINIR]`.

### 1.4 Contexto: excessivo onde não precisa, ausente onde precisa

- **Excesso:** `pipeline-runner.md` tinha 71 KB (~18k tokens) lidos a cada execução; ~40% descrevia mecânicas que a IA não executa de forma confiável (hash `tamanho-mtime` para invalidar cache, `context.snapshot`, rename atômico de `state.tmp.json`, acumulação de `[SESSION_REPORT_DATA]`) ou duplicava gate-system/change-guard.
- **Excesso:** modo completo carregava `project-learnings.md` inteiro e todas as ADRs do domínio em todo step.
- **Falta:** nenhum mecanismo capturava os padrões de UI do projeto. `/setup:discover` mapeava backend e "Lovable", nunca containers, spacing, estados ou composição de página.
- **Falta:** memória recuperada por recência (últimas 5 entradas de `memories.md`), não por relevância. Sem tipos, sem escopo, sem invalidação.
- **Falta:** `best-practices/_catalog.yaml` (11 guias com `whenToUse`) nunca era referenciado pelo runner.

### 1.5 Skills e processo

- Skills injetadas **só** em steps `subagent`, e "todas as skills ativas" — nunca descobertas nem filtradas. Skills do projeto (`skills/*.md`, `.claude/skills/`) invisíveis.
- Toda tarefa passava pelo mesmo processo: `/init` → modo → domínio (lista de 9) → squad → session → gate (que perguntava a tarefa de novo) → contexto → executar → registrar → 2 perguntas de memória → report → commit. Trocar o texto de um botão custava ~8 interações.
- Produto: 11 steps e 15+ documentos no discovery; nenhum brainstorm; requisitos sem separação de regra de negócio; 3 documentos de handoff; o Tech Writer produzindo ADRs e arquitetura (sobreposição com engenharia).

---

## 2. Princípios da v4

1. **Arquitetura antes de instrução.** Cada problema foi resolvido primeiro por estrutura (artefato, índice, ordem do workflow, campo declarativo), só depois por texto.
2. **Contexto mínimo suficiente.** Nada entra no prompt sem um "por quê". O Context Brief torna isso auditável.
3. **Aprender uma vez, recuperar sempre.** Discovery persiste conhecimento; execuções seguintes recuperam por relevância e validam no ponto de uso.
4. **Observe antes de criar.** Escada de reuso comum a todas as roles; "novo" exige justificativa com evidência.
5. **Uma regra que pode ser ignorada não é regra.** ADR vale em todo track; gates só existem se verificam algo concreto.
6. **Profundidade proporcional à tarefa.** Triagem define o track; o mesmo ciclo serve do botão ao módulo novo.

---

## 3. Nova arquitetura

```
                              SYNAPOS
                                 │
                   ┌──── TRIAGEM (orchestrator 2.5) ────┐
                   │             │                      │
                 quick        standard               complex
                   │             │                      │
              FAST LANE      SQUAD do domínio      SQUAD Produto ──► handoff.md
          role+skills+exec   ┌───────────────┐    brainstorm → requisitos
          +self-review       │ pré-execução  │    → spec → handoff
                             │ investigação  │◄──────────┘ (mesma session)
                             │ padrões ──────┼──► roles/{domain}.md
                             │ arquitetura   │
                             │ (plano: cplx) │
                             └──────┬────────┘
                              implementação → review → memória
                                    │
      ┌─────────────────────────────┼──────────────────────────────┐
  compliance-protocol          context-engine                skills-engine
  ordem de autoridade          memória em camadas            descoberta → match
  sinais de controle           Context Brief                 → carga seletiva
  ADR CHECK · HANDOFF          escrita · invalidação         → conflito
```

### O que mudou por componente

| Componente | v3.5 | v4 |
|---|---|---|
| orchestrator | modo quick/complete por palavra-chave | triagem quick/standard/complex por sinais (escopo, clareza, decisão); fast lane; boot carrega só mapas de memória |
| pipeline-runner | 1592 linhas; contexto por modo; skills só em subagent | 425 linhas; `tracks:` e `skip_condition` declarativos; montagem de contexto idêntica inline/subagent com Context Brief; caminhos literais; tabela de handoff entre roles |
| memória | `memories.md` por recência; `project-learnings.md` inteiro | 4 camadas (global, role, session, task), entradas tipadas, recuperação por relevância, invalidação no ponto de uso — `context-engine.md` |
| role memory | inexistente | `docs/_memory/roles/{domain}.md`, gerado pelo step `pattern-discovery` e reaproveitado entre sessions |
| skills | lista no squad.yaml, injetadas em bloco | índice `skills-index.md` de 5 fontes (inclui `skills/*.md` e best-practices), match por step, conflito explícito |
| ADR | carregadas por domínio só no modo completo | índice `adr-index.md` (1 linha/ADR), consulta em todo track, `[ADR-CONFLICT]` bloqueante, atualização documental obrigatória |
| gates | 5 definidos, 4 fantasmas, 1 contraditório | GATE-ADR e GATE-HANDOFF reais; GATE-3 veta criação sem justificativa e afirmação sem evidência; aliases legados documentados |
| frontend | arquitetura com árvore genérica | descoberta de UI (14 itens) → âncora de padrão (7 perguntas) → arquitetura como variação da referência → implementação imitando a referência → validação visual/estrutural → review Camada 0 |
| produto | pesquisa → personas → spec → requisitos → arquitetura → 3 handoffs | brainstorm → requisitos tipados (RF/RN/RC/CA/RNF) → spec consolidada → handoff contratual consumido pela investigação do dev |

### O que foi preservado

Squads, roles e o conceito de "exército de um homem só"; sessions e `state.json`; retomada de execução; pipelines por domínio; HANDOFF entre steps; SCOPE GUARD; CHANGE GUARD (git diff em subagent); checkpoints solo/async; on_reject; session-report; commit opt-in; model-adapter; comandos e adaptadores de IDE; todos os agents e pipelines dos squads backend, devops, ia-dados, mobile e fullstack (que herdam discovery, memória, skills e ADR via core e pré-execução).

---

## 4. Trade-offs

| Decisão | Ganho | Custo / risco | Mitigação |
|---|---|---|---|
| Fast lane sem squad/session | tarefa trivial em 1 passo | trabalho trivial não fica no histórico da feature | reclassificação automática para standard ao surgir decisão; quick numa session ativa usa `quick-fix` |
| Remover manifest/snapshot | −1 mecanismo frágil, −tokens de protocolo | perde a economia de ~500 tokens do snapshot | `## Resumo` no topo do context.md faz o mesmo papel sem sincronização |
| Índices (ADR, skills) persistidos | consulta barata em todo step | índice pode ficar stale | `sources` + `scanned_at` + checagem via `git log` antes do uso |
| Role memory ≤150 linhas | mapa reutilizável entre sessions | pode não cobrir áreas novas | campo `coverage`: área nova dispara discovery só dela |
| Memória normativa exige confirmação | evita regra inventada | 1 pergunta ao fim do pipeline | agrupada numa única AskUserQuestion; fatos com evidência gravados automaticamente |
| Context Brief obrigatório | auditável, força o "por quê" | ~9 linhas por step | substitui leituras não justificadas, que custam muito mais |
| Remover 6 steps de produto | fluxo de 11 → 7 steps, sem fabricação | perde pesquisa de personas dedicada | pesquisa virou opcional (só com skill de busca); usuários explorados no brainstorm |
| `execution_mode` ganha `standard`/`complex` | profundidade adaptativa | squads antigos têm `complete` | `complete` = `standard` (compatível) |

Orchestrator cresceu (15 → 22 KB) por causa da triagem e da fast lane; o conjunto sempre-carregado caiu de 99 KB (4 arquivos) para 74 KB (6 arquivos, incluindo memória e skills que antes não existiam como protocolo).

---

## 5. Pergunta final

> "Estou melhorando a inteligência contextual do Synapos ou só adicionando Markdown?"

Contagem honesta:
- **Removido:** 1.167 linhas do runner, `session-manifest.md`, 6 steps de produto, 3 documentos de handoff por feature, 2 perguntas abertas de memória, reperguntas da tarefa em 7 gates.
- **Adicionado como estrutura** (não como instrução): índices `adr-index`/`skills-index`, role memory, campos `tracks`/`skip_condition`/`quick_role`/`needs_spec`, Context Brief, validador estático.
- **Adicionado como instrução:** `context-engine.md` (15 KB) e o step `pattern-discovery` (5 KB) — os dois pontos onde não havia protocolo nenhum para memória e descoberta.

Validação: `docs/architecture/validation-scenarios.md`.
