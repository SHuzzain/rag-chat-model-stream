const conversationCacheTag = "conversations";

const conversationCacheKey = (conversationId: string) =>
  `conversations:${conversationId}`;

export const conversationCacheTags = {
  list: conversationCacheTag,
  get: conversationCacheKey,
};
