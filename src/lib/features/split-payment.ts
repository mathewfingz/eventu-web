/**
 * Split Payment System
 * 
 * Enables group purchases where multiple people can share the cost
 * of tickets, each paying their portion separately.
 */

import { createClient } from '@/lib/supabase/server';
import { getPaymentConfig } from '../payments/config';

export interface SplitGroup {
    id: string;
    orderId: string;
    creatorId: string;
    totalAmount: number;
    splitCount: number;
    amountPerPerson: number;
    expiresAt: Date;
    status: 'PENDING' | 'PARTIAL' | 'COMPLETE' | 'EXPIRED' | 'CANCELLED';
    participants: SplitParticipant[];
    createdAt: Date;
}

export interface SplitParticipant {
    id: string;
    splitGroupId: string;
    userId?: string;
    email: string;
    name: string;
    amount: number;
    status: 'INVITED' | 'ACCEPTED' | 'PAID' | 'DECLINED';
    paymentId?: string;
    paidAt?: Date;
    invitedAt: Date;
}

export interface CreateSplitRequest {
    orderId: string;
    totalAmount: number;
    participants: {
        email: string;
        name: string;
        amount?: number; // Optional custom amount, otherwise split equally
    }[];
    expiresInHours?: number;
}

export interface SplitResult {
    success: boolean;
    splitGroup?: SplitGroup;
    error?: string;
}

/**
 * Create a split payment group
 */
export async function createSplitPayment(
    request: CreateSplitRequest,
    creatorId: string
): Promise<SplitResult> {
    try {
        const supabase = await createClient();

        const splitCount = request.participants.length + 1; // +1 for creator
        const equalAmount = Math.ceil(request.totalAmount / splitCount);
        const expiresAt = new Date(Date.now() + (request.expiresInHours || 24) * 60 * 60 * 1000);

        // Create split group
        const { data: splitGroup, error: groupError } = await supabase
            .from('split_groups')
            .insert({
                order_id: request.orderId,
                creator_id: creatorId,
                total_amount: request.totalAmount,
                split_count: splitCount,
                amount_per_person: equalAmount,
                expires_at: expiresAt.toISOString(),
                status: 'PENDING',
            })
            .select()
            .single();

        if (groupError) {
            return { success: false, error: 'Error al crear grupo de pago' };
        }

        // Add creator as first participant (already accepted)
        await supabase
            .from('split_participants')
            .insert({
                split_group_id: splitGroup.id,
                user_id: creatorId,
                email: '', // Will be filled from user profile
                name: 'Organizador',
                amount: equalAmount,
                status: 'ACCEPTED',
            });

        // Add other participants
        const participantInserts = request.participants.map(p => ({
            split_group_id: splitGroup.id,
            email: p.email,
            name: p.name,
            amount: p.amount || equalAmount,
            status: 'INVITED',
        }));

        await supabase
            .from('split_participants')
            .insert(participantInserts);

        // Get full participant list
        const { data: participants } = await supabase
            .from('split_participants')
            .select('*')
            .eq('split_group_id', splitGroup.id);

        console.log(`[Split] Created group ${splitGroup.id} with ${splitCount} participants`);

        return {
            success: true,
            splitGroup: {
                id: splitGroup.id,
                orderId: splitGroup.order_id,
                creatorId: splitGroup.creator_id,
                totalAmount: splitGroup.total_amount,
                splitCount: splitGroup.split_count,
                amountPerPerson: splitGroup.amount_per_person,
                expiresAt: new Date(splitGroup.expires_at),
                status: splitGroup.status,
                participants: participants?.map(p => ({
                    id: p.id,
                    splitGroupId: p.split_group_id,
                    userId: p.user_id,
                    email: p.email,
                    name: p.name,
                    amount: p.amount,
                    status: p.status,
                    paymentId: p.payment_id,
                    paidAt: p.paid_at ? new Date(p.paid_at) : undefined,
                    invitedAt: new Date(p.created_at),
                })) || [],
                createdAt: new Date(splitGroup.created_at),
            },
        };
    } catch (error) {
        console.error('[Split] Create failed:', error);
        return { success: false, error: 'Error interno' };
    }
}

