import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 font-sans">
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Edit Tree Logo" className="h-12 w-auto dark:hidden" />
          <img src="/logo-dark.png" alt="Edit Tree Logo" className="h-12 w-auto hidden dark:block" />
        </div>
        <nav className="flex gap-4">
          <Link href="/api/auth/signin" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="max-w-5xl space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Manage Projects & Invoices <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A dual-interface platform for teams to track work and for clients to stay updated.
            Automated month-end invoicing included.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
            <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Link href="/dashboard">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Team Login
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:-translate-y-1">
              <Link href="/portal">
                <Users className="mr-2 h-5 w-5" />
                Client Portal
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} EditTree PM System. All rights reserved.</p>
        <p className="mt-2 text-xs">Think | Design | Deliver</p>
      </footer>
    </div>
  )
}
