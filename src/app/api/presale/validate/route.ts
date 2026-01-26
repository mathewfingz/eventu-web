import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {

    validatePresaleCode,
    validatePresaleBIN,
    validatePresaleEmailDomain,
    validatePresaleNFT
} from '@/lib/presale/engine';

/**
 * Validate presale access
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, type, value } = body;

        if (!eventId || !type) {
            return NextResponse.json(
                { valid: false, error: { message: 'Faltan parámetros' } },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'CODE':
                if (!value) {
                    return NextResponse.json(
                        { valid: false, error: { message: 'Código requerido' } },
                        { status: 400 }
                    );
                }
                result = await validatePresaleCode(eventId, value);
                break;

            case 'BIN':
                if (!value || value.length < 6) {
                    return NextResponse.json(
                        { valid: false, error: { message: 'BIN inválido' } },
                        { status: 400 }
                    );
                }
                result = await validatePresaleBIN(eventId, value);
                break;

            case 'EMAIL_DOMAIN':
                // Get user's email from session
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user?.email) {
                    return NextResponse.json(
                        { valid: false, error: { message: 'Debes iniciar sesión' } },
                        { status: 401 }
                    );
                }
                result = await validatePresaleEmailDomain(eventId, user.email);
                break;

            case 'NFT':
                if (!value) {
                    return NextResponse.json(
                        { valid: false, error: { message: 'Wallet requerida' } },
                        { status: 400 }
                    );
                }
                result = await validatePresaleNFT(eventId, value);
                break;

            default:
                return NextResponse.json(
                    { valid: false, error: { message: 'Tipo de validación no soportado' } },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Presale:Validate] Error:', error);
        return NextResponse.json(
            { valid: false, error: { message: 'Error interno' } },
            { status: 500 }
        );
    }
}
