/**
 * Chatbot API
 * 
 * REST API for AI chatbot, used by web and iOS apps
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processMessage, saveChatSession, ChatContext, ChatMessage } from '@/lib/ai/chatbot';

/**
 * POST /api/chat
 * Process a chat message and get AI response
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            message,
            sessionId,
            eventId,
            orderId,
            ticketId,
            previousMessages = [],
            platform = 'web',
        } = body;

        if (!message || !sessionId) {
            return NextResponse.json(
                { success: false, error: 'message and sessionId required' },
                { status: 400 }
            );
        }

        // Get user if authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Build context
        const context: ChatContext = {
            userId: user?.id,
            sessionId,
            platform,
            eventId,
            orderId,
            ticketId,
            previousMessages,
        };

        // Process message
        const response = await processMessage(message, context);

        // Create user message for history
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: message,
            timestamp: new Date(),
        };

        // Save session
        const updatedMessages = [...previousMessages, userMessage, response.message];
        await saveChatSession(sessionId, updatedMessages, user?.id);

        return NextResponse.json({
            success: true,
            data: {
                message: response.message,
                shouldEscalate: response.shouldEscalate,
                escalationReason: response.escalationReason,
            },
        });
    } catch (error) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/chat?sessionId=xxx
 * Get chat history for a session
 */
export async function GET(request: NextRequest) {
    try {
        const sessionId = request.nextUrl.searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'sessionId required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data: session } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (!session) {
            return NextResponse.json({
                success: true,
                data: { messages: [] },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                messages: session.messages || [],
                messageCount: session.message_count,
            },
        });
    } catch (error) {
        console.error('[Chat API] Get error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}
