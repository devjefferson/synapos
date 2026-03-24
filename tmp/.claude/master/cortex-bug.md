# CORTEX BUG MASTER (v1.7.0)

> Modo de correção de bug crítico. Pipeline enxuto: capturar → diagnosticar → corrigir → verificar.
> Não exige spec completo. Prioridade: resolver sem introduzir nova regressão.
> Este modo NÃO refatora código além do escopo do bug.

---

## Quando usar este modo

- Bug em produção ou staging que precisa de correção imediata
- Comportamento inesperado com impacto real no usuário
- Erro com stack trace identificado

**Diferença de Execution:** Execution parte de uma spec planejada. Bug parte de um sintoma.

---

## Pré-condição obrigatória

Boot executado com GATE 0 aprovado.
Se não: executar `/cortex:boot` antes de prosseguir.

---

## Sequência de Ativação

### PASSO 1: Capturar o Bug Report

```
BUG REPORT:
  Sintoma:       <o que o usuário vê / o que está errado>
  Reprodução:    <como reproduzir — passos ou condição>
  Stack trace:   <erro completo se disponível>
  Ambiente:      <produção / staging / local>
  Impacto:       <quantos usuários / qual funcionalidade bloqueada>
  Desde quando:  <quando começou / qual deploy>
```

Gerar slug: `bug-NNN-descricao-kebab-case`
Criar diretório: `docs/.cortex/sessions/<slug>/`

**Atualizar manifesto** (`docs/.cortex/sessions-manifest.json`):
```json
Adicionar em sessions:
{
  "<slug>": {
    "status": "in_progress",
    "created_at": "<timestamp atual>",
    "files": {},
    "missing": ["plan.md"]
  }
}
```

**Ao criar plan.md** (PASSO 3): atualizar manifesto → `files.plan.md: true`, `missing: []`

### PASSO 2: Diagnosticar Root Cause (OBRIGATÓRIO — não pular)

1. Ler os arquivos indicados no stack trace ou descrição do bug
2. Identificar a linha/lógica exata que causa o problema
3. Registrar root cause:

```
ROOT CAUSE:
  Arquivo:   <path>
  Linha/área: <onde está o problema>
  Causa:     <por que acontece — técnico>
  Trigger:   <o que ativa o bug — condição>
```

**Nunca assumir root cause sem ter lido o código. Fail Loud se não conseguir ler.**

### PASSO 3: GATE-B — Plano de Correção Mínimo

Antes de escrever código:

```
PLANO DE CORREÇÃO:
  Arquivos a modificar: <lista com motivo>
  Fix proposto:         <descrição técnica do que muda>

  Regressão checklist:
    [ ] Quem mais chama a função/componente afetado?
    [ ] Existe teste cobrindo o caminho corrigido?
    [ ] A correção pode quebrar outro comportamento?

  Estratégia de verificação: <como confirmar que o bug foi corrigido>
```

Registrar em `docs/.cortex/sessions/<slug>/plan.md` (formato simplificado).

Se risco de regressão alto → confirmar com usuário antes de aplicar fix.

### PASSO 4: Aplicar Correção (ADR-First mínimo)

Para cada arquivo modificado:
- Executar GATE 3 incremental (via CORTEX_INDEX) — validar ADRs aplicáveis
- Aplicar **apenas** o fix identificado no GATE-B
- Não refatorar código adjacente

### PASSO 5: GATE-B2 — Verificação Pós-Fix

Após aplicar a correção:

```
VERIFICAÇÃO PÓS-FIX:
  [ ] O sintoma original seria resolvido por esta correção?
  [ ] "Quem mais chama" foi verificado manualmente?
  [ ] Arquivos modificados seguem as regras críticas do projeto?
  [ ] Nenhum arquivo foi alterado além do escopo do fix?
```

Se qualquer item falhar → revisar fix antes de PR.

### PASSO 6: PR de Bug

Template de PR para bug:

```markdown
## Bug Fix: <descrição>

### Sintoma
<o que o usuário via>

### Root Cause
<causa técnica identificada>

### Correção
<o que foi alterado e por quê>

### Verificação
<como testar que o bug foi resolvido>

### Risco de Regressão
<baixo / médio / alto> — <justificativa>
```

---

## Restrições Absolutas

**PROIBIDO:**
- Aplicar fix sem ter identificado root cause (não tratar sintoma)
- Refatorar código além do escopo do bug
- Marcar como resolvido sem executar GATE-B2
- Assumir que o bug está em determinado arquivo sem tê-lo lido

**Se root cause não encontrado após leitura:**
```
ROOT CAUSE NÃO IDENTIFICADO
Lido: <lista de arquivos>
Hipóteses: <lista de possíveis causas>
Próximo passo: <quais arquivos ler / qual log coletar>
Aguardando instrução. NÃO aplicar fix às cegas.
```
