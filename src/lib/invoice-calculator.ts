// Currency utilities
export const CURRENCIES = {
    INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
    USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
    EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
    GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
    const curr = CURRENCIES[currency]
    if (currency === 'INR') {
        // Indian number format: ₹1,00,000
        return `${curr.symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    // International format: $1,000.00
    return `${curr.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Tax calculation utilities
export interface InvoiceItemCalculation {
    description: string
    hsnCode?: string
    quantity: number
    rate: number
    taxRate: number
    subtotal: number
    taxAmount: number
    amount: number
}

export interface InvoiceTotals {
    subtotal: number
    taxAmount: number
    total: number
}

export function calculateItemTax(quantity: number, rate: number, taxRate: number): InvoiceItemCalculation {
    const subtotal = quantity * rate
    const taxAmount = subtotal * (taxRate / 100)
    const amount = subtotal + taxAmount

    return {
        description: '',
        quantity,
        rate,
        taxRate,
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        amount: Number(amount.toFixed(2))
    }
}

export function calculateInvoiceTotals(items: InvoiceItemCalculation[]): InvoiceTotals {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0)
    const total = subtotal + taxAmount

    return {
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        total: Number(total.toFixed(2))
    }
}

// Tax type utilities
export const TAX_TYPES = {
    NONE: { label: 'No Tax', rate: 0 },
    GST: { label: 'GST', rate: 18 },
    VAT: { label: 'VAT', rate: 20 },
} as const

export type TaxType = keyof typeof TAX_TYPES

export function getDefaultTaxRate(taxType: TaxType): number {
    return TAX_TYPES[taxType].rate
}
