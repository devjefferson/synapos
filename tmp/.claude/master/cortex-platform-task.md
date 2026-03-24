# CORTEX PLATFORM TASK MASTER (v1.5.2)

> Modo para iniciar tasks vindas de plataformas externas: Jira, Linear, Trello, Asana, Monday.com.
> Usado quando NÃO existe sessão de trabalho — sem context.md + architecture.md.
> Cria a spec completa (context.md + architecture.md) e encaminha para o plan.
> Este modo NÃO redefine arquitetura existente — se spec já existe, usar IMPLEMENTAR SPEC.

---

## Pré-condições Obrigatórias

**Nesta ordem:**
1. Boot executado com GATE 0 aprovado
2. CORTEX_CONTEXT disponível (regras críticas + ADRs)
3. Session NÃO deve ter context.md ou architecture.md prontos
   - Se já existirem → BLOQUEIO: usar EXECUTION → IMPLEMENTAR SPEC

---

## Escopo de Responsabilidade

```
task-input → context.md → architecture.md → plan
```

---

## Restrições Absolutas

**PROIBIDO:**
- Inventar stack, ADRs ou regras de memória — sempre ler de CORTEX_CONTEXT e `docs/`
- Prosseguir para plan sem context.md + architecture.md aprovados pelo usuário
- Criar session sem slug válido no formato `<tipo>-<NNN>-<descricao-kebab-case>`
- Avançar automaticamente — aguardar aprovação explícita em cada etapa

---

## Sequência de Ativação

### PASSO 1 — Verificar CORTEX_CONTEXT

1. Se Boot foi executado nesta janela: usar contexto existente.
2. Se não: executar boot completo (`/cortex:boot`) e aguardar GATE 0 antes de continuar.

---

### PASSO 2 — Detectar Plataforma Configurada

**Verificar plataformas disponíveis — duas fontes em paralelo:**

```bash
# 1) Credenciais explícitas em .claude/.env
cat .claude/.env 2>/dev/null | grep -E "^(LINEAR_API_KEY|JIRA_API_TOKEN|TRELLO_API_KEY|ASANA_ACCESS_TOKEN|MONDAY_API_TOKEN|GITHUB_TOKEN)=" | grep -v "^#"

# 2) GitHub via gh CLI (independente do .env)
gh auth status 2>/dev/null | grep -E "Logged in|✓"
```

**Regra de detecção do GitHub:**
GitHub Issues é considerado **configurado** se **qualquer** das condições abaixo for verdadeira:
- `GITHUB_TOKEN` presente em `.claude/.env`, **OU**
- `gh auth status` retorna autenticado (gh CLI conectado), **OU**
- MCP GitHub tools disponíveis na sessão (`mcp__github__*`)

> Se `gh` CLI estiver autenticado, não é necessário executar `/product:setup-github` — o sync usa `gh auth token` automaticamente.

---

**Cenários possíveis:**

**A) Exatamente 1 plataforma configurada:**
```
📋 PLATFORM TASK
Plataforma detectada: <Nome> ✓

Cole o conteúdo da task (<Nome>):
  - Título / nome da issue
  - Descrição
  - Critérios de aceite / definition of done
  - Links, referências ou anexos relevantes
  - ID da issue (se disponível)
```
→ Não perguntar plataforma. Registrar a detectada como **PLATFORM** e o conteúdo como **TASK_INPUT**.

**B) Múltiplas plataformas configuradas:**
→ Perguntar **uma única vez**: "Qual plataforma é esta task?"
  Mostrar apenas as que estão configuradas (incluindo GitHub se detectado via gh CLI).
→ Após seleção, solicitar o conteúdo da task.
→ Registrar como **PLATFORM** e **TASK_INPUT**.

**C) Nenhuma plataforma configurada:**
```
⚠ Nenhuma plataforma de gerenciamento configurada

Opções:
  [1] Configurar o Linear agora       → execute /product:setup-linear
  [2] Configurar o GitHub Issues      → execute /product:setup-github
                                        (ou autentique com: gh auth login)
  [3] Continuar sem integração        → cole o conteúdo da task manualmente
                                        (qualquer plataforma: Jira, Trello,
                                         Asana, Monday.com, etc.)

Sua escolha [1-3]: _
```
- Se **[1]**: instruir o usuário a executar `/product:setup-linear`, aguardar e reiniciar o PASSO 2.
- Se **[2]**: instruir o usuário a executar `/product:setup-github` ou `gh auth login`, aguardar e reiniciar o PASSO 2.
- Se **[3]**: perguntar **uma única vez** "De qual plataforma vem esta task?" (texto livre) e solicitar o conteúdo.
  Registrar como **PLATFORM** (manual) e **TASK_INPUT**.

