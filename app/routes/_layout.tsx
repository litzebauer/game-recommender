import { createFileRoute, Outlet, useMatches, useNavigate } from '@tanstack/react-router';
import SearchInterface from '../components/SearchInterface';

export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
});

function LayoutComponent() {
  const matches = useMatches();

  const isChildLoading = matches.some(match => match.status === 'pending');
  const navigate = useNavigate();

  const handleSearch = async (prompt: string) => {
    navigate({
      to: '/recommendations',
      replace: true,
      state: { prompt },
      search: { _t: Date.now().toString() }, // Forces router to see this as new navigation
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-5xl font-bold text-transparent text-white">
            GameFinder
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Discover your next favorite game! Describe what you're looking for and get personalized
            recommendations.
          </p>
        </div>

        <SearchInterface onSearch={handleSearch} isLoading={isChildLoading} />
        <Outlet />
      </div>
    </div>
  );
}
