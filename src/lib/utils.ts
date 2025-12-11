import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => serializeData(item)) as unknown as T
    }

    // Handle Decimal
    if ((data as any).constructor?.name === 'Decimal' || typeof (data as any).toNumber === 'function') {
      return (data as any).toNumber()
    }

    // Handle Date
    if (data instanceof Date) {
      return data.toISOString() as unknown as T
    }

    // Handle plain objects
    const serialized: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeData((data as any)[key])
      }
    }
    return serialized as T
  }

  return data
}
