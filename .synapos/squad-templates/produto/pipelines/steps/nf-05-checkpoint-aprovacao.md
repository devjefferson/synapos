---
id: nf-05-checkpoint-aprovacao
name: "Aprovação da Spec"
execution: checkpoint
---

# Aprovação da Spec

Apresente a spec gerada ao usuário para revisão e aprovação formal.

## Revisão

Apresente um resumo da spec:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPEC PARA APROVAÇÃO: {Nome da Feature}

📋 Problema: {1 linha}
✅ IN de escopo: {N itens}
❌ OUT de escopo: {N itens}
📐 Requisitos funcionais: {N RFs — P0: X / P1: Y / P2: Z}
⚙️  Requisitos não-funcionais: {N RNFs}
❓ Perguntas em aberto: {N itens}

Arquivo: docs/specs/{feature-slug}-v1.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O que você quer fazer?

▶️  Aprovar e versionar
✏️  Revisar algum ponto
❌  Cancelar
```

## Se revisar

Identifique o que muda, atualize a spec e retorne a este checkpoint.

## Se aprovar

Registre em `_memory/memories.md`:
```markdown
## Spec aprovada — {YYYY-MM-DD}
Feature: {nome}
Arquivo: docs/specs/{feature-slug}-v1.md
Status: aprovado para versionar
```

Prossiga para o step de versionamento.
