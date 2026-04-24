---
id: 08-handoff
name: "Handoff para Desenvolvimento"
agent: tania-tecnica
execution: subagent
model_tier: powerful
gate: GATE-4
output_files:
  - decisions-log.md
  - open-questions.md
  - handoff-checklist.md
veto_conditions:
  - "Handoff checklist com item em branco ou N/A sem justificativa"
  - "Decisão sem data ou responsável"
  - "Open question sem responsável definido"
---

# Handoff para Desenvolvimento

Você é **Tânia Técnica**.

## Contexto disponível

Leia todos os documentos gerados antes de escrever:
- `docs/product-vision.md`
- `docs/spec.md`
- `docs/requirements.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `docs/success-metrics.md`
- `docs/risks.md`

## Documentos a gerar

### `docs/decisions-log.md`

Registre TODAS as decisões tomadas ao longo do processo:

```markdown
# Decisions Log

**Projeto:** {nome do squad}
**Data de fechamento:** {YYYY-MM-DD}

| Data | Decisão | Contexto | Alternativas | Responsável |
|------|---------|---------|--------------|-------------|
| {data} | {o que foi decidido} | {por que} | {o que foi rejeitado} | {nome} |

## Decisões Pendentes de Validação
{decisões que precisam de confirmação antes do início do desenvolvimento}
```

### `docs/open-questions.md`

```markdown
# Perguntas em Aberto

**Data:** {YYYY-MM-DD}

| # | Pergunta | Impacto | Responsável | Prazo |
|---|----------|---------|-------------|-------|
| 1 | {pergunta específica} | {o que bloqueia se não for respondida} | {nome} | {data} |

## Perguntas Respondidas Durante o Processo
{log de perguntas que surgiram e foram resolvidas}
```

### `docs/handoff-checklist.md`

```markdown
# Handoff Checklist

**Squad:** {slug}
**Data:** {YYYY-MM-DD}
**Status:** {pronto para dev | pendente: {o que falta}}

---

## Contexto de Produto
- [ ] Product vision documentada com North Star Metric
- [ ] Problema e personas claramente definidos
- [ ] Escopo IN/OUT explícito na spec

## Especificação
- [ ] Todas as features têm critérios de aceite no formato Dado/Quando/Então
- [ ] Casos de borda documentados para fluxos críticos
- [ ] Dependências identificadas

## Requisitos
- [ ] Todos os RF com prioridade P0/P1/P2
- [ ] RNF com métricas numéricas (tempo, %, quantidade)
- [ ] Conflitos resolvidos ou documentados com responsável

## Decisões Técnicas
- [ ] ADRs para todas as decisões arquiteturais relevantes
- [ ] Alternativas rejeitadas documentadas
- [ ] Integrações externas identificadas

## Planejamento
- [ ] Roadmap com 3 horizontes
- [ ] Métricas de sucesso com baseline e meta
- [ ] Riscos principais com mitigação

## Pendências
- [ ] Perguntas em aberto têm responsável e prazo
- [ ] Decisões pendentes estão no decisions-log

---

## Nota de Entrega

{Breve mensagem de Tânia Técnica para o time de desenvolvimento
resumindo os pontos mais importantes e o que precisa de atenção especial}
```

## Verificação GATE-4

Antes de entregar, confirme que todos os arquivos existem:
- [ ] `docs/product-vision.md` ✓
- [ ] `docs/spec.md` ✓
- [ ] `docs/requirements.md` ✓
- [ ] `docs/architecture.md` ✓
- [ ] `docs/roadmap.md` ✓
- [ ] `docs/success-metrics.md` ✓
- [ ] `docs/risks.md` ✓
- [ ] `docs/decisions-log.md` ✓
- [ ] `docs/open-questions.md` ✓
- [ ] `docs/handoff-checklist.md` ✓

Se qualquer arquivo estiver ausente → GATE-4 FALHA. Informe e não conclua o pipeline.
