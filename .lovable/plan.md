# Onda 3 — Header, Footer e Home

Objetivo: corrigir responsividade dos 3 componentes globais que aparecem em todas as páginas, sem alterar identidade visual (cores, fontes, logos, gradiente roxo).

## Escopo

1. **`src/components/Header/Header.module.css`** (~775 `!important`)
   - Remover `!important` redundantes mantendo o desktop idêntico
   - Mobile (≤430px): garantir altura fluida, logos CPGG/UFBA não cortados, bandeiras + botão Adm visíveis sem overflow horizontal
   - Submenu mobile (360–430px): manter regra de single touch e fechamento ao trocar de menu (memórias existentes)
   - Substituir larguras fixas por `max-width` + `width: 100%`

2. **`src/components/Footer/Footer.module.css`**
   - Garantir visibilidade em todas as resoluções ≤390px (memória existente)
   - Stack vertical em mobile, sem overflow

3. **`src/pages/Home/Home.module.css`** + `components/Middle/middle.module.css` + `components/VideoSection/VideoSection.module.css`
   - Vídeo background com `object-fit: cover` em todas as resoluções
   - Texto central com `clamp()` para tipografia fluida
   - Botões com `min-height: 48px` e largura 100% em mobile

## Restrições (memórias do projeto)

- Cor primária `#592cbb` mantida
- Header: CPGG esquerda, UFBA direita, gradiente roxo
- Botão Adm roxo abaixo das bandeiras
- Footer obrigatoriamente visível em ≤390px
- Menus fecham ao trocar (não sobrepor)
- Submenus mobile (360–430px) abrem como página cheia
- Não reintroduzir LAGEP

## Abordagem técnica

- Mobile-first: regras base sem media query, depois `@media (min-width: 768px)`, `1024px`, `1280px`
- Eliminar `!important` desnecessários (manter só onde sobrescreve lib externa)
- Substituir `width: 1400px` → `width: 100%; max-width: 1400px`
- Substituir `padding-left: 200px` → `padding-inline: clamp(1rem, 5vw, 200px)`
- `100vh` → `100dvh` em alturas de hero (evita salto da barra de endereço mobile)
- Validar com browser tool em 320, 375, 390, 768, 1024, 1280, 1920px

## Arquivos a editar

- `src/components/Header/Header.module.css`
- `src/components/Footer/Footer.module.css`
- `src/pages/Home/Home.module.css`
- `src/pages/Home/components/Middle/middle.module.css`
- `src/pages/Home/components/VideoSection/VideoSection.module.css`

Sem alterações em TSX (apenas CSS). Sem novas libs. Sem mudanças de lógica.

## Validação

Capturas com browser tool em 320×568, 375×812, 390×844, 768×1024, 1280×720, 1920×1080 antes/depois para confirmar paridade visual no desktop e correção no mobile.

## Próximas ondas (após aprovação desta)

- Onda 4: galerias e listas (EventPhotos, HistoricalPhotos, News, Atas)
- Onda 5: 31 páginas de pesquisador (CSS compartilhado)
- Onda 6: áreas administrativas
- Onda 7: institucional restante
- Onda 8: validação final
