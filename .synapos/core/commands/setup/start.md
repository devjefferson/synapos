---
name: synapos-setup-start
version: 3.0.0
description: Menu de setup — escolhe qual documentação gerar
---

# /setup:start

Menu para gerar documentação do projeto. Use quando quiser enriquecer o contexto que os roles têm ao trabalhar em features.

---

## PROTOCOLO

### 1. Verificar onboarding

Leia `docs/_memory/company.md`. Se não existe: execute `/init` primeiro.

### 2. Inspecionar estado atual

Verifique rapidamente:
- `docs/tech/` existe e tem pelo menos 1 arquivo?
- `docs/business/` existe e tem pelo menos 1 arquivo?
- `docs/_memory/stack.md` está preenchido (não só placeholders)?

### 3. Apresentar menu

```
AskUserQuestion({
  question: "Setup de documentação — o que gerar?",
  options: [
    { label: "🔍 Discover", description: "Escaneia o código e gera mapa técnico (stack, módulos, fluxos)" },
    { label: "⚙️ Tech docs", description: "Documentação técnica: arquitetura, módulos, decisões" },
    { label: "📋 Business docs", description: "Visão, personas, OKRs, jornadas" },
    { label: "↩ Cancelar", description: "Voltar" }
  ]
})
```

- **Discover** → execute `.synapos/core/commands/setup/discover.md`
- **Tech docs** → execute `.synapos/core/commands/setup/build-tech.md`
- **Business docs** → execute `.synapos/core/commands/setup/build-business.md`
- **Cancelar** → encerre

---

## REGRAS

- Nunca sobrescreva arquivo existente sem confirmar
- Sempre gere em `docs/tech/` ou `docs/business/` — nunca em `docs/_memory/` (reservado para perfil)
- Se já há documentação, sugira completar o que falta em vez de regenerar
