# Template de Observação — Synapos User Testing

> Use durante ou logo após cada sessão de teste.
> Um arquivo por testador. Copie este template e renomeie: `obs-{nome}.md`

---

## Testador

**Nome / identificador:** _______________
**Stack principal:** _______________
**IDE que usa:** _______________
**Projeto usado no teste:** _______________
**Data — Sessão 1:** _______________
**Data — Sessão 2:** _______________

---

## Sessão 1 — Observação em tempo real

### Cronômetro de pontos críticos

| Timestamp | O que aconteceu |
|-----------|-----------------|
| 0:00 | Início — executou `/init` |
| | |
| | |

> Anote: hesitações longas, comentários em voz alta, cliques errados, expressões de confusão, momentos de "ah, entendi".

---

### Pontos de fricção observados

Onde o testador travou, hesitou ou precisou reler:

```
[ ] Instalação (npx synapos add ...)
[ ] Primeiro /init
[ ] Pergunta de onboarding
[ ] Escolha de modo (Rápido / Completo)
[ ] Escolha de role
[ ] Configuração do squad
[ ] Feature session
[ ] Durante o pipeline
[ ] Output gerado
[ ] Outro: _______________
```

**Detalhes de cada ponto:**

```
[notas livres]
```

---

### Comportamentos inesperados

O testador fez algo que você não esperava? Tentou um caminho diferente do projetado?

```
[notas livres]
```

---

### Citações diretas

Frases que o testador disse durante o teste (mesmo que informal):

```
"..."
"..."
```

---

### Chegou ao valor?

- [ ] Sim — a IA começou a trabalhar na tarefa real
- [ ] Parcialmente — chegou ao pipeline mas não completou
- [ ] Não — travou antes de iniciar o pipeline

**Tempo até o primeiro output útil:** _____ minutos

---

## Sessão 2 — Observação

**Conseguiu iniciar sem ajuda?**
- [ ] Sim
- [ ] Precisou de uma dica
- [ ] Não conseguiu

**Pontos de fricção novos (diferentes da Sessão 1):**

```
[notas livres]
```

**Pontos que melhoraram em relação à Sessão 1:**

```
[notas livres]
```

---

## Análise pós-sessão

### Critério de sucesso

- [ ] ✅ Chegou ao segundo uso sem ajuda → **conta como sucesso**
- [ ] ⚠️ Chegou com uma dica → **conta como sucesso parcial**
- [ ] ❌ Não chegou → **falha — investigar causa raiz**

### Causa raiz do travamento principal

Se travou, qual foi a causa real?

- [ ] Onboarding confuso
- [ ] Não entendeu o conceito de "role"
- [ ] Não entendeu o conceito de "session"
- [ ] Modo Rápido/Completo não ficou claro
- [ ] Output gerado foi genérico/inútil
- [ ] Problema técnico (instalação, erro)
- [ ] Outro: _______________

### O que mudar com base neste testador

```
[máximo 3 itens concretos]
1.
2.
3.
```

---

## Consolidado após 5 testadores

> Preencha depois de coletar todos os 5.

| Testador | Sessão 1 (chegou ao valor?) | Sessão 2 (sem ajuda?) | Principal fricção |
|----------|----------------------------|----------------------|-------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

**Critério de sucesso da semana 6:**
`≥ 3 de 5 testadores chegaram ao segundo uso sem ajuda`

- [ ] ✅ Critério atingido → avançar para próxima fase
- [ ] ❌ Critério não atingido → identificar ponto de quebra e voltar para Semana 2 ou 4

**Ponto de quebra mais comum:**

```
[o que a maioria travou — isso é o próximo a corrigir]
```
