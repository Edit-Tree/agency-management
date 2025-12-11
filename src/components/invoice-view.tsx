'use client'

import { useState } from "react"
import { InvoiceStatus, ClientProfile, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Download, Mail, FileText, DollarSign, Plus, Edit, Trash2, Check } from "lucide-react"
import { shareProforma, sendInvoiceEmail, markAsPaid } from "@/app/actions/invoice-workflow"
import { addInvoiceItem, updateInvoiceItem, deleteInvoiceItem } from "@/app/actions/invoice-items"
import { sendInvoiceEmailAction, sendPaymentReminderAction } from "@/app/actions/invoice-emails"

import { formatCurrency, type CurrencyCode } from "@/lib/invoice-calculator"
import { PaymentButton } from "@/components/payment-button"

interface SerializedInvoiceItem {
    id: string
    invoiceId: string
    description: string
    hsnCode: string | null
    quantity: number
    rate: number
    taxRate: number
    subtotal: number
    taxAmount: number
    amount: number
    createdAt: Date
    ticketId: string | null
}

interface SerializedInvoice {
    id: string
    clientId: string
    status: InvoiceStatus
    proformaNumber: number | null
    invoiceNumber: number | null
    currency: string
    taxType: string | null
    taxRate: number | null
    clientGstNumber: string | null
    subtotal: number
    taxAmount: number
    totalAmount: number
    paidDate: Date | null
    paymentMethod: string | null
    paymentNotes: string | null
    notes: string | null
    razorpayOrderId: string | null
    razorpayPaymentId: string | null
    razorpaySignature: string | null
    proformaDate: Date | null
    issueDate: Date | null
    createdAt: Date
    updatedAt: Date
    client: ClientProfile & { user: User }
    items: SerializedInvoiceItem[]
}

interface InvoiceViewProps {
    invoice: SerializedInvoice
    settings?: any // Using any to avoid complex type duplication, but ideally should be Settings type
}

