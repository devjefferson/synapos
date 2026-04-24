---
id: checkpoint-final
name: "Aprovação Consolidada (Contexto + Arquitetura + Plano)"
execution: checkpoint
gate: GATE-ADR
---

# Aprovação Consolidada

⏸ **CHECKPOINT — Revisão final da pré-execução**

Os três artefatos da pré-execução foram gerados. Revise em conjunto antes de iniciar a execução.

## Artefatos para revisar

1. **context.md** — Motivação, Meta mensurável, ADRs Relevantes
2. **architecture.md** — Verificação de Consistência, ADRs Aplicadas, lista de arquivos a modificar/criar
3. **plan.md** — Fases divididas com agents/skills atribuídos, estimativas e dependências

## O que validar

- Não há `[DECISÃO PENDENTE]` pendente em nenhum dos 3 arquivos
- architecture.md está marcado como APROVADO na Verificação de Consistência
- Todas as ADRs relevantes foram listadas e respeitadas em architecture.md
- As fases do plan.md fazem sentido na sequência proposta
- As estimativas de 2h por fase são realistas
- Os agents atribuídos a cada fase são os corretos

```
Os três artefatos estão aprovados para iniciar a execução?

- ✅ Aprovar tudo — iniciar execução fase a fase
- ✏️ Ajustar contexto — voltar para Investigação
- ✏️ Ajustar arquitetura — voltar para Estruturação Arquitetural
- ✏️ Ajustar plano — voltar para Planejamento de Execução
```

> Após aprovação, a execução ocorre fase a fase com pausa e validação ao final de cada fase.
> GATE-ADR verifica automaticamente conformidade com ADRs antes de liberar este checkpoint.
