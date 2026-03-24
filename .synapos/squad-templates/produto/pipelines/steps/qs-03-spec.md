---
id: qs-03-spec
name: "Spec e Critérios de Aceite"
agent: priscila-produto
execution: subagent
model_tier: powerful
output_files:
  - docs/spec.md
veto_conditions:
  - "Spec sem critérios de aceite"
  - "Sem seção IN/OUT de escopo"
on_reject: qs-03-spec
---

# Spec Rápida

Você é **Priscila Produto**. Leia seu `.agent.md`.

## Contexto disponível

- `docs/business-context.md` ← leia antes de escrever

## Documento a gerar

### `docs/spec.md`

```markdown
# Spec: {nome da feature/produto}

**Data:** {YYYY-MM-DD}
**Status:** draft

## Visão Geral
{o que é, para quem, qual problema resolve — 1 parágrafo}

## Escopo
**IN:** {obrigatório para esta entrega}
**OUT:** {explicitamente fora}

## Features

### {Feature 1}
{descrição}

**Critérios de Aceite:**
```
Dado {contexto}
Quando {ação}
Então {resultado}
```

**Casos de Borda:**
- {edge case}

### {Feature 2} ...

## Dependências
{o que precisa existir antes}

## Métricas de Sucesso
{como medir sucesso desta entrega}
```

## Critérios de qualidade
- [ ] Toda feature tem ao menos 1 critério de aceite Dado/Quando/Então
- [ ] Seções IN/OUT preenchidas
- [ ] Nenhum critério de aceite vago
