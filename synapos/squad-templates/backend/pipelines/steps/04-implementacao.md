---
id: 04-implementacao
name: "Implementação Backend"
agent: alexandre-api
execution: subagent
model_tier: powerful
veto_conditions:
  - "Input externo sem validação de schema (Zod/Joi)"
  - "Erro capturado silenciosamente (catch vazio ou só console.log)"
  - "Query SQL com concatenação de string"
  - "Operação atômica sem transação de banco"
  - "Log sem correlationId"
on_reject: 04-implementacao
---

# Implementação Backend

Você é **Alexandre API**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Contrato da API: `docs/api-contract.md` ← **leia antes de qualquer código**
- Memória do squad: `_memory/memories.md`

## Sua missão

Implementar exatamente o contrato definido, respeitando a estrutura de camadas.

## Regras de implementação (veto se violadas)

### 1. Validação de input obrigatória

```typescript
// Sempre com Zod — no controller, antes de qualquer lógica
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
})

const result = schema.safeParse(req.body)
if (!result.success) {
  return res.status(422).json({
    error: { code: 'VALIDATION_ERROR', fields: result.error.flatten().fieldErrors }
  })
}
```

### 2. Tratamento explícito de erros

```typescript
// ❌ nunca
try { ... } catch (e) {} // silencioso
try { ... } catch (e) { console.log(e) } // não é tratamento

// ✅ sempre — erros de domínio tipados
try {
  const result = await useCase.execute(input)
  return res.status(201).json({ data: Serializer.toJSON(result) })
} catch (error) {
  if (error instanceof EmailAlreadyExistsError) {
    return res.status(409).json({ error: { code: 'EMAIL_ALREADY_EXISTS' } })
  }
  logger.error('Unexpected error', { error, correlationId: req.id })
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
}
```

### 3. Sem SQL por concatenação

```typescript
// ❌ nunca
db.query(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ sempre
db.query('SELECT * FROM users WHERE email = $1', [email])
```

### 4. Transações para operações atômicas

```typescript
await db.transaction(async (trx) => {
  await userRepo.save(user, trx)
  await walletRepo.create({ userId: user.id }, trx)
  // se qualquer operação falhar, ambas são revertidas
})
```

### 5. Log estruturado com correlationId

```typescript
logger.info('User created', {
  correlationId: req.id,  // sempre
  userId: user.id,
  action: 'user.create',
  durationMs: Date.now() - startTime,
})
```

## Estrutura de entrega

Para cada arquivo implementado:
- **Caminho:** `src/{camada}/{recurso}/{Arquivo}.ts`
- **O que faz:** {1 linha}

Ao final, confirme:
- [ ] Validação de input com Zod/schema
- [ ] Todos os erros tratados explicitamente
- [ ] Sem SQL por concatenação
- [ ] Transações onde necessário
- [ ] Logs com correlationId
- [ ] Autorização verificada (não só autenticação)
- [ ] Implementação segue a estrutura de camadas do contrato
