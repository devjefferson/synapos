---
name: synapos-pipeline-runner
version: 3.0.0
description: Runner de pipelines — lê o squad.yaml, executa steps em ordem, aplica 1 gate real no final
---

# SYNAPOS PIPELINE RUNNER v3.0.0

> Chamado pelo orchestrator depois que a session foi criada ou carregada.
> Executa o pipeline definido no `squad.yaml` do role ativo.

---

## ENTRADA

Recebe do orchestrator:

- `[FEATURE_SLUG]` — slug da feature
- `[ROLE]` — domínio do template (backend, frontend, etc.)
- `[USER_INTENT]` — mensagem original do usuário
- `[SESSION_DIR]` — `docs/.squads/sessions/{feature-slug}/`
- `[SQUAD_DIR]` — `.synapos/squads/{feature-slug}/`
- `[STACK]` — conteúdo de `docs/_memory/stack.md`

---

## 1. CARREGAR CONTEXTO

Leia os seguintes arquivos (sem cache, sem manifest):

```
[SQUAD_DIR]/squad.yaml       → pipeline a executar
[SQUAD_DIR]/persona.md       → persona do role (se existe)
[SESSION_DIR]/context.md     → contexto da feature
[SESSION_DIR]/memories.md    → aprendizados acumulados
docs/_memory/company.md      → contexto do projeto
docs/_memory/stack.md        → stack
```

**Se algum arquivo essencial do squad não existir**: pare com mensagem clara. Ex:

```
❌ Arquivo ausente: .synapos/squads/{feature-slug}/squad.yaml
   Execute /init para recriar a session.
```

`context.md` e `memories.md` podem estar praticamente vazios (criados pelo orchestrator). Tudo bem — o pipeline os preenche.

---

## 2. ANUNCIAR INÍCIO

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature: {feature-slug}
Role:    {role}
Session: docs/.squads/sessions/{feature-slug}/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 3. EXECUTAR STEPS

O pipeline está inline no `squad.yaml` (campo `pipeline:`). Cada step tem:

```yaml
pipeline:
  - id: investigar
    name: "Investigar"
    instruction: |
      (prompt do step)
    output: context.md          # opcional
    gate: null                  # opcional: null | verify
```

### Para cada step, em ordem:

#### 3.1 — Anuncie

```
▶ [{N}/{total}] {step.name}
```

#### 3.2 — Monte o prompt

Concatene na ordem:

1. **Persona**: conteúdo de `[SQUAD_DIR]/persona.md` (se existe)
2. **Contexto do projeto**: `company.md` + `stack.md`
3. **Contexto da feature**: `context.md` + `memories.md`
4. **Intenção do usuário**: `[USER_INTENT]`
5. **Outputs dos steps anteriores** desta execução (na memória da conversa)
6. **Instrução do step**: `step.instruction`

#### 3.3 — Execute o step

Execute as instruções do step **inline na conversa** (sem subagent). Use as ferramentas disponíveis (Read/Write/Edit/Bash/Grep/Glob) conforme necessário.

Durante a execução:

- **Se o step tem `output:`** → salve o resultado em `[SESSION_DIR]/{output}`.
  - Antes de sobrescrever arquivo existente com conteúdo substancialmente diferente: crie backup `.bak`.
- **Se o step tem `gate: verify`** → após execução, aplique GATE-VERIFY (seção 4).
- **Se o agent precisar decidir algo fora do escopo** → sinalize `[?] decisão: {descrição}` no output. O runner detecta, pergunta ao usuário via `AskUserQuestion`, aplica a decisão e continua. Nunca decida autonomamente.

#### 3.4 — Marque concluído

Atualize `[SESSION_DIR]/state.json`:

```json
{
  "feature": "{feature-slug}",
  "updated_at": "{ISO datetime}",
  "pipeline_runs": [
    {
      "role": "{role}",
      "started_at": "{ISO datetime}",
      "completed_at": null,
      "current_step": "{step.id}",
      "completed_steps": [...]
    }
  ]
}
```

Ao completar o último step: `completed_at` preenchido, `current_step: null`.

Log: `✅ {step.name}`

---

## 4. GATE-VERIFY (único gate real)

Aplicado no último step do pipeline (tipicamente `verificar`).

### 4.1 — Ler comandos

Leia `docs/_memory/stack.md` e extraia os comandos da seção `## Comandos`:

- `Test: {comando}`
- `Lint: {comando}`
- `Build: {comando}`

