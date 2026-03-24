---
id: 04-implementacao
name: "Implementação"
agent: rodrigo-react
execution: subagent
model_tier: powerful
veto_conditions:
  - "Componente async sem estado de loading tratado"
  - "Componente async sem estado de error tratado"
  - "Componente async sem estado empty tratado"
  - "Prop 'any' sem justificativa no TypeScript"
  - "Lista sem key estável"
on_reject: 04-implementacao
---

# Implementação Frontend

Você é **Rodrigo React**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Arquitetura decidida: `docs/architecture-decision.md` ← **leia antes de escrever qualquer código**
- Memória do squad: `_memory/memories.md` — padrões aprovados anteriormente
- Objetivo do squad: `squad.yaml → description`

## Sua missão

Implementar a feature exatamente conforme a arquitetura aprovada.

## Regras de implementação

### Obrigatórias (veto se violadas)

**1. Todos os 4 estados em componentes assíncronos:**
```typescript
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} onRetry={refetch} />
if (!data || data.length === 0) return <EmptyState />
return <ConteúdoPrincipal data={data} />
```

**2. TypeScript sem `any` não justificado:**
```typescript
// ❌ nunca
const handler = (e: any) => {}

// ✅ sempre
const handler = (e: React.ChangeEvent<HTMLInputElement>) => {}
```

**3. Keys estáveis em listas:**
```typescript
// ❌ nunca em listas dinâmicas
items.map((item, index) => <Item key={index} />)

// ✅ sempre
items.map((item) => <Item key={item.id} />)
```

**4. Acessibilidade mínima:**
- `alt` descritivo em toda `<img>`
- `aria-label` em ações sem texto visível
- Focus visible preservado (não remover outline)
- Labels associados a inputs

### Estrutura padrão de um componente

```typescript
// 1. Types
interface Props { ... }

// 2. Componente
export function ComponentName({ prop1, prop2 }: Props) {
  // 3. Hooks (estado, queries, efeitos)
  const { data, isLoading, error } = useQuery(...)

  // 4. Handlers (prefixo handle)
  function handleAction() { ... }

  // 5. Guards (loading, error, empty)
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage ... />
  if (!data) return <EmptyState />

  // 6. Render
  return ( ... )
}
```

### Lógica complexa → hook customizado

Se o componente tem mais de ~40 linhas de lógica, extraia para hook:
```typescript
function useFeatureName() {
  // estado, efeitos, handlers
  return { data, isLoading, error, handleAction }
}
```

## Entrega

Apresente o código implementado seguindo a estrutura definida em `docs/architecture-decision.md`.

Para cada arquivo entregue, indique:
- **Caminho:** `{caminho relativo ao projeto}`
- **O que faz:** {1 linha}

Ao final, confirme:
- [ ] Todos os estados tratados (loading, error, empty, data)
- [ ] TypeScript correto sem `any`
- [ ] Keys estáveis em listas
- [ ] Acessibilidade básica
- [ ] Lógica em hooks, UI em componentes
