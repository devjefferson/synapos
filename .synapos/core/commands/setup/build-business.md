---
description: Gera documentação de contexto de negócio do projeto
---

# Build Business Docs — Synapos

---

# REGRAS ABSOLUTAS — NÃO INVENTAR NADA

## Regra 1: JANELAS INTERATIVAS são OBRIGATÓRIAS

**SEMPRE que apresentar escolhas ou confirmar informações ao usuário, você DEVE usar `AskUserQuestion`.**

Exemplo ERRADO:
```
Según meu análisis, seu produto é um SaaS B2B. Confirma?
```

Exemplo CERTO:
```
AskUserQuestion({
  question: "Segundo o que encontrei no projeto, seu produto parece ser um SaaS B2B. Está correto?",
  options: [
    { label: "Sim, correto", description: "Prosseguir" },
    { label: "Corretar", description: "Vou informar o modelo correto" }
  ]
})
```

## Regra 2: NUNCA INVENTE INFORMAÇÕES

**Sobre negócio, você NÃO PODE detectar do código:**
- Visão do produto
- Público-alvo real
- Concorrentes
- Métricas de sucesso
- Modelo de monetização
- Personas reais
- Jornada do cliente

**Você PRECISA perguntar ao usuário sobre tudo isso.** O código só mostra funcionalidades, não o porquê delas existirem.

## Regra 3: TODO ITEM DEVE SER VALIDADO

1. Mostre o que inferiu → AskUserQuestion
2. Aguarde confirmação
3. Se confirmado, inclua. Se não, remova ou marque como "a confirmar"

---

## Objetivo Principal

Gerar uma arquitetura completa de contexto de negócio seguindo o template em `@common/templates/business_context_template.md`. Criar uma estrutura de documentação modular e multi-arquivo que permita que sistemas de IA forneçam suporte ao cliente, assistência de vendas e insights de negócio estratégicos contextualmente adequados.

## Parâmetros de Entrada

**Argumentos opcionais:**
Se argumentos forem fornecidos (links para arquivos, repositórios, materiais de marketing, etc.), use-os como fonte adicional.

<arguments>
#$ARGUMENTS
</arguments>

---

## PRÉ-VERIFICAÇÃO

**Verifique se `docs/_memory/codebase-analysis.md` existe.**

**Se existir:**
- Leia e extraia: tipo de produto inferido, funcionalidades, entidades de domínio
- Use isso para preparar perguntas mais inteligentes ao usuário

**Se não existir:**
- Não problema. Você vai perguntar tudo ao usuário.

---

## Fase 1: Análise do Produto (Limitada ao Código)

**Execute silenciosamente. NÃO invente nada.**

1. **Entender o Produto pelo Código**
   - Listar funcionalidades que dá para inferir das entidades e endpoints
   - Identificar fluxos principais (auth, CRUD, etc.)
   - Detectar tipo de produto (SaaS, e-commerce, ferramenta, etc.)

2. **O que você NÃO consegue saber só com código:**
   - Visão e missão
   - Público-alvo real
   - Concorrentes
   - Métricas
   - Personas
   - Estratégia de mercado

---

## Fase 2: ENTREVISTA COM USUÁRIO (OBRIGATÓRIO)

### Regra: Use AskUserQuestion para CADA pergunta

**NÃO faça perguntas em texto puro. Use sempre janela interativa.**

### 2.1 — Validar Inferências do Código

Comece mostrando o que você conseguiu inferir:

```
AskUserQuestion({
  question: "Analisei o projeto e inferi as seguintes funcionalidades. Está correto?",
  options: [
    { label: "Correto", description: "Prosseguir com a entrevista" },
    { label: "Preciso corrigir", description: "Vou informar o que está errado" }
  ]
})
```

### 2.2 — Modelo de Negócio

