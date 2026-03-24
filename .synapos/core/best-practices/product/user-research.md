---
id: user-research
version: "1.0.0"
domain: [produto]
whenToUse: "Quando o squad realiza pesquisa de usuário ou mercado"
---

# User Research

> Métodos, templates e síntese para pesquisa de usuário e mercado.

---

## Quando Pesquisar

| Situação | Método recomendado |
|----------|-------------------|
| Entender um problema novo | Entrevistas qualitativas |
| Validar hipótese de solução | Teste de usabilidade |
| Medir satisfação | Survey / NPS |
| Comparar opções de design | Teste A/B |
| Entender o mercado | Desk research + benchmarks |
| Priorizar features | Pesquisa de Jobs-to-be-Done |

---

## Entrevistas

### Quando usar
- Explorar problemas desconhecidos
- Entender contexto e motivações profundas
- Validar assumções antes de construir

### Planejamento

```markdown
## Plano de Entrevistas

**Objetivo:** Entender como freelancers gerenciam seus pagamentos hoje

**Hipóteses a validar:**
1. Freelancers perdem tempo controlando pagamentos manualmente
2. A falta de visibilidade de inadimplência é o maior pain point

**Perfil dos participantes:**
- Freelancers PJ com 2+ anos de experiência
- Pelo menos 3 clientes simultâneos
- 5–8 participantes (saturação esperada)

**Duração:** 45–60 minutos
**Formato:** Videoconferência (gravado com consentimento)
```

### Roteiro de Entrevista

```markdown
## Roteiro — Gestão Financeira de Freelancers

### Aquecimento (5 min)
- Me conta um pouco sobre o seu trabalho: o que você faz, há quanto tempo freelancer?
- Como é a sua semana típica de trabalho?

### Exploração (30 min)
- Me conta como você gerencia os pagamentos dos seus clientes hoje.
- Quando você emite uma cobrança, o que acontece a seguir?
- Já teve situação de cliente que não pagou? Me conta como foi.
- O que você faz quando percebe que um pagamento está atrasado?
- Quais ferramentas você usa para isso? Por quê essas?

### Aprofundamento (10 min)
- Qual é o maior incômodo nesse processo hoje?
- Se você pudesse mudar uma coisa nesse fluxo, o que seria?

### Encerramento (5 min)
- Tem algo que você acha importante que eu saiba e não perguntei?
- Posso entrar em contato para dúvidas de acompanhamento?
```

### Boas Práticas
- Pergunte sobre **comportamento passado**, não futuro ("você faria X?" → não confiável)
- Use silêncio produtivo — espere o entrevistado completar o pensamento
- Pergunte "por quê" pelo menos 3 vezes para chegar ao motivador real
- Não valide hipóteses durante a entrevista — observe, não dirija
- Tome notas de citações diretas (entre aspas)

---

## Surveys

### Quando usar
- Validar ou quantificar achados qualitativos
- Medir satisfação ou NPS
- Coletar dados de uma amostra maior (n > 30)

### Boas Práticas de Perguntas

```markdown
✅ "Com que frequência você emite cobranças para clientes?"
   [ ] Diariamente  [ ] Semanalmente  [ ] Mensalmente  [ ] Raramente

❌ "Você usa o sistema com frequência?" (vago, sem escala)

✅ "Quão satisfeito você está com o processo de cobranças?"
   [1 — Muito insatisfeito] ... [5 — Muito satisfeito]

❌ "O processo de cobranças é bom?" (sim/não não gera insight)
```

### Estrutura de Survey

1. **Introdução** (1 parágrafo): objetivo, tempo estimado, anonimato
2. **Triagem** (1–2 perguntas): filtrar perfil correto
3. **Perguntas principais** (5–10): foco no objetivo
4. **NPS** (opcional): "De 0 a 10, você recomendaria X?"
5. **Campo aberto** (opcional): "Tem algo mais que queira compartilhar?"

### Tamanho da Amostra
- Pesquisa exploratória: n ≥ 30
- Validação quantitativa: n ≥ 100
- Decisão de negócio de alto impacto: n ≥ 300

---

## Jobs-to-be-Done (JTBD)

Framework para entender **por que** alguém "contrata" um produto ou feature.

### Formato de Job Statement

```
Quando [situação],
eu quero [motivação],
para [resultado esperado].
```

### Exemplo

```
Quando percebo que um cliente está com pagamento atrasado,
quero ser notificado automaticamente,
para agir antes que vire inadimplência longa.
```

### Como coletar
- Durante entrevistas: "Me conta a última vez que você precisou [situação]"
- Identifique o gatilho (situação), a força de atração e os obstáculos

---

## Análise e Síntese

### Affinity Mapping

Agrupe observações por temas emergentes (não categorias pré-definidas):

```
Post-its / notas → Agrupamento → Temas → Insights → Recomendações
```

Ferramentas: FigJam, Miro, Notion

### Template de Insight

```markdown
## Insight: {título em uma frase}

**Evidência:** (citações diretas ou dados)
> "Eu nunca sei se o cliente viu a cobrança ou simplesmente ignorou"
> "Uso planilha porque o sistema não me avisa de nada"

**Observação:** O que esse comportamento revela?
Freelancers perdem confiança no processo de cobrança e compensam
com ferramentas paralelas (planilhas, anotações) por falta de visibilidade.

**Oportunidade:** Como podemos responder a isso?
Notificações proativas de leitura/status da cobrança eliminariam
a necessidade de workarounds e aumentariam confiança no produto.
```

### Relatório de Síntese — Estrutura Mínima

```markdown
# Síntese de Pesquisa — {Tema}

**Data:** YYYY-MM-DD
**Método:** Entrevistas (n=6) + Survey (n=84)
**Responsável:** {nome}

## Top 3 Insights
1. ...
2. ...
3. ...

## Personas Refinadas
(atualizar personas existentes com novos dados)

## Recomendações
| Prioridade | Recomendação | Evidência |
|------------|--------------|-----------|
| Alta | ... | Insight #1 |

## O que não encontramos
(hipóteses que não se confirmaram — tão valioso quanto o que confirmamos)

## Próximos passos
- [ ] ...
```

---

## Desk Research / Benchmarks

### Quando usar
- Entender o mercado antes de entrevistar usuários
- Mapear soluções concorrentes
- Identificar padrões de UX no setor

### Estrutura de Benchmark

| Critério | Produto A | Produto B | Produto C | Nossa solução atual |
|----------|-----------|-----------|-----------|---------------------|
| Onboarding | ... | ... | ... | ... |
| Cobrança | ... | ... | ... | ... |
| Notificações | ... | ... | ... | ... |
| Mobile | ... | ... | ... | ... |

### Fontes confiáveis
- App Store / Play Store (reviews)
- G2, Capterra (feedback de usuários reais)
- ProductHunt (lançamentos e comentários)
- Artigos de blog dos concorrentes (posicionamento)

---

## Ética em Pesquisa

- Obtenha **consentimento informado** antes de gravar
- Explique o uso das informações coletadas
- Garanta anonimato quando prometido
- Não colete dados desnecessários
- Dê ao participante a opção de se retirar a qualquer momento
- Nunca use dados de pesquisa para fins comerciais diretos sem consentimento
