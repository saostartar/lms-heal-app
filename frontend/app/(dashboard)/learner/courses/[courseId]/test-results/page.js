import TestResultsClient from './test-results-client';

// Ini adalah Server Component
export default function TestResultsPage({ params }) {
  // Delegate all data fetching to the client component to handle authentication seamlessly
  return <TestResultsClient params={params} />;
}