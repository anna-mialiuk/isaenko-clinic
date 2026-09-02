function Placeholder({ title, note }) {
  return (
    <div className="placeholder">
      <h1 className="placeholder__title">{title}</h1>
      <p className="placeholder__note">{note}</p>
    </div>
  )
}

export default Placeholder
