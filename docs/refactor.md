# Synapos — Documentation Architecture, Entropy Reduction & Knowledge Engineering

## 1. Papel e responsabilidade

Atue como um **Principal AI Architect**, especialista em:

- Context Engineering.
- Knowledge Engineering.
- AI Agent Orchestration.
- Software Architecture.
- Documentation Architecture.
- Product Engineering.
- Memory Systems.
- Token Optimization.
- UX/UI Engineering.

Também atue como Principal Software Engineer, Technical Writer e advogado do diabo.

Sua responsabilidade é auditar e transformar a maneira como o Synapos produz, organiza, armazena, recupera e mantém conhecimento técnico e de produto.

Não seja um executor passivo. Questione decisões, identifique desperdícios, confronte contradições e não preserve documentos apenas porque já existem.

**Não confunda quantidade de documentação com maturidade arquitetural.**

---

# 2. Missão

O Synapos possui documentos demais, informações repetidas, possíveis sobreposições de responsabilidades e conteúdos que nem sempre ajudam os agentes a executar suas tarefas.

Isso gera:

- Consumo desnecessário de tokens.
- Contextos extensos.
- Informações contraditórias.
- Decisões espalhadas por vários arquivos.
- Agentes consultando documentos desnecessários.
- Dificuldade para identificar a fonte oficial.
- Documentação desatualizada.
- Repetição de regras entre agentes, skills e documentos.
- Dificuldade para recuperar o contexto realmente necessário.

Sua missão é transformar esse cenário em uma arquitetura documental:

**Enxuta, precisa, hierárquica, consistente, recuperável e orientada à execução.**

Não quero mais documentos. Quero menos documentos, com maior densidade de informação útil.

---

# 3. Princípio central: Entropia documental

Utilize como fundamento conceitual a Segunda Lei da Termodinâmica:

> Em um sistema isolado, a entropia total tende a aumentar com o tempo. Os processos naturais são irreversíveis sem intervenção externa.

Aplique essa analogia ao sistema de documentação do Synapos.

Com o passar do tempo, projetos acumulam:

- Documentos duplicados.
- Decisões antigas.
- Regras conflitantes.
- Informações obsoletas.
- Referências quebradas.
- Contextos abandonados.
- Especificações que não representam mais o sistema.
- Documentação que ninguém consulta.
- Conhecimento distribuído sem hierarquia.

Esse processo representa o aumento da entropia documental.

O Synapos deve possuir mecanismos ativos para combater esse crescimento.

## 3.1. Fatores de entropia

| Fator | Efeito |
|---|---|
| Duplicidade | Aumenta a ambiguidade |
| Contradição | Reduz a confiabilidade |
| Obsolescência | Provoca decisões incorretas |
| Fragmentação | Aumenta o custo de recuperação |
| Excesso de detalhe | Aumenta o consumo de tokens |
| Falta de hierarquia | Dificulta encontrar a fonte de verdade |
| Ausência de manutenção | Degrada o conhecimento ao longo do tempo |

## 3.2. Entropy Reduction

Projete um processo de manutenção contínua:

```text
DOCUMENTATION
     |
     v
DISCOVER
     |
     v
CLASSIFY
     |
     v
DETECT REDUNDANCY
     |
     v
DETECT CONFLICTS
     |
     v
IDENTIFY SOURCE OF TRUTH
     |
     v
CONSOLIDATE
     |
     v
VALIDATE
     |
     v
MAINTAIN
```

Cada documento deve justificar sua existência.

Pergunte:

1. Este documento possui responsabilidade única?
2. A informação já existe em outro lugar?
3. Existe uma fonte mais confiável?
4. O agente realmente precisa consultar este documento?
5. Ele contém regras operacionais ou apenas explicações?
6. Está atualizado?
7. Pode ser incorporado a outro documento sem perder clareza?
8. Sua existência reduz ou aumenta a complexidade?

Não elimine informações importantes apenas para reduzir arquivos.

**Minimize a entropia, não o conhecimento.**

---

# 4. Archify como referência arquitetural obrigatória

Utilize como referência:

https://github.com/tt-a1i/archify

Antes de implementar alterações:

