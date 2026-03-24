# CORTEX MODIFY MASTER (v1.7.0)

> Modo de modificação de feature existente. Ativo quando já existe implementação e se quer estender ou alterar.
> Lê código existente ANTES de especificar. Gera delta spec — apenas o que muda.
> Este modo NÃO redefine a arquitetura existente sem análise explícita de impacto.

---

## Quando usar este modo

- Feature já existe no código e você quer adicionar algo
- Ex: tela de login existe → quero adicionar login social
- Ex: componente de tabela existe → quero adicionar ordenação e filtro
- Ex: API de usuários existe → quero adicionar paginação

**Diferença de Execution:** Execution parte de um spec novo. Modify parte do que JÁ EXISTE.

---

## Pré-condição obrigatória

Boot executado com GATE 0 aprovado.
Se não: executar `/cortex:boot` antes de prosseguir.

---

## Sequência de Ativação

### FASE 0: Capturar o objetivo da modificação

Perguntar:
```
O que existe hoje? (descreva o que já está implementado)
O que você quer adicionar ou mudar?
Existe alguma limitação ou restrição que você já conhece?
```

Gerar slug no padrão: `feature-NNN-descricao-kebab-case`

**Ao criar session:** ATUALIZAR MANIFESTO em `docs/.cortex/sessions-manifest.json`:
- Adicionar entrada com `status: "in_progress"`, `created_at: <timestamp>`, `missing: ["context.md", "architecture.md"]`

**Ao criar context.md (FASE 3):** atualizar manifesto → `files.context.md: true`
**Ao criar architecture.md (FASE 3):** atualizar manifesto → `files.architecture.md: true`
**Ao aprovar GATE 2 (FASE 4):** atualizar manifesto → `status: "closed"`

### FASE 1: Ler o código existente (OBRIGATÓRIO antes de qualquer spec)

1. Identificar arquivos relevantes baseado na descrição do usuário
2. Ler os arquivos existentes que serão modificados
3. Registrar internamente:
   - Estrutura atual (quais arquivos, quais funções/componentes)
   - Padrões em uso (state management, naming, imports)
   - Pontos de extensão naturais
   - Possíveis pontos de quebra

**Não prosseguir sem ler o código. Não assumir o que existe.**

### FASE 2: GATE-M — Mapa de Impacto

Antes de escrever qualquer spec, avaliar:

```
MAPA DE IMPACTO:

Arquivos a modificar:
  <arquivo> — motivo: <por que precisa mudar>

Arquivos novos a criar:
  <arquivo> — motivo: <o que faz>

Arquivos possivelmente afetados (não tocados mas dependentes):
  <arquivo> — risco: <o que pode quebrar>

Funcionalidade existente em risco:
  <funcionalidade> — mitigação: <como proteger>
```

Se risco alto detectado → confirmar com usuário antes de prosseguir.

### FASE 3: Delta Spec

Criar delta spec focado no que muda:

**`docs/.cortex/sessions/<slug>/context.md`:**
```markdown
# Modify: <nome da feature>

## O que existe hoje
[Resumo do código lido — não vago]

## O que muda
**Adicionando:** [lista explícita do que será adicionado]
**Modificando:** [lista explícita do que será alterado]
**Mantendo intacto:** [o que NÃO deve mudar]

## Regras de Negócio (novas ou alteradas)
[Lista numerada — apenas delta, não repetir o que já existe]

## Regras Críticas do Projeto
[COPIAR INTEGRALMENTE de docs/technical-context/briefing/critical-rules.md]
```

**`docs/.cortex/sessions/<slug>/architecture.md`:**
```markdown
# Architecture: <nome da feature>

## Arquivos a Modificar
[Para cada arquivo: o que existe hoje → o que muda]

## Arquivos Novos
[Para cada arquivo: propósito + estrutura]

## ADRs Aplicáveis
[Validar via CORTEX_INDEX — lazy como Fase 3 do Strategy]

## Mapa de Impacto
[Resultado do GATE-M — atualizado após leitura do código]

## Estratégia de Não-Regressão
[Como garantir que o que existe continua funcionando]
```

### FASE 4: GATE 2 (Delta) — Spec Fechada

Checklist adicional ao GATE 2 padrão:

- [ ] "O que existe hoje" foi verificado no código (não assumido)?
- [ ] "Mantendo intacto" lista explícita do que não muda?
- [ ] Mapa de Impacto preenchido com riscos identificados?
- [ ] Estratégia de não-regressão definida?

Se passar: handoff para Execution Mode com slug.

```
GATE 2 (MODIFY) APROVADO — Delta spec fechada.
Session: docs/.cortex/sessions/<slug>/
  context.md  ✓ (delta spec)
  architecture.md ✓ (mapa de impacto incluído)

Próximo passo: abrir Janela 2 → /cortex:execution → informar slug: <slug>
ATENÇÃO ao executar: ler código existente novamente antes de modificar.
```

**Após GATE 2 aprovado:** executar `/product:task` para criar issue de rastreamento da modificação.

---

## Durante a Execução (via Execution Mode)

Ao abrir o Execution Mode com um slug de modify:
- Ler architecture.md seção "Arquivos a Modificar" — entender o antes
- Re-ler o arquivo existente antes de editar (nunca assumir que conhece)
- Após cada modificação: verificar que "Mantendo intacto" ainda está intacto
- Ao final: executar "Estratégia de Não-Regressão" definida na spec

---

## Restrições Absolutas

**PROIBIDO:**
- Assumir que conhece o código sem tê-lo lido nesta janela
- Refatorar código não relacionado ao escopo do modify
- Ignorar o Mapa de Impacto durante execução
