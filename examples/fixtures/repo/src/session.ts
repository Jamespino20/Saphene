// Sessions are JWT-based and scoped to tenant_id.
export function issueSession(userId: string, tenant_id: string) {
  return { token: `jwt.${userId}.${tenant_id}`, tenant_id };
}
