export const REPORT_STATUSES = [
  'RECEIVED',
  'UNDER_REVIEW',
  'CLASSIFIED',
  'INSPECTION_PENDING',
  'INSPECTION_COMPLETED',
  'REPORT_PENDING',
  'CLOSED',
] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
] as const

export type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number]

export interface MediaDescriptor {
  fileName: string
  mediaType: string
  sizeBytes: number
}

export interface CreateReportInput {
  categoryId: string
  description: string
  department: string
  municipality: string
  locationReference: string
  latitude: number
  longitude: number
  reportedCompany?: string | null
  isAnonymous: boolean
  reporterName?: string | null
  reporterEmail?: string | null
  media?: MediaDescriptor[]
}

export interface UploadInstruction {
  index: number
  mediaType: string
  method: 'PUT'
  signedUrl: string
}

export interface CreateReportResponse {
  trackingCode: string
  status: ReportStatus
  uploads: UploadInstruction[]
  next: string
}

export interface PublicReportResponse {
  trackingCode: string
  category: { name: string; icon: string | null }
  department: string
  municipality: string
  currentStatus: ReportStatus
  createdAt: string
  updatedAt: string
  history: Array<{
    status: ReportStatus
    message: string | null
    createdAt: string
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseCreateReportInput(value: unknown): CreateReportInput {
  if (!isRecord(value)) throw new Error('El cuerpo de la solicitud no es válido')

  const requiredStrings = ['categoryId', 'description', 'department', 'municipality', 'locationReference']
  for (const key of requiredStrings) {
    if (typeof value[key] !== 'string') throw new Error(`Campo requerido: ${key}`)
  }
  if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
    throw new Error('Las coordenadas son requeridas')
  }
  if (typeof value.isAnonymous !== 'boolean') throw new Error('isAnonymous debe ser booleano')

  let media: MediaDescriptor[] = []
  if (value.media !== undefined) {
    if (!Array.isArray(value.media)) throw new Error('media debe ser una lista')
    media = value.media.map((item) => {
      if (!isRecord(item) || typeof item.fileName !== 'string' || typeof item.mediaType !== 'string' || typeof item.sizeBytes !== 'number') {
        throw new Error('Descriptor de evidencia inválido')
      }
      return { fileName: item.fileName, mediaType: item.mediaType, sizeBytes: item.sizeBytes }
    })
  }

  const optionalString = (key: string): string | null => {
    const item = value[key]
    return item === undefined || item === null ? null : typeof item === 'string' ? item : (() => { throw new Error(`Campo inválido: ${key}`) })()
  }

  return {
    categoryId: value.categoryId as string,
    description: value.description as string,
    department: value.department as string,
    municipality: value.municipality as string,
    locationReference: value.locationReference as string,
    latitude: value.latitude,
    longitude: value.longitude,
    reportedCompany: optionalString('reportedCompany'),
    isAnonymous: value.isAnonymous,
    reporterName: optionalString('reporterName'),
    reporterEmail: optionalString('reporterEmail'),
    media,
  }
}
