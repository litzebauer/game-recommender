import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getRecommendations } from './api/recommendationAgent';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [mood, setMood] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [recommendedGames, setRecommendedGames] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await getRecommendations({
      data: { query: mood },
    });

    // Store the recommended games
    setRecommendedGames(result.games);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8">Game Recommender</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      What type of game are you looking for?
                    </label>
                    <input
                      type="text"
                      value={mood}
                      onChange={e => setMood(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., dark fantasy RPG"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select Platforms
                    </label>
                    <div className="mt-2 space-y-2">
                      {['PS5', 'Xbox Game Pass', 'Steam', 'Switch'].map(platform => (
                        <label key={platform} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={platforms.includes(platform)}
                            onChange={e => {
                              if (e.target.checked) {
                                setPlatforms([...platforms, platform]);
                              } else {
                                setPlatforms(platforms.filter(p => p !== platform));
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="ml-2">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Get Recommendation
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recommendedGames.length > 0 && (
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recommended Games</h2>
            <div className="space-y-4">
              {recommendedGames.map((game, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold">{game.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Genre:</span> {game.genre}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Playtime:</span> {game.playtime}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Platforms:</span> {game.platforms.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span>{' '}
                      <a
                        href={game.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        ${game.currentPrice.toFixed(2)}
                      </a>
                      {game.discount > 0 && (
                        <span className="ml-2 text-green-600">
                          ({game.discount * 100}% off from ${game.originalPrice.toFixed(2)})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Reasoning:</span> {game.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
