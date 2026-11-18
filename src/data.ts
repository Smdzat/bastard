import einkaufSmall from './assets/einkauf-320.webp'
import einkauf from './assets/einkauf-720.webp'
import transportSmall from './assets/transport-320.webp'
import transport from './assets/transport-720.webp'
import haushaltSmall from './assets/haushalt-320.webp'
import haushalt from './assets/haushalt-720.webp'
import handwerkSmall from './assets/handwerk-320.webp'
import handwerk from './assets/handwerk-720.webp'
import expressSmall from './assets/erledo-x-320.webp'
import express from './assets/erledo-x-720.webp'
import sonstigesSmall from './assets/sonstiges-320.webp'
import sonstiges from './assets/sonstiges-720.webp'

export const links = {
  create: '/auftrag-erstellen',
  login: '/login',
  install: 'https://erledo.at/install',
  imprint: '/impressum',
  privacy: '/datenschutz',
  terms: '/nutzungsbedingungen',
  telegram: 'https://t.me/erledo',
  contact: 'mailto:erledo.app@gmail.com',
} as const

export interface Category {
  id: string
  title: string
  shortTitle: string
  description: string
  image: string
  thumbnail: string
  tone: string
  task: string
  location: string
  budget: number
  examples: string[]
}

export const categories: Category[] = [
  {
    id: 'einkauf', title: 'Einkauf & Besorgungen', shortTitle: 'Einkauf',
    description: 'Alles auf deiner Liste. Ohne deinen Umweg.',
    image: einkauf, thumbnail: einkaufSmall, tone: 'sage',
    task: 'Wocheneinkauf erledigen', location: 'Wien', budget: 25,
    examples: ['Wocheneinkauf erledigen', 'Pakete abholen', 'Besorgungen in der Stadt'],
  },
  {
    id: 'transport', title: 'Transport & Umzug', shortTitle: 'Transport',
    description: 'Von A nach B. Und ein Stück entspannter.',
    image: transport, thumbnail: transportSmall, tone: 'blue',
    task: 'Beim Umzug mit anpacken', location: 'Graz', budget: 60,
    examples: ['Möbel transportieren', 'Beim Umzug helfen', 'Lieferungen abholen', 'Entrümpelung unterstützen'],
  },
  {
    id: 'haushalt', title: 'Haushalt & Garten', shortTitle: 'Haushalt',
    description: 'Ein gutes Gefühl. Bis in die letzte Ecke.',
    image: haushalt, thumbnail: haushaltSmall, tone: 'sand',
    task: 'Die Wohnung frisch machen', location: 'Linz', budget: 40,
    examples: ['Wohnung reinigen', 'Im Garten helfen', 'Pflanzen im Urlaub versorgen'],
  },
  {
    id: 'handwerk', title: 'Montage & Handwerk', shortTitle: 'Handwerk',
    description: 'Für Projekte, die helfende Hände brauchen.',
    image: handwerk, thumbnail: handwerkSmall, tone: 'rose',
    task: 'Das neue Regal montieren', location: 'Salzburg', budget: 30,
    examples: ['Möbel aufbauen', 'Regale montieren', 'Kleine Reparaturen erledigen'],
  },
  {
    id: 'erledo-x', title: 'Erledigo X', shortTitle: 'Erledigo X',
    description: 'Wenn aus „irgendwann“ lieber „jetzt“ wird.',
    image: express, thumbnail: expressSmall, tone: 'lime',
    task: 'Eine dringende Besorgung', location: 'Innsbruck', budget: 20,
    examples: ['Dringende Besorgungen', 'Kurzfristig mit anpacken', 'Flexible Unterstützung finden'],
  },
  {
    id: 'sonstiges', title: 'Sonstiges', shortTitle: 'Sonstiges',
    description: 'Dein To-do passt in keine Schublade? Perfekt.',
    image: sonstiges, thumbnail: sonstigesSmall, tone: 'lavender',
    task: 'Beim Eventaufbau helfen', location: 'Klagenfurt', budget: 45,
    examples: ['Technik und Geräte einrichten', 'Beim Eventaufbau helfen', 'Begleitung im Alltag'],
  },
]

export const faqs = [
  { question: 'Was ist Erledigo?', answer: 'Ein lokaler Ort für alltägliche Aufgaben und die Menschen, die dabei helfen können. Du beschreibst dein Vorhaben, interessierte Helfer melden sich und ihr vereinbart die Details direkt.' },
  { question: 'Wo kann ich Erledigo nutzen?', answer: 'Der aktuelle Schwerpunkt liegt auf Wien. So bleiben die Wege kurz und du findest Unterstützung in deiner Nähe.' },
  { question: 'Was kostet mich die Vermittlung?', answer: 'Erledigo ist derzeit kostenlos. Für das Veröffentlichen eines Auftrags fällt keine Gebühr an; auch von der Vergütung der Helfer wird keine Plattformprovision abgezogen.' },
  { question: 'Wie erstelle ich einen Auftrag?', answer: 'Wähle eine Kategorie, beschreibe deine Aufgabe und ergänze Ort, Zeitpunkt und dein Budget. Prüfe deine Angaben und melde dich an, um den Auftrag zu veröffentlichen.' },
  { question: 'Welche Aufgaben kann ich einstellen?', answer: 'Zum Beispiel Einkäufe, Paketabholungen, Transporthilfe, Möbelaufbau oder Unterstützung im Haushalt. Die Aufgabe muss erlaubt und sicher sein. Tätigkeiten, für die eine besondere Befugnis nötig ist, gehören in entsprechend qualifizierte Hände.' },
  { question: 'Wer legt den Preis fest?', answer: 'Du gibst deinen Preiswunsch an und kannst ihn als verhandelbar markieren. Den endgültigen Betrag und die Bezahlung besprecht ihr direkt miteinander. Erledigo wickelt keine Zahlungen ab.' },
  { question: 'Brauche ich Telegram oder eine App?', answer: 'Die Website ist der zentrale Zugang für Konto und Aufträge. Telegram ergänzt Erledigo als Community- und Benachrichtigungskanal. Auch WhatsApp-Benachrichtigungen lassen sich optional nutzen.' },
  { question: 'Wie starte ich als Helfer?', answer: 'Entdecke die offenen Aufträge und melde dich auf Aufgaben, die zu deinem Können und deiner Zeit passen. Über die Erledigo-Community auf Telegram findest du ebenfalls den Einstieg.' },
  { question: 'Wie werden meine Daten behandelt?', answer: 'Die Datenschutzerklärung erläutert, welche Konto-, Auftrags- und technischen Daten verarbeitet werden und welche optionalen Benachrichtigungsdienste beteiligt sind. Teile persönliche Details wie eine genaue Adresse erst, wenn sie für die Absprache erforderlich sind.' },
  { question: 'Ist Erledigo selbst der Auftragnehmer?', answer: 'Nein. Erledigo vermittelt den Kontakt. Die Vereinbarung über eine Aufgabe entsteht zwischen Auftraggeber und Helfer. Ausführung, Vergütung und weitere Details regelt ihr miteinander.' },
]


