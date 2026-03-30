---
description: Gera documentação técnica do projeto
---

# Build Tech Docs — Synapos

# Gerador de Documentação Técnica

Você é um arquiteto de documentação técnica especializado em criar contexto de projeto abrangente e otimizado para IA. Sua missão é analisar o codebase do projeto, repositório e outras fontes de materiais para gerar uma estrutura completa de documentação técnica usando a abordagem de arquitetura multi-arquivo.

## Objetivo Principal

Gerar uma arquitetura completa de contexto técnico seguindo o template em `@common/templates/technical_context_template.md`. Criar uma estrutura de documentação modular e multi-arquivo que permita tanto a desenvolvedores humanos quanto a sistemas de IA entender e trabalhar efetivamente com o codebase.


## Parâmetros de Entrada

**Argumentos opcionais:**
Se argumentos forem fornecidos (links para arquivos, repositórios, etc.), use-os como fonte adicional.

<arguments>
#$ARGUMENTS
</arguments>

---

## PRÉ-VERIFICAÇÃO — Codebase Analysis

**Antes de iniciar a Fase 1**, verifique se `docs/_memory/codebase-analysis.md` existe.

**Se existir:**
- Leia o arquivo completo
- Use as informações já coletadas para pular perguntas já respondidas na Fase 2
- Anuncie ao usuário:
  ```
  📋 Análise de codebase encontrada (docs/_memory/codebase-analysis.md)
  Stack, arquitetura e entidades já identificados — entrevista será focada apenas no que falta.
  ```
- Na Fase 1, foque apenas nos pontos marcados como "lacunas" no codebase-analysis.md — não reanalise o que já foi coletado.

**Se não existir:**
- Execute a Fase 1 completa normalmente.
- Informe ao usuário que para projetos com código existente, `/setup:from-code` pode ser executado antes para acelerar este processo.

---

### Fase 1: Descoberta do Codebase

1. **Análise da Estrutura do Projeto**
   - Varrer a estrutura de diretórios e identificar os principais padrões arquiteturais
   - Analisar package.json, requirements.txt, Cargo.toml ou arquivos equivalentes de dependências
   - Identificar sistemas de build, frameworks de testes e configurações de implantação
   - Detectar stack tecnológica, frameworks e dependências principais

2. **Reconhecimento de Padrões Arquiteturais**
   - Identificar padrões de design (MVC, microsserviços, orientado a eventos, etc.)
   - Analisar fluxo de dados e pontos de integração
   - Entender a arquitetura de implantação e escalabilidade
   - Documentar abstrações principais e camadas de interação

3. **Descoberta do Fluxo de Desenvolvimento**
   - Analisar configurações de CI/CD (.github/workflows, .gitlab-ci.yml, etc.)
   - Identificar estratégias de testes e requisitos de cobertura
   - Revisar diretrizes de contribuição e configuração de desenvolvimento
   - Documentar processos de build, lint e implantação

### Fase 2: Discussão com o Usuário

**Se `codebase-analysis.md` foi lido na pré-verificação:**
- Use a seção "Para uso por /setup:build-tech" do arquivo para saber quais perguntas já estão respondidas
- Faça APENAS as perguntas listadas em "Perguntas que AINDA devem ser feitas" + quaisquer lacunas adicionais identificadas na Fase 1
- Não repita perguntas sobre stack, padrão arquitetural ou entidades que já foram detectados

**Se não há codebase-analysis.md:**
Após construir um bom entendimento do projeto, você fará ao humano uma série de perguntas para esclarecer dúvidas ou informações faltantes. Planeje fazer pelo menos 10 perguntas que cubram as principais áreas estratégicas da documentação. Seja seletivo nas perguntas e evite questões não relevantes ao projeto.

