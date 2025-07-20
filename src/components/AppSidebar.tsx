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
import { Separator } from "@/components/ui/separator";


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
      className={`${state === "collapsed" ? "w-14" : "w-60 sm:w-60 w-48"} bg-sidebar border-sidebar-border`}
    >
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <div className="flex items-center p-4 space-x-3">
            <div className="logo-icon w-8 h-8 flex-shrink-0" dangerouslySetInnerHTML={{
              __html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`
            }} />
            {state !== "collapsed" && (
              <span className="text-lg font-bold text-sidebar-foreground">Frugal</span>
            )}
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {mainItems.map((item, index) => (
                <div key={item.title}>
                  <SidebarMenuItem>
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
                  {item.title === "Departments" && (
                    <Separator className="my-2" />
                  )}
                </div>
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