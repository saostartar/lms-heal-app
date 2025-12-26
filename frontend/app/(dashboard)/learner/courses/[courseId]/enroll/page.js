import CourseEnrollClient from './enroll-client';

// Fungsi generateStaticParams tetap aman karena mengambil data public (/api/courses)
// yang biasanya tidak butuh token. Jika butuh token, hapus saja fungsi ini.
export async function generateStaticParams() {
  // Biarkan kosong atau implementasikan fetch public jika API Anda mengizinkan
  return []; 
}

export default function CourseEnrollPage({ params }) {
  // Langsung render Client Component tanpa fetch data di server
  // Biarkan Client Component yang mengambil data dengan token dari LocalStorage
  return (
    <CourseEnrollClient params={params} />
  );
}