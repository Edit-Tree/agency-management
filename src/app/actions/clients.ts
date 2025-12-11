'use server'

import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createClient(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('companyName') as string
    const billingAddress = formData.get('billingAddress') as string
    const gstNumber = formData.get('gstNumber') as string

    if (!name || !email || !password || !companyName) {
        return { error: "Missing required fields" }
    }

    try {
        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.CLIENT,
                clientProfile: {
                    create: {
                        companyName,
                        billingAddress,
                        gstNumber
                    }
                }
            }
        })

        revalidatePath('/dashboard/clients')
        return { success: true, message: "Client created successfully" }
    } catch (error) {
        console.error("Error creating client:", error)
        return { error: "Failed to create client. Email might be taken." }
    }
}

export async function updateClient(clientId: string, formData: FormData) {
    const companyName = formData.get('companyName') as string
    const contactName = formData.get('contactName') as string
    const billingAddress = formData.get('billingAddress') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const gstNumber = formData.get('gstNumber') as string
    const vatNumber = formData.get('vatNumber') as string
    const taxId = formData.get('taxId') as string
    const knowledgeBaseUrl = formData.get('knowledgeBaseUrl') as string
    const brandingKitUrl = formData.get('brandingKitUrl') as string

    try {
        // Update ClientProfile
        await prisma.clientProfile.update({
            where: { id: clientId },
            data: {
                companyName,
                contactName: contactName || null,
                email: email || null,
                phone: phone || null,
                address: address || null,
                billingAddress: billingAddress || null,
                gstNumber: gstNumber || null,
                vatNumber: vatNumber || null,
                taxId: taxId || null,
                knowledgeBaseUrl: knowledgeBaseUrl || null,
                brandingKitUrl: brandingKitUrl || null,
                user: {
                    update: {
                        name,
                        email
                    }
                }
            }
        })

        revalidatePath('/dashboard/clients')
        revalidatePath(`/dashboard/clients/${clientId}`)
        return { success: true, message: "Client updated successfully" }
    } catch (error) {
        console.error("Error updating client:", error)
        return { error: "Failed to update client" }
    }
}
