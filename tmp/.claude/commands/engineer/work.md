
# Engineer Work

Estamos atualmente trabalhando em uma feature que está especificada na seguinte pasta:

<folder>
#$ARGUMENTS
</folder>

Para trabalhar nisso, você deve:

- Ler todos os arquivos markdown na pasta
- Revisar o arquivo plan.md e identificar qual Fase está atualmente em progresso
- Apresentar ao usuário um plano para abordar a próxima fase

---

## 📋 Gestão de Cards no Linear (OBRIGATÓRIO)

**O workflow de desenvolvimento DEVE sincronizar com o Linear em tempo real.**

### Regras de Movimentação de Cards

#### 1. Ao INICIAR Trabalho em uma Issue

**ANTES de escrever qualquer código:**

1. Identificar o issue ID no Linear (geralmente no nome da pasta da sessão, ex: `issue-XXX-nome`)
2. Usar `mcp__linear-server__list_issue_statuses` para obter os status disponíveis do time
3. Mover card para status de "started" (geralmente "In Progress")
4. Confirmar movimentação no chat

**Comando para atualizar:**
```
mcp__linear-server__update_issue
  id: "<issue-id>"
  state: "In Progress"
```

#### 2. Durante o Desenvolvimento

- Manter o card em status "started" enquanto trabalha
- Adicionar comentários no Linear para atualizações significativas:
  - Bloqueios encontrados
  - Decisões técnicas importantes
  - Progresso de fases longas

**Comando para comentar:**
```
mcp__linear-server__create_comment
  issueId: "<issue-id>"
  body: "✅ FASE X completada - [resumo do que foi feito]"
```

#### 3. Ao Abrir PR

Quando criar Pull Request:

1. Mover card para status de review (geralmente "In Review")
2. Adicionar link do PR como comentário no Linear
3. Atualizar plan.md com link do PR

**Comentário sugerido:**
```markdown
📝 **PR aberto para review**
- PR: #XXX
- Link: [URL do PR]
```

#### 4. Ao Concluir

Após merge do PR:

1. Mover card para status "completed" (geralmente "Done")
2. Adicionar comentário final com resumo da entrega

### Fluxo Padrão de Status

```
Backlog → Todo → In Progress → In Review → Done
                     ↑              ↓
                     └──── (revisões) ────┘
```

### Como Identificar o Issue

O issue do Linear geralmente está identificado:
- No nome da pasta da sessão: `docs/.cortex/sessions/issue-XXX-nome/`
- No arquivo `context.md` da sessão
- No nome do branch: `feature/XXX-nome` ou `issue-XXX-nome`

Se não encontrar, pergunte ao usuário qual é o issue ID no Linear.

---

Importante:

Quando você desenvolver o código para a fase atual, use os sub-agentes de construção, code-revisão e teste quando apropriado para preservar o máximo possível do seu contexto.
Toda vez que completar uma fase do plano:
- Pause e peça ao usuário para validar seu código.
- Faça as mudanças necessárias até ser aprovado
- Atualize a fase correspondente no arquivo plan.md marcando o que foi feito e adicionando comentários úteis para o desenvolvedor que abordará as próximas fases, especialmente sobre questões, decisões, etc.
- Apenas inicie a próxima fase após o usuário concordar que você deve começar. Quando iniciar a próxima fase, atualize o arquivo plan.md marcando a nova fase como em progresso.

## Implementação Guiada por ADRs (Abordagem Proativa)

**Se `context.md` contiver seção "Regras Críticas do Projeto":**

### 1. ANTES de Implementar Cada Tarefa (Consulta Proativa)

**Ao iniciar uma tarefa, PRIMEIRO revisar as regras:**

1. **Ler regras críticas relevantes do `context.md`:**
   - Seção "⚠️ Regras Críticas do Projeto" já contém as ADRs copiadas
   - Identificar quais regras se aplicam à tarefa atual
   - Entender ANTES de escrever código

