import React from 'react';
import GameCard from './GameCard';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';

interface GameRecommendationsProps {
  gameRecommendations: GameRecommendation[];
}

const GameRecommendations: React.FC<GameRecommendationsProps> = ({ gameRecommendations }) => {
  if (gameRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-8 text-center text-3xl font-bold text-white">Recommended Games for You</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
