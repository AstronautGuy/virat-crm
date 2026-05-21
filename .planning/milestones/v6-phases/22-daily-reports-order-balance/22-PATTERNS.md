# Phase 22: Daily Reports & Order Balance - Pattern Map

## Analogous Files

### 1. Database Schema

- **Target**: `src/server/db/schema/daily_reports.ts`
- **Analog**: `src/server/db/schema/customers.ts`
- **Excerpts**:

```typescript
export const customers = createTable("customer", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  status: customerStatus("status").notNull().default("Draft"),
  name: varchar("name", { length: 256 }).notNull(),
  // ...
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

### 2. tRPC Router

- **Target**: `src/server/api/routers/reports.ts`
- **Analog**: `src/server/api/routers/crm.ts`
- **Excerpts**:

```typescript
export const crmRouter = createTRPCRouter({
  listCustomers: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["Draft", "Approved"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Branch isolation logic
      const whereClause = [
        ctx.user.role === "Admin"
          ? undefined
          : eq(customers.branchId, ctx.user.branchId),
        // ...
      ];
    }),
});
```

### 3. Frontend Form

- **Target**: `src/app/_components/reports/ReportForm.tsx`
- **Analog**: `src/app/_components/crm/CustomerForm.tsx`
- **Excerpts**:

```typescript
export function CustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
  });
  // ...
  const createMutation = api.crm.proposeCustomer.useMutation({
    onSuccess: () => {
      toast.success("Customer proposed for approval");
      onSuccess?.();
    },
  });
}
```

## Implementation Guidelines

- **Branch Isolation**: Always check `ctx.user.branchId` in procedures unless the user is an `Admin`.
- **RBAC**: Use `protectedProcedure` for employees submitting their own reports.
- **Financial Integrity**: Ensure `sales` updates are transactional if multiple fields change.
