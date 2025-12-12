import 'dotenv/config'
import { PrismaClient, Role, TicketStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create Admin
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            role: Role.ADMIN,
        },
    })

    // Create Client
    const clientPassword = await hash('client123', 12)
    const clientUser = await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: {},
        create: {
            email: 'client@example.com',
            name: 'Acme Corp Client',
            password: clientPassword,
            role: Role.CLIENT,
        },
    })

    const clientProfile = await prisma.clientProfile.upsert({
        where: { userId: clientUser.id },
        update: {},
        create: {
            userId: clientUser.id,
            companyName: 'Acme Corp',
            billingAddress: '123 Acme Way',
        },
    })

    // Create Project
    const project = await prisma.project.create({
        data: {
            title: 'Website Redesign',
            description: 'Redesigning the corporate website',
            clientId: clientProfile.id,
            status: 'ACTIVE',
        },
    })

    // Create Tickets
    await prisma.ticket.createMany({
        data: [
            {
                title: 'Design Homepage',
                description: 'Create figma mockups for homepage',
                status: TicketStatus.DONE,
                projectId: project.id,
                createdById: admin.id,
                isBillable: true,
            },
            {
                title: 'Implement Authentication',
                description: 'Setup NextAuth',
                status: TicketStatus.IN_PROGRESS,
                projectId: project.id,
                createdById: admin.id,
                isBillable: true,
            },
            {
                title: 'Fix Mobile Layout',
                description: 'Menu is broken on mobile',
                status: TicketStatus.OPEN,
                projectId: project.id,
                createdById: clientUser.id,
                isBillable: true,
            },
        ],
    })

    // Create Settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            smtpFromName: 'PM System',
            smtpPort: 587,
        },
    })

    console.log({ admin, clientUser, project })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
