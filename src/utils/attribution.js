const STORAGE_KEY = 'attr_v1'
const CID_KEY = 'attr_cid_v1'
const TTL_MS = 90 * 24 * 60 * 60 * 1000

const CORE_KEYS = [
  'cmp_id',
  'cmp_name',
  'grp_id',
  'grp_name',
  'ad_id',
  'ad_name',
  'kw',
  'mt',
  'plc',
  'net',
  'dev',
  'geo',
  'tgt',
  'src_pl',
]

const CLICK_ID_KEYS = ['gclid', 'fbclid', 'ttclid']

const GOOGLE_RAW_KEYS = [
  'campaignid',
  'adgroupid',
  'creative',
  'keyword',
  'matchtype',
  'network',
  'device',
  'targetid',
  'loc_physical_ms',
  'placement',
]

const META_RAW_KEYS = ['adset_id', 'adset_name', 'campaign_id', 'campaign_name', 'site_source_name']

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id']

export const ATTR_KEYS = [
  ...UTM_KEYS,
  ...CORE_KEYS,
  ...CLICK_ID_KEYS,
  ...GOOGLE_RAW_KEYS,
  ...META_RAW_KEYS,
]

const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID()

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // приватний режим або переповнене сховище — працюємо без збереження
  }
}

export const getCid = () => {
  const stored = read(CID_KEY)

  if (stored?.value) return stored.value

  const value = uuid()
  write(CID_KEY, { value, ts: Date.now() })

  return value
}

const parseCurrentParams = () => {
  const search = new URLSearchParams(window.location.search)
  const result = {}

  ATTR_KEYS.forEach((key) => {
    const value = search.get(key)
    if (value && value.trim() !== '') result[key] = value.trim()
  })

  return result
}

export const captureAttribution = () => {
  getCid()

  const current = parseCurrentParams()

  if (Object.keys(current).length === 0) return

  const now = Date.now()
  const stored = read(STORAGE_KEY)
  const isExpired = stored?.ts && now - stored.ts > TTL_MS

  const payload = {
    first: isExpired || !stored?.first ? current : stored.first,
    last: current,
    ts: now,
  }

  write(STORAGE_KEY, payload)
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current))
}

export const getAttribution = () => {
  const stored = read(STORAGE_KEY)

  if (stored?.ts && Date.now() - stored.ts > TTL_MS) return {}

  return stored?.last || {}
}

const CBOX_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'cmp_id',
  'grp_id',
  'ad_id',
  'src_pl',
  'gclid',
  'fbclid',
  'ttclid',
  'client_id',
  'session_id',
  'session_number',
  'event_name',
  'event_id',
  'cid',
]

export const CBOX_FALLBACK_KEYS = ['cid', 'event_id', 'utm_source', 'utm_campaign']

export const buildBookingUrl = (baseUrl, extra = {}) => {
  const source = { ...getAttribution(), ...extra, cid: getCid() }
  const url = new URL(baseUrl, window.location.origin)

  CBOX_KEYS.forEach((key) => {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}
