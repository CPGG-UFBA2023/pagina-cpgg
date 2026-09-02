# Corrigir acesso administrativo da Secretaria

## Objetivo
Permitir que a secretária autenticada edite os nomes dos pesquisadores e gerencie as atas nas mesmas áreas já destinadas à Secretaria, sem ampliar o acesso a funções exclusivas da Coordenação.

## Alterações
- Atualizar o login da página de Atas para aceitar os papéis `secretaria` e `coordenacao`.
- Ajustar as regras de acesso da tabela `atas` e dos arquivos PDF para permitir inclusão, edição e exclusão pela Secretaria e Coordenação.
- Simplificar o login da página de Pesquisadores para reutilizar a sessão já validada, removendo a segunda tentativa de login.
- Manter a validação no servidor da função de pesquisadores para ambos os papéis.

## Validação
- Confirmar que a conta `secretaria.cpgg.ufba@gmail.com` continua vinculada ao papel `secretaria`.
- Verificar build, regras finais do banco e fluxos públicos sem sessão.
- Como o Supabase é externo, o teste autenticado completo será validado pelo código, banco e logs disponíveis; não serão solicitadas credenciais.
