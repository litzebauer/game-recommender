import React, { useState } from 'react';
import { BrandButton } from '@/components/BrandButton';
import { PillButton } from '@/components/PillButton';
import { SearchTextarea } from '@/components/SearchTextarea';
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
          <SearchTextarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe what kind of game you're looking for... (e.g., 'I want a relaxing farming game' or 'Looking for a challenging platformer with great music')"
            disabled={isLoading}
          />
          <BrandButton
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-4 bottom-4 rounded-xl px-6 py-2"
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
          </BrandButton>
        </div>
      </form>

      <div className="text-center">
        <p className="mb-4 text-muted-foreground">Try one of these examples:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {examplePrompts.map((example, index) => (
            <PillButton
              type="button"
              key={index}
              onClick={() => setPrompt(example)}
              disabled={isLoading}
              className="h-9 px-4 text-sm font-medium"
            >
              {example}
            </PillButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
