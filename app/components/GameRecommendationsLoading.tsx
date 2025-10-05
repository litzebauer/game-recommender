import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_RECOMMENDATIONS = 6;

const GameRecommendationsLoading: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-8 text-center text-3xl font-bold text-white">
        Finding perfect games for you...
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(MAX_RECOMMENDATIONS)].map((_, index) => (
          <Card
            key={index}
            className="flex h-full animate-pulse flex-col gap-4 overflow-hidden rounded-2xl border-border bg-card p-6 text-card-foreground backdrop-blur-xl"
          >
            <Skeleton className="aspect-video w-full rounded-xl" />
            <CardContent className="flex flex-1 flex-col gap-4 p-0">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameRecommendationsLoading;