/**
 * Get split group details
 */
export async function getSplitGroup(splitGroupId: string): Promise<SplitGroup | null> {
    try {
        const supabase = await createClient();

        const { data: group, error } = await supabase
            .from('split_groups')
            .select(`
        *,
        participants:split_participants(*)
      `)
            .eq('id', splitGroupId)
            .single();

        if (error || !group) {
            return null;
        }

        return {
            id: group.id,
            orderId: group.order_id,
            creatorId: group.creator_id,
            totalAmount: group.total_amount,
            splitCount: group.split_count,
            amountPerPerson: group.amount_per_person,
            expiresAt: new Date(group.expires_at),
            status: group.status,
            participants: group.participants?.map((p: any) => ({
                id: p.id,
                splitGroupId: p.split_group_id,
                userId: p.user_id,
                email: p.email,
                name: p.name,
                amount: p.amount,
                status: p.status,
                paymentId: p.payment_id,
                paidAt: p.paid_at ? new Date(p.paid_at) : undefined,
                invitedAt: new Date(p.created_at),
            })) || [],
            createdAt: new Date(group.created_at),
        };
    } catch (error) {
        console.error('[Split] Get group failed:', error);
        return null;
    }
}

/**
 * Record participant payment
 */
export async function recordParticipantPayment(
    participantId: string,
    paymentId: string
): Promise<boolean> {
    try {
        const supabase = await createClient();

        // Update participant
        await supabase
            .from('split_participants')
            .update({
                status: 'PAID',
                payment_id: paymentId,
                paid_at: new Date().toISOString(),
            })
            .eq('id', participantId);

        // Get split group to check if complete
        const { data: participant } = await supabase
            .from('split_participants')
            .select('split_group_id')
            .eq('id', participantId)
            .single();

        if (participant) {
            const { data: allParticipants } = await supabase
                .from('split_participants')
                .select('status')
                .eq('split_group_id', participant.split_group_id);

            const allPaid = allParticipants?.every(p => p.status === 'PAID');
            const anyPaid = allParticipants?.some(p => p.status === 'PAID');

            // Update group status
            let newStatus = 'PENDING';
            if (allPaid) {
                newStatus = 'COMPLETE';
            } else if (anyPaid) {
                newStatus = 'PARTIAL';
            }

            await supabase
                .from('split_groups')
                .update({ status: newStatus })
                .eq('id', participant.split_group_id);

            // If complete, create tickets
            if (allPaid) {
                // TODO: Create tickets for all participants
                console.log(`[Split] Group ${participant.split_group_id} complete - generating tickets`);
            }
        }

        return true;
    } catch (error) {
        console.error('[Split] Record payment failed:', error);
        return false;
    }
}

/**
 * Generate share link for split payment
 */
export function generateSplitShareLink(splitGroupId: string, participantId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventu.co';
    return `${baseUrl}/split/${splitGroupId}?participant=${participantId}`;
}

/**
 * Send invitations to participants
 */
export async function sendSplitInvitations(
    splitGroup: SplitGroup,
    eventName: string
): Promise<boolean> {
    try {
        // TODO: Implement email sending via Resend/SendGrid
        for (const participant of splitGroup.participants) {
            if (participant.status === 'INVITED') {
                const link = generateSplitShareLink(splitGroup.id, participant.id);
                console.log(`[Split] Would send invite to ${participant.email}: ${link}`);

                // await sendEmail({
                //   to: participant.email,
                //   subject: `${participant.name}, te invitaron a compartir boletas para ${eventName}`,
                //   template: 'split-invite',
                //   data: { participantName: participant.name, eventName, amount: participant.amount, link },
                // });
            }
        }

        return true;
    } catch (error) {
        console.error('[Split] Send invitations failed:', error);
        return false;
    }
}
