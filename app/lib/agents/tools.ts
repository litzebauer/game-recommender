import { DynamicTool } from '@langchain/core/tools';
import { GoogleCustomSearch } from '@langchain/community/tools/google_custom_search';

export const createGoogleSearchTool = (apiKey: string, cseId: string) => {
  const googleSearch = new GoogleCustomSearch({
    apiKey,
    googleCSEId: cseId,
  });

  return new DynamicTool({
    name: 'google_search',
    description:
      'Search the web for information about games, reviews, current sales, and gaming news. Input should be a search query.',
    func: async (query: string) => {
      try {
        const results = await googleSearch.invoke(query);
        return JSON.stringify(results);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error performing Google search:', error);
        return 'Error performing search. Please try again.';
      }
    },
  });
};
