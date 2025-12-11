import { notifyInvoiceCreated, notifyInvoicePaid } from './notifications'
import { prisma } from './prisma'
import { formatCurrency, type CurrencyCode } from './invoice-calculator'

// Send invoice email to client
export async function sendInvoiceToClient(invoiceId: string) {
    const settings = await prisma.settings.findFirst()

    if (!settings?.enableInvoiceEmails) {
        return { success: false, error: 'Invoice emails are disabled in settings' }
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: { include: { user: true } },
            items: true
        }
    })

    if (!invoice) {
        return { success: false, error: 'Invoice not found' }
    }

    const invoiceNumber = invoice.invoiceNumber
        ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
        : invoice.proformaNumber
            ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
            : 'DRAFT'

    const currency = (invoice.currency || 'INR') as CurrencyCode
    const { sendEmail } = await import('./email')

    try {
        await sendEmail({
            to: invoice.client.user.email,
            toName: invoice.client.user.name || undefined,
            subject: `Invoice ${invoiceNumber} from PM System`,
            htmlContent: `
                <h2>Invoice ${invoiceNumber}</h2>
                <p>Dear ${invoice.client.user.name},</p>
                <p>Please find your invoice details below:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Quantity</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${item.description}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${Number(item.quantity)}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(Number(item.rate), currency)}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${formatCurrency(Number(item.amount), currency)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                ${invoice.taxType && invoice.taxType !== 'NONE' ? `
                    <p><strong>Subtotal:</strong> ${formatCurrency(Number(invoice.subtotal), currency)}</p>
                    <p><strong>Tax (${invoice.taxType}):</strong> ${formatCurrency(Number(invoice.taxAmount), currency)}</p>
                ` : ''}
                <p style="font-size: 18px;"><strong>Total Amount:</strong> ${formatCurrency(Number(invoice.totalAmount), currency)}</p>
                
                ${invoice.notes ? `<p><em>${invoice.notes}</em></p>` : ''}
                
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices/${invoice.id}" style="display: inline-block; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
                
                <p>Thank you for your business!</p>
            `,
            textContent: `Invoice ${invoiceNumber} - Total: ${formatCurrency(Number(invoice.totalAmount), currency)}`
        })

        return { success: true, email: invoice.client.user.email }
    } catch (error) {
        console.error('Failed to send invoice email:', error)
        return { success: false, error: 'Failed to send email' }
    }
}

// Send payment reminder to client
export async function sendPaymentReminder(invoiceId: string) {
    const settings = await prisma.settings.findFirst()

    if (!settings?.paymentReminderEnabled) {
        return { success: false, error: 'Payment reminders are disabled in settings' }
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: { include: { user: true } }
        }
    })

    if (!invoice) {
        return { success: false, error: 'Invoice not found' }
    }

    if (invoice.status === 'PAID') {
        return { success: false, error: 'Invoice is already paid' }
    }

    const invoiceNumber = invoice.invoiceNumber
        ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
        : invoice.proformaNumber
            ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
            : 'DRAFT'

    const currency = (invoice.currency || 'INR') as CurrencyCode
    const amount = formatCurrency(Number(invoice.totalAmount), currency)

    // Replace placeholders in reminder message
    const message = (settings.paymentReminderMessage || 'Payment reminder')
        .replace('{invoice_number}', invoiceNumber)
        .replace('{amount}', amount)
        .replace('{client_name}', invoice.client.companyName)

    const { sendEmail } = await import('./email')

    try {
        await sendEmail({
            to: invoice.client.user.email,
            toName: invoice.client.user.name || undefined,
            subject: `Payment Reminder: ${invoiceNumber}`,
            htmlContent: `
                <h2>Payment Reminder</h2>
                <p>Dear ${invoice.client.user.name},</p>
                <p>${message}</p>
                
                <table style="margin: 20px 0;">
                    <tr>
                        <td style="padding: 5px 10px;"><strong>Invoice Number:</strong></td>
                        <td style="padding: 5px 10px;">${invoiceNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px;"><strong>Amount:</strong></td>
                        <td style="padding: 5px 10px;">${amount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px;"><strong>Status:</strong></td>
                        <td style="padding: 5px 10px;">${invoice.status}</td>
                    </tr>
                </table>
                
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices/${invoice.id}" style="display: inline-block; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">View & Pay Invoice</a></p>
                
                <p>If you have any questions, please don't hesitate to reach out.</p>
                <p>Best regards,<br>PM System Team</p>
            `,
            textContent: `Payment Reminder: ${invoiceNumber} - ${amount}`
        })

        return { success: true, email: invoice.client.user.email }
    } catch (error) {
        console.error('Failed to send payment reminder:', error)
        return { success: false, error: 'Failed to send email' }
    }
}
