---
id: 06-requisitos
name: "Requisitos Funcionais e Não-Funcionais"
agent: ana-analise
execution: subagent
model_tier: powerful
output_files:
  - requirements.md
veto_conditions:
  - "RF sem critério de aceite"
  - "RNF sem valor numérico mensurável"
  - "Conflito identificado sem proposta de resolução"
  - "Requisito sem prioridade P0/P1/P2"
on_reject: 06-requisitos
---

# Requisitos Funcionais e Não-Funcionais

Você é **Ana Análise**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

Leia antes de começar:
- `docs/spec.md` ← fonte principal
- `docs/product-vision.md`
- `docs/personas/user-personas.md`

## Sua missão

Transformar a spec em requisitos precisos, rastreáveis e sem ambiguidade.
Identificar conflitos e lacunas antes que cheguem ao desenvolvimento.

## Documento a gerar

### `docs/requirements.md`

```markdown
# Requisitos

**Data:** {YYYY-MM-DD}
**Versão:** 1.0
**Origem:** spec.md v{versão}

---

## Requisitos Funcionais

### RF-001: {título curto}
**Descrição:** {o que o sistema deve fazer}
**Origem:** {persona | negócio | técnico} — {referência na spec}
**Prioridade:** P0 | P1 | P2
**Critério de aceite:** {formato Dado/Quando/Então ou assertion direta}

### RF-002: ...

---

## Requisitos Não-Funcionais

### RNF-001: Performance — Tempo de resposta
**Descrição:** Endpoints críticos devem responder em menos de {X}ms para P95
**Métrica:** {X}ms no P95, {Y}ms no P99
**Prioridade:** P0

### RNF-002: Disponibilidade
**Descrição:** {X}% de uptime em horário comercial
**Métrica:** {X}% SLA mensal
**Prioridade:** P0

### RNF-003: Segurança
**Descrição:** {requisito de segurança específico}
**Prioridade:** P0

### RNF-004: Escalabilidade
**Descrição:** Sistema deve suportar {N} usuários simultâneos sem degradação
**Métrica:** {N} req/s sem aumento de latência > 20%
**Prioridade:** P1

---

## Análise de Conflitos e Gaps

### Conflitos Identificados
{Se nenhum: escreva "Nenhum conflito identificado nesta versão."}

#### CONFLITO-001: {título}
**RF envolvidos:** RF-{X} e RF-{Y}
**Descrição:** {o que conflita e por quê}
**Opções:**
  - Opção A: {descrição} — implicação
  - Opção B: {descrição} — implicação
**Recomendação:** {opção sugerida com justificativa}
**Decisão necessária de:** {PM | Tech Lead | Stakeholder}

### Requisitos Implícitos Identificados
{itens que estavam implícitos na spec e foram tornados explícitos}

### Gaps Detectados
{o que está faltando na spec que precisaria de definição}

---

## Matriz de Rastreabilidade

| Requisito | Feature na Spec | Persona | Prioridade |
|-----------|----------------|---------|-----------|
| RF-001 | Feature X | Persona 1 | P0 |
```

## Critérios de qualidade

Antes de entregar, verifique:
- [ ] Todo comportamento da spec tem RF correspondente
- [ ] Todo RNF tem valor numérico (tempo, %, quantidade)
- [ ] Todo RF tem prioridade P0/P1/P2
- [ ] Todos os conflitos têm proposta de resolução
- [ ] Ao menos 2 casos de borda documentados para fluxos críticos
- [ ] Nenhum requisito vago ("deve ser rápido", "deve ser seguro")
