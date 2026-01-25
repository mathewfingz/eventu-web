/**
 * Audit Logger
 * 
 * Comprehensive audit trail for all financial and security-sensitive operations.
 * Required for Colombian regulatory compliance and fraud detection.
 */

import { createClient } from '@/lib/supabase/server';

export type AuditEntityType =
    | 'ORDER'
    | 'TICKET'
    | 'PAYMENT'
    | 'REFUND'
    | 'SETTLEMENT'
    | 'HOLD'
    | 'USER'
    | 'EVENT'
    | 'PRESALE';

export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'VIEW'
    | 'VALIDATE'
    | 'TRANSFER'
    | 'REFUND'
    | 'CANCEL'
    | 'PAYOUT_PROCESSED'
    | 'PAYOUT_FAILED'
    | 'LOGIN'
    | 'LOGOUT'
    | 'PASSWORD_CHANGE'
    | 'ROLE_CHANGE'
    | 'EXPORT';

export interface AuditLogEntry {
    id: string;
    entityType: AuditEntityType;
    entityId: string;
    action: AuditAction;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    data?: Record<string, any>;
    previousData?: Record<string, any>;
    reason?: string;
    createdAt: Date;
}

export interface AuditLogQuery {
    entityType?: AuditEntityType;
    entityId?: string;
    action?: AuditAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

/**
 * Log an audit event
 */
export async function logAudit(
    entityType: AuditEntityType,
    entityId: string,
    action: AuditAction,
    options?: {
        userId?: string;
        userEmail?: string;
        userRole?: string;
        ipAddress?: string;
        userAgent?: string;
        data?: Record<string, any>;
        previousData?: Record<string, any>;
        reason?: string;
    }
): Promise<string | null> {
    try {
        const supabase = await createClient();

        const { data: log, error } = await supabase
            .from('audit_logs')
            .insert({
                entity_type: entityType,
                entity_id: entityId,
                action,
                user_id: options?.userId,
                user_email: options?.userEmail,
                user_role: options?.userRole,
                ip_address: options?.ipAddress,
                user_agent: options?.userAgent,
                data: options?.data,
                previous_data: options?.previousData,
                reason: options?.reason,
            })
            .select('id')
            .single();

        if (error) {
            console.error('[Audit] Log failed:', error);
            return null;
        }

        return log.id;
    } catch (error) {
        console.error('[Audit] Log error:', error);
        return null;
    }
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(query: AuditLogQuery): Promise<{
    logs: AuditLogEntry[];
    total: number;
}> {
    try {
        const supabase = await createClient();

        let queryBuilder = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' });

        if (query.entityType) {
            queryBuilder = queryBuilder.eq('entity_type', query.entityType);
        }
        if (query.entityId) {
            queryBuilder = queryBuilder.eq('entity_id', query.entityId);
        }
        if (query.action) {
            queryBuilder = queryBuilder.eq('action', query.action);
        }
        if (query.userId) {
            queryBuilder = queryBuilder.eq('user_id', query.userId);
        }
        if (query.startDate) {
            queryBuilder = queryBuilder.gte('created_at', query.startDate.toISOString());
        }
        if (query.endDate) {
            queryBuilder = queryBuilder.lte('created_at', query.endDate.toISOString());
        }

        queryBuilder = queryBuilder
            .order('created_at', { ascending: false })
            .range(query.offset || 0, (query.offset || 0) + (query.limit || 50) - 1);

        const { data, error, count } = await queryBuilder;

        if (error) {
            console.error('[Audit] Query failed:', error);
            return { logs: [], total: 0 };
        }

        const logs: AuditLogEntry[] = data.map(l => ({
            id: l.id,
            entityType: l.entity_type,
            entityId: l.entity_id,
            action: l.action,
            userId: l.user_id,
            userEmail: l.user_email,
            userRole: l.user_role,
            ipAddress: l.ip_address,
            userAgent: l.user_agent,
            data: l.data,
            previousData: l.previous_data,
            reason: l.reason,
            createdAt: new Date(l.created_at),
        }));

        return { logs, total: count || 0 };
    } catch (error) {
        console.error('[Audit] Query error:', error);
        return { logs: [], total: 0 };
    }
}

/**
 * Get audit trail for a specific entity
 */
export async function getEntityAuditTrail(
    entityType: AuditEntityType,
    entityId: string
): Promise<AuditLogEntry[]> {
    const { logs } = await queryAuditLogs({
        entityType,
        entityId,
        limit: 100,
    });
    return logs;
}

/**
 * Log financial transaction
 */
export async function logFinancialTransaction(
    type: 'PAYMENT' | 'REFUND' | 'PAYOUT',
    transactionId: string,
    amount: number,
    currency: string = 'COP',
    details: {
        userId?: string;
        orderId?: string;
        paymentMethod?: string;
        status: string;
        metadata?: Record<string, any>;
    }
): Promise<string | null> {
    return logAudit(
        type === 'PAYOUT' ? 'SETTLEMENT' : type,
        transactionId,
        type === 'REFUND' ? 'REFUND' : 'CREATE',
        {
            data: {
                amount,
                currency,
                ...details,
            },
            userId: details.userId,
        }
    );
}

/**
 * Log security event
 */
export async function logSecurityEvent(
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE',
    userId: string,
    details: {
        email?: string;
        ipAddress?: string;
        userAgent?: string;
        success?: boolean;
        failureReason?: string;
        metadata?: Record<string, any>;
    }
): Promise<string | null> {
    return logAudit('USER', userId, action, {
        userId,
        userEmail: details.email,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        data: {
            success: details.success,
            failureReason: details.failureReason,
            ...details.metadata,
        },
    });
}

/**
 * Export audit logs for regulatory compliance
 */
export async function exportAuditLogs(
    query: AuditLogQuery,
    format: 'json' | 'csv'
): Promise<string> {
    const { logs } = await queryAuditLogs({ ...query, limit: 10000 });

    if (format === 'json') {
        return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
        'ID',
        'Fecha',
        'Tipo Entidad',
        'ID Entidad',
        'Acción',
        'Usuario ID',
        'Usuario Email',
        'IP',
        'Razón',
        'Datos',
    ];

    const rows = logs.map(log => [
        log.id,
        log.createdAt.toISOString(),
        log.entityType,
        log.entityId,
        log.action,
        log.userId || '',
        log.userEmail || '',
        log.ipAddress || '',
        log.reason || '',
        JSON.stringify(log.data || {}),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
}
