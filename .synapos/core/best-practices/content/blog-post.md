---
id: blog-post
version: "1.0.0"
domain: [custom]
whenToUse: "Quando o squad escreve artigos para blog"
---

# Blog Post

> Guia para escrever artigos que educam, posicionam e geram tráfego orgânico consistente.

---

## Princípios

- **Escolha um problema real** — artigos que resolvem dúvidas concretas têm mais tráfego e retenção
- **Profundidade > quantidade** — um artigo excelente supera cinco mediocres em SEO e autoridade
- **Escreva para o leitor, não para o Google** — SEO é consequência de conteúdo útil, não o contrário
- **Estrutura é respeito pelo tempo do leitor** — use headers, listas e bullets para facilitar a leitura escaneada
- **Um artigo, uma ideia central** — se você precisa de mais de um parágrafo para explicar o tema, provavelmente são dois artigos

---

## Tipos de Artigo

| Tipo | Objetivo | Quando usar |
|------|----------|-------------|
| **Tutorial / How-to** | Ensinar a fazer algo passo a passo | Quando o leitor quer resolver uma tarefa específica |
| **Explicativo / Conceitual** | Esclarecer um conceito ou tecnologia | Quando há confusão sobre "o que é" ou "como funciona" |
| **Comparativo** | Comparar opções, ferramentas ou abordagens | Quando o leitor está avaliando alternativas |
| **Opinião / Ponto de vista** | Posicionar a marca em um debate do setor | Quando queremos gerar discussão e autoridade |
| **Estudo de caso** | Mostrar resultado real com contexto completo | Quando temos evidência concreta para compartilhar |
| **Listicle** | Lista de recursos, ferramentas ou práticas | Quando o conteúdo é naturalmente enumerável |
| **Guia definitivo** | Cobrir um tema de forma abrangente | Quando queremos ranquear para termos amplos de alto volume |

---

## Estrutura Padrão

```markdown
# [Título — claro, específico, com keyword principal]

[Meta description / subtítulo — 1 a 2 frases resumindo o valor do artigo]

---

## Introdução (100–200 palavras)
- Identifique o problema ou pergunta que o artigo resolve
- Estabeleça por que o leitor deveria continuar
- Apresente o que será coberto (não spoile a solução, crie antecipação)

---

## [Seção 1 — H2]

### [Subseção 1.1 — H3, se necessário]

## [Seção 2 — H2]

## [Seção 3 — H2]

---

## Conclusão (100–150 palavras)
- Resuma o insight principal
- Reforce o benefício para quem aplicar o que foi ensinado
- CTA claro: próximo passo, link relacionado, comentário, newsletter

---

*Tags: [keyword1], [keyword2], [keyword3]*
```

---

## Título

O título é o maior fator de clique. Deve comunicar o benefício e incluir a keyword principal.

### Fórmulas que funcionam

| Fórmula | Exemplo |
|---------|---------|
| Como + resultado específico | "Como reduzir o tempo de onboarding em 50%" |
| Número + tema + benefício | "7 práticas de documentação que times de alto desempenho usam" |
| Guia completo de + tema | "Guia completo de documentação técnica para times de produto" |
| O que é + explicação direta | "O que é arquitetura de microsserviços e quando usar" |
| Por que + afirmação | "Por que documentação ruim é o maior risco técnico do seu time" |
| Comparativo | "Notion vs Confluence: qual usar para documentação técnica?" |

### Checklist de título

- [ ] Inclui a keyword principal?
- [ ] Comunica o benefício ou resultado para o leitor?
- [ ] Tem menos de 60 caracteres (para não cortar no Google)?
- [ ] Desperta curiosidade ou urgência?
- [ ] É específico (não genérico)?

---

## Introdução

Os primeiros 2 parágrafos decidem se o leitor continua ou sai.

### Estrutura recomendada

1. **Hook** — uma pergunta, dado surpreendente ou afirmação direta
2. **Agitação do problema** — por que isso importa para o leitor
3. **Promessa** — o que o artigo vai entregar

### Exemplo

