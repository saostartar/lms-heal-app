import CreateLessonClient from './create-lesson-client';

export default function CreateLessonPage({ params }) {
  // Kita tidak lagi mengambil data di server (karena server pakai token basi dari .env)
  // Kita serahkan tugas mengambil data ke Client Component (yang punya token segar di localStorage)
  return <CreateLessonClient params={params} />;
}