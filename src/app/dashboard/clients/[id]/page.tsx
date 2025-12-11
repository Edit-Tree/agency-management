import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Phone, MapPin, FileText, Receipt, Edit, ExternalLink, Plus, Check, Users } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const client = await prisma.clientProfile.findUnique({
        where: { id },
        include: {
            user: true,
            projects: {
                include: {
                    tickets: {
                        where: { status: { not: 'DONE' } },
                        include: { assignedTo: true },
                        orderBy: { updatedAt: 'desc' }
                    },
                    _count: {
                        select: { tickets: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            invoices: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!client) {
        notFound()
    }

    const activeProjects = client.projects.filter(p => p.status === 'ACTIVE')
    const completedProjects = client.projects.filter(p => p.status === 'COMPLETED')

    // Financials
    const paidInvoices = client.invoices.filter(inv => inv.status === 'PAID')
    const pendingInvoices = client.invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'DRAFT')

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0)

    // Flatten active tickets from all projects
    const allActiveTickets = client.projects.flatMap(p => p.tickets.map(t => ({ ...t, projectTitle: p.title })))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return (
        <div className="space-y-8">
            {/* Header with Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-primary" />
                        {client.companyName}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.user.email}</span>
                        {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>}
                        {client.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.address}</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/clients/${client.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background border-blue-100 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Revenue</CardTitle>
                        <Receipt className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400">Lifetime earnings</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-background border-amber-100 dark:border-amber-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Pending Payments</CardTitle>
                        <Receipt className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(pendingAmount)}
                        </div>
                        <p className="text-xs text-amber-600/80 dark:text-amber-400">{pendingInvoices.length} invoices pending</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProjects.length}</div>
                        <p className="text-xs text-muted-foreground">out of {client.projects.length} total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allActiveTickets.length}</div>
                        <p className="text-xs text-muted-foreground">across all projects</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content Column (Projects & Tasks) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Active Projects */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeProjects.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No active projects</p>
                            ) : (
                                <div className="space-y-4">
                                    {activeProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/dashboard/projects/${project.id}`}
                                            className="block p-4 border rounded-lg hover:bg-accent transition-colors group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                        {project.description || 'No description'}
                                                    </p>
                                                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" /> {project._count.tickets} tickets
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Check className="h-3 w-3" /> Updated {format(new Date(project.updatedAt), 'MMM d')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge>Active</Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Active Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Active Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {allActiveTickets.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No active tasks</p>
                            ) : (
                                <div className="space-y-3">
                                    {allActiveTickets.slice(0, 5).map((ticket) => (
                                        <Link
                                            key={ticket.id}
                                            href={`/dashboard/projects/${ticket.projectId}/tickets/${ticket.id}`}
                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-red-500' :
                                                    ticket.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                                                        ticket.status === 'REVIEW' ? 'bg-blue-500' : 'bg-green-500'
                                                    }`} />
                                                <div>
                                                    <p className="font-medium text-sm">{ticket.title}</p>
                                                    <p className="text-xs text-muted-foreground">{ticket.projectTitle}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {ticket.assignedTo && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {ticket.assignedTo.name?.split(' ')[0]}
                                                    </Badge>
                                                )}
                                                <Badge variant="secondary" className="text-xs">{ticket.status}</Badge>
                                            </div>
                                        </Link>
                                    ))}
                                    {allActiveTickets.length > 5 && (
                                        <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                            View all {allActiveTickets.length} tasks
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Info & Invoices) */}
                <div className="space-y-6">
                    {/* Quick Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Client Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {client.knowledgeBaseUrl ? (
                                <a href={client.knowledgeBaseUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors text-sm">
                                    <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Knowledge Base</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                            ) : (
                                <p className="text-sm text-muted-foreground italic p-2">No knowledge base linked</p>
                            )}
                            {client.brandingKitUrl ? (
                                <a href={client.brandingKitUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors text-sm">
                                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Branding Kit</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                            ) : (
                                <p className="text-sm text-muted-foreground italic p-2">No branding kit linked</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Invoices */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
                            <Link href={`/dashboard/invoices?clientId=${client.id}`} className="text-xs text-primary hover:underline">View All</Link>
                        </CardHeader>
                        <CardContent>
                            {client.invoices.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4 text-sm">No invoices</p>
                            ) : (
                                <div className="space-y-3">
                                    {client.invoices.slice(0, 5).map((invoice) => (
                                        <Link
                                            key={invoice.id}
                                            href={`/dashboard/invoices/${invoice.id}`}
                                            className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {invoice.invoiceNumber ? `INV-${invoice.invoiceNumber}` : `PRO-${invoice.proformaNumber || 'DRAFT'}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-sm">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(Number(invoice.totalAmount))}
                                                </p>
                                                <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Business Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Business Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">GST Number</p>
                                <p className="font-medium">{client.gstNumber || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Billing Address</p>
                                <p className="font-medium">{client.billingAddress || 'Not provided'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
