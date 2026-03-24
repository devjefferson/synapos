# CORTEX EXECUTION MASTER (v1.7.0)

> Modo genérico de execução. Ativo na Janela 2 — Execução Técnica.
> Regras do projeto são lidas de `docs/` — nunca assumidas de memória.
> Aplica GATE 3 (ADR mapping) antes de cada arquivo e GATE 4 (plan consistency) na ativação.
> Este modo NÃO redefine arquitetura.

---

## Pré-condições Obrigatórias

**Nesta ordem:**
1. Boot executado com GATE 0 aprovado
2. `context.md` e `architecture.md` existem em `docs/.cortex/sessions/<slug>/`
3. GATE 2 foi aprovado pela Strategy Mode (spec fechada)

Se qualquer pré-condição falhar → bloqueio imediato com mensagem clara.

---

## Escopo de Responsabilidade

```
start → plan → work → pre-pr → pr
```

---

## Restrições Absolutas

**PROIBIDO:**
- Redefinir arquitetura já validada no `architecture.md`
- Alterar regras de negócio sem aprovação explícita
- Iniciar implementação sem `context.md` + `architecture.md`
- Assumir stack, ADRs ou regras de memória — sempre ler de `docs/`
- Assumir que env vars, arquivos externos ou serviços existem

**Se houver inconsistência detectada durante implementação:**
```
INCONSISTÊNCIA DETECTADA
Arquivo: <arquivo>
Esperado (architecture.md): <o que diz a spec>
Encontrado: <o que o código exige>
Impacto: <o que quebra>

Opções:
  A) Ajustar spec no architecture.md
  B) Documentar contorno como trade-off
  C) Escalar para Strategy Mode
Aguardando instrução. NÃO prosseguir automaticamente.
```

---

## Sequência de Ativação

### PASSO 1 — Verificar CORTEX_CONTEXT + VALIDAR FINGERPRINT

1. Se Boot foi executado nesta janela: usar contexto existente.
2. Se não: executar boot completo (`/cortex:boot`) e aguardar GATE 0 antes de continuar.
3. **VALIDAR FINGERPRINT:**
   - Se Boot foi executado nesta mesma janela → fingerprint já validado pelo Boot.
     **SKIP**: não revalidar.
   - Se esta é uma nova janela de Execution (sem Boot prévio nela):
     - Ler `docs/.cortex/.cortex-fingerprint.json`
     - Para cada arquivo listado, obter mtime real via Bash (NUNCA assumir):
       ```bash
       stat -f%m <arquivo>   # macOS
       stat -c%Y <arquivo>   # Linux
       ```
     - Comparar com o `mtime` registrado no fingerprint
     - Se ALGUM arquivo mudou:
       ```
       DETECTADA MUDANÇA EM docs/
       Arquivo(s) modificado(s): <lista>
       Execute /cortex:boot para atualizar contexto.
       NÃO PROSSIGA — contexto pode estar desatualizado.
       ```

### PASSO 2 — Identificar a session via MANIFESTO

1. Perguntar: "Qual o slug da session? (formato: tipo-NNN-descricao)"
2. Validar slug com regex: `^(epic|feature|bug|refactor)-\d{3}-[a-z0-9]+(-[a-z0-9]+)*$` — se inválido, rejeitar e pedir novo.
3. Verificar no `docs/.cortex/sessions-manifest.json`:
   - Se session não existe: "Session '<slug>' não encontrada. Execute /cortex:strategy."
   - Se exists: exibir status do manifesto

Exibir:
```
Session encontrada no manifesto:
  <slug>
  Status: in_progress|closed
  Created: <timestamp>
  Files: context.md [✓/✗] — architecture.md [✓/✗] — plan.md [✓/✗]
```

### PASSO 3 — Verificar pré-requisitos (BLOQUEANTE)

```
docs/.cortex/sessions/<slug>/context.md         → OBRIGATÓRIO
docs/.cortex/sessions/<slug>/architecture.md    → OBRIGATÓRIO
```

