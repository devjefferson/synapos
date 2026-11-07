# Product Requirements Document (PRD): synapOS

**Nome do Produto:** synapOS  
**Dono do Documento:** Jefferson da Fonseca Martins  
**Versão:** 1.6.0
**Status:** Protótipo Funcional / Em Teste Privado
**Data:** 29 de Março de 2026  

---

## 1. Visão Geral

### 1.1 Resumo
O **synapOS** é um framework de gerenciamento e orquestração de agentes projetado para transformar o desenvolvedor solo em um **"exército de um homem só"**. Ele permite a criação e coordenação de squads de agentes de IA que cobrem o ciclo de desenvolvimento de software de ponta a ponta, garantindo eficiência, automação de tarefas e alta produtividade sem a necessidade de uma equipe humana.

### 1.2 Objetivos & Metas
*   **Eficiência Solo:** Permitir que um único desenvolvedor entregue projetos complexos com a velocidade de um time completo.
*   **Redução de Tempo:** Automatizar codificação, documentação e processos de infraestrutura.
*   **Economia de Tokens:** Otimizar as chamadas de LLM através de fluxos estruturados e evitar desperdício em retries infinitos.
*   **Padronização:** Criar uma estrutura rigorosa de arquivos e processos para garantir que a IA não "alucine" ou entregue códigos incompletos.
*   **Modo Solo-First:** Eliminar burocracia de time para dev solo — sem checkpoints de aprovação desnecessários, sem task tracker obrigatório, context window otimizado.

### 1.3 Métricas de Sucesso
*   **Tempo economizado:** Redução significativa nas horas de desenvolvimento manual.
*   **Estabilidade da Orquestração:** Execução de pipelines complexos com o mínimo de intervenção humana.
*   **Taxa de Aprovação nos GATES:** Alta frequência de outputs que passam de primeira pelos critérios de qualidade.

---

## 2. Personas

### 2.1 Usuário Primário: Desenvolvedor Solo (Indie Hacker / Full-stack)
*   **Necessidade:** Entregar produtos de ponta a ponta (MVP até escala) sem sócios ou funcionários.
*   **Dor:** Sobrecarga mental ao alternar entre contextos de Produto, Dev e DevOps.

### 2.2 Usuário Secundário: Freelancer de Software
*   **Necessidade:** Escalar a capacidade de atendimento de múltiplos clientes simultaneamente.
*   **Dor:** Manter documentação técnica e pipelines atualizados sob pressão de prazos.

---

## 3. Funcionalidades & Requisitos

### 3.1 Core Features

**1. Gerenciamento de Squads (/init)**
*   **Comando:** `/init` dispara o `orchestrator.md`.
*   **Domínios:** Menu de 7 domínios (Produto, Frontend, Backend, Fullstack, Mobile, DevOps, IA/Dados).
*   **Estrutura de Pastas:**
    ```text
    .synapos/squads/{slug}/
    ├── squad.yaml          ← Configurações e definições do squad
    ├── agents/             ← Arquivos .agent.md com personas detalhadas
    └── pipeline/           ← Definição dos steps de execução
    ```

**2. Orquestração e Comunicação**
*   **Mecanismo:** Comunicação via arquivos e dependências declaradas (`depends_on`).
*   **Modos de Execução:**
    *   `subagent`: Autônomo com contexto completo.
    *   `inline`: Execução na conversa atual.
    *   `checkpoint`: Pausa obrigatória para decisão humana (ignorada em modo solo, exceto gates).

**2a. Modo Solo**
*   **Ativação:** `mode: solo` no `squad.yaml`.
*   **Comportamento:** Checkpoints de aprovação intermediários são pulados automaticamente. GATE-0 opera em modo permissivo. Step `update-task` ignorado quando `task_tracker: none`.
*   **Pipeline Quick Fix:** 3 steps (gate → contexto → executar → registrar), sem nenhum checkpoint de aprovação. Disponível em todos os 7 domínios.

**2b. Memória Transversal**
*   **`docs/_memory/project-learnings.md`:** Aprendizados compartilhados por todos os squads do projeto. Injetado no contexto de todo agent. Atualizado ao final de cada pipeline.

**3. Sistema de Veto e Qualidade**
*   **Funcionamento:** O sistema rejeita outputs automaticamente se violarem condições (ex: "componente sem estado de erro").
*   **Retry:** Limite de 2 tentativas automáticas antes da escalada para o humano.

**4. GATE System (6 Portões)**
*   **GATE-0 a 2:** Validação de integridade, configurações e objetivos.
*   **GATE-3 a 5:** Validação de outputs, existência de documentação técnica (architecture, specs) e prontidão para handoff.

---

## 4. Considerações Técnicas

### 4.1 Tech Stack
*   **Runtime:** Claude Code CLI (Independente de configuração direta de API keys no código).
*   **Configuração:** Markdown (.md) e YAML (.yaml).
*   **Skills:** Suporte a MCP, Brave Search, GitHub API e Playwright.

### 4.2 Scalability & Performance
*   **Persistência:** Uso de `state.json` para rastreabilidade e retomada de pipelines.
*   **Imutabilidade:** Cada execução gera pastas com timestamp em `docs/.squads/output/`.

---

## 5. UX & Design Considerations
*   **Interface:** CLI interativa e intuitiva.
*   **Personas:** Agentes com identidades fixas (ex: Ana Arquitetura, Rodrigo React) e princípios operacionais claros.
*   **Feedback:** Logs detalhados sobre falhas em `veto_conditions` ou bloqueios nos `GATES`.

---

## 6. Dependências & Riscos

### 6.1 Dependências
*   **Claude Code CLI:** Instalado e autenticado.
*   **Skills Opcionais:** Requerem tokens específicos (Brave, GitHub).

### 6.2 Riscos & Mitigação
*   **Loop de Erro:** Mitigado pelo limite de 2 retries e escalada humana obrigatória.
*   **Context Window:** Mitigado pela estrutura de arquivos modular. O `state.json` é limitado (apenas step IDs). O crescimento real vem de `docs/`, `memories.md` e outputs acumulados — endereçado pelo modo solo (docs mínimo) e pela memória transversal com escopo por squad.
*   **Burocracia de time em uso solo:** Mitigado pelo modo solo (checkpoints removidos), quick-fix pipeline (3 steps), e `task_tracker: none` (elimina o step de atualização de board).

---

## 7. Roadmap & Timeline

| Milestone | Descrição | Status |
| :--- | :--- | :--- |
| **v1.4.0 (Protótipo)** | 7 templates, 23 agentes e orquestrador base. | **Concluído** |
| **v1.5.0** | Pipelines de task management, produto v2.0.0, agente Úrsula UX. | **Concluído** |
| **v1.6.0 (Solo-First)** | Modo solo, pipeline quick-fix (7 domínios), memória transversal, task tracker configurável. | **Concluído** |
| **Beta Privado** | Refinamento em projetos reais (ex: KND Realengo). | **Em Andamento** |
| **Lançamento Open** | Publicação do repositório público no GitHub. | A definir |

---

## 8. Open Questions
*   Como exibir o diff de mudanças negadas pelo sistema de Veto de forma visual no terminal?
*   O `state.json` deve ser incluído no `.gitignore` ou versionado para colaboração futura?
*   Em projetos muito longos, deve haver um mecanismo de compactação automática de `memories.md` quando ultrapassar N entradas?
*   O pipeline `quick-fix` deveria ter uma variante com reviewer para contextos onde qualidade é crítica?