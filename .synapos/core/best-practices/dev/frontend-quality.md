---
id: frontend-quality
version: 1.0.0
description: SEO, acessibilidade, performance e integridade visual — qualidade obrigatória para toda mudança de frontend
---

# Qualidade de Frontend — SEO · Acessibilidade · Performance · Integridade visual

> **Obrigatória** para qualquer agente que altere frontend (UI, páginas, componentes, estilos, metadados), em qualquer track e squad. Não é opcional nem "se sobrar tempo".
> Fonte única: os steps e a `compliance-protocol` apontam para cá — não copie estas regras para agents.

## 0. Aplicação

- **Proporcional ao escopo, nunca omitida.** Mudança grande → auditoria completa da página. Mudança pontual (quick/bug) → todos os eixos nos elementos tocados e nos que eles afetam.
- **Página não indexável** (autenticada, painel interno): declare `noindex` e marque SEO/keywords/schema/social como `n/a (privada)`. **Acessibilidade e performance valem sempre.**
- **Medir, não estimar.** Número sem medição é inventado. Sem ferramenta disponível → `não medido` + como medir. Nunca preencha LCP/INP/CLS/score de memória.
- **Sem promessa de ranking nem de viralidade.** O Google não publica o algoritmo; aqui se cumpre o que ele documenta (Core Web Vitals, experiência da página, conteúdo útil, dados estruturados). Viralidade não é garantível: implementa-se o que **permite** compartilhar bem.

## 1. Performance — Core Web Vitals (métrica de ranking do Google)

Metas "boas" no **percentil 75** de usuários reais (campo: CrUX/PageSpeed Insights; laboratório: Lighthouse):

| Métrica | Bom | Atenção a |
|---|---|---|
| LCP (maior elemento visível) | ≤ 2,5 s | imagem/título principal: `fetchpriority="high"`/preload, sem lazy-load nele, servidor e CSS bloqueante |
| INP (responsividade; substituiu o FID em 2024) | ≤ 200 ms | tarefas longas (> 50 ms), hidratação pesada, handlers síncronos, JS de terceiros |
| CLS (estabilidade visual) | ≤ 0,1 | `width`/`height` ou `aspect-ratio` em mídia, reservar espaço de embeds/anúncios, fontes sem salto |

Aplicar sempre: imagens modernas (AVIF/WebP) com `srcset`/`sizes` e lazy-load abaixo da dobra; fontes com `font-display: swap`, subset e preload da crítica; code splitting por rota, remover JS/CSS morto, `defer`/`async` em terceiros; renderizar no servidor/estático o que é conteúdo; cache e compressão; sem layout thrashing. Registre o que o orçamento do projeto define (tamanho de bundle) — se não define, não invente um.

## 2. Acessibilidade — WCAG 2.2 nível AA

- **Semântica:** landmarks (`header/nav/main/footer`), um `h1`, hierarquia de títulos sem pular nível, `button` para ação e `a` para navegação, listas/tabelas reais. `lang` no `<html>`.
- **Nome acessível** em todo controle: `label` associado, `alt` descritivo (decorativa: `alt=""`), `aria-label` só quando não há texto. ARIA só quando o HTML nativo não resolve.
- **Teclado:** tudo alcançável e operável, ordem lógica, foco **visível**, sem armadilha, `skip link`, foco gerenciado em modal/rota.
- **Contraste:** texto 4.5:1 (grande 3:1), componentes e foco 3:1. Cor nunca é a única pista.
- **Alvos de toque** ≥ 24×24 px CSS (WCAG 2.2 AA); `prefers-reduced-motion` respeitado; zoom/reflow sem perda a 400%.
- **Formulários:** erro associado ao campo (`aria-describedby`), instrução antes do erro, `autocomplete` correto.
- **Verificar:** axe/Lighthouse (automático **não cobre tudo**) + navegação só por teclado + leitor de tela nos fluxos críticos. Declare o que foi testado.

## 3. SEO técnico

