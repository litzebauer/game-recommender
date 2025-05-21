import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { gameRecommendationSchema } from '../schemas/gameRecommendation';
import { GameSearchTool } from './tools/gameSearch';
import { PriceInfoTool } from './tools/priceInfo';
import { createReactAgent, CreateReactAgentParams } from '@langchain/langgraph/prebuilt';
import { Tool, StructuredTool } from '@langchain/core/tools';
import { ModelManager } from '../models/modelFactory';
import { loadModelConfig } from '../config/modelConfig';

const createChatPromptTemplate = (
  tools: (Tool | StructuredTool)[],
  formatInstructions: string
): ChatPromptTemplate => {
  const escapedFormatInstructions = formatInstructions.replace(/{/g, '{{').replace(/}/g, '}}');
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expert video game recommendation agent. Your goal is to suggest 5 video games that best match the user's preferences. 
      The user will describe what kind of game they want to play — for example, genres, moods, gameplay mechanics, themes, or similar 
      games they've liked in the past.

      You have access to the following tools:
        ${tools.map(tool => `${tool.name}: ${tool.description}`).join('\n')}

      You should:
        •	Interpret the user's request to identify themes, genres, gameplay elements, or comparisons to known titles.
        •	Use reasoning to narrow your choices to 5 diverse and relevant recommendations.
        • ONLY recommend games that are CURRENTLY RELEASED and AVAILABLE to purchase or play.
        • NEVER recommend unreleased games, pre-orders, or games in development.
        • If a game's price info cannot be found, it may be unreleased - exclude it and find an alternative.
        •	Return your final answer as a numbered list of game titles, each with a short explanation and the current and regular price.
        • Avoid repeating the same genre or franchise unless justified.

      Think step-by-step using the ReAct framework:
        •	Reason about what the user wants.
        •	Act by invoking tools to gather data.
        •	Observe the results.
        •	Continue until you are confident in your recommendations.
        •	Then Respond with your final list.
      
      ${escapedFormatInstructions}`,
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
