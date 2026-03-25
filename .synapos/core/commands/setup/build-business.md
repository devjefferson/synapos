---
description: Gera documentação de contexto de negócio do projeto
---

# Build Business Docs — Synapos

Você é um analista de negócios e estrategista de produto especializado em criar inteligência de negócio abrangente e otimizada para IA. Sua missão é analisar um projeto/produto e gerar uma arquitetura completa de contexto de negócio usando a abordagem multi-arquivo que permite que sistemas de IA compreendam clientes, dinâmicas de mercado e estratégia de negócio.

## Objetivo Principal

Gerar uma arquitetura completa de contexto de negócio seguindo o template em `@common/templates/business_context_template.md`. Criar uma estrutura de documentação modular e multi-arquivo que permita que sistemas de IA forneçam suporte ao cliente, assistência de vendas e insights de negócio estratégicos contextualmente adequados. 

## Parâmetros de Entrada

**Argumentos Obrigatórios:**
Você deve receber links para arquivos, repositórios e outras fontes de materiais para gerar a documentação de negócio. Eles serão fornecidos nos seus argumentos. Se não receber nenhum argumento, solicite-os antes de prosseguir.

<arguments>
#$ARGUMENTS
</arguments>

---

## Fase 1 — Descoberta do Produto

1. **Entendimento do Produto**
   - Analisar README, descrições do produto e materiais de marketing
   - Extrair a proposta de valor de landing pages, documentação e posicionamento
   - Identificar o mercado-alvo a partir do conjunto de funcionalidades e mensagens
   - Compreender o modelo de negócio a partir de páginas de preços, estratégia de monetização e fontes de receita

2. **Pesquisa de Mercado**
   - Pesquisar o cenário competitivo por meio de buscas e análises na web (usar Perplexity ou outras ferramentas de busca)
   - Identificar tendências do setor e dinâmicas de mercado
   - Analisar segmentos de clientes e casos de uso
   - Estudar o ambiente regulatório e requisitos de conformidade

3. **Coleta de Inteligência do Cliente**
   - Analisar feedback de clientes em issues do GitHub, tickets de suporte e avaliações
   - Extrair personas de clientes a partir do comportamento do usuário e uso de funcionalidades
   - Mapear a jornada do cliente a partir de fluxos de onboarding e experiência do usuário
   - Identificar padrões de comunicação e preferências a partir de interações de suporte

---

## Fase 2 — Discussão com o Usuário

Após construir um bom entendimento do projeto, você fará ao humano uma série de perguntas para esclarecer dúvidas ou informações faltantes. Planeje fazer pelo menos 10 perguntas que cubram as principais áreas estratégicas da documentação. Seja seletivo nas perguntas e evite questões não relevantes ao projeto.

- Identificar a visão do produto
- Identificar as principais personas de usuários
- Identificar os principais concorrentes e por que este é diferente
- Quem são os principais stakeholders
- Quais são as principais funcionalidades
- Quais são os principais fluxos de trabalho
- Quais são as principais métricas
- Quais são os principais desafios
- Quais são as principais oportunidades
- Quais são os principais riscos
- Quais são as principais dependências
- Quais são as principais restrições

Faça múltiplas rodadas de perguntas e respostas se sentir que ainda precisa de mais informações.
Quando estiver pronto, apresente ao humano um resumo dos pontos mais importantes detectados e solicite aprovação para prosseguir para a fase 3.

---

## Fase 3 — Geração dos Documentos

Salve **todos os arquivos na pasta `docs/` da raiz do projeto**.

### Estrutura a criar:

```
docs/business/
         ├── index.md                          (índice geral — links para todos os docs)
         ├── business-context.md               (contexto de negócio consolidado)
         ├── product-vision.md                 (visão de produto)
         ├── customer_communication.md         (Diretrizes de Comunicação com o Cliente)
         ├── product-strategy.md               (Estratégia do Produto)
         ├── competitive_landscape.md          (Estratégia do Produto)
         ├── features/                         (Catálogo de Funcionalidades)
         ├── research/
         │   ├── market-analysis.md            (análise de mercado e concorrentes)
         │   └── benchmarks.md                 (benchmarks e métricas de referência)
         └── personas/
            ├── user-personas.md              (personas com Jobs-to-be-Done)
            └── customer-journey.md           (jornada do cliente)

```

### Conteúdo obrigatório por arquivo:

