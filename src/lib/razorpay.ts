import Razorpay from 'razorpay'
import { prisma } from './prisma'

let razorpayInstance: Razorpay | null = null

export async function getRazorpayInstance() {
    if (razorpayInstance) return razorpayInstance

    const settings = await prisma.settings.findFirst()

    if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
        throw new Error('Razorpay credentials not configured')
    }

    razorpayInstance = new Razorpay({
        key_id: settings.razorpayKeyId,
        key_secret: settings.razorpayKeySecret
    })

    return razorpayInstance
}

export async function createRazorpayOrder(amount: number, invoiceId: string) {
    const razorpay = await getRazorpayInstance()

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: invoiceId,
        notes: {
            invoiceId
        }
    })

    return order
}

export async function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): Promise<boolean> {
    const crypto = require('crypto')
    const settings = await prisma.settings.findFirst()

    if (!settings?.razorpayKeySecret) {
        return false
    }

    const text = `${orderId}|${paymentId}`
    const generated_signature = crypto
        .createHmac('sha256', settings.razorpayKeySecret)
        .update(text)
        .digest('hex')

    return generated_signature === signature
}

export interface PaymentLinkData {
    amount: number
    currency: string
    description: string
    customer: {
        name: string
        email: string
        contact?: string
    }
    reference_id: string
    callback_url?: string
}

export async function generatePaymentLink(data: PaymentLinkData) {
    const razorpay = await getRazorpayInstance()

    try {
        // Razorpay Payment Link API
        // Note: The nodejs sdk might not have direct support for payment links in strict types, 
        // so we might need to use the 'any' type or check the sdk version. 
        // Assuming standard usage or falling back to direct API call if needed, 
        // but let's try to use the instance if possible or fetch if sdk is limited.

        // Using fetch for Payment Links as it's often more reliable for specific features not in all SDK versions
        const settings = await prisma.settings.findFirst()
        if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
            throw new Error('Razorpay credentials not configured')
        }

        const auth = Buffer.from(`${settings.razorpayKeyId}:${settings.razorpayKeySecret}`).toString('base64')

        const response = await fetch('https://api.razorpay.com/v1/payment_links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: Math.round(data.amount * 100),
                currency: data.currency,
                description: data.description,
                customer: data.customer,
                reference_id: data.reference_id,
                callback_url: data.callback_url,
                callback_method: 'get'
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.description || 'Failed to create payment link')
        }

        const paymentLink = await response.json()

        return {
            success: true,
            paymentLink: paymentLink.short_url,
            paymentLinkId: paymentLink.id
        }
    } catch (error) {
        console.error('Error generating payment link:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate payment link'
        }
    }
}

export async function getPaymentLinkStatus(paymentLinkId: string) {
    const settings = await prisma.settings.findFirst()
    if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
        return { success: false, error: 'Razorpay not configured' }
    }

    try {
        const auth = Buffer.from(`${settings.razorpayKeyId}:${settings.razorpayKeySecret}`).toString('base64')
        const response = await fetch(`https://api.razorpay.com/v1/payment_links/${paymentLinkId}`, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch payment link status')
        }

        const data = await response.json()
        return {
            success: true,
            status: data.status,
            amount: data.amount / 100,
            amountPaid: data.amount_paid / 100,
            payments: data.payments
        }
    } catch (error) {
        console.error('Error fetching payment link status:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch status'
        }
    }
}
