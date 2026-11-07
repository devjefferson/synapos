# Synapos — Plano de Refatoração

> Objetivo: reduzir complexidade, assumir o que o sistema realmente é, e entregar valor mais rápido.
>
> Premissa central: Synapos não é um framework de orquestração. É um **workflow system para trabalhar com IA em projetos reais**. Isso precisa ser assumido, não escondido.

---

## Decisões Fixas (não revisitar)

| Decisão | Direção |
|---------|---------|
| O que Synapos é | Workflow system — estrutura o ambiente para a IA trabalhar |
| Multi-agent | Assumir abertamente que é simulação sequencial — não esconder |
| state.json | Best-effort, nunca bloqueante, nunca crítico |
| Sessions | Core do produto — o diferencial real |
| Qualidade de output | Veto conditions simples por step — sem gate universal |
| Modos de execução | 2 modos apenas: **Rápido** e **Completo** |

---

## Semana 1 — Remover Complexidade Desnecessária

**Foco:** cortar o que não funciona na prática, sem substituir ainda.

### gate-system.md

- [ ] Remover **GATE-DECISION** completamente
  - Substituto: instrução simples no step — "se precisar decidir algo fora do escopo, sinalize como `[?]` no output"
  - Sem gate, sem reexecução automática, sem bloqueio
- [ ] Reduzir de 9 gates para 3:
  - **GATE-0** — arquivos obrigatórios do framework existem? (mantém)
  - **GATE-3** — output não está vazio e não é placeholder? (mantém, simplificado)
  - **GATE-5** — entrega visual apenas, nunca bloqueia (mantém)
  - Remover: GATE-1, GATE-2, GATE-4, GATE-ADR, GATE-DESIGN
- [ ] Remover tabela de gates por execution_mode — com 3 gates, não precisa

### orchestrator.md

- [ ] Remover **Mode Decision System** com score (seção 2.1 a 2.5)
- [ ] Substituir por escolha direta:
  ```
  Modo de execução:
  - ⚡ Rápido   → sem contexto de projeto, executa direto
  - 🔵 Completo → lê docs/, injeta ADRs, gates completos
  ```
- [ ] Remover referência a `[DOC_SCORE]`, `[COMPLEXITY]`, `[EXECUTION_MODE]`
- [ ] Simplificar PASSO 2 para máximo 10 linhas

### pipeline-runner.md

- [ ] Remover seção 1.1b (Budget estimation) — útil mas gera overhead desnecessário agora
- [ ] Remover lógica de "escrita atômica" do state.json — substituir por: "escreva o estado, se falhar logue e continue"
- [ ] Remover limite de 3 backups com lógica de rotação — simplifica para: cria backup, não gerencia rotação

**Entregável:** sistema funcionando com menos fricção. Nada quebra para o usuário.

---

## Semana 2 — Reescrever o /init

**Foco:** reduzir 10 interações para 3 antes do primeiro valor.

### Novo fluxo do orchestrator

```
PASSO 1 — contexto existe?
  Sim → carrega e vai para menu
  Não → pergunta 1: "Nome do projeto e o que você quer fazer?"

PASSO 2 — modo
  Pergunta 2: "⚡ Rápido (executa direto) ou 🔵 Completo (lê toda a documentação)?"

PASSO 3 — menu de squads / criar squad
  → Se sem templates: mostra como instalar
  → Se com templates: lista squads ativos + "✨ Novo squad"
```

### Naming — Squad → Role

- [ ] Renomear internamente "squad" para "role" onde fizer sentido ao usuário
  - squad.yaml mantém o nome (compatibilidade)
  - Na UI (AskUserQuestion): "Qual role você quer ativar?" em vez de "Qual squad?"
  - Motivo: "squad" implica multi-agent real — "role" é honesto sobre o que é

### Onboarding

- [ ] Máximo 2 AskUserQuestion antes de executar qualquer coisa
- [ ] Se o usuário já tem squads criados: menu direto sem perguntas de onboarding

**Entregável:** usuário novo executando primeira tarefa em < 3 perguntas.

---

## Semana 3 — Simplificar o Pipeline Runner

**Foco:** tornar o runner confiável para o que realmente importa.

### state.json — virar best-effort

- [ ] Remover bloqueios baseados em state.json
- [ ] state.json passa a ser log de execução, não fonte de verdade
- [ ] Se corrompido: loga aviso, reinicia estado, nunca bloqueia
- [ ] Remover protocolo de recuperação parcial (linhas 282–315 do pipeline-runner.md) — simplifica para: "se inválido, recria"

### Contexto de injeção — simplificar

- [ ] Reduzir a ordem de composição de 10 itens para 5:
  ```
  [Agent Persona] + [Contexto do Squad] + [Session Files] + [Instrução do Step] + [Skills Ativas]
  ```
  - ADRs: injetados apenas se modo Completo ativo e ADRs existem
  - project-learnings.md: injetado apenas se modo Completo
  - review-notes.md: injetado apenas se step é de revisão

