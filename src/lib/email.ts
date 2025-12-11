import nodemailer from 'nodemailer'
import { prisma } from './prisma'

let transporter: nodemailer.Transporter | null = null

async function getEmailTransporter() {
    if (transporter) return transporter

    const settings = await prisma.settings.findFirst()

    if (!settings?.smtpHost || !settings?.smtpUsername || !settings?.smtpPassword) {
        throw new Error('SMTP credentials not configured')
    }

    transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: false, // Use TLS
        auth: {
            user: settings.smtpUsername,
            pass: settings.smtpPassword
        }
    })

    return transporter
}

export interface EmailOptions {
    to: string
    toName?: string
    subject: string
    htmlContent: string
    textContent?: string
}

export async function sendEmail(options: EmailOptions) {
    try {
        const transport = await getEmailTransporter()
        const settings = await prisma.settings.findFirst()

        if (!settings?.smtpFromEmail) {
            throw new Error('SMTP sender email not configured')
        }

        const mailOptions = {
            from: `"${settings.smtpFromName || 'PM System'}" <${settings.smtpFromEmail}>`,
            to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
            subject: options.subject,
            html: options.htmlContent,
            text: options.textContent || options.htmlContent.replace(/<[^>]*>/g, '')
        }

        console.log('Sending email:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        })

        const result = await transport.sendMail(mailOptions)
        console.log('Email sent successfully:', result.messageId)
        return result
    } catch (error) {
        console.error('Failed to send email:', error)
        throw error
    }
}

// Email Templates (same as before, just using SMTP now)
export async function sendInvoiceEmail(invoiceId: string, clientEmail: string, clientName: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: true,
            items: true
        }
    })

    if (!invoice) throw new Error('Invoice not found')

    const invoiceNumber = invoice.invoiceNumber
        ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
        : invoice.proformaNumber
            ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
            : 'DRAFT'

    await sendEmail({
        to: clientEmail,
        toName: clientName,
        subject: `Invoice ${invoiceNumber} from PM System`,
        htmlContent: `
            <h2>Invoice ${invoiceNumber}</h2>
            <p>Dear ${clientName},</p>
            <p>Please find your invoice details below:</p>
            <p><strong>Total Amount:</strong> ₹${Number(invoice.totalAmount).toFixed(2)}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
            <p>Thank you for your business!</p>
        `,
        textContent: `Invoice ${invoiceNumber} - Total: ₹${Number(invoice.totalAmount).toFixed(2)}`
    })
}

export async function sendReviewRequestEmail(ticketId: string, clientEmail: string, clientName: string) {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { project: true }
    })

    if (!ticket) throw new Error('Ticket not found')

    await sendEmail({
        to: clientEmail,
        toName: clientName,
        subject: `Review Request: ${ticket.title}`,
        htmlContent: `
            <h2>Review Request</h2>
            <p>Dear ${clientName},</p>
            <p>We have completed work on: <strong>${ticket.title}</strong></p>
            <p>Project: ${ticket.project.title}</p>
            <p>Please review and approve the work.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">Go to Portal</a></p>
        `,
        textContent: `Review Request: ${ticket.title}`
    })
}
