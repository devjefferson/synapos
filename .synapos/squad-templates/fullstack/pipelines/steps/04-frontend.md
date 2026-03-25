---
id: 04-frontend
name: "Implementação Frontend"
agent: rodrigo-react
execution: subagent
model_tier: powerful
---

# Implementação Frontend

**Agent:** Rodrigo React ⚛️
**Contexto injetado:** squad.yaml, api-contract.md, memories.md

## Instruções

Leia `.synapos/squads/{slug}/agents/rodrigo-react.agent.md` e execute como Rodrigo React.

**Contexto disponível:**
- Contrato de API: `docs/api-contract.md`
- Task da sessão: {task do memories.md}
- **Regras críticas do projeto:** `docs/tech-context/briefing/critical-rules.md` ← aplique todas as regras durante a implementação

## Tarefa

1. Implemente os componentes e páginas seguindo o contrato de API
2. Use mock do contrato enquanto o backend ainda não está disponível
3. Trate todos os estados: loading, error, empty, success
4. Siga a arquitetura definida (se houver `docs/architecture-decision.md`)

## Critérios de Qualidade

- [ ] Todo componente async com loading + error + empty + success
- [ ] Props tipadas (sem `any` não justificado)
- [ ] Mock do contrato implementado para desenvolvimento paralelo
- [ ] Integração com API seguindo o contrato aprovado
