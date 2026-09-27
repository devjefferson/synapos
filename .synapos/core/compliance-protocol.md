---
name: synapos-compliance-protocol
version: 2.0.0
description: Regras de decisão compartilhadas por todas as roles — injetado pelo pipeline-runner em todo step inline/subagent
---

# Compliance Protocol

> Fonte única. Não duplicar nos `.agent.md` nem nos steps.

---

## 1. Ordem de autoridade

Quando duas fontes discordam, vence a de cima:

```
1. ADR ativa                       (docs/_memory/adr-index.md → ADR completa)
2. Regra explícita do projeto      (memória RULE/CONSTRAINT, critical-rules, decisão do usuário)
3. Contexto da session/feature     (context.md, spec.md, architecture.md aprovados)
4. Padrão existente no projeto     (role memory, código de referência)
5. Skill relevante                 (skill específica > regra genérica da role)
6. Regra genérica da role          (.agent.md)
7. Conhecimento geral do modelo
```

Nunca use um nível inferior para contornar um superior. Conhecimento geral nunca justifica desviar do projeto.

---

## 2. Observe antes de criar

Antes de criar qualquer arquivo, componente, módulo, endpoint ou abstração, siga a escada — pare no primeiro degrau que resolve:

```
padrão existente → componente/módulo existente → composição do existente
→ adaptação do existente → novo componente → nova abstração
```

Criar algo novo exige citar no output o que foi procurado e por que não serve. Sem essa justificativa, o output é inválido.

---

## 3. Sinais de controle

Use exatamente estes marcadores. O runner os detecta e para o fluxo quando indicado.

| Sinal | Quando usar | Efeito |
|---|---|---|
| `[DECISÃO PENDENTE] {id}` (alias curto: `[?]`) | Escolha de lib, padrão, arquitetura ou escopo não definida por nenhuma fonte acima | Para. Apresenta opções A/B + recomendação. Aguarda o usuário |
| `[CONTEXT_REQUIRED] {o que falta}` | Não consegue responder uma pergunta obrigatória do step com evidência do projeto | Busca o contexto (arquivo, memória, pergunta ao usuário) **antes** de produzir |
| `[ADR-CONFLICT] {adr-id}` | A tarefa exige contrariar uma ADR ativa | Bloqueia a decisão. Explica o conflito, propõe alteração/nova ADR, aguarda aprovação |
| `[SKILL-CONFLICT] {skill}` | Uma skill contradiz ADR, regra do projeto, requisito, decisão do usuário ou padrão existente | Não escolhe em silêncio. Mostra skill × regra, aguarda decisão. Skill que só **acrescenta** ao padrão (compõe com componentes existentes, ex: `action` no EmptyState) não é conflito — aplique |
| `[STALE] {memória}` / `[CONFLICT] {memória}` | Uma memória carregada é contradita pelo estado atual do projeto | Não sobrescreve. Segue a evidência atual e reporta para atualização |

Formato do `[DECISÃO PENDENTE]`:

```
[DECISÃO PENDENTE] {id}
Contexto: {por que a decisão é necessária}
Opções:
  A) {opção} — {prós/contras}
  B) {opção} — {prós/contras}
Recomendação: {opção} — {motivo ancorado no projeto}
```

Nunca decida unilateralmente o que não está coberto pela ordem de autoridade.

---

## 4. ADR CHECK

Em steps de arquitetura, implementação e review, inclua no output (curto — só ADRs que tocam a tarefa):

```
ADR CHECK
- Relevantes: {adr-id: regra em 1 linha} | nenhuma aplicável
- Conformidade: SIM | NÃO
- Conflitos: {adr-id → motivo} | nenhum
- ADR precisa ser atualizada/criada: SIM ({qual}) | NÃO
```

Selecione ADRs pelo `adr-index.md` (domínio + escopo). Leia a ADR completa apenas se ela for relevante. Protocolo completo: `.synapos/core/adr-standard.md`.

---

## 5. Stack e evidência

- Exemplos, imports, paths e nomes seguem `stack.md` e o código real — nunca exemplos genéricos quando o projeto tem padrão.
- Afirmação sobre o projeto (usa X, existe Y) precisa de evidência: caminho de arquivo que você leu. Sem evidência → `[CONTEXT_REQUIRED]` ou "não verificado".
- Nunca invente métrica, citação, token de design, contraste, concorrente ou nome de arquivo.

---

## 6. HANDOFF

Ao final de todo step que produz output, inclua:

```
## HANDOFF
**Decisões que o próximo agente deve respeitar:**
- {decisão — justificativa em 1 linha} | nenhuma
**O que foi entregue:**
- {arquivo/artefato} — {conteúdo em 1 frase}
**O que o próximo agente precisa saber:**
- {restrição, referência de padrão, aviso}
**Bloqueios:**
- {[DECISÃO PENDENTE]/[CONTEXT_REQUIRED]/[ADR-CONFLICT]} | nenhum
**Candidatos a memória:**
- [{TIPO}] {conteúdo} · why: {motivo} · how: {quando aplicar} · scope: {escopo} · source: {arquivo} | nenhum
```

O runner remove este bloco do artefato salvo. `Candidatos a memória` segue a política de `.synapos/core/context-engine.md` §4.
