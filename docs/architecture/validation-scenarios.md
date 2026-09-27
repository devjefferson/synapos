# Validation Scenarios

> Como a v4 foi validada: validação estática (`npm test`) + 7 cenários comportamentais executados por agentes reais seguindo o protocolo do framework sobre a fixture `tests/fixtures/ui-app/`, mais 2 execuções de controle com a v3.5.0.

## Método

- **Fixture** (`tests/fixtures/ui-app/`): app Next.js com `Container`, `PageLayout`, `PageHeader`, `Card`, `Button`, `EmptyState` e `FormField`; listagem e formulário de produtos; `skills/ux.md`; ADR-001 (forms com react-hook-form + zod) e ADR-002 (dados via Server Components + `src/lib/api.ts`, sem React Query); `project-memory.md` com uma memória **propositalmente obsoleta** (`lucide-react`, quando o `package.json` usa `@phosphor-icons/react`).
- **Execução:** para cada cenário, uma cópia isolada (fixture + `.synapos/` + git) e um agente que executa `/init` seguindo **só** os arquivos do framework, com respostas simuladas do usuário. O agente reporta triagem, Context Briefs, arquivos lidos com motivo, perguntas, arquivos alterados e ambiguidades do protocolo. O diff real da cópia foi conferido.
- **Iteração:** as ambiguidades reportadas viraram correções no framework (listadas por cenário). Cenários posteriores já rodaram parcialmente com correções anteriores.

## Validação estática

`npm test` → `tests/validate-framework.js`: step files, agents, gates, `depends_on`/`on_reject`, tracks, `quick_role`, referências a arquivos do core e orçamento do contexto sempre-carregado.

| Versão | Resultado |
|---|---|
| v3.5.0 | ❌ 14 erros — incluindo `../../../core/.../update-task.md` quebrado, `GATE-2`/`GATE-4` indefinidos, `ursula-ui` inexistente no produto, contexto sempre-carregado 105 KB |
| v4.0.0 | ✅ íntegro — contexto sempre-carregado ~74 KB (6 arquivos, incluindo memória e skills) |

## Resultados

| # | Cenário | Esperado | Resultado v4 |
|---|---|---|---|
| 1 | "Criar a página de listagem de clientes em /clientes" | reusar padrões existentes | ✅ standard → pré-execução → discovery completo (gerou `roles/frontend.md` com evidência) → arquitetura ancorada em `produtos/page.tsx` → código usa `PageLayout > PageHeader(Link>Button) > Card > EmptyState \| ul`, `listClientes()` em `api.ts` (ADR-002), `loading.tsx`/`error.tsx` da referência. **Zero componentes, containers ou libs novos.** Detectou o `[STALE]` de ícones de passagem |
| 2 | "Melhorar a UX do formulário de novo produto" | detectar e usar `skills/ux.md` | ✅ quick → skill descoberta e selecionada no Brief; mudanças citam o critério: `mode: 'onBlur'` (§Formulários), "Salvar produto" (§Formulários), mensagem de erro de submit (§Mensagens); ADR-001/002 conformes; campos e validação intactos |
| 3 | "Criar a listagem de fornecedores" com `roles/frontend.md` já existente | recuperar sem reanalisar | ✅ `🔎 [DISCOVERY] pulado — role memory fresca` (coverage cobre a área); leu só a referência e as props dos componentes reutilizados para verificação no ponto de uso; resultado com a mesma composição do T1 |
| 4 | "Adicionar ícone de '+' no botão Novo produto" com memória "ícones via lucide-react" | identificar memória obsoleta | ✅ `[STALE] [FACT] lucide-react — package.json mostra @phosphor-icons/react`; usou Phosphor (import SSR, `aria-hidden`); corrigiu a entrada existente em vez de duplicar |
| 5 | "Quero uma tela para cadastrar clientes." | Produto não codifica; descobre problema/usuário/dados/regras | ✅ complex → squad Produto → `pd-02-brainstorm`; reformulou separando dito × suposto; rodada de perguntas sobre problema, quem cadastra e em que momento, dados/unicidade (CPF/CNPJ), alternativas (completo × mínimo × importação) e escopo; **nenhum arquivo em `src/` alterado** |
| 6 | "Alterar o texto do botão 'Novo produto' para 'Adicionar produto'" | não iniciar processo completo | ✅ quick → fast lane: **0 perguntas, 1 linha alterada**, sem squad, sem session; desambiguou a 2ª ocorrência do texto (título, não botão) |
| 7 | "Módulo de pedidos com reserva de estoque e aprovação de desconto" | brainstorm → requisitos → arquitetura → plano → dev → review | ✅ complex → Produto (brainstorm → requisitos → checkpoint → spec → handoff) → squad de dev na mesma session (pré-execução com investigação lendo `handoff.md`, padrões, arquitetura, **plano**) → implementação → review; perguntas cobrindo problema, ciclo da reserva, regra dos 10%, perfis e alternativas de aprovação |

### Controle — mesmos pedidos na v3.5.0