- **Rastreável e indexável:** conteúdo importante no HTML inicial (SSR/SSG/ISR — não depender só de renderização no cliente), links reais `<a href>`, `robots`/`meta robots` corretos, `sitemap.xml`, `canonical` por página, `hreflang` se houver i18n, status HTTP corretos (404/301), HTTPS, mobile-first.
- **`<title>` único** por página (~60 caracteres, termo principal no início) e **`meta description`** (~150–160, escrita para o clique; o Google pode reescrevê-la e ela não é fator direto de ranking).
- **Um `h1`** coerente com o title; subtítulos refletem as perguntas do usuário. URLs curtas, legíveis, estáveis.
- **Links internos** com texto âncora descritivo; breadcrumbs; imagens com `alt` e nome de arquivo significativos.
- **Conteúdo útil e original** (E-E-A-T): responde à intenção, tem autoria/fonte onde cabe, sem texto gerado só para ranquear.

## 4. Palavras-chave

1. **Intenção primeiro** (informacional, transacional, navegacional, comparação) e só então o termo.
2. Por página: **1 termo principal** + secundárias/entidades relacionadas, em linguagem natural do público.
3. Posições naturais: `title`, `h1`, primeiro parágrafo, subtítulos, `alt`, URL, âncoras. **Sem keyword stuffing.**
4. **Dados reais:** volume, dificuldade e consultas vêm de **Search Console / Keyword Planner / ferramenta equivalente**. Sem acesso → liste os termos como **hipótese** com a pergunta que validaria. Nunca invente volume ou posição.

## 5. Dados estruturados (schema.org, JSON-LD)

- Escolha o **tipo que a página realmente é**: `Organization`/`WebSite` (home), `Article`/`BlogPosting`, `Product`+`Offer`, `BreadcrumbList`, `LocalBusiness`, `SoftwareApplication`, `Event`, `VideoObject`, `FAQPage`/`HowTo` só se houver o conteúdo visível.
- **Marque apenas o que está visível na página**; preencha as propriedades obrigatórias e recomendadas do Google para o tipo; `@id` e `url` consistentes entre tipos.
- **Valide** no Rich Results Test e no Schema Markup Validator; erro = corrigir antes de entregar. Elegibilidade a rich result **não é garantida** (e alguns tipos, como FAQ, são restritos pelo Google).
- JSON-LD no `<head>` ou `<body>` (preferido ao microdata). Gere no servidor, a partir dos mesmos dados da página.

## 6. Conteúdo compartilhável ("viral")

Pré-requisitos que o frontend controla:
- **Open Graph** completo por página: `og:title`, `og:description`, `og:url` (canônica), `og:type`, `og:image` (**1200×630**, texto legível, peso baixo, `og:image:alt`), `og:locale`, `og:site_name`.
- **Twitter/X:** `twitter:card=summary_large_image` + título, descrição, imagem.
- **Título e descrição para clique:** benefício claro e específico, sem clickbait que quebre a promessa da página (quebra confiança e engajamento).
- **Compartilhar sem fricção:** Web Share API em mobile com fallback copiar-link, URL estável/canônica, página rápida em 4G (o compartilhamento é majoritariamente mobile).
- **Gancho de conteúdo** (dado original, resultado concreto, utilidade imediata) é **hipótese a testar**, não resultado: registre como `(hipótese)` e como medir (compartilhamentos, CTR no Search Console).
- Validar previews: Facebook Sharing Debugger, LinkedIn Post Inspector, validador de card do X.

## 7. Integridade visual — verificar sempre, antes de entregar

Todo agente de frontend **assume que o layout quebra até provar o contrário**. Verifique com a UI rodando (não só lendo o código):

