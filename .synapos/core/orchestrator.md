---
name: synapos-orchestrator
version: 3.0.0
description: Entrada do Synapos — detecta contexto, abre ou cria session, roda o pipeline
---

# SYNAPOS ORCHESTRATOR v3.0.0

> Execute este protocolo na ordem. Não pule passos.
>
> Filosofia: **menos cerimônia, mais contexto**. Um pipeline, três steps, um gate real.

---

## 1. DETECTAR CONTEXTO

Leia (ou crie se não existir):

```
docs/_memory/company.md      → perfil do projeto
docs/_memory/stack.md        → stack detectada
docs/_memory/preferences.md  → preferências (linguagem, model)
```

### Se `company.md` NÃO existe → onboarding inline (3 escritas, zero perguntas)

1. Detecte a linguagem/framework do projeto por arquivos-raiz:
   - `package.json` → Node/TS, verifique `dependencies` para detectar framework
   - `pyproject.toml` / `requirements.txt` → Python
   - `Cargo.toml` → Rust
   - `go.mod` → Go
   - `Gemfile` → Ruby
   - `composer.json` → PHP
   - `*.csproj` → .NET
   - `pubspec.yaml` → Flutter/Dart
   - Nenhum → deixe em branco

2. Infira o nome do projeto pelo nome do diretório raiz (use `basename` do `cwd`).

3. Crie os 3 arquivos com o mínimo:

`docs/_memory/company.md`:
```markdown
# {nome do projeto}

Atualize este arquivo com o contexto do produto, negócio, usuários.
Gerado automaticamente pelo Synapos em {YYYY-MM-DD}.
```

`docs/_memory/stack.md`:
```markdown
# Stack

**Linguagem:** {detectada | "-"}
**Framework:** {detectado | "-"}
**Package manager:** {detectado | "-"}
**Test:** {detectado | "-"}
**Lint:** {detectado | "-"}

## Comandos
- Install: `{comando}`
- Test: `{comando}`
- Lint: `{comando}`
- Build: `{comando}`

Edite livremente. O Synapos usa estes comandos no gate de verify.
```

`docs/_memory/preferences.md`:
```markdown
# Preferências

**Linguagem:** pt-BR
**Model:** claude-sonnet-4-6
```

Log: `✅ Onboarding completo. Edite docs/_memory/stack.md para preencher comandos de test/lint.`

Continue para o passo 2 sem perguntar.

### Se `company.md` existe → leia os 3 arquivos em memória e siga.

---

## 2. DETECTAR INTENÇÃO

Pegue a mensagem original do usuário (vem do `/init {mensagem}`).

### Caso A — Sem mensagem ou apenas `/init`

Liste sessions ativas em `docs/.squads/sessions/` (se existirem) e pergunte:

```
AskUserQuestion({
  question: "O que vamos fazer?",
  options: [
    { label: "▶️ {feature-slug}", description: "Retomar session ativa" },   // uma por session encontrada, até 5
    { label: "✨ Nova feature", description: "Criar session e começar" },
    { label: "📂 /session", description: "Navegar sessions existentes" }
  ]
})
```

Se "Nova feature" ou não há sessions: pergunte em texto livre o que fazer. Use a resposta como `[USER_INTENT]`.

### Caso B — Mensagem presente

Use a mensagem como `[USER_INTENT]`. Sem perguntar.

---

## 3. ESCOLHER ROLE

Infira do `[USER_INTENT]` o domínio do template:

| Palavras na intenção | Role |
|---|---|
| api, endpoint, banco, backend, server, auth, token | `backend` |
| componente, tela, UI, front, CSS, React, Vue | `frontend` |
| feature integrada, fullstack, full-stack | `fullstack` |
| app, mobile, iOS, Android, React Native, Flutter | `mobile` |
| deploy, CI, CD, Docker, k8s, infra | `devops` |
| spec, PRD, discovery, pesquisa, produto | `produto` |
| ML, modelo, pipeline de dados, ETL, LLM | `ia-dados` |
| bug, fix, ajuste, typo, quick — qualquer domínio ambíguo | `engineer` |

**Se ambíguo ou não há sinal** → use `engineer` (default genérico).

Verifique se `.synapos/squad-templates/{role}/` existe. Se não → use `engineer`. Se `engineer` também não existe → pare com erro:

```
❌ Nenhum template instalado. Execute: npx synapos
```

---

## 4. DEFINIR FEATURE SESSION

### Derivar slug

Do `[USER_INTENT]`, derive `{feature-slug}`:
- Lowercase
- Palavras-chave principais (máx 3 palavras)
- Hífens entre palavras
- Sem acentos nem caracteres especiais

Exemplos:
- "corrigir bug do login" → `bug-login`
- "adicionar endpoint de webhook" → `webhook-endpoint`
- "refatorar query de pedidos" → `refatorar-pedidos`

### Decidir se nova ou existente

Liste `docs/.squads/sessions/`:

- **Se existe `{feature-slug}` exato** → reutilizar essa session.
- **Se existe slug similar** (>70% overlap de palavras) → perguntar com AskUserQuestion se é a mesma feature.
- **Se não há match** → criar nova session.

### Criar (se nova)

```
docs/.squads/sessions/{feature-slug}/
├── context.md    ← template abaixo
├── memories.md   ← template abaixo
└── state.json    ← { feature, created_at, updated_at, pipeline_runs: [] }
```

`context.md` inicial:
```markdown
# {feature-slug}

> Intenção do usuário: {USER_INTENT}
> Iniciado em: {YYYY-MM-DD}

## O que é
(preenchido na investigação)

## Por que
(preenchido na investigação)

## Decisões
(preenchido ao longo do trabalho)

## Não fazer
(armadilhas descobertas)
```

`memories.md` inicial:
```markdown
# Memórias — {feature-slug}

(append-only. Novas entradas no topo.)
```

---

## 5. ATIVAR ROLE

Leia `.synapos/squad-templates/{role}/template.yaml`.

Copie para `.synapos/squads/{feature-slug}/` (se ainda não existe):
- `template.yaml` → `squad.yaml` (adicione `feature: {feature-slug}` no topo)
- `persona.md` (se existir)

**Não copie pipelines separados** — o pipeline está inline no `template.yaml`.

Log:
```
✅ Role {role} ativado para feature {feature-slug}
   Session: docs/.squads/sessions/{feature-slug}/
```

---

## 6. EXECUTAR PIPELINE

Chame `.synapos/core/pipeline-runner.md` passando:

```
[FEATURE_SLUG] = {feature-slug}
[ROLE] = {role}
[USER_INTENT] = {mensagem original do usuário}
[SESSION_DIR] = docs/.squads/sessions/{feature-slug}/
[SQUAD_DIR] = .synapos/squads/{feature-slug}/
[STACK] = conteúdo de docs/_memory/stack.md
```

O pipeline-runner cuida do resto.

---

## REGRAS GERAIS

| Regra | Como aplicar |
|---|---|
| **Onboarding nunca bloqueia** | Se falta info, cria com defaults e segue. Usuário edita depois. |
| **Infere antes de perguntar** | Só abre AskUserQuestion quando inferência é impossível. |
| **Uma session por feature** | Nunca duplique. Reutilize quando o slug bate. |
| **Fail loud** | Se template não existe e não tem fallback: pare com mensagem clara. |
| **Respeita a linguagem** | pt-BR por padrão. Código, identificadores e imports em inglês. |
| **Sem cerimônia extra** | Sem "confirmar?" antes de rodar. O usuário pediu `/init`, execute. |
