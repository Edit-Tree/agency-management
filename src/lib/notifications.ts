import { prisma } from './prisma'
import { sendEmail } from './email'

// Helper to check if email notification is enabled
async function shouldSendEmail(eventType: string): Promise<boolean> {
    const settings = await prisma.settings.findFirst()
    if (!settings) return false

    const eventMap: Record<string, boolean> = {
        'ticketCreated': settings.emailOnTicketCreated,
        'ticketAssigned': settings.emailOnTicketAssigned,
        'ticketStatusChange': settings.emailOnTicketStatusChange,
        'reviewRequested': settings.emailOnReviewRequested,
        'reviewApproved': settings.emailOnReviewApproved,
        'commentAdded': settings.emailOnCommentAdded,
        'invoiceCreated': settings.emailOnInvoiceCreated,
        'invoicePaid': settings.emailOnInvoicePaid,
        'deadlineApproaching': settings.emailOnDeadlineApproaching,
        'projectCreated': settings.emailOnProjectCreated,
    }

    return eventMap[eventType] ?? false
}

// Ticket Created - Notify Admin/Team
export async function notifyTicketCreated(ticketId: string) {
    if (!await shouldSendEmail('ticketCreated')) return

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            project: { include: { client: { include: { user: true } } } },
            createdBy: true
        }
    })

    if (!ticket) return

    // Notify all admin users
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
        try {
            await sendEmail({
                to: admin.email,
                toName: admin.name || undefined,
                subject: `New Ticket: ${ticket.title}`,
                htmlContent: `
                    <h2>New Ticket Created</h2>
                    <p><strong>Title:</strong> ${ticket.title}</p>
                    <p><strong>Project:</strong> ${ticket.project.title}</p>
                    <p><strong>Client:</strong> ${ticket.project.client.companyName}</p>
                    <p><strong>Created by:</strong> ${ticket.createdBy.name}</p>
                    <p><strong>Description:</strong></p>
                    <p>${ticket.description || 'No description'}</p>
                    ${ticket.deadline ? `<p><strong>Deadline:</strong> ${new Date(ticket.deadline).toLocaleDateString()}</p>` : ''}
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${ticket.projectId}/tickets/${ticket.id}">View Ticket</a></p>
                `,
                textContent: `New Ticket: ${ticket.title} - ${ticket.project.title}`
            })
        } catch (error) {
            console.error('Failed to send ticket created email:', error)
        }
    }
}

// Ticket Assigned - Notify Team Member and Manager
export async function notifyTicketAssigned(ticketId: string, assigneeId: string, managerId?: string) {
    if (!await shouldSendEmail('ticketAssigned')) return

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            project: true,
            assignedTo: true,
            manager: true
        }
    })

    if (!ticket) return

    // Notify assignee
    if (ticket.assignedTo) {
        try {
            await sendEmail({
                to: ticket.assignedTo.email,
                toName: ticket.assignedTo.name || undefined,
                subject: `Ticket Assigned: ${ticket.title}`,
                htmlContent: `
                    <h2>You've Been Assigned a Ticket</h2>
                    <p>Hi ${ticket.assignedTo.name},</p>
                    <p>You have been assigned to work on:</p>
                    <p><strong>${ticket.title}</strong></p>
                    <p><strong>Project:</strong> ${ticket.project.title}</p>
                    <p><strong>Status:</strong> ${ticket.status}</p>
                    ${ticket.deadline ? `<p><strong>Deadline:</strong> ${new Date(ticket.deadline).toLocaleDateString()}</p>` : ''}
                    ${ticket.manager ? `<p><strong>Quality Manager:</strong> ${ticket.manager.name} will oversee this work</p>` : ''}
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${ticket.projectId}/tickets/${ticket.id}">View Ticket</a></p>
                `,
                textContent: `You've been assigned to: ${ticket.title}`
            })
        } catch (error) {
            console.error('Failed to send assignee email:', error)
        }
    }

    // Notify manager
    if (ticket.manager) {
        try {
            await sendEmail({
                to: ticket.manager.email,
                toName: ticket.manager.name || undefined,
                subject: `Quality Check: ${ticket.title}`,
                htmlContent: `
                    <h2>You've Been Assigned as Quality Manager</h2>
                    <p>Hi ${ticket.manager.name},</p>
                    <p>Please ensure quality and timelines for:</p>
                    <p><strong>${ticket.title}</strong></p>
                    <p><strong>Project:</strong> ${ticket.project.title}</p>
                    <p><strong>Assignee:</strong> ${ticket.assignedTo?.name || 'Unassigned'}</p>
                    ${ticket.deadline ? `<p><strong>Deadline:</strong> ${new Date(ticket.deadline).toLocaleDateString()}</p>` : ''}
                    <p>Please work with ${ticket.assignedTo?.name || 'the assignee'} to ensure this is completed on time with high quality.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${ticket.projectId}/tickets/${ticket.id}">View Ticket</a></p>
                `,
                textContent: `Quality check assigned: ${ticket.title}`
            })
        } catch (error) {
            console.error('Failed to send manager email:', error)
        }
    }
}

