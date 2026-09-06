import re

with open('src/app/admin/users/page.tsx', 'r') as f:
    content = f.read()

# Add clickable navigation to TableRow
old_tr = """                    <TableRow
                      key={user.id}
                      className="cursor-context-menu border-b border-slate-100/60 transition-colors select-none hover:bg-slate-50/50"
                      onContextMenu={(e) => handleContextMenu(e, user)}
                    >"""
new_tr = """                    <TableRow
                      key={user.id}
                      className="cursor-pointer border-b border-slate-100/60 transition-colors select-none hover:bg-slate-50/50"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      onContextMenu={(e) => handleContextMenu(e, user)}
                    >"""
content = content.replace(old_tr, new_tr)

with open('src/app/admin/users/page.tsx', 'w') as f:
    f.write(content)
