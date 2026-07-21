import { aboutCenter } from './aboutCenter'
import { aboutHero, doctorsSection, faq, founder, hospital, methodology } from './sections'
import { aboutPrinciples, hospitalConditions, trustBlock } from './trustBlock'
import { common } from './common'
import { contactLabels } from './contacts'
import { footer } from './footer'
import { hero } from './hero'
import { hospitalIntro } from './hospitalIntro'
import { multimodal } from './multimodal'
import { directionSpecialists } from './directionSpecialists'
import { aboutTeamPreview, hospitalDoctors } from './moreSections'
import { pages } from './pages'
import { questionForm } from './forms'
import { schedule } from './schedule'
import { seo } from './seo'
import { teamDoctors } from './team'
import { topBar } from './topBar'
import hospitalServices from './hospitalServices'
import directionTreatments from './directionTreatments'
import directionDoctors from './directionDoctors'
import directionsContent from './directionsContent'
import doctorsTranslations from './doctors'
import stats from './stats'

const languages = ['uk', 'ru', 'en']

export const locales = Object.fromEntries(
  languages.map((language) => [
    language,
    {
      aboutCenter: aboutCenter[language],
      aboutTeamPreview: aboutTeamPreview[language],
      aboutHero: aboutHero[language],
      aboutPrinciples: aboutPrinciples[language],
      common: common[language],
      contacts: contactLabels[language],
      directionDoctors: directionDoctors[language],
      doctorsTranslations: doctorsTranslations[language],
      directionSpecialists: directionSpecialists[language],
      doctors: doctorsSection[language],
      faq: faq[language],
      footer: {
        kharkiv: footer.kharkiv[language],
        kyiv: footer.kyiv[language],
      },
      founder: founder[language],
      hero: hero[language],
      hospital: hospital[language],
      hospitalDoctors: hospitalDoctors[language],
      hospitalIntro: hospitalIntro[language],
      hospitalServices: hospitalServices[language],
      hospitalConditions: hospitalConditions[language],
      methodology: methodology[language],
      multimodal: multimodal[language],
      directionsContent: directionsContent[language],
      pages: pages[language],
      directionTreatments: directionTreatments[language],
      stats: stats[language],
      questionForm: questionForm[language],
      schedule: schedule[language],
      seo: seo[language],
      teamDoctors: teamDoctors[language],
      topBar: topBar[language],
      trustBlock: trustBlock[language],
    },
  ]),
)
