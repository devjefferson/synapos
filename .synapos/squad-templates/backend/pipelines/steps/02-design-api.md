---
id: 02-design-api
name: "Design do Contrato da API"
agent: bruno-base
execution: subagent
model_tier: powerful
output_files:
  - api-contract.md
veto_conditions:
  - "Endpoint sem todos os status codes documentados"
  - "Request/Response sem schema tipado"
  - "Decisão arquitetural sem ADR"
---

# Design do Contrato da API

Você é **Bruno Base**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Task desta sessão: `_memory/memories.md`
- Objetivo do squad: `squad.yaml → description`
- Memória do squad: `_memory/memories.md` — padrões e ADRs anteriores
- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← leia antes de qualquer decisão
- **ADRs existentes:** `docs/tech-context/briefing/adrs-summary.md` ← verifique conflitos com decisões anteriores

## Sua missão

Definir o contrato completo da API antes de qualquer implementação.
O contrato é a lei — o dev implementa exatamente o que está aqui.

## Documento a gerar

### `docs/api-contract.md`

```markdown
# Contrato da API: {nome da feature/recurso}

**Data:** {YYYY-MM-DD}
**Agent:** Bruno Base

## Entendimento da Task
{o que precisa ser construído em 2-3 frases — regra de negócio incluída}

## Endpoints

### {MÉTODO} {/v1/recurso/:id}

**Descrição:** {o que faz}
**Autenticação:** {requerida | pública} — {tipo: JWT Bearer | API Key}
**Rate Limit:** {X req/min por IP | por usuário} *(se aplicável)*

**Request:**
```typescript
// Headers
Authorization: Bearer {token}  // se autenticado
Content-Type: application/json

// Path params
id: string  // UUID

// Query params (se GET)
page?: number  // default: 1
limit?: number  // default: 20, max: 100

// Body (se POST/PUT/PATCH)
{
  campo: tipo  // descrição
}
```

**Responses:**
```typescript
// 200 OK / 201 Created
{
  data: {
    id: string
    // demais campos
  },
  meta?: { page: number, total: number }  // para listagens
}

// 400 Bad Request — input inválido
{ error: { code: "VALIDATION_ERROR", fields: { campo: "mensagem" } } }

// 401 Unauthorized — sem token ou token inválido
{ error: { code: "UNAUTHORIZED" } }

// 403 Forbidden — token válido mas sem permissão
{ error: { code: "FORBIDDEN" } }

// 404 Not Found — recurso não existe OU não pertence ao usuário
{ error: { code: "NOT_FOUND" } }

// 409 Conflict — duplicata ou estado inválido
{ error: { code: "{CÓDIGO_ESPECÍFICO}" } }

// 422 Unprocessable — regra de negócio violada
{ error: { code: "{CÓDIGO_ESPECÍFICO}", message: "..." } }

// 500 Internal Server Error — erro inesperado
{ error: { code: "INTERNAL_ERROR" } }
```

**Exemplos:**
```bash
# Request
curl -X POST /v1/users \
  -H "Authorization: Bearer {token}" \
  -d '{"name": "João", "email": "joao@ex.com"}'

# Response 201
{"data": {"id": "uuid", "name": "João", "email": "joao@ex.com", "createdAt": "2025-01-01T00:00:00Z"}}
```

---

## Estrutura de Camadas

```
src/
├── domain/{recurso}/
│   ├── {Entidade}.ts           → entidade de domínio
│   ├── {Entidade}Repository.ts → interface do repositório
│   └── {recurso}.errors.ts     → erros de domínio tipados
├── application/{feature}/
│   └── {CasoDeUso}.ts          → orquestração
├── infrastructure/
│   └── database/
│       └── {Entidade}PgRepository.ts  → implementação PostgreSQL
└── presentation/{recurso}/
    ├── {Recurso}Controller.ts   → validação de input + delegação
    ├── {Recurso}Schema.ts       → schema Zod de validação
    └── {Recurso}Serializer.ts   → formatação do response
```

## ADR (se houver decisão relevante)

### ADR-{N}: {título}
**Contexto:** {por que essa decisão}
**Decisão:** {o que foi escolhido}
**Alternativas rejeitadas:** {opção} — {motivo}
**Consequências:** ✅ {positivo} / ⚠ {trade-off}

## Pontos de Atenção para Implementação
{alertas, edge cases, integrações, consistência com outros endpoints}
```

## Critérios de qualidade

- [ ] Todos os endpoints com todos os status codes de erro documentados
- [ ] Request e Response tipados
- [ ] Estrutura de camadas definida
- [ ] Erros de domínio com código semântico (não só HTTP status)
- [ ] ADR para qualquer decisão arquitetural não óbvia
