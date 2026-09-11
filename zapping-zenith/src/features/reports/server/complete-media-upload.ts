import type { SupabaseClient } from '@supabase/supabase-js'
import { ALLOWED_MEDIA_TYPES } from '../../../contracts/reports'
import { getStorageBucket } from '../../../lib/supabase/privileged'
import { revisarImagen } from '../../evidencia/server/revisar-imagen'

const MAX_FILES = 5
const MAX_FILE_SIZE = 50 * 1024 * 1024

export class EvidenceRejectedError extends Error {}

interface StorageMetadata {
  size?: number | string
  mimetype?: string
  contentType?: string
}

interface StorageEntry {
  name: string
  metadata: StorageMetadata | null
}

function isStorageMetadata(value: unknown): value is StorageMetadata {
  return typeof value === 'object' && value !== null
}

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export async function completeMediaUpload(
  supabase: SupabaseClient,
  trackingCode: string,
  makeWebhookUrl: string,
): Promise<{ trackingCode: string; status: string; message: string }> {
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, tracking_code, current_status')
    .eq('tracking_code', trackingCode.trim().toUpperCase())
    .maybeSingle()

  if (reportError || !report) throw new Error('Denuncia no encontrada')

  const { data: expected, error: mediaError } = await supabase
    .from('report_media')
    .select('storage_path, media_type, size_bytes')
    .eq('report_id', report.id)

  if (mediaError || !expected) throw new Error('No se pudo validar la evidencia')
  if (expected.length > MAX_FILES) throw new Error('La denuncia excede el máximo de archivos')

  const prefix = `reports/${report.id}/`
  if (expected.some((item) => !item.storage_path.startsWith(prefix))) {
    throw new Error('Ruta de evidencia inválida')
  }

  const { data: uploaded, error: storageError } = await supabase.storage
    .from(getStorageBucket())
    .list(prefix.slice(0, -1), { limit: MAX_FILES })

  if (storageError || !uploaded) throw new Error('No se pudo consultar Storage')

  const entries = uploaded as StorageEntry[]
  if (entries.length !== expected.length) throw new Error('La cantidad de archivos no coincide')

  for (const item of expected) {
    const entry = entries.find((candidate) => `${prefix}${candidate.name}` === item.storage_path)
    if (!entry || !isStorageMetadata(entry.metadata)) throw new Error('Falta un archivo de evidencia')

    const size = Number(entry.metadata.size)
    const mediaType = entry.metadata.mimetype ?? entry.metadata.contentType
    if (!Number.isInteger(size) || size <= 0 || size > MAX_FILE_SIZE || size !== item.size_bytes) {
      throw new Error('El tamaño de una evidencia no coincide')
    }
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType as (typeof ALLOWED_MEDIA_TYPES)[number]) || mediaType !== item.media_type) {
      throw new Error('El tipo MIME de una evidencia no coincide')
    }
  }

  const imageItems = expected.filter((item) => item.media_type.startsWith('image/'))

  for (const item of imageItems) {
    const { data: file, error: downloadError } = await supabase.storage
      .from(getStorageBucket())
      .download(item.storage_path)

    if (downloadError || !file) throw new Error('No se pudo descargar la evidencia para revisión')

    const imageBase64 = await arrayBufferToBase64(await file.arrayBuffer())
    const { pass } = await revisarImagen(imageBase64, item.media_type, makeWebhookUrl)

    if (!pass) {
      await supabase.storage
        .from(getStorageBucket())
        .remove(expected.map((entry) => entry.storage_path))
      await supabase.from('report_media').delete().eq('report_id', report.id)
      await supabase.from('reports').delete().eq('id', report.id)
      throw new EvidenceRejectedError('La evidencia no pasó la revisión automática')
    }
  }

  return {
    trackingCode: report.tracking_code,
    status: report.current_status,
    message: 'Denuncia recibida correctamente',
  }
}
