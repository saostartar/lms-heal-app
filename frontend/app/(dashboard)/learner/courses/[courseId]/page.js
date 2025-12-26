import CourseDetailClient from './course-detail-client';

export default function CourseDetailPage({ params }) {
  // Kita serahkan semua urusan pengambilan data ke Client Component
  // agar bisa menggunakan token dari LocalStorage secara otomatis.
  return <CourseDetailClient params={params} />;
}