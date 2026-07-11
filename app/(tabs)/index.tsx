import { Redirect } from 'expo-router';

// The tabs group's root path ("/") has no matching screen since neither tab is named
// "index" — redirect it to the default tab so cold app launches don't hit "Unmatched Route".
export default function TabsIndexRedirect() {
  return <Redirect href="/study" />;
}
