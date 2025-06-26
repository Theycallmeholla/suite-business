import { redirect } from 'next/navigation';

export default function ProfilePage() {
  // Redirect to the main settings page with profile tab
  redirect('/admin/settings');
}