import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { analyzeMood } from './api/mood-agent';
import { recommendGame } from './api/recommender-agent';
import { updateContext } from '../lib/contextStore';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [mood, setMood] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // First, analyze the mood to get genres
    const { genres } = await analyzeMood({
      data: { mood },
    });

    // Then, get a game recommendation based on genres and platforms
    const response = await recommendGame({
      data: { genres, platforms },
    });

    // Update MCP context
    updateContext('test-user', {
      platforms,
      history: {
        moods: [mood],
        recommendations: [response.recommendation],
      },
    });

    setRecommendation(response);
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
                      How are you feeling?
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

      {recommendation && (
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recommended Game</h2>
            <h3 className="text-lg font-semibold">{recommendation.recommendation.title}</h3>
            <p className="text-gray-600 mt-2">{recommendation.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
