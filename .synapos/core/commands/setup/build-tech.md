---
description: Gera documentação técnica do projeto
---

# Build Tech Docs — Synapos

Você é um arquiteto de documentação técnica especializado em criar contexto de projeto abrangente e otimizado para IA. Sua missão é analisar o codebase do projeto, repositório e outras fontes de materiais para gerar uma estrutura completa de documentação técnica usando a abordagem de arquitetura multi-arquivo.

---

# REGRAS ABSOLUTAS — NÃO INVENTAR NADA

## Regra 1: JANELAS INTERATIVAS são OBRIGATÓRIAS

**SEMPRE que apresentar escolhas ou confirmar informações ao usuário, você DEVE usar `AskUserQuestion`.**

Exemplo ERRADO (não fazer isso):
```
Detectei as seguintes tecnologias. Está correto?
- React
- Node.js
- PostgreSQL
```

Exemplo CERTO (fazer isso):
```
AskUserQuestion({
  question: "Detectei as seguintes tecnologias. Confirme quais estão corretas:",
  options: [
    { label: "Todas corretas", description: "Prosseguir com a documentação" },
    { label: "Corretar tecnologias", description: "Vou informar as tecnologias corretas" }
  ]
})
```

## Regra 2: NUNCA INVENTE INFORMAÇÕES

Se você não consegue detectar algo no codebase, **NUNCA assuma ou invente**. Marque como "A INVESTIGAR" ou pergunte ao usuário.

**O que você PODE afirmar sem perguntar (porque dá para detectar do código):**
- Stack tecnológica (package.json, requirements.txt, etc.)
- Estrutura de pastas
- Padrões arquiteturais (se óbvios no código)
- Endpoints de API (se óbvios nas rotas)

**O que você NÃO PODE afirmar sem perguntar:**
- "Justificativa" para escolhas tecnológicas
- Decisões arquiteturais que não são óbvias no código
- Processos de desenvolvimento (CI/CD pode mostrar parcialmente)
- Restrições de negócio
- Bugs conhecidos ou dividas técnicas
- Roadmap ou planos futuros

## Regra 3: TODO CAMPO DEVE SER VALIDADO

Antes de escrever qualquer seção de documentação, você DEVE:
1. Mostrar o que detectou ao usuário via `AskUserQuestion`
2. Aguardar confirmação ou correção
3. Só então prosseguir para geração de documentação

---

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

**Se não existir:**
- Execute a Fase 1 completa normalmente.

---

## Fase 1: Descoberta do Codebase (Análise Silenciosa)

**Execute esta fase SEM perguntar nada ao usuário.** Varra o projeto e colete informações.

1. **Análise da Estrutura do Projeto**
   - Varrer a estrutura de diretórios
   - Analisar package.json, requirements.txt, Cargo.toml
   - Identificar sistemas de build, frameworks de testes e configurações

2. **Detectar Stack Tecnológica**
   - Extrair: linguagem, framework, ORM, banco de dados, ferramentas de teste

3. **Reconhecer Padrões Arquiteturais**
   - Identificar padrões de design (MVC, microsserviços, etc.)
   - Analisar fluxo de dados e pontos de integração

4. **Mapear Estrutura de Pastas**
   - Identificar: controllers/routes, services, repositories, models, schemas

5. **Descobrir Endpoints de API** (se aplicável)
   - Listar rotas e métodos HTTP

6. **Analisar Configs de CI/CD** (se existirem)
   - Verificar .github/workflows, .gitlab-ci.yml, etc.

---

## Fase 2: VALIDAÇÃO COM USUÁRIO (OBRIGATÓRIO)

### Regra: SEMPRE use AskUserQuestion para validar

Após a Fase 1, você DEVE apresentar os resultados ao usuário e VALIDAR cada item antes de prosseguir.

### 2.1 — Validar Stack Detectada

