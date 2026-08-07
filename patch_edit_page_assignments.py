with open('src/app/sales/[id]/edit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('setCustomerName(sale.customerName ?? "");', 'setCustomerName(sale.customerName ?? "");\n      if (sale.assignments) {\n        setUserIds(sale.assignments.filter((a: any) => a.role === "Ecode").map((a: any) => a.userId));\n        setManagerIds(sale.assignments.filter((a: any) => a.role === "FieldSupport").map((a: any) => a.userId));\n      }')

with open('src/app/sales/[id]/edit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