1. Analise o README.
2. Analise a estrutura do repositório.
3. Analise a skill `SKILL.md`.
4. Analise os exemplos.
5. Entenda os tipos de diagramas.
6. Identifique os conceitos aplicáveis ao Synapos.

Não copie o Archify. Utilize seus princípios como referência arquitetural.

## 4.1. Progressive Disclosure

Avalie a abordagem:

```text
MAP
 |
 v
READ
 |
 v
FULL
```

Adapte-a à documentação do Synapos.

**MAP — Visão geral**

O agente precisa descobrir rapidamente:

- O que existe.
- Onde está.
- Qual é a responsabilidade de cada componente.
- Quais documentos são relevantes.
- Como os componentes se relacionam.

**READ — Contexto necessário**

O agente consulta somente os documentos relevantes para sua responsabilidade e tarefa.

**FULL — Profundidade**

O agente acessa a especificação completa somente quando necessário.

Não carregue documentos completos apenas para descobrir onde está uma informação.

## 4.2. Representação visual

Avalie o uso do Archify para representar:

- Arquitetura do Synapos.
- Fluxo de documentação.
- Fluxo de produto.
- Ciclo de vida de uma feature.
- Relacionamento entre agentes.
- Hierarquia de conhecimento.
- Fluxo de recuperação de memória.
- Handoffs entre Product, Architecture, Development e Review.

Utilize o diagrama adequado:

- Architecture.
- Workflow.
- Sequence.
- Data Flow.
- Lifecycle.

Não transforme tudo em diagramas. Use visualizações somente quando aumentarem a compreensão.

Toda representação deve ser fundamentada em informações reais do repositório.

## 4.3. Instalação do Archify

Verifique se a skill está instalada.

Se não estiver, avalie sua instalação:

```bash
npx skills add tt-a1i/archify -g
```

Confira se o comando continua válido na documentação oficial.

Verifique a instalação antes de afirmar que está disponível.

---

# 5. Skills de design como padrão operacional

As seguintes skills devem ser referências padrão para tarefas de UX, UI, design visual e interação.

### Emil Kowalski

https://github.com/emilkowalski/skill

Foco:

- Motion design.
- Microinterações.
- Animações.
- Feedback visual.
- Transições.
- Comportamento de interfaces.

### Impeccable

https://github.com/pbakaus/impeccable

Foco:

- Direção visual.
- Design critique.
- Hierarquia visual.
- Tipografia.
- Consistência.
- Acessibilidade.
- Polimento de interfaces.

### Taste

https://github.com/Leonxlnx/taste-skill

Foco:

- Direção de arte.
- Qualidade visual.
- Referências estéticas.
- Identidade de interfaces.
- Composição.
- Acabamento visual.

## 5.1. Regra de utilização

Essas skills devem ser consideradas referências padrão de qualidade, não conteúdo que precisa ser carregado em todas as tarefas.

O agente deve:

1. Verificar se as skills estão instaladas.
2. Identificar quais são relevantes.
3. Consultar suas instruções.
4. Aplicar seus princípios quando a tarefa exigir.
5. Evitar carregar skills não relacionadas.

| Atividade | Skill prioritária |
|---|---|
| Implementar animações | Emil Kowalski |
| Revisar UX | Impeccable |
| Criar interface | Taste + Impeccable |
| Melhorar identidade visual | Taste |
| Revisar microinterações | Emil Kowalski |
| Implementar API sem interface | Nenhuma das três, salvo necessidade |

## 5.2. Instalação e verificação

Investigue a instalação das três skills no Claude Code.

Comandos de referência:

```bash
npx skills add emilkowalski/skill -g -a claude-code -s '*' -y

npx skills add pbakaus/impeccable -g -a claude-code -s '*' -y

npx skills add Leonxlnx/taste-skill -g -a claude-code -s '*' -y
```

Antes de executar:

- Confira os repositórios oficiais.
- Verifique se os nomes e comandos continuam válidos.
- Analise os arquivos e permissões.
- Identifique conflitos com skills já instaladas.
- Evite instalações duplicadas.
- Verifique se a instalação global ou local é mais adequada.

Não declare uma skill disponível sem verificar.

---

# 6. Task Observer e Claude-Mem — avaliação e integração

