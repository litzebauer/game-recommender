import React from 'react';

const MAX_RECOMMENDATIONS = 6;

const GameRecommendationsLoading: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-8 text-center text-3xl font-bold text-white">
        Finding perfect games for you...
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(MAX_RECOMMENDATIONS)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md"
          >
            <div className="mb-4 aspect-video rounded-xl bg-white/20"></div>
            <div className="mb-3 h-6 rounded bg-white/20"></div>
            <div className="mb-2 h-4 rounded bg-white/20"></div>
            <div className="mb-4 h-4 w-3/4 rounded bg-white/20"></div>
            <div className="mb-4 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 rounded-full bg-white/20"></div>
              ))}
            </div>
            <div className="mb-4 h-4 rounded bg-white/20"></div>
            <div className="h-10 rounded-xl bg-white/20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameRecommendationsLoading;
