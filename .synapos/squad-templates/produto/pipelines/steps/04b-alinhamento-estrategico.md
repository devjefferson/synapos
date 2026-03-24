---
id: 04b-alinhamento-estrategico
name: "Alinhamento Estratégico com o Usuário"
execution: checkpoint
---

# Alinhamento Estratégico — Aprovação antes da Spec

Antes de gerar qualquer documento de produto, é obrigatório alinhar as decisões estratégicas com o usuário. Nenhuma spec, visão ou decisão de negócio deve ser criada sem aprovação explícita.

## Contexto disponível

Leia os documentos de pesquisa gerados até agora:
- `.synapos/squads/{slug}/docs/research/market-analysis.md`
- `.synapos/squads/{slug}/docs/business-context.md`
- `.synapos/squads/{slug}/docs/personas/user-personas.md`

## Perguntas obrigatórias ao usuário

Apresente cada bloco e aguarde respostas antes de prosseguir. Faça quantas rodadas forem necessárias até ter clareza total.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALINHAMENTO ESTRATÉGICO — preciso da sua visão

Antes de criar a spec, preciso entender suas
decisões de negócio. Por favor responda:

1. VISÃO DO PRODUTO
   Qual é a visão de longo prazo para este produto?
   O que ele representa em 3-5 anos?

2. PERSONAS PRIORITÁRIAS
   Das personas identificadas na pesquisa, qual é
   a mais importante para a v1? Por quê?

3. DIFERENCIAL COMPETITIVO
   O que torna este produto diferente dos
   concorrentes? Qual é a aposta única?

4. FEATURES DA V1
   Quais funcionalidades são obrigatórias para o
   primeiro lançamento? O que fica para depois?

5. MÉTRICAS DE SUCESSO
   Como você vai saber que o produto funcionou?
   Qual número ou comportamento indica sucesso?

6. RESTRIÇÕES E LIMITES
   Há restrições técnicas, de prazo, budget ou
   regulatórias que eu preciso saber?

7. DECISÕES JÁ TOMADAS
   Há decisões de negócio ou técnicas já definidas
   que não podem ser questionadas na spec?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Ciclos de refinamento

Após as respostas iniciais, identifique lacunas e faça perguntas de follow-up. Continue iterando até ter clareza em todos os pontos acima.

Ao finalizar, apresente um resumo das decisões estratégicas:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DAS DECISÕES ESTRATÉGICAS

Visão: {resposta confirmada}
Persona principal: {persona escolhida}
Diferencial: {aposta única confirmada}
Features v1: {lista confirmada}
Métrica de sucesso: {definida}
Restrições: {listadas}
Decisões fixas: {listadas}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Essas são as bases da spec. Posso prosseguir?

[1] Sim — gerar product-vision.md e spec.md
[2] Ajustar algum ponto antes de continuar
```

**Se [2]:** Registre o ajuste, atualize o resumo e repita.

**Se [1]:** Registre em `_memory/memories.md`:
```markdown
## Direção estratégica aprovada — {YYYY-MM-DD}
{resumo das decisões confirmadas}
```

Prossiga para o step 05-spec.
