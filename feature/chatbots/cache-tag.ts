const chatbotCacheTag = "chatbots";

const chatbotCacheKey = (chatbotId: string) => `chatbots:${chatbotId}`;

export const chatbotCacheTags = {
  list: chatbotCacheTag,
  get: chatbotCacheKey,
};
