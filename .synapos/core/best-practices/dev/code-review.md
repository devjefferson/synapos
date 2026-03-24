---
id: code-review
version: "1.0.0"
domain: [frontend, backend, fullstack, mobile]
whenToUse: "Quando o squad faz review de código em qualquer linguagem"
---

# Guia de Code Review

> Referência para conduzir reviews construtivos, eficientes e consistentes.

---

## Princípios

- **Review é colaboração, não crítica pessoal** — o alvo é o código, não o autor
- **Clareza sobre completude** — um review útil é melhor que um review perfeito que demora dias
- **Contexto sempre** — entenda o objetivo do PR antes de avaliar as escolhas
- **Automatize o óbvio** — lint, formatação e testes devem ser verificados por CI, não por humanos

---

## Categorias de Comentário

Use prefixos para indicar a gravidade e intenção de cada comentário:

| Prefixo | Significado | Bloqueia merge? |
|---------|-------------|-----------------|
| `BLOCKER:` | Problema que deve ser corrigido antes do merge | ✅ Sim |
| `SUGGESTION:` | Melhoria recomendada, mas não obrigatória | ❌ Não |
| `QUESTION:` | Dúvida legítima — pode ser falta de contexto | ❌ Não |
| `PRAISE:` | Algo que merece reconhecimento explícito | ❌ Não |
| `NITPICK:` | Preferência pessoal, baixíssima prioridade | ❌ Não |

### Exemplos

```
BLOCKER: Esta query não tem índice em `user_id`. Em produção com volume vai travar.

SUGGESTION: Extrair esse bloco para um custom hook `useFormValidation` melhoraria
a legibilidade e facilitaria os testes.

QUESTION: Por que optou por `useEffect` aqui em vez de `useMemo`? Há alguma
dependência externa que precisa de side effect?

PRAISE: Boa escolha em usar `AbortController` — o tratamento de cancelamento
de fetch estava faltando há tempo.

NITPICK: Prefiro `const` ao invés de `let` aqui, mas ambos funcionam.
```

---

## Checklist do Reviewer

### Lógica e Corretude
- [ ] O código faz o que o PR descreve?
- [ ] Edge cases e valores nulos são tratados?
- [ ] Condições de corrida ou problemas de concorrência?
- [ ] Reversibilidade: o PR pode ser revertido sem efeitos colaterais?

### Qualidade e Manutenibilidade
- [ ] O código é legível sem precisar de comentário explicativo?
- [ ] Funções/métodos têm responsabilidade única?
- [ ] Há duplicação que poderia ser extraída?
- [ ] Nomes de variáveis e funções são descritivos e consistentes?

### Performance
- [ ] Há chamadas N+1 em loops?
- [ ] Queries ao banco são otimizadas (índices, projeção de campos)?
- [ ] Há operações custosas que poderiam ser cacheadas?

### Segurança
- [ ] Inputs do usuário são validados e sanitizados?
- [ ] Dados sensíveis não são logados ou expostos?
- [ ] Autenticação e autorização verificadas nos novos endpoints?

### Testes
- [ ] Os testes cobrem o caminho feliz?
- [ ] Os testes cobrem casos de erro e edge cases relevantes?
- [ ] Os testes são legíveis e descrevem o comportamento esperado?

### Documentação
- [ ] Mudanças de API estão documentadas?
- [ ] Decisões não óbvias têm comentário ou ADR?

---

## Tom Construtivo

### Faça
- Explique o **porquê** da sua sugestão
- Ofereça alternativas concretas quando apontar problemas
- Reconheça explicitamente boas escolhas
- Pergunte antes de assumir que é um erro

### Evite
- Comentários vagos: ~~"Isso está errado"~~ → diga o que está errado e por quê
- Tom imperativo sem explicação: ~~"Muda isso"~~ → "Sugiro mudar X porque Y"
- Reviews exaustivas sobre estilo que o linter deveria pegar
- Ignorar o contexto do PR (deadline, constraint técnica, débito aceito)

---

## Fluxo de Review

```
Autor abre PR
    ↓
CI roda (lint + testes) — falha aqui bloqueia review
    ↓
Reviewer lê descrição + contexto
    ↓
Reviewer comenta com categorias claras
    ↓
Autor responde / corrige / justifica
    ↓
Reviewer aprova ou abre nova rodada (max 2 rodadas para BLOCKERs)
    ↓
Merge
```

### Tempo esperado
- PRs pequenos (< 200 linhas): review em até 24h
- PRs médios (200–500 linhas): review em até 48h
- PRs grandes (> 500 linhas): considere quebrar o PR

---

## Tamanho de PR

| Tamanho | Linhas | Qualidade do review |
|---------|--------|---------------------|
| Ótimo | < 200 | Alta — fácil de revisar completamente |
| Aceitável | 200–500 | Média — revisor pode perder detalhes |
| Problemático | > 500 | Baixa — dividir em PRs menores |

> PRs grandes não são mais produtivos — são mais difíceis de revisar, mais difíceis de reverter e têm maior chance de conflito.
