import axios from '@/lib/axios';
import EditQuestionClient from './edit-question-client';



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