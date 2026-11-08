export const permissionGroups = [
  { label: 'Conteúdo do site', items: [
    ['atas', 'Atas', '/atas'], ['news', 'Notícias', '/adm/coordenacao/dashboard'],
    ['photos', 'Fotos e álbuns', '/Photos'], ['calendars', 'Calendários', '/recipes/calendars'],
    ['publications', 'Publicações', '/production'], ['projects', 'Projetos', '/research-projects'],
    ['regulations', 'Normas', '/Regulations'], ['history', 'História', '/history'], ['tcc', 'TCCs', '/tcc-geofisica'],
  ] },
  { label: 'Laboratórios', items: [
    ['laboratories', 'Dados dos laboratórios', '/adm/coordenacao/laboratorios'],
    ['equipment', 'Equipamentos', '/adm/coordenacao/equipamentos-labs'],
    ['repository', 'Repositório LAIGA', '/labs/laiga/repositorio'],
  ] },
  { label: 'Administração', items: [
    ['reservations', 'Reservas e solicitações', '/adm/coordenacao/reservas'],
    ['people', 'Pesquisadores e usuários', '/adm/coordenacao/usuarios'],
    ['access', 'Administrar acessos', '/adm/acessos'],
  ] },
] as const

export type PermissionKey = typeof permissionGroups[number]['items'][number][0]
export type Permissions = Partial<Record<PermissionKey, boolean>>
export function hasAnyPermission(permissions: Permissions) {
  return Object.values(permissions).some(value => value === true)
}
export function mayChangePermission(caller: Permissions, callerId: string, targetId: string | null, key: PermissionKey, allowed: boolean) {
  return caller.access === true && targetId !== null && !(key === 'access' && targetId === callerId && !allowed)
}