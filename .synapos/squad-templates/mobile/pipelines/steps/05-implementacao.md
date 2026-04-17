---
id: 05-implementacao
name: "Implementação Mobile"
agent: felipe-feature
execution: subagent
model_tier: powerful
---

# Implementação Mobile

**Agent:** Felipe Feature 📱

## Tarefa

> **Stack:** Use a framework mobile definida em `docs/_memory/stack.md` (React Native, Flutter, Swift/UIKit, Kotlin, etc.).
> Adapte componentes, padrões de estado e gerenciamento de lista para a plataforma detectada.

1. Implemente as telas e componentes seguindo a arquitetura e UX definidas
2. Integre com a API usando a solução de state/data-fetching da stack do projeto
3. Trate todos os estados: loading, error, empty, success
4. Otimize listas para performance (virtualização, keys estáveis, lazy loading)
5. Tipagem segura — sem tipos genéricos não justificados

## Critérios

- [ ] Todos os estados async tratados em cada tela (loading, error, empty, data)
- [ ] Listas otimizadas para performance (virtualização quando aplicável)
- [ ] Tipagem correta sem tipos genéricos não justificados
- [ ] State/data-fetching usando padrão da stack do projeto
