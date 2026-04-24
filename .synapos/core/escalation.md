---
name: synapos-escalation
version: 1.0.0
description: Protocolo de escalation de decisões críticas — invocado pelo pipeline-runner quando um agent encontra decisão que não pode resolver sozinho
---

# PROTOCOLO DE ESCALATION DE DECISÕES

> Carregado pelo **pipeline-runner** on-demand, quando um agent ou gate detecta decisão que exige intervenção humana ou stakeholder externo.
> Não faz parte do contexto do orchestrator nem de runs sem escalation.

---

## GATILHOS

Escale quando:

- Decisão impacta mais de 1 squad ativo na mesma feature
- ADR proposta contradiz ADR existente com status `Aceito` ou `Ativo`
- Decisão técnica requer aprovação de stakeholder externo (CEO, CTO, cliente)
- Decisão com risco de negócio (mudança de modelo de preços, breaking change de API pública)

---

## PROTOCOLO

### 1. Criar registro da decisão

Use `[DECISÃO PENDENTE]` com id sequencial global: `[DECISÃO PENDENTE] {feature-slug}-{N}`.

Registre em `docs/.squads/sessions/{feature-slug}/open-decisions.md`:

```markdown
## [DECISÃO PENDENTE] {feature-slug}-{N} — {YYYY-MM-DD}

Contexto: {por que essa decisão é necessária}
Opções:
  A) {opção A} — {prós/contras}
  B) {opção B} — {prós/contras}
Recomendação: {opção e justificativa}

requires_escalation: true
escalation_owner: {A DEFINIR — preencha com o responsável}
default_decision: {opção recomendada — usada se squad continuar sem resolução explícita}
status: pending
```

### 2. Apresentar ao usuário

```
AskUserQuestion({
  question: "Escalation necessária para continuar.\nDecisão: {feature-slug}-{N}\n\n{descrição curta da decisão}\n\nO que você quer fazer?",
  options: [
    { label: "✍️ Resolver agora", description: "Escolher opção A ou B e continuar" },
    { label: "▶️ Usar decisão padrão", description: "{default_decision} — registrado como pendente de validação" },
    { label: "⏸ Bloquear squad", description: "Pausar até resolver com stakeholder" }
  ]
})
```

### 3. Tratar resposta

**Resolver agora:**
- Apresente as opções A/B, registre a escolha
- Marque `status: resolved`
- Continue o pipeline sem bloquear

**Usar decisão padrão:**
- Registre `resolved_with: default`
- Marque `status: resolved`
- Continue o pipeline
- Log: `⚡ [ESCALATION] Continuando com decisão padrão: {default_decision}`

**Bloquear squad:**
- Marque `status: blocked` no squad
- Informe:
```
⏸ SQUAD BLOQUEADO — Escalation necessária

Decisão pendente: {feature-slug}-{N}
Arquivo: docs/.squads/sessions/{feature-slug}/open-decisions.md

Preencha `escalation_owner` e resolva a decisão.
Retome com /init → selecionar squad → "Retomar de onde parou".
```

---

## RETOMADA DE SQUAD BLOQUEADO

Quando o usuário retoma um squad com `status: blocked`:

1. Verifique `open-decisions.md`
2. Liste decisões com `status: pending`
3. Para cada uma: use o AskUserQuestion acima (Resolver agora / Usar padrão / Manter bloqueado)
4. Ao resolver: atualize `status: resolved` + registre a decisão tomada
5. Mude squad para `status: running` e retome
