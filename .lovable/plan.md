# Repositório do LAIGA

Novo espaço restrito para o coordenador Marcos Vasconcelos e o técnico Michel Nascimento registrarem, com fotos, os equipamentos emprestados do LAIGA e marcarem quando são devolvidos.

## 1. Botão "Repositório" na página do LAIGA

- Adicionar, logo abaixo do botão **Requerimento**, um segundo botão **Repositório** com o mesmo estilo (pílula roxa, seta animada) para manter consistência visual.
- Ao clicar, navega para `/labs/laiga/repositorio/login`.

## 2. Acesso restrito

- Acesso permitido apenas para dois usuários específicos:
  - **Marcos Vasconcelos** (coordenador do LAIGA) — já possui conta no CPGG.
  - **Michel Nascimento** (técnico) — precisará se cadastrar normalmente no site do CPGG; após o cadastro será autorizado no repositório.
- A autorização será feita por uma nova tabela `laiga_repository_access` que lista os `user_id` autorizados. Qualquer outro usuário logado que tente entrar verá "Acesso não autorizado".
- A tela de login reaproveita o fluxo de login existente do CPGG; após entrar, o sistema checa se o usuário está autorizado e só então libera a página do repositório.

## 3. Página do repositório

Layout limpo, dedicado, sem os elementos institucionais:

- Sem a "box" branca central usada nas páginas normais.
- Sem a animação da Terra (GlobalEarth escondido nesta rota).
- Sem o rodapé.
- Fundo da página mantido, com um cabeçalho simples "Repositório LAIGA" e botão de sair.

### Funcionalidades

- **Criar pasta**: cada pasta funciona como um álbum (ex.: "Empréstimo Prof. Fulano - abril/2026").
- **Ordenação das pastas**: alternar entre ordenar por **nome** ou por **data de criação**.
- **Abrir pasta**: dentro dela, é possível adicionar entradas de equipamento com:
  - Foto(s) do equipamento emprestado.
  - Nome do professor responsável.
  - Data de retirada.
  - Estado de devolução: enquanto não devolvido, aparece apenas a data de retirada; ao marcar como devolvido, aparece um **✓ verde** com a data da devolução.
- Editar/apagar pastas e itens (somente pelos usuários autorizados).

## 4. Detalhes técnicos

- **Banco de dados** (nova migração):
  - `laiga_repository_access(user_id, full_name, role)` — lista branca de acesso.
  - `laiga_repository_folders(id, name, created_by, created_at, updated_at)`.
  - `laiga_repository_items(id, folder_id, professor_name, checkout_date, returned_at, photo_urls[], created_by, created_at, updated_at)`.
  - RLS: `SELECT/INSERT/UPDATE/DELETE` apenas para `auth.uid()` presente em `laiga_repository_access` (função `is_laiga_repo_user()` security definer).
  - GRANTS para `authenticated` e `service_role`.
  - Seed inicial: inserir o `user_id` de Marcos Vasconcelos (buscado por e-mail atual do perfil). Michel será adicionado por Marcos, ou automaticamente na 1ª tentativa de login após o cadastro se preferirmos — proponho um botão simples "Autorizar novo usuário" dentro do repositório para Marcos gerenciar.

- **Storage**:
  - Novo bucket privado `laiga-repository` para as fotos, com políticas que só permitem leitura/escrita a quem está em `laiga_repository_access`.

- **Frontend**:
  - Rotas novas em `src/Router.tsx`:
    - `/labs/laiga/repositorio/login`
    - `/labs/laiga/repositorio`
    - `/labs/laiga/repositorio/pasta/:folderId`
  - Novos componentes em `src/pages/Labs/Laiga/Repositorio/` (Login, List, FolderView).
  - Ajustar `GlobalEarth` e `Footer` para se ocultarem quando a rota começar com `/labs/laiga/repositorio`.

## 5. O que preciso confirmar antes de codar

1. Confirma o e-mail do **Marcos Vasconcelos** que devo usar para localizar o `user_id` no seed (o cadastrado atualmente no site do CPGG)?
2. **Autorização do Michel**: prefere que (a) Marcos aprove manualmente pelo próprio repositório após Michel se cadastrar, ou (b) o sistema já autorize automaticamente qualquer conta cujo nome completo seja "Michel Nascimento"? Recomendo a opção (a), mais segura.
3. Cada item pode ter **várias fotos** ou apenas **uma**? Assumi várias — confirma?