| Defeito | Como provocar | Defesa usual |
|---|---|---|
| Texto quebrando o layout / escapando do container ou do botão | nome/título muito longo, palavra sem espaço (e-mail, URL, `Pneumonoultra…`), texto traduzido (+30–40%), número enorme, zoom 200%, fonte maior do SO | `min-width: 0` em filhos de flex/grid, `overflow-wrap: anywhere`, `text-overflow: ellipsis`/`line-clamp` (com texto completo acessível), botão com `padding` + quebra de linha definida, **sem altura fixa** em contêiner de texto |
| Scroll desnecessário (horizontal ou vertical) | cada viewport: 320, 390, 768, 1280, 1920 px; teclado virtual aberto; paisagem | sem larguras fixas > viewport, `max-width: 100%` em mídia, `100dvh` (não `100vh`), `overflow: auto` só onde é intencional |
| Container quebrado (estoura, colapsa, sobrepõe, corta sombra/foco) | conteúdo vazio, 1 item, 100 itens, estado loading/erro, imagem faltando | `gap` em vez de margens soltas, `aspect-ratio`, `overflow: clip` consciente, `z-index` com escala do projeto |
| Texto desalinhado (baseline, ícone × texto, colunas, centro óptico) | compare lado a lado com a referência; grid de 4/8 px do projeto | `align-items`, `line-height` do token, mesma escala de spacing/tipografia |

Verificação mínima, **em cada viewport acima**:
1. **Scroll horizontal:** `document.documentElement.scrollWidth > document.documentElement.clientWidth` deve ser `false` (a menos que seja intencional e declarado).
2. **Escape de texto:** nenhum elemento com `scrollWidth > clientWidth` fora de áreas de scroll declaradas (`[...document.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible')`).
3. **Dados de pior caso** nos componentes tocados: vazio, 1, muitos, nome gigante, palavra sem espaço, texto longo traduzido, caracteres não latinos/emoji.
4. **Estados:** loading, erro, vazio, hover/focus/disabled dos botões com o rótulo mais longo possível.

**Use as skills disponíveis** (relevante + disponível = obrigatória, `skills-engine` §3). Registre `Skills: {id} — usada | indisponível`:
- `playwright-browser` (ou browser nativo): rodar a UI, screenshots por viewport, executar os testes 1 e 2.
- `break-ui`: força dados de pior caso e relata o que quebrou, com a correção.
- `impeccable` (`critique`/`audit`/`impeccable detect`): hierarquia, alinhamento, espaçamento, detecta anti-padrões.
- `design-taste-frontend`, `emil-design-eng`, `ui-ux-pro-max`: acabamento, composição e microinterações, quando a tarefa é de interface/identidade.
Sem browser nem skill: revisão estrutural explícita (CSS que causa cada risco) e `não verificado em browser` no relatório — nunca "ok" presumido.

## 8. Entrega obrigatória — Relatório de Qualidade Frontend

Todo output de step que altera frontend inclui o bloco abaixo (quick/bug: uma linha por eixo, só com o que a mudança tocou). Cada linha: `✅ ok` · `🔧 corrigido` · `⚠️ pendente — {motivo}` · `n/a — {motivo}` · `não medido — {como medir}`.

```
QUALIDADE FRONTEND — {página/componente}
Performance : LCP {valor|não medido} · INP {valor|não medido} · CLS {valor|não medido} — fonte: {Lighthouse|PSI|CrUX|—}
Acessibilidade: axe {N violações|não medido} · teclado {ok|falhas} · leitor de tela {testado|não testado} · contraste {ok|falhas}
SEO         : title {ok} · description {ok} · h1 {ok} · canonical {ok} · robots/sitemap {ok|n/a} · renderização {SSR|SSG|CSR}
Keywords    : principal "{…}" · secundárias {…} · intenção {…} · dado: {Search Console|ferramenta|hipótese}
Schema      : {tipos} — validador: {passou|erros|não validado}
Social/viral: OG {ok} · Twitter card {ok} · imagem 1200×630 {ok} · preview validado {sim|não}
Layout      : viewports {320/390/768/1280/1920|quais} · scroll horizontal {não|onde} · texto escapando {não|onde} · pior caso {testado|não} · verificado em {browser|revisão estrutural}
Pendências  : {lista com motivo e dono}
```

Linha ausente = step reprovado. "Não medido" é aceito; número sem medição não.
