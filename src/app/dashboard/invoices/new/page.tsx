import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedInvoiceForm } from "@/components/enhanced-invoice-form"

export default async function NewInvoicePage() {
    const clients = await prisma.clientProfile.findMany({
        select: {
            id: true,
            companyName: true,
            gstNumber: true
        },
        orderBy: { companyName: 'asc' }
    })

    return (
        <div className="max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                    <EnhancedInvoiceForm clients={clients} />
                </CardContent>
            </Card>
        </div>
    )
}
