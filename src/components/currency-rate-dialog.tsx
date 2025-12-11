'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Euro, Banknote } from "lucide-react"

interface CurrencyRateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRates: {
        usdToInrRate: number
        eurToInrRate: number
        gbpToInrRate: number
    }
    onSave: (rates: { usdToInrRate: number; eurToInrRate: number; gbpToInrRate: number }) => Promise<void>
}

export function CurrencyRateDialog({ open, onOpenChange, currentRates, onSave }: CurrencyRateDialogProps) {
    const [usdRate, setUsdRate] = useState(String(currentRates.usdToInrRate))
    const [eurRate, setEurRate] = useState(String(currentRates.eurToInrRate))
    const [gbpRate, setGbpRate] = useState(String(currentRates.gbpToInrRate))
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            await onSave({
                usdToInrRate: Number(usdRate),
                eurToInrRate: Number(eurRate),
                gbpToInrRate: Number(gbpRate)
            })
            onOpenChange(false)
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Currency Exchange Rates</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Set the conversion rates to INR for accurate revenue calculations
                    </p>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="usdRate" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            1 USD = ? INR
                        </Label>
                        <Input
                            id="usdRate"
                            type="number"
                            step="0.01"
                            value={usdRate}
                            onChange={(e) => setUsdRate(e.target.value)}
                            placeholder="84.00"
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="eurRate" className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-blue-600" />
                            1 EUR = ? INR
                        </Label>
                        <Input
                            id="eurRate"
                            type="number"
                            step="0.01"
                            value={eurRate}
                            onChange={(e) => setEurRate(e.target.value)}
                            placeholder="90.00"
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gbpRate" className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-purple-600" />
                            1 GBP = ? INR
                        </Label>
                        <Input
                            id="gbpRate"
                            type="number"
                            step="0.01"
                            value={gbpRate}
                            onChange={(e) => setGbpRate(e.target.value)}
                            placeholder="105.00"
                            className="font-mono"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Rates'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
