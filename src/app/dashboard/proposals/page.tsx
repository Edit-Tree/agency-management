import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/invoice-calculator"

export default async function ProposalsPage() {
    const proposals = await prisma.proposal.findMany({
        include: {
            client: { include: { user: true } },
            project: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'secondary'
            case 'SENT': return 'default'
            case 'ACCEPTED': return 'success' // You might need to define success variant or use 'default' with custom class
            case 'REJECTED': return 'destructive'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
                <Button asChild>
                    <Link href="/dashboard/proposals/new">
                        <Plus className="mr-2 h-4 w-4" /> New Proposal
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal) => (
                    <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">
                                    <Link href={`/dashboard/proposals/${proposal.id}`} className="hover:underline">
                                        {proposal.title}
                                    </Link>
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{proposal.client.companyName}</p>
                            </div>
                            <Badge variant={getStatusColor(proposal.status) as any}>
                                {proposal.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">
                                        {proposal.totalAmount
                                            ? formatCurrency(Number(proposal.totalAmount), proposal.currency as any)
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Valid Until:</span>
                                    <span>
                                        {proposal.validUntil
                                            ? new Date(proposal.validUntil).toLocaleDateString()
                                            : 'No Expiry'}
                                    </span>
                                </div>
                                {proposal.project && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Project:</span>
                                        <span className="truncate max-w-[150px]">{proposal.project.title}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {proposals.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No proposals found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
