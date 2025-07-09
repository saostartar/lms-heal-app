import axios from '@/lib/axios';
import NewsDetailClient from './news-detail-client';



// Fungsi ini mengambil data untuk satu artikel berita spesifik saat build
async function getNewsData(newsId) {
  try {
    // Perbaikan: Menggunakan endpoint public yang benar
    const { data } = await axios.get(`/api/news/${newsId}`);
    return { article: data.data, error: null };
  } catch (error) {
    console.error(`Gagal mengambil data untuk berita ${newsId}:`, error.response?.data?.message || error.message);
    return {
      article: null,
      error: error.response?.data?.message || 'Failed to load article details.',
    };
  }
}

// Ini adalah Server Component
export default async function NewsDetailPage({ params }) {
  const { newsId } = params;
  const { article, error } = await getNewsData(newsId);

  // Render Client Component dengan data awal dari server
  return (
    <NewsDetailClient
      initialArticle={article}
      initialError={error}
    />
  );
}