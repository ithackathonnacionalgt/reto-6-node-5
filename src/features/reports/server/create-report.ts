import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ALLOWED_MEDIA_TYPES,
  type CreateReportInput,
  type CreateReportResponse,
  type MediaDescriptor,
} from '../../../contracts/reports'
import { getStorageBucket } from '../../../lib/supabase/privileged'

const MAX_FILES = 5
const MAX_FILE_SIZE = 50 * 1024 * 1024

const extensionByMediaType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}

function validateMedia(media: MediaDescriptor[]): void {
  if (media.length > MAX_FILES) throw new Error('Máximo de 5 archivos')

  for (const item of media) {
    if (!ALLOWED_MEDIA_TYPES.includes(item.mediaType as (typeof ALLOWED_MEDIA_TYPES)[number])) {
      throw new Error(`Tipo de archivo no permitido: ${item.mediaType}`)
    }
    if (!Number.isInteger(item.sizeBytes) || item.sizeBytes <= 0 || item.sizeBytes > MAX_FILE_SIZE) {
      throw new Error('Cada archivo debe pesar como máximo 50 MB')
    }
    if (!item.fileName.trim()) throw new Error('El nombre del archivo es requerido')
  }
}

export async function createReport(
  supabase: SupabaseClient,
  input: CreateReportInput,
): Promise<CreateReportResponse> {
  if (!input.categoryId || !input.description.trim() || input.description.trim().length < 20) {
    throw new Error('La categoría y una descripción de al menos 20 caracteres son requeridas')
  }
  if (!input.department.trim() || !input.municipality.trim() || !input.locationReference.trim()) {
    throw new Error('Departamento, municipio y referencia son requeridos')
  }
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new Error('Latitud inválida')
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new Error('Longitud inválida')
  }
  if (!input.isAnonymous && !input.reporterName?.trim()) {
    throw new Error('El nombre es requerido para una denuncia identificada')
  }
  if (input.reporterEmail && !/^\S+@\S+\.\S+$/.test(input.reporterEmail)) {
    throw new Error('El correo electrónico no es válido')
  }

  const media = input.media ?? []
  validateMedia(media)

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert({
      category_id: input.categoryId,
      description: input.description.trim(),
      department: input.department.trim(),
      municipality: input.municipality.trim(),
      location_reference: input.locationReference.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      reported_company: input.reportedCompany?.trim() || null,
      is_anonymous: input.isAnonymous,
      reporter_name: input.isAnonymous ? null : input.reporterName?.trim() || null,
      reporter_email: input.isAnonymous ? null : input.reporterEmail?.trim() || null,
    })
    .select('id, tracking_code, current_status')
    .single()

  if (reportError || !report) throw new Error(reportError?.message ?? 'No se pudo crear la denuncia')

  try {
    const mediaRows = media.map((item) => ({
      id: crypto.randomUUID(),
      report_id: report.id,
      storage_path: `reports/${report.id}/${crypto.randomUUID()}.${extensionByMediaType[item.mediaType]}`,
      media_type: item.mediaType,
      size_bytes: item.sizeBytes,
    }))

    if (mediaRows.length > 0) {
      const { error: mediaError } = await supabase.from('report_media').insert(mediaRows)
      if (mediaError) throw new Error(mediaError.message)
    }

    const uploads = []
    for (let index = 0; index < mediaRows.length; index += 1) {
      const row = mediaRows[index]
      const { data, error } = await supabase.storage
        .from(getStorageBucket())
        .createSignedUploadUrl(row.storage_path)

      if (error || !data?.signedUrl) throw new Error(error?.message ?? 'No se pudo preparar la carga')
      uploads.push({ index, mediaType: row.media_type, method: 'PUT' as const, signedUrl: data.signedUrl })
    }

    return {
      trackingCode: report.tracking_code,
      status: report.current_status,
      uploads,
      next: `/api/reports/${report.tracking_code}/media/complete`,
    }
  } catch (error) {
    await supabase.from('reports').delete().eq('id', report.id)
    throw error
  }
}
