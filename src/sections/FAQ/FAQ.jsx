import { useState } from 'react'
import FAQItem from '../../components/FAQItem/FAQItem'
import { useLocale } from '../../hooks/useLocale'
import './FAQ.sass'

function FAQ() {
  const [openId, setOpenId] = useState(null)
  const { faq } = useLocale()

  return (
    <section className="faq">
      <div className="faq__container container">
        <h2 className="faq__title h2">{faq.title}</h2>

        <div className="faq__grid">
          {faq.items.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
