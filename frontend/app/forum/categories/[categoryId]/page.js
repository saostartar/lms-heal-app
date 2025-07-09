import axios from '@/lib/axios';
import CategoryClient from './category-client';

// Fungsi ini memberitahu Next.js semua ID kategori yang ada
export async function generateStaticParams() {
  try {
    const res = await axios.get('/api/forum/categories');
    const categories = res.data.data;
    if (!Array.isArray(categories)) return [];

    return categories.map((category) => ({
      categoryId: category.id.toString(),
    }));
  } catch (error) {
    console.error("Gagal membuat static params untuk forum categories:", error);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu kategori spesifik saat build
async function getCategoryData(categoryId) {
  try {
    const { data } = await axios.get(`/api/forum/categories/${categoryId}`);
    return {
      category: data.data,
      topics: data.data.ForumTopics || [],
      error: null,
    };
  } catch (error) {
    console.error(`Gagal mengambil data untuk kategori ${categoryId}:`, error);
    return {
      category: null,
      topics: [],
      error: error.response?.data?.message || 'Failed to load category details.',
    };
  }
}

// Ini adalah Server Component
export default async function CategoryPage({ params }) {
  const { categoryId } = params;
  const { category, topics, error } = await getCategoryData(categoryId);

  // Render Client Component dengan data awal dari server
  return (
    <CategoryClient
      initialCategory={category}
      initialTopics={topics}
      initialError={error}
      params={params}
    />
  );
}