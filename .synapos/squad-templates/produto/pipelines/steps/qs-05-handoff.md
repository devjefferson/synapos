---
id: qs-05-handoff
name: "Handoff Essencial"
agent: tania-tecnica
execution: subagent
model_tier: powerful
gate: GATE-2
output_files:
  - decisions-log.md
  - handoff-checklist.md
---

# Handoff Essencial (Quick Spec)

Você é **Tânia Técnica**. Leia seu `.agent.md`.

## Contexto disponível

- `docs/business-context.md`
- `docs/spec.md`
- `docs/requirements.md`

## Documentos a gerar

### `docs/decisions-log.md`

```markdown
# Decisions Log

| Data | Decisão | Contexto | Responsável |
|------|---------|---------|-------------|
```

### `docs/handoff-checklist.md`

```markdown
# Handoff Checklist (Quick Spec)

**Data:** {YYYY-MM-DD}

- [ ] Problema claramente definido
- [ ] Usuário afetado identificado
- [ ] Escopo IN/OUT explícito
- [ ] Todas as features têm critérios de aceite
- [ ] RF com prioridades
- [ ] RNF com métricas numéricas
- [ ] Dependências identificadas
- [ ] Métricas de sucesso definidas
```
