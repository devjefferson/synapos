---
id: 06-integracao
name: "Verificação de Integração"
agent: carlos-coordenador
execution: inline
model_tier: powerful
output_files:
  - docs/integration-checklist.md
---

# Verificação de Integração

**Agent:** Carlos Coordenador 🔗

## Instruções

Execute como Carlos Coordenador. Verifique a integração entre o frontend e backend implementados.

## Checklist de Integração

Para cada endpoint do contrato, verifique:

- [ ] Request do frontend bate com o schema do contrato
- [ ] Response do backend bate com o schema do contrato
- [ ] Todos os status codes de erro do backend tratados no frontend
- [ ] Loading state no frontend cobre o tempo de resposta real
- [ ] Headers necessários (Authorization, Content-Type) incluídos nas requests

## Output

Salve em `docs/integration-checklist.md`:

```markdown
# Checklist de Integração — {feature}

## Endpoints verificados

### {MÉTODO} {/endpoint}
- FE → BE: {OK | DIVERGÊNCIA: descrição}
- BE → FE: {OK | DIVERGÊNCIA: descrição}
- Erros tratados: {lista}

## Status: APROVADO | BLOQUEADO

### BLOCKERs (se houver)
...
```
