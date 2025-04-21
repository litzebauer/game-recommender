import { MCPContext } from './types';

const store = new Map<string, MCPContext>();
export const getContext = (userId: string) => store.get(userId);
export const updateContext = (userId: string, update: Partial<MCPContext>) => {
  const context = getContext(userId);
  if (!context) return;
  store.set(userId, { ...context, ...update });
};