// Ticket Status Changed - Notify Client
export async function notifyTicketStatusChange(ticketId: string, newStatus: string) {
    if (!await shouldSendEmail('ticketStatusChange')) return

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            project: { include: { client: { include: { user: true } } } }
        }
    })

    if (!ticket) return

    try {
        await sendEmail({
            to: ticket.project.client.user.email,
            toName: ticket.project.client.user.name || undefined,
            subject: `Ticket Status Updated: ${ticket.title}`,
            htmlContent: `
                <h2>Ticket Status Updated</h2>
                <p>Dear ${ticket.project.client.user.name},</p>
                <p>The status of your ticket has been updated:</p>
                <p><strong>${ticket.title}</strong></p>
                <p><strong>New Status:</strong> ${newStatus}</p>
                <p><strong>Project:</strong> ${ticket.project.title}</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">View in Portal</a></p>
            `,
            textContent: `Ticket status updated: ${ticket.title} - ${newStatus}`
        })
    } catch (error) {
        console.error('Failed to send status change email:', error)
    }
}

// Review Requested - Notify Client
export async function notifyReviewRequested(ticketId: string) {
    if (!await shouldSendEmail('reviewRequested')) return

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            project: { include: { client: { include: { user: true } } } }
        }
    })

    if (!ticket) return

    try {
        await sendEmail({
            to: ticket.project.client.user.email,
            toName: ticket.project.client.user.name || undefined,
            subject: `Review Requested: ${ticket.title}`,
            htmlContent: `
                <h2>Work Ready for Review</h2>
                <p>Dear ${ticket.project.client.user.name},</p>
                <p>We've completed work on your ticket and it's ready for your review:</p>
                <p><strong>${ticket.title}</strong></p>
                <p><strong>Project:</strong> ${ticket.project.title}</p>
                <p>Please review the work and provide your feedback.</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">Review Now</a></p>
            `,
            textContent: `Review requested for: ${ticket.title}`
        })
    } catch (error) {
        console.error('Failed to send review request email:', error)
    }
}

// Review Approved - Notify Team
export async function notifyReviewApproved(ticketId: string, rating: number, review?: string) {
    if (!await shouldSendEmail('reviewApproved')) return

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            project: { include: { client: true } },
            assignedTo: true
        }
    })

    if (!ticket) return

    const recipients = []
    if (ticket.assignedTo) recipients.push(ticket.assignedTo)

    // Also notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
    recipients.push(...admins)

    for (const recipient of recipients) {
        try {
            await sendEmail({
                to: recipient.email,
                toName: recipient.name || undefined,
                subject: `Work Approved: ${ticket.title}`,
                htmlContent: `
                    <h2>Client Approved Your Work! 🎉</h2>
                    <p>Hi ${recipient.name},</p>
                    <p>Great news! The client has approved your work on:</p>
                    <p><strong>${ticket.title}</strong></p>
                    <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
                    ${review ? `<p><strong>Review:</strong> "${review}"</p>` : ''}
                    <p><strong>Client:</strong> ${ticket.project.client.companyName}</p>
                `,
                textContent: `Work approved: ${ticket.title} - ${rating}/5 stars`
            })
        } catch (error) {
            console.error('Failed to send approval email:', error)
        }
    }
}

