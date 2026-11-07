# Índice de documentação (MAP)

> Comece aqui. Descubra o que existe e onde, leia só o necessário, aprofunde só se precisar. Não carregue documento inteiro só para achar uma informação.

## MAP → READ → FULL

| Preciso de… | READ (1 arquivo) | FULL (sob demanda) |
|---|---|---|
| Rodar o framework / protocolo do orquestrador | `.synapos/core/orchestrator.md` | `pipeline-runner.md`, `gate-system.md` |
| Regras de contexto e memória | `.synapos/core/context-engine.md` | `architecture/memory.md` (o porquê) |
| Regras de conformidade e ADR | `.synapos/core/compliance-protocol.md` | `adr-standard.md` |
| Escolher/usar skills | `.synapos/core/skills-engine.md` | `architecture/skills.md` |
| Fluxo de produto | `architecture/product-workflow.md` | `.synapos/squad-templates/produto/` |
| Hooks do Claude Code | `architecture/hooks.md` | `.synapos/hooks/claude/` |
| Comportamento de roles | `architecture/role-guidelines.md` | `.agent.md` do squad |
| Por que a v4 é assim | `architecture/v4-architecture-review.md` | `../CHANGELOG.md` |
| Começar a usar | `GETTING_STARTED.md` | `GUIDE.md` |

## Classes de documento

- **Operacional** (o agente executa): `.synapos/core/**`, steps e agents dos squads. Fonte de verdade das regras.
- **Referência** (explica, consulta sob demanda): `docs/architecture/**`, `GUIDE.md`. Não duplica regra — aponta para a spec operacional.
- **Histórico** (nunca carregar automaticamente): `docs/archive/**`, `CHANGELOG.md`.

Hierarquia em conflito: ADR vigente > regra explícita do projeto > docs oficiais > `docs/_memory/` > contexto da session > conhecimento geral.

## Documentation Review (ao criar ADR, mudar arquitetura, fechar feature ou mudar skill)

- [ ] Fonte de verdade identificada e única?
- [ ] Regra duplicada em outro arquivo? (aponte em vez de copiar)
- [ ] ADR aplicável respeitada?
- [ ] Referências/links ainda existem? (`npm test`)
- [ ] Algo ficou obsoleto? (mova para `docs/archive/`, não apague histórico)
- [ ] O agente precisa carregar isto? Se não, é referência/histórico.
- [ ] A mudança adiciona complexidade sem problema concreto? Reverta.