### 4.2 — Executar

Para cada comando preenchido (não `-`, não vazio):

```bash
{comando}
```

via Bash tool.

### 4.3 — Avaliar

- **Todos passaram** → `✅ GATE-VERIFY aprovado` → pipeline completo.
- **Algum falhou**:
  1. Mostre a saída do comando falho.
  2. Tente corrigir **uma vez** (re-execute o step anterior com feedback de erro).
  3. Rode de novo.
  4. **Se falhar de novo** → pare e escale:
     ```
     🚫 GATE-VERIFY falhou após 1 tentativa de correção.

     Comando: {comando}
     Erro: {resumo do stderr}

     Session preservada em: docs/.squads/sessions/{feature-slug}/
     Você pode corrigir manualmente e rodar novamente.
     ```

### 4.4 — Se `stack.md` não tem comandos

```
⚠️ GATE-VERIFY sem comandos configurados em docs/_memory/stack.md
   Pipeline concluído sem verificação automática.
   Edite stack.md para habilitar verify em próximas execuções.
```

Não bloqueia. Apenas avisa.

---

## 5. FINALIZAR

### 5.1 — Capturar aprendizado

Ao final, pergunte (UMA vez):

```
AskUserQuestion({
  question: "Registrar algo em memories.md desta feature?",
  options: [
    { label: "⏭️ Pular", description: "Não registrar nada" },
    { label: "✍️ Sim", description: "Vou escrever um aprendizado" }
  ]
})
```

Se "Sim": peça o texto livre e acrescente **no topo** de `memories.md`:

```markdown
## {YYYY-MM-DD} — {role}

{texto do usuário}

---
```

### 5.2 — Sumário final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pipeline concluído
   Feature: {feature-slug}
   Session: docs/.squads/sessions/{feature-slug}/
   Arquivos modificados: {lista}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## REGRAS

| Regra | Como aplicar |
|---|---|
| **Ordem é sagrada** | Execute steps na ordem do yaml. Sem pular. |
| **Um gate real** | GATE-VERIFY no último step. Sem outros gates. |
| **Decisões pendem com `[?]`** | Agent nunca decide fora do escopo. Sinaliza, runner pergunta. |
| **Session compartilhada** | Múltiplos roles podem abrir a mesma feature. context.md e memories.md são compartilhados. |
| **Append-only em memories** | Nunca remova entradas. Novas entradas no topo. |
| **Fail loud** | Arquivo faltando, comando retornando 1 — pare e informe. |
| **Sem manifest, sem snapshot, sem hash** | Leia os arquivos direto. Contexto mínimo: persona + company + stack + context + memories + intent + instrução. |
| **Backup simples** | `.bak` antes de sobrescrever output existente. Sem rotação. |
| **Skills são opcionais** | Se o SKILL.md existe em `.synapos/skills/{nome}/`, agent pode usar. Não é obrigatório. |

---

## INSTRUÇÃO DE CAMINHOS PARA O STEP

Antes de executar qualquer step, injete como prefixo do prompt do agent:

```
CAMINHOS:
- Leitura+escrita (session desta feature): docs/.squads/sessions/{feature-slug}/
- Leitura (projeto): qualquer lugar
- Escrita (projeto): código onde fizer sentido — você tem liberdade
- Nunca escreva em: .synapos/** (framework) nem em docs/_memory/** (perfil)
```

---

## PIPELINE PADRÃO (referência)

Todo template tem um pipeline de 3 steps neste formato:

```yaml
pipeline:
  - id: investigar
    name: "Investigar"
    instruction: |
      Leia context.md e memories.md.
      Se estiverem vazios ou o usuário pediu algo novo: entenda a intenção,
      faça no máximo 3 perguntas críticas se houver ambiguidade irresolúvel
      (apenas uma rodada de perguntas), e então preencha context.md com:
      O que é, Por que, Decisões, Não fazer.
      Se context.md já tem o essencial: apenas confirme entendimento, não reescreva.
    output: context.md

  - id: executar
    name: "Executar"
    instruction: |
      Implemente o que foi decidido. Edite código diretamente.
      Inclua testes quando fizer sentido.
      Use [?] se precisar decidir algo fora do escopo definido em context.md.

  - id: verificar
    name: "Verificar"
    instruction: |
      Rode os comandos de verify do stack.md.
      Se falhar, tente corrigir uma vez.
      Ao final, resuma o que foi feito em 3 bullets.
    gate: verify
```
