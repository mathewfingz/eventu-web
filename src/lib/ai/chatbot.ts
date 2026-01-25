/**
 * AI Chatbot System
 * 
 * Intelligent support chatbot for event questions, order issues,
 * and general assistance. Works on web and iOS.
 * 
 * Uses intent classification and context to provide relevant responses.
 */

import { createClient } from '@/lib/supabase/server';

// Intent types the chatbot can handle
export type ChatIntent =
    | 'order_status'
    | 'refund_request'
    | 'ticket_info'
    | 'event_info'
    | 'payment_help'
    | 'presale_access'
    | 'qr_help'
    | 'venue_info'
    | 'general_question'
    | 'transfer_ticket'
    | 'contact_support'
    | 'unknown';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        intent?: ChatIntent;
        confidence?: number;
        entities?: Record<string, string>;
        suggestedActions?: ChatAction[];
    };
}

export interface ChatAction {
    type: 'link' | 'button' | 'quick_reply';
    label: string;
    value: string;
}

export interface ChatContext {
    userId?: string;
    sessionId: string;
    platform: 'web' | 'ios' | 'android';
    eventId?: string;
    orderId?: string;
    ticketId?: string;
    previousMessages: ChatMessage[];
}

export interface ChatResponse {
    message: ChatMessage;
    shouldEscalate: boolean;
    escalationReason?: string;
}

// Intent patterns for classification
const intentPatterns: { intent: ChatIntent; patterns: RegExp[] }[] = [
    {
        intent: 'order_status',
        patterns: [
            /estado.*(?:orden|pedido|compra)/i,
            /(?:donde|cuando).*(?:boleta|ticket|entrada)/i,
            /no.*(?:recib|lleg).*(?:boleta|ticket|confirmación)/i,
            /order.*status/i,
            /tracking/i,
        ],
    },
    {
        intent: 'refund_request',
        patterns: [
            /reembolso/i,
            /devol(?:ver|ución).*dinero/i,
            /cancelar.*(?:compra|orden)/i,
            /refund/i,
            /money.*back/i,
        ],
    },
    {
        intent: 'ticket_info',
        patterns: [
            /(?:como|donde).*(?:ver|encontrar|descargar).*(?:boleta|ticket|QR)/i,
            /(?:boleta|ticket|entrada).*(?:digital|electrónic)/i,
            /(?:agregar|añadir).*wallet/i,
        ],
    },
    {
        intent: 'payment_help',
        patterns: [
            /(?:problema|error).*pago/i,
            /tarjeta.*(?:rechaz|declin)/i,
            /(?:metodo|forma).*pago/i,
            /nequi|pse|efecty|daviplata/i,
            /payment.*(?:fail|error)/i,
        ],
    },
    {
        intent: 'presale_access',
        patterns: [
            /(?:codigo|código).*preventa/i,
            /acceso.*exclusivo/i,
            /preventa.*(?:cuando|como)/i,
            /presale/i,
        ],
    },
    {
        intent: 'qr_help',
        patterns: [
            /(?:qr|código).*(?:no|funciona|escanea)/i,
            /problema.*(?:qr|entrada)/i,
            /safetix/i,
        ],
    },
    {
        intent: 'venue_info',
        patterns: [
            /(?:donde|ubicación|dirección).*(?:venue|lugar|evento)/i,
            /(?:como|llegar|transporte)/i,
            /parque(?:adero|o)/i,
            /(?:hora|puerta).*(?:abr|entrada)/i,
        ],
    },
    {
        intent: 'transfer_ticket',
        patterns: [
            /(?:transferir|regalar|enviar).*(?:boleta|ticket)/i,
            /(?:cambiar|modificar).*nombre/i,
            /transfer/i,
        ],
    },
    {
        intent: 'contact_support',
        patterns: [
            /(?:hablar|contactar).*(?:humano|agente|persona)/i,
            /soporte.*(?:real|humano)/i,
            /(?:llamar|telefono|whatsapp)/i,
            /human.*agent/i,
        ],
    },
];

