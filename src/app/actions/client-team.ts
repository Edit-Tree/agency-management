'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"
import { Role } from "@prisma/client"

export async function addClientTeamMember(clientProfileId: string, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLIENT')) {
        return { error: "Unauthorized" }
    }

    // If client is adding, ensure they own this profile
    if (session.user.role === 'CLIENT') {
        const userProfile = await prisma.clientProfile.findUnique({
            where: { userId: session.user.id }
        })
        if (userProfile?.id !== clientProfileId) {
            return { error: "Unauthorized" }
        }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'MEMBER'

    if (!name || !email || !password) {
        return { error: "Missing required fields" }
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            // If user exists, check if they are already a member
            const existingMember = await prisma.clientTeamMember.findUnique({
                where: {
                    clientProfileId_userId: {
                        clientProfileId,
                        userId: existingUser.id
                    }
                }
            })

            if (existingMember) {
                return { error: "User is already a team member" }
            }

            // Add as team member
            await prisma.clientTeamMember.create({
                data: {
                    clientProfileId,
                    userId: existingUser.id,
                    role
                }
            })
        } else {
            // Create new user
            const hashedPassword = await hash(password, 12)
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: Role.CLIENT // They are a client user
                }
            })

            // Add as team member
            await prisma.clientTeamMember.create({
                data: {
                    clientProfileId,
                    userId: newUser.id,
                    role
                }
            })
        }

        revalidatePath(`/dashboard/clients/${clientProfileId}`)
        revalidatePath(`/portal/team`) // For client portal if we add it there
        return { success: true, message: "Team member added successfully" }
    } catch (error) {
        console.error("Error adding team member:", error)
        return { error: "Failed to add team member" }
    }
}

export async function removeClientTeamMember(clientProfileId: string, userId: string) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLIENT')) {
        return { error: "Unauthorized" }
    }

    // If client is removing, ensure they own this profile
    if (session.user.role === 'CLIENT') {
        const userProfile = await prisma.clientProfile.findUnique({
            where: { userId: session.user.id }
        })
        if (userProfile?.id !== clientProfileId) {
            return { error: "Unauthorized" }
        }
    }

    try {
        await prisma.clientTeamMember.delete({
            where: {
                clientProfileId_userId: {
                    clientProfileId,
                    userId
                }
            }
        })

        revalidatePath(`/dashboard/clients/${clientProfileId}`)
        return { success: true, message: "Team member removed successfully" }
    } catch (error) {
        console.error("Error removing team member:", error)
        return { error: "Failed to remove team member" }
    }
}
