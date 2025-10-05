import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tag, Star } from 'lucide-react';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from './ui/tooltip';

interface GameCardProps {
  gameRecommendation: GameRecommendation;
}

const MAX_VISIBLE_TAGS = 6;

// Helper function to format prices as USD currency
const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) {
    return '$0.00';
  }
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

const GameCard: React.FC<GameCardProps> = ({ gameRecommendation }) => {
  const tags = gameRecommendation.game.tags || [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTags = tags.slice(MAX_VISIBLE_TAGS);
  const hasMoreTags = remainingTags.length > 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card text-card-foreground backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden">
        <img
          src={gameRecommendation.game.imageUrl ?? '/placeholder.svg'}
          alt={gameRecommendation.game.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-teal-600 text-4xl font-bold text-white">${gameRecommendation.game.name.charAt(0)}</div>`;
          }}
        />
      </div>

      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-xl font-bold transition-colors group-hover:text-primary/80">
          {gameRecommendation.game.name}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {gameRecommendation.game.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="game-tag">
              <Tag size={12} className="mr-1" />
              {tag}
            </Badge>
          ))}
          {hasMoreTags && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-default border-[var(--secondary-border)] bg-[var(--surface-muted)]"
                >
                  +{tags.length - MAX_VISIBLE_TAGS} More
                </Badge>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="z-[9999] max-w-md rounded-lg border border-white/10 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm"
                  sideOffset={8}
                >
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-300">Additional Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {remainingTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="game-tag">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          )}
        </div>

        <div className="rounded-xl border border-[var(--secondary-border)] bg-[var(--secondary)] p-3 backdrop-blur-md">
          <div className="flex items-start space-x-2">
            <Star size={16} className="mt-0.5 flex-shrink-0 text-yellow-400" />
            <p className="text-sm text-[var(--secondary-foreground)]">
              <span className="font-semibold">Why recommended:</span> {gameRecommendation.reasoning}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="text-right text-card-foreground">
          {gameRecommendation.game.discount && gameRecommendation.game.originalPrice ? (
            <div className="space-y-1">
              <div className="flex items-center justify-end space-x-2">
                <span className="rounded-full bg-green-600/90 px-2 py-1 text-xs font-bold text-white">
                  -{gameRecommendation.game.discount}%
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(gameRecommendation.game.originalPrice)}
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-300">
                {formatPrice(gameRecommendation.game.currentPrice)}
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold">
              {formatPrice(gameRecommendation.game.currentPrice)}
            </div>
          )}
        </div>

        <Button
          disabled={!gameRecommendation.game.link}
          variant="brand"
          className="rounded-xl px-6"
          onClick={() => {
            if (gameRecommendation.game.link) {
              window.open(gameRecommendation.game.link, '_blank');
            }
          }}
        >
          View Game
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
