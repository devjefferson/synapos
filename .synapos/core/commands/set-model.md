---
name: synapos-set-model
version: 1.1.0
description: Altera model_capability e model_name em docs/_memory/preferences.md
---

# PROTOCOLO SET-MODEL

> Atualiza as configurações de modelo usadas pelo pipeline-runner e model-adapter.
> Afeta: injeção de contexto, model_tier routing e nível de adaptação de prompts.

**Suporta dois modos:**
- **Non-interactive:** `/set-model high claude-opus-4-6` → aplica direto
- **Interactive:** `/set-model` → fluxo guiado com AskUserQuestion

---

## PASSO 1 — Ler estado atual

Leia `docs/_memory/preferences.md` e extraia valores atuais.

Se o arquivo não existir:
```
⚠️  docs/_memory/preferences.md não encontrado.
Execute /init primeiro para criar o onboarding.
```
E encerre.

---

## PASSO 2 — Modo non-interactive (se argumentos fornecidos)

Se o comando vier com argumentos (ex: `/set-model high claude-opus-4-6`):

1. Parseie: `{capability} {model_name}` (model_fast e model_powerful são opcionais)
2. Valide `capability`: deve ser `high`, `standard` ou `lite`
3. Valide `model_name`: não vazio
4. Se válido: vá para PASSO 6 (confirmar e salvar)
5. Se inválido: informe erro e sugira interactive mode

**Formatos aceitos:**
```
/set-model high claude-opus-4-6
/set-model standard gpt-4o-mini
/set-model lite kimi
/set-model high opus — fast haiku — powerful opus   # com multi-model
```

---

## PASSO 3 — Modo interativo (se sem argumentos)

Exiba estado atual e use **no máximo 2 AskUserQuestion**:

```
⚙️  Configuração atual
model_capability: {valor}
model_name: {valor}
model_fast: {valor ou "—"}
model_powerful: {valor ou "—"}
```

```
AskUserQuestion({
  question: "Qual capability do modelo?",
  options: [
    { label: "high", description: "Claude Opus/Sonnet, GPT-4o, Gemini Pro — contexto completo" },
    { label: "standard", description: "Claude Haiku, GPT-4o-mini, Gemini Flash — CoT prefix" },
    { label: "lite", description: "Kimi, MiniMax, Llama — context pruning" }
  ]
})
```

```
AskUserQuestion({
  question: "Modelo principal?",
  options: [
    { label: "claude-opus-4-6", description: "Anthropic" },
    { label: "claude-sonnet-4-6", description: "Anthropic" },
    { label: "gpt-4o", description: "OpenAI" },
    { label: "gpt-4o-mini", description: "OpenAI" },
    { label: "gemini-1.5-pro", description: "Google" },
    { label: "Outro", description: "Vou informar" }
  ]
})
```

Se "Outro": peça input livre.

---

## PASSO 4 — Multi-model routing (opcional)

```
AskUserQuestion({
  question: "Deseja configurar model_fast e model_powerful separados?",
  options: [
    { label: "Não — usar um modelo só", description: "Mais simples" },
    { label: "Sim — diferenciar por tier", description: "Fast + Powerful" }
  ]
})
```

Se Sim: perguntefast e powerful (máximo 2 AskUserQuestion adicionais).

---

## PASSO 5 — Resumo e confirmação

Exiba resumo:
```
model_capability: {valor}
model_name: {valor}
model_fast: {valor ou "—"}
model_powerful: {valor ou "—"}
```

```
AskUserQuestion({
  question: "Aplicar esta configuração?",
  options: [
    { label: "✅ Confirmar", description: "Salvar em preferences.md" },
    { label: "↩️ Cancelar", description: "Não alterar" }
  ]
})
```

---

## PASSO 6 — Salvar

Atualize `docs/_memory/preferences.md` com os novos valores.

---

## PASSO 7 — Efeito por capability

| model_capability | O que muda |
|---|---|
| `high` | Contexto completo — sem adaptação |
| `standard` | CoT prefix + templates |
| `lite` | Context pruning (~70%) + scope forcing |

```
AskUserQuestion({
  question: "Qual é a capacidade do modelo que você está usando?\n\nIsso controla o nível de adaptação de contexto em cada step.",
  options: [
    { label: "high", description: "Claude Opus/Sonnet · GPT-4o · Gemini Pro — contexto completo, sem adaptação" },
    { label: "standard", description: "Claude Haiku · GPT-4o-mini · Gemini Flash — CoT prefix + templates" },
    { label: "lite", description: "Kimi · MiniMax · Llama · modelos locais — context pruning + scope forcing" }
  ]
})
```

Armazene a seleção como `{novo_capability}`.

---

## PASSO 4 — Escolher model_name

Use AskUserQuestion:

