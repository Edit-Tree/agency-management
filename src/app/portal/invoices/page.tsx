import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function PortalInvoicesPage() {
    // This would be filtered by client in a real implementation
    const invoices = await prisma.invoice.findMany({
        include: {
            client: true,
            _count: {
                select: { items: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>

            {invoices.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No invoices yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">Your invoices will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {invoice.invoiceNumber
                                        ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
                                        : invoice.proformaNumber
                                            ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
                                            : 'DRAFT'}
                                </CardTitle>
                                <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                                    {invoice.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-sm text-muted-foreground">
                                        <div>{invoice._count.items} items</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">${Number(invoice.totalAmount).toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/portal/invoices/${invoice.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
