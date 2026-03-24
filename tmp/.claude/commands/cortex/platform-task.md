Você está ativando o **Cortex Platform Task Mode** — Task de Plataforma Sem Spec.

Leia `.claude/master/cortex-platform-task.md` e execute a sequência definida nele.

**Regra anti-redundância:** se Boot já foi executado nesta janela, o CORTEX_CONTEXT já está carregado — não recarregar docs/.

Após carregar o master, iniciar pelo PASSO 2 (detectar plataforma configurada em `.claude/.env`).