**Se faltarem:**
```
BLOQUEADO: Spec não encontrada para slug "<slug>".
Execute /cortex:strategy para criar context.md + architecture.md.
```

### PASSO 4 — Carregar regras do projeto (via CORTEX_CONTEXT)

Usar `docs/.cortex/.cortex-context.json` (comprimido) se disponível:
- Ler `critical_rules_summary` para regras críticas
- Ler `adrs_summary` para lista de ADRs
- Se necessário detalhes completos: ler arquivos originais em `docs/technical-context/briefing/`

**Delegação obrigatória para agents especializados:**

Agents são registrados nativamente pelo Claude Code via `.claude/agents/` — não é necessário verificar nenhum JSON. Antes de iniciar cada fase de implementação:

1. **Verificar se `plan.md` já declara agents para esta fase** (campo `> Agents:`):
   - Se declarado e não for "nenhum" → **validar existência antes de usar**:
     ```bash
     test -f .claude/agents/<nome>.md && echo "exists" || echo "missing"
     ```
     - Se existir → usar diretamente, skip semantic matching
     - Se não existir → **GATE DE DELEGAÇÃO FALHOU**:
       ```
       GATE DE DELEGAÇÃO FALHOU
       Agent declarado "<nome>" não encontrado em .claude/agents/
       Verifique o nome no plan.md ou execute /engineer:discover para listar agents disponíveis.
       NÃO PROSSEGUIR — aguardando correção.
       ```
   - Se ausente ou "nenhum" → executar matching semântico (passo 2)
2. Identificar o domínio predominante da fase lendo `plan.md`
3. Selecionar o(s) agent(s) cujo `description` (frontmatter) melhor cobre esse domínio via:
   ```bash
   find .claude/agents -name "*.md" -follow 2>/dev/null | sort
   ```
4. **Interpretar a sintaxe de `> Agents:`:**
   - `agentA | agentB` → **paralelo**: invocar ambos simultaneamente via Agent tool em uma única resposta
   - `agentA → agentB` → **sequencial**: invocar agentA, aguardar resultado, depois invocar agentB
   - `agentA` → **único**: invocar normalmente
5. Invocar cada agent via Agent tool com prompt contendo:
   - Objetivo da fase (extraído de `plan.md`)
   - Arquivos envolvidos e estrutura de `architecture.md`
   - Task específica e restrições do projeto
6. Registrar no `plan.md` ao final da fase: `Agents usados: <lista>`
7. Validar output de cada agent via GATE 3 (ADR mapping) antes de aceitar

**NÃO delegar quando:**
- A fase é de orquestração (gates, validações, sequenciamento) — permanecer no Execution mode
- Nenhum agent tiver match semântico claro com o domínio da fase

---

**Uso de skills durante a execução (automático):**

Skills ficam em `.claude/skills/*/SKILL.MD` — a fonte de verdade é o diretório, não um JSON.
Skills podem estar instaladas diretamente em `.claude/skills/` ou via symlink — ambos são válidos.

**Gatilho:** antes de produzir qualquer artefato não-código:
- Documento (`.docx`, `.pdf`, relatório, apresentação, spec formal)
- Artefato visual (mockup, diagrama, wireframe)
- Qualquer output especializado que não seja código ou markdown simples

**Protocolo automático:**

1. **Verificar se `plan.md` já declara a skill para esta fase** (campo `> Skill:`):
   - Se declarada e não for "nenhuma" → **usar diretamente, skip discovery**
   - Se ausente ou "nenhuma" → executar discovery (passo 2)
2. Listar skills disponíveis via Bash (segue symlinks, cobre variantes de case):
   ```bash
   find .claude/skills -maxdepth 2 -follow \( -name "SKILL.md" -o -name "SKILL.MD" \) 2>/dev/null
   ```
3. Para cada skill encontrada, ler o campo `description` do frontmatter de seu `SKILL.MD`
4. **Se houver match semântico com o artefato a produzir:**
   - Invocar via **Skill tool** com o nome da skill (ex: `skill: "docx"`)
   - Aguardar a skill carregar antes de produzir o artefato
   - Confirmar: `Skill '<nome>' invocada. Produzindo <artefato> conforme skill.`
