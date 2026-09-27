# Product Workflow

> Squad: `.synapos/squad-templates/produto/` · pipeline principal: `discovery-spec-handoff.yaml`.

## Problema

- Ideia vaga podia ir direto para código: não havia triagem, e o default do squad (`nova-feature`) começava validando um requisito já supostamente pronto.
- O discovery tinha 11 steps e 15+ documentos, começava por pesquisa de mercado e exigia "≥3 concorrentes" e "citação de usuário real" — dados que a IA não tem e, portanto, fabricava.
- Requisitos misturavam comportamento, regra de negócio e restrição; RNFs vinham com números pré-preenchidos.
- Handoff em 3 arquivos; o dev não lia nenhum deles automaticamente e recomeçava a investigação do zero.

## Fluxo v4

```
IDEIA
 │  triagem: funcionalidade nova sem problema/usuário/regras → complex → Produto
 ▼
pd-02-brainstorm (Priscila)      → brainstorm.md
 │  reformular (dito × suposto) · problema · usuário · objetivo · dados · regras · fluxo
 │  · 2 alternativas · riscos · escopo v1 → Resumo da Descoberta confirmado
 ▼
02-contexto-negocio (opcional)   → research/market-analysis.md   (só com skill de busca e pedido do usuário)
 ▼
06-requisitos (Ana)              → requirements.md
 │  RF "o sistema deve" · RN "quando X, Y" · RC "não pode" · CA Dado/Quando/Então · RNF
 ▼
checkpoint de requisitos (usuário aprova prioridades, regras e CA)
 ▼
05-spec (Priscila)               → spec.md   (consolida; nada novo sem fonte)
 ▼
06c-visual-spec (opcional)       → visual-spec.md   (componentes/tokens reais do projeto)
 ▼
08-handoff (Tânia) · GATE-HANDOFF → handoff.md
 ▼
squad de dev na MESMA feature → investigação lê handoff.md/spec.md (needs_spec) e só pergunta lacunas
```

## Decisões

| Decisão | Motivo |
|---|---|
| Brainstorm antes de tudo | a primeira ideia do usuário é ponto de partida; o problema define os requisitos |
| Pesquisa opcional e com fonte | sem busca real, pesquisa vira ficção |
| Requisitos antes da spec | a spec consolida o que foi decidido; não é o lugar de decidir |
| RF/RN/RC/CA separados | regra de negócio escondida em RF some na implementação; CA Dado/Quando/Então é testável |
| `[A DEFINIR: quem]` em vez de número | valor desconhecido vira questão aberta, não métrica inventada |
| Um handoff contratual | a próxima role recebe problema, objetivo, escopo, RF, RN, CA, UX, restrições, contexto e questões num lugar só |
| Produto sem pré-execução de engenharia | arquitetura antes de requisitos inverte a ordem; o brainstorm é a investigação |
| Tânia não produz ADR/arquitetura | era sobreposição com engenharia |

## Pipelines do squad

| Pipeline | Quando |
|---|---|
| `discovery-spec-handoff` | ideia pouco definida (track complex) |
| `quick-spec` | feature já definida: contexto → spec → requisitos → handoff |
| `nova-feature` | especificar com base em `docs/business/` existente; roteia para o discovery se a ideia for vaga |
| `refinar-docs` | versionar doc de produto existente (único que exige `docs/business/`) |
| `quick-fix` | decisão/ajuste pontual de produto |

Removidos: `03-personas`, `04-checkpoint-research`, `04b-alinhamento-estrategico` (perguntas absorvidas pelo brainstorm), `05b-checkpoint-spec`, `07-arquitetura`, `qs-05-handoff` (substituído pelo `08-handoff`).