```
AskUserQuestion({
  question: "Qual modelo você está usando?\n\nEsse valor é registrado para referência nos logs.",
  options: [
    { label: "claude-opus-4-6", description: "Claude Opus 4.6 (Anthropic)" },
    { label: "claude-sonnet-4-6", description: "Claude Sonnet 4.6 (Anthropic)" },
    { label: "claude-haiku-4-5", description: "Claude Haiku 4.5 (Anthropic)" },
    { label: "gpt-4o", description: "GPT-4o (OpenAI)" },
    { label: "gpt-4o-mini", description: "GPT-4o-mini (OpenAI)" },
    { label: "gemini-1.5-pro", description: "Gemini 1.5 Pro (Google)" },
    { label: "gemini-1.5-flash", description: "Gemini 1.5 Flash (Google)" },
    { label: "Outro", description: "Vou informar o nome manualmente" }
  ]
})
```

Se "Outro": peça o nome via texto livre e armazene como `{novo_model_name}`.

---

## PASSO 5 — Configurar multi-model routing (opcional)

Use AskUserQuestion:

```
AskUserQuestion({
  question: "Deseja configurar roteamento multi-modelo?\n\nIsso permite usar modelos diferentes para steps leves (fast) e pesados (powerful).",
  options: [
    { label: "Sim — configurar model_fast e model_powerful", description: "Economiza tokens usando modelo leve em steps de preparação" },
    { label: "Não — usar um único modelo para tudo", description: "Mais simples, todos os steps usam o mesmo modelo" }
  ]
})
```

**Se "Sim":**

```
AskUserQuestion({
  question: "Qual modelo para steps LEVES (preparação, formatação, gates simples)?",
  options: [
    { label: "claude-haiku-4-5", description: "Mais rápido e barato (Anthropic)" },
    { label: "gpt-4o-mini", description: "Mais rápido e barato (OpenAI)" },
    { label: "gemini-1.5-flash", description: "Mais rápido e barato (Google)" },
    { label: "Mesmo modelo principal", description: "Não diferenciar por tier" },
    { label: "Outro", description: "Vou informar manualmente" }
  ]
})
```

```
AskUserQuestion({
  question: "Qual modelo para steps PESADOS (implementação, arquitetura, spec, decisões)?",
  options: [
    { label: "claude-opus-4-6", description: "Máxima capacidade (Anthropic)" },
    { label: "claude-sonnet-4-6", description: "Alta capacidade (Anthropic)" },
    { label: "gpt-4o", description: "Alta capacidade (OpenAI)" },
    { label: "gemini-1.5-pro", description: "Alta capacidade (Google)" },
    { label: "Outro", description: "Vou informar manualmente" }
  ]
})
```

Armazene como `{novo_model_fast}` e `{novo_model_powerful}`.

**Se "Não":** remova `model_fast` e `model_powerful` do preferences.md (ou mantenha em branco).

---

## PASSO 6 — Confirmar e aplicar

Apresente o resumo da mudança antes de salvar:

```
AskUserQuestion({
  question: "Confirmar alterações?\n\nmodel_capability : {atual} → {novo_capability}\nmodel_name       : {atual} → {novo_model_name}\nmodel_fast       : {atual} → {novo_model_fast ou "removido"}\nmodel_powerful   : {atual} → {novo_model_powerful ou "removido"}",
  options: [
    { label: "✅ Confirmar", description: "Salvar em docs/_memory/preferences.md" },
    { label: "↩️ Cancelar", description: "Não alterar nada" }
  ]
})
```

**Se cancelar:** encerre sem modificar o arquivo.

---

## PASSO 7 — Salvar em preferences.md

Leia o conteúdo atual de `docs/_memory/preferences.md`.

Atualize ou insira os campos usando as seguintes regras:
- Se a linha `**model_capability:**` já existe → substitua o valor
- Se não existe → adicione após a linha `**Task Tracker:**`
- Idem para `**model_name:**`, `**model_fast:**`, `**model_powerful:**`
- Se multi-model routing foi desativado ("Não"), remova as linhas `model_fast` e `model_powerful` se existirem
- Atualize o campo `atualizado:` no frontmatter com a data atual (`YYYY-MM-DD`)

Formato das linhas:
```
**model_capability:** {high | standard | lite}
**model_name:** {nome do modelo}
**model_fast:** {nome do modelo leve}        ← omitir se não configurado
**model_powerful:** {nome do modelo pesado}  ← omitir se não configurado
```

---

## PASSO 8 — Confirmar conclusão

```
✅ Configuração de modelo atualizada!

docs/_memory/preferences.md
  model_capability : {novo_capability}
  model_name       : {novo_model_name}
  model_fast       : {novo_model_fast ou "—"}
  model_powerful   : {novo_model_powerful ou "—"}

Efeito imediato:
```

| model_capability | O que muda |
|---|---|
| `high` | Contexto completo — sem adaptação. ADRs + docs + session files injetados na íntegra |
| `standard` | CoT prefix + templates ativados. Contexto completo mantido |
| `lite` | Context pruning (~70% redução) + scope forcing + self-check ativados |

> A mudança afeta o próximo /init ou pipeline executado — squads em andamento não são interrompidos.