5. **Se não houver match:** produzir normalmente e informar: `Nenhuma skill disponível para este artefato.`

**NUNCA produzir o artefato antes de invocar a skill correspondente.**

Se `docs/.cortex/.cortex-context.json` não existir:
```
BLOQUEADO: CORTEX_CONTEXT ausente em docs/.cortex/.
Execute /cortex:boot para gerar índices.
```

### PASSO 5 — GATE 4: Consistência Automática Plan + Architecture

**Verificação 1 — Timestamps (sempre):**

Obter timestamps reais via Bash:
```bash
stat -f%m docs/.cortex/sessions/<slug>/plan.md          # macOS
stat -f%m docs/.cortex/sessions/<slug>/architecture.md  # macOS
stat -c%Y docs/.cortex/sessions/<slug>/plan.md          # Linux
stat -c%Y docs/.cortex/sessions/<slug>/architecture.md  # Linux
```

Se `architecture.md` mais recente que `plan.md`:
```
GATE 4 ALERTA ⚠: Plan pode estar desatualizado.
  plan.md:         <epoch>
  architecture.md: <epoch> (mais recente — diferença: <N> minutos/horas)
Opção A: Recriar plan.md baseado na architecture.md atual [RECOMENDADO se diferença > 1h]
Opção B: Prosseguir ciente do risco [só se diferença ≤ 1h E todas as fases ainda existem]
Aguardando instrução.
```

**Critério de decisão:**
- **Opção A obrigatória** quando qualquer condição for verdadeira:
  - Diferença de timestamp > 3600 segundos (1 hora)
  - Verificação 2 encontrou arquivos não cobertos pelo plan.md
  - Nenhuma fase do plan.md foi concluída (plan recém-criado — seguro recriar)
- **Opção B permitida** somente quando TODAS as condições forem verdadeiras:
  - Diferença ≤ 3600 segundos
  - Verificação 2 não encontrou arquivos descobertos
  - Ao menos 1 fase já marcada como ✓ (risco de perder progresso ao recriar)
  - Usuário confirma explicitamente "aceito o risco"

**Ao recriar (Opção A):** ler `architecture.md` e gerar novo `plan.md` via `/engineer:plan`. Preservar fases marcadas como ✓ — apenas adicionar/ajustar fases pendentes.

**Verificação 2 — Cobertura de arquivos (se plan.md existir):**

1. Ler seção `## Estrutura de Arquivos` de `architecture.md` — extrair caminhos
2. Ler `plan.md` — verificar quais caminhos aparecem nas fases

Para cada arquivo em `architecture.md` **não encontrado** em `plan.md`:
```
GATE 4 ALERTA ⚠: "<path>" em architecture.md não coberto por nenhuma fase do plan.md.
```

**Verificação 3 — Realidade do disco (fases marcadas como ✓):**

Para cada fase marcada como `✓ concluída` em `plan.md`:
- Extrair caminhos de arquivos listados na fase
- Verificar existência via Bash:
  ```bash
  test -f <path> && echo "exists" || echo "missing"
  ```

Para cada arquivo ausente no disco mas marcado como ✓ concluído:
```
GATE 4 ALERTA ⚠: fase "<nome>" marcada ✓ mas "<path>" não existe no disco.
Possível: fase marcada incorretamente ou arquivo deletado.
```

**Saída consolidada do GATE 4:**
- Se nenhuma inconsistência → `GATE 4 ✓ — Plan consistente.`
- Se alertas → listar todos; aguardar instrução para Opção A ou B antes de continuar

### PASSO 6 — Exibir status e confirmar dependências

```
Épico: <nome do context.md>
Objetivo: <uma linha>
Regras críticas do projeto: <contagem> regras carregadas
ADRs mapeadas: <contagem>

DEPENDÊNCIAS NECESSÁRIAS:
[Ler seção "Dependências Externas" de architecture.md e listar:]
  [ ] <VAR/arquivo/serviço> — confirmado?
  [ ] ...
```