Investigue a possibilidade de instalar e integrar os dois projetos ao ambiente do Synapos.

Não os remova da análise por preferência arquitetural. Eles fazem parte do escopo desta modernização.

Entretanto, também não os instale cegamente.

A adoção deve ser baseada em evidências de compatibilidade, utilidade, custo e segurança.

## 6.1. Task Observer

Repositório:

https://github.com/SquidyInk/task-observer

Objetivo:

Avaliar o Task Observer como mecanismo de observação e melhoria contínua das skills.

Investigue:

- Como captura correções feitas pelo usuário.
- Como registra decisões e julgamentos.
- Como transforma observações em melhorias de skills.
- Como funciona sua estrutura de referências.
- Como evita carregar todo o conhecimento em todas as execuções.
- Como pode ser utilizado no fluxo de desenvolvimento do Synapos.
- Como instalar no Claude Code.
- Quais são suas dependências e limitações.

Avalie sua utilidade para identificar padrões como:

- Agentes que ignoram regras.
- Correções recorrentes de frontend.
- Decisões arquiteturais frequentemente violadas.
- Requisitos esquecidos.
- Problemas recorrentes de documentação.
- Skills que precisam ser aprimoradas.

O objetivo é transformar erros e correções recorrentes em aprendizado reutilizável.

Entretanto:

- Uma correção pontual não deve virar automaticamente uma regra permanente.
- Uma observação não deve alterar uma ADR.
- Uma skill não deve ser modificada silenciosamente.
- Padrões recorrentes devem ser identificados antes de serem promovidos.

Defina um processo de validação antes de transformar observações em conhecimento permanente.

## 6.2. Claude-Mem

Repositório:

https://github.com/thedotmack/claude-mem

Objetivo:

Avaliar o Claude-Mem como mecanismo de persistência e recuperação de contexto entre sessões do Claude Code.

Investigue:

- Captura automática de atividades.
- Resumos de sessões.
- Recuperação de observações.
- Busca semântica.
- Armazenamento local.
- Hooks.
- Worker.
- Dependências.
- Consumo adicional de tokens.
- Privacidade e segurança.
- Compatibilidade com a versão instalada do Claude Code.

Verifique a documentação oficial antes de instalar.

Métodos de instalação de referência:

```bash
npx claude-mem install
```

Alternativamente, pelo marketplace:

```text
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

Não substitua a instalação documentada por uma instalação genérica de biblioteca que não configure os hooks e serviços necessários.

Verifique o estado real da instalação.

## 6.3. Integração com a memória do Synapos

O Synapos já possui sua própria arquitetura de memória.

Não permita que dois sistemas concorrentes armazenem e apresentem a mesma informação sem uma divisão clara de responsabilidades.

Investigue a seguinte possibilidade:

```text
              CLAUDE-MEM
                  |
          Session Observations
                  |
                  v
             TASK OBSERVER
                  |
          Corrections / Patterns
                  |
                  v
               SYNAPOS
                  |
        Governed Project Knowledge
                  |
          +-------+-------+
          |               |
         ADRs          Memories
          |               |
          +-------+-------+
                  |
             Source of Truth
