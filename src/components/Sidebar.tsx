import { useState } from "react";
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  BarChart3,
  CheckSquare,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#", current: true },
  { name: "Budget Input", icon: PlusCircle, href: "#", current: false },
  { name: "Review & Approval", icon: CheckSquare, href: "#", current: false },
  { name: "Reports", icon: BarChart3, href: "#", current: false },
  { name: "Departments", icon: Building2, href: "#", current: false },
  { name: "Data Management", icon: FileSpreadsheet, href: "#", current: false },
  { name: "User Management", icon: Users, href: "#", current: false },
  { name: "Settings", icon: Settings, href: "#", current: false },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                variant={item.current ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}