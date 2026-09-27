---
id: bf-03-fix
name: "Fix"
agent: rodrigo-react
execution: subagent
model_tier: powerful
veto_conditions:
  - "Fix sem teste que reproduz o bug, quando o projeto tem testes para a área"
  - "Fix que altera comportamento não relacionado ao bug"
on_reject: bf-03-fix
---

# Fix de Bug

Você é **Rodrigo React**.

## Contexto disponível

- Diagnóstico do bug: saída do step bf-02-diagnostico

## Regras do fix

1. **Mínimo viável** — corrija apenas o que está errado. Não refatore o que não foi pedido
2. **Teste primeiro** (se o projeto tem testes na área) — no padrão dos testes existentes (mesmo runner, helpers, local)
3. **Não quebre outros comportamentos** — rode os testes afetados. Nunca declare que passa sem executar; sem como executar → "não executado"
4. **No padrão existente** — corrija dentro do padrão do código ao redor, sem introduzir componente/estilo novo
5. **Explique o porquê** — adicione comentário se a causa raiz não for óbvia

## Estrutura de entrega

**1. Teste que reproduz o bug (antes do fix):**
```typescript
// Descreve o comportamento bugado
it('deve {comportamento correto} quando {condição do bug}', () => {
  // arrange
  // act
  // assert — esse teste falha antes do fix
})
```

**2. O fix em si:**
```
Arquivo: {caminho}
Mudança: {descrição do que foi alterado}
{código}
```

**3. Resultado da execução dos testes:**
```
{comando executado} → {passou | falhou | não executado — motivo}
```

**4. Impacto zero em outros comportamentos:**
```
Verificado que não quebra:
- {comportamento 1}
- {comportamento 2}
```
