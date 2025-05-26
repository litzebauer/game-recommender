import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getRecommendations } from './api/recommendations';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';
import SearchInterface from '../components/SearchInterface';
import GameRecommendations from '../components/GameRecommendations';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (prompt: string) => {
    setIsLoading(true);
    setHasSearched(true);

    const recommendations = await getRecommendations({ data: { query: prompt } });

    setRecommendations(recommendations);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            GameFinder
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover your next favorite game! Describe what you're looking for and get personalized
            recommendations.
          </p>
        </div>

        <SearchInterface onSearch={handleSearch} isLoading={isLoading} />

        {(hasSearched || recommendations.length > 0) && (
          <GameRecommendations gameRecommendations={recommendations} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
