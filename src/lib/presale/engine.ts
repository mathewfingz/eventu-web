/**
 * Presale Engine
 * 
 * Validates access to presales based on various rule types:
 * - CODE: Promo/access codes
 * - BIN: Credit card BIN validation (e.g., Bancolombia cards)
 * - NFT: NFT ownership verification
 * - EMAIL_DOMAIN: Email domain restriction (e.g., @empresa.com)
 * - SUBSCRIPTION: Subscription tier requirement
 */

import { createClient } from '@/lib/supabase/server';

export type PresaleRuleType = 'CODE' | 'BIN' | 'NFT' | 'EMAIL_DOMAIN' | 'SUBSCRIPTION';

export interface PresaleRule {
    id: string;
    presaleId: string;
    type: PresaleRuleType;
    value: string; // Code, BIN prefix, domain, NFT contract, etc.
    maxUses?: number;
    currentUses: number;
    isActive: boolean;
}

export interface Presale {
    id: string;
    eventId: string;
    name: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    discountPercent?: number;
    discountAmount?: number;
    maxTickets?: number;
    ticketsSold: number;
    rules: PresaleRule[];
    isActive: boolean;
}

export interface PresaleValidationResult {
    valid: boolean;
    presale?: Presale;
    ruleMatched?: PresaleRule;
    error?: {
        code: 'INVALID_CODE' | 'EXPIRED' | 'NOT_STARTED' | 'SOLD_OUT' | 'MAX_USES' | 'NO_ACCESS';
        message: string;
    };
    discount?: {
        type: 'percent' | 'amount';
        value: number;
    };
}

/**
 * Get active presales for an event
 */
export async function getEventPresales(eventId: string): Promise<Presale[]> {
    try {
        const supabase = await createClient();
        const now = new Date().toISOString();

        const { data: presales, error } = await supabase
            .from('presales')
            .select(`
        *,
        rules:presale_rules(*)
      `)
            .eq('event_id', eventId)
            .eq('is_active', true)
            .lte('start_at', now)
            .gte('end_at', now);

        if (error || !presales) {
            return [];
        }

        return presales.map(p => ({
            id: p.id,
            eventId: p.event_id,
            name: p.name,
            description: p.description,
            startAt: new Date(p.start_at),
            endAt: new Date(p.end_at),
            discountPercent: p.discount_percent,
            discountAmount: p.discount_amount,
            maxTickets: p.max_tickets,
            ticketsSold: p.tickets_sold || 0,
            rules: p.rules?.map((r: any) => ({
                id: r.id,
                presaleId: r.presale_id,
                type: r.type,
                value: r.value,
                maxUses: r.max_uses,
                currentUses: r.current_uses || 0,
                isActive: r.is_active,
            })) || [],
            isActive: p.is_active,
        }));
    } catch (error) {
        console.error('[Presale] Get presales failed:', error);
        return [];
    }
}

/**
 * Validate presale access by code
 */
export async function validatePresaleCode(
    eventId: string,
    code: string
): Promise<PresaleValidationResult> {
    try {
        const supabase = await createClient();
        const now = new Date();

        // Find presale rule matching the code
        const { data: rule, error } = await supabase
            .from('presale_rules')
            .select(`
        *,
        presale:presales(*)
      `)
            .eq('type', 'CODE')
            .ilike('value', code)
            .eq('is_active', true)
            .single();

        if (error || !rule) {
            return {
                valid: false,
                error: {
                    code: 'INVALID_CODE',
                    message: 'Código de preventa inválido',
                },
            };
        }

        const presale = rule.presale;

        // Check presale timing
        const startAt = new Date(presale.start_at);
        const endAt = new Date(presale.end_at);

        if (now < startAt) {
            return {
                valid: false,
                error: {
                    code: 'NOT_STARTED',
                    message: `La preventa inicia el ${startAt.toLocaleDateString()}`,
                },
            };
        }

        if (now > endAt) {
            return {
                valid: false,
                error: {
                    code: 'EXPIRED',
                    message: 'Esta preventa ha expirado',
                },
            };
        }

        // Check max uses
        if (rule.max_uses && rule.current_uses >= rule.max_uses) {
            return {
                valid: false,
                error: {
                    code: 'MAX_USES',
                    message: 'Este código ha alcanzado el límite de usos',
                },
            };
        }

        // Check ticket availability
        if (presale.max_tickets && presale.tickets_sold >= presale.max_tickets) {
            return {
                valid: false,
                error: {
                    code: 'SOLD_OUT',
                    message: 'Esta preventa está agotada',
                },
            };
        }

        return {
            valid: true,
            presale: {
                id: presale.id,
                eventId: presale.event_id,
                name: presale.name,
                description: presale.description,
                startAt: new Date(presale.start_at),
                endAt: new Date(presale.end_at),
                discountPercent: presale.discount_percent,
                discountAmount: presale.discount_amount,
                maxTickets: presale.max_tickets,
                ticketsSold: presale.tickets_sold || 0,
                rules: [],
                isActive: presale.is_active,
            },
            ruleMatched: {
                id: rule.id,
                presaleId: rule.presale_id,
                type: rule.type,
                value: rule.value,
                maxUses: rule.max_uses,
                currentUses: rule.current_uses,
                isActive: rule.is_active,
            },
            discount: presale.discount_percent
                ? { type: 'percent', value: presale.discount_percent }
                : presale.discount_amount
                    ? { type: 'amount', value: presale.discount_amount }
                    : undefined,
        };
    } catch (error) {
        console.error('[Presale] Code validation failed:', error);
        return {
            valid: false,
            error: {
                code: 'INVALID_CODE',
                message: 'Error al validar código',
            },
        };
    }
}