```

Esse é um modelo conceitual, não uma arquitetura obrigatória.

Valide se os projetos realmente suportam essa divisão.

Defina:

- O que Claude-Mem captura.
- O que o Task Observer aprende.
- O que o Synapos deve persistir.
- O que deve ser promovido para uma skill.
- O que deve virar uma ADR.
- O que deve permanecer como observação temporária.
- O que não deve ser armazenado.
- Como evitar duplicidade.
- Como evitar aumento desnecessário de contexto.

**Claude-Mem não é a fonte de verdade arquitetural do Synapos.**

**Task Observer não possui autorização para alterar decisões arquiteturais.**

**Synapos continua responsável pela governança do conhecimento do projeto.**

## 6.4. Decisão de adoção

Para cada ferramenta, apresente:

| Critério | Avaliação necessária |
|---|---|
| Benefício operacional | Qual problema resolve? |
| Compatibilidade | Funciona com o ambiente atual? |
| Custo de tokens | Quanto contexto adiciona? |
| Complexidade | Quanto aumenta a manutenção? |
| Sobreposição | Duplica funcionalidades do Synapos? |
| Segurança | Quais dados captura e armazena? |
| Instalação | Foi testada com sucesso? |
| Reversibilidade | Como remover sem prejudicar o projeto? |

Classifique a decisão:

- Instalar e integrar.
- Instalar apenas para experimentação.
- Utilizar somente como referência.
- Não adotar, justificando tecnicamente.

Se forem úteis, implemente a integração.

Se houver sobreposição ou custo desproporcional, recomende uma adoção limitada.

**Não descarte ferramentas úteis sem investigação e não adicione dependências apenas por novidade.**

---

# 7. Redesenho da arquitetura documental

Faça uma auditoria completa da documentação técnica e de produto.

Identifique:

- Documentos duplicados.
- Documentos redundantes.
- Documentos obsoletos.
- Documentos sem responsabilidade definida.
- Informações repetidas em agentes.
- Informações repetidas em skills.
- Regras conflitantes.
- Documentos que deveriam ser consolidados.
- Documentos que deveriam ser removidos.
- Documentos que deveriam ser divididos.
- Documentos que não precisam ser carregados durante a execução.

## 7.1. Classificação

| Categoria | Ação |
|---|---|
| Essencial | Preservar |
| Fonte de verdade | Preservar e priorizar |
| Redundante | Consolidar |
| Obsoleto | Arquivar ou remover |
| Fragmentado | Reestruturar |
| Histórico | Manter fora do contexto operacional |
| Informativo | Avaliar necessidade |
| Sem utilidade clara | Candidato à remoção |

Não remova informações sem verificar referências em outros arquivos, agentes, comandos e pipelines.

## 7.2. Responsabilidade única

Cada documento deve possuir uma responsabilidade clara.

Não crie vários arquivos que respondam à mesma pergunta.

Se vários documentos repetem as mesmas regras, consolide o que for equivalente.

Mantenha separação somente quando existir uma diferença real de responsabilidade.

## 7.3. Documentação operacional, de referência e histórica

**Operacional:** o que o agente precisa saber para executar.

**Referência:** explicações, exemplos e detalhes consultados sob demanda.

**Histórica:** decisões antigas, mudanças e contexto histórico.

Não carregue documentação histórica automaticamente.

---

# 8. ADRs como fonte de verdade

ADRs aprovadas e vigentes são contratos arquiteturais do projeto.

Uma regra que pode ser ignorada não é uma regra.

Hierarquia:

```text
ADR APPROVED / ACTIVE
          |
          v
EXPLICIT PROJECT RULES
          |
          v
OFFICIAL PRODUCT / TECH DOCUMENTATION
          |
          v
PROJECT MEMORY
          |
          v
SESSION CONTEXT
          |
          v
TASK CONTEXT
          |
          v
GENERAL AGENT KNOWLEDGE
```

Regras:

1. Uma memória não pode sobrescrever uma ADR.
2. Uma skill não pode sobrescrever uma ADR.
3. Um agente não pode ignorar uma ADR por preferência própria.
4. Uma implementação conflitante deve ser identificada.
5. Uma mudança arquitetural exige atualização documental.
6. ADRs substituídas devem manter rastreabilidade.
7. Decisões relevantes devem consultar o conteúdo original da ADR.

Não carregue todas as ADRs em todas as execuções. Utilize índices e recuperação contextual.

---

# 9. Redesenho da documentação de produto

Avalie o fluxo de Product Discovery e Product Documentation.

O Product / Analyst deve transformar ideias vagas em especificações objetivas.

Fluxo de referência:

```text
IDEA
 |
 v
BRAINSTORMING
 |
 v
DISCOVERY
 |
 v
REQUIREMENTS
 |
 v
SCOPE
 |
 v
ACCEPTANCE CRITERIA
 |
 v
PRODUCT SPECIFICATION
 |
 v
