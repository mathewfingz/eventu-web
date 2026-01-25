import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ticket, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function MyTicketsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get user's tickets with event details
    const { data: tickets, error } = await supabase
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
        .eq('order.user_id', user.id)
        .in('status', ['ACTIVE', 'USED'])
        .order('created_at', { ascending: false });

    // Group tickets by event
    const upcomingTickets = tickets?.filter(t => {
        const eventDate = t.ticket_type?.event?.date;
        return eventDate && new Date(eventDate) > new Date() && t.status === 'ACTIVE';
    }) || [];

    const pastTickets = tickets?.filter(t => {
        const eventDate = t.ticket_type?.event?.date;
        return eventDate && new Date(eventDate) <= new Date() || t.status === 'USED';
    }) || [];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-semibold">Mis Boletas</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {tickets?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#212121] mb-2">
                            No tienes boletas
                        </h2>
                        <p className="text-[#757575] mb-6">
                            Explora eventos y compra tus primeras boletas
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors"
                        >
                            Explorar eventos
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        {upcomingTickets.length > 0 && (
                            <section className="mb-8">
                                <h2 className="text-lg font-semibold text-[#212121] mb-4">
                                    Próximos eventos ({upcomingTickets.length})
                                </h2>
                                <div className="space-y-3">
                                    {upcomingTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Past Events */}
                        {pastTickets.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-[#757575] mb-4">
                                    Eventos pasados ({pastTickets.length})
                                </h2>
                                <div className="space-y-3 opacity-70">
                                    {pastTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} isPast />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function TicketCard({ ticket, isPast = false }: { ticket: any; isPast?: boolean }) {
    const event = ticket.ticket_type?.event;
    const venue = event?.venue;
    const eventDate = event?.date ? new Date(event.date) : new Date();

    return (
        <Link
            href={isPast ? '#' : `/tickets/${ticket.id}`}
            className={`block bg-white rounded-xl p-4 shadow-sm ${!isPast && 'hover:shadow-md transition-shadow'}`}
        >
            <div className="flex gap-4">
                {/* Event Image */}
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {event?.image_url ? (
                        <img
                            src={event.image_url}
                            alt={event.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Ticket className="w-8 h-8 text-gray-300" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#212121] truncate">
                        {event?.name || 'Evento'}
                    </h3>

                    <div className="mt-1 space-y-1 text-sm text-[#757575]">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                                {format(eventDate, "EEE, d MMM 'de' yyyy", { locale: es })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{venue?.name || 'Venue'}</span>
                        </div>
                    </div>

                    {/* Ticket badge */}
                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-[#E53935]/10 text-[#E53935] text-xs font-medium rounded">
                        {ticket.ticket_type?.name || 'General'}
                        {ticket.seat_row && ` • F${ticket.seat_row} A${ticket.seat_number}`}
                    </div>
                </div>

                {/* Arrow */}
                {!isPast && (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
                )}
            </div>
        </Link>
    );
}