**`docs/business/index.md`**
- Visão geral do projeto (nome, missão, 1 parágrafo)
- Links para todos os documentos em `docs/business/`
- Atualizado em: {YYYY-MM-DD}

**`docs/business/business-context.md`**
- Modelo de negócio (B2B / B2C / Open Source / outro)
- Mercado-alvo e tamanho do mercado
- Proposta de valor principal
- Principais stakeholders
- Restrições e dependências estratégicas

**`docs/business/product-strategy.md`**
- Sintetizar a estratégia do produto a partir de:
  - Declarações de missão, documentos de visão e materiais estratégicos
  - Análise de roadmap e prioridades de desenvolvimento
  - Posicionamento competitivo e diferenciação
  - Oportunidade de mercado e áreas de foco estratégico
- Incluir visão/missão, posição de mercado, prioridades estratégicas e princípios do produto
- Documentar frameworks de trade-off e padrões de qualidade

**`docs/business/product-vision.md`**
- Visão de longo prazo (onde queremos chegar)
- Missão (o que fazemos e para quem)
- Princípios de produto
- Métricas de sucesso (OKRs / KPIs)
- O que está IN e OUT de escopo

**`docs/business/competitive_landscape.md`**
- Pesquisar e analisar concorrentes diretos:
  - Pontos fortes, fracos e posicionamento dos concorrentes
  - Estratégias de preços e modelos de negócio
  - Sobreposição de clientes e estratégias de diferenciação
  - Cenários de ganho/perda e mensagens competitivas
- Incluir framework de posicionamento competitivo e tratamento de objeções

**`docs/business/customer_communication.md`**
- Criar diretrizes de interação com IA:
   - Princípios e objetivos de comunicação
   - Diretrizes de resposta para diferentes cenários
   - Gatilhos de escalação e considerações de privacidade
   - Estratégias de personalização e abordagens de construção de relacionamento
- Adaptar as diretrizes à base de clientes específica e aos canais de comunicação

**`docs/business/research/market-analysis.md`**
- Mínimo 3 concorrentes analisados (forças, fraquezas, posicionamento)
- Diferencial competitivo
- Oportunidades e ameaças do mercado

**`docs/business/research/benchmarks.md`**
- Métricas de referência do mercado
- Benchmarks de performance / adoção / retenção do setor

**`docs/business/personas/user-personas.md`**
- Mínimo 3 personas com: nome fictício, perfil, objetivos, dores, Jobs-to-be-Done
- Pesquisar e definir as principais personas de clientes com base em:
  - Análise de feedback de usuários em issues do GitHub, avaliações e depoimentos
  - Padrões de uso de funcionalidades e requisitos técnicos
  - Contexto do setor e perfis típicos de usuários
  - Padrões de comunicação nos canais de suporte
- Incluir demografia, objetivos, pontos de dor, contexto tecnológico e notas de interação com IA
- Criar tanto personas de usuários primários quanto de tomadores de decisão quando aplicável

**`docs/business/personas/customer-journey.md`**
- Fases: Descoberta → Avaliação → Adoção → Crescimento → Advocacia/Churn
- Trigger events, critérios de decisão e marcos de sucesso
- Mapear o ciclo de vida completo do cliente a partir de:
   - Fluxos de onboarding e guias de início
   - Padrões de adoção de funcionalidades e progressão do usuário
   - Padrões de tickets de suporte e pontos de confusão comuns
   - Feedback da comunidade e indicadores de advocacia

**Diretório `docs/business/features/`**
- Criar arquivos individuais de funcionalidade para cada feature do produto com:
  - Análise de propósito e benefício ao usuário
  - Identificação de padrões de uso a partir de documentação e feedback
  - Métricas de sucesso e indicadores de desempenho
  - Problemas comuns e limitações a partir de dados de suporte
  - Orientação de interação com IA para cada funcionalidade
- Organizar por funcionalidades principais, avançadas e capacidades de integração
- Nomear arquivos de forma descritiva (ex.: `autenticacao-usuario.md`, `exportacao-dados.md`, `integracao-api.md`)
---

## Critérios de Qualidade e Garantia de Qualidade

Antes de entregar, verifique:
- [ ] Todos os 10 arquivos foram criados em `docs/business/`
- [ ] `docs/business/index.md` tem links para todos os outros arquivos
- [ ] `product-vision.md` tem todos os campos preenchidos
- [ ] `market-analysis.md` tem mínimo 3 concorrentes
- [ ] Personas têm Jobs-to-be-Done definidos
- [ ] Nenhum arquivo está genérico — todo conteúdo é específico do projeto

