import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag, Star } from 'lucide-react';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';

interface GameCardProps {
  gameRecommendation: GameRecommendation;
}

const GameCard: React.FC<GameCardProps> = ({ gameRecommendation }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
      <div className="aspect-video bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
        <img
          src={gameRecommendation.game.imageUrl}
          alt={gameRecommendation.game.name}
          className="w-full h-full object-cover"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `<div class="text-white text-4xl font-bold">${gameRecommendation.game.name.charAt(0)}</div>`;
          }}
        />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
        {gameRecommendation.game.name}
      </h3>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {gameRecommendation.game.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {gameRecommendation.game.tags?.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300"
          >
            <Tag size={12} className="mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-3 mb-4">
        <div className="flex items-start space-x-2">
          <Star size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-teal-200 text-sm">
            <span className="font-semibold">Why recommended:</span> {gameRecommendation.reasoning}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-right">
          {gameRecommendation.game.discount && gameRecommendation.game.originalPrice ? (
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{gameRecommendation.game.discount}%
                </span>
                <span className="text-gray-400 line-through text-sm">
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
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 rounded-xl px-6 transition-all duration-300 hover:scale-105"
          onClick={() => {
            window.open(gameRecommendation.game.link, '_blank');
          }}
        >
          View Game
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
