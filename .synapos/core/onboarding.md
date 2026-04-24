---
name: synapos-onboarding
version: 1.0.0
description: Protocolo de primeira vez — cria company.md e preferences.md com uma única pergunta
---

# PROTOCOLO DE ONBOARDING

> Carregado apenas quando `docs/_memory/company.md` não existe.
> O orchestrator detecta a ausência e lê este arquivo on-demand — não faz parte do contexto padrão.

---

## PROTOCOLO

**1 AskUserQuestion. Nada mais.**

```
AskUserQuestion({
  question: "Olá! Sou o Synapos.\n\nDuas perguntas rápidas para começar:\n  1. Qual é o nome do projeto?\n  2. O que você quer fazer agora?\n\nResponda as duas juntas. Ex: \"Meu SaaS — corrigir bug no login\"",
  options: [
    { label: "Responder", description: "Digite: nome do projeto — o que quer fazer" }
  ]
})
```

Com a resposta, extraia:
- **Nome do projeto** → salva em `company.md`
- **O que fazer** → use como contexto para inferência de modo e role no orchestrator

**Defaults silenciosos** (nunca pergunte sobre eles no onboarding):
- Task tracker: `none`
- `model_capability`: `high`
- Linguagem: idioma detectado na resposta do usuário, padrão `pt-BR`

---

## ARQUIVOS CRIADOS

### `docs/_memory/company.md`

```markdown
---
atualizado: {YYYY-MM-DD}
---
# Perfil

**Nome:** {nome inferido}
**Setor:** não informado
**Linguagem de saída:** {pt-BR | en-US}
```

### `docs/_memory/preferences.md`

```markdown
---
atualizado: {YYYY-MM-DD}
---
# Preferências

**IDE Principal:** Claude Code
**Formato de data:** YYYY-MM-DD
**Task Tracker:** none
**model_capability:** high
**model_name:** não informado
```

> Task tracker, setor e modelo podem ser atualizados depois pelo usuário diretamente nos arquivos.

---

## APÓS CONCLUIR

Retorne ao orchestrator e continue para o PASSO 2 (detecção de retomada).
Os valores derivados (`[MODELO_TIER]`, `[LINGUA]`, `[TASK_TRACKER]`) já estão disponíveis a partir dos arquivos recém-criados.
