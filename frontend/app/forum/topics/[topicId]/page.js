import axios from '@/lib/axios';
import TopicClient from './topic-client';

// Fungsi ini memberitahu Next.js semua ID topik yang ada
export async function generateStaticParams() {
  try {
    const allParams = [];
    const categoriesRes = await axios.get('/api/forum/categories');
    const categories = categoriesRes.data.data;
    if (!Array.isArray(categories)) return [];

    for (const category of categories) {
      // Asumsi endpoint kategori mengembalikan topik-topiknya
      const topicsRes = await axios.get(`/api/forum/categories/${category.id}`);
      const topics = topicsRes.data.data.ForumTopics || [];
      if (!Array.isArray(topics)) continue;

      for (const topic of topics) {
        allParams.push({
          topicId: topic.id.toString(),
        });
      }
    }
    return allParams;
  } catch (error) {
    console.error("Gagal membuat static params untuk forum topics:", error);
    return [];
  }
}

// Fungsi ini mengambil data untuk satu topik spesifik saat build
async function getTopicData(topicId) {
  try {
    const { data } = await axios.get(`/api/forum/topics/${topicId}`);
    return {
      topic: data.data,
      posts: data.data.ForumPosts || [],
      error: null,
    };
  } catch (error) {
    console.error(`Gagal mengambil data untuk topik ${topicId}:`, error);
    return {
      topic: null,
      posts: [],
      error: error.response?.data?.message || 'Failed to load topic details.',
    };
  }
}

// Ini adalah Server Component
export default async function TopicPage({ params }) {
  const { topicId } = params;
  const { topic, posts, error } = await getTopicData(topicId);

  // Render Client Component dengan data awal dari server
  return (
    <TopicClient
      initialTopic={topic}
      initialPosts={posts}
      initialError={error}
      params={params}
    />
  );
}