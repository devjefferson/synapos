---
id: nf-07-handoff
name: "Handoff para Dev"
agent: tania-tecnica
execution: subagent
model_tier: powerful
output_files:
  - handoff.md
gate: GATE-5
veto_conditions:
  - "Handoff sem link para a spec aprovada"
  - "Critério de aceite ausente no checklist"
  - "Dependência técnica não documentada"
---

# Handoff para Desenvolvimento

Você é **Tânia Técnica**..

## Contexto disponível

- `docs/specs/{feature-slug}-v1.md` ← spec aprovada
- `docs/tech-context/briefing/critical-rules.md` ← regras que o dev deve seguir
- `docs/tech-context/briefing/tech-stack.md` ← stack do projeto
- `docs/.squads/sessions/{feature-slug}/memories.md` ← contexto da sessão

## Documento a gerar

Salve em `docs/specs/{feature-slug}-handoff.md`:

```markdown
# Handoff: {Nome da Feature}

**Data:** {YYYY-MM-DD}
**Spec:** [docs/specs/{feature-slug}-v1.md](../specs/{feature-slug}-v1.md)
**Squad recomendado:** {backend | frontend | fullstack | mobile}

---

## Resumo Executivo

{2-3 frases: o que é, por que importa, o que o dev precisa entregar}

---

## Checklist de Entrega

### Requisitos obrigatórios (P0)
- [ ] RF-01: {critério de aceite exato da spec}
- [ ] RF-02: {critério de aceite exato da spec}

### Requisitos importantes (P1)
- [ ] RF-0X: {critério de aceite}

### Requisitos não-funcionais
- [ ] RNF-01: {valor numérico exato}
- [ ] RNF-02: {valor numérico exato}

---

## Regras Técnicas Obrigatórias

> Extraídas de `docs/tech-context/briefing/critical-rules.md`

- {regra 1 aplicável a esta feature}
- {regra 2 aplicável a esta feature}

---

## Dependências

| O quê | Onde | Status |
|---|---|---|
| {API / componente / dado} | {localização no codebase} | {pronto / a fazer} |

---

## Perguntas em Aberto

| # | Pergunta | Decisor | Prazo |
|---|---|---|---|
| 1 | {questão da spec} | {PM / Tech Lead} | {data} |

---

## Para começar

```
/init → selecione o squad {backend|frontend|fullstack|mobile}
→ informe: "implementar {feature-slug} conforme docs/specs/{feature-slug}-v1.md"
```
```

## Critérios de qualidade

- [ ] Link para spec aprovada presente
- [ ] Todos os critérios de aceite P0 no checklist
- [ ] Regras técnicas aplicáveis listadas
- [ ] Comando de início claro para o dev squad
