export type OrgRole = "OWNER" | "ADMIN" | "DEVELOPER" | "ANALYST" | "VIEWER";

const ROLE_RANK: Record<OrgRole, number> = {
  OWNER: 50,
  ADMIN: 40,
  DEVELOPER: 30,
  ANALYST: 20,
  VIEWER: 10,
};

const BETTER_AUTH_ROLE_MAP: Record<string, OrgRole> = {
  owner: "OWNER",
  admin: "ADMIN",
  member: "DEVELOPER",
};

export function normalizeOrgRole(role?: string | null): OrgRole {
  if (!role) return "VIEWER";
  const upper = role.toUpperCase() as OrgRole;
  if (upper in ROLE_RANK) return upper;
  return BETTER_AUTH_ROLE_MAP[role.toLowerCase()] ?? "VIEWER";
}

export function hasMinRole(role: string | null | undefined, min: OrgRole) {
  return ROLE_RANK[normalizeOrgRole(role)] >= ROLE_RANK[min];
}

export function canEditChatbots(role?: string | null) {
  return hasMinRole(role, "DEVELOPER");
}

export function canPublish(role?: string | null) {
  return hasMinRole(role, "ADMIN");
}

export function canManageOrg(role?: string | null) {
  return hasMinRole(role, "ADMIN");
}
