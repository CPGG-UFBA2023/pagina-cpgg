# Exclusão com desfazer nos álbuns de fotos

## O que será alterado
- Na pasta geral de álbuns de eventos, manter a lixeira em cada álbum e exibir um botão **Desfazer** após a exclusão.
- Aplicar o mesmo comportamento aos subálbuns de **Fotos Históricas**.
- Dentro de cada álbum, permitir apagar o próprio álbum e retornar automaticamente à pasta de origem.
- Ao apagar uma foto dentro da edição do álbum, removê-la da tela e oferecer **Desfazer**.
- Preservar por alguns segundos os dados e os arquivos das fotos; somente concluir a exclusão quando o prazo de desfazer terminar.
- Confirmar antes de apagar um álbum inteiro e mostrar mensagens claras de sucesso ou erro.

## Detalhes técnicos
- Usar uma fila temporária de exclusão com prazo de 10 segundos, mantendo uma cópia do álbum ou foto para restauração imediata.
- Cancelar a exclusão pendente quando **Desfazer** for acionado; depois do prazo, apagar os registros e os arquivos correspondentes no armazenamento.
- Manter as mesmas permissões atuais: somente coordenação, TI e secretaria podem editar ou apagar.
- Validar a compilação e as páginas públicas; a ação autenticada será registrada como não verificada caso a sessão do Supabase externo continue indisponível.
