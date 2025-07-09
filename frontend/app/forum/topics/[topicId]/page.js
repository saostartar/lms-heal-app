import axios from '@/lib/axios';
import TopicClient from './topic-client';


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