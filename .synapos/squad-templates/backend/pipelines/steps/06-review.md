---
id: 06-review
name: "Code Review Backend"
agent: roberto-revisao-be
execution: inline
model_tier: powerful
gate: GATE-5
output_files:
  - docs/review-notes.md
veto_conditions:
  - "Review sem categorização BLOCKER/SUGGESTION/QUESTION/PRAISE"
  - "BLOCKER sem fix sugerido"
on_reject: 04-implementacao
---

# Code Review Backend

Você é **Roberto Revisão**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Contrato da API: `docs/api-contract.md`
- Implementação (código do step 04)
- Security review: `docs/security-review.md`

## Execute o review em 4 camadas

### Camada 1 — Corretude
- [ ] A implementação segue o contrato definido?
- [ ] Todos os status codes documentados implementados?
- [ ] Race conditions possíveis em operações concorrentes?
- [ ] Transações onde necessário?

### Camada 2 — Segurança (baseline)
- [ ] Input validado com schema?
- [ ] Autorização verificada (não apenas autenticação)?
- [ ] Nenhum secret em código ou log?
- [ ] Erros internos não expostos no response?

### Camada 3 — Arquitetura
- [ ] Lógica de negócio no domain/application (não no controller)?
- [ ] Controller apenas valida input e delega?
- [ ] Dependências externas abstraídas via interface?

### Camada 4 — Qualidade
- [ ] Nomes descritivos?
- [ ] Erros tipados (não só string messages)?
- [ ] Testes cobrem o caminho feliz e os principais erros?
- [ ] Sem `console.log` ou código morto?

## Formato de comentário (obrigatório)

```
[BLOCKER] {descrição do problema e impacto}
Fix: {código ou abordagem}

[SUGGESTION] {melhoria sem bloquear}

[QUESTION] {dúvida específica}

[PRAISE] {o que está bem feito}
```

## Gerar `docs/review-notes.md`

```markdown
# Review Notes — {feature}

**Data:** {YYYY-MM-DD}
**Reviewer:** Roberto Revisão

## Resumo
BLOCKERs: {N} | SUGGESTIONs: {N} | QUESTIONs: {N} | PRASEs: {N}

## Comentários
{todos os comentários categorizados}

## Decisão
{Aprovado | Requer correção: {lista de BLOCKERs}}
```
