import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { gameRecommendationSchema } from '../schemas/gameRecommendation';
import { GoogleSearchTool } from './tools/googleSearch';
import { IatdSearchTool } from './tools/itadSearch';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Tool } from '@langchain/core/tools';
import { ConsoleCallbackHandler } from '@langchain/core/tracers/console';

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
    Use the available tools to gather more information about potential game recommendations.
    Make sure to verify platform availability check reviews, and current sales before making recommendations.
    Use Google Search to find the most up-to-date information about games.
    Use the google_search tool to get the current price of the game from isthereanydeal.com.
    Get a link to the game's isthereanydeal.com page from the google_search tool.
    Verify the game exists and the link is valid.
    
    You MUST format your final response as a valid JSON object that matches this schema:
    ${escapedFormatInstructions}

    DO NOT ask the user any follow-up questions.
    DO NOT delay tool usage — use tools early and often to gather data.

    Respond only when you have enough information from tool results to produce a valid JSON output.`,
    ],
    [
      'human',
      'User query: {input}\n\nRespond with game recommendations using the tools. Do not ask the user for clarification.',
    ],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);
};

export class GameRecommendationAgent {
  private model: ChatGoogleGenerativeAI;
  private parser: StructuredOutputParser<typeof gameRecommendationSchema>;
  private tools: Tool[];
  private promptTemplate: ChatPromptTemplate;
  private agent: ReturnType<typeof createReactAgent> | null = null;

  constructor() {
    this.tools = [new GoogleSearchTool(), new IatdSearchTool()];
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash-preview-04-17',
      maxOutputTokens: 4096,
      temperature: 0.2,
      apiKey: process.env.GEMINI_API_KEY!,
      verbose: true,
    });
    this.model.withStructuredOutput(gameRecommendationSchema);
    this.parser = StructuredOutputParser.fromZodSchema(gameRecommendationSchema);
    this.promptTemplate = createChatPromptTemplate(this.tools, this.parser.getFormatInstructions());
  }

  async getRecommendations(query: string) {
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
    });

    const messages = await this.promptTemplate.formatMessages({
      input: query,
      agent_scratchpad: [],
    });

    const finalState = await this.agent.invoke({
      messages: messages,
      agent_scratchpad: [],
      callbacks: [new ConsoleCallbackHandler()],
    });
    return this.parser.parse(finalState.messages[finalState.messages.length - 1].content);
  }
}
