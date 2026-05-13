---
name: synapos-compliance-protocol
description: Protocolos de compliance compartilhados por todos os agents — injetado pelo pipeline-runner
---

# Compliance Protocol

> Injetado pelo pipeline-runner no contexto de cada agent.
> Fonte única de verdade — não duplicar nos arquivos `.agent.md`.

---

### Stack Adaptation Rule

O pipeline-runner injeta `docs/_memory/stack.md` no contexto antes de qualquer output.
Use as informações de stack para adaptar **todos** os exemplos de código, imports, estruturas de pastas e referências a ferramentas para a linguagem e framework do projeto.

- **Princípios e critérios de qualidade → imutáveis**
- **Exemplos concretos, imports, paths, nomes de libs → sempre na stack do projeto**

Se stack.md não estiver no contexto: use exemplos genéricos sem emitir aviso.

---

### ADRs — Verificação Proativa

Antes de qualquer decisão técnica, verifique os arquivos de ADR em `docs/` e na session ativa (`docs/.squads/sessions/{feature-slug}/`).

Liste cada ADR relevante no output:
- `[RESPEITADA]` — solução alinhada com a ADR
- `[NÃO APLICÁVEL]` — ADR não se aplica ao contexto atual

Conflito com ADR existente → sinalize com `🚫 CONFLITO-ADR: {adr-id}`. Nunca contradiga uma ADR aprovada sem aprovação explícita do usuário.

---

### [DECISÃO PENDENTE] — Protocolo Obrigatório

Quando identificar uma decisão fora do escopo do step atual (escolha de lib, padrão, abordagem não especificada), PARE e sinalize:

```
[DECISÃO PENDENTE] {id}
Contexto: {por que esta decisão é necessária}
Opções:
  A) {opção A} — {prós/contras}
  B) {opção B} — {prós/contras}
Recomendação: {opção recomendada}
Aguardando aprovação.
```

Nunca decida unilateralmente. Nunca assuma. Sempre sinalize e aguarde o humano.

---

### HANDOFF — Protocolo Obrigatório

Ao final de **todo** step que produz output, inclua o bloco `## HANDOFF` antes de encerrar.
O pipeline-runner extrai este bloco e injeta apenas ele no próximo agent (não o output completo).

```
## HANDOFF
**Decisões que o próximo agente deve respeitar:**
- {decisão 1 — com justificativa em 1 linha}
- nenhuma (se não houver decisões relevantes)

**O que foi entregue:**
- {arquivo ou artefato} — {o que contém em 1 frase}

**O que o próximo agente precisa saber:**
- {contexto, restrição ou aviso para o step seguinte}

**Bloqueios ou [DECISÃO PENDENTE]:**
- nenhum (ou descrição)
```

O bloco `## HANDOFF` é removido do artefato final pelo runner — não contamina o output salvo.
