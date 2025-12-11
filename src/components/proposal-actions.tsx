'use client'

import { Button } from "@/components/ui/button"
import { Mail, FileText } from "lucide-react"
import { convertProposalToInvoice, emailProposal } from "@/app/actions/proposals"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ProposalActions({ proposalId }: { proposalId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleEmail = async () => {
        setLoading(true)
        const result = await emailProposal(proposalId)
        if (result.success) {
            toast.success("Proposal emailed to client")
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    const handleConvert = async () => {
        setLoading(true)
        const result = await convertProposalToInvoice(proposalId)
        if (result.success) {
            toast.success("Converted to invoice successfully")
            router.push(`/dashboard/invoices/${result.invoiceId}`)
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleEmail} disabled={loading}>
                <Mail className="mr-2 h-4 w-4" />
                Email Client
            </Button>
            <Button onClick={handleConvert} disabled={loading}>
                <FileText className="mr-2 h-4 w-4" />
                Convert to Invoice
            </Button>
        </div>
    )
}
