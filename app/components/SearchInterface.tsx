import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search } from 'lucide-react';

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
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe what kind of game you're looking for... (e.g., 'I want a relaxing farming game' or 'Looking for a challenging platformer with great music')"
            className="h-32 resize-none rounded-2xl border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder-gray-300 backdrop-blur-md transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500/80"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-4 bottom-4 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-2 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
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
        <p className="mb-4 text-gray-300">Try one of these examples:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {examplePrompts.map((example, index) => (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              key={index}
              onClick={() => setPrompt(example)}
              disabled={isLoading}
              className="rounded-full border border-white/20 bg-white/5 text-gray-200 transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              "{example}"
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
