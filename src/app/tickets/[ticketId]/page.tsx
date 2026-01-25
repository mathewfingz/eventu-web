import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, Download } from 'lucide-react';
import { SafeTixQR } from '@/components/tickets/safetix-qr';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketPageProps {
    params: { ticketId: string };
}

export default async function TicketPage({ params }: TicketPageProps) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get ticket with event details
    const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
      *,
      order:orders(*),
      ticket_type:ticket_types(
        *,
        event:events(
          *,
          venue:venues(*)
        )
      )
    `)
        .eq('id', params.ticketId)
        .single();

    if (error || !ticket) {
        redirect('/dashboard/tickets');
    }

    // Verify ownership
    if (ticket.order?.user_id !== user.id) {
        redirect('/dashboard/tickets');
    }

    const event = ticket.ticket_type?.event;
    const venue = event?.venue;
    const eventDate = event?.date ? new Date(event.date) : new Date();

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#212121] to-[#424242]">
            {/* Header */}
            <header className="p-4">
                <Link
                    href="/dashboard/tickets"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Mis boletas
                </Link>
            </header>

            <main className="max-w-md mx-auto px-4 pb-8">
                {/* Event Info Card */}
                <div className="bg-white rounded-t-3xl p-6">
                    <h1 className="text-2xl font-bold text-[#212121] mb-4 font-[Poppins,sans-serif]">
                        {event?.name || 'Evento'}
                    </h1>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-[#757575]">
                            <Calendar className="w-5 h-5 text-[#E53935]" />
                            <span>
                                {format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-[#757575]">
                            <Clock className="w-5 h-5 text-[#E53935]" />
                            <span>{format(eventDate, 'h:mm a', { locale: es })}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[#757575]">
                            <MapPin className="w-5 h-5 text-[#E53935]" />
                            <span>{venue?.name || 'Venue'}, {venue?.city || 'Ciudad'}</span>
                        </div>
                    </div>
                </div>

                {/* Ticket Type Badge */}
                <div className="bg-[#E53935] text-white text-center py-3 font-semibold">
                    {ticket.ticket_type?.name || 'General'}
                    {ticket.section && ` • ${ticket.section}`}
                    {ticket.seat_row && ticket.seat_number && ` • Fila ${ticket.seat_row}, Asiento ${ticket.seat_number}`}
                </div>

                {/* QR Section */}
                <div className="bg-white rounded-b-3xl p-6">
                    <div className="flex justify-center py-4">
                        <SafeTixQR
                            ticketId={params.ticketId}
                            eventName={event?.name || 'Evento'}
                            section={ticket.ticket_type?.name}
                            seatInfo={ticket.seat_row && ticket.seat_number
                                ? `Fila ${ticket.seat_row}, Asiento ${ticket.seat_number}`
                                : undefined
                            }
                        />
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-[#FAFAFA] rounded-xl text-sm text-[#757575]">
                        <p className="font-medium text-[#212121] mb-2">Instrucciones:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Presenta este código QR en la entrada</li>
                            <li>El código cambia cada 15 segundos por seguridad</li>
                            <li>Funciona sin conexión a internet</li>
                            <li>No hagas captura de pantalla</li>
                        </ul>
                    </div>

                    {/* Download Button */}
                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        <Download className="w-5 h-5" />
                        Descargar para uso offline
                    </button>
                </div>

                {/* Order Info */}
                <div className="mt-6 text-center text-white/60 text-xs">
                    <p>Orden: {ticket.order?.id?.slice(0, 8).toUpperCase()}</p>
                    <p>Ticket ID: {params.ticketId.slice(0, 8).toUpperCase()}</p>
                </div>
            </main>
        </div>
    );
}
