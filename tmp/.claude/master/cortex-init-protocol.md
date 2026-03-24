# CORTEX INIT PROTOCOL — Referência Rápida de Gates

> Consulta rápida. **Fonte de verdade: os masters** (`cortex-boot.md`, `cortex-strategy.md`, `cortex-execution.md`).
> Em caso de conflito, os masters prevalecem.

---

## Mapa de Gates

| Gate | Quando executa | Master responsável | Ação se falhar |
|------|---------------|-------------------|----------------|
| **GATE 0** | Boot — antes de confirmar ativação | `cortex-boot.md` PASSO 2 | Executar `/engineer:discover` |
| **GATE 1** | Strategy — ao criar session | `cortex-strategy.md` Fase 1 | Rejeitar slug, pedir correto |
| **GATE 2** | Strategy — ao fechar spec | `cortex-strategy.md` Fase 5 | Completar campos faltantes |
| **GATE 3** | Execution — antes de cada arquivo | `cortex-execution.md` ADR-First | Não escrever código sem mapear |
| **GATE 4** | Execution — ao carregar plan.md | `cortex-execution.md` PASSO 5 | Recriar plan ou confirmar risco |
| **GATE 5** | Execution — antes de `/pre-pr` | `cortex-execution.md` GATE 5 | Completar fases pendentes |
| **GATE-M** | Modify — mapeamento de impacto | `cortex-modify.md` Fase 2 | Mapear antes de alterar |
| **GATE-B** | Bug — plano de fix mínimo | `cortex-bug.md` PASSO 3 | Root cause obrigatório |

---

## Princípio: Fail Loud, Never Silent

Nunca avançar com contexto incompleto. Se algo falta → PARAR, reportar, aguardar instrução.

---

## Referência de Erros Comuns

| Situação | Resposta ERRADA | Resposta CORRETA |
|----------|-----------------|------------------|
| ADR não lida | Assumir que sabe a regra | "Preciso ler adrs-summary.md antes de implementar" |
| context.md com seção vazia | Ignorar e continuar | "GATE 2 FALHOU — seção [X] está vazia" |
| docs/ não existe | Inventar stack do projeto | "docs/ não encontrado. Executar /engineer:discover" |
| architecture.md mais novo que plan.md | Usar plan.md como está | "Plan pode estar desatualizado. Verificar consistência" |
| Env var não documentada | Assumir valor padrão | "Dependência não confirmada: [VAR]. Confirmar antes de prosseguir" |
| Slug inválido | Aceitar e criar | "Slug não segue padrão. Formato: tipo-NNN-descricao" |