---

**Mapeamento de variáveis de ambiente por plataforma:**

| Plataforma    | Detectado via                                       | Comando de setup |
|---------------|-----------------------------------------------------|------------------|
| Linear        | `LINEAR_API_KEY` em `.claude/.env`                  | `/product:setup-linear` |
| GitHub Issues | `GITHUB_TOKEN` em `.claude/.env` **ou** `gh auth status` autenticado **ou** MCP GitHub | `/product:setup-github` ou `gh auth login` |
| Jira          | `JIRA_API_TOKEN` em `.claude/.env`                  | *(a configurar)* |
| Trello        | `TRELLO_API_KEY` em `.claude/.env`                  | *(a configurar)* |
| Asana         | `ASANA_ACCESS_TOKEN` em `.claude/.env`              | *(a configurar)* |
| Monday.com    | `MONDAY_API_TOKEN` em `.claude/.env`                | *(a configurar)* |

---

### PASSO 3 — Definir Slug da Session

1. Analisar TASK_INPUT e sugerir slug seguindo o padrão:
   ```
   <tipo>-<NNN>-<descricao-kebab-case>
   Regex: ^(epic|feature|bug|refactor)-\d{3}-[a-z0-9]+(-[a-z0-9]+)*$

   Tipos:  epic | feature | bug | refactor (minúsculas obrigatório)
   NNN:    exatamente 3 dígitos com zeros à esquerda (001, não 1 nem 01)
   descricao: apenas [a-z0-9-], mínimo 2 segmentos, sem acentos, total ≤ 60 chars

   Exemplos válidos:
     feature-007-user-notifications
     bug-002-checkout-payment-error
     epic-003-onboarding-flow
   Exemplos inválidos:
     feature-7-notifications (NNN sem zeros)
     Feature-007-test (tipo com maiúscula)
     epic-003-x (só 1 segmento na descricao)
   ```
2. Verificar em `docs/.cortex/sessions-manifest.json` se o slug já existe:
   - Se já existe com context.md + architecture.md → BLOQUEIO:
     ```
     BLOQUEADO: Session '<slug>' já possui spec completa.
     Use EXECUTION → IMPLEMENTAR SPEC para prosseguir com a implementação.
     ```
   - Se já existe sem spec completa → informar e perguntar se quer continuar
   - Se não existe → prosseguir
3. Confirmar slug com o usuário antes de criar qualquer arquivo.

---

### PASSO 4 — Criar Estrutura da Session

Após confirmação do slug:

```bash
mkdir -p docs/.cortex/sessions/<slug>
```

Atualizar `docs/.cortex/sessions-manifest.json` adicionando a nova session:
```json
"<slug>": {
  "status": "in_progress",
  "created_at": "<ISO 8601 atual>",
  "files": {
    "context.md": false,
    "architecture.md": false
  },
  "missing": ["context.md", "architecture.md", "plan.md"]
}
```

---

### PASSO 5 — Investigação da Task (→ context.md)

Analisar TASK_INPUT com profundidade:

**Identificar:**
1. **Motivação** — por que este trabalho existe? Qual dor/oportunidade endereça?
2. **Meta** — qual é o resultado esperado ao concluir?
3. **Estratégia** — como será desenvolvido (direção, sem detalhes de implementação)
4. **Validação** — como será validado? Critérios de aceite
5. **Dependências** — APIs externas, arquivos, serviços, teams
6. **Limitações** — restrições técnicas, de tempo ou de negócio

**Verificação com CORTEX_CONTEXT:**
- Ler `critical_rules_summary` do CORTEX_CONTEXT (já carregado — não reler docs/)
- Se algum ponto da task conflitar com regras críticas → alertar ANTES de criar context.md

**Formular 3-5 clarificações críticas** necessárias para completar a spec e apresentar ao usuário junto com a compreensão atual. Aguardar respostas antes de criar context.md.

Se necessário, iterar até ter compreensão sólida aprovada.

**Criar `docs/.cortex/sessions/<slug>/context.md`:**

