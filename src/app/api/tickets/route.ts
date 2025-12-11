import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function verifyAuth(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey && apiKey === process.env.API_KEY) {
        return { authorized: true, role: 'ADMIN' }
    }
    const session = await getServerSession(authOptions)
    if (session?.user) {
        return { authorized: true, role: session.user.role, userId: session.user.id }
    }
    return { authorized: false }
}

// GET /api/tickets - List all tickets
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const assignedToId = searchParams.get('assignedToId')

    const tickets = await prisma.ticket.findMany({
        where: {
            ...(projectId && { projectId }),
            ...(status && { status: status as any }),
            ...(assignedToId && { assignedToId })
        },
        include: {
            project: { include: { client: true } },
            assignedTo: true,
            manager: true,
            comments: { include: { author: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tickets)
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, projectId, assignedToId, managerId, deadline, createdById } = body

    if (!title || !projectId || !createdById) {
        return NextResponse.json({ error: 'Missing required fields: title, projectId, createdById' }, { status: 400 })
    }

    const ticket = await prisma.ticket.create({
        data: {
            title,
            description,
            projectId,
            status: 'OPEN',
            assignedToId: assignedToId || null,
            managerId: managerId || null,
            deadline: deadline ? new Date(deadline) : null,
            createdById
        },
        include: {
            project: true,
            assignedTo: true,
            manager: true
        }
    })

    return NextResponse.json(ticket, { status: 201 })
}

// PATCH /api/tickets/:id - Update ticket
export async function PATCH(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, assignedToId, managerId } = body

    if (!id) {
        return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 })
    }

    const ticket = await prisma.ticket.update({
        where: { id },
        data: {
            ...(status && { status }),
            ...(assignedToId !== undefined && { assignedToId }),
            ...(managerId !== undefined && { managerId })
        },
        include: {
            project: true,
            assignedTo: true,
            manager: true
        }
    })

    return NextResponse.json(ticket)
}
