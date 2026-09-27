# Role Guidelines

> Como uma role deve se comportar na v4 — e onde cada regra vive, para não duplicá-la nos 30 `.agent.md`.

Uma role é uma **perspectiva com critérios**, não uma persona decorativa. O que a torna precisa não é o tamanho do `.agent.md`, e sim o contexto que ela recebe e as fronteiras que respeita.

## Onde vive cada regra

| Regra | Arquivo | Por quê lá |
|---|---|---|
| Ordem de autoridade, escada de reuso, sinais de controle, ADR CHECK, HANDOFF | `core/compliance-protocol.md` | vale para todas as roles; injetado uma vez por step |
| O que carregar e por quê (Context Brief) | `core/context-engine.md` | vale para todas as roles |
| Padrões do domínio neste projeto | `docs/_memory/roles/{domain}.md` | é conhecimento do projeto, não da role |
| Critérios específicos do domínio (ex: 4 estados async) | `.agent.md → Regras Obrigatórias / Quality Criteria` | é o olhar da role |
| O que a role não faz | `.agent.md → Fora do Meu Escopo` | injetado como fence |
| Foco por tipo de step | `.agent.md → Foco por Tipo de Step` | o runner injeta só a linha do step atual |

## Checklist de uma role bem escrita

1. **Context awareness** — o `Foco por Tipo de Step` manda partir de artefatos existentes (spec, âncora de padrão, architecture.md), não de conhecimento geral.
2. **Project consistency** — nenhuma regra obrigatória prescreve lib, estrutura ou valor que o projeto possa ter decidido diferente. Onde a v3.5 dizia "server → React Query", a v4 diz "a lib que o projeto usa; sem padrão → `[DECISÃO PENDENTE]`".
3. **Skill usage** — a role não lista skills; o runner seleciona pelo índice. A role cita o critério da skill quando ele decide algo.
4. **Scope** — `Fora do Meu Escopo` explícito, especialmente entre vizinhos (arquiteta × dev × revisora; PM × analista × tech writer).
5. **Decision boundaries** — escolha não coberta por ADR, regra, contexto aprovado ou padrão existente → sinal de controle. Nunca decisão silenciosa.

## Frontend (a role mais afetada)

| Role | Mudança |
|---|---|
| Ana (arquitetura) | arquitetura = variação da referência do projeto; tabela Reuso x Novo; estado/fetch/form com as libs do projeto |
| Rodrigo (dev) | abre a referência e os componentes reais antes de codar; tokens do projeto; validação visual (browser) ou revisão estrutural |
| Renata (review) | Camada 0 — consistência com a referência, ADR e skills — antes de corretude/qualidade/a11y |
| Úrsula (UI) | specs com tokens/componentes existentes; contraste calculado ou "não verificado" |

**Frontend Consistency Rule** (step `02-arquitetura` e âncora do `pattern-discovery`): antes de desenhar, responder com caminho de arquivo — página mais parecida, container, componentes a reutilizar, padrão visual, abstração existente, regra documentada. Sem resposta → `[CONTEXT_REQUIRED]`.

## Produto

| Role | Mudança |
|---|---|
| Priscila (PM) | brainstorm antes de spec; nunca transforma a primeira ideia em spec; métricas só informadas |
| Ana Análise | RF/RN/RC/CA/RNF separados e rastreados à fonte; `[A DEFINIR]` em vez de número inventado |
| Tânia (tech writer) | handoff contratual; não decide arquitetura |

## Engineer (pré-execução de todos os squads)

Leo: investigação parte de spec/handoff/memória e pergunta só lacunas; arquitetura parte da referência; ADR pelo índice.

## Demais squads

Backend, devops, ia-dados, mobile e fullstack não tiveram os `.agent.md` reescritos: recebem compliance, memória, skills, ADR e a descoberta de padrões (via pré-execução) do core. Ao evoluir um desses agents, aplique o checklist acima — em especial o item 2 (não prescrever o que o projeto decide).
