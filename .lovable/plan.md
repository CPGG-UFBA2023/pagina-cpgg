Criar um formulário de cadastro dedicado a técnicos de laboratório dentro da página "Criar Nova Conta" (`/sign`), separado do fluxo de pesquisadores.

## Requisitos
- Campos do formulário: **nome completo, email, telefone, senha e confirmação de senha** (mesmos campos dos professores).
- Seletor de **um único laboratório** (checkboxes onde apenas um pode ser marcado por vez), alimentado dinamicamente pela tabela `public.laboratories`.
- Dados do técnico armazenados em uma **tabela separada** (`public.technician_profiles`), não na tabela de pesquisadores.
- Técnicos **não precisam ser pré-cadastrados** pelo administrador: o cadastro cria o usuário e os perfis automaticamente.

## Etapas técnicas
1. **Banco de dados** — nova migration:
   - Criar `public.technician_profiles` (`id`, `user_id` FK, `laboratory_id` FK, `created_at`, `updated_at`).
   - Adicionar `GRANT`s e políticas RLS: usuário lê/insere/atualiza o próprio registro; admins (`coordenacao`/`ti`) gerenciam tudo.

2. **Edge function** — `register-technician`:
   - Recebe `user_id`, `full_name`, `email`, `phone`, `laboratory_id`.
   - Usa `service_role` para criar o `user_profiles` (necessário para login) e o `technician_profiles`, evitando duplicados com `ON CONFLICT`.

3. **Frontend** — `src/pages/Sign/index.tsx`:
   - Adicionar toggle/tabs **Pesquisador / Técnico de laboratório** no topo do formulário.
   - Buscar laboratórios do banco e renderizar caixas de seleção única.
   - No modo técnico:
     - pular a validação de nome pré-cadastrado;
     - exigir que um laboratório tenha sido selecionado;
     - incluir `is_technician: true` e `laboratory_id` nos metadados do `signUp`;
     - chamar a edge function `register-technician` após o cadastro bem-sucedido.
   - Manter fluxo de confirmação de email e mensagem de sucesso.

4. **Estilos** — `src/pages/Sign/sign.module.css`:
   - Ajustar layout do toggle e do grid de laboratórios para desktop e mobile, mantendo o tema roxo e a responsividade atual.

5. **Validação final** — build TypeScript e deploy da edge function.