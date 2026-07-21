import { memo } from 'react'

import './Toast.sass'

function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <p className="toast__message">{message}</p>

      {onClose && (
        <button
          type="button"
          className="toast__close"
          onClick={onClose}
          aria-label="Закрити повідомлення"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default memo(Toast)
