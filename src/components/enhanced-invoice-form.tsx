'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Plus } from "lucide-react"
import { calculateItemTax, calculateInvoiceTotals, formatCurrency, CURRENCIES, type CurrencyCode } from "@/lib/invoice-calculator"

interface InvoiceItem {
    id: string
    description: string
    hsnCode: string
    quantity: number
    rate: number
    taxRate: number
}

interface Client {
    id: string
    companyName: string
    gstNumber: string | null
}

interface EnhancedInvoiceFormProps {
    clients: Client[]
}

export function EnhancedInvoiceForm({ clients }: EnhancedInvoiceFormProps) {
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [currency, setCurrency] = useState<CurrencyCode>('INR')
    const [taxType, setTaxType] = useState<'NONE' | 'GST' | 'VAT'>('GST')
    const [clientGstNumber, setClientGstNumber] = useState<string>('')
    const [notes, setNotes] = useState<string>('')
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18 }
    ])

    // Auto-fill client GST when client is selected
    useEffect(() => {
        if (selectedClient) {
            const client = clients.find(c => c.id === selectedClient)
            setClientGstNumber(client?.gstNumber || '')
        }
    }, [selectedClient, clients])

    // Calculate totals
    const calculatedItems = items.map(item =>
        calculateItemTax(item.quantity, item.rate, item.taxRate)
    )
    const totals = calculateInvoiceTotals(calculatedItems)

    const addItem = () => {
        setItems([...items, {
            id: Date.now().toString(),
            description: '',
            hsnCode: '',
            quantity: 1,
            rate: 0,
            taxRate: taxType === 'GST' ? 18 : taxType === 'VAT' ? 20 : 0
        }])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const invoiceData = {
            clientId: selectedClient,
            currency,
            taxType,
            clientGstNumber,
            notes,
            subtotal: totals.subtotal,
            taxAmount: totals.taxAmount,
            totalAmount: totals.total,
            items: items.map((item, index) => ({
                description: item.description,
                hsnCode: item.hsnCode,
                quantity: item.quantity,
                rate: item.rate,
                taxRate: item.taxRate,
                subtotal: calculatedItems[index].subtotal,
                taxAmount: calculatedItems[index].taxAmount,
                amount: calculatedItems[index].amount
            }))
        }

        const response = await fetch('/api/invoices/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        })

        if (response.ok) {
            const { invoiceId } = await response.json()
            window.location.href = `/dashboard/invoices/${invoiceId}`
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client and Currency */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.companyName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(CURRENCIES).map(([code, curr]) => (
                                <SelectItem key={code} value={code}>
                                    {curr.symbol} {curr.name} ({code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tax Type and Client GST */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tax Type</Label>
                    <RadioGroup value={taxType} onValueChange={(val) => setTaxType(val as typeof taxType)}>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="NONE" id="none" />
                                <Label htmlFor="none" className="font-normal">No Tax</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="GST" id="gst" />
                                <Label htmlFor="gst" className="font-normal">GST</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="VAT" id="vat" />
                                <Label htmlFor="vat" className="font-normal">VAT</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                {taxType === 'GST' && (
                    <div className="space-y-2">
                        <Label htmlFor="gst">Client GST Number</Label>
                        <Input
                            id="gst"
                            value={clientGstNumber}
                            onChange={(e) => setClientGstNumber(e.target.value)}
                            placeholder="Auto-filled from client"
                        />
                    </div>
                )}
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Invoice Items</Label>
                    <Button type="button" onClick={addItem} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 grid grid-cols-12 gap-2 text-sm font-medium">
                        <div className="col-span-3">Description</div>
                        <div className="col-span-1">HSN</div>
                        <div className="col-span-1">Qty</div>
                        <div className="col-span-2">Rate</div>
                        <div className="col-span-1">Tax%</div>
                        <div className="col-span-2">Subtotal</div>
                        <div className="col-span-1">Tax</div>
                        <div className="col-span-1"></div>
                    </div>

                    {items.map((item, index) => {
                        const calc = calculatedItems[index]
                        return (
                            <div key={item.id} className="px-4 py-3 grid grid-cols-12 gap-2 border-t items-center">
                                <div className="col-span-3">
                                    <Input
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        placeholder="Item description"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Input
                                        value={item.hsnCode}
                                        onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                                        placeholder="HSN"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Input
                                        type="number"
                                        value={item.taxRate}
                                        onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                                <div className="col-span-2 text-sm text-muted-foreground">
                                    {formatCurrency(calc.subtotal, currency)}
                                </div>
                                <div className="col-span-1 text-sm text-muted-foreground">
                                    {formatCurrency(calc.taxAmount, currency)}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(item.id)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Totals */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(totals.subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax ({taxType}):</span>
                            <span className="font-medium">{formatCurrency(totals.taxAmount, currency)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(totals.total, currency)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Invoice Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, thank you message, or any additional information..."
                    rows={4}
                />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!selectedClient || items.length === 0}>
                    Create Invoice
                </Button>
            </div>
        </form>
    )
}
