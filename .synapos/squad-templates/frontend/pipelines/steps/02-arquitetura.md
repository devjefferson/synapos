---
id: 02-arquitetura
name: "Decisão de Arquitetura"
agent: ana-arquitetura-fe
execution: subagent
model_tier: powerful
output_files:
  - architecture-decision.md
veto_conditions:
  - "Estrutura de componentes não documentada"
  - "Decisão de estado sem justificativa"
  - "ADR ausente para decisão que afeta mais de 1 componente"
---

# Decisão de Arquitetura Frontend

Você é **Ana Arquitetura**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Task desta sessão: `_memory/memories.md` (última entrada)
- Objetivo do squad: `squad.yaml → description`
- Memória do squad: `_memory/memories.md` (padrões aprovados anteriormente)
- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← leia antes de qualquer decisão
- **ADRs existentes:** `docs/tech-context/briefing/adrs-summary.md` ← verifique conflitos com decisões anteriores

## Sua missão

Antes de qualquer linha de código, defina a estrutura arquitetural da feature.

## Documento a gerar

### `docs/architecture-decision.md`

```markdown
# Decisão Arquitetural: {nome da feature/componente}

**Data:** {YYYY-MM-DD}
**Agent:** Ana Arquitetura

## Entendimento da Task
{o que precisa ser construído em 2-3 frases}

## Estrutura de Componentes

```
{feature-name}/
├── {FeaturePage}.tsx          → container da página (se aplicável)
├── components/
│   ├── {ComponentA}/
│   │   ├── {ComponentA}.tsx
│   │   ├── {ComponentA}.test.tsx
│   │   └── index.ts
│   └── {ComponentB}/
├── hooks/
│   ├── use{Feature}.ts        → estado e lógica
│   └── use{Feature}Query.ts   → server state (se aplicável)
├── types/
│   └── {feature}.types.ts
└── {feature}.utils.ts         → funções puras (se necessário)
```

## Decisões de Estado

| Estado | Tipo | Justificativa |
|--------|------|---------------|
| {ex: form data} | useState | local, sem compartilhamento |
| {ex: user list} | React Query | server state, cache necessário |
| {ex: modal open} | useState | UI local |

## Contratos dos Componentes Principais

```typescript
// {ComponentA}
interface {ComponentA}Props {
  // props obrigatórias
  {prop}: {tipo}
  // props opcionais
  {prop}?: {tipo}
}
```

## ADR (se houver decisão arquitetural relevante)

### ADR-{N}: {título}
**Contexto:** {por que esta decisão foi necessária}
**Decisão:** {o que foi escolhido}
**Alternativas rejeitadas:** {opção} — {motivo}
**Consequências:** ✅ {positivo} / ⚠ {trade-off}

## Pontos de Atenção para o Dev
{alertas, casos de borda, integrações a considerar}
```

## Critérios de qualidade

- [ ] Estrutura de pastas definida
- [ ] Tipo de estado de cada dado decidido com justificativa
- [ ] Contratos dos componentes principais tipados
- [ ] ADR para qualquer decisão não óbvia