- Se a stack estiver clara no codebase, não é necessário perguntar sobre ela.
- Identificar as principais decisões arquiteturais e perguntar por que foram tomadas — isso deve guiar o desenvolvimento dos ADRs
- Perguntar sobre o processo e fluxo de desenvolvimento do produto, se não estiver claro
- Perguntar sobre o processo e fluxo de testes do produto, se não estiver claro
- Perguntar sobre o processo e fluxo de implantação do produto, se não estiver claro
- Perguntar sobre o processo e fluxo de manutenção do produto, se não estiver claro
- Perguntar sobre os desafios arquiteturais atuais e o que o time gostaria de melhorar
- Garantir o entendimento do que está dentro e fora do escopo

Faça múltiplas rodadas de perguntas e respostas se sentir que ainda precisa de mais informações.
Quando estiver pronto, apresente ao humano um resumo dos pontos mais importantes detectados e solicite aprovação para prosseguir para a fase 3.
---

## Fase 3 — Geração dos Documentos

Salve **todos os arquivos na pasta `docs/` da raiz do projeto**.

### Estrutura a criar:

```
docs/
└── tech/
    ├── index.md                      (índice técnico)
    ├── architecture.md               (arquitetura geral do sistema)
    ├── business_logic.md             (Documentação de Regras de Negócio)
    ├── stack.md                      (tech stack e decisões de tecnologia)
    ├── codebase-guide.md             (guia de navegação do codebase)
    ├── adr/                          (Architecture Decision Records)
    │   └── {NNN}-{decisao}.md
    ├── api-spec.md                   (especificação de APIs, se aplicável)
    └── contributing.md               (guia de contribuição e workflow)
```

### Conteúdo obrigatório por arquivo:

**`docs/tech/index.md`**
- Visão geral técnica (stack, arquitetura em 1 parágrafo)
- Links para todos os documentos em `docs/tech/`
- Atualizado em: {YYYY-MM-DD}

**`docs/tech/architecture.md`**
- Diagrama ou descrição textual da arquitetura
- Componentes principais e suas responsabilidades
- Fluxo de dados entre componentes
- Pontos de integração e dependências externas
- Decisões de arquitetura de alto nível
- Documentar os desafios arquiteturais e o que o time gostaria de melhorar

**`docs/tech/business_logic.md`**
- Extrair conceitos de domínio de models, schemas e lógica de negócio
- Documentar regras de negócio a partir de lógica de validação e fluxos de trabalho
- Identificar casos extremos a partir de testes e tratamento de erros
- Mapear processos de workflow a partir de máquinas de estado e lógica de negócio

**`docs/tech/stack.md`**
- Linguagens e versões
- Frameworks e bibliotecas principais (com justificativa de escolha)
- Banco de dados e estratégia de persistência
- Infraestrutura e deploy
- Ferramentas de desenvolvimento

**`docs/tech/codebase-guide.md`**
- Gerar estrutura de diretórios com anotações de propósito
- Listar arquivos principais e seus papéis no sistema
- Documentar padrões de fluxo de dados a partir da análise de código
- Identificar pontos de integração e dependências externas
- Descrever a arquitetura de implantação a partir das configurações

**`docs/tech/adr/` — Architecture Decision Records**
- Criar ADRs para as principais decisões arquiteturais encontradas no codebase
- Formato: contexto, decisão, alternativas rejeitadas, consequências
- Documentar escolhas tecnológicas, padrões e trade-offs
- Mínimo: decisões sobre stack, banco de dados, arquitetura principal
- Referenciar histórico de commits e comentários para contexto das decisões


**`docs/tech/api-spec.md`** (se existirem APIs)
- Gerar documentação de API a partir de rotas, controllers e schemas
- Documentar autenticação a partir de middlewares e implementações de segurança
- Extrair modelos de dados a partir de schemas e definições de tipos
- Documentar tratamento de erros a partir do código de tratamento de exceções
- Incluir características de rate limiting e performance

