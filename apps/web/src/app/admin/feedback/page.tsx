import { AdminFeedbackPanel } from '@/components/admin/admin-feedback-panel';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админка — отзывы',
  robots: { index: false, follow: false },
};

export default function AdminFeedbackPage() {
  return <AdminFeedbackPanel />;
}
