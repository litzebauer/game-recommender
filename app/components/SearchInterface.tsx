import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSearch(prompt.trim());
    }
  };

  const examplePrompts = [
    'I want a relaxing game to play after work',
    'Looking for a co-op game to play with friends',
    'I love RPGs with deep storylines',
    'Need a challenging puzzle game',
    'Want something like Dark Souls but easier',
  ];

  return (
    <div className="mx-auto mb-12 max-w-4xl">
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe what kind of game you're looking for... (e.g., 'I want a relaxing farming game' or 'Looking for a challenging platformer with great music')"
            className="h-32 w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder-gray-400 backdrop-blur-md transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-4 bottom-4 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-2 text-white transition-all duration-300 hover:from-blue-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search size={18} />
                <span>Find Games</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="mb-4 text-gray-400">Try one of these examples:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              disabled={isLoading}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all duration-300 hover:scale-105 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
