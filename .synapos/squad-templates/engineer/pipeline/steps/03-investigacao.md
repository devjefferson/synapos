---
id: 03-investigacao
name: "Investigação"
agent: leo-engenheiro
execution: inline
model_tier: powerful
output_files:
  - context.md
---

# Investigação

## Objetivo
Transformar requisitos brutos em contexto estruturado e aprovado pelo humano, salvo em `context.md`.

## 1. Verificar Project Briefing

Antes de perguntar ao usuário, verifique:
```
docs/technical-context/project-briefing.md
docs/technical-context/briefing/critical-rules.md
docs/technical-context/briefing/adrs-summary.md
```

Se existirem: carregue as regras críticas e ADRs relevantes para incluir no context.md.

## 2. Examinar os dados de entrada

A partir dos cartões do Linear ou da descrição recebida no step anterior:

Mapeie internamente:
- **Motivação**: por que esta feature existe? qual problema resolve?
- **Meta**: resultado esperado — mensurável e concreto
- **Estratégia direcional**: como deve ser desenvolvido (alto nível, sem detalhes técnicos)
- **Dependências**: o que precisa existir antes ou em paralelo?
- **Limitações**: restrições conhecidas (tech, prazo, escopo)
- **Validação**: como saber que está pronto?

## 3. Formular perguntas de clarificação

Reflita profundamente sobre o que está sendo pedido. Formule **3 a 5 perguntas críticas** — as que, se não respondidas, impediriam uma arquitetura sólida.

Apresente ao humano:
```
Minha compreensão até agora:

**Feature:** [nome]
**Motivação:** [o que você entendeu]
**Meta:** [resultado esperado]
**Estratégia:** [direção geral]

Antes de prosseguir, preciso de clarificação em:

1. [Pergunta 1 — mais crítica]
2. [Pergunta 2]
3. [Pergunta 3]
[...até 5]
```

Aguarde as respostas. Se necessário, continue o diálogo até ter contexto sólido.

## 4. Verificar impacto em documentação de requisitos

Se algo discutido aqui contradiz ou enriquece documentação existente:
- Solicite permissão do humano para atualizar
- Se o requisito está no Linear: atualize o cartão
- Se é um arquivo local: atualize o arquivo

## 5. Gerar context.md

Quando o humano confirmar que a compreensão está correta, gere `context.md`:

```markdown
# Context: [Nome da Feature]

## ⚠️ Regras Críticas do Projeto
[Copiar de briefing/critical-rules.md se existir]
[Se não existir: listar ADRs relevantes encontradas em docs/]

## 📚 ADRs Relevantes
[Lista de ADRs aplicáveis a esta feature com link/referência]

## Motivação
[Por que esta feature existe — contexto completo]

## Meta
[Resultado esperado — mensurável]

## Estratégia
[Direção geral — sem detalhes técnicos]

## Dependências
[O que precisa existir antes ou em paralelo]

## Limitações
[Restrições conhecidas]

## Validação
[Como saber que está pronto]

## Questões Abertas
[Itens que ainda precisam de resposta]

## Frontend Integration (se aplicável)
[Se envolve Lovable/frontend: listar mocks a integrar]
```

Apresente o context.md ao humano para revisão antes de salvar.

**⛔ NÃO AVANCE. Aguarde o humano revisar e aprovar explicitamente o context.md antes de prosseguir para o checkpoint.**
