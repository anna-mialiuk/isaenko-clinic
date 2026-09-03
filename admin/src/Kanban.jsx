import { useCallback, useEffect, useMemo, useState } from 'react'

import { api } from './api'
import LeadCard from './LeadCard'
import LeadModal from './LeadModal'

import './Kanban.sass'

// Скільки карток показувати в колонці одразу. Решта — за кнопкою:
// при десятках заявок сторінка інакше стає нескінченно довгою.
const VISIBLE_LIMIT = 5

const STATUS_LABELS = {
  new: 'Нові',
  in_progress: 'В роботі',
  booked: 'Записані',
  done: 'Прийшли',
  rejected: 'Відмова',
}

function Kanban() {
  const [leads, setLeads] = useState([])
  const [statuses, setStatuses] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await api.leads({ search, limit: 500 })
      setLeads(data.items)
      setStatuses(data.statuses)
      setError('')
    } catch {
      setError('Не вдалося завантажити заявки')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    // Пошук не смикає сервер на кожну літеру.
    const timer = setTimeout(load, search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [load, search])

  const grouped = useMemo(() => {
    const map = Object.fromEntries(statuses.map((status) => [status, []]))

    leads.forEach((lead) => {
      if (map[lead.status]) map[lead.status].push(lead)
    })

    return map
  }, [leads, statuses])

  const moveLead = async (lead, status) => {
    if (lead.status === status) return

    // Оптимістично: картка переїжджає одразу, не чекаючи сервер.
    const previous = lead.status
    setLeads((items) => items.map((item) => (item.id === lead.id ? { ...item, status } : item)))

    try {
      await api.updateLead(lead.id, { status })
    } catch {
      setLeads((items) =>
        items.map((item) => (item.id === lead.id ? { ...item, status: previous } : item)),
      )
      setError('Не вдалося змінити статус')
    }
  }

  const handleDrop = (event, status) => {
    event.preventDefault()
    setDragOver(null)

    const id = Number(event.dataTransfer.getData('text/plain'))
    const lead = leads.find((item) => item.id === id)

    if (lead) moveLead(lead, status)
  }

  return (
    <div className="crm">
      <header className="crm__header">
        <h1 className="page__title">Заявки</h1>

        <input
          className="crm__search"
          placeholder="Пошук за іменем або телефоном"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span className="crm__count">{leads.length}</span>
      </header>

      {error && <p className="page__error">{error}</p>}

      {loading ? (
        <p className="page__empty">Завантаження…</p>
      ) : (
        <div className="board">
          {statuses.map((status) => (
            <section
              key={status}
              className={`column ${dragOver === status ? 'is-over' : ''}`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOver(status)
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(event) => handleDrop(event, status)}
            >
              <header className="column__header">
                <span>{STATUS_LABELS[status] || status}</span>
                <span className="column__count">{grouped[status]?.length || 0}</span>
              </header>

              <div className="column__body">
                {(expanded[status]
                  ? grouped[status]
                  : grouped[status]?.slice(0, VISIBLE_LIMIT)
                )?.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={() => setSelected(lead)} />
                ))}

                {grouped[status]?.length > VISIBLE_LIMIT && (
                  <button
                    type="button"
                    className="column__more"
                    onClick={() => setExpanded((state) => ({ ...state, [status]: !state[status] }))}
                  >
                    {expanded[status]
                      ? 'Згорнути'
                      : `Показати ще ${grouped[status].length - VISIBLE_LIMIT}`}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <LeadModal
          lead={selected}
          statuses={statuses}
          statusLabels={STATUS_LABELS}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setLeads((items) => items.map((item) => (item.id === updated.id ? updated : item)))
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}

export default Kanban
