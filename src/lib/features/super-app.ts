/**
 * Super-App Features
 * 
 * Additional venue services that can be ordered through the app:
 * - Food & Beverages
 * - Merchandise
 * - Parking
 * - Upgrades
 */

import { createClient } from '@/lib/supabase/server';

export type ServiceCategory = 'FOOD' | 'DRINKS' | 'MERCHANDISE' | 'PARKING' | 'UPGRADE' | 'VIP_ACCESS';

export interface VenueService {
    id: string;
    venueId: string;
    eventId?: string; // Optional - can be venue-wide or event-specific
    category: ServiceCategory;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    available: boolean;
    maxQuantity: number;
    variations?: ServiceVariation[];
}

export interface ServiceVariation {
    id: string;
    name: string;
    priceModifier: number; // Additional cost
}

export interface ServiceOrder {
    id: string;
    userId: string;
    ticketId: string;
    eventId: string;
    items: ServiceOrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    pickupLocation?: string;
    pickupTime?: Date;
    qrCode?: string;
    createdAt: Date;
}

export interface ServiceOrderItem {
    serviceId: string;
    serviceName: string;
    variationId?: string;
    variationName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface CreateServiceOrderRequest {
    ticketId: string;
    eventId: string;
    items: {
        serviceId: string;
        variationId?: string;
        quantity: number;
        notes?: string;
    }[];
    pickupTime?: Date;
}

/**
 * Get available services for a venue/event
 */
export async function getVenueServices(
    venueId: string,
    eventId?: string,
    category?: ServiceCategory
): Promise<VenueService[]> {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('venue_services')
            .select('*')
            .eq('venue_id', venueId)
            .eq('available', true);

        if (eventId) {
            query = query.or(`event_id.is.null,event_id.eq.${eventId}`);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data: services, error } = await query;

        if (error || !services) {
            return [];
        }

        return services.map(s => ({
            id: s.id,
            venueId: s.venue_id,
            eventId: s.event_id,
            category: s.category,
            name: s.name,
            description: s.description,
            price: s.price,
            imageUrl: s.image_url,
            available: s.available,
            maxQuantity: s.max_quantity,
            variations: s.variations,
        }));
    } catch (error) {
        console.error('[SuperApp] Get services failed:', error);
        return [];
    }
}

/**
 * Create a service order
 */
export async function createServiceOrder(
    request: CreateServiceOrderRequest,
    userId: string
): Promise<{ success: boolean; order?: ServiceOrder; error?: string }> {
    try {
        const supabase = await createClient();

        // Get services to calculate prices
        const serviceIds = request.items.map(i => i.serviceId);
        const { data: services } = await supabase
            .from('venue_services')
            .select('*')
            .in('id', serviceIds);

        if (!services || services.length === 0) {
            return { success: false, error: 'Servicios no encontrados' };
        }

        // Build order items with calculated prices
        const orderItems: ServiceOrderItem[] = [];
        let totalAmount = 0;

        for (const item of request.items) {
            const service = services.find(s => s.id === item.serviceId);
            if (!service) continue;

            let unitPrice = service.price;
            let variationName: string | undefined;

            // Apply variation modifier if selected
            if (item.variationId && service.variations) {
                const variation = service.variations.find((v: any) => v.id === item.variationId);
                if (variation) {
                    unitPrice += variation.priceModifier;
                    variationName = variation.name;
                }
            }

            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;

            orderItems.push({
                serviceId: item.serviceId,
                serviceName: service.name,
                variationId: item.variationId,
                variationName,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                notes: item.notes,
            });
        }

        // Create order
        const { data: order, error } = await supabase
            .from('service_orders')
            .insert({
                user_id: userId,
                ticket_id: request.ticketId,
                event_id: request.eventId,
                items: orderItems,
                total_amount: totalAmount,
                status: 'PENDING',
                pickup_time: request.pickupTime?.toISOString(),
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: 'Error al crear orden' };
        }

        console.log(`[SuperApp] Created service order ${order.id} for $${totalAmount}`);

        return {
            success: true,
            order: {
                id: order.id,
                userId: order.user_id,
                ticketId: order.ticket_id,
                eventId: order.event_id,
                items: order.items,
                totalAmount: order.total_amount,
                status: order.status,
                pickupLocation: order.pickup_location,
                pickupTime: order.pickup_time ? new Date(order.pickup_time) : undefined,
                qrCode: order.qr_code,
                createdAt: new Date(order.created_at),
            },
        };
    } catch (error) {
        console.error('[SuperApp] Create order failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Get user's service orders for an event
 */
export async function getUserServiceOrders(
    userId: string,
    eventId: string
): Promise<ServiceOrder[]> {
    try {
        const supabase = await createClient();

        const { data: orders, error } = await supabase
            .from('service_orders')
            .select('*')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error || !orders) {
            return [];
        }

        return orders.map(o => ({
            id: o.id,
            userId: o.user_id,
            ticketId: o.ticket_id,
            eventId: o.event_id,
            items: o.items,
            totalAmount: o.total_amount,
            status: o.status,
            pickupLocation: o.pickup_location,
            pickupTime: o.pickup_time ? new Date(o.pickup_time) : undefined,
            qrCode: o.qr_code,
            createdAt: new Date(o.created_at),
        }));
    } catch (error) {
        console.error('[SuperApp] Get orders failed:', error);
        return [];
    }
}

/**
 * Update service order status (for venue staff)
 */
export async function updateServiceOrderStatus(
    orderId: string,
    newStatus: ServiceOrder['status'],
    pickupLocation?: string
): Promise<boolean> {
    try {
        const supabase = await createClient();

        const updates: any = { status: newStatus };

        if (newStatus === 'READY' && pickupLocation) {
            updates.pickup_location = pickupLocation;
        }

        await supabase
            .from('service_orders')
            .update(updates)
            .eq('id', orderId);

        // TODO: Send push notification to user
        console.log(`[SuperApp] Order ${orderId} status updated to ${newStatus}`);

        return true;
    } catch (error) {
        console.error('[SuperApp] Update status failed:', error);
        return false;
    }
}