// Response templates
const responses: Record<ChatIntent, (context: ChatContext, entities: Record<string, string>) => Promise<ChatResponse>> = {
    async order_status(context, entities) {
        if (context.userId && context.orderId) {
            const supabase = await createClient();
            const { data: order } = await supabase
                .from('orders')
                .select('*, tickets(*)')
                .eq('id', context.orderId)
                .single();

            if (order) {
                const statusMessages: Record<string, string> = {
                    PENDING: 'Tu orden está pendiente de pago. ¿Necesitas ayuda para completarlo?',
                    PROCESSING: 'Tu pago está siendo procesado. Esto puede tomar unos minutos.',
                    PAID: `¡Tu orden está confirmada! Tienes ${order.tickets?.length || 1} boleta(s). Puedes verlas en "Mis Boletas".`,
                    CANCELLED: 'Tu orden fue cancelada. Si esto fue un error, contáctanos.',
                };

                return {
                    message: createMessage(
                        statusMessages[order.status] || 'Estado: ' + order.status,
                        'order_status',
                        0.95,
                        order.status === 'PAID' ? [
                            { type: 'link', label: 'Ver mis boletas', value: '/dashboard/tickets' },
                        ] : []
                    ),
                    shouldEscalate: false,
                };
            }
        }

        return {
            message: createMessage(
                '¿Puedes darme el número de tu orden? Lo encuentras en el email de confirmación.',
                'order_status',
                0.8
            ),
            shouldEscalate: false,
        };
    },

    async refund_request(context) {
        return {
            message: createMessage(
                'Entiendo que quieres solicitar un reembolso. Nuestras políticas varían según el evento y el tiempo de anticipación. ¿Me puedes dar el número de orden para revisar las opciones disponibles?',
                'refund_request',
                0.9,
                [
                    { type: 'link', label: 'Ver política de reembolsos', value: '/help/refunds' },
                    { type: 'button', label: 'Hablar con un agente', value: 'escalate' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async ticket_info(context) {
        return {
            message: createMessage(
                'Tus boletas están en la sección "Mis Boletas" del menú. Cada boleta tiene un código QR dinámico que cambia cada 15 segundos (SafeTix) para mayor seguridad. Puedes descargarlas para uso offline.',
                'ticket_info',
                0.95,
                [
                    { type: 'link', label: 'Ir a Mis Boletas', value: '/dashboard/tickets' },
                    { type: 'quick_reply', label: '¿Cómo funciona SafeTix?', value: 'safetix_explain' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async payment_help(context) {
        return {
            message: createMessage(
                '¿Qué problema tienes con el pago?\n\n• **Tarjeta rechazada**: Verifica los datos y límite disponible\n• **Nequi/PSE**: Asegúrate de aprobar en la app de tu banco\n• **Efecty/Baloto**: Tienes 72 horas para pagar en punto físico',
                'payment_help',
                0.9,
                [
                    { type: 'quick_reply', label: 'Tarjeta rechazada', value: 'card_declined' },
                    { type: 'quick_reply', label: 'PSE no carga', value: 'pse_issue' },
                    { type: 'quick_reply', label: 'Otro problema', value: 'other_payment' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async presale_access(context) {
        return {
            message: createMessage(
                'Las preventas ofrecen acceso anticipado a boletas. Puedes acceder mediante:\n\n• **Código**: Ingresa en el modal de preventa\n• **Tarjeta**: Algunas preventas son exclusivas para ciertos bancos\n• **Email corporativo**: Preventas para empleados de empresas aliadas',
                'presale_access',
                0.9,
                [
                    { type: 'quick_reply', label: '¿Cómo consigo un código?', value: 'get_code' },
                    { type: 'quick_reply', label: '¿Qué tarjetas tienen acceso?', value: 'card_access' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async qr_help(context) {
        return {
            message: createMessage(
                '**Problemas con el QR SafeTix:**\n\n1. Asegúrate de tener la última versión de la app\n2. El QR cambia cada 15 segundos - espera a que se actualice\n3. Si estás offline, usa los códigos pre-descargados\n4. Aumenta el brillo de tu pantalla\n\n¿Sigues teniendo problemas?',
                'qr_help',
                0.9,
                [
                    { type: 'button', label: 'Descargar para offline', value: 'download_offline' },
                    { type: 'button', label: 'Hablar con soporte', value: 'escalate' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async venue_info(context, entities) {
        if (context.eventId) {
            const supabase = await createClient();
            const { data: event } = await supabase
                .from('events')
                .select('*, venue:venues(*)')
                .eq('id', context.eventId)
                .single();

            if (event?.venue) {
                return {
                    message: createMessage(
                        `**${event.venue.name}**\n📍 ${event.venue.address}, ${event.venue.city}\n🚪 Puertas abren: 2 horas antes del evento\n🅿️ ${event.venue.parking_info || 'Consulta parqueaderos cercanos'}`,
                        'venue_info',
                        0.95,
                        [
                            { type: 'link', label: 'Ver en mapa', value: event.venue.maps_url || '#' },
                        ]
                    ),
                    shouldEscalate: false,
                };
            }
        }

        return {
            message: createMessage(
                '¿Para qué evento necesitas información del venue?',
                'venue_info',
                0.7
            ),
            shouldEscalate: false,
        };
    },

    async transfer_ticket(context) {
        return {
            message: createMessage(
                'Para transferir una boleta a otra persona:\n\n1. Ve a "Mis Boletas"\n2. Selecciona la boleta\n3. Toca "Transferir"\n4. Ingresa el email del destinatario\n\n⚠️ La transferencia es definitiva y el QR se desactivará en tu cuenta.',
                'transfer_ticket',
                0.9,
                [
                    { type: 'link', label: 'Ir a Mis Boletas', value: '/dashboard/tickets' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async contact_support(context) {
        return {
            message: createMessage(
                'Te conecto con un agente humano. El tiempo de espera promedio es de 5 minutos.\n\n¿Mientras esperas, hay algo más en lo que pueda ayudarte?',
                'contact_support',
                1.0,
                [
                    { type: 'button', label: 'Conectar con agente', value: 'escalate_now' },
                    { type: 'link', label: 'WhatsApp', value: 'https://wa.me/573001234567' },
                ]
            ),
            shouldEscalate: true,
            escalationReason: 'User requested human agent',
        };
    },

    async event_info(context) {
        return {
            message: createMessage(
                '¿Qué información necesitas del evento? Puedo ayudarte con fechas, horarios, artistas, restricciones de edad, y más.',
                'event_info',
                0.7,
                [
                    { type: 'quick_reply', label: 'Fecha y hora', value: 'event_datetime' },
                    { type: 'quick_reply', label: 'Restricciones', value: 'event_restrictions' },
                    { type: 'quick_reply', label: 'Artistas', value: 'event_artists' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async general_question(context) {
        return {
            message: createMessage(
                '¡Claro! ¿En qué puedo ayudarte hoy?',
                'general_question',
                0.5,
                [
                    { type: 'quick_reply', label: 'Mis boletas', value: 'ticket_info' },
                    { type: 'quick_reply', label: 'Comprar boletas', value: 'buy_tickets' },
                    { type: 'quick_reply', label: 'Problema con pago', value: 'payment_help' },
                    { type: 'quick_reply', label: 'Hablar con soporte', value: 'contact_support' },
                ]
            ),
            shouldEscalate: false,
        };
    },

    async unknown(context) {
        return {
            message: createMessage(
                'No estoy seguro de entender tu pregunta. ¿Puedes reformularla o elegir una de estas opciones?',
                'unknown',
                0.3,
                [
                    { type: 'quick_reply', label: 'Mis boletas', value: 'ticket_info' },
                    { type: 'quick_reply', label: 'Ayuda con pago', value: 'payment_help' },
                    { type: 'quick_reply', label: 'Hablar con humano', value: 'contact_support' },
                ]
            ),
            shouldEscalate: false,
        };
    },
};

/**
 * Classify user intent from message
 */
function classifyIntent(message: string): { intent: ChatIntent; confidence: number } {
    const normalizedMessage = message.toLowerCase().trim();

    for (const { intent, patterns } of intentPatterns) {
        for (const pattern of patterns) {
            if (pattern.test(normalizedMessage)) {
                return { intent, confidence: 0.85 };
            }
        }
    }

    // Default to unknown
    return { intent: 'unknown', confidence: 0.3 };
}

/**
 * Extract entities from message
 */
function extractEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};

    // Order ID pattern
    const orderMatch = message.match(/(?:orden|order|pedido)\s*[#:]?\s*([A-Z0-9-]+)/i);
    if (orderMatch) {
        entities.orderId = orderMatch[1];
    }

    // Email pattern
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/i);
    if (emailMatch) {
        entities.email = emailMatch[0];
    }

    // Event name (basic)
    const eventMatch = message.match(/(?:evento|concierto|show)\s+(?:de\s+)?([^,.\n]+)/i);
    if (eventMatch) {
        entities.eventName = eventMatch[1].trim();
    }

    return entities;
}

/**
 * Create a chat message
 */
function createMessage(
    content: string,
    intent: ChatIntent,
    confidence: number,
    actions: ChatAction[] = []
): ChatMessage {
    return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        metadata: {
            intent,
            confidence,
            suggestedActions: actions,
        },
    };
}

/**
 * Process a user message and generate response
 */
export async function processMessage(
    userMessage: string,
    context: ChatContext
): Promise<ChatResponse> {
    // Classify intent
    const { intent, confidence } = classifyIntent(userMessage);

    // Extract entities
    const entities = extractEntities(userMessage);

    // Update context with extracted entities
    if (entities.orderId) {
        context.orderId = entities.orderId;
    }

    // Get response for intent
    const responseHandler = responses[intent];
    const response = await responseHandler(context, entities);

    return response;
}

/**
 * Save chat session for analytics and training
 */
export async function saveChatSession(
    sessionId: string,
    messages: ChatMessage[],
    userId?: string
): Promise<void> {
    try {
        const supabase = await createClient();

        await supabase
            .from('chat_sessions')
            .upsert({
                id: sessionId,
                user_id: userId,
                messages,
                message_count: messages.length,
                updated_at: new Date().toISOString(),
            });
    } catch (error) {
        console.error('[Chatbot] Save session failed:', error);
    }
}
