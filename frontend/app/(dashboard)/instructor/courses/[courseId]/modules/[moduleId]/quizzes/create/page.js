import axios from '@/lib/axios';
import CreateQuizClient from './create-quiz-client';



// Fungsi ini mengambil data modul saat build
async function getModuleData(moduleId) {
  try {
    const { data } = await axios.get(`/api/modules/${moduleId}`);
    return data.data;
  } catch (error) {
    console.error(`Gagal mengambil data untuk module ${moduleId}:`, error);
    return null;
  }
}

// Ini adalah Server Component
export default async function CreateQuizPage({ params }) {
  const { moduleId } = params;
  const module = await getModuleData(moduleId);

  // Render Client Component dengan data awal
  return <CreateQuizClient initialModuleTitle={module?.title} params={params} />;
}