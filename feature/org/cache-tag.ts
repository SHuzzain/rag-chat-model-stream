const orgCacheTag = "orgs";

const orgCacheKey = (organizationId: string) => `orgs:${organizationId}`;

export const orgCacheTags = {
  list: orgCacheTag,
  get: orgCacheKey,
};
