import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { gameRecommendationSchema } from '../schemas/gameRecommendation';
import { createGoogleSearchTool } from './tools';

export class GameRecommendationAgent {
  private model: ChatGoogleGenerativeAI;
  private parser: StructuredOutputParser<typeof gameRecommendationSchema>;
  private tools: any[];

  constructor(apiKey: string, cseId: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      maxOutputTokens: 2048,
      temperature: 0.7,
      apiKey,
    });

    this.parser = StructuredOutputParser.fromZodSchema(gameRecommendationSchema);
    this.tools = [createGoogleSearchTool(apiKey, cseId)];
  }

  private createChatPrompt() {
    return ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert video game recommendation system. Your task is to understand user preferences and recommend suitable games.
        You have access to tools that can help you gather more information about games.

        Available tools:
        - google_search: Search the web for information about games, reviews, current sales, and gaming news

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
  }

  async getRecommendations(query: string) {
    const chatPrompt = this.createChatPrompt();

    const agent = await createOpenAIFunctionsAgent({
      llm: this.model,
      tools: this.tools,
      prompt: chatPrompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: this.tools,
      verbose: true,
    });

    const result = await agentExecutor.invoke({
      input: query,
      format_instructions: this.parser.getFormatInstructions(),
    });

    try {
      return await this.parser.parse(result.output);
    } catch (parseError) {
      // eslint-disable-next-line no-console
      console.error('Error parsing agent output:', parseError);
      // eslint-disable-next-line no-console
      console.error('Raw output:', result.output);
      throw new Error('Failed to parse game recommendations. Please try again.');
    }
  }
}
