---
id: testing-strategy
version: "1.0.0"
domain: [frontend, backend, fullstack, mobile]
whenToUse: "Quando o squad escreve ou define estratégia de testes"
---

# Estratégia de Testes

> Referência para definir cobertura, pirâmide de testes e abordagem por domínio.

---

## Pirâmide de Testes

```
        /\
       /  \
      / E2E \          ← Poucos, lentos, caros — validam fluxos críticos
     /────────\
    /Integration\      ← Médio volume — validam contratos e integrações reais
   /──────────────\
  /   Unit Tests   \   ← Muitos, rápidos, baratos — validam lógica isolada
 /──────────────────\
```

### Distribuição recomendada

| Nível | % do total | Foco |
|-------|-----------|------|
| Unit | 70% | Lógica pura, transformações, validações |
| Integration | 20% | Módulos integrados, banco de dados real, APIs internas |
| E2E | 10% | Fluxos críticos de negócio (login, checkout, onboarding) |

---

## Testes Unitários

### Quando usar
- Funções puras com lógica complexa
- Transformações e cálculos
- Validações de domínio
- Componentes de UI isolados (comportamento, não visual)

### Princípios
- Um teste = um comportamento
- Nomes descritivos: `deve retornar erro quando email é inválido`
- Estrutura **AAA**: Arrange → Act → Assert
- Sem dependências externas (use mocks para I/O)

### Exemplo (TypeScript / Vitest)
```typescript
describe('calcularDesconto', () => {
  it('deve aplicar 10% para compras acima de R$100', () => {
    // Arrange
    const valor = 150

    // Act
    const resultado = calcularDesconto(valor)

    // Assert
    expect(resultado).toBe(135)
  })

  it('deve retornar valor original para compras abaixo de R$100', () => {
    expect(calcularDesconto(80)).toBe(80)
  })
})
```

---

## Testes de Integração

### Quando usar
- Endpoints de API (request → response completo)
- Queries ao banco de dados
- Integrações com serviços externos (mockados ou reais em ambiente de teste)
- Fluxos entre módulos do sistema

### Princípios
- Use banco de dados real em ambiente de teste (não mocks de DB)
- Isole o estado entre testes (truncate tables, transactions rollback)
- Teste o contrato (status code, formato da resposta, efeitos colaterais)

### Exemplo (supertest / Node.js)
```typescript
describe('POST /api/users', () => {
  it('deve criar usuário e retornar 201 com id', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Ana', email: 'ana@test.com' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Ana',
      email: 'ana@test.com',
    })
  })

  it('deve retornar 400 quando email já existe', async () => {
    await createUser({ email: 'ana@test.com' })

    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Ana 2', email: 'ana@test.com' })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/email já cadastrado/i)
  })
})
```

---

## Testes de Contrato

> Garantem que produtor e consumidor de uma API concordam com o formato dos dados.

### Quando usar
- APIs consumidas por múltiplos clientes (mobile + web + parceiros)
- Microsserviços com contratos inter-serviço
- Quando mudanças de API têm alto impacto

### Ferramentas
- **Pact** — consumer-driven contract testing
- **OpenAPI + spectral** — validação de schema estático
- **Zod / io-ts** — validação de schema em runtime

### Estratégia mínima
1. Documente o contrato esperado (OpenAPI / JSON Schema)
2. Valide o contrato nos testes de integração
3. Versione o contrato junto com o código

---

## Testes E2E

### Quando usar
- Fluxos críticos de negócio (autenticação, pagamento, onboarding)
- Regressões de alto impacto
- Smoke tests em produção

### Princípios
- Teste comportamento do usuário, não implementação
- Use seletores semânticos (`getByRole`, `getByLabel`), nunca classes CSS
- Cada teste deve ser independente (sem compartilhar estado)
- Mantenha suíte pequena — E2E lento desincentiva uso

### Ferramentas
- **Playwright** — browser automation (recomendado)
- **Cypress** — alternativa popular para web
- **Detox** — testes E2E mobile (React Native)

---

## Cobertura de Código

### Metas por tipo de projeto

| Tipo | Cobertura mínima | Foco |
|------|-----------------|------|
| Biblioteca / SDK | 90%+ | Toda a superfície pública |
| API crítica (pagamentos, auth) | 85%+ | Caminho feliz + erros |
| Feature de produto | 70%+ | Lógica de negócio |
| Prototipagem / PoC | Sem meta | Valor sobre cobertura |

### Importante
- Cobertura alta ≠ qualidade de teste
- 80% com testes que validam comportamento real > 100% com testes triviais
- Foque em cobertura de **branches**, não só de linhas

---

## Testes de Frontend

### Componentes React (Testing Library)
```typescript
it('deve exibir mensagem de erro quando formulário é submetido vazio', async () => {
  render(<LoginForm />)

  await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

  expect(screen.getByText(/email obrigatório/i)).toBeInTheDocument()
})
```

### Princípios
- Teste comportamento visível ao usuário, não detalhes de implementação
- Evite testar state interno do componente
- Use `userEvent` em vez de `fireEvent` (mais realista)
- Não teste implementação de bibliotecas de terceiros

---

## O que NÃO testar

- Configuração de bibliotecas externas
- Código gerado automaticamente
- Simples getters/setters sem lógica
- Detalhes de implementação que podem mudar

---

## Ferramentas por Stack

| Stack | Unit | Integration | E2E |
|-------|------|-------------|-----|
| Node.js / TypeScript | Vitest / Jest | Supertest + Vitest | Playwright |
| React | Vitest + Testing Library | — | Playwright |
| React Native | Jest + RNTL | — | Detox |
| Python | pytest | pytest + SQLAlchemy | — |
