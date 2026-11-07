---
name: synapos-evidence-standard
version: 1.0.0
description: Como afirmar fatos sobre o repositório com fonte verificável, e quando e como representá-los em diagrama
---

# EVIDENCE & DIAGRAMS v1.0.0

> Carregue **sob demanda**: ao documentar arquitetura, investigar código, ou quando uma afirmação sobre o projeto precisa de prova. Não é lido em toda execução.
> Origem: princípios do Archify (diagramas fundamentados em código), adaptados a Markdown. Referência, não dependência.

---

## 1. Classes de afirmação

Toda afirmação em doc técnico é exatamente uma destas — e **nunca** apresente uma como outra:

| Classe | Prova exigida | Marcação |
|---|---|---|
| Fato verificado | citação `path:linha` lida nesta tarefa | citação inline |
| Decisão aprovada | ADR vigente ou aprovação registrada | link da ADR |
| Hipótese | nenhuma | `(hipótese)` |
| Proposta | nenhuma | `(proposta)` |
| Desconhecido | — | `(desconhecido: {o que falta})` |

## 2. Citação

```
`src/orders/service.ts:40-90`     # intervalo inclusivo, caminho relativo à raiz
`src/orders/service.ts:42`        # linha única
```

- Cite o **elemento principal** (componente, módulo, entidade, estado), no máximo 3 intervalos cada. Relações citam o local da chamada/escrita **no elemento dono** (quem chama, quem escreve) — não duplique em cada aresta.
- Cite o que você **leu**, com a numeração original do arquivo. Não cite de memória.
- Repositório com mudanças não commitadas: diga quais caminhos divergem do `HEAD`; não apresente bytes não commitados como evidência de uma revisão.

## 3. Como investigar (fatia conectada, não varredura)

1. **Mapeie a fatia:** instruções do projeto, manifests, entradas, registros, configuração de deploy → candidatas a unidades de runtime.
2. **Siga até o efeito:** do ponto de entrada até a entrada/saída/efeito colateral real. Leia uma fatia conectada; não escaneie o repo atrás de um rótulo conveniente.
3. **Trace a posse:** quem pede a operação ≠ quem a executa ≠ quem recebe os bytes. "Mantém tarefas" não prova I/O direto; cite quem lê/escreve de fato.
4. **Configurado ≠ chamado.** Função exportada ou config sem chamada no caminho normal é capacidade opcional, não aresta obrigatória. Provedor configurado, adapter injetado, stub local e serviço durável são afirmações diferentes — rotule a que a fonte sustenta.
5. **Incerteza ao lado da afirmação:** "`writeFile` é chamado aqui; durabilidade desconhecida". Resolva lendo o próximo trecho relevante ou preserve como `(desconhecido)`. Nunca transforme rótulo, descrição de pacote ou valor de config em serviço ou comportamento não observado.
6. **Parada:** quando toda responsabilidade, relação e fronteira pedida tem fonte e os desconhecidos restantes não mudam a cobertura. Não há contagem mínima de nós, citações ou views.

Cada leitura extra deve responder uma dúvida que muda o resultado. Reuse fatos já verificados na tarefa; ao revisar, releia só entradas, config e dependências afetadas.

## 4. Quando desenhar (e quando não)

Diagrama só quando aumenta a compreensão: relações que texto linear esconde. Se cabe em 3 linhas ou uma tabela, não desenhe. Todo diagrama usa fatos da classe "verificado" — hipótese e proposta ficam rotuladas no próprio desenho.

| Pergunta | Tipo | Mermaid |
|---|---|---|
| Do que é feito / quais componentes e fronteiras | architecture | `flowchart` |
| Como um processo, aprovação ou pipeline avança | workflow | `flowchart` |
| Quem chama quem, em que ordem (request, async) | sequence | `sequenceDiagram` |
| Para onde vão os dados (ETL, linhagem) | data flow | `flowchart` |
| Estados e transições (retry, terminal) | lifecycle | `stateDiagram-v2` |
| Entidades, chaves, cardinalidade | erd | `erDiagram` |
| Tipos e relações (herança, composição) | class | `classDiagram` |
| Contenção de pai único (módulos, features) | tree | `flowchart TD` |
| Quando as coisas aconteceram | timeline | lista datada |
| Onde o tempo foi gasto | waterfall | tabela de spans |

Regras:
- **Uma pergunta por diagrama.** Mostre o caminho principal e os ramos necessários; ramos de exceção ao lado do dono. Não liste todo helper só por ter sido descoberto.
- **Nível de abstração declarado** quando o leitor poderia esperar mais ("omitidos: helpers de formatação").
- **Durações ilustrativas** (sem trace real) são rotuladas como ilustrativas — não rode o projeto só para cronometrar.
- Persistência: o diagrama vive no artefato que já existe (`architecture.md` da session, ADR). Não crie arquivo só para ele.

## 5. Relatar verificação com honestidade

Distinga o que foi feito — não infle:

| Nível | Pode dizer |
|---|---|
| Citações checadas por script (`npx synapos doctor`) | "citações existem e estão dentro do arquivo" |
| Lidas e conferidas por você | "conferido contra o código em {revisão}" |
| Nada disso | "não verificado" |

"Checagens automáticas passaram" **não** significa "o desenho está correto". Código de saída ≠ 0 nunca é sucesso. Não recapitule comandos ou rodadas; relate o resultado e o que muda a leitura (abstração, omissões, evidência ausente).