```
AskUserQuestion({
  question: "Qual é o modelo de negócio do produto?",
  options: [
    { label: "B2B SaaS", description: "Software como serviço para empresas" },
    { label: "B2C SaaS", description: "Software como serviço para consumidores" },
    { label: "E-commerce", description: "Venda de produtos online" },
    { label: "Marketplace", description: "Plataforma para múltiplos vendedores" },
    { label: "Open Source", description: "Projeto open source" },
    { label: "Ferramenta Interna", description: "Software para uso interno" }
  ]
})
```

### 2.3 — Visão do Produto

```
AskUserQuestion({
  question: "Qual é a visão de longo prazo do produto? (onde quer chegar em 2-3 anos)",
  options: [
    { label: "Escalar para enterprise", description: "Grandes empresas como cliente" },
    { label: "Crescer base B2C", description: "Milhões de usuários individuais" },
    { label: "Líder de mercado", description: "Ser o número 1 no segmento" },
    { label: "Produto rentável", description: "Crescimento sustentável e rentável" },
    { label: "Ser adquirido", description: "Exit via aquisição" },
    { label: "Ainda definindo", description: "Visão ainda não definida" }
  ]
})
```

### 2.4 — Público-Alvo

```
AskUserQuestion({
  question: "Quem é o usuário-alvo principal?",
  options: [
    { label: "Desenvolvedores", description: "Programadores e times de TI" },
    { label: "PMs/Product Managers", description: "Gestores de produto" },
    { label: "Marketeiros", description: "Profissionais de marketing" },
    { label: "Empresas/Corporações", description: "Times e departamentos" },
    { label: "Pequenos negócios", description: "SMEs e entrepreneurs" },
    { label: "Consumidores finais", description: "Pessoas comuns" }
  ]
})
```

### 2.5 — Nível Técnico do Usuário

```
AskUserQuestion({
  question: "Qual é o nível técnico médio do usuário-alvo?",
  options: [
    { label: "Muito técnico", description: "Pode mexer em código, APIs" },
    { label: "Técnico", description: "Entende termos técnicos" },
    { label: "Intermediário", description: "Consegue configurar integrações" },
    { label: "Low-code", description: "Prefere interfaces visuais" },
    { label: "Não-técnico", description: "Precisa de tudo simplificado" }
  ]
})
```

### 2.6 — Concorrentes

```
AskUserQuestion({
  question: "Quem são os principais concorrentes? (Escolha até 3)",
  options: [
    { label: "Concorrente A", description: "[Nome do concorrente 1]" },
    { label: "Concorrente B", description: "[Nome do concorrente 2]" },
    { label: "Concorrente C", description: "[Nome do concorrente 3]" },
    { label: "Sem concorrentes", description: "Mercado sem competição direta" },
    { label: "Não sei", description: "Não conheço os concorrentes" }
  ]
})
```

Se souber os nomes:

```
AskUserQuestion({
  question: "O que diferencia seu produto dos concorrentes?",
  options: [
    { label: "Preço", description: "Mais barato" },
    { label: "Funcionalidades", description: "Mais features" },
    { label: "UX/UI", description: "Melhor experiência" },
    { label: "Integração", description: "Integra melhor com outros tools" },
    { label: "Suporte", description: "Melhor suporte" },
    { label: "Especificar", description: "Vou explicar a diferença" }
  ]
})
```

### 2.7 — Métricas de Sucesso

```
AskUserQuestion({
  question: "Quais métricas de sucesso são acompanhadas?",
  options: [
    { label: "MRR/ARR", description: "Receita recorrente" },
    { label: "DAU/MAU", description: "Usuários ativos" },
    { label: "Churn", description: "Taxa de cancelamento" },
    { label: "NPS", description: "Net Promoter Score" },
    { label: "Conversão", description: "Taxa de conversão" },
    { label: "Não sei", description: "Métricas não definidas" }
  ]
})
```

### 2.8 — Estágio do Produto

```
AskUserQuestion({
  question: "Qual é o estágio atual do produto?",
  options: [
    { label: "MVP", description: "Validando producto-mercado" },
    { label: "Crescimento", description: "Escalando usuário" },
    { label: "Maturidade", description: "Produto estável no mercado" },
    { label: "Declínio", description: "Precisa de pivoto" }
  ]
})
```