```markdown
# Context: <Nome da Feature>

## Plataforma de Origem

- Plataforma: <Jira|Linear|Trello|Asana|Monday|Outra>
- Issue/Card ID: <ID se disponível, ou "N/A">
- Link: <URL se disponível, ou "N/A">

## Regras Críticas do Projeto

<COPIAR de critical_rules_summary do CORTEX_CONTEXT>

## ADRs Relevantes

<Listar ADRs do CORTEX_CONTEXT relevantes para esta task, com referências>

---

## Contexto da Task

### Motivação
<Por que este trabalho existe? Contexto de negócio>

### Meta
<Qual é o resultado esperado ao concluir esta task?>

### Estratégia
<Como será desenvolvido — direção sem detalhes de implementação>

### Critérios de Aceite
<Como será validado? Definition of done>

### Dependências
<Dependências externas, APIs, arquivos, serviços, variáveis de ambiente>

### Limitações
<Restrições técnicas, de tempo ou de negócio conhecidas>

### Fora de Escopo
<O que explicitamente NÃO será feito nesta task>
```

Solicitar revisão do usuário. **Aguardar aprovação explícita antes de prosseguir.**

---

### PASSO 6 — Estruturação Arquitetural (→ architecture.md)

Com context.md aprovado, realizar investigação técnica:

**Investigar:**
- Examinar código-fonte relevante via ferramentas disponíveis
- Identificar features e convenções similares no projeto
- Aplicar CORTEX_CONTEXT (regras críticas + ADRs)
- Se necessário, usar Context7 / WebSearch para bibliotecas externas — não inferir

**Criar `docs/.cortex/sessions/<slug>/architecture.md`:**

Incluir obrigatoriamente:
- Visão de alto nível (estado do sistema antes × depois)
- Componentes impactados e suas relações/dependências
- Convenções e melhores práticas aplicadas
- Dependências externas utilizadas
- Estrutura de arquivos (lista dos arquivos a criar/modificar)
- Limitações e premissas
- Trade-offs e alternativas consideradas
- Consequências adversas (se houver)
- Diagrama MERMAID (se útil para clareza)

Se houver dúvida ou contradição com a compreensão anterior → solicitar esclarecimento ao usuário. **Não avançar com incertezas.**

Solicitar revisão do usuário. **Aguardar aprovação explícita antes de prosseguir.**

---

### PASSO 7 — Verificação de Consistência (OBRIGATÓRIA)

**Após criar architecture.md e ANTES de pedir aprovação final:**

Comparar context.md × architecture.md:

| Item | Verificar |
|------|-----------|
| Problema principal | Descrito da mesma forma em ambos? |
| Arquivos a modificar | Listas idênticas ou compatíveis? |
| Abordagem técnica | Estratégia, patterns, bibliotecas alinhados? |
| Regras críticas | Nenhuma violação introduzida? |
| ADRs mapeadas | Conformes em ambos os documentos? |

**Se inconsistências encontradas:**
- Menores (campo omitido num dos docs) → corrigir silenciosamente, informar usuário
- De abordagem (estratégias divergentes) → corrigir ambos, informar usuário
- Com regras críticas → PARAR, escalar ao usuário antes de corrigir

**Adicionar ao final de `architecture.md`:**

```markdown
---

## Verificação de Consistência

**Data**: <YYYY-MM-DD>
**Status**: ✅ APROVADO / ⚠️ CORRIGIDO

### Checklist
- [x] context.md e architecture.md consistentes
- [x] Conforme regras críticas do projeto
- [x] Conforme ADRs mapeadas
- [x] Dependências externas documentadas

### Correções Aplicadas (se houver)
- <descrever correções, ou "Nenhuma">

### Notas
<Qualquer observação relevante>
```

---

### PASSO 8 — Atualizar Manifesto

Após ambos os arquivos criados e aprovados:

Atualizar `docs/.cortex/sessions-manifest.json`:
```json
"<slug>": {
  "status": "in_progress",
  "files": {
    "context.md": true,
    "architecture.md": true
  },
  "missing": ["plan.md"]
}
```

---

### PASSO 9 — Handoff para Plan

Exibir confirmação e instruções:

```
✅ Spec criada para '<slug>'

  Plataforma: <plataforma>
  context.md      ✓
  architecture.md ✓
  plan.md         ✗ (próximo passo)

Pronto para iniciar o planejamento de implementação.
Invoque /engineer:plan para criar o plan.md e iniciar o trabalho.
```

⛔ **NÃO prosseguir automaticamente. NÃO criar plan.md neste modo.**
**AGUARDAR que o usuário invoque `/engineer:plan` manualmente.**
