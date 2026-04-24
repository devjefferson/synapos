---
id: 09-execucao
name: "Execução por Fases"
agent: leo-engenheiro
execution: inline
model_tier: powerful
gate: GATE-5
---

# Execução por Fases

## Contexto disponível
Você recebe automaticamente:
- `context.md` (aprovado)
- `architecture.md` (aprovado)
- `plan.md` (aprovado)

**Leia os três arquivos antes de qualquer ação.**

## 1. Identificar fase atual

Leia `plan.md` e identifique:
- Qual fase está marcada como `[Em Progresso ⏰]`
- Se nenhuma, qual é a primeira `[Não Iniciada ⏳]`

Apresente ao humano:

```
Fase atual: FASE X — [Nome]
Agents: [atribuídos]
Skill: [atribuída]
Estimativa: ~Xh

Tarefas desta fase:
1. [Tarefa 1.1]
2. [Tarefa 1.2]

ADRs aplicáveis:
- ADR-XXX: [como se aplica]

Como abordar:
[Plano detalhado para esta fase específica]

Pronto para iniciar?
- ✅ Iniciar fase
- ✏️ Ajustar abordagem antes de iniciar
```

## 2. Implementação Guiada por ADRs (Abordagem Proativa)

**Antes de escrever qualquer código na fase:**

1. Releia as ADRs aplicáveis da fase em `context.md` → seção "Regras Críticas"
2. Planeje a implementação explicitamente:

```
Fase X — Plano de implementação ADR-guiado:

ADRs aplicáveis:
- ADR-007: [regra] → Ação: [o que fazer]
- ADR-003: [regra] → Ação: [o que fazer]

Ordem de criação:
1. [arquivo/componente que é pré-requisito]
2. [arquivo/componente que depende do anterior]
3. [...]

Resultado esperado: Código conforme ADRs desde o início.
```

3. Execute na ordem planejada

## 3. Durante a implementação

- Use sub-agentes de construção quando disponíveis para preservar contexto
- Toda decisão fora do escopo do plan.md aprovado → `[DECISÃO PENDENTE]` obrigatório
- Nenhuma biblioteca, padrão ou estrutura nova sem `[DECISÃO PENDENTE]` resolvido

## 4. Ao concluir cada fase

**Pause. Não avance para a próxima fase sem aprovação explícita.**

Apresente ao humano:
```
✅ FASE X concluída — [Nome]

Arquivos criados/modificados:
  [lista]

Conformidade ADR:
  - ADR-XXX: ✅ Respeitada — [como]
  - ADR-YYY: ✅ Respeitada — [como]

Valide o código. Posso avançar para FASE X+1?

- ✅ Aprovar e avançar para FASE X+1
- ✏️ Ajustar — [informe o que corrigir]
```

## 5. Atualizar plan.md ao concluir cada fase

Marque a fase como `[Completada ✅]` e adicione à seção `### Comentários`:

```markdown
### Comentários:
#### Conformidade com ADRs (Abordagem Proativa)
- ✅ ADRs consultadas ANTES da implementação
- ✅ Código criado seguindo regras desde o início
- Regras aplicadas: ADR-XXX → [como], ADR-YYY → [como]

#### Decisões tomadas durante a fase
[Listar qualquer [DECISÃO PENDENTE] que foi resolvido e como]
```
