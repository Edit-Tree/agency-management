'use client'

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => signOut({ callbackUrl: '/login' })}
        >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
        </Button>
    )
}
