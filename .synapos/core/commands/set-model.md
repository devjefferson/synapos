---
name: synapos-set-model
version: 3.0.0
description: Atualiza o modelo em docs/_memory/preferences.md
---

# /set-model

Atualiza o modelo usado pelo Synapos.

## USO

```
/set-model                       → fluxo interativo
/set-model claude-sonnet-4-6     → aplica direto
```

## PROTOCOLO

### 1. Ler estado atual

Leia `docs/_memory/preferences.md`. Se não existir: execute `/init` primeiro.

### 2. Determinar novo modelo

**Se argumento fornecido:** use como `model_name`.

**Se sem argumento:**

```
AskUserQuestion({
  question: "Qual modelo usar?",
  options: [
    { label: "Claude Sonnet 4.6", description: "Rápido, barato, bom para 90% do trabalho" },
    { label: "Claude Opus 4.7", description: "Mais capaz, mais caro — para tarefas complexas" },
    { label: "Claude Haiku 4.5", description: "Mais rápido — tarefas simples, pipelines curtos" },
    { label: "Outro", description: "Digitar manualmente" }
  ]
})
```

Se "Outro": pergunte o identificador exato (ex: `gpt-4o`, `gemini-2.5-pro`, `deepseek-v3`).

### 3. Atualizar preferences.md

Substitua a linha `**Model:** ...` em `docs/_memory/preferences.md` pelo novo valor. Se a linha não existe, adicione.

### 4. Confirmar

```
✅ Modelo atualizado: {modelo}
   Arquivo: docs/_memory/preferences.md
```

> Claude Code, Cursor e afins têm seu próprio seletor de modelo na interface — o Synapos apenas registra a preferência para referência.
