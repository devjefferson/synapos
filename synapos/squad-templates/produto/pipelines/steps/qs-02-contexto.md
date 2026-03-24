---
id: qs-02-contexto
name: "Contexto e Problema"
agent: priscila-produto
execution: checkpoint
output_files:
  - docs/business-context.md
---

# Contexto e Problema (Quick Spec)

Colete o contexto necessário para a spec de forma direta.

## Perguntas ao usuário

```
Vamos capturar o contexto rapidamente:

1. Qual o problema que esta feature/produto resolve?
   (seja específico: quem tem o problema, em que situação)

2. Quem é o usuário principal afetado?

3. Qual a solução proposta em 2-3 frases?

4. O que está IN desta entrega (obrigatório)?

5. O que está OUT (explicitamente fora)?

6. Como vamos medir que deu certo?
```

## Gerar `docs/business-context.md`

Com base nas respostas, crie:

```markdown
# Contexto de Negócio

**Data:** {YYYY-MM-DD}

## Problema
{resposta da pergunta 1}

## Usuário Afetado
{resposta da pergunta 2}

## Solução Proposta
{resposta da pergunta 3}

## Escopo
**IN:** {resposta 4}
**OUT:** {resposta 5}

## Métricas de Sucesso
{resposta 6}
```

Prossiga para a spec.