// Comment Added - Notify Participants
export async function notifyCommentAdded(ticketId: string, authorId: string, content: string) {
    if (!await shouldSendEmail('commentAdded')) return

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            project: { include: { client: { include: { user: true } } } },
            assignedTo: true,
            createdBy: true,
            comments: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: {
                    id: true,
                    createdAt: true,
                    authorId: true
                }
            }
        }
    })

    if (!ticket) return

    // 1. Burst Protection (Global)
    // If the author has commented recently (e.g. within last 15 mins), assume we already notified.
    // The current comment is likely ticket.comments[0].
    const myComments = ticket.comments.filter(c => c.authorId === authorId)
    // We need at least 2 comments (current + previous) to determine a burst
    if (myComments.length >= 2) {
        const currentMsgTime = new Date(myComments[0].createdAt).getTime()
        const prevMsgTime = new Date(myComments[1].createdAt).getTime()
        const timeDiffMinutes = (currentMsgTime - prevMsgTime) / (1000 * 60)

        // If previous message was less than 15 minutes ago, suppress notification
        if (timeDiffMinutes < 15) {
            console.log(`Suppressing notification for ticket ${ticketId}: burst protection (author active ${timeDiffMinutes.toFixed(1)}m ago)`)
            return
        }
    }

    // Identify Recipients
    type Recipient = { id: string; email: string; name: string | null }
    const recipients = new Map<string, Recipient>()

    if (ticket.assignedTo && ticket.assignedTo.id !== authorId) {
        recipients.set(ticket.assignedTo.id, {
            id: ticket.assignedTo.id,
            email: ticket.assignedTo.email,
            name: ticket.assignedTo.name
        })
    }
    if (ticket.createdBy.id !== authorId) {
        recipients.set(ticket.createdBy.id, {
            id: ticket.createdBy.id,
            email: ticket.createdBy.email,
            name: ticket.createdBy.name
        })
    }

    for (const recipient of recipients.values()) {
        try {
            // 2. Activity Check (Per Recipient)
            // If the recipient has commented recently (e.g. within last 5 mins), assume they are active in chat.
            const recipientLastComment = ticket.comments.find(c => c.authorId === recipient.id)
            if (recipientLastComment) {
                const now = new Date().getTime()
                const lastActiveTime = new Date(recipientLastComment.createdAt).getTime()
                const timeSinceActiveMinutes = (now - lastActiveTime) / (1000 * 60)

                if (timeSinceActiveMinutes < 5) {
                    console.log(`Skipping email for ${recipient.email}: user active ${timeSinceActiveMinutes.toFixed(1)}m ago`)
                    continue
                }
            }

            await sendEmail({
                to: recipient.email,
                subject: `New Comment: ${ticket.title}`,
                htmlContent: `
                    <h2>New Comment on Ticket</h2>
                    <p>A new comment was added to: <strong>${ticket.title}</strong></p>
                    <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-style: italic;">
                        ${content}
                    </p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${ticket.projectId}/tickets/${ticket.id}">View Conversation</a></p>
                `,
                textContent: `New comment on: ${ticket.title}\n\n"${content}"`
            })
        } catch (error) {
            console.error('Failed to send comment notification:', error)
        }
    }
}

// Invoice Created - Notify Client
export async function notifyInvoiceCreated(invoiceId: string) {
    if (!await shouldSendEmail('invoiceCreated')) return

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: { include: { user: true } },
            items: true
        }
    })

    if (!invoice) return

    const invoiceNumber = invoice.invoiceNumber
        ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
        : invoice.proformaNumber
            ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}`
            : 'DRAFT'

    try {
        await sendEmail({
            to: invoice.client.user.email,
            toName: invoice.client.user.name || undefined,
            subject: `New Invoice ${invoiceNumber}`,
            htmlContent: `
                <h2>New Invoice</h2>
                <p>Dear ${invoice.client.user.name},</p>
                <p>A new invoice has been generated for your account:</p>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Amount:</strong> ₹${Number(invoice.totalAmount).toFixed(2)}</p>
                <p><strong>Status:</strong> ${invoice.status}</p>
                <p><strong>Items:</strong> ${invoice.items.length}</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices/${invoice.id}">View Invoice</a></p>
            `,
            textContent: `New invoice ${invoiceNumber} - ₹${Number(invoice.totalAmount).toFixed(2)}`
        })
    } catch (error) {
        console.error('Failed to send invoice created email:', error)
    }
}

// Invoice Paid - Notify Admin
export async function notifyInvoicePaid(invoiceId: string) {
    if (!await shouldSendEmail('invoicePaid')) return

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: true }
    })

    if (!invoice) return

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })

    const invoiceNumber = invoice.invoiceNumber
        ? `INV-${String(invoice.invoiceNumber).padStart(3, '0')}`
        : 'DRAFT'

    for (const admin of admins) {
        try {
            await sendEmail({
                to: admin.email,
                toName: admin.name || undefined,
                subject: `Payment Received: ${invoiceNumber}`,
                htmlContent: `
                    <h2>Payment Received! 💰</h2>
                    <p>Invoice ${invoiceNumber} has been paid.</p>
                    <p><strong>Client:</strong> ${invoice.client.companyName}</p>
                    <p><strong>Amount:</strong> ₹${Number(invoice.totalAmount).toFixed(2)}</p>
                    <p><strong>Payment Method:</strong> ${invoice.paymentMethod || 'Razorpay'}</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoice.id}">View Invoice</a></p>
                `,
                textContent: `Payment received: ${invoiceNumber} - ₹${Number(invoice.totalAmount).toFixed(2)}`
            })
        } catch (error) {
            console.error('Failed to send payment notification:', error)
        }
    }
}

// Project Created - Notify Client
export async function notifyProjectCreated(projectId: string) {
    if (!await shouldSendEmail('projectCreated')) return

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { client: { include: { user: true } } }
    })

    if (!project) return

    try {
        await sendEmail({
            to: project.client.user.email,
            toName: project.client.user.name || undefined,
            subject: `New Project: ${project.title}`,
            htmlContent: `
                <h2>New Project Created</h2>
                <p>Dear ${project.client.user.name},</p>
                <p>A new project has been created for you:</p>
                <p><strong>${project.title}</strong></p>
                <p>${project.description || ''}</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/projects">View Projects</a></p>
            `,
            textContent: `New project: ${project.title}`
        })
    } catch (error) {
        console.error('Failed to send project created email:', error)
    }
}
