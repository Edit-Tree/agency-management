import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"

import { GenerateInvoiceButton } from "@/components/generate-invoice-button"

interface InvoicesPageProps {
    searchParams: Promise<{
        status?: string
    }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
    const { status } = await searchParams
    const where: any = {}

    if (status) {
        where.status = status
    }

    const invoices = await prisma.invoice.findMany({
        where,
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/invoices/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Link>
                    </Button>
                    <GenerateInvoiceButton />
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No invoices found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Generate a month-end invoice to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {invoice.client.companyName}
                                </CardTitle>
                                <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                                    {invoice.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4" />
                                            {invoice.invoiceNumber
                                                ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
                                                : invoice.proformaNumber
                                                    ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
                                                    : 'DRAFT'}
                                        </div>
                                        <div className="mt-1">
                                            {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">
                                            {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{invoice._count.items} items</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/dashboard/invoices/${invoice.id}`}>
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
