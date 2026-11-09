type PermissionCheck = () => PromiseLike<{ data: unknown; error: unknown }>

// Membership is checked by the server, not by reading the protected access list.
export async function hasLaigaRepositoryAccess(checkPermission: PermissionCheck): Promise<boolean> {
  const { data, error } = await checkPermission()
  return !error && data === true
}