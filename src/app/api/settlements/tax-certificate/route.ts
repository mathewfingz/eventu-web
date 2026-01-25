/**
 * Tax Certificate API
 * 
 * Generate annual tax certificates (Certificados de Retención)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    getOrganizerSettlements,
    generateTaxCertificatePDF,
    pdfToHTML,
    logAudit,
} from '@/lib/settlement';

/**
 * GET /api/settlements/tax-certificate
 * Generate annual tax certificate
 */
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

        const yearParam = request.nextUrl.searchParams.get('year');
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

        // Get organizer profile
        const { data: profile } = await supabase
            .from('organizer_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json(
                { success: false, error: 'No organizer profile found' },
                { status: 403 }
            );
        }

        // Get settlements for the year
        const allSettlements = await getOrganizerSettlements(user.id);

        const yearSettlements = allSettlements.filter(s => {
            const settlementYear = new Date(s.createdAt).getFullYear();
            return settlementYear === year && s.status === 'PAID';
        });

        if (yearSettlements.length === 0) {
            return NextResponse.json(
                { success: false, error: `No paid settlements found for ${year}` },
                { status: 404 }
            );
        }

        // Generate certificate
        const pdfStructure = generateTaxCertificatePDF(
            yearSettlements,
            {
                id: profile.id,
                legalName: profile.legal_name,
                documentType: profile.document_type,
                documentNumber: profile.document_number,
                taxpayerType: profile.taxpayer_type,
                bankName: profile.bank_name,
                bankAccountType: profile.bank_account_type,
                bankAccountNumber: profile.bank_account_number,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                city: profile.city,
            },
            year
        );

        const html = pdfToHTML(pdfStructure);

        // Log export
        await logAudit('SETTLEMENT', `tax_cert_${year}`, 'EXPORT', {
            userId: user.id,
            data: { year, settlementCount: yearSettlements.length },
        });

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('[Tax Certificate] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
