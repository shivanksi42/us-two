const BASE_URL = import.meta.env.API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'us-two-access-token'
// Cloudinary Free currently accepts images up to 10 MiB and videos up to 100 MiB.
// Leave a little room below the server limit for predictable uploads.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const IMAGE_COMPRESSION_TARGET_BYTES = Math.floor(9.5 * 1024 * 1024)
const MAX_VIDEO_BYTES = 100 * 1024 * 1024

async function request(path, options = {}, retried = false) {
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

  if (response.status === 401 && !retried && !path.startsWith('/api/auth/')) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      })
      const refreshed = await refreshResponse.json().catch(() => ({}))
      if (refreshResponse.ok && refreshed.access_token) {
        localStorage.setItem(TOKEN_KEY, refreshed.access_token)
        return request(path, options, true)
      }
    } catch { /* retain the original error response */ }
  }

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

  googleLogin: async credential => {
    const result = await request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
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
        hero_position_x: form.heroPositionX,
        hero_position_y: form.heroPositionY,
      }),
    }),

  updateMemory: (memoryId, form) =>
    request(`/api/memories/${memoryId}`, {
      method: 'PUT',
      body: JSON.stringify({ title: form.title, place: form.place, date_label: form.dates, date_start: form.startDate, date_end: form.endDate, color: form.color, cover: form.cover, hero_position_x: form.heroPositionX, hero_position_y: form.heroPositionY }),
    }),

  deleteMemory: memoryId => request(`/api/memories/${memoryId}`, { method: 'DELETE' }),

  createDay: (memoryId, day) =>
    request(`/api/memories/${memoryId}/days`, {
      method: 'POST',
      body: JSON.stringify({
        day_date: day.date,
        title: day.label,
      }),
    }),

  updateDay: (dayId, day) => request(`/api/days/${dayId}`, { method: 'PUT', body: JSON.stringify({ day_date: day.date, title: day.label }) }),
  deleteDay: dayId => request(`/api/days/${dayId}`, { method: 'DELETE' }),

  createEntry: (dayId, entry) =>
    request(`/api/days/${dayId}/entries`, {
      method: 'POST',
      body: JSON.stringify(
        entry.type === 'photo' || entry.type === 'video'
          ? {
              type: entry.type,
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

  updateEntry: (entryId, entry) =>
    request(`/api/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entry.type === 'photo' || entry.type === 'video'
        ? { type: entry.type, photo_url: entry.url, photo_public_id: entry.publicId, caption: entry.caption || '' }
        : { type: 'text', body: entry.text, color: entry.color }),
    }),
  deleteEntry: entryId => request(`/api/entries/${entryId}`, { method: 'DELETE' }),

  createEntriesBulk: (dayId, entries, insertAt) =>
    request(`/api/days/${dayId}/entries/bulk`, {
      method: 'POST',
      body: JSON.stringify({
        ...(Number.isInteger(insertAt) ? { insert_at: insertAt } : {}),
        entries: entries.map(entry =>
          entry.type === 'photo' || entry.type === 'video'
            ? {
                type: entry.type,
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

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Your browser could not compress this image. Please choose a smaller image.'))
    }, 'image/jpeg', quality)
  })
}

async function loadImageForCompression(file) {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()
    return image
  } catch {
    throw new Error(`Could not compress ${file.name}. Please choose an image smaller than 10 MB.`)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function compressImageIfNeeded(file) {
  if (file.size <= MAX_IMAGE_BYTES) return file
  if (file.type === 'image/gif') {
    throw new Error(`${file.name} is an animated GIF larger than 10 MB and cannot be compressed without losing its animation.`)
  }

  const image = await loadImageForCompression(file)
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
  let scale = Math.min(1, 3000 / longestSide)

  // Re-encode as JPEG and gradually reduce dimensions/quality until the upload
  // is safely below Cloudinary's Free-plan image limit.
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const quality = Math.max(0.58, 0.9 - attempt * 0.06)
    const blob = await canvasToBlob(canvas, quality)
    if (blob.size <= IMAGE_COMPRESSION_TARGET_BYTES) {
      const baseName = file.name.replace(/\.[^/.]+$/, '') || 'photo'
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
    }
    scale *= 0.78
  }
  throw new Error(`${file.name} could not be compressed below the 10 MB upload limit.`)
}

export async function uploadMultipleToCloudinary(files, onProgress) {
  if (!files || files.length === 0) return []

  // Fetch signature once for the entire batch to optimize performance
  const signature = await request('/api/uploads/signature')
  let completed = 0

  const uploadSingle = async file => {
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
    if (resourceType === 'video' && file.size > MAX_VIDEO_BYTES) {
      throw new Error(`${file.name} is larger than the 100 MB video upload limit.`)
    }
    const uploadFile = resourceType === 'image' ? await compressImageIfNeeded(file) : file
    const form = new FormData()
    form.append('file', uploadFile)
    form.append('api_key', signature.api_key)
    form.append('timestamp', String(signature.timestamp))
    form.append('folder', signature.folder)
    form.append('signature', signature.signature)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloud_name}/${resourceType}/upload`,
      { method: 'POST', body: form }
    )

    if (!response.ok) {
      const failure = await response.json().catch(() => ({}))
      const reason = failure.error?.message || `Cloudinary returned ${response.status}`
      // The media request bypasses our API, so report its rejection separately.
      // This keeps the useful Cloudinary reason visible in backend deployment logs.
      request('/api/uploads/failure', {
        method: 'POST',
        body: JSON.stringify({
          file_name: file.name || (resourceType === 'video' ? 'video' : 'photo'),
          resource_type: resourceType,
          status: response.status,
          reason,
        }),
      }).catch(() => {})
      throw new Error(`Failed to upload ${file.name || (resourceType === 'video' ? 'video' : 'photo')}: ${reason}`)
    }
    const data = await response.json()
    completed += 1
    if (onProgress) {
      onProgress(completed, files.length)
    }
    return { url: data.secure_url, publicId: data.public_id, resourceType }
  }

  // Upload in parallel
  return await Promise.all(files.map(uploadSingle))
}