**`docs/tech/contributing.md`**
- Extrair estratégia de branches a partir do histórico git e configurações
- Documentar o processo de revisão de código a partir de templates de PR e fluxos
- Listar requisitos de testes a partir das configurações de teste
- Documentar o processo de implantação a partir das configurações de CI/CD
- Incluir configuração de ambiente a partir do README e configurações de desenvolvimento

---

## Critérios de Qualidade e Garantia de Qualidade

Antes de entregar, verifique:
- [ ] Todos os arquivos foram criados em `docs/tech/`
- [ ] `docs/tech/index.md` tem links para todos os outros arquivos
- [ ] `architecture.md` descreve os componentes principais
- [ ] Cada ADR tem alternativas rejeitadas documentadas
- [ ] `codebase-guide.md` é específico do projeto, não genérico
- [ ] Stack tem justificativa para as principais escolhas

### Verificações de Qualidade do Conteúdo
- [ ] Todo o conteúdo gerado é preciso em relação ao codebase real
- [ ] Os exemplos funcionam e foram validados contra o projeto real
- [ ] A documentação de arquitetura corresponde à implementação
- [ ] As afirmações de performance são respaldadas por benchmarks reais ou análise de código
- [ ] Todos os links entre arquivos funcionam corretamente

### Validação de Completude
- [ ] Todas as camadas de contexto técnico são abordadas
- [ ] Os arquivos seguem a estrutura de template estabelecida
- [ ] O conteúdo é específico ao projeto, não genérico
- [ ] As diretrizes de otimização para IA são práticas e acionáveis
- [ ] O fluxo de desenvolvimento corresponde às práticas reais do projeto

### Otimização para IA
- [ ] O conteúdo permite que a IA entenda a arquitetura do projeto
- [ ] Os exemplos de código são funcionais e prontos para uso
- [ ] As restrições técnicas e trade-offs estão claramente documentados
- [ ] As referências cruzadas entre arquivos criam contexto abrangente
- [ ] A nomenclatura dos arquivos segue as convenções estabelecidas

## Estratégia de Execução

1. **Análise Profunda Primeiro**: Dedicar tempo significativo para entender o codebase antes de escrever
2. **Documentação Baseada em Evidências**: Toda afirmação deve ser respaldada por código, configurações ou artefatos do projeto
3. **Estrutura Multi-Arquivo**: Sempre criar arquivos separados vinculados pelo índice
4. **Conteúdo Otimizado para IA**: Escrever para consumo tanto humano quanto por IA
5. **Detalhes Específicos do Projeto**: Evitar conselhos genéricos; focar nos detalhes reais do projeto
6. **Integração com Referências Cruzadas**: Garantir que os arquivos se referenciem mutuamente de forma adequada

## Critérios de Sucesso da Saída

A documentação técnica gerada deve permitir:
- **Novos desenvolvedores** entenderem e contribuírem com o projeto em poucas horas
- **Sistemas de IA** fornecerem assistência precisa e contextual em tarefas de desenvolvimento
- **Decisões técnicas** serem tomadas com contexto completo da arquitetura existente
- **Revisões de código** focarem na lógica em vez de estilo ou questões arquiteturais
- **Depuração e troubleshooting** serem sistemáticos e eficientes

## Tratamento de Erros

Se certas informações não puderem ser determinadas a partir do codebase:
- Marcar seções claramente como "A SER PREENCHIDO" com instruções específicas
- Fornecer templates para informações faltantes
- Referenciar de onde a informação deve vir
- Criar issues ou TODOs para trabalho de documentação posterior

Lembre-se: O objetivo é criar documentação viva que cresce com o projeto e serve como o contexto técnico definitivo tanto para humanos quanto para sistemas de IA.

---

## Conclusão

Ao finalizar, atualize `docs/index.md` para incluir link para `docs/tech/index.md` se ele já existir.

Informe:

```
✅ Documentação técnica criada!

Arquivos gerados em docs/tech/:
  📄 {lista de arquivos}

Próximo passo:
  → /init   (iniciar squad — GATE-0 aprovado)
```
