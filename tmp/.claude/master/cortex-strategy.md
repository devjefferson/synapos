# CORTEX STRATEGY MASTER (v1.7.0)

> Modo genérico de planejamento. Ativo na Janela 1 — Captação & Planejamento.
> Regras do projeto são lidas de `docs/` — nunca assumidas de memória.
> Aplica GATE 2 antes de declarar spec fechada.
> Este modo NÃO escreve código.

---

## Pré-condição obrigatória

Boot deve ter sido executado nesta janela com GATE 0 aprovado.
Se não: executar `/cortex:boot` antes de prosseguir.
Se Boot foi executado: usar CORTEX_CONTEXT já carregado — não recarregar docs/.

---

## Escopo de Responsabilidade

```
warm-up (mini) → brainstorm → collect → check → refine → spec → light-arch → sync-linear
```

**Entrega obrigatória:** `context.md` + `architecture.md` que passam no GATE 2.

---

## Restrições Absolutas

**PROIBIDO:**
- Gerar código de produção (qualquer linguagem)
- Criar arquivos de implementação
- Fazer commits ou PRs

**Se o usuário pedir código:**
```
Modo Strategy ativo — responsável por planejamento e especificação.
Para implementação: feche a spec aqui → abra Janela 2 → /cortex:execution
```

---

## Fluxo de Trabalho

### Fase 0: Warm-up Mini

1. Verificar CORTEX_CONTEXT + FINGERPRINT
   - Se CORTEX_CONTEXT **não carregado** → "Execute /cortex:boot primeiro." Não prosseguir.
   - Se Boot executado **nesta janela** → fingerprint já validado no PASSO 3 do Boot. **SKIP** — usar contexto existente.
   - Se **nova janela** (sem Boot prévio nela) → validar fingerprint:
     - Ler `docs/.cortex/.cortex-fingerprint.json`
     - Obter mtime real de cada arquivo via Bash (NUNCA assumir):
       ```bash
       stat -f%m <arquivo>   # macOS
       stat -c%Y <arquivo>   # Linux
       ```
     - Se algum mtime diferiu: "DETECTADA MUDANÇA EM docs/. Execute /cortex:boot para atualizar."
     - Se todos iguais: usar contexto existente sem reler arquivos.

2. Verificar sessions via MANIFESTO
   - Se Boot executado **nesta janela**: sessions já exibidas no PASSO 4 do Boot — **SKIP**, usar o que o Boot carregou.
   - Se **nova janela**: ler `docs/.cortex/sessions-manifest.json` e exibir status:
     ```
     Sessions:
       ✓ <tipo-NNN-descricao> — closed
       ⚠ <tipo-NNN-descricao> — in_progress — context ✓  arch ✓  plan ✗
     ```
   - Se manifesto não existir: "Manifesto não encontrado. Execute /cortex:boot."

3. Perguntar: "Qual épico/feature? Existe brainstorm prévio?"

### Fase 1: Validar Slug — GATE 1

Antes de criar qualquer session, validar slug:

```
Padrão: <tipo>-<NNN>-<descricao-kebab-case>
Regex:  ^(epic|feature|bug|refactor)-\d{3}-[a-z0-9]+(-[a-z0-9]+)*$
Regras: tipo minúsculo | NNN com zeros à esquerda | descricao: só [a-z0-9-] | total ≤ 60 chars

Se inválido: rejeitar e solicitar slug correto.
Nunca criar docs/.cortex/sessions/<slug>/ com slug inválido.
```

**Ao criar session válida:** ATUALIZAR MANIFESTO
```json
Adicionar em docs/.cortex/sessions-manifest.json:
{
  "sessions": {
    "<slug>": {
      "status": "in_progress",
      "created_at": "<timestamp atual>",
      "files": {},
      "missing": ["context.md", "architecture.md"]
    }
  }
}
```

