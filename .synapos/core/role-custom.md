---
name: synapos-role-custom
version: 1.0.0
description: Fluxo de criação de role customizado — carregado quando usuário seleciona "✨ Customizado"
---

# ROLE CUSTOMIZADO

> Carregado apenas quando o usuário escolhe "✨ Customizado" no menu de seleção de role.
> Não faz parte do contexto padrão do orchestrator.

---

## ORIENTAÇÕES AO USUÁRIO

- Roles base são sempre incluídos — não precisam ser selecionados
- Recomendado para features: 2-3 roles (base + 1-2 adicionais)
- Evite selecionar todos — overhead sem benefício

---

## PASSO 1 — Selecionar roles adicionais

```
AskUserQuestion({
  question: "Role Customizado\n\nQue perspectivas você quer ativar (além da base)?",
  options: [
    { label: "🧑‍💻 Fullstack", description: "Para features integradas front + back" },
    { label: "🎨 Designer/UX", description: "Para features com UI" },
    { label: "🔧 DevOps", description: "Para features com infra" },
    { label: "✅ Só base", description: "Apenas o role base" }
  ],
  multiSelect: true
})
```

## PASSO 2 — Selecionar pipeline

```
AskUserQuestion({
  question: "Qual pipeline para este role?",
  options: [
    { label: "Feature Development", description: "Discovery → Arquitetura → Implementação → Review" },
    { label: "Bug Fix", description: "Diagnóstico → Fix → Testes → Review" },
    { label: "Quick Fix", description: "Mudança rápida sem aprovações" }
  ]
})
```

## PASSO 3 — Criar squad.yaml

- Domain: `custom`
- DisplayName: `Role Customizado`
- Roles: os selecionados no PASSO 1
- Mode: `solo` (padrão para custom)

---

## APÓS CONCLUIR

Retorne ao orchestrator para ativação (PASSO 8 do fluxo principal).
