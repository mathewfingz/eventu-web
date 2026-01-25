/**
 * Deal Score Algorithm
 * 
 * Calculates a "deal score" for tickets based on multiple factors,
 * helping users identify good value purchases.
 * 
 * Score range: 0-100
 * - 90-100: Exceptional Deal 🔥
 * - 70-89: Good Deal ✨
 * - 50-69: Fair Price
 * - Below 50: Above Market
 */

export interface DealScoreFactors {
    // Current price
    currentPrice: number;

    // Original/face value price
    originalPrice: number;

    // Average resale price in market (if available)
    marketAveragePrice?: number;

    // Days until event
    daysUntilEvent: number;

    // Demand indicator (0-1, where 1 is highest demand)
    demandScore?: number;

    // Seat quality score (0-1, where 1 is best seats)
    seatQualityScore?: number;

    // Historical price data points for this event type
    historicalPrices?: number[];

    // Is this a verified seller?
    isVerifiedSeller?: boolean;

    // Seller rating (0-5)
    sellerRating?: number;
}

export interface DealScoreResult {
    score: number; // 0-100
    rating: 'exceptional' | 'good' | 'fair' | 'above_market';
    label: string;
    emoji: string;
    priceVsOriginal: number; // % difference from original
    priceVsMarket?: number; // % difference from market average
    factors: {
        priceScore: number;
        timingScore: number;
        demandScore: number;
        sellerScore: number;
    };
    recommendation: string;
}

/**
 * Calculate deal score for a ticket
 */
export function calculateDealScore(factors: DealScoreFactors): DealScoreResult {
    const {
        currentPrice,
        originalPrice,
        marketAveragePrice,
        daysUntilEvent,
        demandScore = 0.5,
        seatQualityScore = 0.5,
        historicalPrices = [],
        isVerifiedSeller = true,
        sellerRating = 4,
    } = factors;

    // 1. Price Score (40% weight)
    // Compare to original and market prices
    let priceScore = 0;
    const priceRatio = currentPrice / originalPrice;

    if (priceRatio <= 0.7) {
        priceScore = 100; // 30%+ off = perfect
    } else if (priceRatio <= 0.85) {
        priceScore = 90; // 15-30% off = excellent
    } else if (priceRatio <= 1.0) {
        priceScore = 80; // At or below face = great
    } else if (priceRatio <= 1.15) {
        priceScore = 60; // Up to 15% markup = fair
    } else if (priceRatio <= 1.3) {
        priceScore = 40; // 15-30% markup = below average
    } else {
        priceScore = Math.max(0, 30 - (priceRatio - 1.3) * 50);
    }

    // Adjust for market average if available
    if (marketAveragePrice) {
        const marketRatio = currentPrice / marketAveragePrice;
        if (marketRatio < 0.9) {
            priceScore = Math.min(100, priceScore + 15); // Below market = bonus
        } else if (marketRatio > 1.1) {
            priceScore = Math.max(0, priceScore - 10); // Above market = penalty
        }
    }

    // 2. Timing Score (25% weight)
    // Prices typically drop closer to event (except for sold-out events)
    let timingScore = 50;

    if (daysUntilEvent > 60) {
        // Far out - neutral
        timingScore = 50;
    } else if (daysUntilEvent > 30) {
        // 1-2 months - good time to buy
        timingScore = 70;
    } else if (daysUntilEvent > 7) {
        // 1-4 weeks - last minute deals possible
        timingScore = 80;
    } else if (daysUntilEvent > 1) {
        // Final week - high demand, variable
        timingScore = demandScore > 0.7 ? 40 : 85;
    } else {
        // Day of - desperation pricing (could be good or bad)
        timingScore = 60;
    }

    // 3. Demand Adjustment Score (20% weight)
    // Low demand = better deals, high demand = harder to find deals
    const adjustedDemandScore = (1 - demandScore) * 100;

    // 4. Seller Score (15% weight)
    let sellerScore = 50;
    if (isVerifiedSeller) {
        sellerScore += 25;
    }
    sellerScore += (sellerRating / 5) * 25;

    // Calculate weighted final score
    const finalScore = Math.round(
        priceScore * 0.40 +
        timingScore * 0.25 +
        adjustedDemandScore * 0.20 +
        sellerScore * 0.15
    );

    // Determine rating
    let rating: DealScoreResult['rating'];
    let label: string;
    let emoji: string;
    let recommendation: string;

    if (finalScore >= 90) {
        rating = 'exceptional';
        label = 'Oferta Excepcional';
        emoji = '🔥';
        recommendation = '¡No lo pienses! Este precio está muy por debajo del mercado.';
    } else if (finalScore >= 70) {
        rating = 'good';
        label = 'Buen Precio';
        emoji = '✨';
        recommendation = 'Un precio competitivo. Recomendamos comprar.';
    } else if (finalScore >= 50) {
        rating = 'fair';
        label = 'Precio Justo';
        emoji = '👍';
        recommendation = 'Precio razonable. Podrías encontrar algo mejor si esperas.';
    } else {
        rating = 'above_market';
        label = 'Sobre el Mercado';
        emoji = '📊';
        recommendation = 'El precio está por encima del promedio. Considera otras opciones.';
    }

    // Calculate % differences
    const priceVsOriginal = Math.round(((currentPrice - originalPrice) / originalPrice) * 100);
    const priceVsMarket = marketAveragePrice
        ? Math.round(((currentPrice - marketAveragePrice) / marketAveragePrice) * 100)
        : undefined;

    return {
        score: finalScore,
        rating,
        label,
        emoji,
        priceVsOriginal,
        priceVsMarket,
        factors: {
            priceScore: Math.round(priceScore),
            timingScore: Math.round(timingScore),
            demandScore: Math.round(adjustedDemandScore),
            sellerScore: Math.round(sellerScore),
        },
        recommendation,
    };
}

/**
 * Get deal score badge color
 */
export function getDealScoreColor(score: number): string {
    if (score >= 90) return '#22C55E'; // Green
    if (score >= 70) return '#EAB308'; // Yellow
    if (score >= 50) return '#F97316'; // Orange
    return '#EF4444'; // Red
}

/**
 * Format deal score for display
 */
export function formatDealScore(score: number): string {
    return `${score}/100`;
}
