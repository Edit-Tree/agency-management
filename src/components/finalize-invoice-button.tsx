'use client'

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { finalizeInvoice } from "@/app/actions/finalize-invoice"
import { useState } from "react"

export function FinalizeInvoiceButton({ invoiceId }: { invoiceId: string }) {
    const [loading, setLoading] = useState(false)

    const handleFinalize = async () => {
        if (!confirm("Are you sure you want to mark this as PAID and issue an official invoice number? This cannot be undone.")) {
            return
        }

        setLoading(true)
        try {
            const result = await finalizeInvoice(invoiceId)
            if (result.success) {
                alert(result.message)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to finalize invoice")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleFinalize} disabled={loading} variant="default">
            <CheckCircle className="mr-2 h-4 w-4" />
            {loading ? "Finalizing..." : "Mark Paid & Finalize"}
        </Button>
    )
}
