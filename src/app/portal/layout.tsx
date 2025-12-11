import Link from "next/link"
import { LayoutDashboard, FileText, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Client Portal</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/portal" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Overview
                    </Link>
                    <Link href="/portal/projects" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
                        <FileText className="mr-3 h-5 w-5" />
                        My Projects
                    </Link>
                    <Link href="/portal/invoices" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors">
                        <FileText className="mr-3 h-5 w-5" />
                        Invoices
                    </Link>
                    <div className="pt-4">
                        <Button asChild className="w-full justify-start" variant="default">
                            <Link href="/portal/tickets/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Raise Ticket
                            </Link>
                        </Button>
                    </div>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
