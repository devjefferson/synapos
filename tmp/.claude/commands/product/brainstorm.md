
# Product Brainstorm

Este comando auxilia em sessões estruturadas de brainstorming para produtos, funcionalidades ou decisões de negócio.

<topic>
#$ARGUMENTS
</topic>

## Fase 1: Contextualização

Antes de iniciar o brainstorming, você deve:

1. **Ler Master Docs relevantes:**
   - docs/business-context/PRODUCT_STRATEGY.md
   - docs/business-context/CUSTOMER_PERSONAS.md
   - docs/business-context/COMPETITIVE_LANDSCAPE.md
   - docs/master-docs/project-prd.md (se existir)

2. **Entender o tópico:**
   - É um novo produto?
   - É uma nova funcionalidade?
   - É uma decisão técnica com impacto no negócio?
   - É uma pivotagem estratégica?

3. **Solicitar contexto inicial ao humano:**
   - Qual é o problema que está tentando resolver?
   - Qual é o gatilho dessa discussão? (dor do cliente, oportunidade, competição, etc.)
   - Existem restrições conhecidas? (tempo, orçamento, recursos técnicos)
   - Qual é o nível de maturidade desta ideia? (embrionária, semi-definida, quase-pronta)

## Fase 2: Exploração Divergente

Seu papel aqui é **expandir o pensamento** através de:

### 2.1 Questionamento Socrático
Faça 5-7 perguntas provocativas que desafiem premissas:
- "Por que resolver isso agora?"
- "E se fizermos nada? Qual o custo de oportunidade?"
- "Quem mais já tentou resolver isso? Por que falharam/tiveram sucesso?"
- "Qual a aposta mais arriscada aqui?"
- "Como isso se conecta com a visão de longo prazo?"

### 2.2 Geração de Alternativas
Para cada tópico, gere **no mínimo 3 abordagens diferentes:**

**Template para alternativas:**
```
### Alternativa A: [Nome descritivo]
- **Descrição:** O que é esta abordagem
- **Vantagens:** 3-5 pontos fortes
- **Desvantagens:** 3-5 pontos fracos
- **Esforço estimado:** Alto/Médio/Baixo
- **Impacto estimado:** Alto/Médio/Baixo
- **Riscos principais:** 2-3 riscos críticos
- **Premissas:** O que precisa ser verdade para funcionar
```

### 2.3 Análise de Trade-offs
Para cada alternativa, mapeie os trade-offs em dimensões:
- **Velocidade vs. Qualidade**
- **Escopo vs. Profundidade**
- **Inovação vs. Previsibilidade**
- **Custo vs. Diferenciação**
- **Curto prazo vs. Longo prazo**

### 2.4 Análise de Stakeholders
Identifique como cada alternativa impacta:
- **Clientes/Usuários:** Como reagem? O que ganham/perdem?
- **Equipe Técnica:** Complexidade de implementação
- **Equipe de Negócio:** Alinhamento com metas
- **Parceiros/Integrações:** Dependências externas

## Fase 3: Convergência Estruturada

### 3.1 Matriz de Decisão
Crie uma matriz comparativa usando critérios:
- Alinhamento com estratégia (peso: X)
- Viabilidade técnica (peso: X)
- Impacto no cliente (peso: X)
- ROI esperado (peso: X)
- Velocidade de entrega (peso: X)

Solicite ao humano os pesos que importam para esta decisão.

### 3.2 Análise de Riscos
Para as 2-3 melhores alternativas, conduza análise de risco:
- **Riscos Técnicos:** O que pode dar errado tecnicamente?
- **Riscos de Mercado:** E se o mercado não responder?
- **Riscos Operacionais:** Conseguimos executar/sustentar?
- **Riscos Estratégicos:** Isso nos afasta da visão?

### 3.3 Cenários "E se...?"
Explore cenários extremos:
- "E se tivermos metade do tempo?"
- "E se tivermos o dobro do orçamento?"
- "E se um competidor lançar isso amanhã?"
- "E se isso falhar completamente?"

## Fase 4: Recomendação Fundamentada

Com base na discussão, você deve:

1. **Sintetizar aprendizados:**
   - Resuma os principais insights da sessão
   - Destaque padrões que emergiram

2. **Fazer recomendação:**
   - Qual alternativa você recomenda?
   - Por quê? (com base nos dados da discussão)
   - Quais são as próximas ações?

