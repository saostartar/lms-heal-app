import ModuleDetailClient from './module-detail-client';

// Hapus fungsi getModuleData yang menyebabkan error 401
// Kita serahkan pengambilan data ke Client Component

export default function ModuleDetailPage({ params }) {
  // Langsung render Client Component tanpa data awal (initial data)
  // Client component akan mendeteksi ini dan melakukan fetch sendiri
  return (
    <ModuleDetailClient 
      params={params} 
    />
  );
}