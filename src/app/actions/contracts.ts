'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ContractStatus } from "@prisma/client"

export async function createContract(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const clientId = formData.get("clientId") as string
    const projectId = formData.get("projectId") as string
    const content = formData.get("content") as string // HTML/Text

    if (!title || !clientId || !content) {
        return { error: "Title, Client, and Content are required" }
    }

    try {
        const contract = await prisma.contract.create({
            data: {
                title,
                clientId,
                projectId: projectId || null,
                content,
                status: ContractStatus.DRAFT
            }
        })

        revalidatePath("/dashboard/contracts")
        return { success: true, contractId: contract.id }
    } catch (error) {
        console.error("Error creating contract:", error)
        return { error: "Failed to create contract" }
    }
}

export async function updateContractStatus(contractId: string, status: ContractStatus) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.contract.update({
            where: { id: contractId },
            data: { status }
        })
        revalidatePath("/dashboard/contracts")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update status" }
    }
}
