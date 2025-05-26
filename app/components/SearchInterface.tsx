
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
    "I want a relaxing game to play after work",
    "Looking for a co-op game to play with friends",
    "I love RPGs with deep storylines",
    "Need a challenging puzzle game",
    "Want something like Dark Souls but easier"
  ];

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what kind of game you're looking for... (e.g., 'I want a relaxing farming game' or 'Looking for a challenging platformer with great music')"
            className="w-full h-32 px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 rounded-xl px-6 py-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        <p className="text-gray-400 mb-4">Try one of these examples:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              disabled={isLoading}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-gray-300 text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
