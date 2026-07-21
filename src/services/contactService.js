const CONTACT_API_URL = import.meta.env.VITE_API_URL || '/api/contact.php'

export async function sendContactRequest(payload) {
  const response = await fetch(CONTACT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Contact form request failed')
  }

  return data
}
