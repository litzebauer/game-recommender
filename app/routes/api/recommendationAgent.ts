import { createServerFn } from '@tanstack/react-start';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { DynamicTool } from '@langchain/core/tools';
import { GoogleCustomSearch } from '@langchain/community/tools/google_custom_search';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

// Define the output schema for game recommendations
const gameRecommendationSchema = z.object({
  games: z.array(
    z.object({
      name: z.string(),
      genre: z.string(),
      playtime: z.string(),
      reasoning: z.string(),
      platforms: z.array(z.string()),
    })
  ),
  queryUnderstanding: z.object({
    keyPreferences: z.array(z.string()),
    playtimePreference: z.string(),
    genrePreferences: z.array(z.string()).optional(),
  }),
});

// Create the output parser
const parser = StructuredOutputParser.fromZodSchema(gameRecommendationSchema);

// Initialize Google Search
const googleSearch = new GoogleCustomSearch({
  apiKey: process.env.GOOGLE_API_KEY,
  googleCSEId: process.env.GOOGLE_CSE_ID,
});

// Define tools for the model
const tools = [
  new DynamicTool({
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
  }),
];

export const getRecommendations = createServerFn({
  method: 'POST',
})
  .validator((d: { query: string }) => d)
  .handler(async ({ data }): Promise<z.infer<typeof gameRecommendationSchema>> => {
    // Initialize the Gemini model through LangChain
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      maxOutputTokens: 2048,
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    try {
      // Create the chat prompt with the required agent_scratchpad
      const chatPrompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `You are an expert video game recommendation system. Your task is to understand user preferences and recommend suitable games.
        You have access to tools that can help you gather more information about games.

        Available tools:
        - google_search: Search the web for information about games, reviews, and gaming news

        You MUST format your final response as a valid JSON object that matches this schema:
        {format_instructions}

        Consider the following aspects when making recommendations:
        1. Game reviews and ratings
        2. Game genre preferences
        3. Platform availability
        4. Game complexity
        5. User's stated preferences
        6. Playtime requirements
        7. Detailed game information
        8. Latest gaming news and trends
        9. Current sales and discounts
        Use the available tools to gather more information about potential game recommendations.
        Make sure to verify platform availability and check reviews before making recommendations.
        Use Google Search to find the most up-to-date information about games.`,
        ],
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad'),
      ]);

      // Create the agent
      const agent = await createOpenAIFunctionsAgent({
        llm: model,
        tools,
        prompt: chatPrompt,
      });

      // Create the agent executor
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
      });

      // Process the query
      const result = await agentExecutor.invoke({
        input: data.query,
        format_instructions: parser.getFormatInstructions(),
      });

      try {
        // Parse the result into our schema
        const parsedResult = await parser.parse(result.output);
        return parsedResult;
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error('Error parsing agent output:', parseError);
        // eslint-disable-next-line no-console
        console.error('Raw output:', result.output);
        throw new Error('Failed to parse game recommendations. Please try again.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating game recommendations:', error);
      throw new Error('Failed to generate game recommendations');
    }
  });
