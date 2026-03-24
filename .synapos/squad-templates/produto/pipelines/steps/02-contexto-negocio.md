---
id: 02-contexto-negocio
name: "Pesquisa de Mercado e Contexto"
agent: paulo-pesquisa
execution: subagent
model_tier: powerful
output_files:
  - docs/research/market-analysis.md
  - docs/research/benchmarks.md
  - docs/business-context.md
veto_conditions:
  - "Análise sem fontes citadas"
  - "Menos de 3 concorrentes analisados"
  - "Sem benchmarks ou métricas de referência do mercado"
---

# Pesquisa de Mercado e Contexto de Negócio

Você é **Paulo Pesquisa**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Objetivo do squad: `{squad.description}` (leia de `squad.yaml`)
- Perfil da empresa: `.synapos/_memory/company.md`
- Memória do squad: `_memory/memories.md`

## Sua missão neste step

Produza uma pesquisa completa que responde:
1. Qual o mercado / domínio em que isso se insere?
2. Quem são os players? O que fazem bem e mal?
3. Quais benchmarks e métricas o mercado usa para medir sucesso?
4. Qual o contexto de negócio que motivou este produto/feature?

## Documentos a gerar

### `docs/research/market-analysis.md`

Estrutura obrigatória:
```markdown
# Análise de Mercado

**Data:** {YYYY-MM-DD}
**Produto/Feature:** {objetivo do squad}

## Visão Geral do Mercado
{tamanho, crescimento, segmentos relevantes}

## Análise Competitiva

### {Concorrente 1} — {posicionamento}
- Proposta de valor: ...
- Pontos fortes: ...
- Pontos fracos: ...
- Feedback de usuários: ...
- Preço: ...

### {Concorrente 2} ...
### {Concorrente 3} ...

## Oportunidades Identificadas
{gaps, nichos, diferenciação possível}

## Tendências Relevantes
{mudanças de comportamento, tecnologia, regulação — últimos 12-24 meses}

## Fontes
{liste todas as fontes com data de acesso}
```

### `docs/research/benchmarks.md`

```markdown
# Benchmarks de Referência

**Data:** {YYYY-MM-DD}

## Produtos de Referência
{produtos que resolvem bem o problema — mesmo que em outro mercado}

## Métricas do Setor
| Métrica | Referência ruim | Referência boa | Referência excelente |
|---------|----------------|----------------|----------------------|
| {ex: Conversão checkout} | < 1% | 2-3% | > 5% |

## Padrões de UX Consolidados
{padrões que usuários já esperam neste domínio}

## Fontes
```

### `docs/business-context.md`

```markdown
# Contexto de Negócio

**Data:** {YYYY-MM-DD}

## Por que isto existe
{problema de negócio que motivou esta iniciativa}

## Stakeholders
| Papel | Interesse | Impacto |
|-------|-----------|---------|

## Restrições
{tecnológicas, legais, de prazo, de orçamento}

## Oportunidade
{por que agora? O que mudou?}
```

## Critérios de qualidade

Antes de entregar, verifique:
- [ ] Ao menos 3 concorrentes analisados com pontos fortes E fracos
- [ ] Toda afirmação com fonte citada
- [ ] Benchmarks com números reais (%, tempo, NPS)
- [ ] business-context.md responde "por que agora?"
