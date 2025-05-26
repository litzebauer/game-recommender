import React from 'react';
import GameCard from './GameCard';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';

interface GameRecommendationsProps {
  gameRecommendations: GameRecommendation[];
  isLoading: boolean;
}

const GameRecommendations: React.FC<GameRecommendationsProps> = ({
  gameRecommendations,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Finding perfect games for you...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-pulse"
            >
              <div className="aspect-video bg-white/20 rounded-xl mb-4"></div>
              <div className="h-6 bg-white/20 rounded mb-3"></div>
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-white/20 rounded-full"></div>
                ))}
              </div>
              <div className="h-4 bg-white/20 rounded mb-4"></div>
              <div className="h-10 bg-white/20 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (gameRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Recommended Games for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameRecommendations.map((gameRecommendation, index) => (
          <div
            key={gameRecommendation.game.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <GameCard gameRecommendation={gameRecommendation} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameRecommendations;
