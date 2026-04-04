---
name: synapos-copilot-adapter
version: 1.0.0
description: Mapeamento de capacidades Synapos → GitHub Copilot — como executar os protocolos existentes no contexto IDE-native
---

# SYNAPOS COPILOT ADAPTER v1.0.0

> Este arquivo define como cada mecanismo do Synapos é executado no GitHub Copilot.
> O Copilot não tem controle de fluxo real, memória persistente estruturada nem execução de pipeline automática.
> Este adapter resolve isso usando markdown como engine, comentários como comandos e arquivos como estado.

---

## PRINCÍPIO GERAL

O Copilot lê:
- `.github/copilot-instructions.md` — automaticamente em todo chat
- Arquivos abertos no editor — contexto implícito
- Arquivos referenciados com `@` no chat — contexto explícito

Use isso a favor: os arquivos de session, memória e squad.yaml são a "memória" do Copilot.

---

## MAPEAMENTO DE CAPACIDADES

### `AskUserQuestion` → Lista Numerada

**Synapos padrão:**
```
AskUserQuestion({
  question: "Qual modo de operação?",
  options: [
    { label: "⚡ Alta Performance" },
    { label: "💰 Econômico" },
    { label: "🧑‍💻 Solo" }
  ]
})
```

**Copilot Mode:**
```
Qual modo de operação?

1) ⚡ Alta Performance — Squad completo, docs máxima
2) 💰 Econômico — Execução rápida, menos checkpoints
3) 🧑‍💻 Solo — Sem checkpoints, execução direta

(Digite o número da opção)
```

**Regra:** Sempre aguarde uma resposta clara antes de prosseguir. Se a resposta for ambígua, peça confirmação.

---

### `execution: subagent` → Execução Inline

**Synapos padrão:** Lança um subagente separado com persona + contexto + instruções do step.

**Copilot Mode:**
1. Declare explicitamente qual agent está "falando": `[Agent: {displayName} — {role}]`
2. Leia o `.agent.md` correspondente para carregar a persona
3. Injete o contexto disponível (company.md + session files + memories.md)
4. Execute as instruções do step inline na conversa
5. Apresente o output com o cabeçalho do agent

**Exemplo de output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 [Agent: Designer React — Especialista em componentes UI]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[output do agent aqui]
```

---

### `execution: checkpoint` → Checklist com Confirmação

**Synapos padrão:** Pausa interativa com botões clicáveis.

**Copilot Mode:**
```
⏸ CHECKPOINT: {nome do step}

{contexto ou pergunta}

Checklist antes de continuar:
  [ ] {critério 1}
  [ ] {critério 2}
  [ ] {critério 3}

Digite "ok" para continuar, "ajustar" para modificar o contexto ou "pular" para avançar.
```

> **Modo Solo:** Checkpoints sem `gate:` são pulados automaticamente.
> Log: `⚡ [SOLO] {nome do step} — checkpoint ignorado`

---

### Gates → Checklist de Validação no Output

Em vez de gates que bloqueiam automaticamente o fluxo, o Copilot apresenta o gate como checklist ao final do output relevante.

**Formato padrão:**
```
---
## Verificação GATE-{N} — {nome do gate}

✅ {item validado com sucesso}
✅ {item validado com sucesso}
⚠️  {item com aviso — explicação}
🚫 {item com falha — o que fazer}

