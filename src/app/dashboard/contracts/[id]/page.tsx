import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, PenTool } from "lucide-react"
import Link from "next/link"

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/login')
    }

    const { id } = await params
    const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
            client: { include: { user: true } },
            project: true
        }
    })

    if (!contract) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/contracts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
                        <p className="text-muted-foreground">
                            For {contract.client.companyName} • Created on {contract.createdAt.toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Client
                    </Button>
                    <Button>
                        <PenTool className="mr-2 h-4 w-4" />
                        Sign Contract
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Contract Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: contract.content || "" }}
                            />
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
                                        contract.status === 'SIGNED' ? 'default' :
                                            contract.status === 'SENT' ? 'secondary' : 'outline'
                                    }>
                                        {contract.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Signed by Client</span>
                                    <Badge variant={contract.signedByClient ? "default" : "destructive"}>
                                        {contract.signedByClient ? "Yes" : "No"}
                                    </Badge>
                                </div>
                                {contract.signedAt && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Signed At</span>
                                        <span className="text-sm text-muted-foreground">
                                            {contract.signedAt.toLocaleDateString()}
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
                                <p className="font-medium">{contract.client.companyName}</p>
                                <p className="text-sm text-muted-foreground">{contract.client.user.name}</p>
                                <p className="text-sm text-muted-foreground">{contract.client.user.email}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
