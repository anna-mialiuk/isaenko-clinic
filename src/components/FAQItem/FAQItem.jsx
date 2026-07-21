import './FAQItem.sass'

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button className="faq-item__button" type="button" onClick={onClick}>
        <span>{item.question}</span>

        <div className="faq-item__icon-wrapper">
          <div className="faq-item__icon faq-item__icon_horisontal"></div>
          <div className="faq-item__icon faq-item__icon_vertical"></div>
        </div>
      </button>

      <div className="faq-item__answer-wrapper">
        <div className="faq-item__answer">{item.answer}</div>
      </div>
    </div>
  )
}

export default FAQItem
