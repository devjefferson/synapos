Você está ativando o **Cortex Strategy Mode** — Janela 1: Captação & Planejamento.

## Verificar Boot

Se `/cortex:boot` já foi executado nesta janela com GATE 0 aprovado:
→ Carregar apenas `.claude/master/cortex-strategy.md`
→ Usar CORTEX_CONTEXT já carregado (não recarregar docs/)

Se boot não foi executado:
→ Informar: "Execute /cortex:boot primeiro para carregar o contexto do projeto."
→ Não prosseguir.

## Executar Strategy

Após carregar o master, executar o fluxo definido em `cortex-strategy.md`:

1. Fase 0: Warm-up Mini (verificar CORTEX_CONTEXT e sessions)
2. Fase 1: Validar Slug
3. Fase 2: Brainstorm e Exploração
4. Fase 3: Validação contra docs/
5. Fase 4: Spec e Arquitetura (context.md + architecture.md)
6. Fase 5: GATE 2 — verificar completude antes de declarar spec fechada

Só declarar handoff para Execution após GATE 2 aprovado.
