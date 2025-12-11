import Link from "next/link"
import { LayoutDashboard, FolderKanban, Building2, Users, Receipt, Settings, FileText, FileSignature } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Image from "next/image"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="flex flex-col gap-3 px-2 pt-6 mb-6">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <img src="/logo.png" alt="Edit Tree" className="h-8 w-auto dark:hidden" />
                        <img src="/logo-dark.png" alt="Edit Tree" className="h-8 w-auto hidden dark:block" />
                    </div>
                    <div className="flex">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {session?.user?.role}
                        </span>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <LayoutDashboard className="mr-3 h-5 w-5" strokeWidth={2} />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/projects" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <FolderKanban className="mr-3 h-5 w-5" strokeWidth={2} />
                        Projects
                    </Link>
                    {isAdmin && (
                        <>
                            <Link href="/dashboard/clients" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <Building2 className="mr-3 h-5 w-5" strokeWidth={2} />
                                Clients
                            </Link>
                            <Link href="/dashboard/users" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <Users className="mr-3 h-5 w-5" strokeWidth={2} />
                                Users
                            </Link>
                            <Link href="/dashboard/invoices" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <Receipt className="mr-3 h-5 w-5" strokeWidth={2} />
                                Invoices
                            </Link>
                            <Link href="/dashboard/proposals" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <FileText className="mr-3 h-5 w-5" strokeWidth={2} />
                                Proposals
                            </Link>
                            <Link href="/dashboard/contracts" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <FileSignature className="mr-3 h-5 w-5" strokeWidth={2} />
                                Contracts
                            </Link>
                        </>
                    )}
                    <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <Settings className="mr-3 h-5 w-5" strokeWidth={2} />
                        Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <LogoutButton />
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
