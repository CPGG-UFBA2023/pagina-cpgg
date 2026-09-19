import { useSyncExternalStore } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type PendingPhotoDeletion = {
  kind: 'photo'
  id: string
  name: string
  photoUrl: string
}

export type PendingAlbumDeletion = {
  kind: 'album'
  id: string
  name: string
  photoUrls: string[]
}

export type PendingPhotoLibraryDeletion = PendingPhotoDeletion | PendingAlbumDeletion

type QueueEntry = PendingPhotoLibraryDeletion & {
  committing: boolean
  onError?: () => void
}

const listeners = new Set<() => void>()
let pending: QueueEntry | null = null
let deletionTimer: ReturnType<typeof setTimeout> | null = null

const emit = () => listeners.forEach((listener) => listener())

const storagePathFromUrl = (url: string) => {
  const marker = '/event-photos/'
  if (!url.includes(marker)) return null
  return decodeURIComponent(url.split(marker)[1])
}

const removeStoredPhotos = async (urls: string[]) => {
  const paths = urls.map(storagePathFromUrl).filter((path): path is string => Boolean(path))
  if (paths.length > 0) await supabase.storage.from('event-photos').remove(paths)
}

const commitPendingDeletion = async () => {
  const entry = pending
  if (!entry) return

  pending = { ...entry, committing: true }
  emit()

  try {
    if (entry.kind === 'album') {
      const { error } = await supabase.from('events').delete().eq('id', entry.id)
      if (error) throw error
      await removeStoredPhotos(entry.photoUrls)
    } else {
      const { error } = await supabase.from('event_photos').delete().eq('id', entry.id)
      if (error) throw error
      await removeStoredPhotos([entry.photoUrl])
    }
  } catch (error) {
    console.error('Erro ao concluir exclusão:', error)
    entry.onError?.()
  } finally {
    if (pending?.id === entry.id && pending.kind === entry.kind) {
      pending = null
      emit()
    }
  }
}

export const schedulePhotoLibraryDeletion = (
  item: PendingPhotoLibraryDeletion,
  onError?: () => void,
) => {
  if (deletionTimer) clearTimeout(deletionTimer)
  if (pending) void commitPendingDeletion()

  pending = { ...item, committing: false, onError }
  emit()
  deletionTimer = setTimeout(() => {
    deletionTimer = null
    void commitPendingDeletion()
  }, 10_000)
}

export const undoPhotoLibraryDeletion = () => {
  if (!pending || pending.committing) return false
  if (deletionTimer) clearTimeout(deletionTimer)
  deletionTimer = null
  pending = null
  emit()
  return true
}

export const usePendingPhotoLibraryDeletion = () => useSyncExternalStore(
  (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  () => pending,
)