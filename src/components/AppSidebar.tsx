import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
} from "@/components/ui/sidebar";

import {
    Users,
    ChartColumn,
    House,
    CalendarDays,
    FileCheckCorner,
    MapPin,
    Settings,
    User,
} from "lucide-react";

const menuItems = [
    { icon: House, label: "Dashboard"  },
    { icon: Users, label: "Staff Management" },
    { icon: ChartColumn, label: "Reports" },
    { icon: CalendarDays, label: "Attendance Control" },
    { icon: FileCheckCorner, label: "Leave Approvals" },
    { icon: MapPin, label: "GPS Tracking" },
    { icon: Settings, label: "Settings" },
    { icon: User, label: "Profile" },
];

export function AppSidebar() {
    return (
        <Sidebar side="right" variant="inset">

            {/* Logo */}
            <SidebarHeader className="flex items-center justify-center py-6">
                <img src="/img.png" className="w-28" />
            </SidebarHeader>

            {/* Menu */}
            <SidebarContent>
                <SidebarGroup className="px-4 space-y-2">

                    {menuItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer
                hover:bg-green-100 transition-all duration-200"
                            >
                                <Icon size={20} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                            </div>
                        );
                    })}

                </SidebarGroup>
            </SidebarContent>

        </Sidebar>
    );
}