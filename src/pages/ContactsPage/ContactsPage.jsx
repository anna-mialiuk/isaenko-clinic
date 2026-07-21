import TopBar from '../../components/TopBar/TopBar'
import ScrollCTA from '../../components/ScrollCTA/ScrollCTA'

import DirectionHeader from '../../sections/DirectionHeader/DirectionHeader'
import ContactsSection from '../../sections/ContactsSection/ContactsSection'
import QuestionForm from '../../sections/QuestionForm/QuestionForm'
import AboutTeamPreview from '../../sections/AboutTeamPreview/AboutTeamPreview'
import FAQ from '../../sections/FAQ/FAQ'
import Footer from '../../sections/Footer/Footer'

import { contacts } from '../../data/contacts'
import { useLocale } from '../../hooks/useLocale'

import './ContactsPage.sass'

function ContactsPage({ variant = 'kharkiv' }) {
  const { pages } = useLocale()

  return (
    <div className="contacts-page">
      <TopBar />
      <DirectionHeader variant={variant} />
      <ScrollCTA />

      <main className="contacts-page__main">
        <div className="container contacts-page__container">
          <h1 className="contacts-page__title h1">{pages.contactsTitle}</h1>
        </div>

        {contacts.map((contact) => (
          <ContactsSection key={contact.id || contact.city} {...contact} />
        ))}
      </main>

      <div className="contacts-page__question-form">
        <QuestionForm />
      </div>

      <div className="contacts-page__team">
        <AboutTeamPreview />
      </div>

      <FAQ />

      <Footer variant={variant} />
    </div>
  )
}

export default ContactsPage
