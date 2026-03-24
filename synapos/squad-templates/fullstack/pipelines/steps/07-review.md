---
id: 07-review
name: "Review Duplo (FE + BE)"
agent: renata-revisao-fe
execution: inline
model_tier: powerful
output_files:
  - docs/review-notes.md
gate: GATE-5
---

# Review Fullstack

**Agent:** Renata Revisão 🔍

## Instruções

Execute como Renata Revisão. Faça review completo da implementação fullstack.

## Escopo do Review

### Frontend
- Qualidade dos componentes e hooks
- Tratamento de estados (loading/error/empty/success)
- Tipagem TypeScript
- Acessibilidade básica

### Backend
- Aderência ao contrato de API
- Validação de inputs
- Tratamento de erros
- Segurança básica (sem secrets expostos, sem SQL injection)

### Integração
- Contrato sendo respeitado em ambos os lados
- Erros de backend tratados no frontend

## Formato de Output

Salve em `docs/review-notes.md` usando categorias:
- `BLOCKER:` — deve ser corrigido antes do merge
- `SUGGESTION:` — recomendado mas não obrigatório
- `QUESTION:` — dúvida que precisa de resposta
- `PRAISE:` — reconhecimento explícito

## Critérios de Aceite

- [ ] Nenhum BLOCKER aberto
- [ ] Todos os BLOCKERs com fix sugerido
