import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileSignature } from "lucide-react"
import Link from "next/link"

export default async function ContractsPage() {
    const contracts = await prisma.contract.findMany({
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
            case 'SIGNED': return 'success'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
                <Button asChild>
                    <Link href="/dashboard/contracts/new">
                        <Plus className="mr-2 h-4 w-4" /> New Contract
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contracts.map((contract) => (
                    <Card key={contract.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">
                                    <Link href={`/dashboard/contracts/${contract.id}`} className="hover:underline">
                                        {contract.title}
                                    </Link>
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{contract.client.companyName}</p>
                            </div>
                            <Badge variant={getStatusColor(contract.status) as any}>
                                {contract.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                                </div>
                                {contract.signedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Signed:</span>
                                        <span className="text-green-600">{new Date(contract.signedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {contract.project && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Project:</span>
                                        <span className="truncate max-w-[150px]">{contract.project.title}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {contracts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <FileSignature className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No contracts found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
