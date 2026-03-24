
# Inicialização de Desenvolvimento

Este comando inicia o desenvolvimento de uma nova feature.

## Context Enhancement (Opcional - Se Project Briefing Existe)

**ANTES de solicitar dados ao usuário, execute esta verificação:**

### 1. Verificar Project Briefing

```bash
# Verificar se existe briefing gerado pelo /discover
if exists("docs/technical-context/project-briefing.md"):
  carrega_briefing = true
else:
  carrega_briefing = false
  # Continuar com fluxo original (sem enhancement)
```

### 2. Carregar Contexto Essencial (Se Briefing Existe)

**Se `carrega_briefing = true`:**

1. **Ler SEMPRE (pequenos, essenciais):**
   - `docs/technical-context/project-briefing.md` (índice mestre, ~150 linhas)
   - `docs/technical-context/briefing/critical-rules.md` (regras obrigatórias, ~80 linhas)

2. **Perguntar ao engenheiro (para saber O QUE carregar):**
   ```
   Para otimizar o contexto desta feature, preciso saber:

   1. Esta feature envolve frontend Lovable? (s/n)

   2. Áreas do backend impactadas (marque todas que se aplicam):
      [ ] API/Controllers (criação ou modificação de endpoints)
      [ ] Database/ORM (mudanças em schema ou queries)
      [ ] Autenticação/Autorização
      [ ] Services/Business Logic
      [ ] Outra: ___________

   Isso me ajuda a carregar apenas as ADRs e convenções relevantes,
   economizando tokens e focando no que importa para esta feature.
   ```

3. **Carregar seletivamente baseado nas respostas:**

   **Sempre carregar:**
   - `briefing/backend-conventions.md` (se qualquer backend marcado)

   **Se "frontend = sim":**
   - `briefing/frontend-lovable.md`
   - Invocar `@lovable-backend-mapper` para análise detalhada (se ainda não foi feito)

   **Se "API/Controllers = marcado":**
   - Ler seção "API Design" de `briefing/adrs-summary.md`

   **Se "Database/ORM = marcado":**
   - Ler seção "Database & Persistence" de `briefing/adrs-summary.md`

   **Se "Autenticação = marcado":**
   - Ler seção "Security" de `briefing/adrs-summary.md`

### 3. Enriquecer context.md com Briefing

**Ao gerar `context.md`, SEMPRE incluir no início (se briefing existe):**

```markdown
# Context: [Feature Name]

## ⚠️ Regras Críticas do Projeto (Project Briefing)

[COPIAR CONTEÚDO COMPLETO de briefing/critical-rules.md]

## 📚 ADRs Relevantes (Referência Rápida)

[Listar ADRs carregadas com links]

- ADR-003: Shared Types Location → `docs/technical-context/briefing/adrs-summary.md#adr-003`
- ADR-007: Repository Pattern → `docs/technical-context/briefing/adrs-summary.md#adr-007`

## 🎨 Frontend Integration (se aplicável)

[Se frontend Lovable envolvido, resumir mocks a integrar]

Mocks a remover nesta feature:
- Mock #3: User Dashboard Stats → Criar GET /api/dashboard/stats

Ver mapeamento completo em: `docs/technical-context/briefing/frontend-lovable.md`

---

## Contexto Específico da Feature

