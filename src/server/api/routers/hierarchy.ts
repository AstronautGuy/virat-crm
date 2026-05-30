import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { users, userManagers } from "@/server/db/schema/users";
import { eq, inArray, sql } from "drizzle-orm";

export const hierarchyRouter = createTRPCRouter({
  getManagers: featureProtectedProcedure("admin").query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      where: eq(users.role, "Manager"),
    });
  }),

  // Fetch immediate team members (direct reports)
  getMyTeam: featureProtectedProcedure("org-chart").query(async ({ ctx }) => {
    const teamMappings = await ctx.db.query.userManagers.findMany({
      where: eq(userManagers.managerId, ctx.dbUser.id),
    });
    const teamIds = teamMappings.map((m) => m.userId);
    if (teamIds.length === 0) return [];

    return ctx.db.query.users.findMany({
      where: inArray(users.id, teamIds),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        employeeCode: true,
      },
    });
  }),

  // Fetch full N-level hierarchy tree (CTE)
  getFullHierarchy: featureProtectedProcedure("org-chart").query(
    async ({ ctx }) => {
      // If Admin, they see everyone. If Manager, they see their tree.
      if (ctx.dbUser.role === "Admin") {
        // Just return all users for Admin
        return ctx.db.query.users.findMany({
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            employeeCode: true,
          },
        });
      }

      // CTE to get all descendants for current user
      const descendantsQuery = sql`
      WITH RECURSIVE subordinates AS (
        SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_code
        FROM "virat-crm_user" u
        INNER JOIN "virat-crm_user_managers" um ON um.user_id = u.id
        WHERE um.manager_id = ${ctx.dbUser.id}
        
        UNION
        
        SELECT e.id, e.first_name, e.last_name, e.email, e.role, e.employee_code
        FROM "virat-crm_user" e
        INNER JOIN "virat-crm_user_managers" um ON um.user_id = e.id
        INNER JOIN subordinates s ON s.id = um.manager_id
      )
      SELECT DISTINCT * FROM subordinates;
    `;

      const rows = await ctx.db.execute(descendantsQuery);

      // Map rows to camelCase to match drizzle schema
      return rows.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        firstName: String(row.first_name),
        lastName: String(row.last_name),
        email: String(row.email),
        role: String(row.role),
        employeeCode: row.employee_code
          ? String(row.employee_code as string | number)
          : null,
      }));
    },
  ),
});