2. **Planejar implementação conforme ADRs:**
   ```
   Tarefa: Criar UserService

   Regras aplicáveis (de context.md):
   - ADR-007: Services devem usar Repositories (não Prisma direto)
   - ADR-003: ENUMs em /shared/enums/
   - ADR-012: Testes obrigatórios

   Plano de implementação:
   1. Criar UserRepository primeiro (pré-requisito)
   2. Criar UserService injetando repository
   3. Se precisar ENUM, criar em /shared/enums/
   4. Criar testes junto com implementação

   Resultado esperado: Código conforme ADRs desde o início
   ```

3. **Decidir estrutura ANTES de criar arquivos:**
   - Localização correta de cada arquivo
   - Ordem de criação (dependências primeiro)
   - Padrões a seguir

### 2. DURANTE Implementação (Código Correto de Primeira)

**Implementar seguindo o plano:**

- ✅ Criar arquivos na localização correta
- ✅ Seguir padrões arquiteturais desde o início
- ✅ Usar convenções obrigatórias
- ✅ **Resultado: código conforme, zero retrabalho**

**Exemplo prático:**
```
✅ CORRETO (Proativo):
1. Ler ADR-007: "Services usam Repositories"
2. Criar src/repositories/user.repository.ts (primeiro)
3. Criar src/services/user.service.ts (injeta repository)
4. Validação: ✅ conforme desde o início

❌ ERRADO (Reativo):
1. Criar UserService usando Prisma direto
2. Validador detecta violação de ADR-007
3. Refatorar: criar repository, refatorar service
4. Desperdiçou tempo e tokens
```

### 3. APÓS Implementação (Validação de Sanidade)

**Validação rápida (não espera encontrar problemas):**

- Se `@adr-compliance-checker` disponível: executar validação
- **Propósito:** Confirmar que tudo está conforme (não corrigir erros)
- Se encontrar violação: é exceção/edge case, discutir

**Cenário ideal:**
```
Validação com @adr-compliance-checker:
✅ 100% conforme (como esperado, código foi feito certo)
Tempo economizado: Zero correções necessárias
```

### 4. Relatório ao Final da Fase

**Incluir no plan.md (seção Comentários):**

```markdown
## FASE 2 [Completada ✅]

### Implementação User Authentication [Completada ✅]

**Arquivos criados:**
- src/repositories/auth.repository.ts
- src/services/auth.service.ts
- src/shared/schemas/auth.schema.ts
- src/services/__tests__/auth.service.spec.ts

### Comentários:

#### Conformidade com ADRs (Abordagem Proativa)
- ✅ ADRs consultadas ANTES da implementação
- ✅ Código criado seguindo regras desde o início
- ✅ Validação final: 100% conforme
- ✅ Zero correções necessárias
- ✅ Implementação eficiente, sem desperdício

**Regras aplicadas:**
- ADR-007: Repository Pattern → AuthRepository criado e injetado
- ADR-015: Validação Zod → auth.schema.ts em /shared/schemas/
- ADR-012: Testes → auth.service.spec.ts criado junto

✅ Todas as convenções obrigatórias seguidas desde o início.
```

### 5. Quando NÃO Há ADRs

**Se `context.md` NÃO contém "Regras Críticas":**
- Seguir boas práticas gerais
- Usar convenções existentes no projeto
- Focar em código de qualidade
- Pular esta seção completamente

---

## Princípio Fundamental

> **"ADRs são GUIAS DE IMPLEMENTAÇÃO, não validadores de erro."**

**Mentalidade correta:**
- ✅ Consultar ADRs = Parte do planejamento
- ✅ Implementar conforme ADRs = Primeira vez certo
- ✅ Validação = Confirmação, não correção

**Mentalidade errada:**
- ❌ Implementar qualquer coisa
- ❌ Validador detecta erros
- ❌ Corrigir e refatorar
- ❌ Desperdiçar tempo

---

Agora, veja a fase atual de desenvolvimento e forneça um plano ao usuário sobre como abordá-la. 

