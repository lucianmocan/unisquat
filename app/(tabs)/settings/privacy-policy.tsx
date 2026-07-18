import { LegalDocument } from '@/components/ui/legal-document';

const LAST_UPDATED = 'July 18, 2026';

const SECTIONS = [
  {
    heading: 'Overview',
    body: 'UniSquat is an independent, unofficial app that helps students at Université de Strasbourg find an empty room to study or work in. This policy explains what data the app handles and, just as importantly, what it does not.',
  },
  {
    heading: 'Data we collect',
    body: "UniSquat does not collect, store, or transmit any personal data. There are no user accounts, no sign-in, and nothing you enter in the app is sent to us or to any third party. We don't use analytics, advertising, or tracking SDKs of any kind.",
  },
  {
    heading: 'What stays on your device',
    body: 'Your favorite buildings and your personalization choices (language, accent color, filter behavior, haptics) are stored only in local storage on your device. They never leave your phone and we have no access to them.',
  },
  {
    heading: 'Room and schedule data',
    body: "Room availability is derived from Université de Strasbourg's public ADE timetable feeds, fetched directly by the app. This is the university's own scheduling data, not personal information, and UniSquat has no control over its accuracy.",
  },
  {
    heading: 'Third parties',
    body: 'Aside from the university feeds above, the app does not share data with any third party, because it does not collect any to begin with.',
  },
  {
    heading: 'Children',
    body: 'UniSquat is intended for use by university students and does not knowingly collect information from anyone, of any age, since it collects no personal information at all.',
  },
  {
    heading: 'Changes to this policy',
    body: 'If UniSquat ever adds a feature that changes what data it collects (for example, an optional account), this policy will be updated first, and any such feature will be clearly optional and explained before use.',
  },
  {
    heading: 'Contact',
    body: 'UniSquat is open source. Questions or concerns about privacy can be raised as an issue on the GitHub repository, reachable from the Settings screen.',
  },
];

export default function PrivacyPolicyScreen() {
  return <LegalDocument lastUpdated={LAST_UPDATED} sections={SECTIONS} />;
}