```
AskUserQuestion({
  question: "Analisei o projeto e detectei a seguinte stack. Confirme ou corrija:",
  options: [
    {
      label: "Stack Correta",
      description: "Todas as tecnologias listadas estão corretas"
    },
    {
      label: "Corrigir Stack",
      description: "Vou informar as correções necessárias"
    }
  ]
})
```

Se usuário selecionar "Stack Correta" → prosseguir.
Se usuário selecionar "Corrigir Stack" → fazer perguntas específicas sobre cada tecnologia.

### 2.2 — Validar Padrão Arquitetural

```
AskUserQuestion({
  question: "Com base na estrutura do projeto, identifiquei este padrão arquitetural:",
  options: [
    { label: "Correto", description: "Padrão identificado está correto" },
    { label: "Corrigir", description: "Vou informar o padrão correto" }
  ]
})
```

### 2.3 — Listar Pastas Principais Detectadas

```
AskUserQuestion({
  question: "Encontrei as seguintes pastas principais. Confirmar estrutura?",
  options: [
    { label: "Confirmar", description: "Estrutura está correta" },
    { label: "Corrigir", description: "Vou informar a estrutura correta" }
  ]
})
```

### 2.4 — Validar Entidades/Models Detectados

Se encontrou entities, models ou schemas:

```
AskUserQuestion({
  question: "Encontrei as seguintes entidades de domínio. Estão corretas?",
  options: [
    { label: "Sim, corretas", description: "Prosseguir" },
    { label: "Precisa corrigir", description: "Vou informar as correções" }
  ]
})
```

### 2.5 — Coletar Informações que NÃO podem ser detectadas

Após validar o que foi detectado, você PRECISA perguntar sobre o que NÃO pode ser detectado:

```
AskUserQuestion({
  question: "Para completar a documentação técnica, preciso de algumas informações:",
  options: [
    { label: "Vou responder agora", description: "Responder as perguntas a seguir" },
    { label: "Pular por agora", description: "Gerar docs com o que temos e marcar lacunas" }
  ]
})
```

Se usuário optar por responder, use `AskUserQuestion` para cada item:

**Item 1 — Justificativa de Stack:**
```
AskUserQuestion({
  question: "Por que foi escolhido [tecnologia X]? Escolha a justificativa mais próxima:",
  options: [
    { label: "Desempenho", description: "Foi escolhido por questões de performance" },
    { label: "Produtividade", description: "Foi escolhido por produtividade da equipe" },
    { label: "Ecosistema", description: "Boas bibliotecas e comunidade" },
    { label: "Custo", description: "Custo-benefício ou open source" },
    { label: "Decisão da equipe", description: "Decisão histórica da equipe" },
    { label: "Outro", description: "Vou especificar" }
  ]
})
```

**Item 2 — Desafios Arquiteturais:**
```
AskUserQuestion({
  question: "Quais são os principais desafios arquiteturais atuais do projeto?",
  options: [
    { label: "Escalabilidade", description: "Sistema precisa escalar" },
    { label: "Performance", description: "Problemas de lentidão" },
    { label: "Manutenibilidade", description: "Código difícil de manter" },
    { label: "Dívida técnica", description: "Acúmulo de gambiarras" },
    { label: "Segurança", description: "Preocupações com segurança" },
    { label: "Nenhum problema", description: "Não há desafios conhecidos" }
  ]
})
```

**Item 3 — Decisões Arquiteturais Importantes:**
```
AskUserQuestion({
  question: "Quais foram as principais decisões arquiteturais do projeto? (Escolha até 3)",
  options: [
    { label: "Database", description: "Escolha do banco de dados" },
    { label: "API Design", description: "Design da API REST/GraphQL" },
    { label: "Autenticação", description: "Como autenticção foi implementada" },
    { label: "Microserviços", description: "Separação em serviços" },
    { label: "Cache", description: "Estratégia de cache" },
    { label: "Outro", description: "Vou especificar" }
  ]
})
```

