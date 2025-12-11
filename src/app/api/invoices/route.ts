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

// GET /api/invoices - List all invoices
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const invoices = await prisma.invoice.findMany({
        where: {
            ...(clientId && { clientId }),
            ...(status && { status: status as any })
        },
        include: {
            client: { include: { user: true } },
            items: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invoices)
}

// POST /api/invoices/send - Send invoice email
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request)
    if (!auth.authorized || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId } = body

    if (!invoiceId) {
        return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })
    }

    const { sendInvoiceToClient } = await import('@/lib/invoice-emails')
    const result = await sendInvoiceToClient(invoiceId)

    if (result.success) {
        return NextResponse.json({ success: true, email: result.email })
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 })
    }
}
