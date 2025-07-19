import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Settings, 
  BarChart3,
  CheckSquare,
  Building2,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import sidebarBackground from "@/assets/sidebar-background.png";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Budget Input", url: "/budget-input", icon: PlusCircle },
  { title: "Review & Approval", url: "/review-approval", icon: CheckSquare },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "User Management", url: "/users", icon: Users },
];

const settingsItem = { title: "Settings", url: "/settings", icon: Settings };

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar 
      className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ${
        state === "collapsed" ? "w-14 -translate-x-0" : "w-60 sm:w-60 w-48 -translate-x-0"
      }`}
      style={{
        backgroundImage: `url(${sidebarBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'soft-light'
      }}
    >
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-base">Frugal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span className="text-base">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="flex-1" />
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={settingsItem.url} 
                    end 
                    className={getNavCls({ isActive: isActive(settingsItem.url) })}
                  >
                    <settingsItem.icon className="h-4 w-4" />
                    {state !== "collapsed" && <span className="text-base">{settingsItem.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}