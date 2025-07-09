import axios from '@/lib/axios';
import EditQuestionClient from './edit-question-client';

// Fungsi ini memberitahu Next.js semua kombinasi path yang ada
export async function generateStaticParams() {
  try {
    // Panggil endpoint baru yang efisien untuk mendapatkan semua path sekaligus
    const response = await axios.get('/api/courses/all-paths-for-static-gen');
    const allParams = response.data.data;

    if (!Array.isArray(allParams) || allParams.length === 0) {
      console.warn("generateStaticParams (Questions) tidak menghasilkan path. Periksa endpoint /api/courses/all-paths-for-static-gen dan pastikan ada data di database.");
      return [];
    }

    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk edit-question:", error.response?.data?.message || error.message);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu pertanyaan spesifik saat build
async function getQuestionData(questionId) {
  // 'create' adalah kasus khusus, tidak perlu fetch data
  if (questionId === 'create') {
    return null;
  }

  try {
    // Endpoint ini sudah benar dari perbaikan sebelumnya
    const { data } = await axios.get(`/api/questions/${questionId}`);
    return data.data;
  } catch (error) {
    console.error(`Gagal mengambil data untuk question ${questionId}:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Ini adalah Server Component
export default async function EditQuestionPage({ params }) {
  const { questionId } = params;
  const question = await getQuestionData(questionId);

  // Render Client Component dengan data awal
  return <EditQuestionClient initialQuestion={question} params={params} />;
}