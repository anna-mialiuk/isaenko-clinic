import { offerAgreementUrl } from '../../data/legal'
import { useLocale } from '../../hooks/useLocale'

function AgreementCheckbox({ block, isChecked, onToggle }) {
  const { common } = useLocale()
  const content = common.agreement

  return (
    <div className={`${block}__checkbox`}>
      <button
        type="button"
        className={`${block}__checkbox-circle ${
          isChecked ? `${block}__checkbox-circle--active` : ''
        }`}
        onClick={onToggle}
        aria-label={content.aria}
      >
        {isChecked && (
          <img src="/images/icons/check.svg" alt="" className={`${block}__checkbox-icon`} />
        )}
      </button>

      <div className={`${block}__checkbox-text`}>
        <span>{content.text}</span>

        <a href={offerAgreementUrl} target="_blank" rel="noopener noreferrer">
          {content.link}
        </a>
      </div>
    </div>
  )
}

export default AgreementCheckbox