### 2.9 — Personas

```
AskUserQuestion({
  question: "Quantas personas principais existem no produto?",
  options: [
    { label: "1 persona", description: "Apenas um tipo de usuário" },
    { label: "2 personas", description: "Dois perfis principais" },
    { label: "3 personas", description: "Três perfis principais" },
    { label: "Mais de 3", description: "Vários perfis" },
    { label: "Não sei", description: "Personas não definidas" }
  ]
})
```

Se 2 ou mais, pergunte sobre cada uma separadamente.

### 2.10 — Escopo

```
AskUserQuestion({
  question: "O que está FORA do escopo intencional do produto?",
  options: [
    { label: "Mobile", description: "Mobile não é prioridade" },
    { label: "Integrações", description: "Sem integrações com terceiros" },
    { label: "Offline", description: "Não funciona offline" },
    { label: "Multi-idioma", description: "Apenas um idioma" },
    { label: "Enterprise", description: "Não foca em grandes empresas" },
    { label: "Tudo que preciso", description: "Vou listar o que está fora" }
  ]
})
```

### 2.11 — Aprovação para Prosseguir

```
AskUserQuestion({
  question: "Entrevista completa. Gerar documentação de negócio?",
  options: [
    { label: "Sim, gerar", description: "Gerar toda a documentação" },
    { label: "Preciso corrigir", description: "Voltar e corrigir" },
    { label: "Gerar parcialmente", description: "Gerar com o que temos" }
  ]
})
```

---

## Fase 3 — Geração dos Documentos

**SÓ execute após validação completa na Fase 2.**

### Estrutura a criar:

```
docs/business/
├── index.md                          (índice geral)
├── business-context.md               (contexto de negócio)
├── product-vision.md                 (visão de produto)
├── customer_communication.md         (diretrizes de comunicação)
├── product-strategy.md               (estratégia do produto)
├── competitive_landscape.md          (análise competitiva)
├── features/                         (catálogo de funcionalidades)
├── research/
│   ├── market-analysis.md
│   └── benchmarks.md
└── personas/
    ├── user-personas.md
    └── customer-journey.md
```

### Regras de Conteúdo

1. **Conteúdo baseado em respostas da entrevista (validado)**
2. **Funcionalidades = validadas pelo usuário**
3. **Personas = basadas nas respostas**
4. **Concorrentes = apenas os mencionados pelo usuário**
5. **Métricas = apenas as confirmadas**

### O que NÃO FAZER:

- NÃO inventar personas com nomes e histórias
- NÃO listar concorrentes não-mencionados
- NÃO assumir modelo de monetização
- NÃO criar visão de produto fictícia
- NÃO inferir dores e necessidades sem perguntar

### Marque o que não foi possível coletar:

```markdown
## Visão do Produto

**Visão:** [resposta do usuário ou "A DEFINIR"]

## Personas

**Persona 1:** A DEFINIR — necessário validar com usuário
**Persona 2:** A DEFINIR

## Concorrentes

⚠️ Informação não fornecida pelo usuário. Necessário validar.

## Métricas

⚠️ Métricas não definidas pelo usuário. Necessário confirmar.
```

---

## Critérios de Qualidade

- [ ] Todo conteúdo veio de resposta do usuário (validado)
- [ ] Nenhuma persona inventada
- [ ] Nenhum concorrente invented
- [ ] Seções não respondidas têm marcação "A DEFINIR"

---

## Conclusão

```
✅ Documentação de negócio criada!

Arquivos gerados em docs/business/:
  📄 {lista de arquivos}

⚠️ Itens pendentes:
  📋 {lista de items marcados como A DEFINIR}

Próximo passo:
  → /setup:build-tech   (documentação técnica)
  → /setup:start        (menu completo)
```

⛔ **IMPORTANTE: Após finalizar, AGUARDE feedback. NÃO prossiga automaticamente.**
