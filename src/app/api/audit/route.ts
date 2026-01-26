/**
 * Audit Logs API
 * 
 * Query and export audit logs for regulatory compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {

    queryAuditLogs,
    exportAuditLogs,
    AuditEntityType,
    AuditAction,
} from '@/lib/settlement';

/**
 * GET /api/audit
 * Query audit logs
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin or organizer
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['ADMIN', 'ORGANIZER'].includes(profile.role)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        const params = request.nextUrl.searchParams;

        const query = {
            entityType: params.get('entityType') as AuditEntityType | undefined,
            entityId: params.get('entityId') || undefined,
            action: params.get('action') as AuditAction | undefined,
            userId: profile.role === 'ADMIN' ? params.get('userId') || undefined : user.id,
            startDate: params.get('startDate') ? new Date(params.get('startDate')!) : undefined,
            endDate: params.get('endDate') ? new Date(params.get('endDate')!) : undefined,
            limit: parseInt(params.get('limit') || '50'),
            offset: parseInt(params.get('offset') || '0'),
        };

        const format = params.get('format');

        // Export format
        if (format === 'csv' || format === 'json') {
            const exported = await exportAuditLogs(query, format);

            const contentType = format === 'csv'
                ? 'text/csv; charset=utf-8'
                : 'application/json; charset=utf-8';

            const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;

            return new NextResponse(exported, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        }

        // Regular query
        const { logs, total } = await queryAuditLogs(query);

        return NextResponse.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    limit: query.limit,
                    offset: query.offset,
                    hasMore: (query.offset || 0) + logs.length < total,
                },
            },
        });
    } catch (error) {
        console.error('[Audit API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
