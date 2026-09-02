import { formatDate } from './formatDate'

const sourceLabel = (lead) => {
  if (lead.utm_source) return lead.utm_source
  if (lead.gclid) return 'google ads'
  if (lead.fbclid) return 'meta ads'
  return 'прямий'
}

function LeadCard({ lead, onOpen }) {
  return (
    <article
      className="card"
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', String(lead.id))}
      onClick={onOpen}
    >
      <div className="card__top">
        <span className="card__name">{lead.name || 'Без імені'}</span>
        <span className="card__date">{formatDate(lead.created_at)}</span>
      </div>

      <a className="card__phone" href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}>
        {lead.phone}
      </a>

      {lead.message && <p className="card__message">{lead.message}</p>}

      <div className="card__bottom">
        <span className="card__source">{sourceLabel(lead)}</span>
        {lead.cmp_id && <span className="card__campaign">#{lead.cmp_id}</span>}
        {!lead.sent_to_telegram && <span className="card__warn">не в TG</span>}
      </div>
    </article>
  )
}

export default LeadCard
