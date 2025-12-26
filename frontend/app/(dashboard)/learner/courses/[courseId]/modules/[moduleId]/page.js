import ModuleDetailClient from './module-detail-client';

export default function ModuleDetailPage({ params }) {
  // Delegate all data fetching to the client component to handle authentication seamlessly
  return <ModuleDetailClient params={params} />;
}