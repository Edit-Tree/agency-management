import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { InvoiceView } from "@/components/invoice-view"

interface PortalInvoiceDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PortalInvoiceDetailsPage({ params }: PortalInvoiceDetailsPageProps) {
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            client: {
                include: {
                    user: true
                }
            },
            items: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    })

    if (!invoice) {
        notFound()
    }

    // Serialize Decimal fields
    const serializedInvoice = {
        ...invoice,
        totalAmount: Number(invoice.totalAmount),
        items: invoice.items.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            amount: Number(item.amount)
        }))
    }

    return (
        <div className="max-w-5xl mx-auto">
            <InvoiceView invoice={serializedInvoice as any} />
        </div>
    )
}
