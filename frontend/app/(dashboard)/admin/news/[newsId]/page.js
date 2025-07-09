import axios from '@/lib/axios';
import EditNewsClient from './edit-news-client';

// Fungsi ini memberitahu Next.js semua ID berita yang ada untuk dibuatkan halaman statis
export async function generateStaticParams() {
  try {
    // Perbaikan: Menggunakan endpoint admin yang mengembalikan struktur berbeda
    const response = await axios.get('/api/news/admin'); 
    
    // Perbaikan: Akses array berita dari response.data.data.news
    const newsData = response.data.data;
    const newsList = newsData.news;

    if (!Array.isArray(newsList)) {
      console.warn("generateStaticParams (Admin News): API tidak mengembalikan array di dalam `data.news`.");
      return [];
    }

    // Tambahkan path untuk halaman "create" (newsId: 'create')
    const params = [
      { newsId: 'create' }  // Halaman untuk membuat berita baru
    ];

    // Tambahkan path untuk setiap berita yang ada
    newsList.forEach(news => {
      params.push({
        newsId: news.id.toString(),
      });
    });

    return params;
  } catch (error) {
    console.error("Gagal membuat static params untuk Admin News:", error.response?.data?.message || error.message);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu berita spesifik saat build
async function getNewsData(newsId) {
  // newsId 'create' adalah kasus khusus untuk membuat artikel baru, tidak perlu fetch data
  if (newsId === 'create') {
    return null;
  }
  
  try {
    // Endpoint /api/news/admin/:id mengembalikan satu berita
    const response = await axios.get(`/api/news/admin/${newsId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Gagal mengambil data untuk news ${newsId}:`, error.response?.data?.message || error.message);
    // Kembalikan null jika gagal, agar client component bisa menanganinya
    return null;
  }
}

// Ini adalah Server Component
export default async function EditNewsPage({ params }) {
  const { newsId } = params;
  const news = await getNewsData(newsId);

  // Render Client Component dengan data awal dari server
  return <EditNewsClient initialNews={news} params={params} />;
}