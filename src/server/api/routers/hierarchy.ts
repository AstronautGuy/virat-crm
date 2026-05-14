import { createTRPCRouter, featureProtectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema/users";
import { eq, sql } from "drizzle-orm";

export const hierarchyRouter = createTRPCRouter({
  getManagers: featureProtectedProcedure("admin")
    .query(async ({ ctx }) => {
      return ctx.db.query.users.findMany({
        where: eq(users.role, "Manager"),
      });
    }),

  // Fetch immediate team members (direct reports)
  getMyTeam: featureProtectedProcedure("org-chart").query(async ({ ctx }) => {
    // If Admin, they might not have a manager, or maybe we want to return everyone?
    // Let's stick to strict hierarchy: team members are where managerId == ctx.dbUser.id
    const team = await ctx.db.query.users.findMany({
      where: eq(users.managerId, ctx.dbUser.id),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        employeeCode: true,
      },
    });

    return team;
  }),

  // Fetch full N-level hierarchy tree (CTE)
  getFullHierarchy: featureProtectedProcedure("org-chart").query(async ({ ctx }) => {
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
          managerId: true,
        },
      });
    }

    // CTE to get all descendants for current user
    const descendantsQuery = sql`
      WITH RECURSIVE subordinates AS (
        SELECT id, first_name, last_name, email, role, employee_code, manager_id
        FROM "virat-crm_user"
        WHERE manager_id = ${ctx.dbUser.id}
        
        UNION
        
        SELECT e.id, e.first_name, e.last_name, e.email, e.role, e.employee_code, e.manager_id
        FROM "virat-crm_user" e
        INNER JOIN subordinates s ON s.id = e.manager_id
      )
      SELECT * FROM subordinates;
    `;

    const rows = await ctx.db.execute(descendantsQuery);
    
    // Map rows to camelCase to match drizzle schema
    return rows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      firstName: String(row.first_name),
      lastName: String(row.last_name),
      email: String(row.email),
      role: String(row.role),
      employeeCode: row.employee_code ? String(row.employee_code as string | number) : null,
      managerId: row.manager_id ? String(row.manager_id as string | number) : null,
    }));
  }),
});
