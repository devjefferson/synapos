---
id: bf-03-fix
name: "Correção do Bug"
execution: subagent
model_tier: powerful
---

# Correção do Bug

**Agent:** Determinado pelo diagnóstico (rodrigo-react | alexandre-api | ambos)

## Tarefa

1. Implemente o fix na(s) camada(s) identificada(s). Camada frontend → siga `.synapos/core/best-practices/dev/frontend-quality.md` (sem regredir acessibilidade, performance, SEO) e registre o Relatório compacto
2. Adicione teste que cobre o caso que causou o bug
3. Verifique que o fix não quebra outros comportamentos

## Critérios

- [ ] Fix implementado na camada correta
- [ ] Teste adicionado cobrindo o caso do bug
- [ ] Contrato de API respeitado após o fix
