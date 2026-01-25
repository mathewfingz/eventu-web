/**
 * Demand Prediction Algorithm
 * 
 * Uses historical data and patterns to predict ticket demand,
 * helping organizers with pricing and marketing decisions.
 */

import { createClient } from '@/lib/supabase/server';

export interface DemandPrediction {
    eventId: string;
    predictedSellOut: boolean;
    sellOutProbability: number; // 0-100
    daysToSellOut?: number;
    predictedRevenue: number;
    demandLevel: 'low' | 'medium' | 'high' | 'very_high';
    optimalPriceAdjustment: number; // % change recommendation
    factors: DemandFactor[];
    weeklyProjection: { week: number; tickets: number; revenue: number }[];
}

export interface DemandFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number; // -100 to 100
    description: string;
}

export interface HistoricalData {
    similarEvents: {
        eventId: string;
        name: string;
        artistGenre?: string;
        venueSize: number;
        ticketsSold: number;
        capacity: number;
        sellOutDays?: number;
        avgPrice: number;
    }[];
    seasonalTrends: { month: number; multiplier: number }[];
    artistPopularity?: number; // 0-100
    venuePopularity?: number; // 0-100
}

/**
 * Get demand prediction for an event
 */
export async function predictDemand(eventId: string): Promise<DemandPrediction | null> {
    try {
        const supabase = await createClient();

        // Get event details
        const { data: event } = await supabase
            .from('events')
            .select(`
        *,
        venue:venues(*),
        ticket_types(id, price, quantity, sold_count),
        category:categories(name)
      `)
            .eq('id', eventId)
            .single();

        if (!event) return null;

        // Get historical data for similar events
        const historicalData = await getHistoricalData(event);

        // Calculate prediction factors
        const factors = calculateDemandFactors(event, historicalData);

        // Calculate overall demand score
        const demandScore = calculateDemandScore(factors);

        // Calculate predictions
        const totalCapacity = event.ticket_types?.reduce((sum: number, t: any) => sum + t.quantity, 0) || 0;
        const currentSold = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.sold_count || 0), 0) || 0;
        const avgPrice = event.ticket_types?.reduce((sum: number, t: any) => sum + t.price, 0) / (event.ticket_types?.length || 1) || 0;

        const sellOutProbability = Math.min(100, Math.max(0, demandScore));
        const predictedSellOut = sellOutProbability >= 70;

        // Calculate days to sell out based on current sales velocity
        const daysSincePublish = Math.max(1, Math.floor((Date.now() - new Date(event.published_at || event.created_at).getTime()) / (1000 * 60 * 60 * 24)));
        const dailySalesRate = currentSold / daysSincePublish;
        const remainingTickets = totalCapacity - currentSold;
        const daysToSellOut = dailySalesRate > 0
            ? Math.ceil(remainingTickets / (dailySalesRate * (demandScore / 50)))
            : undefined;

        // Calculate predicted revenue
        const predictedRevenue = (totalCapacity * (sellOutProbability / 100)) * avgPrice;

        // Determine demand level
        let demandLevel: DemandPrediction['demandLevel'];
        if (demandScore >= 80) demandLevel = 'very_high';
        else if (demandScore >= 60) demandLevel = 'high';
        else if (demandScore >= 40) demandLevel = 'medium';
        else demandLevel = 'low';

        // Calculate optimal price adjustment
        let optimalPriceAdjustment = 0;
        if (demandScore >= 80 && currentSold / totalCapacity < 0.5) {
            optimalPriceAdjustment = Math.round((demandScore - 70) * 0.3); // Up to +9%
        } else if (demandScore < 40 && currentSold / totalCapacity < 0.3) {
            optimalPriceAdjustment = Math.round((demandScore - 50) * 0.2); // Down to -10%
        }

        // Generate weekly projection
        const daysUntilEvent = Math.max(0, Math.floor((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        const weeksRemaining = Math.ceil(daysUntilEvent / 7);

        const weeklyProjection = [];
        let projectedSold = currentSold;

        for (let week = 1; week <= Math.min(weeksRemaining, 8); week++) {
            // Sales accelerate closer to event
            const weekMultiplier = 1 + (week / weeksRemaining) * 0.5;
            const weeklyTickets = Math.min(
                Math.round(dailySalesRate * 7 * weekMultiplier * (demandScore / 50)),
                totalCapacity - projectedSold
            );

            projectedSold += weeklyTickets;

            weeklyProjection.push({
                week,
                tickets: projectedSold,
                revenue: projectedSold * avgPrice,
            });
        }

        return {
            eventId,
            predictedSellOut,
            sellOutProbability,
            daysToSellOut,
            predictedRevenue,
            demandLevel,
            optimalPriceAdjustment,
            factors,
            weeklyProjection,
        };
    } catch (error) {
        console.error('[DemandPrediction] Error:', error);
        return null;
    }
}

/**
 * Get historical data for similar events
 */
async function getHistoricalData(event: any): Promise<HistoricalData> {
    const supabase = await createClient();

    // Find similar events (same category, similar venue size)
    const { data: similarEvents } = await supabase
        .from('events')
        .select(`
      id,
      name,
      ticket_types(quantity, sold_count, price),
      venue:venues(capacity)
    `)
        .eq('category_id', event.category_id)
        .eq('status', 'COMPLETED')
        .limit(10);

    const processedEvents = similarEvents?.map(e => ({
        eventId: e.id,
        name: e.name,
        venueSize: (e.venue as any)?.capacity || 0,
        ticketsSold: e.ticket_types?.reduce((sum: number, t: any) => sum + (t.sold_count || 0), 0) || 0,
        capacity: e.ticket_types?.reduce((sum: number, t: any) => sum + t.quantity, 0) || 0,
        avgPrice: e.ticket_types?.reduce((sum: number, t: any) => sum + t.price, 0) / (e.ticket_types?.length || 1) || 0,
    })) || [];

    // Seasonal trends (Colombia-specific)
    const seasonalTrends = [
        { month: 1, multiplier: 0.9 },  // January - post holidays
        { month: 2, multiplier: 1.0 },  // February - normal
        { month: 3, multiplier: 1.1 },  // March - semana santa prep
        { month: 4, multiplier: 0.8 },  // April - semana santa
        { month: 5, multiplier: 1.0 },  // May - normal
        { month: 6, multiplier: 1.2 },  // June - mid-year bonus
        { month: 7, multiplier: 1.1 },  // July - vacations
        { month: 8, multiplier: 1.0 },  // August - back to school
        { month: 9, multiplier: 1.1 },  // September - love month
        { month: 10, multiplier: 1.2 }, // October - halloween
        { month: 11, multiplier: 1.3 }, // November - black friday
        { month: 12, multiplier: 1.5 }, // December - christmas bonus
    ];

    return {
        similarEvents: processedEvents,
        seasonalTrends,
        artistPopularity: 70, // Would come from Spotify/social media API
        venuePopularity: 80, // Would come from historical venue data
    };
}

/**
 * Calculate demand factors
 */
function calculateDemandFactors(event: any, historical: HistoricalData): DemandFactor[] {
    const factors: DemandFactor[] = [];

    // 1. Artist/Category popularity
    if (historical.artistPopularity !== undefined) {
        factors.push({
            name: 'Popularidad del artista',
            impact: historical.artistPopularity >= 70 ? 'positive' : historical.artistPopularity >= 50 ? 'neutral' : 'negative',
            weight: (historical.artistPopularity - 50) * 2, // -100 to +100
            description: `Nivel de popularidad: ${historical.artistPopularity}/100`,
        });
    }

    // 2. Venue factor
    if (historical.venuePopularity !== undefined) {
        factors.push({
            name: 'Popularidad del venue',
            impact: historical.venuePopularity >= 70 ? 'positive' : 'neutral',
            weight: (historical.venuePopularity - 50) * 0.5,
            description: `${event.venue?.name || 'Venue'} tiene buena reputación`,
        });
    }

    // 3. Seasonal factor
    const eventMonth = new Date(event.date).getMonth() + 1;
    const seasonalMultiplier = historical.seasonalTrends.find(s => s.month === eventMonth)?.multiplier || 1;
    factors.push({
        name: 'Factor estacional',
        impact: seasonalMultiplier > 1.1 ? 'positive' : seasonalMultiplier < 0.9 ? 'negative' : 'neutral',
        weight: (seasonalMultiplier - 1) * 100,
        description: seasonalMultiplier > 1
            ? 'Temporada alta para eventos'
            : 'Temporada baja para eventos',
    });

    // 4. Days until event
    const daysUntilEvent = Math.max(0, Math.floor((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    factors.push({
        name: 'Tiempo hasta el evento',
        impact: daysUntilEvent < 7 ? 'negative' : daysUntilEvent > 60 ? 'positive' : 'neutral',
        weight: daysUntilEvent > 30 ? 20 : daysUntilEvent > 7 ? 0 : -30,
        description: `Faltan ${daysUntilEvent} días`,
    });

    // 5. Current sales velocity
    const currentSold = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.sold_count || 0), 0) || 0;
    const totalCapacity = event.ticket_types?.reduce((sum: number, t: any) => sum + t.quantity, 0) || 0;
    const sellThroughRate = totalCapacity > 0 ? (currentSold / totalCapacity) * 100 : 0;

    factors.push({
        name: 'Velocidad de ventas',
        impact: sellThroughRate > 50 ? 'positive' : sellThroughRate > 20 ? 'neutral' : 'negative',
        weight: (sellThroughRate - 30) * 2,
        description: `${sellThroughRate.toFixed(1)}% vendido`,
    });

    // 6. Price competitiveness
    const avgPrice = event.ticket_types?.[0]?.price || 0;
    const historicalAvg = historical.similarEvents.reduce((sum, e) => sum + e.avgPrice, 0) / (historical.similarEvents.length || 1);
    const priceRatio = historicalAvg > 0 ? avgPrice / historicalAvg : 1;

    factors.push({
        name: 'Competitividad de precio',
        impact: priceRatio < 0.9 ? 'positive' : priceRatio > 1.2 ? 'negative' : 'neutral',
        weight: (1 - priceRatio) * 50,
        description: priceRatio < 1 ? 'Precio por debajo del promedio' : 'Precio por encima del promedio',
    });

    // 7. Social buzz (would come from social media API)
    factors.push({
        name: 'Actividad en redes',
        impact: 'positive',
        weight: 15, // Placeholder
        description: 'Menciones y engagement en redes sociales',
    });

    return factors;
}

/**
 * Calculate overall demand score from factors
 */
function calculateDemandScore(factors: DemandFactor[]): number {
    // Base score of 50
    let score = 50;

    // Add weighted factors
    for (const factor of factors) {
        score += factor.weight * 0.3; // Normalize impact
    }

    // Clamp to 0-100
    return Math.min(100, Math.max(0, score));
}

/**
 * Get demand insights for mobile dashboard
 */
export async function getDemandInsights(eventId: string): Promise<{
    summary: string;
    recommendation: string;
    alertLevel: 'green' | 'yellow' | 'red';
}> {
    const prediction = await predictDemand(eventId);

    if (!prediction) {
        return {
            summary: 'No hay suficientes datos para predicción',
            recommendation: 'Continúa monitoreando las ventas',
            alertLevel: 'yellow',
        };
    }

    let summary: string;
    let recommendation: string;
    let alertLevel: 'green' | 'yellow' | 'red';

    if (prediction.demandLevel === 'very_high') {
        summary = `🔥 Demanda muy alta. ${prediction.sellOutProbability}% de probabilidad de sold out.`;
        recommendation = prediction.optimalPriceAdjustment > 0
            ? `Considera aumentar precios ${prediction.optimalPriceAdjustment}%`
            : 'Mantén la estrategia actual';
        alertLevel = 'green';
    } else if (prediction.demandLevel === 'high') {
        summary = `✨ Buena demanda. ${prediction.sellOutProbability}% de probabilidad de sold out.`;
        recommendation = 'Las ventas van bien. Considera promociones para acelerar.';
        alertLevel = 'green';
    } else if (prediction.demandLevel === 'medium') {
        summary = `📊 Demanda moderada. ${prediction.sellOutProbability}% de probabilidad de sold out.`;
        recommendation = 'Aumenta marketing y considera descuentos por tiempo limitado.';
        alertLevel = 'yellow';
    } else {
        summary = `⚠️ Demanda baja. ${prediction.sellOutProbability}% de probabilidad de sold out.`;
        recommendation = `Reduce precios ${Math.abs(prediction.optimalPriceAdjustment)}% y aumenta pauta digital.`;
        alertLevel = 'red';
    }

    return { summary, recommendation, alertLevel };
}
