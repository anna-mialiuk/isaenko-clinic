import { useState } from 'react'

/**
 * Кнопка копіювання з підтвердженням.
 * navigator.clipboard доступний лише на https і localhost, тому
 * є запасний шлях через приховане поле — інакше на http нічого не працює.
 */
function CopyButton({ value, title }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const field = document.createElement('textarea')
        field.value = value
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.appendChild(field)
        field.select()
        document.execCommand('copy')
        document.body.removeChild(field)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className={`contact__icon ${copied ? 'is-copied' : ''}`}
      title={title}
      onClick={copy}
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}

export default CopyButton
