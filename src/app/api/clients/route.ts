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

// GET /api/clients - List all clients
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clients = await prisma.clientProfile.findMany({
        include: {
            user: true,
            projects: true
        },
        orderBy: { id: 'desc' }
    })

    return NextResponse.json(clients)
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, companyName, phone, address } = body

    if (!email || !name || !companyName) {
        return NextResponse.json({ error: 'Missing required fields: email, name, companyName' }, { status: 400 })
    }

    // Create user first
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: 'changeme', // Client should change this on first login
            role: 'CLIENT'
        }
    })

    // Create client profile
    const client = await prisma.clientProfile.create({
        data: {
            userId: user.id,
            companyName,
            phone,
            address
        },
        include: {
            user: true
        }
    })

    return NextResponse.json(client, { status: 201 })
}
