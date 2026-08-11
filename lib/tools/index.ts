import { createSearchKnowledgeBaseTool } from "./search-knowledge-base"

export function createAllTools() {
  return {
    searchKnowledgeBase: createSearchKnowledgeBaseTool({ topK: 5 }),
  }
}
