'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Ticket,
  Calendar,
  ChevronDown,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface EventStats {
  id: string;
  name: string;
  ticketsSold: number;
  revenue: number;
  conversionRate: number;
  averageTicketPrice: number;
}

const mockEventStats: EventStats[] = [
  {
    id: '1',
    name: 'Festival de Música Electrónica',
    ticketsSold: 3500,
    revenue: 525000000,
    conversionRate: 4.2,
    averageTicketPrice: 150000,
  },
  {
    id: '2',
    name: 'Noche de Jazz',
    ticketsSold: 450,
    revenue: 67500000,
    conversionRate: 6.8,
    averageTicketPrice: 150000,
  },
  {
    id: '3',
    name: 'Concierto de Rock en Vivo',
    ticketsSold: 0,
    revenue: 0,
    conversionRate: 0,
    averageTicketPrice: 0,
  },
];

const mockSalesData = [
  { date: 'Lun', sales: 120 },
  { date: 'Mar', sales: 180 },
  { date: 'Mié', sales: 150 },
  { date: 'Jue', sales: 220 },
  { date: 'Vie', sales: 380 },
  { date: 'Sáb', sales: 420 },
  { date: 'Dom', sales: 280 },
];

const mockTrafficSources = [
  { source: 'Directo', percentage: 35, color: '#E53935' },
  { source: 'Google', percentage: 28, color: '#4285F4' },
  { source: 'Facebook', percentage: 20, color: '#1877F2' },
  { source: 'Instagram', percentage: 12, color: '#E4405F' },
  { source: 'Otros', percentage: 5, color: '#757575' },
];

export default function OrganizerAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  const totalRevenue = mockEventStats.reduce((sum, e) => sum + e.revenue, 0);
  const totalTickets = mockEventStats.reduce((sum, e) => sum + e.ticketsSold, 0);
  const avgConversion =
    mockEventStats.filter((e) => e.conversionRate > 0).reduce((sum, e) => sum + e.conversionRate, 0) /
      mockEventStats.filter((e) => e.conversionRate > 0).length || 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return formatPrice(value);
  };

  const maxSales = Math.max(...mockSalesData.map((d) => d.sales));

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/organizer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">
                  Métricas de rendimiento de tus eventos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
              >
                <option value="all">Todos los eventos</option>
                {mockEventStats.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12.5%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Ingresos totales</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +8.3%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Boletas vendidas</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalTickets.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                -2.1%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Tasa de conversión</p>
            <p className="text-2xl font-bold text-gray-900">
              {avgConversion.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Eventos activos</p>
            <p className="text-2xl font-bold text-gray-900">
              {mockEventStats.filter((e) => e.ticketsSold > 0).length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Ventas por día</h2>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
              {mockSalesData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-[#E53935] rounded-t transition-all hover:bg-[#B71C1C]"
                      style={{ height: `${(day.sales / maxSales) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Fuentes de tráfico</h2>
            </div>

            <div className="space-y-4">
              {mockTrafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{source.source}</span>
                    <span className="font-medium">{source.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${source.percentage}%`,
                        backgroundColor: source.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events Performance */}
        <div className="mt-6 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Rendimiento por evento
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Boletas vendidas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conversión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ticket promedio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockEventStats.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {event.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {event.ticketsSold.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      {formatCurrency(event.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {event.conversionRate > 0
                        ? `${event.conversionRate.toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {event.averageTicketPrice > 0
                        ? formatPrice(event.averageTicketPrice)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