[Resto do context.md como de costume...]
```

**Resultado:** context.md terá ~300-400 linhas (regras críticas + contexto específico)
ao invés de depender de memória ou links que podem ser esquecidos.

---

**Se `carrega_briefing = false` (briefing não existe):**
- Pular esta seção completamente
- Continuar para "Preparação" (fluxo original 100% preservado)
- Nenhuma mudança no comportamento

---

## Preparação
- Caso não esteja em uma branch de feature, solicite autorização para criar uma
- Se já estiver em uma branch de feature correspondente ao nome da feature, você está pronto.
- Verifique a existência do diretório docs/.cortex/sessions/<feature_slug>
- Solicite ao usuário os dados de entrada para esta sessão (você receberá um ou mais cartões do Linear para trabalhar)

## Investigação

Examine os cartões, seus pais e filhos conforme necessário, e desenvolva uma compreensão inicial do que deve ser implementado. Reflita cuidadosamente sobre o que está sendo solicitado, assegurando-se de compreender exatamente:
    - A motivação por trás deste desenvolvimento (contexto)
    - Qual é o resultado esperado para esta issue? (meta)
    - Como deve ser desenvolvido, apenas direcionalmente, sem detalhes (estratégia)
    - Se demanda o uso de novas APIs/ferramentas, você as compreende?
    - Como deve ser validado?
    - Quais são as dependências?
    - Quais são as limitações?

Após refletir sobre estas questões, formule as 3-5 clarificações mais críticas necessárias para concluir a tarefa. Apresente estas questões ao humano, juntamente com sua compreensão e propostas.

Após obter as respostas do humano, avalie se precisa de clarificações adicionais. Em caso positivo, continue o diálogo.

Uma vez que tenha uma compreensão sólida do que está sendo desenvolvido, salve-o no arquivo docs/.cortex/sessions/<feature_slug>/context.md e solicite revisão do humano.

Se o humano concordar com sua compreensão, você pode avançar para a próxima etapa. Caso contrário, continue iterando conjuntamente até obter aprovação explícita para prosseguir.

Se algo que você discutiu aqui impacta o que foi documentado nos requisitos, solicite permissão ao humano para editar esses requisitos e realizar ajustes, seja editando (mudanças estruturais) ou adicionando anotações (clarificações).

Se o requisito estiver em um cartão do Linear, atualize o cartão do Linear.
Se o requisito for de um arquivo textual, atualize o arquivo textual.

## Estruturação Arquitetural

Dada sua compreensão do que será desenvolvido, você agora procederá ao desenho da estrutura arquitetural da feature. O artefato estrutura arquiteturall deve mapear o que está sendo desenvolvido, os módulos, as dependências, as convenções, as tecnoregistroias, as limitações, as premissas, os trade-offs, as alternativas, as consequências.

É aqui que você aplicará seu pensamento profundo e considerará a melhor trajetória para desenvolver a feature, considerando também as convenções e melhores práticas deste projeto.

Nesta seção, espera-se que você examine o código fonte pertinente, compreenda sua organização e propósito, e então desenvolva uma estrutura arquitetural que se alinha com as convenções e melhores práticas do projeto.

Orientações:
   - Utilize mcp__RepoPrompt__search (se disponível) para localizar arquivos específicos baseados nas respostas de descoberta
   - Utilize mcp__RepoPrompt__set_selection e read_selected_files (se disponível) para ler código pertinente em lote
   - Investigue profundamente features e convenções similares
   - Examine detalhes específicos de execução
   - Utilize WebSearch e/ou context7 para melhores práticas ou documentação de bibliotecas (quando necessário)

Seu artefato estrutura arquiteturall deve contemplar:
    - Uma visão de alto nível do plataforma (estado anterior e posterior à mudança)
    - Componentes impactados e suas relações, dependências
    - Convenções e melhores práticas que serão mantidas ou introduzidas
    - Interdependências externas que serão utilizadas ou que necessitam ser incorporadas ao projeto
    - Limitações e premissas
    - Trade-offs e alternativas
    - Consequências adversas (se houver) da execução deste desenho
    - Lista dos principais arquivos a serem modificados/criados

Se útil para clareza, construa um diagrama MERMAID.

Se, a qualquer momento, você tiver dúvidas ou identificar algo que contradiz sua compreensão anterior, solicite esclarecimentos ao humano.

Uma vez que tenha uma compreensão robusta do que está sendo desenvolvido, salve-o no arquivo docs/.cortex/sessions/<feature_slug>/architecture.md.

---

## 🔍 Verificação Cruzada de Consistência (OBRIGATÓRIA)

**APÓS criar `architecture.md`, execute esta verificação ANTES de pedir aprovação final ao humano.**

### Por que esta fase existe?

Problemas comuns que esta verificação previne:
- `context.md` diz "modificar componente X" mas `architecture.md` diz "deletar componente X"
- Valores de negócio mencionados em um documento mas omitidos no outro
- Campos ou fluxos diferentes entre os documentos
- Abordagem técnica que viola padrões documentados do projeto

### Checklist de Consistência

#### 1. Consistência entre Documentos

Compare `context.md` e `architecture.md` verificando:

| Item | Verificar |
|------|-----------|
| Problema principal | Descrito da mesma forma em ambos? |
| Arquivos a modificar | Listas idênticas ou compatíveis? |
| Abordagem técnica | Estratégia, patterns, bibliotecas alinhados? |
| Valores de negócio | Qualquer número, prazo ou regra igual em ambos? |

#### 2. Conformidade com Especificação de Negócio

**Se existe especificação de negócio para esta feature:**

- [ ] Todos os campos/inputs mencionados na spec estão no architecture.md
- [ ] Todos os fluxos/cenários da spec estão cobertos
- [ ] Valores numéricos (prazos, limites, etc.) conferem com a spec
- [ ] Mensagens de UI/feedback conferem com a spec
- [ ] Validações e regras de negócio conferem com a spec

#### 3. Conformidade com Padrões do Projeto

**Se o projeto possui documentação de padrões (ADRs, convenções, etc.):**

- [ ] Nomenclatura segue os padrões documentados?
- [ ] Arquitetura/estrutura de pastas segue o padrão do projeto?
- [ ] Tipos/schemas seguem o padrão do projeto (shared vs local)?
- [ ] Patterns de código seguem as convenções documentadas?

### Ações de Correção

Se inconsistências forem encontradas:

1. **Inconsistências menores** (ex: valor não mencionado em um dos docs):
   - Corrija o documento incompleto
   - Não precisa aprovação do usuário

2. **Inconsistências de abordagem** (ex: estratégias diferentes):
   - Determine qual está correto baseado nos padrões do projeto
   - Atualize AMBOS os documentos para ficarem alinhados
   - Informe o usuário da correção feita

3. **Conflito com especificação de negócio**:
   - SEMPRE a especificação de negócio vence
   - Corrija os documentos técnicos para refletir a spec
   - Documente qualquer divergência encontrada

### Output da Verificação

Ao concluir a verificação, adicione ao final de `architecture.md`:

```markdown
---

## ✅ Verificação de Consistência

**Data**: [YYYY-MM-DD]
**Status**: ✅ APROVADO / ⚠️ CORRIGIDO

### Checklist
- [x] context.md e architecture.md consistentes
- [x] Conforme especificação de negócio (se aplicável)
- [x] Conforme padrões/convenções do projeto (se documentados)
- [x] Valores e regras de negócio conferidos

### Correções Aplicadas (se houver)
- [Descrever correções feitas]

### Notas
[Qualquer observação relevante]
```

---

Uma vez que o architecture.md esteja finalizado E a verificação cruzada aprovada, solicite revisão do humano.

Se o humano concordar com sua compreensão, você pode avançar para a próxima etapa. Caso contrário, continue iterando conjuntamente até obter aprovação explícita para prosseguir.

⛔ **IMPORTANTE: NÃO prossiga automaticamente. AGUARDE aprovação explícita do humano e que ele invoque o próximo comando /plan manualmente. NÃO execute o planejamento ou implementação automaticamente.**

## Investigação

Se você não tem certeza sobre como uma biblioteca específica opera, você pode utilizar Context7 e Perplexity para buscar informações sobre ela. Portanto, não tente inferir.

<feature_slug>
#$ARGUMENTS
</feature_slug>

