import { DynamicTool } from '@langchain/core/tools';
import { GoogleCustomSearch } from '@langchain/community/tools/google_custom_search';

export class GoogleSearchTool extends DynamicTool {
  private googleSearch: GoogleCustomSearch;

  constructor() {
    super({
      name: 'google_search',
      description:
        'Search the web for information about games and reviews. Input should be a search query.',
      func: async (query: string) => {
        try {
          const results = await this.googleSearch.invoke(query);
          return JSON.stringify(results);
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
