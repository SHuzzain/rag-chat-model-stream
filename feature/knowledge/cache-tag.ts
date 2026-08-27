const knowledgeCacheTag = "knowledge";

const knowledgeCacheKey = (knowledgeBaseId: string) =>
  `knowledge:${knowledgeBaseId}`;

const knowledgeAttachedKey = (chatbotId: string) =>
  `knowledge:attached:${chatbotId}`;

export const knowledgeCacheTags = {
  list: knowledgeCacheTag,
  get: knowledgeCacheKey,
  attached: knowledgeAttachedKey,
};