export function InvoiceView({ invoice: initialInvoice, settings }: InvoiceViewProps) {
    const [invoice, setInvoice] = useState(initialInvoice)
    const [loading, setLoading] = useState(false)
    const [editingItem, setEditingItem] = useState<SerializedInvoiceItem | null>(null)

    const isEditable = invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.PROFORMA
    const isPaid = invoice.status === InvoiceStatus.PAID
    const currency = (invoice.currency || 'INR') as CurrencyCode

    const handleShareProforma = async () => {
        if (!confirm("Share this invoice as a proforma?")) return
        setLoading(true)
        const result = await shareProforma(invoice.id)
        if (result.success) {
            alert(`Proforma PRO-${String(result.proformaNumber).padStart(3, '0')} created!`)
            window.location.reload()
        }
        setLoading(false)
    }

    const handleSendEmail = async () => {
        if (!confirm(`Send invoice to ${invoice.client.user.email}?`)) return
        setLoading(true)
        const result = await sendInvoiceEmail(invoice.id)
        if (result.success) {
            alert(`Email sent to ${result.email}`)
            window.location.reload()
        }
        setLoading(false)
    }

    const handleMarkPaid = async (formData: FormData) => {
        setLoading(true)
        const result = await markAsPaid(invoice.id, formData)
        if (result.error) {
            alert(`Error: ${result.error}`)
        } else if (result.success) {
            alert(`Invoice INV-${String(result.invoiceNumber).padStart(3, '0')} created!`)
            window.location.reload()
        }
        setLoading(false)
    }

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Delete this item?")) return
        setLoading(true)
        await deleteInvoiceItem(itemId)
        window.location.reload()
    }

    const getInvoiceNumber = () => {
        if (invoice.invoiceNumber) {
            return `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
        }
        if (invoice.proformaNumber) {
            return `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
        }
        return 'DRAFT'
    }

    const getStatusColor = () => {
        switch (invoice.status) {
            case InvoiceStatus.DRAFT: return 'secondary'
            case InvoiceStatus.PROFORMA: return 'default'
            case InvoiceStatus.SENT: return 'outline'
            case InvoiceStatus.PAID: return 'default'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6 print:space-y-0">
            <style jsx global>{`
                @media print {
                    @page { margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-break-inside-avoid { break-inside: avoid; }
                    .print-shadow-none { box-shadow: none !important; border: none !important; }
                }
            `}</style>

            {/* Action Buttons */}
            <div className="flex justify-between items-center no-print">
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    {(invoice.status === InvoiceStatus.PROFORMA || invoice.status === InvoiceStatus.SENT) && (
                        <>
                            <Button variant="outline" onClick={async () => {
                                setLoading(true)
                                const result = await sendInvoiceEmailAction(invoice.id)
                                if (result.success) {
                                    alert(`Invoice emailed to ${result.email}`)
                                } else {
                                    alert(`Error: ${result.error}`)
                                }
                                setLoading(false)
                            }} disabled={loading}>
                                <Mail className="mr-2 h-4 w-4" /> Email Invoice
                            </Button>
                            <Button variant="outline" onClick={async () => {
                                if (!confirm('Send payment reminder to client?')) return
                                setLoading(true)
                                const result = await sendPaymentReminderAction(invoice.id)
                                if (result.success) {
                                    alert(`Reminder sent to ${result.email}`)
                                } else {
                                    alert(`Error: ${result.error}`)
                                }
                                setLoading(false)
                            }} disabled={loading}>
                                <Mail className="mr-2 h-4 w-4" /> Send Reminder
                            </Button>
                            {invoice.status === InvoiceStatus.SENT && (
                                <PaymentButton
                                    invoiceId={invoice.id}
                                    amount={invoice.totalAmount}
                                    currency={invoice.currency}
                                    razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}
                                />
                            )}
                        </>
                    )}
                </div>
                <div className="space-x-2">
                    {invoice.status === InvoiceStatus.DRAFT && (
                        <Button onClick={handleShareProforma} disabled={loading}>
                            <FileText className="mr-2 h-4 w-4" /> Share Proforma
                        </Button>
                    )}
                    {(invoice.status === InvoiceStatus.PROFORMA || invoice.status === InvoiceStatus.SENT) && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button disabled={loading}>
                                    <DollarSign className="mr-2 h-4 w-4" /> Mark as Paid
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Mark Invoice as Paid</DialogTitle>
                                </DialogHeader>
                                <form action={handleMarkPaid} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paidDate">Payment Date</Label>
                                        <Input id="paidDate" name="paidDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod">Payment Method</Label>
                                        <Input id="paymentMethod" name="paymentMethod" placeholder="e.g. Bank Transfer, Credit Card" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentNotes">Notes</Label>
                                        <Textarea id="paymentNotes" name="paymentNotes" placeholder="Optional payment notes..." />
                                    </div>
                                    <Button type="submit" className="w-full">Confirm Payment</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Invoice Display */}
            <Card className="print-shadow-none">
                <CardHeader className="border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl mb-2">INVOICE</CardTitle>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-semibold">{getInvoiceNumber()}</p>
                                <Badge variant={getStatusColor() as any} className="no-print">{invoice.status}</Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold mb-1 text-muted-foreground uppercase text-xs tracking-wider">Billing From:</h3>
                            <h2 className="font-semibold text-lg">{settings?.companyName || 'Antigravity Agency'}</h2>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{settings?.companyAddress || '123 Creative St\nDesign City, DC 10101'}</p>
                            {settings?.companyGst && (
                                <p className="text-sm text-muted-foreground mt-1">GST: {settings.companyGst}</p>
                            )}
                            {settings?.companyEmail && (
                                <p className="text-sm text-muted-foreground">{settings.companyEmail}</p>
                            )}
                            {settings?.companyPhone && (
                                <p className="text-sm text-muted-foreground">{settings.companyPhone}</p>
                            )}
                            {settings?.companyWebsite && (
                                <p className="text-sm text-muted-foreground">{settings.companyWebsite}</p>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Client & Date Info */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-2">Bill To:</h3>
                            <p className="font-medium">{invoice.client.companyName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.client.user.email}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.client.billingAddress}</p>
                            {invoice.client.gstNumber && (
                                <p className="text-sm text-muted-foreground mt-1">GST Number: {invoice.client.gstNumber}</p>
                            )}
                        </div>
                        <div className="text-right space-y-1">
                            {invoice.proformaDate && (
                                <div className="flex justify-end gap-4">
                                    <span className="text-muted-foreground">Proforma Date:</span>
                                    <span>{new Date(invoice.proformaDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {invoice.issueDate && (
                                <div className="flex justify-end gap-4">
                                    <span className="text-muted-foreground">Issue Date:</span>
                                    <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {invoice.paidDate && (
                                <div className="flex justify-end gap-4">
                                    <span className="text-muted-foreground">Paid Date:</span>
                                    <span className="text-green-600 font-medium">{new Date(invoice.paidDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="print-break-inside-avoid">
                        <div className="flex justify-between items-center mb-4 no-print">
                            <h3 className="font-semibold">Line Items</h3>
                            {isEditable && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Plus className="mr-2 h-4 w-4" /> Add Item
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Line Item</DialogTitle>
                                        </DialogHeader>
                                        <form action={async (formData) => {
                                            await addInvoiceItem(invoice.id, formData)
                                            window.location.reload()
                                        }} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input id="description" name="description" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="quantity">Quantity</Label>
                                                    <Input id="quantity" name="quantity" type="number" step="0.01" defaultValue="1" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="rate">Rate</Label>
                                                    <Input id="rate" name="rate" type="number" step="0.01" required />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full">Add Item</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    {invoice.taxType && invoice.taxType !== 'NONE' && <TableHead>HSN</TableHead>}
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    {invoice.taxType && invoice.taxType !== 'NONE' && <TableHead className="text-right">Tax%</TableHead>}
                                    {invoice.taxType && invoice.taxType !== 'NONE' && <TableHead className="text-right">Subtotal</TableHead>}
                                    {invoice.taxType && invoice.taxType !== 'NONE' && <TableHead className="text-right">Tax</TableHead>}
                                    <TableHead className="text-right">Amount</TableHead>
                                    {isEditable && <TableHead className="w-[100px] no-print">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.description}</TableCell>
                                        {invoice.taxType && invoice.taxType !== 'NONE' && <TableCell>{item.hsnCode || '-'}</TableCell>}
                                        <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(Number(item.rate), currency)}</TableCell>
                                        {invoice.taxType && invoice.taxType !== 'NONE' && <TableCell className="text-right">{Number(item.taxRate)}%</TableCell>}
                                        {invoice.taxType && invoice.taxType !== 'NONE' && <TableCell className="text-right">{formatCurrency(Number(item.subtotal), currency)}</TableCell>}
                                        {invoice.taxType && invoice.taxType !== 'NONE' && <TableCell className="text-right">{formatCurrency(Number(item.taxAmount), currency)}</TableCell>}
                                        <TableCell className="text-right font-medium">{formatCurrency(Number(item.amount), currency)}</TableCell>
                                        {isEditable && (
                                            <TableCell className="no-print">
                                                <div className="flex gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="icon" variant="ghost">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Line Item</DialogTitle>
                                                            </DialogHeader>
                                                            <form action={async (formData) => {
                                                                await updateInvoiceItem(item.id, formData)
                                                                window.location.reload()
                                                            }} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="description">Description</Label>
                                                                    <Input id="description" name="description" defaultValue={item.description} required />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="quantity">Quantity</Label>
                                                                        <Input id="quantity" name="quantity" type="number" step="0.01" defaultValue={Number(item.quantity)} required />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="rate">Rate</Label>
                                                                        <Input id="rate" name="rate" type="number" step="0.01" defaultValue={Number(item.rate)} required />
                                                                    </div>
                                                                </div>
                                                                <Button type="submit" className="w-full">Update Item</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}

                                {/* Totals Section */}
                                {invoice.taxType && invoice.taxType !== 'NONE' ? (
                                    <>
                                        <TableRow>
                                            <TableCell colSpan={isEditable ? 6 : 5} className="text-right font-medium">Subtotal</TableCell>
                                            <TableCell className="text-right">{formatCurrency(Number(invoice.subtotal), currency)}</TableCell>
                                            {isEditable && <TableCell className="no-print"></TableCell>}
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={isEditable ? 6 : 5} className="text-right font-medium">
                                                Tax ({invoice.taxType})
                                                {invoice.status === InvoiceStatus.PROFORMA && (
                                                    <span className="block text-xs text-muted-foreground font-normal">(Not for Input Tax Credit)</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(Number(invoice.taxAmount), currency)}</TableCell>
                                            {isEditable && <TableCell className="no-print"></TableCell>}
                                        </TableRow>
                                        <TableRow className="font-bold text-lg">
                                            <TableCell colSpan={isEditable ? 6 : 5} className="text-right">Total</TableCell>
                                            <TableCell className="text-right">{formatCurrency(Number(invoice.totalAmount), currency)}</TableCell>
                                            {isEditable && <TableCell className="no-print"></TableCell>}
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow className="font-bold text-lg">
                                        <TableCell colSpan={isEditable ? 3 : 3} className="text-right">Total</TableCell>
                                        <TableCell className="text-right">{formatCurrency(Number(invoice.totalAmount), currency)}</TableCell>
                                        {isEditable && <TableCell className="no-print"></TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Payment Info (if paid) */}
                    {isPaid && invoice.paymentMethod && (
                        <div className="border-t pt-4 print-break-inside-avoid">
                            <h3 className="font-semibold mb-2">Payment Information</h3>
                            <div className="text-sm space-y-1">
                                <p><span className="text-muted-foreground">Method:</span> {invoice.paymentMethod}</p>
                                {invoice.paymentNotes && <p><span className="text-muted-foreground">Notes:</span> {invoice.paymentNotes}</p>}
                            </div>
                        </div>
                    )}

                    <div className="text-center text-sm text-muted-foreground pt-4 border-t print:mt-auto">
                        <p>Thank you for your business!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