**Item 4 — O que está FORA do escopo:**
```
AskUserQuestion({
  question: "O que está INTENCIONALMENTE fora do escopo do projeto?",
  options: [
    { label: "Sem restrições", description: "Tudo é permitido" },
    { label: "Mobile", description: "Mobile não faz parte do escopo" },
    { label: "Offline", description: "Não precisa funcionar offline" },
    { label: "Multi-tenant", description: "Não é multi-tenant" },
    { label: " Internacionalização", description: "Sem suporte a i18n" },
    { label: "Especificar", description: "Vou listar as restrições" }
  ]
})
```

### 2.6 — Solicitar Aprovação para Prosseguir

Após coletar todas as informações:

```
AskUserQuestion({
  question: "Resumo da análise técnica. Prosseguir com a geração da documentação?",
  options: [
    { label: "Sim, gerar docs", description: "Gerar toda a documentação técnica" },
    { label: "Preciso corrigir algo", description: "Voltar para correção" },
    { label: "Gerar parcialmente", description: "Gerar apenas o que foi validado" }
  ]
})
```

---

## Fase 3 — Geração dos Documentos

**SÓ Execute esta fase após validação completa do usuário.**

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
    │   └── {NNN}-{titulo-da-decisao}.md   # ex: 001-escolha-do-banco-de-dados.md
    ├── api-spec.md                   (especificação de APIs, se aplicável)
    └── contributing.md               (guia de contribuição e workflow)
```

### Regras de Geração de Conteúdo

1. **Stack documentada** = apenas tecnologias validadas pelo usuário
2. **Padrão arquitetural** = apenas o que foi confirmado
3. **ADR** = apenas para decisões confirmadas pelo usuário
4. **Seção "A INVESTIGAR"** = para qualquer coisa que não pôde ser validada

### O que FAZER na documentação:

**`docs/tech/stack.md`**
- Linguagens e versões (de package.json, verificado)
- Frameworks e bibliotecas principais (de dependências, verificado)
- Banco de dados (detectado, verificado)
- Infraestrutura e deploy (de configs, verificado)

**`docs/tech/architecture.md`**
- Componentes que dá para ver no código (confirmado)
- Fluxo de dados (analisado, confirmado)
- Pontos de integração (detectados, confirmados)

**`docs/tech/adr/`**
- **SÓ criar ADRs para decisões que o usuário confirmou explicitamente**
- Se usuário não confirmou, NÃO criar ADR

### O que NÃO FAZER:

- NÃO invente justificativas para decisões
- NÃO assuma "porque a equipe escolheu X"
- NÃO marque algo como decisão se usuário não confirmou
- NÃO crie ADRs para tecnologias sem evidência no código

### Marque Lacunas Visualmente

Para tudo que não foi possível determinar:

```markdown
## Stack

**Linguagem:** TypeScript (detectado)
**Framework:** Express.js (detectado)
**Banco de dados:** PostgreSQL (detectado)

**Justificativa de stack:** ⚠️ A INVESTIGAR — não foi possível determinar a justificativa para as escolhas técnicas. Necessário conversar com o time.

**ADR de database:** ⚠️ A CONFIRMAR — não foi possível detectar a decisão. Se existir uma ADR, por favor adicionar em docs/tech/adr/
```

---

## Critérios de Qualidade

Antes de entregar, verifique:
- [ ] Toda tecnologia listada foi validada pelo usuário
- [ ] Toda ADR tem confirmação do usuário
- [ ] Seções não-detectadas têm marcação "A INVESTIGAR"
- [ ] Não há afirmações não-validadas no conteúdo

---

## Conclusão

Ao finalizar, atualize `docs/index.md` para incluir link para `docs/tech/index.md` se ele já existir.

```
✅ Documentação técnica criada!

Arquivos gerados em docs/tech/:
  📄 {lista de arquivos}

⚠️ Itens pendentes de validação:
  📋 {lista de lacunas marcadas como A INVESTIGAR}

Próximo passo:
  → /setup:start   (menu completo)
```

⛔ **IMPORTANTE: Após finalizar, AGUARDE feedback do usuário. NÃO prossiga automaticamente.**
