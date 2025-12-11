import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, FileText, Check, X } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { ProposalActions } from "@/components/proposal-actions"

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/login')
    }

    const { id } = await params
    const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
            client: { include: { user: true } },
            project: true
        }
    })

    if (!proposal) {
        notFound()
    }

    const content = proposal.content as any
    const items = content?.items || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/proposals">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{proposal.title}</h1>
                        <p className="text-muted-foreground">
                            For {proposal.client.companyName} • Created on {proposal.createdAt.toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ProposalActions proposalId={proposal.id} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Scope of Work */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Scope of Work</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {content?.scope ? (
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {content.scope}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">No scope defined.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Deliverables</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Description</th>
                                            <th className="p-3 text-right font-medium w-[150px]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: any, index: number) => (
                                            <tr key={index} className="border-b last:border-0">
                                                <td className="p-3">{item.description}</td>
                                                <td className="p-3 text-right">
                                                    {formatCurrency(item.amount, proposal.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/50 font-medium">
                                            <td className="p-3">Total</td>
                                            <td className="p-3 text-right">
                                                {formatCurrency(Number(proposal.totalAmount) || 0, proposal.currency)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Current Status</span>
                                    <Badge variant={
                                        proposal.status === 'ACCEPTED' ? 'default' :
                                            proposal.status === 'REJECTED' ? 'destructive' :
                                                proposal.status === 'SENT' ? 'secondary' : 'outline'
                                    }>
                                        {proposal.status}
                                    </Badge>
                                </div>
                                {proposal.validUntil && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Valid Until</span>
                                        <span className="text-sm text-muted-foreground">
                                            {proposal.validUntil.toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="font-medium">{proposal.client.companyName}</p>
                                <p className="text-sm text-muted-foreground">{proposal.client.user.name}</p>
                                <p className="text-sm text-muted-foreground">{proposal.client.user.email}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
