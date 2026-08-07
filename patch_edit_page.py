with open('src/app/sales/[id]/edit/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('import { FileUploader } from "@/app/_components/ui/FileUploader";', 'import { FileUploader } from "@/app/_components/ui/FileUploader";\nimport { MultiSelectInput } from "@/app/_components/ui/MultiSelectInput";')

# 2. State
content = content.replace('const [ecode, setEcode] = useState("");\n  const [fieldSuppBy, setFieldSuppBy] = useState("");', 'const [userIds, setUserIds] = useState<string[]>([]);\n  const [managerIds, setManagerIds] = useState<string[]>([]);')

# 3. Clear form
content = content.replace('setEcode("");\n    setFieldSuppBy("");', 'setUserIds([]);\n    setManagerIds([]);')

# 4. updateSale payload
content = content.replace('      items: allItems,\n    };\n\n    if (!navigator.onLine) {', '      userIds,\n      managerIds,\n      items: allItems,\n    };\n\n    if (!navigator.onLine) {')

# 5. Queries
content = content.replace('const { data: customers = [], refetch: refetchCustomers } =\n    api.crm.getBranchCustomers.useQuery();', 'const { data: customers = [], refetch: refetchCustomers } =\n    api.crm.getBranchCustomers.useQuery();\n\n  const { data: orgUsers = [] } = api.users.getUsersForDropdown.useQuery();\n  const allUsersOptions = orgUsers.map((u) => ({\n    id: u.id,\n    label: u.employeeCode ? `${u.employeeCode} - ${u.firstName} ${u.lastName || ""}` : `${u.firstName} ${u.lastName || ""}`\n  }));\n  const managerOptions = orgUsers\n    .filter((u) => u.role === "Manager")\n    .map((u) => ({\n      id: u.id,\n      label: u.employeeCode ? `${u.employeeCode} - ${u.firstName} ${u.lastName || ""}` : `${u.firstName} ${u.lastName || ""}`\n    }));')

# 6. Inputs replacement
content = content.replace('<input type="text" value={ecode} onChange={e=>setEcode(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs" placeholder="e.g. 39957-SHIVAM (GL)"/>', '<MultiSelectInput options={allUsersOptions} selectedIds={userIds} onChange={setUserIds} placeholder="Select Ecode..." />')
content = content.replace('<input type="text" value={fieldSuppBy} onChange={e=>setFieldSuppBy(e.target.value)} className="w-full border border-gray-400 px-1 py-0.5 bg-white text-xs"/>', '<MultiSelectInput options={managerOptions} selectedIds={managerIds} onChange={setManagerIds} placeholder="Select Field Support..." />')

# 7. Radio button size reduction
content = content.replace('<input type="radio" name="saleType"', '<input type="radio" className="w-3 h-3" name="saleType"')

# 8. Village Search logic
content = content.replace('{customers.map(c=><option key={c.id} value={c.id}>{c.name} - {c.mobile}</option>)}', '{customers.filter(c => !villageSearch || (c.village && c.village.toLowerCase().includes(villageSearch.toLowerCase()))).map(c=><option key={c.id} value={c.id}>{c.name} - {c.mobile}</option>)}')


with open('src/app/sales/[id]/edit/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
