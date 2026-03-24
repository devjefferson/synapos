---
id: api-design
version: "1.0.0"
domain: [backend, fullstack]
whenToUse: "Quando o squad projeta ou documenta APIs REST ou GraphQL"
---

# Design de API

> Convenções para criar APIs REST e GraphQL consistentes, versionadas e fáceis de consumir.

---

## REST

### Nomenclatura de Recursos

Use **substantivos no plural** para recursos, nunca verbos:

```
✅ GET  /users
✅ GET  /users/:id
✅ POST /users
✅ PUT  /users/:id
✅ DELETE /users/:id

❌ GET  /getUser
❌ POST /createUser
❌ DELETE /deleteUser/:id
```

### Hierarquia de Recursos

```
GET  /projects/:id/tasks          → lista tasks de um projeto
POST /projects/:id/tasks          → cria task no projeto
GET  /projects/:id/tasks/:taskId  → detalhe de task específica
```

Evite hierarquias com mais de 2 níveis — sinalize com `?filter=` ou recurso separado.

### Métodos HTTP

| Método | Uso | Idempotente? | Body? |
|--------|-----|-------------|-------|
| GET | Leitura | ✅ | ❌ |
| POST | Criação | ❌ | ✅ |
| PUT | Substituição total | ✅ | ✅ |
| PATCH | Atualização parcial | ✅ | ✅ |
| DELETE | Remoção | ✅ | ❌ |

---

## Códigos de Status HTTP

### Sucesso (2xx)
| Status | Quando usar |
|--------|-------------|
| `200 OK` | GET, PUT, PATCH bem-sucedidos |
| `201 Created` | POST que cria recurso — inclua `Location` header |
| `204 No Content` | DELETE bem-sucedido, PATCH sem corpo de resposta |

### Erro do cliente (4xx)
| Status | Quando usar |
|--------|-------------|
| `400 Bad Request` | Dados inválidos, validação falhou |
| `401 Unauthorized` | Não autenticado — token ausente ou inválido |
| `403 Forbidden` | Autenticado mas sem permissão |
| `404 Not Found` | Recurso não existe |
| `409 Conflict` | Conflito de estado — ex: email já cadastrado |
| `422 Unprocessable Entity` | Sintaxe válida mas semanticamente incorreto |
| `429 Too Many Requests` | Rate limit atingido |

### Erro do servidor (5xx)
| Status | Quando usar |
|--------|-------------|
| `500 Internal Server Error` | Erro inesperado no servidor |
| `503 Service Unavailable` | Serviço temporariamente indisponível |

---

## Formato de Resposta

### Sucesso — lista
```json
{
  "data": [
    { "id": "uuid", "name": "Ana", "email": "ana@example.com" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 143,
    "totalPages": 8
  }
}
```

### Sucesso — item único
```json
{
  "data": {
    "id": "uuid",
    "name": "Ana",
    "email": "ana@example.com",
    "createdAt": "2026-03-23T10:00:00Z"
  }
}
```

### Erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "email", "message": "Email inválido" },
      { "field": "name", "message": "Nome é obrigatório" }
    ]
  }
}
```

### Convenções de campos
- Datas: **ISO 8601** (`2026-03-23T10:00:00Z`)
- IDs: **UUID v4** (evite IDs numéricos sequenciais expostos)
- Campos monetários: **inteiro em centavos** (`1999` = R$ 19,99)
- Case: **camelCase** para JSON

---

## Paginação

### Offset-based (padrão)
```
GET /users?page=2&pageSize=20
```

Resposta inclui `pagination.total` para calcular páginas.

### Cursor-based (grandes volumes, feeds em tempo real)
```
GET /notifications?cursor=eyJpZCI6MTIzfQ&limit=20
```

Resposta inclui `nextCursor` (null quando última página).

### Quando usar cada um
| Situação | Tipo |
|----------|------|
| Tabelas admin, relatórios | Offset |
| Feeds, timelines, grande volume | Cursor |
| Itens que mudam frequentemente | Cursor |

---

## Filtros e Ordenação

```
GET /users?role=admin&status=active
GET /users?sort=createdAt&order=desc
GET /users?search=ana
GET /products?minPrice=100&maxPrice=500
```

---

## Versionamento

### Estratégia recomendada: URL path

```
/api/v1/users
/api/v2/users
```

### Regras
- Versão **MAJOR** na URL apenas quando há breaking change
- Mantenha v-anterior ativa por pelo menos **6 meses** após lançamento da nova
- Documente o que mudou entre versões
- Comunique deprecation via header: `Deprecation: 2026-09-23`

### Breaking changes (exigem nova versão)
- Remoção de campo obrigatório
- Mudança de tipo de campo
- Remoção de endpoint
- Mudança de comportamento de autenticação

### Non-breaking changes (não exigem nova versão)
- Adicionar campo opcional à resposta
- Adicionar novo endpoint
- Adicionar novo parâmetro de filtro opcional

---

## GraphQL

### Convenções de Schema

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  createdAt: DateTime!
  posts: [Post!]!
}

enum UserRole {
  ADMIN
  MEMBER
  VIEWER
}

type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
}
```

### Padrões obrigatórios
- Use **Input types** para mutations (não argumentos avulsos)
- Use **Payload types** para retorno de mutations (permite adicionar campos sem breaking change)
- Use **Connection pattern** para listas paginadas
- Nunca exponha campos de senha ou dados sensíveis no schema

### Erros em GraphQL
```json
{
  "errors": [
    {
      "message": "Email já cadastrado",
      "extensions": {
        "code": "EMAIL_ALREADY_EXISTS",
        "field": "email"
      }
    }
  ],
  "data": null
}
```

### N+1 em GraphQL
- Use **DataLoader** para batch de queries relacionadas
- Implemente **query depth limiting** (máx 5–7 níveis)
- Monitore queries lentas com APM

---

## Segurança

- **Sempre use HTTPS** — sem exceções
- **Autentique todos os endpoints** exceto os explicitamente públicos
- **Rate limiting**: 100 req/min para usuários autenticados, 20 req/min para anônimos
- **Valide e sanitize** todos os inputs no servidor
- **Não exponha stack traces** em respostas de erro em produção
- **Versione segredos** fora do código (env vars / secret manager)

---

## Documentação

- Use **OpenAPI 3.x** para documentar REST
- Inclua exemplos reais de request e response
- Documente todos os códigos de erro possíveis
- Mantenha docs atualizadas junto com o código (code-first ou schema-first)
- Ferramentas: Swagger UI, Redoc, Scalar
