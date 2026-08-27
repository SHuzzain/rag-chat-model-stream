const usageCacheTag = "usage";

const usageCacheKey = (organizationId: string) => `usage:${organizationId}`;

export const usageCacheTags = {
  list: usageCacheTag,
  get: usageCacheKey,
};