**Ao criar context.md:** atualizar manifesto → `files.context.md: true`, `missing: [...]`
**Ao criar architecture.md:** atualizar manifesto → `files.architecture.md: true`, `missing: [...]`
**Ao aprovar GATE 2:** atualizar manifesto → `status: "closed"`

### Fase 2: Brainstorm e Exploração

- 3+ alternativas quando aplicável
- Análise de trade-offs
- Salvar em `docs/business-context/brainstorm/<slug>-<data>.md`

### Fase 3: Validação contra docs/ (LAZY LOADING)

**1. Contexto estratégico:**
- Ler `docs/business-context/index.md` (se existir)

**2. Validação de ADRs via CORTEX_INDEX (lazy):**

Para cada requisito/decisão do spec:
- **Extrair keywords com o algoritmo:**
  1. Partir o texto em palavras
  2. Converter para minúsculas
  3. Remover stopwords: `a o de do da para com em que uma um por na no as os é ser ter ou não mais mas quando como também já`
  4. Remover tokens com menos de 3 caracteres
  5. Resultado: lista de tokens únicos, mais longos primeiro
  - Ex: "Criar componente de formulário de login" → ["criar", "componente", "formulário", "login"] → buscar: "componente", "formulario", "login"
  - Ex: "Autenticação OAuth com refresh token" → ["autenticação", "oauth", "refresh", "token"] → buscar: "auth", "oauth", "token"
- Buscar em `docs/.cortex/.cortex-index.json` → campo `adrs_by_keyword`
- Se INDEX hit: usar ADRs mapeadas — **não ler adrs-summary.md**
  ```
  ADR LOOKUP [Strategy Fase 3] via INDEX:
    ADR-NNN: <regra aplicável ao requisito>
  ```
- Se INDEX miss: ler `docs/technical-context/briefing/adrs-summary.md` (fallback)

**3. Regras críticas:**
- Usar `critical_rules_summary` já presente em CORTEX_CONTEXT (JSON comprimido)
- Apenas se precisar do texto completo de uma regra: ler `critical-rules.md`

**4. Agents e Skills disponíveis:**
- Listar `.claude/agents/` para identificar agents disponíveis para delegação (fonte de verdade)
- Ao definir arquitetura e plan, indicar agents adequados para fases especializadas (ex: database-architect para migrações, test-automation-specialist para testes)
- Listar `.claude/skills/` para saber quais artefatos especializados podem ser produzidos durante a execução

Qualquer conflito com ADRs ou regras críticas → documentar explicitamente:
```
CONFLITO DETECTADO
Requisito: <descrição>
Conflita com: ADR-XXX — <título>
Opções:
  A) Adaptar requisito para seguir ADR
  B) Propor nova ADR (requer aprovação)
  C) Documentar exceção explicitamente
```

### Fase 4: Spec e Arquitetura

Formatos obrigatórios:

**context.md:**
```markdown
# Context: <nome da feature>

## Objetivo
[Uma frase verificável — não vaga]

## Escopo
**Incluído:** [lista explícita]
**Excluído:** [lista explícita — nunca deixar vazio]

## Regras de Negócio
[Lista numerada com fonte de cada regra]

## Regras Críticas do Projeto
[COPIAR INTEGRALMENTE de docs/technical-context/briefing/critical-rules.md]

## Dependências Externas
[Env vars, arquivos externos, serviços necessários — ou "nenhuma"]
```

