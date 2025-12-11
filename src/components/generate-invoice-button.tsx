'use client'

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { generateMonthEndInvoices } from "@/app/actions/invoices"
import { toast } from "sonner" // Assuming sonner or similar toast lib, but we'll use alert for now if not installed
import { useState } from "react"

export function GenerateInvoiceButton() {
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const result = await generateMonthEndInvoices()
            if (result.success) {
                alert(result.message) // Replace with toast
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to generate invoices")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleGenerate} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate Month-End"}
        </Button>
    )
}
