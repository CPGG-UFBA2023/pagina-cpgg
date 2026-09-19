# Álbuns de fotos editáveis

## O que será alterado
- Mover 50 px para baixo o conteúdo das páginas de álbuns de eventos e dos quatro álbuns históricos atuais.
- Reduzir a janela de criação/edição para aproximadamente metade da altura atual, deslocá-la 50 px para baixo e manter rolagem interna.
- Transformar “Fotos Históricas” em uma lista administrável na própria página, com botão para criar novos subálbuns.
- Permitir editar nome, data, fotos, ordem e legendas dos subálbuns históricos usando o mesmo editor dos eventos.
- Preservar e cadastrar no banco as fotos dos álbuns históricos atuais, sem remover seus endereços antigos.

## Funcionamento
- Visitantes continuam vendo os álbuns e fotos normalmente.
- Ao clicar em adicionar ou editar, o administrador faz login e abre a janela compacta.
- Novos subálbuns históricos recebem página própria e aparecem automaticamente em “Fotos Históricas”.

## Detalhes técnicos
- Reutilizar as tabelas e o armazenamento já usados por álbuns de eventos, acrescentando uma classificação para separar eventos comuns de históricos.
- Popular os registros históricos existentes por migração idempotente e ligar seus cartões às páginas editáveis.
- Manter a autenticação administrativa e as permissões atuais.
- Validar compilação e telas de computador e celular.
