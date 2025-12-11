import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const invoice = await prisma.invoice.create({
        data: {
            clientId: data.clientId,
            currency: data.currency,
            taxType: data.taxType,
            clientGstNumber: data.clientGstNumber,
            notes: data.notes,
            subtotal: data.subtotal,
            taxAmount: data.taxAmount,
            totalAmount: data.totalAmount,
            status: 'DRAFT',
            items: {
                create: data.items.map((item: any) => ({
                    description: item.description,
                    hsnCode: item.hsnCode,
                    quantity: item.quantity,
                    rate: item.rate,
                    taxRate: item.taxRate,
                    subtotal: item.subtotal,
                    taxAmount: item.taxAmount,
                    amount: item.amount
                }))
            }
        }
    })

    return NextResponse.json({ invoiceId: invoice.id })
}
