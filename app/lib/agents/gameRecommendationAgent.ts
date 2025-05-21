import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { gameRecommendationSchema } from '../schemas/gameRecommendation';
import { GameSearchTool } from './tools/gameSearch';
import { PriceInfoTool } from './tools/priceInfo';
import { createReactAgent, CreateReactAgentParams } from '@langchain/langgraph/prebuilt';
import { Tool, StructuredTool } from '@langchain/core/tools';
import { ModelManager } from '../models/modelFactory';
import { loadModelConfig } from '../config/modelConfig';
import { createChatPromptTemplate } from './prompts/gameRecommendationPrompt';

export class GameRecommendationAgent {
  private model: BaseChatModel;
  private modelManager: ModelManager;
  private parser: StructuredOutputParser<typeof gameRecommendationSchema>;
  private tools: (Tool | StructuredTool)[];
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
        responseFormat: gameRecommendationSchema,
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
