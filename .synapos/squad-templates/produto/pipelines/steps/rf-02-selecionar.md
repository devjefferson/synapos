---
id: rf-02-selecionar
name: "Selecionar Doc e Escopo da Mudança"
execution: checkpoint
---

# Selecionar Doc e Escopo da Mudança

## Listar docs disponíveis

Escaneie `docs/business/` e liste todos os arquivos `.md` encontrados, agrupados por subpasta.

Apresente ao usuário:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFINAR DOCS — Qual documento você quer atualizar?

docs/business/
  📄 business-context.md
  📄 product-vision.md
  📄 product-strategy.md
  📄 competitive_landscape.md
  📄 customer_communication.md
  personas/
    📄 user-personas.md
    📄 customer-journey.md
  research/
    📄 market-analysis.md
    📄 benchmarks.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Aguarde o usuário selecionar o documento.

---

## Escopo da mudança

Após a seleção, pergunte:

```
O que precisa mudar neste documento?

Exemplos:
- "Adicionar novo concorrente ao competitive_landscape"
- "Atualizar persona principal com novo segmento"
- "Revisar visão de produto para refletir pivô de estratégia"

Descreva a mudança:
```

Aguarde a resposta.

---

## Registrar contexto

Salve em `_memory/memories.md`:
```markdown
## Refinamento selecionado — {YYYY-MM-DD}
Doc: {caminho do arquivo selecionado}
Mudança: {descrição da mudança}
```

Prossiga para análise do delta.
