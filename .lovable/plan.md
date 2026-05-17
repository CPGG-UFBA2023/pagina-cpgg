# Auditoria de responsividade — plano de correção em ondas

## Diagnóstico (problemas encontrados)

Varri todos os CSS Modules, `*-no-scroll.css`, componentes e páginas. Os problemas seguem 8 padrões recorrentes:

### 1. Travas globais de scroll que brigam entre si
9 arquivos `*-no-scroll.css` aplicam `position: fixed; overflow: hidden; height: 100vh` no `body`, `html` e `#root` via `:has()`:
`adm-no-scroll.css`, `sign-no-scroll.css`, `contact-no-scroll.css`, `reservations-no-scroll.css`, `spaces-no-scroll.css`, `repairs-no-scroll.css`, `repairs-page-no-scroll.css`, `calendars-no-scroll.css`, mais regras espalhadas em `researchers-scroll-fix.css`.
Cada um trava `body` de um jeito diferente → ao navegar, sobra estado da página anterior, conteúdo some, footer desaparece, formulários ficam inacessíveis em telas <700px de altura.

### 2. `!important` em cascata (1.700+ ocorrências)
Top ofensores: `Header.module.css` (775), `laiga.module.css` (186), `index.css` (137), `lemar.module.css` (112), `CPGG.module.css` (101), `global.css` (95), `reservations-no-scroll.css` (90). Cada ajuste novo precisa de mais `!important` para vencer o anterior. Resultado: nada é previsível.

### 3. Largura/altura fixa em pixels (desktop-first)
Mais de 30 arquivos com `width: 950px`, `width: 1400px`, `width: 800px`, `height: 500px`, etc. Exemplos críticos:
- 30+ páginas de pesquisador (`Alanna`, `Arthur`, `Camila`, ...) com o **mesmo** `box1 { position: absolute; width: 950px; height: 500px }` quebrado em mobile.
- `EventPhotos.module.css`: `.box { width: 1400px; left: 50%; transform: translateX(-50%) }` → overflow horizontal em qualquer tela <1400px.
- 3 formulários de reserva de lab (`LaigaReservation`, `LamodReservation`, `LemarReservation`) com `transform: translateX(-250px)` desktop e workarounds em mobile.

### 4. Breakpoints inconsistentes (12 valores diferentes)
Convivem `320`, `360`, `375`, `390`, `400`, `430`, `500`, `768`, `800`, `820`, `834`, `1000`, `1024`, `1200`, `1400px`. Nenhuma fonte única de verdade. Tablet (768–1024) é tratado de forma diferente em cada página.

### 5. `position: absolute` em layout principal
Páginas de pesquisador, `HistoricalPhotos/*`, `Spaces`, `MeetingRoom`, `Auditory` usam `position: absolute; top: 20%; left: 2%` para posicionar caixas principais. Em telas pequenas, sobrepõem texto, header e footer.

### 6. Overflow horizontal
Causado por: larguras fixas (item 3), `padding-left: 200px`/`700px` em containers (`Years`, `Professor`), `margin-left: -850px` em listas, `column-count: 5` em flex sem fallback.

### 7. Inputs e botões fora dos padrões mobile
- Inputs com `font-size: 14px` → iOS dá zoom automático ao focar.
- Botões com altura <44px em várias áreas admin.
- `equipmentList { max-height: 300px }` em formulário de reserva quebra em tela 568px de altura.

### 8. Footer escondido em mobile
Já é regra do projeto que o footer fique visível em ≤390px, mas as travas `position: fixed` do item 1 derrubam isso em várias páginas (Spaces, Adm, Sign, Contact).

---

## Estratégia (mobile-first, identidade visual intacta)

Sem novo design system, sem novas libs, sem reescrever componentes. Só CSS e, no máximo, swap de classe no JSX.

### Princípio geral
- **Mobile-first**: reescrever `.module.css` problemáticos com `@media (min-width: ...)` em vez de `(max-width: ...)`.
- **Desktop preservado**: tudo que está bom em ≥1024px continua igual; mexo só em mobile/tablet e em larguras fixas que causam overflow.
- **Breakpoints únicos** (sem renomear classes — só padronizar uso): `480px`, `768px`, `1024px`, `1280px`, `1536px`. As `@media` antigas com 360/375/390/430 viram exceções pontuais documentadas no comentário.
- **Eliminar `*-no-scroll.css`**: substituir por uma classe `.page-no-scroll` única em `index.css`, aplicada só na raiz do componente que realmente precisa (Home com vídeo). As outras páginas passam a usar scroll natural.
- **Caps de largura**: trocar `width: 950px` por `width: 100%; max-width: 950px`. Trocar `padding-left: 200px` por `padding-inline: clamp(1rem, 5vw, 200px)`.
- **Posicionamento**: trocar `position: absolute` de layout principal por flex/grid normal nas faixas mobile/tablet, mantendo absolute só em ≥1024px onde já funciona.

### Compatibilidade alvo
320, 375, 414, 430, 768, 834, 1024, 1280, 1536, 1920+.

---

## Ondas de execução

Cada onda é uma mensagem separada para você revisar antes da próxima. Nada é entregue tudo de uma vez para evitar regressão em massa.

