import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Helper to verify API key or session
async function verifyAuth(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key')

    // Check API key first (for n8n)
    if (apiKey) {
        // You should store API keys in database, for now using env variable
        if (apiKey === process.env.API_KEY) {
            return { authorized: true, role: 'ADMIN' }
        }
        return { authorized: false }
    }

    // Check session (for browser)
    const session = await getServerSession(authOptions)
    if (session?.user) {
        return { authorized: true, role: session.user.role, userId: session.user.id }
    }

    return { authorized: false }
}

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const projects = await prisma.project.findMany({
        where: {
            ...(clientId && { clientId }),
            ...(status && { status: status as any })
        },
        include: {
            client: {
                include: { user: true }
            },
            tickets: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, clientId, budget } = body

    if (!title || !clientId) {
        return NextResponse.json({ error: 'Missing required fields: title, clientId' }, { status: 400 })
    }

    const project = await prisma.project.create({
        data: {
            title,
            description,
            clientId,
            budget: budget ? parseFloat(budget) : null,
            status: 'ACTIVE'
        },
        include: {
            client: { include: { user: true } },
            tickets: true
        }
    })

    return NextResponse.json(project, { status: 201 })
}
