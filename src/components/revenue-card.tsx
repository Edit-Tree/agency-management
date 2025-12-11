'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { CurrencyRateDialog } from "./currency-rate-dialog"
import { updateExchangeRates } from "@/app/actions/currency"
import { toast } from "sonner"

interface RevenueCardProps {
    revenue: number
    exchangeRates: {
        usdToInrRate: number
        eurToInrRate: number
        gbpToInrRate: number
    }
}

export function RevenueCard({ revenue, exchangeRates }: RevenueCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const router = useRouter()

    const handleSaveRates = async (rates: { usdToInrRate: number; eurToInrRate: number; gbpToInrRate: number }) => {
        try {
            const result = await updateExchangeRates(rates.usdToInrRate, rates.eurToInrRate, rates.gbpToInrRate)
            if (result.success) {
                toast.success('Exchange rates updated successfully')
                router.refresh() // Refresh to get recalculated revenue
            } else {
                toast.error(result.error || 'Failed to update rates')
            }
        } catch (error) {
            console.error('Error updating rates:', error)
            toast.error('An error occurred while updating rates')
        }
    }

    return (
        <>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setDialogOpen(true)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">From paid invoices • Click to manage rates</p>
                </CardContent>
            </Card>
            <CurrencyRateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                currentRates={exchangeRates}
                onSave={handleSaveRates}
            />
        </>
    )
}