3. **Identificar gaps de informação:**
   - O que ainda precisa ser validado?
   - Quais pesquisas/experimentos devem ser feitos?

## Fase 5: Documentação

Salve a sessão de brainstorming em:
`docs/business-context/brainstorm/<topic-slug>-<YYYY-MM-DD>.md`

O documento deve conter:
```markdown
# Brainstorm: [Tópico]

**Data:** YYYY-MM-DD
**Participantes:** [Humano + Claude]
**Duração:** XXmin

## Contexto
[Problema e gatilho da discussão]

## Alternativas Exploradas

### Alternativa A: [Nome]
- **Descrição:** ...
- **Vantagens:** ...
- **Desvantagens:** ...
- **Esforço:** Alto/Médio/Baixo
- **Impacto:** Alto/Médio/Baixo
- **Riscos:** ...
- **Premissas:** ...

### Alternativa B: [Nome]
[Mesma estrutura]

### Alternativa C: [Nome]
[Mesma estrutura]

## Análise de Trade-offs

| Critério | Alt A | Alt B | Alt C |
|----------|-------|-------|-------|
| Alinhamento Estratégico | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Viabilidade Técnica | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Impacto Cliente | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| ROI Esperado | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Velocidade Entrega | ⭐⭐ | ⭐⭐⭐ | ⭐ |

## Matriz de Riscos

### Alternativa A
- **Riscos Técnicos:** [Descrição]
- **Riscos de Mercado:** [Descrição]
- **Riscos Operacionais:** [Descrição]
- **Riscos Estratégicos:** [Descrição]

[Repetir para outras alternativas]

## Cenários Explorados

### Cenário 1: [Nome do cenário]
- **Premissa:** ...
- **Impacto:** ...
- **Mitigação:** ...

## Decisão/Recomendação

**Recomendação:** [Alternativa escolhida]

**Justificativa:**
[Explicação detalhada baseada nos dados da análise]

**Premissas-chave desta decisão:**
1. ...
2. ...
3. ...

**Próximos Passos:**
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

## Pendências/Questões em Aberto
- Questão 1: [Descrição] - Responsável: [Nome]
- Questão 2: [Descrição] - Responsável: [Nome]

## Aprendizados
[Insights principais que emergiram durante a discussão]
```

⛔ **IMPORTANTE: Após documentar a sessão, PARE e solicite feedback do humano. NÃO prossiga automaticamente para implementação ou criação de PRDs. AGUARDE que o humano decida os próximos passos.**

## Ferramentas de Apoio

Durante o brainstorming, você pode e deve:
- Usar **WebSearch** ou **Perplexity** para pesquisar benchmarks, tendências de mercado, casos de uso similares
- Usar **Context7** para verificar como outras empresas/produtos resolveram problemas similares
- Consultar **Master Docs** para garantir alinhamento estratégico
- Pesquisar **COMPETITIVE_LANDSCAPE.md** para entender o que competidores fazem
- Consultar **CUSTOMER_PERSONAS.md** para validar fit com público-alvo

## Modo de Operação

**Princípios do Brainstorming:**
- **Seja provocativo, não complacente** - Desafie ideias, mesmo as do humano
- **Questione premissas** - "Por que assumimos isso?"
- **Apresente contra-argumentos** - Para cada pro, mostre um contra
- **Force priorização** - "Se só pudesse fazer uma, qual seria?"
- **Valide com dados** - Use pesquisa quando possível, não apenas intuição
- **Pense em extremos** - Explore cenários otimistas e pessimistas
- **Conecte com contexto** - Sempre referencie master docs e estratégia
- **Documente raciocínio** - O "porquê" é mais importante que o "o quê"

**O que NÃO fazer:**
- ❌ Concordar rapidamente sem questionar
- ❌ Aceitar a primeira solução como definitiva
- ❌ Ignorar restrições reais (técnicas, orçamento, time)
- ❌ Fazer suposições sem validar com dados/docs
- ❌ Pular a documentação da sessão

## Integração com Outros Comandos

Após uma sessão de brainstorming bem-sucedida, o fluxo natural pode ser:

```bash
# 1. Brainstorm inicial
/brainstorm "adicionar sistema de notificações em tempo real"
# → Exploração estruturada, decisão tomada

# 2. Se decisão for prosseguir, colete requisitos detalhados
/collect "implementar notificações push via WebSockets"

# 3. Valide contra master docs
/check "validar notificações contra arquitetura"

# 4. Crie especificação
/spec "PRD sistema de notificações"

# 5. Inicie implementação
/start "real-time-notifications"
```

