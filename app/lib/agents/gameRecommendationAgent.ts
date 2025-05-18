import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { gameRecommendationSchema } from '../schemas/gameRecommendation';
import { GameSearchTool } from './tools/gameSearch';
import { PriceInfoTool } from './tools/priceInfo';
import { createReactAgent, CreateReactAgentParams } from '@langchain/langgraph/prebuilt';
import { Tool } from '@langchain/core/tools';
import { ModelManager } from '../models/modelFactory';
import { loadModelConfig } from '../config/modelConfig';

const createChatPromptTemplate = (
  tools: Tool[],
  formatInstructions: string
): ChatPromptTemplate => {
  const escapedFormatInstructions = formatInstructions.replace(/{/g, '{{').replace(/}/g, '}}');
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expert video game recommendation system. Your task is to understand user preferences and recommend suitable games.

    Tools available: 
    ${tools.map(tool => `${tool.name} - ${tool.description}`).join('\n   ')}

    ❗ You MUST use tools to gather game information.
    ❗ NEVER make up prices, descriptions, links, genres, platforms, or playtimes.
    ❗ Do NOT guess. If you do not know something, use the appropriate tool to look it up.

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

    Tool Usage Strategy:
    1. First, analyze the user's query to identify key preferences and requirements
    2. Use game_search strategically - only when you need specific information about games that match the user's criteria
    3. Batch related searches together when possible
    4. Use price_info tool to get current pricing for games you've identified as good matches
    5. Avoid redundant searches - if you already have information about a game, don't search for it again
    
    You MUST format your final response as a valid JSON object that matches this schema:
    ${escapedFormatInstructions}

    DO NOT ask the user any follow-up questions.
    Make each tool call count - gather comprehensive information with each search.`,
    ],
    [
      'human',
      'User query: {input}\n\nRespond with game recommendations using the tools. Do not ask the user for clarification.',
    ],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);
};

export class GameRecommendationAgent {
  private model: BaseChatModel;
  private modelManager: ModelManager;
  private parser: StructuredOutputParser<typeof gameRecommendationSchema>;
  private tools: Tool[];
  private promptTemplate: ChatPromptTemplate;
  private agent: ReturnType<typeof createReactAgent> | null = null;

  constructor() {
    this.tools = [new GameSearchTool(), new PriceInfoTool()];
    this.modelManager = new ModelManager();
    this.parser = StructuredOutputParser.fromZodSchema(gameRecommendationSchema);

    // Load model configuration from environment
    const modelConfig = loadModelConfig();

    try {
      // Create the model
      this.model = this.modelManager.createModel(modelConfig);

      this.model.withStructuredOutput(gameRecommendationSchema);

      // Create the prompt template
      this.promptTemplate = createChatPromptTemplate(
        this.tools,
        this.parser.getFormatInstructions()
      );
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error initializing model:', error);
      throw new Error('Failed to initialize the game recommendation model');
    }
  }

  async getRecommendations(query: string) {
    try {
      // Create a new agent for each request to ensure clean state
      // Use a specific configuration to ensure compatibility
      const agentConfig: CreateReactAgentParams = {
        llm: this.model,
        tools: this.tools,
      };

      this.agent = createReactAgent(agentConfig);

      const messages = await this.promptTemplate.formatMessages({
        input: query,
        agent_scratchpad: [],
      });

      const finalState = await this.agent.invoke({
        messages: messages,
        agent_scratchpad: [],
      });

      return this.parser.parse(finalState.messages[finalState.messages.length - 1].content);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error in getRecommendations:', error);
      throw new Error(
        'Failed to generate game recommendations: ' + (error.message || String(error))
      );
    }
  }
}
