import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RevenueClient } from "@/components/revenue-client"

export default async function RevenuePage() {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const settings = await prisma.settings.findFirst()
    const exchangeRates = {
        usdToInrRate: settings?.usdToInrRate ? Number(settings.usdToInrRate) : 84,
        eurToInrRate: settings?.eurToInrRate ? Number(settings.eurToInrRate) : 90,
        gbpToInrRate: settings?.gbpToInrRate ? Number(settings.gbpToInrRate) : 105
    }

    const invoices = await prisma.invoice.findMany({
        where: { status: 'PAID' },
        include: { client: true },
        orderBy: { createdAt: 'desc' }
    })

    // Calculate total on server to pass down
    let totalRevenue = 0
    for (const inv of invoices) {
        const amount = Number(inv.totalAmount)
        const currency = inv.currency

        let rate = 1
        if (currency === 'USD') rate = exchangeRates.usdToInrRate
        if (currency === 'EUR') rate = exchangeRates.eurToInrRate
        if (currency === 'GBP') rate = exchangeRates.gbpToInrRate

        totalRevenue += amount * rate
    }

    // Serialize data to avoid Decimal errors
    const serializedInvoices = invoices.map(inv => ({
        ...inv,
        totalAmount: Number(inv.totalAmount),
        taxRate: inv.taxRate ? Number(inv.taxRate) : null,
        subtotal: Number(inv.subtotal),
        taxAmount: Number(inv.taxAmount),
    }))

    return (
        <RevenueClient
            invoices={serializedInvoices}
            totalRevenue={totalRevenue}
            exchangeRates={exchangeRates}
        />
    )
}
