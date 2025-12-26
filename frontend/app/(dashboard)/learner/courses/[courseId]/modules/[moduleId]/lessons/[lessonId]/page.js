import LessonDetailClient from './lesson-detail-client';

// Ini adalah Server Component
export default function LessonDetailPage({ params }) {
  // Langsung render Client Component tanpa fetch data di server
  return <LessonDetailClient params={params} />;
}