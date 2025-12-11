"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Settings } from "lucide-react"
import { CurrencyRateDialog } from "@/components/currency-rate-dialog"
import { updateExchangeRates } from "@/app/actions/currency"
import { toast } from "sonner"

interface RevenuePageProps {
    invoices: any[]
    totalRevenue: number
    exchangeRates: {
        usdToInrRate: number
        eurToInrRate: number
        gbpToInrRate: number
    }
}

export function RevenueClient({ invoices, totalRevenue, exchangeRates }: RevenuePageProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const router = useRouter()

    const handleSaveRates = async (rates: { usdToInrRate: number; eurToInrRate: number; gbpToInrRate: number }) => {
        try {
            const result = await updateExchangeRates(rates.usdToInrRate, rates.eurToInrRate, rates.gbpToInrRate)
            if (result.success) {
                toast.success('Exchange rates updated successfully')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update rates')
            }
        } catch (error) {
            console.error('Error updating rates:', error)
            toast.error('An error occurred while updating rates')
        }
    }

    const getRate = (currency: string) => {
        if (!currency || currency === 'INR') return 1
        const curr = currency.toUpperCase()
        if (curr === 'USD') return exchangeRates.usdToInrRate
        if (curr === 'EUR') return exchangeRates.eurToInrRate
        if (curr === 'GBP') return exchangeRates.gbpToInrRate
        return 1
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Revenue Breakdown</h1>
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Exchange Rates
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-green-600">
                        {formatCurrency(totalRevenue, 'INR')}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Calculated based on current exchange rates
                    </p>
                </CardContent>
            </Card>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Original Amount</TableHead>
                            <TableHead className="text-right">Exchange Rate</TableHead>
                            <TableHead className="text-right">Converted (INR)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => {
                            const rate = getRate(invoice.currency)
                            const convertedAmount = Number(invoice.totalAmount) * rate

                            return (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">
                                        {invoice.invoiceNumber
                                            ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>{invoice.client.companyName}</TableCell>
                                    <TableCell>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {invoice.currency === 'INR' ? '-' : `₹${rate}`}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(convertedAmount, 'INR')}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <CurrencyRateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                currentRates={exchangeRates}
                onSave={handleSaveRates}
            />
        </div>
    )
}