```
Você já abriu uma base de código sem documentação e passou horas
tentando entender o que uma função faz? Provavelmente sim.

Documentação técnica desatualizada ou inexistente é responsável
por 23% do tempo perdido em times de engenharia, segundo pesquisa
da Stack Overflow (2024). É um custo invisível que se acumula.

Neste guia, você vai aprender como estruturar uma base de
documentação técnica que o time realmente mantém — com exemplos
práticos, templates prontos e um processo de atualização contínua.
```

---

## Conteúdo

### Comprimento ideal por tipo

| Tipo | Palavras | Objetivo |
|------|----------|----------|
| Quick guide | 500–800 | Resposta rápida para dúvida específica |
| Artigo padrão | 1.000–1.500 | Cobertura sólida de um tema |
| Artigo aprofundado | 1.500–2.500 | Autoridade e ranqueamento de termos competitivos |
| Guia definitivo | 2.500–5.000 | Dominar termos amplos, conteúdo referência |

### Boas práticas de escrita

- **Um parágrafo = uma ideia** — se o parágrafo está longo, quebre em dois
- **Frases curtas** — máximo 20 palavras para textos técnicos
- **Use exemplos concretos** para cada conceito abstrato apresentado
- **Dados e fontes** — sempre cite a origem de estatísticas
- **Código em blocos formatados** — nunca inline em parágrafo denso
- **Imagens com legenda** — toda imagem deve ter alt text e legenda descritiva

### Hierarquia de headers

```
# H1 — Título (apenas 1 por artigo)
## H2 — Seções principais (3 a 7 por artigo)
### H3 — Subseções (use com moderação)
#### H4 — Raramente necessário
```

---

## SEO Básico

### On-page

| Elemento | Recomendação |
|----------|--------------|
| **Keyword no título** | Obrigatório, preferencialmente no início |
| **Keyword no H1** | Igual ao título ou variação próxima |
| **Keyword nos H2s** | 1 a 2 ocorrências naturais |
| **Keyword no primeiro parágrafo** | Nas primeiras 100 palavras |
| **Meta description** | 150–160 caracteres, com keyword e benefício |
| **URL** | Curta, com keyword, sem stop words (`/documentacao-tecnica`) |
| **Alt text nas imagens** | Descritivo, com keyword quando relevante |
| **Links internos** | Mínimo 2 links para outros artigos relevantes |
| **Links externos** | 1 a 3 para fontes autoritativas |

### Intenção de busca

Antes de escrever, identifique a intenção:

- **Informacional** — "o que é X", "como funciona Y" → artigo explicativo
- **Navegacional** — buscas por marca → não é o foco de blog
- **Transacional** — "comprar X", "contratar Y" → landing page, não blog
- **Comparativo** — "X vs Y", "melhor X" → artigo comparativo

---

## Conclusão

A conclusão deve:

1. Resumir o insight central (não repetir tudo)
2. Reforçar o benefício para quem aplicou o conteúdo
3. Ter um CTA claro e único

### CTAs por objetivo

| Objetivo | CTA |
|----------|-----|
| Gerar leads | "Baixe o template completo" |
| Aumentar pageviews | "Leia também: [artigo relacionado]" |
| Construir comunidade | "O que você faria diferente? Deixe nos comentários" |
| Converter | "Teste gratuitamente por 14 dias" |
| Newsletter | "Receba novos artigos toda semana" |

---

## Revisão e Publicação

### Fluxo

```
Rascunho → Revisão de conteúdo → Revisão de SEO → Revisão de tom → Publicação
```

### Checklist final

**Conteúdo:**
- [ ] O artigo resolve o problema prometido no título?
- [ ] Há exemplos concretos para cada conceito?
- [ ] Dados e afirmações têm fonte?
- [ ] A conclusão tem CTA claro?

**SEO:**
- [ ] Keyword no título, H1, primeiro parágrafo e H2s?
- [ ] Meta description escrita?
- [ ] URL configurada (curta, com keyword)?
- [ ] Alt text em todas as imagens?
- [ ] Links internos adicionados?

**Formatação:**
- [ ] Headers em hierarquia correta?
- [ ] Parágrafos curtos com espaço entre eles?
- [ ] Código em blocos formatados?
- [ ] Revisado para ortografia e gramática?

**Distribuição:**
- [ ] Post de LinkedIn preparado para divulgação?
- [ ] Newsletter incluída no calendário?
- [ ] Tags e categoria corretas na plataforma?
