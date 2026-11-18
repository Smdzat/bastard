export interface SessionUser { username?: string; email?: string }
export interface ApiResponse { ok?: boolean; error?: string; loggedIn?: boolean; user?: SessionUser; taskNumber?: string | number }

const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function api(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  let response: Response
  try {
    response = await fetch(`${base}/api${path}`, { ...options, credentials: 'include', signal: AbortSignal.timeout(20000) })
  } catch {
    throw new Error('Die Verbindung zu Erledigo ist gerade nicht erreichbar. Bitte versuche es noch einmal.')
  }
  const type = response.headers.get('content-type') || ''
  if (!type.includes('application/json')) throw new Error('Der Erledigo-Dienst ist gerade nicht verfügbar. Bitte versuche es später erneut.')
  const data: ApiResponse = await response.json()
  if (!response.ok || data.ok === false || data.error) throw new Error(data.error || 'Das hat leider nicht geklappt. Bitte prüfe deine Angaben.')
  return data
}

export function postJson(path: string, body: Record<string, unknown>) {
  return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

export function safeNextPath() {
  const next = new URLSearchParams(window.location.search).get('next')
  return next && ['/auftrag-erstellen', '/auftrag/neu'].includes(next) ? next : '/auftrag-erstellen'
}