/**
 * Validate presale access by card BIN
 */
export async function validatePresaleBIN(
    eventId: string,
    cardBIN: string
): Promise<PresaleValidationResult> {
    try {
        const supabase = await createClient();
        const now = new Date().toISOString();

        // Find presale rules matching the BIN prefix
        const { data: rules, error } = await supabase
            .from('presale_rules')
            .select(`
        *,
        presale:presales!inner(*)
      `)
            .eq('type', 'BIN')
            .eq('is_active', true)
            .eq('presales.event_id', eventId)
            .eq('presales.is_active', true)
            .lte('presales.start_at', now)
            .gte('presales.end_at', now);

        if (error || !rules || rules.length === 0) {
            return {
                valid: false,
                error: {
                    code: 'NO_ACCESS',
                    message: 'Tu tarjeta no tiene acceso a preventas',
                },
            };
        }

        // Check if any BIN matches
        const matchingRule = rules.find(rule => cardBIN.startsWith(rule.value));

        if (!matchingRule) {
            return {
                valid: false,
                error: {
                    code: 'NO_ACCESS',
                    message: 'Tu tarjeta no tiene acceso a esta preventa',
                },
            };
        }

        const presale = matchingRule.presale;

        return {
            valid: true,
            presale: {
                id: presale.id,
                eventId: presale.event_id,
                name: presale.name,
                description: presale.description,
                startAt: new Date(presale.start_at),
                endAt: new Date(presale.end_at),
                discountPercent: presale.discount_percent,
                discountAmount: presale.discount_amount,
                maxTickets: presale.max_tickets,
                ticketsSold: presale.tickets_sold || 0,
                rules: [],
                isActive: presale.is_active,
            },
            ruleMatched: {
                id: matchingRule.id,
                presaleId: matchingRule.presale_id,
                type: matchingRule.type,
                value: matchingRule.value,
                maxUses: matchingRule.max_uses,
                currentUses: matchingRule.current_uses,
                isActive: matchingRule.is_active,
            },
            discount: presale.discount_percent
                ? { type: 'percent', value: presale.discount_percent }
                : presale.discount_amount
                    ? { type: 'amount', value: presale.discount_amount }
                    : undefined,
        };
    } catch (error) {
        console.error('[Presale] BIN validation failed:', error);
        return {
            valid: false,
            error: {
                code: 'NO_ACCESS',
                message: 'Error al validar tarjeta',
            },
        };
    }
}

/**
 * Validate presale access by email domain
 */
export async function validatePresaleEmailDomain(
    eventId: string,
    email: string
): Promise<PresaleValidationResult> {
    try {
        const domain = email.split('@')[1]?.toLowerCase();

        if (!domain) {
            return {
                valid: false,
                error: {
                    code: 'NO_ACCESS',
                    message: 'Email inválido',
                },
            };
        }

        const supabase = await createClient();
        const now = new Date().toISOString();

        const { data: rules, error } = await supabase
            .from('presale_rules')
            .select(`
        *,
        presale:presales!inner(*)
      `)
            .eq('type', 'EMAIL_DOMAIN')
            .eq('is_active', true)
            .eq('presales.event_id', eventId)
            .eq('presales.is_active', true)
            .lte('presales.start_at', now)
            .gte('presales.end_at', now);

        if (error || !rules || rules.length === 0) {
            return {
                valid: false,
                error: {
                    code: 'NO_ACCESS',
                    message: 'Tu email no tiene acceso a preventas',
                },
            };
        }

        // Check if any domain matches
        const matchingRule = rules.find(rule =>
            domain === rule.value.toLowerCase() ||
            domain.endsWith('.' + rule.value.toLowerCase())
        );

        if (!matchingRule) {
            return {
                valid: false,
                error: {
                    code: 'NO_ACCESS',
                    message: 'Tu dominio de email no tiene acceso',
                },
            };
        }

        const presale = matchingRule.presale;

        return {
            valid: true,
            presale: {
                id: presale.id,
                eventId: presale.event_id,
                name: presale.name,
                description: presale.description,
                startAt: new Date(presale.start_at),
                endAt: new Date(presale.end_at),
                discountPercent: presale.discount_percent,
                discountAmount: presale.discount_amount,
                maxTickets: presale.max_tickets,
                ticketsSold: presale.tickets_sold || 0,
                rules: [],
                isActive: presale.is_active,
            },
            ruleMatched: {
                id: matchingRule.id,
                presaleId: matchingRule.presale_id,
                type: matchingRule.type,
                value: matchingRule.value,
                maxUses: matchingRule.max_uses,
                currentUses: matchingRule.current_uses,
                isActive: matchingRule.is_active,
            },
            discount: presale.discount_percent
                ? { type: 'percent', value: presale.discount_percent }
                : presale.discount_amount
                    ? { type: 'amount', value: presale.discount_amount }
                    : undefined,
        };
    } catch (error) {
        console.error('[Presale] Email domain validation failed:', error);
        return {
            valid: false,
            error: {
                code: 'NO_ACCESS',
                message: 'Error al validar email',
            },
        };
    }
}

