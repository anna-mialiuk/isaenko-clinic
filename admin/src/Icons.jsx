/**
 * Іконки навігації й дашборду. Контурні, 1.6px, 20×20 — одна вага
 * на всю панель, щоб ряд у сайдбарі читався як єдина система.
 */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconUsers = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 13.8c1.6.8 2.5 2.4 2.5 4.2" />
  </svg>
)

export const IconSliders = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
)

export const IconBell = (props) => (
  <svg {...base} {...props}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)

export const IconChart = (props) => (
  <svg {...base} {...props}>
    <path d="M4 20h16" />
    <path d="M7 16v-5M12 16V6M17 16v-8" />
  </svg>
)

export const IconPulse = (props) => (
  <svg {...base} {...props}>
    <path d="M3 12h4l3-7 4 14 3-7h4" />
  </svg>
)

export const IconPlug = (props) => (
  <svg {...base} {...props}>
    <path d="M9 3v5M15 3v5" />
    <path d="M6 8h12v3a6 6 0 0 1-12 0V8Z" />
    <path d="M12 17v4" />
  </svg>
)

export const IconTeam = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="7" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
)

export const IconServer = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="4" width="16" height="6" rx="1.5" />
    <rect x="4" y="14" width="16" height="6" rx="1.5" />
    <path d="M8 7h.01M8 17h.01" />
  </svg>
)

export const IconPen = (props) => (
  <svg {...base} {...props}>
    <path d="M4 20l4-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
    <path d="M13.5 7.5l3 3" />
  </svg>
)

export const IconSun = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const IconMoon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)

export const IconLogout = (props) => (
  <svg {...base} {...props}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </svg>
)

export const IconInbox = (props) => (
  <svg {...base} {...props}>
    <path d="M4 13l2.5-8h11L20 13v6H4v-6Z" />
    <path d="M4 13h5l1 2h4l1-2h5" />
  </svg>
)

export const IconEye = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 12S6 5.5 12 5.5s9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconCursor = (props) => (
  <svg {...base} {...props}>
    <path d="M5 4l14 6.5-6 2-2 6L5 4Z" />
  </svg>
)

export const IconTarget = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
)
