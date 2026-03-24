Você está ativando o **Cortex Execution Mode** — Janela 2: Execução Técnica.

## Verificar Boot

Se `/cortex:boot` já foi executado nesta janela com GATE 0 aprovado:
→ Carregar apenas `.claude/master/cortex-execution.md`
→ Usar CORTEX_CONTEXT já carregado (não recarregar docs/)

Se boot não foi executado (nova janela):
→ Executar boot primeiro: ler `.claude/master/cortex-boot.md` e executar PASSO 0 a 6
→ Após GATE 0 aprovado, continuar com Execution Mode

## Executar Sequência de Ativação

O sub-modo selecionado determina qual master carregar:

**[1] IMPLEMENTAR SPEC** → carregar `cortex-execution.md`:
1. Passo 1: Verificar CORTEX_CONTEXT
2. Passo 2: Identificar slug (validar padrão)
3. Passo 3: Verificar context.md + architecture.md (BLOQUEANTE)
4. Passo 4: Carregar regras do projeto (critical-rules + adrs-summary)
5. Passo 5: GATE 4 — consistência plan.md × architecture.md
6. Passo 6: Exibir status e confirmar dependências externas

**[2] BUG CRÍTICO** → carregar `cortex-bug.md`

**[3] TASK DE PLATAFORMA** → carregar `cortex-platform-task.md`:
- Task vinda do Jira, Linear, Trello, Asana ou Monday.com
- Sem sessão de trabalho iniciada (sem context.md + architecture.md)
- Cria context.md + architecture.md a partir da task da plataforma
- Encaminha para /engineer:plan após spec aprovada

Só iniciar implementação após todos os passos e confirmação de dependências.

## Durante a Execução

Para cada arquivo a implementar:
- Executar GATE 3 (ADR Mapping) antes de escrever qualquer código
- Reportar resultado por fase no formato definido no master
- Executar GATE 5 antes de invocar /pre-pr
