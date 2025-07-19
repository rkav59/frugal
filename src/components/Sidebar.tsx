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
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", current: true },
  { name: "Budget Input", icon: PlusCircle, href: "/budget-input", current: false },
  { name: "Review & Approval", icon: CheckSquare, href: "/review-approval", current: false },
  { name: "Reports", icon: BarChart3, href: "/reports", current: false },
  { name: "Departments", icon: Building2, href: "/departments", current: false },
  { name: "Data Management", icon: FileSpreadsheet, href: "#", current: false },
  { name: "User Management", icon: Users, href: "/users", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "px-2"
                )}
                asChild
              >
                <Link to={item.href}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}