
/**
 * Get exchange rate for currency conversion
 * Prefers custom rates from Settings, falls back to API or hardcoded rates
 */
export async function getExchangeRate(from: string, to: string = 'INR', customRates?: { usd?: number; eur?: number; gbp?: number }): Promise<number> {
    if (from === to) return 1;

    const fromUpper = from.toUpperCase();

    // Use custom rates if provided
    if (customRates) {
        if (fromUpper === 'USD' && customRates.usd) return customRates.usd;
        if (fromUpper === 'EUR' && customRates.eur) return customRates.eur;
        if (fromUpper === 'GBP' && customRates.gbp) return customRates.gbp;
    }

    // Try to get rates from Settings (database)
    try {
        const { prisma } = await import("@/lib/prisma");
        const settings = await prisma.settings.findFirst();

        if (settings) {
            if (fromUpper === 'USD' && settings.usdToInrRate) {
                return Number(settings.usdToInrRate);
            }
            if (fromUpper === 'EUR' && settings.eurToInrRate) {
                return Number(settings.eurToInrRate);
            }
            if (fromUpper === 'GBP' && settings.gbpToInrRate) {
                return Number(settings.gbpToInrRate);
            }
        }
    } catch (error) {
        console.error('Failed to fetch settings for exchange rates:', error);
    }

    // Fallback to default rates
    if (fromUpper === 'USD') return 84;
    if (fromUpper === 'EUR') return 90;
    if (fromUpper === 'GBP') return 105;

    return 1;
}

export async function convertToINR(amount: number, currency: string): Promise<number> {
    const rate = await getExchangeRate(currency, 'INR');
    return amount * rate;
}