/**
 * Validate presale access by NFT ownership
 * (Requires wallet connection)
 */
export async function validatePresaleNFT(
    eventId: string,
    walletAddress: string
): Promise<PresaleValidationResult> {
    try {
        const supabase = await createClient();
        const now = new Date().toISOString();

        // Get NFT-based presale rules
        const { data: rules, error } = await supabase
            .from('presale_rules')
            .select(`
        *,
        presale:presales!inner(*)
      `)
            .eq('type', 'NFT')
            .eq('is_active', true)
            .eq('presales.event_id', eventId)
            .eq('presales.is_active', true)
            .lte('presales.start_at', now)
            .gte('presales.end_at', now);

        if (error || !rules || rules.length === 0) {
            return {
                valid: false,
                error: {
                    code: 'NO_ACCESS',
                    message: 'No hay preventas NFT activas',
                },
            };
        }

        // Check NFT ownership for each rule (contract address)
        for (const rule of rules) {
            const contractAddress = rule.value;

            // Check if user owns NFT from this contract
            // This would typically call an RPC or indexer API
            const ownsNFT = await checkNFTOwnership(walletAddress, contractAddress);

            if (ownsNFT) {
                const presale = rule.presale;

                return {
                    valid: true,
                    presale: {
                        id: presale.id,
                        eventId: presale.event_id,
                        name: presale.name,
                        description: presale.description,
                        startAt: new Date(presale.start_at),
                        endAt: new Date(presale.end_at),
                        discountPercent: presale.discount_percent,
                        discountAmount: presale.discount_amount,
                        maxTickets: presale.max_tickets,
                        ticketsSold: presale.tickets_sold || 0,
                        rules: [],
                        isActive: presale.is_active,
                    },
                    ruleMatched: {
                        id: rule.id,
                        presaleId: rule.presale_id,
                        type: rule.type,
                        value: rule.value,
                        maxUses: rule.max_uses,
                        currentUses: rule.current_uses,
                        isActive: rule.is_active,
                    },
                    discount: presale.discount_percent
                        ? { type: 'percent', value: presale.discount_percent }
                        : presale.discount_amount
                            ? { type: 'amount', value: presale.discount_amount }
                            : undefined,
                };
            }
        }

        return {
            valid: false,
            error: {
                code: 'NO_ACCESS',
                message: 'No tienes NFTs que den acceso a preventas',
            },
        };
    } catch (error) {
        console.error('[Presale] NFT validation failed:', error);
        return {
            valid: false,
            error: {
                code: 'NO_ACCESS',
                message: 'Error al validar NFTs',
            },
        };
    }
}

/**
 * Check NFT ownership (placeholder - would integrate with blockchain RPC)
 */
async function checkNFTOwnership(
    walletAddress: string,
    contractAddress: string
): Promise<boolean> {
    // TODO: Implement actual NFT ownership check
    // This would call Polygon/Base RPC or an indexer like Alchemy/Moralis

    console.log(`[NFT] Checking if ${walletAddress} owns NFT from ${contractAddress}`);

    // Placeholder - always return false until blockchain integration
    return false;
}

/**
 * Record presale code usage
 */
export async function recordPresaleUsage(
    ruleId: string,
    userId: string,
    ticketQuantity: number
): Promise<boolean> {
    try {
        const supabase = await createClient();

        // Increment usage count
        await supabase.rpc('increment_presale_usage', {
            rule_id: ruleId,
            amount: 1,
        });

        // Record usage log
        await supabase
            .from('presale_usages')
            .insert({
                rule_id: ruleId,
                user_id: userId,
                ticket_quantity: ticketQuantity,
            });

        return true;
    } catch (error) {
        console.error('[Presale] Record usage failed:', error);
        return false;
    }
}
