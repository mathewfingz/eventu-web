/**
 * Analytics Engine
 * 
 * Core analytics tracking and metrics calculation.
 * Designed to work across Web and iOS apps.
 * 
 * Events are tracked to Supabase and can be queried for dashboards.
 */

import { createClient } from '@/lib/supabase/server';

// Event types for tracking
export type AnalyticsEventType =
    | 'PAGE_VIEW'
    | 'EVENT_VIEW'
    | 'TICKET_SELECT'
    | 'CHECKOUT_START'
    | 'CHECKOUT_COMPLETE'
    | 'PAYMENT_INITIATED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'TICKET_VALIDATED'
    | 'PRESALE_ACCESS'
    | 'SEARCH'
    | 'FILTER'
    | 'FAVORITE_ADD'
    | 'FAVORITE_REMOVE'
    | 'SHARE'
    | 'APP_OPEN'
    | 'PUSH_RECEIVED'
    | 'PUSH_OPENED';

export interface AnalyticsEvent {
    type: AnalyticsEventType;
    userId?: string;
    sessionId: string;
    eventId?: string;
    ticketTypeId?: string;
    orderId?: string;
    metadata?: Record<string, any>;
    platform: 'web' | 'ios' | 'android';
    appVersion?: string;
    timestamp: Date;
}

export interface DashboardMetrics {
    // Revenue
    totalRevenue: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;

    // Tickets
    totalTicketsSold: number;
    ticketsSoldToday: number;
    ticketsRemaining: number;
    occupancyRate: number;

    // Conversions
    pageViews: number;
    checkoutStarts: number;
    checkoutCompletions: number;
    conversionRate: number;
    abandonmentRate: number;

    // Real-time
    activeUsers: number;
    usersInCheckout: number;
    usersInQueue: number;
}

export interface TimeSeriesData {
    timestamp: string;
    value: number;
}

export interface EventAnalytics {
    eventId: string;
    metrics: DashboardMetrics;
    salesByTicketType: { ticketType: string; sold: number; revenue: number }[];
    salesByHour: TimeSeriesData[];
    salesByDay: TimeSeriesData[];
    topCities: { city: string; count: number }[];
    paymentMethods: { method: string; count: number; amount: number }[];
    conversionFunnel: {
        pageViews: number;
        ticketSelects: number;
        checkoutStarts: number;
        paymentInitiated: number;
        paymentSuccess: number;
    };
}

/**
 * Track an analytics event
 * Called from both web and mobile apps
 */
export async function trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<boolean> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('analytics_events')
            .insert({
                type: event.type,
                user_id: event.userId,
                session_id: event.sessionId,
                event_id: event.eventId,
                ticket_type_id: event.ticketTypeId,
                order_id: event.orderId,
                metadata: event.metadata,
                platform: event.platform,
                app_version: event.appVersion,
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error('[Analytics] Track failed:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Analytics] Track error:', error);
        return false;
    }
}

/**
 * Track multiple events at once (batch for mobile offline sync)
 */