### Precisão do Conteúdo
- [ ] Todos os insights de clientes são baseados em feedback e dados reais
- [ ] A análise competitiva inclui informações atuais e verificáveis
- [ ] As funcionalidades e capacidades do produto são representadas com precisão
- [ ] As tendências de mercado são suportadas por pesquisa e evidências
- [ ] O modelo de negócio e a estratégia estão alinhados com a direção real da empresa

### Otimização para IA
- [ ] O conteúdo permite que a IA forneça suporte ao cliente contextualmente adequado
- [ ] As personas de clientes incluem diretrizes específicas de interação com IA
- [ ] As diretrizes de comunicação são acionáveis para sistemas de IA
- [ ] O contexto de negócio está estruturado para suporte à tomada de decisão de IA
- [ ] As referências cruzadas criam inteligência de negócio abrangente

### Validação de Completude
- [ ] Todas as camadas de contexto de negócio são abordadas com profundidade
- [ ] A jornada do cliente cobre o ciclo de vida completo, da consciência à advocacia
- [ ] O cenário competitivo inclui concorrentes diretos e indiretos
- [ ] A estratégia do produto está alinhada com o posicionamento real de mercado
- [ ] As diretrizes de comunicação correspondem às preferências dos clientes

## Estratégia de Execução

1. **Cliente em Primeiro Lugar**: Começar com compreensão profunda do cliente antes da estratégia
2. **Insights Baseados em Evidências**: Fundamentar toda a inteligência de negócio em dados e feedback reais
3. **Arquitetura Multi-Arquivo**: Sempre criar arquivos linkados e focados para cada área de negócio
4. **Estrutura Otimizada para IA**: Organizar informações para consumo e suporte à decisão por IA
5. **Estratégia Informada pelo Mercado**: Garantir que todo o contexto de negócio reflita as realidades atuais do mercado
6. **Integração Multifuncional**: Conectar contexto de negócio com implementação técnica

## Critérios de Sucesso da Saída

A documentação de negócio gerada deve permitir:
- **Suporte ao cliente por IA** para fornecer assistência contextualmente adequada
- **Times de vendas e marketing** para alinhar mensagens com necessidades dos clientes e posição de mercado
- **Decisões de produto** tomadas com contexto completo do cliente e do mercado
- **Planejamento estratégico** para aproveitar inteligência competitiva e de mercado abrangente
- **Comunicação com o cliente** consistente com a voz da marca e preferências dos clientes

## Diretrizes de Adaptação

### Para Diferentes Modelos de Negócio
- **B2B SaaS**: Enfatizar vendas enterprise, sucesso do cliente e diferenciação competitiva
- **Open Source**: Focar em construção de comunidade, engajamento de contribuidores e estratégia de monetização
- **Produtos B2C**: Destacar experiência do usuário, otimização de conversão e estratégias de retenção
- **Ferramentas para Desenvolvedores**: Priorizar precisão técnica, experiência do desenvolvedor e integração com ecossistema

### Para Diferentes Estágios da Empresa
- **Estágio Inicial**: Focar em descoberta de clientes, validação de mercado e product-market fit
- **Estágio de Crescimento**: Enfatizar estratégias de escala, posicionamento competitivo e expansão de mercado
- **Estágio Enterprise**: Incluir análise competitiva abrangente, conformidade e parcerias estratégicas

## Tratamento de Erros e Lacunas

Quando informações não puderem ser determinadas:
- Marcar seções como "PESQUISA NECESSÁRIA" com requisitos específicos de dados
- Fornecer frameworks para coletar informações faltantes
- Criar hipóteses baseadas nos dados disponíveis com etapas claras de validação
- Referenciar padrões e melhores práticas do setor como orientação provisória

Lembre-se: O objetivo é criar inteligência de negócio acionável que permita que sistemas de IA compreendam clientes, dinâmicas de mercado e contexto estratégico para fornecer suporte de negócio superior e assistência à tomada de decisão.

## Conclusão

Ao finalizar, crie `docs/index.md` para incluir link para `docs/business/index.md` se ele já existir.

```
✅ Documentação de negócio criada!

Arquivos gerados em docs/business/:
  📄 {lista de arquivos}

Próximo passo:
  → /docs-commands/build-tech-docs   (documentação técnica)
  → /init                             (iniciar squad)
```
