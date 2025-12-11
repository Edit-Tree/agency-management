'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ProposalStatus } from "@prisma/client"

export async function createProposal(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const clientId = formData.get("clientId") as string
    const projectId = formData.get("projectId") as string
    const content = formData.get("content") as string // JSON string
    const totalAmount = formData.get("totalAmount") as string
    const validUntil = formData.get("validUntil") as string

    if (!title || !clientId) {
        return { error: "Title and Client are required" }
    }

    try {
        const proposal = await prisma.proposal.create({
            data: {
                title,
                clientId,
                projectId: projectId || null,
                content: content ? JSON.parse(content) : null,
                totalAmount: totalAmount ? parseFloat(totalAmount) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                status: ProposalStatus.DRAFT
            }
        })

        revalidatePath("/dashboard/proposals")
        return { success: true, proposalId: proposal.id }
    } catch (error) {
        console.error("Error creating proposal:", error)
        return { error: "Failed to create proposal" }
    }
}

export async function updateProposalStatus(proposalId: string, status: ProposalStatus) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.proposal.update({
            where: { id: proposalId },
            data: { status }
        })
        revalidatePath("/dashboard/proposals")
        revalidatePath(`/dashboard/proposals/${proposalId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to update status" }
    }
}

export async function deleteProposal(proposalId: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.proposal.delete({
            where: { id: proposalId }
        })
        revalidatePath("/dashboard/proposals")
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete proposal" }
    }
}

export async function convertProposalToInvoice(proposalId: string) {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { client: true }
        })

        if (!proposal) return { success: false, error: "Proposal not found" }

        const content = proposal.content as any
        const items = content?.items || []

        // Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                clientId: proposal.clientId,
                status: 'DRAFT',
                currency: proposal.currency,
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        quantity: 1,
                        rate: item.amount,
                        amount: item.amount
                    }))
                }
            }
        })

        // Update Proposal Status
        await prisma.proposal.update({
            where: { id: proposalId },
            data: { status: 'ACCEPTED' }
        })

        return { success: true, invoiceId: invoice.id }
    } catch (error) {
        console.error("Convert to Invoice Error:", error)
        return { success: false, error: "Failed to convert to invoice" }
    }
}

export async function emailProposal(proposalId: string) {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { client: true }
        })

        if (!proposal) return { success: false, error: "Proposal not found" }

        // TODO: Implement actual email sending using nodemailer and settings
        console.log(`Sending proposal ${proposal.title} to ${proposal.client.email}`)

        // Update status to SENT if it was DRAFT
        if (proposal.status === 'DRAFT') {
            await prisma.proposal.update({
                where: { id: proposalId },
                data: { status: 'SENT' }
            })
        }

        return { success: true }
    } catch (error) {
        console.error("Email Proposal Error:", error)
        return { success: false, error: "Failed to email proposal" }
    }
}
