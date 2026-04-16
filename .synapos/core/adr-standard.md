---
name: synapos-adr-standard
description: Padrão de ADR com frontmatter domain — necessário para filtragem por domínio no pipeline-runner
---

# PADRÃO DE ADR (Architecture Decision Record)

> O Synapos filtra ADRs por domínio antes de injetá-los nos steps.
> Para que a filtragem funcione, todo ADR deve ter frontmatter com o campo `domain`.
> ADRs sem `domain` são tratados como `domain: ["*"]` — injetados em todos os squads.

---

## Template de ADR

```markdown
---
id: adr-{NNN}
title: "{Título descritivo da decisão}"
domain: [backend, frontend, auth, infra, data, mobile, produto]   ← lista dos domínios relevantes
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
supersedes: adr-{NNN}   ← opcional
---

# ADR-{NNN}: {Título}

## Status

{proposed | accepted | deprecated | superseded}

## Contexto

{Descreva o problema ou situação que motivou esta decisão.
O que está acontecendo? Quais são as forças em jogo?}

## Decisão

{Descreva a decisão tomada, de forma ativa: "Decidimos usar X porque..."}

## Consequências

**Positivas:**
- {consequência positiva}

**Negativas / Trade-offs:**
- {trade-off conhecido}

## Alternativas Consideradas

- {alternativa A} — descartada porque {motivo}
- {alternativa B} — descartada porque {motivo}
```

---

## Valores válidos para `domain`

| Valor | Quando usar |
|---|---|
| `backend` | Decisões de API, banco de dados, serviços, autenticação server-side |
| `frontend` | Decisões de UI, componentes, estado, roteamento client-side |
| `fullstack` | Decisões que afetam front e back igualmente |
| `mobile` | Decisões específicas de apps iOS/Android |
| `infra` | Decisões de deploy, CI/CD, infraestrutura, cloud |
| `data` | Decisões de modelagem de dados, pipelines, analytics |
| `produto` | Decisões de produto, fluxos de usuário, regras de negócio |
| `auth` | Decisões de autenticação e autorização (cross-domain) |
| `*` | Aplica a todos os domínios — use com moderação |

---

## Exemplos

### ADR backend + auth
```yaml
---
id: adr-007
title: "Usar JWT stateless para autenticação de API"
domain: [backend, auth]
status: accepted
date: 2026-04-10
---
```

### ADR de infraestrutura
```yaml
---
id: adr-012
title: "Deploy via GitHub Actions com staging obrigatório"
domain: [infra]
status: accepted
date: 2026-03-15
---
```

### ADR universal (todos os squads devem conhecer)
```yaml
---
id: adr-001
title: "Idioma padrão de código é inglês, comentários em pt-BR"
domain: ["*"]
status: accepted
date: 2026-01-01
---
```

---

## Migração de ADRs existentes sem frontmatter

ADRs existentes sem frontmatter `domain` continuam funcionando:
- O pipeline-runner os trata como `domain: ["*"]`
- São injetados em todos os squads em modo `complete`
- Recomendado: adicionar frontmatter gradualmente conforme os ADRs forem revisitados

### Localização esperada

```
docs/
└── adrs/
    ├── adr-001-idioma-padrao.md
    ├── adr-007-autenticacao-jwt.md
    └── adr-012-deploy-pipeline.md
```

O pipeline-runner detecta ADRs por nome de arquivo contendo `ADR`, `adr`, `decisions` ou `architecture-decision`, ou por qualquer arquivo `.md` dentro de `docs/adrs/`.
