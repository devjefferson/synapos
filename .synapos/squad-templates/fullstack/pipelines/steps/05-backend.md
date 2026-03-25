---
id: 05-backend
name: "Implementação Backend"
agent: alexandre-api
execution: subagent
model_tier: powerful
---

# Implementação Backend

**Agent:** Alexandre API ⚙️
**Contexto injetado:** squad.yaml, api-contract.md, memories.md

## Instruções

Leia `.synapos/squads/{slug}/agents/alexandre-api.agent.md` e execute como Alexandre API.

**Contexto disponível:**
- Contrato de API: `docs/api-contract.md`
- Task da sessão: {task do memories.md}
- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← aplique todas as regras durante a implementação

## Tarefa

1. Implemente os endpoints exatamente como definidos no contrato
2. Valide todos os inputs com schema (Zod ou Joi)
3. Trate todos os casos de erro documentados no contrato
4. Adicione log estruturado com correlationId

## Critérios de Qualidade

- [ ] Endpoint segue exatamente o contrato aprovado (path, método, response)
- [ ] Validação de schema em todos os inputs externos
- [ ] Todos os erros documentados no contrato implementados
- [ ] Log estruturado com correlationId
- [ ] Sem secret ou informação sensível no código