TECHNICAL HANDOFF
```

A profundidade deve ser proporcional à complexidade e ao risco.

Uma alteração pequena não precisa de um PRD completo.

Uma feature complexa não deve começar diretamente pela implementação.

## 9.1. Product Discovery

O agente deve:

- Entender o problema.
- Questionar pressupostos.
- Identificar o usuário.
- Investigar o contexto.
- Explorar alternativas.
- Identificar riscos.
- Diferenciar problema de solução.
- Identificar restrições.
- Questionar funcionalidades desnecessárias.

## 9.2. Requirements

Inclua quando necessário:

- Objetivo.
- Problema.
- Escopo.
- Requisitos funcionais.
- Requisitos não funcionais.
- Regras de negócio.
- Restrições.
- Critérios de aceite.
- Casos extremos.
- Fora de escopo.
- Riscos e dependências.

Não transforme cada item em um documento independente.

Prefira um artefato principal bem estruturado, com referências complementares quando necessário.

## 9.3. Technical Handoff

O resultado do trabalho de produto deve esclarecer:

- O que precisa ser construído.
- Por que precisa ser construído.
- Como deve se comportar.
- Quais são as regras.
- O que não deve ser implementado.
- Como verificar a entrega.

Não deixe decisões que deveriam ser resolvidas no planejamento serem inventadas durante a implementação.

---

# 10. Redesenho da documentação técnica

O fluxo técnico deve ser proporcional à complexidade e ao risco.

```text
PRODUCT SPECIFICATION
          |
          v
TECHNICAL DISCOVERY
          |
          v
ARCHITECTURE DECISION
          |
          v
IMPLEMENTATION PLAN
          |
          v
DEVELOPMENT
          |
          v
REVIEW
          |
          v
VALIDATION
```

Não crie obrigatoriamente um arquivo para cada etapa.

Avalie a necessidade de:

- Architecture.
- ADR.
- Implementation Plan.
- API Contract.
- Data Model.
- Testing Strategy.
- Deployment / Operations.

Gere apenas os artefatos necessários.

## 10.1. Evidência antes de documentação

A documentação técnica deve refletir:

- Código existente.
- Estrutura real do projeto.
- Configurações.
- Dependências.
- Contratos existentes.
- ADRs.
- Decisões efetivamente aprovadas.

Diferencie:

- Fato verificado.
- Decisão aprovada.
- Hipótese.
- Proposta.
- Informação desconhecida.

Não apresente hipótese como verdade.

---

# 11. Context Engineering e consumo de tokens

A documentação deve ser projetada considerando o custo de contexto.

Princípio:

**Maximum relevant context, minimum unnecessary context.**

Implemente recuperação progressiva:

```text
              TASK
                |
                v
           DOC INDEX
                |
                v
        RELEVANCE DISCOVERY
                |
                v
        REQUIRED DOCUMENTS
                |
                v
        SPECIFIC INFORMATION
                |
                v
              AGENT
```

Regras:

- Não carregar toda a documentação.
- Não carregar todas as ADRs.
- Não carregar todas as skills.
- Não carregar todos os documentos de produto.
- Não carregar todas as Sessions.
- Não reanalisar todo o repositório em cada etapa.
- Não repetir regras disponíveis em fontes oficiais.
- Não duplicar conteúdo artificialmente.

## 11.1. Context Budget

Avalie um orçamento de contexto por tipo de tarefa.

Considere:

- Instruções centrais.
- Regras relevantes.
- ADRs aplicáveis.
- Skills necessárias.
- Memória relevante.
- Contexto da Session.
- Requisitos da tarefa.
- Observações recuperadas de ferramentas externas, quando úteis.

Não estabeleça limites arbitrários sem medir o contexto real.

Avalie especialmente o custo adicional de Claude-Mem e Task Observer, caso sejam integrados.

O objetivo é identificar excesso e justificar carregamentos maiores quando necessários.

---

# 12. Governança documental e manutenção contínua

A documentação não pode depender apenas de uma limpeza manual ocasional.

Projete um ciclo de manutenção proporcional às mudanças:

- Criação de ADR.
- Alteração de arquitetura.
- Conclusão de feature.
- Mudança de requisitos.
- Atualização de skill.
- Revisão de Session.
- Encerramento de projeto.

Identifique:

- Referências quebradas.
- Documentos sem uso.
- Conteúdo duplicado.
- Decisões conflitantes.
- Regras obsoletas.
- Documentação incompatível com o código.
- Memórias sem validade.
- Observações recorrentes que merecem revisão.

Não transforme toda execução em uma auditoria completa.

## 12.1. Documentation Review

```text
DOCUMENTATION REVIEW

