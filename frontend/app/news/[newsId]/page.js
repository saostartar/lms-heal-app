import axios from '@/lib/axios';
import NewsDetailClient from './news-detail-client';

// Fungsi ini memberitahu Next.js semua ID berita yang ada
export async function generateStaticParams() {
  try {
    // Perbaikan: Menggunakan endpoint public news dan mengakses data.news
    const res = await axios.get('/api/news');
    const newsData = res.data.data;
    
    // Perbaikan: Akses array berita dari newsData.news
    const news = newsData.news;
    if (!Array.isArray(news)) {
      console.warn("generateStaticParams (News): API tidak mengembalikan array berita di data.news");
      return [];
    }

    return news.map((article) => ({
      newsId: article.id.toString(),
    }));
  } catch (error) {
    console.error("Gagal membuat static params untuk news:", error.response?.data?.message || error.message);
    return [];
  }
}

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