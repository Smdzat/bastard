import { useState } from 'react'
import { Icon } from './Icon'
import './faq.css'

const faqs = [
  { question: 'What is Naivano?', answer: 'Naivano is an IT service management platform that brings your help desk, device inventory and IT workflows into one dashboard.' },
  { question: 'What can I try in the demo?', answer: 'You can explore the overview, ticket queue, device inventory and knowledge base using fictional data.' },
  { question: 'Do I need an account to try the demo?', answer: 'The demo opens in your browser without requiring a Microsoft sign-in.' },
  { question: 'How are devices added to the inventory?', answer: 'The Naivano Endpoint Agent collects data from managed Windows devices. The dashboard shows their status, hardware and installed software.' },
  { question: 'How do teams sign in to Naivano?', answer: 'Naivano uses Microsoft Entra ID. Roles control what each person can see and edit.' },
  { question: 'What happens to changes I make in the demo?', answer: 'Demo actions affect only sample data in your browser. The demo has no connection to a production environment.' },
]

export function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const [showAll, setShowAll] = useState(false)
  const questions = showAll ? faqs : faqs.slice(0, 5)

  return <section id="faq" className="erledo-faq" aria-labelledby="faq-title" tabIndex={-1}>
    <div className="erledo-faq-inner">
      <div className="erledo-faq-intro">
        <h2 id="faq-title">Frequently asked<br />questions.</h2>
        <p>Learn how Naivano works and what you can try in the demo.</p>
        <a href="#dashboard">Explore the demo <Icon name="arrow" /></a>
      </div>
      <div className="erledo-faq-list">{questions.map((faq, index) => {
        const isOpen = openQuestion === index
        return <div className="erledo-faq-item" data-open={isOpen} key={faq.question}>
          <h3><button type="button" id={`faq-question-${index}`} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} onClick={() => setOpenQuestion(isOpen ? null : index)}><span>{faq.question}</span><span className="erledo-faq-symbol" aria-hidden="true" /></button></h3>
          <div className="erledo-faq-answer" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={!isOpen} inert={!isOpen}>
            <div><p>{faq.answer}</p></div>
          </div>
        </div>
      })}<button className="faq-show-all" type="button" aria-expanded={showAll} onClick={() => { setShowAll(value => !value); if (showAll && openQuestion !== null && openQuestion >= 5) setOpenQuestion(null) }}>{showAll ? 'Show fewer questions' : `See all ${faqs.length} questions`} <Icon name="arrow" /></button></div>
    </div>
  </section>
}
