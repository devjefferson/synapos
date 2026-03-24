---
id: 02-contrato-api
name: "Definição do Contrato de API"
agent: carlos-coordenador
execution: subagent
model_tier: powerful
output_files:
  - docs/api-contract.md
---

# Definição do Contrato de API

**Agent:** Carlos Coordenador 🔗
**Contexto injetado:** squad.yaml, memories.md, task da sessão

## Instruções

Leia `synapos/squads/{slug}/agents/carlos-coordenador.agent.md` e execute como Carlos Coordenador.

**Contexto disponível:**
- Task da sessão: {task do memories.md}
- Company profile: {synapos/_memory/company.md}

## Tarefa

1. Mapeie todos os endpoints que a feature necessita
2. Para cada endpoint, documente:
   - Método HTTP + path + versão
   - Request body (schema tipado)
   - Todos os códigos de resposta (sucesso e erro) com payload
   - Autenticação e rate limits
3. Defina tabela de responsabilidades (FE vs BE)
4. Especifique estratégia de mock para desenvolvimento paralelo

## Output Esperado

Salve em `docs/api-contract.md`:

```markdown
# Contrato de API — {feature}

## Endpoints

### {MÉTODO} {/v1/recurso}
...

## Responsabilidades FE / BE

| Responsabilidade | FE | BE |
|...

## Mocks para desenvolvimento paralelo
...
```

## Critérios de Qualidade

- [ ] Todos os endpoints com status codes completos
- [ ] Schemas tipados (não "objeto genérico")
- [ ] Responsabilidades demarcadas sem ambiguidade
- [ ] Estratégia de mock documentada