[GATE-{N}]: {APROVADO | APROVADO COM AVISOS | FALHA}
```

**Se falha:** liste os itens pendentes e pergunte como proceder antes de continuar.

**Gates por modo (conforme gate-system.md):**

| Gate | BOOTSTRAP | STANDARD | STRICT |
|---|---|---|---|
| GATE-0 | ✅ (aviso) | ✅ | ✅ |
| GATE-1 | ✅ | ✅ | ✅ |
| GATE-DECISION | ✅ | ✅ | ✅ |
| GATE-ADR | ❌ | ✅ | ✅ |
| GATE-2, 3, 5 | ❌ | ✅ | ✅ |
| GATE-4, GATE-DESIGN | ❌ | ❌ | ✅ |

---

### Sistema de Comandos via Comentário

O usuário pode ativar comportamentos sem digitar no chat, usando comentários no código.

**Sintaxe:**
```
// synapos:{comando} {param}:{valor} {param}:{valor}
```

**Parsing pelo Copilot:**
1. Detecte qualquer linha com `synapos:` no início (comentário ou mensagem no chat)
2. Extraia o comando e os parâmetros chave:valor
3. Execute o protocolo correspondente em `.synapos/copilot.md`

**Comandos suportados:**

```
// synapos:init
```
→ Execute o protocolo de ativação completo (`.synapos/copilot.md` PASSO 1–8)

```
// synapos:squad squad:frontend mode:bootstrap pipeline:bug-fix feature:fix-login
```
→ Crie e ative squad diretamente (pula para PASSO 6 do copilot.md)

```
// synapos:step step:02-design-api
```
→ Execute o step especificado do pipeline ativo

```
// synapos:gate gate:GATE-2
```
→ Execute a validação do gate especificado

```
// synapos:status
```
→ Exiba estado atual do squad e session

```
// synapos:decision id:1 choice:A
```
→ Resolva uma DECISÃO PENDENTE registrada em open-decisions.md

```
// synapos:memory
```
→ Exiba o conteúdo de `docs/.squads/sessions/{feature-slug}/memories.md`

---

### Prompt Anchors — Contexto Prioritário

Para que o Copilot priorize contexto crítico do projeto, use este padrão no topo de arquivos importantes:

```html
<!-- SYNAPOS: CONTEXT START -->
Projeto: {nome do projeto}
Stack: {tecnologias principais}
Regras críticas:
- {regra 1 — ex: nunca quebrar autenticação}
- {regra 2}
<!-- SYNAPOS: CONTEXT END -->
```

O Copilot lê arquivos abertos no editor e usa este bloco como contexto prioritário.
Útil para: `README.md`, `docs/_memory/company.md`, arquivos de configuração principal.

---

### State Management — Arquivos como Estado

O Copilot não mantém estado entre sessões. Os arquivos abaixo são a fonte de verdade:

| Arquivo | Propósito | Quando ler |
|---------|-----------|------------|
| `docs/_memory/company.md` | Perfil do projeto | Todo `synapos:init` |
| `docs/_memory/preferences.md` | Preferências (modelo, IDE, tracker) | Início de cada sessão |
| `.synapos/squads/{slug}/squad.yaml` | Configuração do squad ativo | Todo `synapos:step` |
| `docs/.squads/sessions/{slug}/state.json` | Estado da feature | Verificação de progresso |
| `docs/.squads/sessions/{slug}/memories.md` | Aprendizados acumulados | Início de cada execução |
| `docs/.squads/sessions/{slug}/context.md` | Contexto da feature | Steps de implementação |

**Instrução ao Copilot para cada step:**
Antes de executar, leia os arquivos listados acima usando `@workspace` ou referenciando-os explicitamente no chat.

---

### MODEL-ADAPTER no Copilot

O `model_capability` em `preferences.md` também se aplica no Copilot Mode.

| `model_capability` | Comportamento |
|---|---|
| `high` | Execução padrão — contexto completo |
| `standard` | Injete o CoT Prefix antes de cada step (S1 do model-adapter.md) |
| `lite` | Ative todos os mecanismos L1–L6 do model-adapter.md |

Para GPT-4o (Copilot padrão): assuma `high`.

---

## FLUXO TÍPICO NO COPILOT

```
1. Usuário abre projeto no VS Code / GitHub Copilot Chat
2. Copilot carrega .github/copilot-instructions.md automaticamente
3. Usuário digita: synapos:init
4. Copilot executa .synapos/copilot.md — PASSO 1
   → Verifica docs/_memory/company.md
   → Calcula DOC_SCORE
   → Determina EXECUTION_MODE
5. Usuário seleciona squad ou cria novo
6. Squad é criado em .synapos/squads/{slug}/
7. Pipeline inicia step-by-step
   → Cada step: lê .agent.md + contexto + instrução
   → Executa inline
   → Aplica gates via checklist
   → Salva output em docs/.squads/sessions/{feature}/
8. Ao final: atualiza memories.md + state.json
```

---

## LIMITAÇÕES E COMPENSAÇÕES

| Limitação do Copilot | Compensação Synapos |
|----------------------|---------------------|
| Sem memória persistente entre sessões | `state.json` + `memories.md` como estado externo |
| Sem execução de pipeline automática | Step-by-step via comandos `synapos:step` |
| Sem subagentes reais | Personas inline via `.agent.md` + prefixo de agent |
| Sem botões interativos | Listas numeradas com input explícito |
| Sem controle de fluxo | Markdown como engine + comentários como comandos |
| Sem tool calls | Skills simuladas via instruções inline no step |

---

## REGRAS DO ADAPTER

| Regra | Descrição |
|-------|-----------|
| **Arquivo aberto = contexto** | Incentive o usuário a abrir os arquivos relevantes no editor |
| **@workspace para busca** | Use `@workspace` para encontrar arquivos quando necessário |
| **Um step por vez** | Nunca execute múltiplos steps simultaneamente |
| **Gate como checklist** | Todo gate deve ser visível ao usuário como checklist |
| **DECISÃO PENDENTE é obrigatória** | Qualquer decisão fora do escopo = `[DECISÃO PENDENTE]` |
| **Nunca assuma modo** | Se o modo não estiver claro, pergunte antes de executar |
| **Instrua a abrir arquivos** | Se o contexto necessário não estiver carregado, peça ao usuário para abrir o arquivo |
