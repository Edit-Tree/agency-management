import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FolderKanban, FileText, Users, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardCharts } from "@/components/dashboard-charts"
import { DashboardAIInsights } from "@/components/dashboard-ai-insights"
import { RevenueCard } from "@/components/revenue-card"
import { convertToINR } from "@/lib/currency"
import { startOfMonth, format } from "date-fns"
import Link from "next/link"

import { DateRangeFilter } from "@/components/date-range-filter"

interface DashboardPageProps {
    searchParams: Promise<{
        from?: string
        to?: string
    }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'
    const isTeam = session?.user?.role === 'TEAM'
    const { from, to } = await searchParams

    const dateFilter: any = {}
    if (from || to) {
        dateFilter.createdAt = {}
        if (from) dateFilter.createdAt.gte = new Date(from)
        if (to) dateFilter.createdAt.lte = new Date(to)
    }

    // Admin metrics
    let adminMetrics = null
    let chartData = null
    let settings = null
    if (isAdmin) {
        settings = await prisma.settings.findFirst()
        const [activeProjects, draftInvoices, totalClients, invoices, projects] = await Promise.all([
            prisma.project.count({
                where: {
                    status: 'ACTIVE',
                    ...dateFilter
                }
            }),
            prisma.invoice.count({
                where: {
                    status: 'DRAFT',
                    ...dateFilter
                }
            }),
            prisma.clientProfile.count(),
            prisma.invoice.findMany({
                where: {
                    status: 'PAID',
                    ...dateFilter
                },
                select: { totalAmount: true, createdAt: true, currency: true }
            }),
            prisma.project.groupBy({
                by: ['status'],
                where: dateFilter,
                _count: true
            })
        ])

        const exchangeRates = {
            usd: settings?.usdToInrRate ? Number(settings.usdToInrRate) : 84,
            eur: settings?.eurToInrRate ? Number(settings.eurToInrRate) : 90,
            gbp: settings?.gbpToInrRate ? Number(settings.gbpToInrRate) : 105
        }

        // Helper for efficient conversion
        const convert = (amount: number, currency: string) => {
            if (!currency || currency === 'INR') return amount
            const curr = currency.toUpperCase()
            if (curr === 'USD') return amount * exchangeRates.usd
            if (curr === 'EUR') return amount * exchangeRates.eur
            if (curr === 'GBP') return amount * exchangeRates.gbp
            return amount // Default fallback
        }

        let totalRevenue = 0
        for (const inv of invoices) {
            totalRevenue += convert(Number(inv.totalAmount), inv.currency)
        }

        adminMetrics = {
            revenue: totalRevenue,
            projects: activeProjects,
            invoices: draftInvoices,
            clients: totalClients
        }

        // Prepare chart data
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - (5 - i))
            return startOfMonth(date)
        })

        const revenueData = last6Months.map(month => {
            const monthInvoices = invoices.filter(inv => {
                const invDate = new Date(inv.createdAt)
                return invDate.getMonth() === month.getMonth() &&
                    invDate.getFullYear() === month.getFullYear()
            })

            let monthRevenue = 0
            for (const inv of monthInvoices) {
                monthRevenue += convert(Number(inv.totalAmount), inv.currency)
            }

            return {
                month: format(month, 'MMM'),
                revenue: monthRevenue
            }
        })

        const allInvoices = await prisma.invoice.groupBy({
            by: ['status'],
            _count: true
        })

        const statusData = [
            { name: 'Paid', value: allInvoices.find(i => i.status === 'PAID')?._count || 0, fill: '#10b981' },
            { name: 'Sent', value: allInvoices.find(i => i.status === 'SENT')?._count || 0, fill: '#3b82f6' },
            { name: 'Draft', value: allInvoices.find(i => i.status === 'DRAFT')?._count || 0, fill: '#f59e0b' }
        ]

        const projectData = projects.map(p => ({
            name: p.status,
            count: p._count
        }))

        chartData = { revenueData, statusData }
    }

    // Team metrics
    let teamMetrics = null
    if (isTeam && session?.user?.id) {
        const [myTickets, pendingReviews, completedThisWeek, upcomingDeadlines] = await Promise.all([
            prisma.ticket.count({
                where: {
                    assignedToId: session.user.id,
                    status: { in: ['OPEN', 'IN_PROGRESS'] }
                }
            }),
            prisma.ticket.count({
                where: {
                    assignedToId: session.user.id,
                    reviewStatus: 'REQUESTED'
                }
            }),
            prisma.ticket.count({
                where: {
                    assignedToId: session.user.id,
                    status: 'DONE',
                    updatedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma.ticket.count({
                where: {
                    assignedToId: session.user.id,
                    deadline: {
                        lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                        gte: new Date()
                    }
                }
            })
        ])

        teamMetrics = {
            active: myTickets,
            reviews: pendingReviews,
            completed: completedThisWeek,
            deadlines: upcomingDeadlines
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                </h1>
                {isAdmin && <DateRangeFilter />}
            </div>

            {isAdmin && adminMetrics && (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Link href="/dashboard/revenue">
                            <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{adminMetrics.revenue.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">From paid invoices • Click for details</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/projects?status=ACTIVE">
                            <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{adminMetrics.projects}</div>
                                    <p className="text-xs text-muted-foreground">Currently in progress</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/invoices?status=DRAFT">
                            <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{adminMetrics.invoices}</div>
                                    <p className="text-xs text-muted-foreground">Need to review</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/clients">
                            <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{adminMetrics.clients}</div>
                                    <p className="text-xs text-muted-foreground">Active client accounts</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {chartData && (
                        <>
                            <DashboardCharts
                                revenueData={chartData.revenueData}
                                statusData={chartData.statusData}
                            />
                            <DashboardAIInsights
                                currentRevenue={adminMetrics.revenue}
                                currentProjects={adminMetrics.projects}
                            />
                        </>
                    )}
                </>
            )}

            {isTeam && teamMetrics && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Active Tickets</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teamMetrics.active}</div>
                            <p className="text-xs text-muted-foreground">Currently working on</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teamMetrics.reviews}</div>
                            <p className="text-xs text-muted-foreground">Awaiting client approval</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teamMetrics.completed}</div>
                            <p className="text-xs text-muted-foreground">Great progress!</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teamMetrics.deadlines}</div>
                            <p className="text-xs text-muted-foreground">Due in next 3 days</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
