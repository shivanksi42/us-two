const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'us-two-access-token'

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data.error?.message ||
      (typeof data.detail === 'string' ? data.detail : null) ||
      (Array.isArray(data.error?.details) ? data.error.details[0]?.message : null) ||
      (Array.isArray(data.detail) ? data.detail[0]?.msg : null) ||
      'Something went wrong. Please try again.'
    const err = new Error(message)
    err.status = response.status
    err.code = data.error?.code
    throw err
  }

  return data
}

export const api = {
  login: async (email, password) => {
    const result = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(TOKEN_KEY, result.access_token)
    return result.user
  },

  register: async (email, password) => {
    const result = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(TOKEN_KEY, result.access_token)
    return result.user
  },

  me: async () => {
    try {
      return await request('/api/auth/me')
    } catch (err) {
      if (err.status === 401) {
        // Attempt silent token refresh via HTTP-only cookie
        try {
          const refreshed = await request('/api/auth/refresh', { method: 'POST' })
          if (refreshed.access_token) {
            localStorage.setItem(TOKEN_KEY, refreshed.access_token)
            return await request('/api/auth/me')
          }
        } catch {
          localStorage.removeItem(TOKEN_KEY)
        }
      }
      throw err
    }
  },

  refresh: async () => {
    const result = await request('/api/auth/refresh', { method: 'POST' })
    if (result.access_token) {
      localStorage.setItem(TOKEN_KEY, result.access_token)
    }
    return result
  },

  signOut: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  memories: () => request('/api/memories'),

  createMemory: form =>
    request('/api/memories', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title,
        place: form.place,
        date_label: form.dates,
        date_start: form.startDate,
        date_end: form.endDate,
        color: form.color,
        cover: form.cover,
      }),
    }),

  createDay: (memoryId, day) =>
    request(`/api/memories/${memoryId}/days`, {
      method: 'POST',
      body: JSON.stringify({
        day_date: day.date,
        title: day.label,
      }),
    }),

  createEntry: (dayId, entry) =>
    request(`/api/days/${dayId}/entries`, {
      method: 'POST',
      body: JSON.stringify(
        entry.type === 'photo'
          ? {
              type: 'photo',
              photo_url: entry.url,
              photo_public_id: entry.publicId,
              caption: entry.caption,
            }
          : {
              type: 'text',
              body: entry.text,
              color: entry.color,
            }
      ),
    }),

  createEntriesBulk: (dayId, entries) =>
    request(`/api/days/${dayId}/entries/bulk`, {
      method: 'POST',
      body: JSON.stringify({
        entries: entries.map(entry =>
          entry.type === 'photo'
            ? {
                type: 'photo',
                photo_url: entry.url,
                photo_public_id: entry.publicId,
                caption: entry.caption || '',
              }
            : {
                type: 'text',
                body: entry.text,
                color: entry.color,
              }
        ),
      }),
    }),

  // ── Partner Connection ──
  connectionStatus: () => request('/api/connect/status'),

  sendInvite: (partnerEmail) =>
    request('/api/connect/invite', {
      method: 'POST',
      body: JSON.stringify({ partner_email: partnerEmail }),
    }),

  respondInvite: (connectionId, accept) =>
    request('/api/connect/respond', {
      method: 'POST',
      body: JSON.stringify({ connection_id: connectionId, accept }),
    }),

  disconnect: () => request('/api/connect', { method: 'DELETE' }),

  cancelInvite: () => request('/api/connect/cancel', { method: 'DELETE' }),
}

export async function uploadToCloudinary(file) {
  const signature = await request('/api/uploads/signature')
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', signature.api_key)
  form.append('timestamp', String(signature.timestamp))
  form.append('folder', signature.folder)
  form.append('signature', signature.signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    { method: 'POST', body: form }
  )

  if (!response.ok) throw new Error('Photo upload failed. Please try again.')
  const data = await response.json()
  return { url: data.secure_url, publicId: data.public_id }
}

export async function uploadMultipleToCloudinary(files, onProgress) {
  if (!files || files.length === 0) return []

  // Fetch signature once for the entire batch to optimize performance
  const signature = await request('/api/uploads/signature')
  let completed = 0

  const uploadSingle = async file => {
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', signature.api_key)
    form.append('timestamp', String(signature.timestamp))
    form.append('folder', signature.folder)
    form.append('signature', signature.signature)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
      { method: 'POST', body: form }
    )

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name || 'photo'}. Please try again.`)
    }
    const data = await response.json()
    completed += 1
    if (onProgress) {
      onProgress(completed, files.length)
    }
    return { url: data.secure_url, publicId: data.public_id }
  }

  // Upload in parallel
  return await Promise.all(files.map(uploadSingle))
}
