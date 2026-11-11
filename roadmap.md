# Revisão da versão em inglês
# Recuperação de senha

- [x] Substituir recriação de conta por envio seguro do link de recuperação
- [x] Testar prevenção de envios repetidos e tratamento de falhas
- [x] Atualizar com segurança a senha de envio informada pelo responsável
- [ ] Confirmar entrega real — teste em 11/11/2026 às 20:50 UTC parou no limite temporário de envios; repetir após 21:37 UTC (18:37 na Bahia)

# Controle de acessos

# Acesso às pastas do LAIGA

- [x] Confirmar a divergência entre a autorização das pastas e do repositório
- [x] Usar a autorização do repositório sem encerrar a sessão do site
- [x] Validar regras e navegação das pastas com testes e respostas simuladas
- [ ] Verificar com conta real — Supabase externo não fornece sessão de teste

- [x] Criar lista administrativa de pessoas e permissões por área
- [x] Aplicar concessões e bloqueios no servidor e nas páginas
- [x] Proteger administração de acessos e impedir remoção da própria administração
- [x] Testar regras de autorização no banco e bloquear visitantes sem login
- [ ] Verificar concessão e leitura após login real — Supabase externo não fornece sessão de teste

# Velocidade do login

- [x] Antecipar o carregamento dos recursos do reCAPTCHA sem mudar a verificação
- [x] Remover a pausa artificial e o recarregamento no login principal
- [x] Verificar carregamento e bloqueio do formulário sem reCAPTCHA
- [ ] Medir login completo — bloqueado porque este Supabase externo não fornece sessão de teste

# Adaptação da página de atas

- [x] Ajustar grade, abas e rolagem para telas pequenas e grandes
- [x] Ajustar janelas de login, cadastro e edição sem cortes
- [x] Verificar página pública e login em seis tamanhos de tela
- [ ] Verificar cadastro e edição autenticados — bloqueado porque este Supabase externo não fornece sessão de teste

# E-mails de reservas de espaços

- [x] Impedir envios repetidos no auditório e na sala de reuniões
- [x] Proteger o envio contra solicitações duplicadas e testar


- [x] Mapear o sistema de idioma e todas as páginas acessíveis em inglês
- [x] Corrigir traduções incompletas, inconsistentes ou pouco naturais
- [x] Verificar a versão inglesa no navegador em telas desktop e móvel
- [x] Confirmar que a compilação permanece sem erros

# Álbuns de fotos

- [x] Permitir criar eventos e subálbuns sem data
- [x] Abrir o álbum recém-criado para inclusão imediata de fotos
- [x] Permitir legenda e data opcional em cada foto
- [x] Validar tipos, compilação e exibição pública no navegador
- [ ] Validar criação e edição autenticadas — bloqueado porque este Supabase externo não fornece sessão de teste
- [x] Permitir apagar álbuns e fotos com prazo de 10 segundos para desfazer
- [ ] Validar exclusão e desfazer autenticados — bloqueado porque este Supabase externo não fornece sessão de teste