### Onda 1 — Fundação (sem mudança visual)
- `tailwind.config.ts`: confirmar/ajustar breakpoints padrão (sm/md/lg/xl/2xl) e expor token `xs: 480px`.
- `src/index.css`: adicionar utilitários `.page-shell`, `.page-scroll`, `.page-fixed`, `.no-horizontal-overflow` (apenas classes, não muda visual de nada que já existe).
- Adicionar `overflow-x: hidden` no `html, body` global como rede de segurança contra overflow horizontal residual.
- Remover ou neutralizar `*-no-scroll.css` órfãos (que travam globalmente sem necessidade): `adm-no-scroll.css`, `sign-no-scroll.css`, `contact-no-scroll.css`, `spaces-no-scroll.css`, `reservations-no-scroll.css`, `calendars-no-scroll.css`, `repairs-no-scroll.css`, `repairs-page-no-scroll.css`. Cada um substituído por scroll natural + footer no fluxo.

### Onda 2 — Páginas críticas de reserva e formulários
Você marcou como prioridade: sala de reuniões, auditório, equipamentos.
- `src/pages/Reservations/ReservationMeetingRoom/ReservationMeetingRoom.module.css`
- `src/pages/Reservations/ReservationAuditory/ReservationAuditory.module.css`
- `src/pages/AnalysisAndEquipmentRequests/request.module.css`
- `src/pages/Labs/Laiga/ReservationForm/LaigaReservation.module.css`
- `src/pages/Labs/Lamod/ReservationForm/LamodReservation.module.css`
- `src/pages/Labs/Lemar/ReservationForm/LemarReservation.module.css`
- `src/pages/Labs/LtmRx/ltmrx-form.module.css`

Correções por arquivo: remover `position: fixed` no container, remover `transform: translateX(-250px)`, `formContainer { width: 100%; max-width: 800px; margin-inline: auto }`, inputs `font-size: 16px`, `equipmentList { max-height: clamp(200px, 40dvh, 300px) }`, grid de data colapsa em 1 coluna abaixo de 480px, botão de envio `min-height: 48px`.

### Onda 3 — Chrome do site (Header, Footer, Home)
- `Header.module.css`: simplificar `!important`, garantir menu mobile sem overflow e sem sobreposição.
- `Footer.module.css`: validar visibilidade em 320–390px (memória do projeto).
- `Home.module.css`, `VideoSection`, `Middle`: garantir que o vídeo não corte conteúdo seguinte em telas baixas, manter scroll suave.

### Onda 4 — Listas e galerias com largura fixa
- `Photos/Event/EventPhotos.module.css` (`.box width: 1400px`)
- `HistoricalPhotos/*` (Yeda, LatinAmerican, ICG, BlockE)
- `Photos/FirstMeeting`, `Photos/Years`
- `Atas/Atas.module.css`, `News/News.module.css`, `News/Archive.module.css`
- `Coordination/Coordination.module.css`, `Production/Production.module.css`, `ResearchProjects/ResearchProjects.module.css`

Padrão: `width: 100%; max-width: <valor antigo>; margin-inline: auto`. Grids `1200px` viram `repeat(auto-fit, minmax(280px, 1fr))` abaixo de 1024px.

### Onda 5 — Páginas de pesquisador (31 arquivos quase idênticos)
30+ `Personal_pages/*.module.css` compartilham o mesmo CSS quebrado. Em vez de editar 30 arquivos manualmente, eu:
1. Crio um `Personal_pages/researcher-shared.module.css` mobile-first com o layout padrão.
2. Cada `<Nome>.module.css` passa a importar/estender só a foto (background-image única) e remove o resto.
3. Não muda JSX, não muda identidade visual em desktop.

### Onda 6 — Áreas administrativas
`Adm/*`, `Adm/Coordenacao/*`, `Adm/Secretaria`, `Adm/TI`, `Adm/RepairStats`. Tabelas viram scroll horizontal interno (`overflow-x: auto`) em vez de quebrar layout. Filtros empilham em mobile.

### Onda 7 — Páginas institucionais restantes
`CPGG`, `CPGG2`, `Institution`, `SobreNos`, `History`, `Map`, `Contact`, `Recipes`, `Repairs`, `Spaces`, `Technicians`, `SeniorResearchers`, `TCCGeofisica`, `Regulations`, `Login`, `Sign`, `Register`, `EmailConfirmed`, `ResetPassword`, `Solicitacoes`, `Upload`.

### Onda 8 — Validação final
Capturas com browser tool em 320, 375, 414, 768, 1024, 1440, 1920 de cada rota. Checklist: zero scroll horizontal, footer visível em mobile, todos botões ≥44px, sem zoom de input no iOS, formulários submetíveis.

---

## O que NÃO vai mudar
- Cores, fontes, logos, gradientes, ícones, copy.
- Lógica de negócio (Supabase, edge functions, autenticação).
- Componentes shadcn/ui.
- Estrutura de rotas.
- Dependências do `package.json`.

## Entregáveis ao fim de cada onda
- Lista de arquivos modificados.
- Lista de arquivos que ainda precisam de revisão manual sua (ex: páginas que dependem de uma decisão de UX que não posso tomar sozinho).
- Screenshots de antes/depois nos breakpoints alvo (a partir da onda 2).

## Componentes que provavelmente vão precisar de revisão manual sua
- `Header` mobile: hoje tem menus com lógica de toque única + páginas-submenu em 360–430px. Posso garantir que não quebre, mas se quiser mudar a UX do menu, é decisão sua.
- Páginas de pesquisador: quero unificar 30 arquivos num shared CSS. Se você usa algum como "exceção autoral", me avise antes.
- `HistoricalPhotos/*`: galerias muito específicas — vou preservar visual desktop e só consertar mobile.

---

## Sugestão de início
Começo pela **Onda 1 + Onda 2** na próxima mensagem (fundação + páginas de reserva que você marcou como críticas). Se ficar bom, sigo para a Onda 3.