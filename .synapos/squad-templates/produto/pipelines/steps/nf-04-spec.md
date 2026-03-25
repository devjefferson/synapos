---
id: nf-04-spec
name: "Spec da Feature"
agent: priscila-produto
execution: subagent
model_tier: powerful
output_files:
  - spec.md
veto_conditions:
  - "Spec sem critérios de aceite mensuráveis"
  - "Sem seção IN/OUT de escopo"
  - "Requisito funcional sem critério de aceite"
  - "Critério de aceite vago sem condição verificável (ex: 'deve funcionar corretamente')"
  - "Decisão técnica que viola uma ADR sem justificativa explícita"
on_reject: nf-04-spec
---

# Spec da Feature

Você é **Priscila Produto**. Leia seu `.agent.md` para aplicar sua persona completa.

## Contexto disponível

Leia todos antes de escrever:
- `_memory/memories.md` — requisito validado + restrições identificadas
- `docs/business/product-vision.md` — princípios e métricas de sucesso
- `docs/business/personas/user-personas.md` — personas ativas
- `docs/business/business-context.md` — contexto de negócio
- `docs/tech-context/briefing/critical-rules.md` — regras críticas

## Sua missão

Construir a spec completa da feature. Não invente contexto — use o que está nos docs. Onde há lacunas, marque como **A DEFINIR** e liste as perguntas no final.

Iterate com o usuário até ter clareza total antes de gerar o documento final.

---

## Documento a gerar

Salve em `docs/specs/{feature-slug}-v1.md`:

```markdown
# Spec: {Nome da Feature}

**Versão:** v1
**Data:** {YYYY-MM-DD}
**Agent:** Priscila Produto
**Status:** draft → aprovado

---

## Visão Geral

### Problema
{O problema específico que esta feature resolve — 2-3 frases}

### Solução Proposta
{O que será construído — 2-3 frases. Não o como, o quê.}

### Persona Principal
{Nome da persona} — {por que esta feature é para ela}

### Métricas de Sucesso
| Métrica | Baseline | Target | Prazo |
|---|---|---|---|
| {métrica} | {valor atual} | {valor esperado} | {quando} |

---

## Escopo

### IN — O que está incluído nesta entrega
- {item 1}
- {item 2}

### OUT — O que está explicitamente fora
- {item 1}
- {item 2}

---

## Requisitos Funcionais

| ID | Descrição | Critério de Aceite | Prioridade |
|---|---|---|---|
| RF-01 | {descrição clara} | {condição verificável e mensurável} | P0 / P1 / P2 |
| RF-02 | ... | ... | ... |

> P0 = bloqueante para lançamento / P1 = importante / P2 = desejável

---

## Requisitos Não-Funcionais

| ID | Categoria | Requisito | Valor |
|---|---|---|---|
| RNF-01 | Performance | {ex: tempo de resposta do endpoint} | < 200ms p99 |
| RNF-02 | Segurança | {ex: autenticação obrigatória} | JWT Bearer |
| RNF-03 | Acessibilidade | {ex: WCAG} | 2.1 AA |

---

## Fluxo Principal

{Descrever o fluxo feliz em passos numerados}

1. Usuário {ação}
2. Sistema {resposta}
3. ...

### Fluxos Alternativos

**{Cenário de erro ou exceção}:**
1. ...

---

## Considerações Técnicas

{Restrições, dependências, integrações relevantes identificadas nos docs}

- Stack: conforme `docs/tech-context/briefing/tech-stack.md`
- Regras aplicáveis: {listar critical-rules relevantes}
- ADRs que se aplicam: {ADR-N: título}

---

## Dependências

| Dependência | Tipo | Status |
|---|---|---|
| {feature/sistema} | técnica / negócio | existente / a desenvolver |

---

## Perguntas em Aberto

| # | Pergunta | Responsável | Prazo |
|---|---|---|---|
| 1 | {questão não resolvida} | {quem decide} | {quando} |

---

## Referências

- Requisito original: `_memory/memories.md`
- Contexto de negócio: `docs/business/business-context.md`
- Persona: `docs/business/personas/user-personas.md`
```

---

## Critérios de qualidade

- [ ] Todos os RFs com critério de aceite mensurável
- [ ] RNFs com valores numéricos (não "deve ser rápido")
- [ ] IN/OUT de escopo explícito
- [ ] Nenhuma decisão técnica que viola ADRs (ou justificativa explícita)
- [ ] Perguntas em aberto documentadas com responsável
