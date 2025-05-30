import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag, Star } from 'lucide-react';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';
import placeholderImage from '/placeholder.svg?url';

interface GameCardProps {
  gameRecommendation: GameRecommendation;
}

const GameCard: React.FC<GameCardProps> = ({ gameRecommendation }) => {
  return (
    <div className="group rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:shadow-2xl">
      <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-teal-600">
        <img
          src={gameRecommendation.game.imageUrl ?? placeholderImage}
          alt={gameRecommendation.game.name}
          className="h-full w-full object-cover"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `<div class="text-white text-4xl font-bold">${gameRecommendation.game.name.charAt(0)}</div>`;
          }}
        />
      </div>

      <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-blue-300">
        {gameRecommendation.game.name}
      </h3>

      <p className="mb-4 line-clamp-3 text-sm text-gray-300">
        {gameRecommendation.game.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {gameRecommendation.game.tags?.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-600/20 px-3 py-1 text-xs text-blue-300"
          >
            <Tag size={12} className="mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-teal-500/30 bg-teal-600/20 p-3">
        <div className="flex items-start space-x-2">
          <Star size={16} className="mt-0.5 flex-shrink-0 text-yellow-400" />
          <p className="text-sm text-teal-200">
            <span className="font-semibold">Why recommended:</span> {gameRecommendation.reasoning}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-right">
          {gameRecommendation.game.discount && gameRecommendation.game.originalPrice ? (
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-green-600 px-2 py-1 text-xs font-bold text-white">
                  -{gameRecommendation.game.discount}%
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${gameRecommendation.game.originalPrice}
                </span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${gameRecommendation.game.currentPrice}
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-white">
              ${gameRecommendation.game.currentPrice}
            </div>
          )}
        </div>

        <Button
          disabled={!gameRecommendation.game.link}
          className="rounded-xl border-0 bg-gradient-to-r from-blue-600 to-teal-600 px-6 text-white transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-teal-700"
          onClick={() => {
            if (gameRecommendation.game.link) {
              window.open(gameRecommendation.game.link, '_blank');
            }
          }}
        >
          View Game
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