| # | v3.5.0 | v4.0.0 |
|---|---|---|
| 6 (texto do botão) | 7 interações (modo, lista de 9 squads, "o que vamos implementar?" repetido, 2 perguntas de memória, commit, menu); pipeline `feature-development` completo — arquitetura, implementação, review e docs com 3 subagentes; 15 arquivos de squad/session criados; ~2.700 linhas de framework lidas; ADRs não consultadas (modo rápido); `skills/ux.md` e `project-memory.md` nunca carregados | 0 interações; 1 arquivo; ADR e skill consultadas pelo Brief |
| 1 (listagem de clientes) | código final semelhante, mas **porque o agente contornou o framework**: ignorou a reescrita de caminhos, rodou a pré-execução "pela intenção" (à letra ela nunca roda), passou por cima de GATE-0 bloqueante, resolveu sozinho o conflito entre a regra "server → React Query" da Ana e a ADR-002; duas arquiteturas (pré-exec + FE, com `.bak`) + visual-spec + plan para 4 arquivos; ~14 interações; SCOPE GUARD inativo na implementação; `git diff` perdeu os 3 arquivos novos; memória obsoleta e `skills/ux.md` não carregados pelo protocolo | pré-execução por projeto, discovery persistido, arquitetura única ancorada, SCOPE GUARD na implementação, `[STALE]` detectado, skill no Brief |

## Correções originadas dos cenários

| Cenário | Ambiguidade reportada | Correção |
|---|---|---|
| 6, 4, 2 | track quick construía `adr-index`/`skills-index` e varria 6 fontes para trocar um texto | quick nunca constrói índices: usa listagem barata (orchestrator FAST LANE, context-engine §3.1) |
| 6, 4, 2 | role memory "ausente → discovery" × fast lane "só se existir" | precedência explícita por track (context-engine §3.2) |
| 6, 4 | "formato curto do CHANGE GUARD" inexistente; HANDOFF sem destinatário na fast lane | formato de relatório definido na FAST LANE; sem HANDOFF |
| 6 | skill `filesystem` "obrigatória" para qualquer edição | ferramentas nativas da IDE prevalecem; `whenToUse` adicionado às 5 skills instaladas |
| 4 | `[STALE]` "marcar" × dedupe "atualizar" | corrigir a mesma entrada com `corrigido de:` (context-engine §5.1) |
| 4 | ADR de dados casava por glob de path numa mudança cosmética | match por tema da decisão, não só path (adr-standard §3) |
| 2, 4, 6 | triagem numerada 1.6 mas executada após o PASSO 2; fast lane não dizia que pula PASSOS 3–5 | triagem movida para PASSO 2.5; fast lane encerra o /init |
| 5, 7 | `mode: solo` (default) pulava a aprovação de requisitos no track complex | solo não pula checkpoints no complex (runner §2.6) |
| 5, 7 | `pipeline.default` do template × pipeline da triagem | setup:squad grava o pipeline escolhido pelo track |
| 7 | `context.md` parcial do brainstorm faria o dev pular a pré-execução | gatilho considera `architecture.md` ausente; investigação completa o context.md |
| 7 | `plan.md` gerado e nunca consumido | `needs_plan` nos steps de implementação dos squads |
| 7 | SCOPE GUARD nunca atuava em steps de implementação (bug herdado) | guard ativo em steps que escrevem código |
| 7 | review do fullstack depende de agent opcional | setup:squad inclui agents exigidos pelo pipeline |
| 5, 7, 1, 3 | "nunca escreva em `.synapos/`" × setup:squad cria `.synapos/squads/` | exceção explícita |
| 5, 7, 1, 3 | retorno a "PASSO 8" inexistente; rótulos "Modo Rápido/Completo" | PASSO 5; rótulos por track |
| 6-old, 1, 3 | `pre_pipeline` não era copiado para o `squad.yaml` — pré-execução morta (bug herdado) | schema do squad.yaml inclui `pre_pipeline` |
| 6-old | `git diff --name-only` não vê arquivos novos | `git status --porcelain` |
| 6-old | HANDOFF de subagente alegou "commit pronto" sem commit | HANDOFF conferido contra CHANGE GUARD |
| 1, 3 | skill `ux` (EmptyState com action) × referência sem action | skill que só compõe com o existente não é conflito; contradição → `[SKILL-CONFLICT]` |
| 1, 3 | destino de DECISION da session ambíguo | `context.md → ## Decisões` é canônico |

## Limitações

- Agentes, não usuários: respostas simuladas e um único modelo. Mostra que o protocolo **conduz** ao comportamento; não mede variância entre modelos (tier standard/lite não testado).
- Sem browser nem dependências instaladas: a validação visual caiu na revisão estrutural em todos os cenários; código não compilado.
- Os cenários 1–7 rodaram antes de parte das correções acima; as correções não foram re-executadas em nova rodada.

## Como repetir

```bash
npm test
# comportamental: copie tests/fixtures/ui-app + .synapos/ para um diretório temporário,
# git init, e execute /init com os pedidos da tabela acima.
```