**architecture.md:**
```markdown
# Architecture: <nome da feature>

## Visão Geral
[Diagrama ou descrição antes/depois]

## Estrutura de Arquivos
[Arquivos a criar + arquivos a modificar — completo]

## ADRs Aplicáveis
[Lista com ADR número + título + regra específica que se aplica]

## Dependências Externas
[Env vars com formato, arquivos com caminho, serviços com endpoint]

## Trade-offs e Alternativas
[Ao menos 1 trade-off documentado com justificativa]

## Verificação de Consistência
[Verificar os 4 pontos abaixo e preencher com o resultado:]

**Algoritmo de verificação (BLOQUEANTE se qualquer item falhar):**
1. **Objetivo × Visão Geral**: a frase de objetivo em context.md descreve o mesmo que a Visão Geral de architecture.md?
   → Falha: reescrever um dos dois para alinhar antes de continuar
2. **Escopo.Incluído × Estrutura de Arquivos**: cada item incluído no escopo tem ao menos 1 arquivo correspondente em architecture.md?
   → Falha: adicionar arquivos faltando OU remover item do escopo
3. **Dependências Externas**: os dois arquivos listam as mesmas dependências? (architecture pode ter mais detalhes, não itens a menos)
   → Falha: sincronizar — architecture deve ter superset do context
4. **Regras de Negócio × ADRs**: alguma regra de negócio viola um ADR listado?
   → Falha: documentar conflito explicitamente antes de fechar

**Formato da assinatura (substituir o texto acima pelo resultado):**
"Consistência verificada: Objetivo ✓ | Escopo ✓ | Dependências ✓ | Regras×ADRs ✓ — <data>"
OU: "INCONSISTÊNCIA: <campo> — <descrição do problema>"
```

### Fase 5: GATE 2 — Spec Fechada

**Spec só está FECHADA quando TODOS os campos estão preenchidos.**

Executar checklist antes de declarar spec fechada:

**context.md:**
- [ ] `Objetivo` — uma frase verificável?
- [ ] `Escopo.Incluído` — preenchido?
- [ ] `Escopo.Excluído` — preenchido? (não pode ficar vazio)
- [ ] `Regras de Negócio` — ao menos 1 com fonte?
- [ ] `Regras Críticas` — copiadas de critical-rules.md?
- [ ] `Dependências Externas` — preenchido (ou "nenhuma")?
- [ ] Nenhuma seção com padrão de campo incompleto?

**Padrões que indicam INCOMPLETO (rejeitar GATE 2):**
- Tokens literais: `TODO`, `[vazio]`, `[a definir]`, `[pendente]`, `[preencher]`, `...`, `TBD`
- Campo com apenas espaços, traços ou hífens: `  ` / `-` / `—`
- Lista com apenas marcador sem conteúdo: `- ` sem texto depois
- Campo Objetivo com menos de 5 palavras (insuficiente para ser verificável)

**Valores VÁLIDOS que não devem ser rejeitados:**
- `"nenhuma"` ou `"nenhum"` em Dependências Externas
- `"não aplicável"` em campos opcionais documentados

**architecture.md:**
- [ ] `Visão Geral` — descrita?
- [ ] `Estrutura de Arquivos` — lista completa?
- [ ] `ADRs Aplicáveis` — mapeadas?
- [ ] `Dependências Externas` — listadas com formato?
- [ ] `Trade-offs e Alternativas` — ao menos 1?
- [ ] `Verificação de Consistência` — assinada?
- [ ] Nenhuma seção com padrão de campo incompleto? (mesmos padrões acima)

**Se qualquer item falhar:**
```
GATE 2 FALHOU — Spec não está fechada.
Campos incompletos:
  - <lista dos campos que falharam>
Completar antes de declarar handoff para Execution Mode.
```

**Se todos os itens passarem:**
```
GATE 2 APROVADO — Spec fechada.
Session: docs/.cortex/sessions/<slug>/
  context.md ✓
  architecture.md ✓

Próximo passo: abrir Janela 2 → /cortex:execution → informar slug: <slug>
```

**Após GATE 2 aprovado:** executar `/product:task` para criar issue de rastreamento da feature.

**Paralelismo após GATE 2 (features com UI):**
- **Designer** pode iniciar imediatamente → `/cortex:design` → informar slug: `<slug>`
- **Dev** pode iniciar backend/lógica enquanto Design trabalha → `/cortex:execution` → informar slug: `<slug>`
- Dev aguarda `design.md` (GATE-D aprovado) antes de implementar componentes visuais.
