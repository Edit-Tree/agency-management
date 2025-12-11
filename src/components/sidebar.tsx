"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, Building2, Users, Receipt, Settings, FileText, FileSignature } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface SidebarProps {
    userRole?: string
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname()
    const isAdmin = userRole === 'ADMIN'

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true
        if (path !== '/dashboard' && pathname?.startsWith(path)) return true
        return false
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    ]

    const adminItems = [
        { href: "/dashboard/clients", label: "Clients", icon: Building2 },
        { href: "/dashboard/users", label: "Users", icon: Users },
        { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
        { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
        { href: "/dashboard/contracts", label: "Contracts", icon: FileSignature },
    ]

    const items = [...navItems, ...(isAdmin ? adminItems : []), { href: "/dashboard/settings", label: "Settings", icon: Settings }]

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
            <div className="flex flex-col gap-3 px-2 pt-6 mb-6">
                <div className="flex items-center gap-2 font-bold text-xl px-2">
                    <img src="/logo.png" alt="Edit Tree" className="h-8 w-auto dark:hidden" />
                    <img src="/logo-dark.png" alt="Edit Tree" className="h-8 w-auto hidden dark:block" />
                </div>
                <div className="flex px-2">
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {userRole}
                    </span>
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-4 py-2 rounded-md transition-colors",
                            isActive(item.href)
                                ? "bg-gray-100 dark:bg-gray-700 text-primary font-medium"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                    >
                        <item.icon className={cn("mr-3 h-5 w-5", isActive(item.href) ? "text-primary" : "text-muted-foreground")} strokeWidth={2} />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <LogoutButton />
                <ThemeToggle />
            </div>
        </aside>
    )
}
