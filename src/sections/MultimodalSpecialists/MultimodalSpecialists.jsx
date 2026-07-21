import MultimodalCard from '../../components/MultimodalCard/MultimodalCard'
import { multimodalSpecialists } from '../../data/multimodalSpecialists'
import { useLocale } from '../../hooks/useLocale'
import './MultimodalSpecialists.sass'

function MultimodalSpecialists() {
  const { multimodal } = useLocale()

  return (
    <section className="multimodal-specialists">
      <div className="container multimodal-specialists__container">
        <div className="multimodal-specialists__grid">
          {multimodalSpecialists.map((item, index) => (
            <MultimodalCard
              key={item.id}
              icon={item.icon}
              title={multimodal.specialists[index] || item.title}
              className={index === 0 ? 'multimodal-card--main' : ''}
            />
          ))}
        </div>
        <p className="multimodal-specialists__p p">{multimodal.specialistsText}</p>
      </div>
    </section>
  )
}

export default MultimodalSpecialists
