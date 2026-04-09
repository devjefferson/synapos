---
name: synapos-set-model
version: 1.3.0
description: Altera model_capability e model_name em docs/_memory/preferences.md
---

# PROTOCOLO SET-MODEL

> Atualiza as configurações de modelo usadas pelo pipeline-runner e model-adapter.
> Afeta: injeção de contexto, model_tier routing e nível de adaptação de prompts.

**Suporta dois modos:**
- **Non-interactive:** `/set-model high claude-opus-4-6` → aplica direto, sem interação
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
4. Se válido: vá diretamente para **PASSO 7 (confirmar e aplicar)** — sem validação de compatibilidade, sem AskUserQuestion
5. Se inválido: informe erro e sugira interactive mode

**Formatos aceitos:**
```
/set-model high claude-opus-4-6
/set-model standard gpt-4o-mini
/set-model lite kimi
/set-model high opus — fast haiku — powerful opus   # com multi-model
```

---

## PASSO 3 — Modo interativo: escolher capability

Exiba estado atual:
```
⚙️  Configuração atual
model_capability: {valor}
model_name: {valor}
model_fast: {valor ou "—"}
model_powerful: {valor ou "—"}
```

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

## PASSO 6 — Validação de compatibilidade (modo interativo apenas)

> **Este passo se aplica apenas ao modo interativo (PASSO 3–5).**
> No modo non-interactive (PASSO 2), pule direto para PASSO 7.

Avalie se a combinação `{novo_capability}` + `{novo_model_name}` tem risco real de degradação:

**Alerta de sobrecarga** — capability declarada como `high` para modelo comprovadamente limitado:

| Condição | Alerta |
|----------|--------|
| `capability: high` + modelo `haiku/mini/flash` | ⚠️ Sobrecarga — contexto completo pode saturar este modelo |
| `capability: high` + modelo `kimi/llama/minimax` | ⚠️ Sobrecarga — modelos locais geralmente não suportam contexto longo |

Se uma condição da tabela for detectada, exiba:

```
AskUserQuestion({
  question: "⚠️  Atenção: {novo_model_name} é tipicamente usado com `standard` ou `lite`.\n\nConfigurar `high` pode degradar qualidade — contexto completo pode saturar este modelo.\n\nContinuar com `high` mesmo assim?",
  options: [
    { label: "Sim — entendo o risco", description: "Salvar como `high`" },
    { label: "Não — alterar para standard", description: "Ajustar automaticamente" }
  ]
})
```

Se o usuário escolher "Não — alterar para standard": atualize `{novo_capability}` para `standard`.

**Sem alerta** quando não há condição de sobrecarga — qualquer combinação de capability com modelo capaz (opus, sonnet, gpt-4o, gemini-pro) é válida e não requer confirmação extra.

> **Regra:** Usuário pode escolher `standard` ou `lite` para qualquer modelo sem alerta. Essas são opções legítimas (economia de tokens, testes, pipelines específicos). Só alerte quando há risco concreto de saturação.

---

## PASSO 7 — Confirmar e aplicar

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

## PASSO 8 — Salvar em preferences.md

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

## PASSO 9 — Confirmar conclusão

```
✅ Configuração de modelo atualizada!

docs/_memory/preferences.md
  model_capability : {novo_capability}
  model_name       : {novo_model_name}
  model_fast       : {novo_model_fast ou "—"}
  model_powerful   : {novo_model_powerful ou "—"}
```

| model_capability | O que muda |
|---|---|
| `high` | Contexto completo — sem adaptação. ADRs + docs + session files injetados na íntegra |
| `standard` | CoT prefix + templates ativados. Contexto completo mantido |
| `lite` | Context pruning (~70% redução) + scope forcing + self-check ativados |

> A mudança afeta o próximo /init ou pipeline executado — squads em andamento não são interrompidos.
