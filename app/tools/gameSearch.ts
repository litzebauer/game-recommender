import { DynamicStructuredTool } from '@langchain/core/tools';
import { GoogleCustomSearch } from '@langchain/community/tools/google_custom_search';
import { z } from 'zod';

export class GameSearchTool extends DynamicStructuredTool {
  private googleSearch: GoogleCustomSearch;

  constructor() {
    super({
      name: 'game_search',
      description:
        'Search the web for information about games and reviews. Input should be a search engine query.',
      schema: z.object({
        query: z.string().describe('The search query about games and reviews'),
      }),
      func: async ({ query }) => {
        try {
          return await this.googleSearch.invoke(query);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error performing Google search:', error);
          return 'Error performing search. Please try again.';
        }
      },
    });

    this.googleSearch = new GoogleCustomSearch();
  }
}
