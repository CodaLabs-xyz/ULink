"use client"

import { LayoutDashboard, Users, CreditCard, BarChart3, Wrench, Siren, FileText, Settings, Shield } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const menuItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/admin/alerts", label: "Alerts", icon: Siren },
  { href: "/admin/reports", label: "Reports", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-silver-200">
        <div className="flex items-center gap-2 p-2">
          <Shield className="h-8 w-8 text-primary-600" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold font-display text-text-primary">ULink Admin</h2>
            <p className="text-xs text-text-secondary">System Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/settings"} tooltip="Settings">
              <a href="/admin/settings">
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
