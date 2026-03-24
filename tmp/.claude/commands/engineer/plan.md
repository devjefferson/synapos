
# Engineer Reason

Este é o comando para iniciar o planejamento de uma feature.

<arguments>
#$ARGUMENTS
</arguments>

## Exame

Leia os arquivos context.md e architecture.md na pasta docs/.cortex/sessions/<feature_slug> se ainda não tiver feito.

### Pré-passo obrigatório: inventário de agents e skills

Antes de criar as fases, executar via Bash:

```bash
# Agents disponíveis (leia o campo description do frontmatter de cada um)
find .claude/agents -name "*.md" -follow 2>/dev/null | sort

# Skills disponíveis (segue symlinks, case-insensitive para SKILL.md/SKILL.MD)
find .claude/skills -maxdepth 2 -follow \( -name "SKILL.md" -o -name "SKILL.MD" \) 2>/dev/null
```

Para cada agent encontrado, ler o campo `description` do frontmatter.
Para cada skill encontrada, ler o campo `description` do frontmatter de seu `SKILL.MD`.

Montar internamente:
- `AGENTS_DISPONÍVEIS`: lista de `nome → description`
- `SKILLS_DISPONÍVEIS`: lista de `nome → description`

Usar esses inventários para atribuir `Agent` e `Skill` a cada fase do plano.

Sua tarefa agora é criar um plano de execução detalhado (plan.md) para esta feature. O objetivo desta documentação é criar uma abordagem de execução faseada que nos permita construir a feature incrementalmente, testando cada fase conforme avançamos. E também deve tornar possível retomar o trabalho caso nossa sessão seja intfalhampida.

O plan.md deve dividir a execução em fases, cada fase com um pedaço do trabalho que pode ser realizado por um humano em 2 horas.

O template para o plan.md é:

<plan>
# [NOME DA FUNCIONALIDADE]

Se você está trabalhando nesta feature, certifique-se de atualizar este arquivo plan.md conforme progride.

## FASE 1 [Completada ✅]
> Agents: <agentA | agentB (paralelo), agentA → agentB (sequencial), ou "nenhum">
> Skill: <nome-da-skill ou "nenhuma">

Detalhes desta parte da feature

### Uma tarefa que foi feita [Completada ✅]

Detalhes sobre a tarefa

### Uma tarefa que foi feita [Completada ✅]

Detalhes sobre a tarefa

### Comentários:
- Algo que aconteceu e nos forçou a mudar de direção
- Algo que aprendemos durante o construção
- Algo que discutimos e concordamos

## FASE 2 [Em Progresso ⏰]
> Agents: <agentA | agentB (paralelo), agentA → agentB (sequencial), ou "nenhum">
> Skill: <nome-da-skill ou "nenhuma">

### Uma tarefa que precisa ser feita [Em Progresso ⏰]

Detalhes sobre a tarefa

### Uma tarefa que precisa ser feita [Não Iniciada ⏳]

Detalhes sobre a tarefa

## FASE 3 [Não Iniciada ⏳]
> Agents: <agentA | agentB (paralelo), agentA → agentB (sequencial), ou "nenhum">
> Skill: <nome-da-skill ou "nenhuma">

### Uma tarefa que precisa ser feita [Não Iniciada ⏳]

Detalhes sobre a tarefa

### Uma tarefa que precisa ser feita [Não Iniciada ⏳]

Detalhes sobre a tarefa

</plan>


Dicas:
   - Use repoprompt:search (se disponível) para encontrar arquivos específicos baseados nas respostas de descoberta
   - Use repoprompt:set_selection e repoprompt:read_selected_files (se disponível) para ler código relevante em batch
   - Analise detalhes específicos de execução
   - Use WebSearch e ou context7 para melhores práticas ou documentação de bibliotecas (se necessário)

## Integração Frontend (Se Aplicável)

**Se `context.md` mencionar "Frontend Integration" (feature envolve Lovable):**

1. **Ler mapeamento de mocks:**
   - Verificar seção "Frontend Integration" no `context.md`
   - OU ler `docs/technical-context/briefing/frontend-lovable.md` diretamente

2. **Incluir fase de "Mock Removal" no plano:**
   ```
   ## FASE X: Integração Frontend [Não Iniciada ⏳]

   ### Remover Mock #1: [Nome do componente] [Não Iniciada ⏳]

   **Backend (pré-requisito):**
   - [x] Endpoint GET /api/users criado
   - [x] Testes de integração passando

   **Frontend:**
   - [ ] Remover mock de apps/frontend/src/components/UserList.tsx:15-20
   - [ ] Substituir por useFetch('/api/users') ou React Query
   - [ ] Adicionar loading state (isLoading)
   - [ ] Adicionar error handling (error, onError)
   - [ ] Criar teste com MSW (Mock Service Worker)
   - [ ] Validar tipos TypeScript match (frontend ↔ backend)

   **Validação:**
   - [ ] Testar manualmente no browser
   - [ ] Verificar network tab (chamada real à API)
   - [ ] Verificar dados renderizados corretamente

   ### Remover Mock #2: [Próximo mock] [Não Iniciada ⏳]
   [Repetir estrutura...]
   ```

3. **Ordenar fases corretamente:**
   - Implementação backend ANTES de remoção de mocks
   - Cada mock removal é uma subtarefa dentro da fase de integração

**Se NÃO houver frontend envolvido:**
- Pular esta seção completamente
- Focar apenas em fases de backend

---

No caso desta pesquisa levantar uma nova decisão estrutura arquiteturall ou contradição com as decisões anteriores, você iniciará uma discussão sobre isso com o humano, concordará com as mudanças e atualizará o artefato architecture.md para aquela feature se necessário.

Este artefato também deve anotar quais tarefas precisam ser feitas sequencialmente ou em paralelo.

Uma vez que o plan.md esteja finalizado, informe ao humano que você está pronto para prosseguir para o próximo passo.

⛔ **IMPORTANTE: NÃO prossiga automaticamente. AGUARDE que o humano aprove o plano e execute explicitamente o comando /work. NÃO inicie a implementação automaticamente.**

