import { useLocale } from '../../hooks/useLocale'

import './MultimodalWhy.sass'

function MultimodalWhy() {
  const { multimodal } = useLocale()

  return (
    <section className="multimodal-why">
      <div className="multimodal-why__container container">
        <h1 className="multimodal-why__title h1">{multimodal.whyTitle}</h1>

        <div className="multimodal-why__content">
          <p className="multimodal-why__lead p">{multimodal.lead}</p>

          <p className="multimodal-why__text p">{multimodal.text}</p>
        </div>
      </div>
    </section>
  )
}

export default MultimodalWhy
