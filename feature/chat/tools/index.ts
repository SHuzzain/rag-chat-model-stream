import { createSearchKnowledgeBaseTool } from "./search-knowledge-base";

export function createAllTools(options?: {
  chatbotId?: string;
  organizationId?: string;
}) {
  return {
    searchKnowledgeBase: createSearchKnowledgeBaseTool({
      topK: 5,
      chatbotId: options?.chatbotId,
      organizationId: options?.organizationId,
    }),
  };
}
