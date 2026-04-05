# Synapos — Getting Started

> Guia rápido para começar a usar o Synapos.

---

## Começo em 3 interações

### Primeiro uso (sem nada configurado)

```
/init
→ "Meu SaaS — corrigir bug no login"   ← nome do projeto + o que quer fazer
→ Escolha o role: backend               ← inferido automaticamente ou você escolhe
→ Pipeline roda
```

Pronto. O Synapos configura o ambiente, cria a session e executa.

### Retorno (projeto já configurado)

```
/init
→ Escolha o role ativo ou crie novo
→ Pipeline roda
```

Uma interação.

---

## Qual modo escolher

| Situação | Modo |
|----------|------|
| Bug fix, ajuste, quick change | ⚡ **Rápido** — inferido automaticamente |
| Feature nova, refactor, arquitetura | 🔵 **Completo** — injeta docs/ e ADRs |
| Dúvida | Rápido — você pode reexecutar em Completo depois |

O modo é inferido pela mensagem. Se não der para inferir, o Synapos pergunta uma vez.

---

## Qual role escolher

| Você quer... | Role |
|---|---|
| API, endpoint, banco | `backend` |
| Componente, tela, UI | `frontend` |
| Feature que cruza FE + BE | `fullstack` |
| App iOS/Android | `mobile` |
| Infra, CI/CD, deploy | `devops` |
| Spec, discovery, produto | `produto` |
| ML, dados, pipeline | `ia-dados` |

O role também é inferido da mensagem quando possível.

---

## Cenários comuns

### Tenho um projeto existente

```
1. /init → onboarding (1 pergunta: nome + o que quer fazer)
2. /setup:build-tech  → gera docs/tech/ a partir do código
3. /setup:build-business → gera docs/business/ (opcional, mas melhora muito)
4. /init → escolha o role → Modo Completo
```

### Estou começando do zero

```
1. /init → onboarding
2. /setup:build-business → visão, personas, OKRs
3. /setup:build-tech → stack, arquitetura inicial
4. /init → role produto → pipeline discovery-spec-handoff
5. /init → role backend ou frontend → implementação
```

### Tenho uma task no backlog

```
/init → role → ⚡ Rápido → quick-fix
```

### Sou dev solo sem documentação

```
/init → "nome do projeto — o que quer fazer" → ⚡ Rápido → executa
```
Sem documentação, sem bloqueio — contexto mínimo.

---

## Sessions: o que persiste

Cada feature cria uma pasta que sobrevive entre conversas:

```
docs/.squads/sessions/{feature}/
├── context.md     ← O que é, por que existe, decisões, o que não fazer
├── memories.md    ← Aprendizados acumulados
├── architecture.md
└── plan.md
```

Para navegar sessions sem abrir o `/init`:

```
/session                  → lista todas as features ativas
/session auth-module      → abre o contexto de uma feature
/session consolidate      → compacta memories quando crescer demais
```

---

## GATE-0 bloqueou — o que fazer

GATE-0 verifica se os arquivos core do framework existem. Se bloqueou:

| Arquivo faltando | Como resolver |
|-----------------|---------------|
| `docs/_memory/company.md` | `/init` cria automaticamente no onboarding |
| Arquivos core do `.synapos/` | Reinstale: `npx synapos add backend` |

No Modo Rápido, GATE-0 passa com aviso — nunca bloqueia por falta de docs.

---

## Referências

- [GUIDE.md](GUIDE.md) — referência completa
- [orchestrator.md](../.synapos/core/orchestrator.md) — fluxo de init
- [gate-system.md](../.synapos/core/gate-system.md) — gates disponíveis
- [pipeline-runner.md](../.synapos/core/pipeline-runner.md) — execução de pipelines
