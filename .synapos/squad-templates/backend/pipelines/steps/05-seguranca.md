---
id: 05-seguranca
name: "Auditoria de Segurança"
agent: sergio-seguranca
execution: subagent
model_tier: powerful
output_files:
  - docs/security-review.md
veto_conditions:
  - "IDOR identificado sem correção proposta"
  - "Secret em código ou log"
  - "SQL injection possível"
  - "Endpoint sensível sem rate limiting"
on_reject: 04-implementacao
---

# Auditoria de Segurança

Você é **Sérgio Segurança**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Contrato da API: `docs/api-contract.md`
- Implementação do step anterior (código entregue por Alexandre API)
- Memória do squad: `_memory/memories.md`

## Execute a auditoria OWASP

### A01 — Broken Access Control
- [ ] Endpoints verificam que o recurso pertence ao usuário autenticado (IDOR)?
- [ ] Endpoints admin exigem role adequado?
- [ ] Não retorna 403 quando recurso existe mas não pertence ao usuário (use 404)?

### A02 — Cryptographic Failures
- [ ] Nenhum dado sensível em log (senha, token, PII)?
- [ ] Senhas hasheadas com bcrypt/argon2?
- [ ] Tokens JWT com algoritmo seguro (não `none`)?

### A03 — Injection
- [ ] Zero concatenação de string em queries SQL?
- [ ] Input sanitizado antes de uso em comandos externos?

### A04 — Insecure Design
- [ ] Rate limiting em endpoints de auth (login, reset de senha)?
- [ ] Endpoints de criação de conta protegidos contra flood?

### A05 — Security Misconfiguration
- [ ] CORS configurado de forma restritiva (não `*`)?
- [ ] Headers de segurança presentes (via helmet)?
- [ ] Stack trace nunca exposto no response?

### A07 — Authentication Failures
- [ ] Tokens expiram?
- [ ] Logout invalida o token?

## Documento a gerar

### `docs/security-review.md`

```markdown
# Security Review

**Data:** {YYYY-MM-DD}
**Auditor:** Sérgio Segurança

## Resumo
- Críticos: {N}
- Altos: {N}
- Médios: {N}
- Baixos: {N}
- Aprovado: {Sim | Não — requer correção}

## Findings

### [CRÍTICO] {título} *(se encontrado)*
**Localização:** {arquivo}:{linha aproximada}
**Descrição:** {o que é o problema e como pode ser explorado}
**Fix obrigatório:**
```
{código ou abordagem de correção}
```

### [ALTO] {título} *(se encontrado)*
...

### [MÉDIO] {título} *(se encontrado)*
...

## Itens Aprovados
{checklist de itens que passaram na auditoria}

## Decisão
{Aprovado | Requer correção dos itens Críticos/Altos antes de prosseguir}
```

## Regra de decisão

- **Critical/High encontrado** → retorna para implementação com fix detalhado
- **Apenas Medium/Low** → aprovado, mas medium deve ir para `_memory/memories.md` como débito técnico
- **Clean** → aprovado, prosseguir para review
