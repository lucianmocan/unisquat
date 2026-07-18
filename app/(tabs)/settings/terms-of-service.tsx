import { LegalDocument } from '@/components/ui/legal-document';

const LAST_UPDATED = 'July 18, 2026';

const SECTIONS = [
  {
    heading: 'Acceptance of terms',
    body: 'By using UniSquat, you agree to these terms. If you do not agree, please do not use the app.',
  },
  {
    heading: 'About this app',
    body: "UniSquat is an independent, community-made app and is not affiliated with, endorsed by, or operated on behalf of Université de Strasbourg. It reads the university's publicly available room timetable feeds to show which rooms are likely free.",
  },
  {
    heading: 'Accuracy of information',
    body: "Room availability is only as accurate and up to date as the university's own published schedules. Rooms may be occupied for reasons that don't appear on the timetable (informal use, last-minute bookings, closures), and UniSquat cannot guarantee a room shown as free will actually be available. Always respect posted signage and anyone already using a room.",
  },
  {
    heading: 'Acceptable use',
    body: "Use UniSquat only for its intended purpose of finding study space. You agree not to abuse the app or the underlying university feeds it depends on — including but not limited to excessive automated requests, scraping, attempting to disrupt or overload the service, reverse-engineering the app to attack the university's systems, or any use that violates Université de Strasbourg's own policies. Abusive use puts the feed's continued availability for every other student at risk.",
  },
  {
    heading: 'No warranty',
    body: 'UniSquat is provided "as is," without warranty of any kind, express or implied, including but not limited to fitness for a particular purpose or uninterrupted availability.',
  },
  {
    heading: 'Limitation of liability',
    body: 'To the fullest extent permitted by law, the developer of UniSquat is not liable for any damages or inconvenience arising from your use of, or inability to use, the app, including reliance on inaccurate room availability information.',
  },
  {
    heading: 'Changes to these terms',
    body: 'These terms may be updated from time to time as the app evolves. Continued use of the app after a change means you accept the updated terms.',
  },
  {
    heading: 'Open source',
    body: "UniSquat's source code is public. Questions about these terms can be raised as an issue on the GitHub repository, reachable from the Settings screen.",
  },
];

export default function TermsOfServiceScreen() {
  return <LegalDocument lastUpdated={LAST_UPDATED} sections={SECTIONS} />;
}
