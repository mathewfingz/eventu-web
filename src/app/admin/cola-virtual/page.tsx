'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueEvent {
  id: string;
  eventName: string;
  status: 'ACTIVE' | 'PAUSED' | 'INACTIVE';
  usersInQueue: number;
  usersProcessed: number;
  averageWaitTime: number; // in seconds
  throughput: number; // users per minute
  startedAt?: Date;
}

const mockQueueEvents: QueueEvent[] = [
  {
    id: '1',
    eventName: 'Bad Bunny - World Tour 2026',
    status: 'ACTIVE',
    usersInQueue: 12450,
    usersProcessed: 8320,
    averageWaitTime: 420,
    throughput: 85,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    eventName: 'Festival Estéreo Picnic 2026',
    status: 'PAUSED',
    usersInQueue: 3200,
    usersProcessed: 15600,
    averageWaitTime: 180,
    throughput: 0,
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '3',
    eventName: 'Shakira Live',
    status: 'INACTIVE',
    usersInQueue: 0,
    usersProcessed: 45000,
    averageWaitTime: 0,
    throughput: 0,
  },
];

export default function VirtualQueuePage() {
  const [events, setEvents] = useState(mockQueueEvents);
  const [selectedEvent, setSelectedEvent] = useState<string | null>('1');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.status === 'ACTIVE') {
            const processed = Math.floor(Math.random() * 10);
            return {
              ...event,
              usersInQueue: Math.max(0, event.usersInQueue - processed),
              usersProcessed: event.usersProcessed + processed,
              throughput: Math.floor(80 + Math.random() * 20),
            };
          }
          return event;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleQueueStatus = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          return {
            ...event,
            status: event.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
          };
        }
        return event;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cola Virtual</h1>
        <p className="text-gray-500 mt-1">
          Monitorea y gestiona las colas virtuales de eventos en tiempo real
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En cola total</p>
              <p className="text-xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + e.usersInQueue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Procesados hoy</p>
              <p className="text-xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + e.usersProcessed, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tiempo promedio</p>
              <p className="text-xl font-bold text-gray-900">
                {formatTime(selectedEventData?.averageWaitTime || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Throughput</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedEventData?.throughput || 0}/min
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Eventos con Cola</h2>
          </div>
          <div className="p-4 space-y-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={cn(
                  'w-full p-4 rounded-lg border text-left transition-colors',
                  selectedEvent === event.id
                    ? 'border-[#E53935] bg-[#E53935]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {event.eventName}
                  </h3>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      event.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : event.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {event.status === 'ACTIVE'
                      ? 'Activa'
                      : event.status === 'PAUSED'
                      ? 'Pausada'
                      : 'Inactiva'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{event.usersInQueue.toLocaleString()} en cola</span>
                  <span>{event.usersProcessed.toLocaleString()} procesados</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Queue Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          {selectedEventData ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedEventData.eventName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedEventData.startedAt
                        ? `Iniciada hace ${Math.floor(
                            (Date.now() - selectedEventData.startedAt.getTime()) /
                              (60 * 60 * 1000)
                          )} horas`
                        : 'No iniciada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleQueueStatus(selectedEventData.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                        selectedEventData.status === 'ACTIVE'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      )}
                    >
                      {selectedEventData.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Reanudar
                        </>
                      )}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Live Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">Usuarios en cola</p>
                    <p className="text-4xl font-bold text-[#E53935]">
                      {selectedEventData.usersInQueue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">Tiempo de espera</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatTime(selectedEventData.averageWaitTime)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Progreso de la cola</span>
                    <span className="font-medium">
                      {Math.round(
                        (selectedEventData.usersProcessed /
                          (selectedEventData.usersProcessed +
                            selectedEventData.usersInQueue)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E53935] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (selectedEventData.usersProcessed /
                            (selectedEventData.usersProcessed +
                              selectedEventData.usersInQueue)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Warning if queue is too long */}
                {selectedEventData.usersInQueue > 10000 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Cola muy larga</p>
                      <p className="text-yellow-700">
                        Considera aumentar la capacidad de procesamiento para reducir
                        tiempos de espera.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona un evento para ver los detalles de la cola</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
