import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { InvoiceView } from "@/components/invoice-view"
import { serializeData } from "@/lib/utils"

interface InvoiceDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function InvoiceDetailsPage({ params }: InvoiceDetailsPageProps) {
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

    const settings = await prisma.settings.findFirst()

    return (
        <div className="max-w-5xl mx-auto">
            <InvoiceView
                invoice={serializeData(invoice) as any}
                settings={serializeData(settings)}
            />
        </div>
    )
}