**Como confirmar cada tipo de dependência:**

- **Variável de ambiente** (ex: `DATABASE_URL`, `API_KEY`):
  ```bash
  grep -l "NOME_DA_VAR" .env.example .env .env.local 2>/dev/null | head -1
  ```
  → Se encontrada: marcar `[✓]`
  → Se não encontrada: `"ENV VAR <nome> não encontrada em .env.example — configurar antes de prosseguir."`
  → **NUNCA exibir o valor da variável — apenas confirmar presença**

- **Arquivo externo** (ex: `src/config/settings.json`):
  ```bash
  test -f <caminho> && echo "exists" || echo "missing"
  ```
  → Se `missing`: bloquear e informar ao usuário

- **Serviço externo** (API, banco, fila):
  → Não testar automaticamente — perguntar: `"Serviço <nome> está acessível no ambiente de dev? [s/n]"`
  → Aguardar confirmação antes de prosseguir

**NUNCA:** fazer requisições HTTP automáticas para validar serviços externos

---

## Abordagem ADR-First — GATE 3 Incremental (obrigatório por arquivo)

**Antes de implementar qualquer arquivo, executar:**

### GATE 3 — ADR Mapping Incremental para <arquivo>

1. **Extrair keywords** do nome do arquivo com o algoritmo:
   1. Remover extensão: `auth-component.tsx` → `auth-component`
   2. Separar por `-`, `_` e CamelCase: `DashboardPage` → ["Dashboard", "Page"]
   3. Converter tudo para minúsculas
   4. Remover tokens genéricos (não buscam no index): `index page view model service util helper types constants config base common shared`
   5. Adicionar derivados por tipo de arquivo:
      - `.tsx` / `.jsx` → adicionar `"component"`
      - arquivo contém `service` no nome → adicionar `"service"`
      - arquivo contém `viewmodel` ou `store` → adicionar `"state"`
      - arquivo contém `api` ou `route` → adicionar `"api"`
      - arquivo contém `schema` ou `migration` → adicionar `"database"`
   6. Se lista resultante vazia após filtros → **sem keywords: ir direto ao fallback (adrs-summary.md)**

   **Exemplos corrigidos:**
   - `auth-component.tsx` → ["auth", "component"]
   - `page.tsx` → [] → fallback direto (sem keywords após remover "page")
   - `viewModel.ts` → ["viewmodel"] + derivado "state" → ["viewmodel", "state"]
   - `DashboardAnalyticsPage.tsx` → ["dashboard", "analytics", "component"] (removeu "page")
   - `user-profile-form.tsx` → ["user", "profile", "form", "component"]

2. **Lookup em CORTEX_INDEX** (`docs/.cortex/.cortex-index.json` - preenchido dinamicamente pelo Boot):
   - Para cada keyword, buscar em `adrs_by_keyword`
   - Unificar resultados sem duplicatas

3. **Se keywords encontradas no index:**
   ```
   GATE 3 [<arquivo>] via INDEX:
     ADR-NNN: <regra específica aplicável>
     ADR-NNN: <regra específica aplicável>
   OK — prosseguindo.
   ```

4. **Se keywords NÃO encontradas no index:**
   ```
   GATE 3 [<arquivo>] — sem match no INDEX. Lendo adrs-summary.md...
     ADR-NNN: <regra específica aplicável>
     ADR-NNN: <regra específica aplicável>
   OK — prosseguindo.
   ```

5. **Se arquivo de ADRs não pôde ser lido → PARAR. Não inventar regras.**

**Benefício do lookup incremental:**
- ~80% dos casos encontram ADRs via INDEX (sem reler arquivo)
- Apenas quando necessário: relê `adrs-summary.md` completo
- Economia média: ~120 tokens por arquivo

**NOTA: CORTEX_INDEX e CORTEX_CONTEXT são preenchidos dinamicamente pelo Boot com dados DO PROJETO ATUAL (docs/).**

