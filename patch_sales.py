with open('src/server/api/routers/sales.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update updateSale input schema
content = content.replace('customerAddress: z.string().optional(),\n        invoiceAmount', 'customerAddress: z.string().optional(),\n        userIds: z.array(z.string()).optional(),\n        managerIds: z.array(z.string()).optional(),\n        invoiceAmount')

# 2. Update updateSale mutation logic to delete and recreate saleAssignments
assignment_logic = """
        await tx.delete(saleItems).where(eq(saleItems.saleId, input.id));

        // Delete old sale assignments and create new ones
        await tx.delete(saleAssignments).where(eq(saleAssignments.saleId, input.id));
        const uniqueAssignments: { saleId: number; userId: string; role: "Ecode" | "FieldSupport" }[] = [];
        
        if (input.userIds) {
          const userIds = Array.from(new Set(input.userIds));
          userIds.forEach((uid) => {
            uniqueAssignments.push({
              saleId: input.id,
              userId: uid,
              role: "Ecode",
            });
          });
        }
        
        if (input.managerIds) {
          const mIds = Array.from(new Set(input.managerIds));
          mIds.forEach((uid) => {
            if (!uniqueAssignments.some((a) => a.userId === uid && a.role === "FieldSupport")) {
              uniqueAssignments.push({
                saleId: input.id,
                userId: uid,
                role: "FieldSupport",
              });
            }
          });
        }
        
        if (uniqueAssignments.length > 0) {
          await tx.insert(saleAssignments).values(uniqueAssignments);
        }
"""
content = content.replace('await tx.delete(saleItems).where(eq(saleItems.saleId, input.id));', assignment_logic)

with open('src/server/api/routers/sales.ts', 'w', encoding='utf-8') as f:
    f.write(content)