### Consolidação de memories

- [ ] Remover consolidação automática por limite de 30 entradas
- [ ] Substituir por: usuário executa `/consolidate` manualmente quando quiser
- [ ] memories.md continua append-only — só muda quem decide consolidar

**Entregável:** runner sem estados inconsistentes, contexto mais enxuto por step.

---

## Semana 4 — Polir as Sessions (core do produto)

**Foco:** fazer o diferencial real brilhar.

As sessions são o único componente com valor defensável e que resolve um problema real: **contexto persistente de feature que sobrevive entre conversas**. Essa semana é sobre tornar isso visível e fácil.

### Melhorias em sessions

- [ ] Criar template padronizado para `context.md`:
  ```markdown
  # Contexto: {feature-slug}
  ## O que é
  ## Por que existe
  ## Decisões tomadas
  ## O que não fazer
  ```
- [ ] Criar template padronizado para `memories.md`:
  ```markdown
  # Memória: {feature-slug}
  ## Aprendizados
  ## Armadilhas conhecidas
  ## Próximos passos sugeridos
  ```
- [ ] Garantir que qualquer squad que inicia em uma feature existente **lê o context.md primeiro**, sempre — sem exceção

### /session como comando de primeira classe

- [ ] Criar skill/comando `/session` que:
  - Lista sessions ativas
  - Mostra resumo de cada uma (feature, squads que trabalharam, última atualização)
  - Permite "retomar" diretamente sem passar pelo /init completo

**Entregável:** sessions fáceis de visualizar, retomar e compartilhar entre squads.

---

## Semana 5 — Reposicionamento

**Foco:** alinhar o que o sistema diz que é com o que realmente entrega.

### README

- [ ] Remover: "framework de orquestração", "multi-agent", "squads paralelos"
- [ ] Adicionar: posicionamento honesto

```markdown
## O que é o Synapos

Synapos é um workflow system para projetos com IA.

Ele organiza como você trabalha com LLMs em projetos reais:
- mantém contexto de features entre conversas
- estrutura docs do projeto para a IA usar
- define roles simulados para tarefas diferentes
- persiste aprendizados ao longo do projeto

Não é multi-agent real. Não garante execução determinística.
É tão bom quanto o modelo que o executa — e organiza o ambiente
para que esse modelo trabalhe melhor.
```

### Nomenclatura interna

| Antes | Depois |
|-------|--------|
| "framework de orquestração" | "workflow system" |
| "squad multi-agent" | "role simulado" |
| "Alta Performance" | "Multi-role" |
| "Strict Mode" | "Modo Completo" |
| "Bootstrap Mode" | "Modo Rápido" |
| "execution_mode: strict" | `mode: complete` |

### Remoções finais

- [ ] Remover protocolo de `/bump` com semver interno — arquivos md não precisam de versioning semver
- [ ] Remover campo `version:` do frontmatter dos arquivos core (ou deixar apenas como referência humana, sem protocolo)
- [ ] Remover `.synapos/CHANGELOG.md` automático — changelog do projeto é o git

**Entregável:** README que não mente, onboarding que não frustra.

---

## Semana 6 — Validação com Usuários Reais

**Foco:** descobrir o que funciona fora da sua cabeça.

### Meta: 5 devs testando

Perfil ideal:
- Dev que usa Claude Code no dia a dia
- Projeto real em andamento (não projeto de brinquedo)
- Não conhece o Synapos ainda

### O que observar

- Onde trava no /init?
- Qual o primeiro ponto de frustração?
- Sessions são claras ou confusas?
- O output dos roles é útil ou genérico?

### Critério de sucesso da semana

```
Pelo menos 3 dos 5 devs chegaram no segundo uso sem ajuda.
```

Se não chegar nisso: identificar o ponto de quebra e voltar para Semana 2 ou 4.

---

## O que NÃO entra neste plano (deliberadamente)

| Item | Motivo |
|------|--------|
| CLI em Node para state.json | Esforço alto, valida depois de ter usuários |
| Templates específicos por tech stack | Escopo grande — v2 do produto |
| Paralelismo real entre agents | Requer infraestrutura diferente — fora do escopo |
| Sistema de testes automatizados | Não dá para testar LLM com unit tests clássicos |
| Monetização | Valida produto antes |

---

## Resumo por semana

| Semana | Foco | Arquivos tocados |
|--------|------|-----------------|
| 1 | Remover complexidade | `gate-system.md`, `orchestrator.md`, `pipeline-runner.md` |
| 2 | Reescrever /init | `orchestrator.md` |
| 3 | Simplificar runner | `pipeline-runner.md` |
| 4 | Polir sessions | templates, `pipeline-runner.md`, nova skill `/session` |
| 5 | Reposicionamento | `README.md`, nomenclatura interna |
| 6 | Validação | 5 usuários reais |
