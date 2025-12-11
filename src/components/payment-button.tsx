'use client'

import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface PaymentButtonProps {
    invoiceId: string
    amount: number
    currency: string
    razorpayKeyId?: string
}

export function PaymentButton({ invoiceId, amount, currency, razorpayKeyId }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)

        // Check if Razorpay is loaded
        if (typeof window === 'undefined' || !(window as any).Razorpay) {
            // Load Razorpay script dynamically if not present
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => initiatePayment()
            script.onerror = () => {
                toast.error("Failed to load payment gateway")
                setLoading(false)
            }
            document.body.appendChild(script)
        } else {
            initiatePayment()
        }
    }

    const initiatePayment = () => {
        // Mock payment for now if no key
        if (!razorpayKeyId) {
            toast.info("Payment Gateway in Test Mode (No Key Configured)")
            setTimeout(() => {
                toast.success("Payment Successful (Simulated)")
                setLoading(false)
            }, 2000)
            return
        }

        const options = {
            key: razorpayKeyId,
            amount: amount * 100, // Amount in paise
            currency: currency,
            name: "EditTree PM",
            description: `Invoice #${invoiceId}`,
            handler: function (response: any) {
                toast.success(`Payment Successful! ID: ${response.razorpay_payment_id}`)
                // Here you would call a server action to verify payment and update invoice status
                setLoading(false)
            },
            prefill: {
                name: "Client Name", // Could pass this as prop
                email: "client@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#16a34a"
            }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
        setLoading(false)
    }

    return (
        <Button onClick={handlePayment} disabled={loading} className="w-full sm:w-auto">
            <CreditCard className="mr-2 h-4 w-4" />
            {loading ? "Processing..." : `Pay Now (${currency} ${amount})`}
        </Button>
    )
}