## Exemplo de Fluxo Completo

**Usuário:** `/brainstorm "devemos construir um app mobile nativo ou web app?"`

**Claude:**
```
Vou ajudá-lo a pensar profundamente sobre esta decisão.

Primeiro, deixe-me ler os master docs relevantes...
[Lê PRODUCT_STRATEGY.md, CUSTOMER_PERSONAS.md, etc.]

Antes de explorar alternativas, preciso entender o contexto:

1. Qual é o problema principal que um app mobile resolveria que o web app atual não resolve?
2. Qual é o gatilho desta discussão? (feedback de clientes, queda de engajamento, pressão de competidores?)
3. Existem restrições de orçamento ou prazo?
4. Qual percentual dos seus usuários acessam via mobile atualmente?
```

**[Após respostas do humano]**

**Claude:**
```
Interessante. Deixe-me desafiar algumas premissas:

- Você mencionou que "clientes pedem app nativo". Quantos clientes?
  Isso representa que % da base? Eles verbalizaram que o web app não atende?

- Segundo CUSTOMER_PERSONAS.md, seu público principal são profissionais
  de escritório. Eles realmente usariam um app mobile ou isso é uma suposição?

- E se ao invés de nativo OU web, explorássemos uma PWA (Progressive Web App)?
  Isso daria 80% dos benefícios de nativo com 40% do custo...

Vou apresentar 4 alternativas para análise:

### Alternativa A: App Nativo (iOS + Android)
- **Descrição:** Desenvolver apps nativos separados para iOS (Swift/SwiftUI) e Android (Kotlin)
- **Vantagens:**
  - Performance máxima
  - Acesso completo a funcionalidades nativas (push, câmera, sensores)
  - Presença nas app stores (descoberta)
  - Experiência UX otimizada por plataforma
  - Suporte offline robusto
- **Desvantagens:**
  - 2x desenvolvimento e manutenção
  - Necessidade de equipe mobile especializada
  - Ciclo de release mais lento (review das stores)
  - Fragmentação de código entre web e mobile
  - Custo de manutenção contínuo alto
- **Esforço:** ALTO (6-9 meses, 3-4 devs especializados)
- **Impacto:** ALTO (se mobile for crítico para o negócio)
- **Riscos principais:**
  - Dificuldade de contratar/manter equipe mobile
  - Divergência de features entre web e mobile
  - Custo operacional permanente
- **Premissas:**
  - Temos orçamento para equipe dedicada
  - Mobile é estratégico de longo prazo
  - Features nativas são diferenciais críticos

### Alternativa B: Progressive Web App (PWA)
[Mesma estrutura detalhada]

### Alternativa C: Hybrid (React Native / Flutter)
[Mesma estrutura detalhada]

### Alternativa D: Mobile-First Web Responsive
[Mesma estrutura detalhada]

---

Agora, me ajude a calibrar a matriz de decisão.
Em uma escala de 1-10, qual a importância de:
- Velocidade de entrega?
- Performance nativa?
- Custo de desenvolvimento?
- Facilidade de manutenção?
```

**[Continua o diálogo até convergir para uma recomendação]**

**[Final - Claude salva documento e PARA]**

**Claude:**
```
✅ Sessão de brainstorming documentada em:
docs/business-context/brainstorm/mobile-strategy-2025-01-15.md

**Recomendação:** Progressive Web App (PWA)

**Justificativa:**
Baseado na análise, PWA oferece o melhor ROI considerando:
- 80% dos benefícios de app nativo
- 40% do custo e tempo
- Alinhamento com PRODUCT_STRATEGY.md (foco em time-to-market)
- Perfil dos usuários (CUSTOMER_PERSONAS.md) não demanda features nativas críticas

**Próximos passos sugeridos:**
1. Validar hipótese com 10 clientes-chave (entrevistas)
2. Criar PoC de PWA (2 semanas)
3. Se validado, executar /collect para levantar requisitos detalhados

⛔ Aguardando seu feedback e decisão sobre próximos passos.
```

---

Pronto! Agora você tem um comando de brainstorming estruturado que:
- Desafia premissas
- Explora alternativas sistematicamente
- Documenta o raciocínio
- Salva em `docs/business-context/brainstorm/`
- Integra com o fluxo Cortex
