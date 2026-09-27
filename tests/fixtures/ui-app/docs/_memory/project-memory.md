# Project Memory

<!-- Fixture: as duas primeiras entradas estão no formato legado e são deriváveis do código
     (deveriam ser cache). Existem para testar a verificação no ponto de uso e o [STALE]. -->

### [PATTERN] Mutations via Server Actions em actions.ts ao lado da página
scope: role:frontend · source: src/app/(private)/produtos/novo/actions.ts · confidence: high · status: active
created: 2026-09-01 · updated: 2026-09-01

### [FACT] Ícones do projeto vêm de lucide-react
scope: role:frontend · source: package.json · confidence: high · status: active
created: 2026-05-10 · updated: 2026-05-10

### [RULE] Textos de UI em pt-BR, capitalização de frase ("Novo produto", não "Novo Produto")
why: padronização pedida pelo time de conteúdo após revisão de UX em 2026-08
how: vale para rótulos, títulos e mensagens; nomes próprios e siglas mantêm a grafia original
scope: global · source: usuário · confidence: high · status: active
created: 2026-09-01 · updated: 2026-09-01
