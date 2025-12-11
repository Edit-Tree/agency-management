'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createProject(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const clientId = formData.get("clientId") as string
    const budget = formData.get("budget") as string

    // New fields
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const services = formData.get("services") as string
    const billingType = formData.get("billingType") as string

    if (!title || !clientId) {
        redirect('/dashboard/projects/new?error=missing_fields')
    }

    const project = await prisma.project.create({
        data: {
            title,
            description,
            clientId,
            budget: budget ? parseFloat(budget) : null,
            status: "ACTIVE",
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            services: services ? JSON.parse(services) : null,
            billingType: billingType || "FIXED"
        }
    })

    revalidatePath("/dashboard/projects")
    redirect(`/dashboard/projects/${project.id}`)
}

export async function updateProject(projectId: string, formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const budget = formData.get("budget") as string
    const status = formData.get("status") as string

    if (!title) {
        return { error: "Title is required" }
    }

    await prisma.project.update({
        where: { id: projectId },
        data: {
            title,
            description,
            budget: budget ? parseFloat(budget) : null,
            status: status || "ACTIVE"
        }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/projects")
    redirect(`/dashboard/projects/${projectId}`)
}
