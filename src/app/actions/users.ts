'use server'

import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createUser(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as Role
    const companyName = formData.get("companyName") as string

    if (!name || !email || !password || !role) {
        return { error: "Missing required fields" }
    }

    const hashedPassword = await hash(password, 12)

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                // If role is CLIENT, create profile
                ...(role === "CLIENT" && companyName ? {
                    clientProfile: {
                        create: {
                            companyName,
                            billingAddress: "" // Optional for now
                        }
                    }
                } : {})
            }
        })

        revalidatePath("/dashboard/users")
        return { success: true, message: `User ${user.email} created.` }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create user. Email might be taken." }
    }
}
export async function updateUser(userId: string, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as Role
    const companyName = formData.get("companyName") as string

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                role,
                ...(role === "CLIENT" && companyName ? {
                    clientProfile: {
                        upsert: {
                            create: { companyName },
                            update: { companyName }
                        }
                    }
                } : {})
            }
        })

        revalidatePath("/dashboard/users")
        return { success: true, message: "User updated successfully" }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update user" }
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath("/dashboard/users")
        return { success: true, message: "User deleted successfully" }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete user" }
    }
}
