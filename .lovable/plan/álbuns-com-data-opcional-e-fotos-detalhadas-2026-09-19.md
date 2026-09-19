# Álbuns com data opcional e fotos detalhadas

## Alterações
- Tornar a data do evento opcional nos álbuns comuns e históricos.
- Ao criar um álbum, abrir diretamente sua página de edição para adicionar fotos.
- Permitir informar e editar, em cada foto, uma legenda e uma data opcional.
- Exibir legenda e data abaixo de cada foto, quando preenchidas.
- Preservar autenticação, ordenação, exclusão e categorias atuais.

## Detalhes técnicos
- O banco passa a aceitar `events.event_date` vazio e adiciona `event_photos.photo_date` opcional.
- Os formulários e tipos tratarão datas ausentes sem gerar datas inválidas.
- A navegação após criação levará ao álbum com o editor aberto.

## Validação
- Conferir criação de álbum com e sem data.
- Conferir inclusão de fotos e salvamento de legenda/data.
- Validar visualização pública e compilação.
