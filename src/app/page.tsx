import { redirect } from 'next/navigation';

export default function RootPage() {
  // To re-enable the landing page, you can restore the original content of this file.
  // For now, we redirect to the dashboard to allow development without working auth.
  redirect('/dashboard');
}
