/**
 * Holds System
 * 
 * Manages ticket holds for sponsors, press, artists, and VIPs.
 * Holds can be converted to complimentary tickets when claimed.
 */

import { createClient } from '@/lib/supabase/server';

export type HoldType = 'SPONSOR' | 'PRESS' | 'ARTIST' | 'VIP' | 'PROMO';

export interface Hold {
    id: string;
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    holdType: HoldType;
    holderName: string;
    holderEmail?: string;
    holderCompany?: string;
    notes?: string;
    releaseAt?: Date;
    createdById: string;
    claimedQuantity: number;
    status: 'ACTIVE' | 'CLAIMED' | 'RELEASED' | 'EXPIRED';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateHoldRequest {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    holdType: HoldType;
    holderName: string;
    holderEmail?: string;
    holderCompany?: string;
    notes?: string;
    releaseAt?: Date;
}

export interface HoldResult {
    success: boolean;
    hold?: Hold;
    error?: string;
}

/**
 * Create a ticket hold
 */
export async function createHold(
    request: CreateHoldRequest,
    createdById: string
): Promise<HoldResult> {
    try {
        const supabase = await createClient();

        // Check available inventory for this ticket type
        const { data: ticketType, error: ticketError } = await supabase
            .from('ticket_types')
            .select('available_quantity, held_quantity')
            .eq('id', request.ticketTypeId)
            .single();

        if (ticketError || !ticketType) {
            return { success: false, error: 'Tipo de boleta no encontrado' };
        }

        const availableForHold = ticketType.available_quantity - (ticketType.held_quantity || 0);

        if (availableForHold < request.quantity) {
            return {
                success: false,
                error: `Solo hay ${availableForHold} boletas disponibles para hold`
            };
        }

        // Create hold record
        const { data: hold, error: holdError } = await supabase
            .from('holds')
            .insert({
                event_id: request.eventId,
                ticket_type_id: request.ticketTypeId,
                quantity: request.quantity,
                hold_type: request.holdType,
                holder_name: request.holderName,
                holder_email: request.holderEmail,
                holder_company: request.holderCompany,
                notes: request.notes,
                release_at: request.releaseAt?.toISOString(),
                created_by_id: createdById,
                claimed_quantity: 0,
                status: 'ACTIVE',
            })
            .select()
            .single();

        if (holdError) {
            return { success: false, error: 'Error al crear hold' };
        }

        // Update held quantity on ticket type
        await supabase
            .from('ticket_types')
            .update({
                held_quantity: (ticketType.held_quantity || 0) + request.quantity
            })
            .eq('id', request.ticketTypeId);

        console.log(`[Holds] Created ${request.holdType} hold for ${request.holderName}: ${request.quantity} tickets`);

        return {
            success: true,
            hold: {
                id: hold.id,
                eventId: hold.event_id,
                ticketTypeId: hold.ticket_type_id,
                quantity: hold.quantity,
                holdType: hold.hold_type,
                holderName: hold.holder_name,
                holderEmail: hold.holder_email,
                holderCompany: hold.holder_company,
                notes: hold.notes,
                releaseAt: hold.release_at ? new Date(hold.release_at) : undefined,
                createdById: hold.created_by_id,
                claimedQuantity: hold.claimed_quantity,
                status: hold.status,
                createdAt: new Date(hold.created_at),
                updatedAt: new Date(hold.updated_at),
            }
        };
    } catch (error) {
        console.error('[Holds] Create failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Claim tickets from a hold
 */
export async function claimHold(
    holdId: string,
    claimQuantity: number,
    recipientEmail: string,
    recipientName: string
): Promise<HoldResult> {
    try {
        const supabase = await createClient();

        // Get hold
        const { data: hold, error: holdError } = await supabase
            .from('holds')
            .select('*')
            .eq('id', holdId)
            .eq('status', 'ACTIVE')
            .single();

        if (holdError || !hold) {
            return { success: false, error: 'Hold no encontrado o no activo' };
        }

        const remainingQuantity = hold.quantity - hold.claimed_quantity;

        if (claimQuantity > remainingQuantity) {
            return {
                success: false,
                error: `Solo quedan ${remainingQuantity} boletas en este hold`
            };
        }

        // Create complimentary tickets
        const { error: ticketError } = await supabase
            .from('tickets')
            .insert(
                Array.from({ length: claimQuantity }, () => ({
                    ticket_type_id: hold.ticket_type_id,
                    event_id: hold.event_id,
                    hold_id: holdId,
                    status: 'ACTIVE',
                    is_complimentary: true,
                    holder_email: recipientEmail,
                    holder_name: recipientName,
                }))
            );

        if (ticketError) {
            return { success: false, error: 'Error al generar boletas' };
        }

        // Update hold
        const newClaimedQuantity = hold.claimed_quantity + claimQuantity;
        const newStatus = newClaimedQuantity >= hold.quantity ? 'CLAIMED' : 'ACTIVE';

        await supabase
            .from('holds')
            .update({
                claimed_quantity: newClaimedQuantity,
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', holdId);

        // Update held quantity on ticket type
        await supabase
            .from('ticket_types')
            .update({
                held_quantity: supabase.rpc('decrement', { x: claimQuantity })
            })
            .eq('id', hold.ticket_type_id);

        console.log(`[Holds] Claimed ${claimQuantity} tickets from hold ${holdId} for ${recipientEmail}`);

        return { success: true };
    } catch (error) {
        console.error('[Holds] Claim failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Release a hold back to inventory
 */
export async function releaseHold(holdId: string): Promise<HoldResult> {
    try {
        const supabase = await createClient();

        // Get hold
        const { data: hold, error: holdError } = await supabase
            .from('holds')
            .select('*')
            .eq('id', holdId)
            .eq('status', 'ACTIVE')
            .single();

        if (holdError || !hold) {
            return { success: false, error: 'Hold no encontrado o no activo' };
        }

        const unclaimedQuantity = hold.quantity - hold.claimed_quantity;

        // Update hold status
        await supabase
            .from('holds')
            .update({
                status: 'RELEASED',
                updated_at: new Date().toISOString(),
            })
            .eq('id', holdId);

        // Return unclaimed tickets to inventory
        if (unclaimedQuantity > 0) {
            await supabase
                .from('ticket_types')
                .update({
                    held_quantity: supabase.rpc('decrement', { x: unclaimedQuantity })
                })
                .eq('id', hold.ticket_type_id);
        }

        console.log(`[Holds] Released hold ${holdId} - ${unclaimedQuantity} tickets returned to inventory`);

        return { success: true };
    } catch (error) {
        console.error('[Holds] Release failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Get holds for an event
 */
export async function getEventHolds(eventId: string): Promise<Hold[]> {
    try {
        const supabase = await createClient();

        const { data: holds, error } = await supabase
            .from('holds')
            .select(`
        *,
        ticket_type:ticket_types(name),
        created_by:profiles(full_name)
      `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            return [];
        }

        return holds.map(h => ({
            id: h.id,
            eventId: h.event_id,
            ticketTypeId: h.ticket_type_id,
            quantity: h.quantity,
            holdType: h.hold_type,
            holderName: h.holder_name,
            holderEmail: h.holder_email,
            holderCompany: h.holder_company,
            notes: h.notes,
            releaseAt: h.release_at ? new Date(h.release_at) : undefined,
            createdById: h.created_by_id,
            claimedQuantity: h.claimed_quantity,
            status: h.status,
            createdAt: new Date(h.created_at),
            updatedAt: new Date(h.updated_at),
        }));
    } catch (error) {
        console.error('[Holds] Get event holds failed:', error);
        return [];
    }
}

/**
 * Check and release expired holds
 */
export async function releaseExpiredHolds(): Promise<number> {
    try {
        const supabase = await createClient();
        const now = new Date().toISOString();

        // Get expired holds
        const { data: expiredHolds, error } = await supabase
            .from('holds')
            .select('id')
            .eq('status', 'ACTIVE')
            .lt('release_at', now);

        if (error || !expiredHolds) {
            return 0;
        }

        let releasedCount = 0;

        for (const hold of expiredHolds) {
            const result = await releaseHold(hold.id);
            if (result.success) {
                // Update status to EXPIRED
                await supabase
                    .from('holds')
                    .update({ status: 'EXPIRED' })
                    .eq('id', hold.id);
                releasedCount++;
            }
        }

        console.log(`[Holds] Released ${releasedCount} expired holds`);
        return releasedCount;
    } catch (error) {
        console.error('[Holds] Release expired failed:', error);
        return 0;
    }
}