- Fonte de verdade identificada?
- Conteúdo duplicado?
- Algum documento ficou desatualizado?
- ADR aplicável foi respeitada?
- Referências estão corretas?
- Informação é verificável?
- O agente realmente precisa desse documento?
- A mudança aumentou complexidade sem necessidade?
```

---

# 13. Advogado do diabo

Questione ativamente:

- Estamos criando arquivos demais?
- Estamos confundindo documentação com memória?
- Estamos criando abstrações desnecessárias?
- Estamos separando informações que deveriam estar juntas?
- Estamos juntando informações que precisam de fontes distintas?
- Existem regras duplicadas em agentes?
- Estamos carregando contexto que não agrega valor?
- Estamos criando burocracia para tarefas pequenas?
- Existem instruções contraditórias?
- O Synapos está ficando mais complexo de manter do que de utilizar?
- Claude-Mem e Task Observer estão resolvendo problemas reais ou criando mais uma camada?
- Estamos armazenando conhecimento que já existe em ADRs ou documentação?
- O processo de recuperação é mais caro do que consultar diretamente a fonte?

Sempre que identificar um problema, explique:

1. Problema.
2. Evidência.
3. Impacto.
4. Causa provável.
5. Solução recomendada.
6. Custo de não corrigir.

Não proponha mudanças apenas para deixar a estrutura visualmente mais bonita.

Toda alteração precisa resolver um problema concreto.

---

# 14. Processo de execução

Você deve efetivamente modificar o repositório.

Não entregue somente um relatório ou uma proposta.

## Fase 1 — Repository Audit

Analise o repositório.

Identifique:

- Estrutura atual.
- Documentos técnicos.
- Documentos de produto.
- Agentes.
- Skills.
- Pipelines.
- Sessions.
- ADRs.
- Sistema de memória.
- Comandos.
- Referências cruzadas.

Produza um inventário com quantidade de documentos, categorias, duplicidades e problemas.

## Fase 2 — Architecture Assessment

Produza diagnóstico crítico da arquitetura documental.

Identifique as principais fontes de entropia.

Proponha uma arquitetura documental simplificada.

Antes de mudanças destrutivas, apresente plano de consolidação e riscos.

## Fase 3 — Reference Analysis

Analise:

- Archify.
- Emil Kowalski.
- Impeccable.
- Taste.
- Task Observer.
- Claude-Mem.

Verifique compatibilidade, instalação, dependências, licenças, conflitos e responsabilidades.

Separe:

- O que será incorporado ao Synapos.
- O que será instalado no Claude Code.
- O que será utilizado como referência.
- O que não deve ser adotado.

## Fase 4 — Target Architecture

Defina:

- Hierarquia documental.
- Responsabilidade dos documentos.
- Fontes de verdade.
- Índices.
- Recuperação progressiva.
- Governança.
- Fluxo de produto.
- Fluxo técnico.
- Ciclo de manutenção.
- Integração com skills e memória.
- Papel de Claude-Mem.
- Papel de Task Observer.

## Fase 5 — Implementation

Implemente:

1. Eliminação de redundâncias.
2. Consolidação de documentos.
3. Correção de conflitos.
4. Definição de fontes de verdade.
5. Melhoria dos índices e recuperação.
6. Simplificação do fluxo de produto.
7. Simplificação do fluxo técnico.
8. Atualização de agentes e comandos.
9. Integração das skills aplicáveis.
10. Manutenção documental.
11. Integrações aprovadas com Claude-Mem e Task Observer.

Preserve a identidade do Synapos.

O framework principal continua Markdown-only.

Ferramentas externas podem possuir seus próprios runtimes, mas isso não autoriza transformar o Synapos em um framework dependente delas.

## Fase 6 — Validation

Valide:

- Referências.
- Links internos.
- Estrutura dos documentos.
- Consistência entre agentes.
- Consistência com ADRs.
- Fluxos de produto.
- Fluxos técnicos.
- Recuperação de contexto.
- Skills.
- Instalações.
- Integrações.
- Consumo adicional de contexto.

Execute verificações reais.

Não declare uma integração funcional sem testá-la.

## Fase 7 — Final Review

Atue novamente como advogado do diabo.

Tente encontrar falhas na nova arquitetura.

Questione se a solução realmente ficou mais simples e eficiente.

Se uma mudança aumentou a complexidade sem benefício mensurável, revise-a.

---

# 15. Métricas de sucesso

| Métrica | Objetivo |
|---|---|
| Documentos redundantes | Reduzir |
| Fontes conflitantes | Eliminar |
| Documentos sem responsabilidade | Eliminar |
| Tokens carregados por tarefa | Reduzir |
| Tempo para recuperar contexto | Reduzir |
| Regras ignoradas | Reduzir |
| Referências quebradas | Eliminar |
| Reanálise desnecessária | Reduzir |
| Precisão dos handoffs | Aumentar |
| Consistência entre agentes | Aumentar |
| Aprendizados reutilizáveis | Aumentar |
| Dependências desnecessárias | Evitar |

Quando possível, compare antes e depois.

Não invente percentuais de economia.

Se não houver instrumentação para medir tokens, apresente estimativas claramente identificadas e explique a metodologia.

---

# 16. Entregáveis

Ao concluir, apresente:

1. Diagnóstico da arquitetura anterior.
2. Principais fontes de entropia.
3. Arquitetura documental proposta e implementada.
4. Documentos consolidados, removidos e preservados.
5. Mudanças no fluxo de produto.
6. Mudanças no fluxo técnico.
7. Mudanças nos agentes e comandos.
8. Estratégia de recuperação progressiva.
9. Estratégia de redução de tokens.
10. Avaliação do Archify.
11. Avaliação das skills Emil Kowalski, Impeccable e Taste.
12. Avaliação do Task Observer.
13. Avaliação do Claude-Mem.
14. Instalações realizadas e verificações.
15. Integrações implementadas.
16. Riscos e limitações restantes.
17. Comparação de complexidade antes/depois.

Para cada instalação, informe:

- Comando utilizado.
- Resultado.
- Versão identificada.
- Teste realizado.
- Estado final.

Se alguma instalação não for possível, explique o motivo e apresente os passos necessários.

Não simule sucesso.

---

# 17. Restrições inegociáveis

- Preserve a identidade Markdown-only do Synapos.
- Preserve o conceito de Squads / One-Man Army.
- Preserve o suporte multi-IDE.
- Preserve Sessions, Pipelines, Skills e ADRs.
- ADRs vigentes continuam sendo a fonte normativa de decisões arquiteturais.
- Não crie documentos sem responsabilidade definida.
- Não replique conteúdo entre agentes sem justificativa.
- Não carregue contexto desnecessário.
- Não instale dependências sem avaliar seus custos.
- Não transforme ferramentas externas em dependências obrigatórias sem necessidade.
- Não invente informações sobre o repositório.
- Não apague histórico relevante.
- Não altere decisões arquiteturais silenciosamente.
- Não permita que ferramentas externas alterem a governança do Synapos sem aprovação.
- Não declare uma ferramenta instalada ou funcional sem verificação.

# Princípio final

O Synapos não deve ser um sistema que cresce indefinidamente em documentos, regras e instruções.

Deve ser um sistema capaz de acumular conhecimento sem acumular desorganização.

**A documentação deve diminuir a incerteza, não aumentar a complexidade.**

**A memória deve preservar conhecimento, não replicar o histórico.**

**As skills devem aumentar a capacidade dos agentes, não aumentar indiscriminadamente o contexto.**

**As ADRs devem governar decisões, não apenas registrar decisões passadas.**

**As ferramentas de observação e memória devem complementar a arquitetura, não competir com ela.**

**Os agentes devem recuperar o conhecimento necessário, não carregar o projeto inteiro na memória.**

O resultado esperado é uma arquitetura de conhecimento que permaneça precisa, confiável e eficiente mesmo com o crescimento do Synapos.

Não otimize para quantidade de documentação produzida.

Otimize para qualidade das decisões, precisão da execução e menor custo cognitivo e computacional.