export async function trackEventsBatch(events: Omit<AnalyticsEvent, 'timestamp'>[]): Promise<boolean> {
    try {
        const supabase = await createClient();

        const rows = events.map(event => ({
            type: event.type,
            user_id: event.userId,
            session_id: event.sessionId,
            event_id: event.eventId,
            ticket_type_id: event.ticketTypeId,
            order_id: event.orderId,
            metadata: event.metadata,
            platform: event.platform,
            app_version: event.appVersion,
            created_at: new Date().toISOString(),
        }));

        const { error } = await supabase
            .from('analytics_events')
            .insert(rows);

        if (error) {
            console.error('[Analytics] Batch track failed:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Analytics] Batch track error:', error);
        return false;
    }
}

/**
 * Get dashboard metrics for an event
 */
export async function getEventAnalytics(eventId: string): Promise<EventAnalytics | null> {
    try {
        const supabase = await createClient();

        // Get event details with ticket types
        const { data: event } = await supabase
            .from('events')
            .select(`
        *,
        ticket_types(id, name, price, quantity, sold_count)
      `)
            .eq('id', eventId)
            .single();

        if (!event) return null;

        // Get orders for this event
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'PAID');

        // Calculate metrics
        const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const totalTicketsSold = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.sold_count || 0), 0) || 0;
        const totalCapacity = event.ticket_types?.reduce((sum: number, t: any) => sum + (t.quantity || 0), 0) || 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ordersToday = orders?.filter(o => new Date(o.created_at) >= today) || [];
        const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const ticketsSoldToday = ordersToday.reduce((sum, o) => sum + (o.ticket_count || 1), 0);

        // Get analytics events for funnel
        const { data: analyticsEvents } = await supabase
            .from('analytics_events')
            .select('type')
            .eq('event_id', eventId);

        const eventCounts = analyticsEvents?.reduce((acc: Record<string, number>, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
        }, {}) || {};

        // Sales by ticket type
        const salesByTicketType = event.ticket_types?.map((t: any) => ({
            ticketType: t.name,
            sold: t.sold_count || 0,
            revenue: (t.sold_count || 0) * t.price,
        })) || [];

        // Get sales by hour (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .eq('event_id', eventId)
            .eq('status', 'PAID')
            .gte('created_at', oneDayAgo);

        const salesByHour: TimeSeriesData[] = [];
        for (let i = 0; i < 24; i++) {
            const hourStart = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
            hourStart.setMinutes(0, 0, 0);
            const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

            const hourRevenue = recentOrders?.filter(o => {
                const orderDate = new Date(o.created_at);
                return orderDate >= hourStart && orderDate < hourEnd;
            }).reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

            salesByHour.push({
                timestamp: hourStart.toISOString(),
                value: hourRevenue,
            });
        }

        // Get payment methods breakdown
        const paymentMethodCounts: Record<string, { count: number; amount: number }> = {};
        orders?.forEach(o => {
            const method = o.payment_method || 'unknown';
            if (!paymentMethodCounts[method]) {
                paymentMethodCounts[method] = { count: 0, amount: 0 };
            }
            paymentMethodCounts[method].count++;
            paymentMethodCounts[method].amount += o.total_amount || 0;
        });

        const paymentMethods = Object.entries(paymentMethodCounts).map(([method, data]) => ({
            method,
            count: data.count,
            amount: data.amount,
        }));

        // Calculate conversion funnel
        const pageViews = eventCounts['PAGE_VIEW'] || eventCounts['EVENT_VIEW'] || 0;
        const ticketSelects = eventCounts['TICKET_SELECT'] || 0;
        const checkoutStarts = eventCounts['CHECKOUT_START'] || 0;
        const paymentInitiated = eventCounts['PAYMENT_INITIATED'] || 0;
        const paymentSuccess = eventCounts['PAYMENT_SUCCESS'] || orders?.length || 0;

        const conversionRate = pageViews > 0 ? (paymentSuccess / pageViews) * 100 : 0;
        const abandonmentRate = checkoutStarts > 0
            ? ((checkoutStarts - paymentSuccess) / checkoutStarts) * 100
            : 0;

        return {
            eventId,
            metrics: {
                totalRevenue,
                revenueToday,
                revenueThisWeek: totalRevenue, // Simplified
                revenueThisMonth: totalRevenue,
                totalTicketsSold,
                ticketsSoldToday,
                ticketsRemaining: totalCapacity - totalTicketsSold,
                occupancyRate: totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0,
                pageViews,
                checkoutStarts,
                checkoutCompletions: paymentSuccess,
                conversionRate,
                abandonmentRate,
                activeUsers: 0, // Would come from real-time system
                usersInCheckout: 0,
                usersInQueue: 0,
            },
            salesByTicketType,
            salesByHour,
            salesByDay: [], // Would calculate from longer time range
            topCities: [], // Would aggregate from orders
            paymentMethods,
            conversionFunnel: {
                pageViews,
                ticketSelects,
                checkoutStarts,
                paymentInitiated,
                paymentSuccess,
            },
        };
    } catch (error) {
        console.error('[Analytics] Get event analytics failed:', error);
        return null;
    }
}

/**
 * Get organizer-wide analytics
 */
export async function getOrganizerAnalytics(organizerId: string): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalRevenue: number;
    totalTicketsSold: number;
    recentEvents: { id: string; name: string; revenue: number; sold: number }[];
}> {
    try {
        const supabase = await createClient();

        // Get all events for this organizer
        const { data: events } = await supabase
            .from('events')
            .select(`
        id,
        name,
        status,
        date,
        orders(total_amount, ticket_count, status)
      `)
            .eq('organizer_id', organizerId);

        if (!events) {
            return {
                totalEvents: 0,
                activeEvents: 0,
                totalRevenue: 0,
                totalTicketsSold: 0,
                recentEvents: [],
            };
        }

        const now = new Date();
        const activeEvents = events.filter(e => new Date(e.date) >= now).length;

        let totalRevenue = 0;
        let totalTicketsSold = 0;

        const recentEvents = events.slice(0, 5).map(e => {
            const paidOrders = (e.orders as any[])?.filter(o => o.status === 'PAID') || [];
            const eventRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
            const eventSold = paidOrders.reduce((sum, o) => sum + (o.ticket_count || 1), 0);

            totalRevenue += eventRevenue;
            totalTicketsSold += eventSold;

            return {
                id: e.id,
                name: e.name,
                revenue: eventRevenue,
                sold: eventSold,
            };
        });

        return {
            totalEvents: events.length,
            activeEvents,
            totalRevenue,
            totalTicketsSold,
            recentEvents,
        };
    } catch (error) {
        console.error('[Analytics] Get organizer analytics failed:', error);
        return {
            totalEvents: 0,
            activeEvents: 0,
            totalRevenue: 0,
            totalTicketsSold: 0,
            recentEvents: [],
        };
    }
}
