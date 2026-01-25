'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CoordinatorSidebar } from '@/components/coordinator/sidebar';
import { CoordinatorHeader } from '@/components/coordinator/header';

// Mock user for development
const mockUser = {
    id: 'coord-1',
    name: 'Juan Coordinador',
    email: 'juan@eventu.co',
    role: 'COORDINATOR' as const
};

// Mock events for development
const mockEvents = [
    {
        id: '1',
        name: 'Concierto de Reggaeton Night',
        date: '2026-01-25T20:00:00',
        status: 'PUBLISHED'
    },
    {
        id: '2',
        name: 'Festival de Salsa',
        date: '2026-03-01T18:00:00',
        status: 'PUBLISHED'
    },
    {
        id: '3',
        name: 'Rock en el Parque',
        date: '2026-04-15T14:00:00',
        status: 'DRAFT'
    }
];

// Mock permissions (all enabled for development)
const mockPermissions = {
    canViewOrders: true,
    canEditPresales: true,
    canEditMap: true,
    canUploadImages: true,
    canEditTicketTypes: true,
    canEditEvent: true,
    canViewReports: true,
    canScan: true
};

interface CoordinatorLayoutProps {
    children: React.ReactNode;
}

export default function CoordinatorLayout({ children }: CoordinatorLayoutProps) {
    const router = useRouter();
    const params = useParams();
    const eventId = params?.eventId as string | undefined;

    const [events, setEvents] = useState(mockEvents);
    const [currentEvent, setCurrentEvent] = useState<typeof mockEvents[0] | null>(null);
    const [permissions, setPermissions] = useState(mockPermissions);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch events on mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // TODO: Replace with actual API call
                // const response = await fetch('/api/coordinator/events');
                // const data = await response.json();
                // setEvents(data.events);

                // Using mock data for now
                setEvents(mockEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Update current event when eventId changes
    useEffect(() => {
        if (eventId) {
            const event = events.find(e => e.id === eventId);
            setCurrentEvent(event || null);

            // TODO: Fetch permissions for this specific event
            // const response = await fetch(`/api/coordinator/events/${eventId}/permissions`);
        } else {
            setCurrentEvent(null);
        }
    }, [eventId, events]);

    const handleEventChange = (newEventId: string) => {
        router.push(`/coordinator/eventos/${newEventId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <CoordinatorSidebar
                user={mockUser}
                currentEvent={currentEvent}
                permissions={permissions}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Header */}
                <CoordinatorHeader
                    user={mockUser}
                    events={events}
                    currentEventId={eventId}
                    onEventChange={handleEventChange}
                />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