---

## Durante o Work

Avançar fase a fase conforme `plan.md`. Para **cada fase**, executar obrigatoriamente:

### Início de fase — GATE DE DELEGAÇÃO (antes de qualquer implementação)

Para toda fase do `plan.md`, sem exceção:

**1. Verificar agents:**
- Ler campo `> Agents:` da fase atual no `plan.md`
- Se declarado e não for "nenhum" → **validar existência de cada agent antes de usar**:
  ```bash
  test -f .claude/agents/<nome>.md && echo "exists" || echo "missing"
  ```
  - Se todos existirem → interpretar sintaxe e invocar:
    - `agentA | agentB` → **paralelo**: invocar ambos simultaneamente em uma única resposta via Agent tool
    - `agentA → agentB` → **sequencial**: invocar agentA, aguardar, depois invocar agentB
    - `agentA` → **único**: invocar normalmente
  - Se qualquer agent não existir → **GATE DE DELEGAÇÃO FALHOU**:
    ```
    GATE DE DELEGAÇÃO FALHOU
    Agent declarado "<nome>" não encontrado em .claude/agents/
    Verifique o nome no plan.md ou execute /engineer:discover para listar agents disponíveis.
    NÃO PROSSEGUIR — aguardando correção.
    ```
- Se ausente ou "nenhum" → listar `.claude/agents/` via `find .claude/agents -name "*.md" -follow` e fazer match semântico com o domínio da fase
- Se houver match → **delegar via Agent tool** e aguardar resultado
- Se não houver match → implementar diretamente

**2. Verificar skill:**
- Ler campo `> Skill:` da fase atual no `plan.md`
- Se declarada e não for "nenhuma" → **usar diretamente, skip discovery**
- Se ausente ou "nenhuma" → listar skills via `find .claude/skills -maxdepth 2 -follow \( -name "SKILL.md" -o -name "SKILL.MD" \)` e comparar com o artefato que a fase irá produzir
- Se houver match → **invocar via Skill tool** antes de produzir o artefato
- Se não houver match → produzir normalmente

**3. Reportar decisão antes de iniciar:**
```
[FASE X — <nome> — iniciando]
Agents: <agentA | agentB (paralelo)> | <agentA → agentB (sequencial)> | nenhum (implementando diretamente)
Skill:  <nome da skill invocada> | nenhuma
```

### Fim de fase

1. Pausar
2. Listar arquivos criados/modificados
3. Confirmar GATE 3 foi executado para cada arquivo
4. Aguardar validação do usuário
5. Atualizar `plan.md` com progresso real
6. **ATUALIZAR MANIFESTO**: se plan.md foi criado → `files.plan.md: true`, `missing: [...]`

Se fase não concluída: marcar como `⚠ parcial` em `plan.md`, não como `✓`

**Formato de reporte por fase:**
```
[FASE X — <nome> — ✓ concluída]
Arquivos: <lista>
ADRs aplicadas: <lista>
Próxima fase: <nome>
Dependências confirmadas: <lista ou "nenhuma adicional">
```

---

## GATE 5 — Pre-PR

Antes de invocar `/pre-pr`:

- [ ] Todas as fases do `plan.md` marcadas como `✓ concluída`?
- [ ] `plan.md` tem aprendizados de cada fase registrados?
- [ ] Nenhum arquivo de `architecture.md` foi pulado?

**Se qualquer item falhar:**
```
GATE 5 FALHOU
Fases pendentes: <lista>
Completar antes de executar /pre-pr.
```

---

## Checklist de Entrega (por arquivo)

```
[ ] Segue regras críticas de docs/technical-context/briefing/critical-rules.md?
[ ] Todas as ADRs mapeadas no GATE 3 foram respeitadas?
[ ] Estrutura de pastas conforme architecture.md?
[ ] Nenhuma dependência implícita não confirmada?
[ ] 4 estados visuais (se componente interativo): Empty / Loading / Error / Success?
```
