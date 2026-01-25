'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Ticket,
  DollarSign,
  Loader2,
  RefreshCw,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface ReportSummary {
  totalRevenue: number;
  totalTickets: number;
  totalEvents: number;
  totalUsers: number;
  avgOrderValue: number;
  conversionRate: number;
  totalOrders: number;
}

interface TopEvent {
  id: string;
  name: string;
  revenue: number;
  tickets: number;
}

interface TopPromoter {
  id: string;
  name: string;
  events: number;
  revenue: number;
}

interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
  tickets: number;
}

interface SaycoEventData {
  eventName: string;
  eventDate: string;
  venueName: string;
  city: string;
  attendees: number;
  revenue: number;
  saycoFee: number;
  acinproFee: number;
  totalRoyalties: number;
}

interface TaxBreakdown {
  name: string;
  code: string;
  rate: number;
  amount: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [topPromoters, setTopPromoters] = useState<TopPromoter[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Quick report modals
  const [showDailySales, setShowDailySales] = useState(false);
  const [showSayco, setShowSayco] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  const [dailySalesData, setDailySalesData] = useState<DailySalesData[]>([]);
  const [saycoData, setSaycoData] = useState<{ data: SaycoEventData[]; totals: Record<string, number> } | null>(null);
  const [taxesData, setTaxesData] = useState<{ totalRevenue: number; totalTaxes: number; taxBreakdown: TaxBreakdown[] } | null>(null);
  const [quickReportLoading, setQuickReportLoading] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?period=${period}`);
      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        setTopEvents(data.topEvents || []);
        setTopPromoters(data.topPromoters || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      // Dynamic import for client-side only
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      if (!reportRef.current) return;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`reporte-eventu-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar el PDF. Por favor intente de nuevo.');
    } finally {
      setExportLoading(false);
    }
  };

  const loadDailySalesReport = async () => {
    setQuickReportLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?period=${period}&type=daily_sales`);
      const data = await response.json();
      if (response.ok) {
        setDailySalesData(data.data || []);
        setShowDailySales(true);
      }
    } catch (error) {
      console.error('Error loading daily sales:', error);
    } finally {
      setQuickReportLoading(false);
    }
  };

  const loadSaycoReport = async () => {
    setQuickReportLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?period=${period}&type=sayco`);
      const data = await response.json();
      if (response.ok) {
        setSaycoData(data);
        setShowSayco(true);
      }
    } catch (error) {
      console.error('Error loading SAYCO report:', error);
    } finally {
      setQuickReportLoading(false);
    }
  };

  const loadTaxesReport = async () => {
    setQuickReportLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?period=${period}&type=taxes`);
      const data = await response.json();
      if (response.ok) {
        setTaxesData(data.data);
        setShowTaxes(true);
      }
    } catch (error) {
      console.error('Error loading taxes report:', error);
    } finally {
      setQuickReportLoading(false);
    }
  };

  const periodLabels: Record<string, string> = {
    month: 'Este mes',
    quarter: 'Este trimestre',
    year: 'Este año',
    all: 'Todo el tiempo',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">
            Analytics y métricas de la plataforma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
            <option value="all">Todo el tiempo</option>
          </select>
          <button
            onClick={handleExportPDF}
            disabled={exportLoading}
            className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium hover:bg-[#B71C1C] flex items-center gap-2 disabled:opacity-50"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
        </div>
      ) : (
        <div ref={reportRef} className="space-y-6 bg-gray-50 p-6 rounded-xl">
          {/* Report Header for PDF */}
          <div className="text-center pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Reporte de Eventu - {periodLabels[period]}
            </h2>
            <p className="text-sm text-gray-500">
              Generado el {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                Ingresos
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(summary?.totalRevenue || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Ticket className="w-4 h-4" />
                Boletas
              </div>
              <p className="text-xl font-bold">
                {(summary?.totalTickets || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                Eventos
              </div>
              <p className="text-xl font-bold">{summary?.totalEvents || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Users className="w-4 h-4" />
                Usuarios
              </div>
              <p className="text-xl font-bold">
                {(summary?.totalUsers || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <BarChart3 className="w-4 h-4" />
                Ticket promedio
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(summary?.avgOrderValue || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Conversión
              </div>
              <p className="text-xl font-bold">{summary?.conversionRate || 0}%</p>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top Events */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Top Eventos por Ingresos
              </h3>
              {topEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay datos disponibles
                </p>
              ) : (
                <div className="space-y-3">
                  {topEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg font-bold text-gray-300 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.name}</p>
                        <p className="text-sm text-gray-500">
                          {event.tickets.toLocaleString()} boletas
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(event.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Promoters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Top Promotores</h3>
              {topPromoters.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay datos disponibles
                </p>
              ) : (
                <div className="space-y-3">
                  {topPromoters.map((promoter, index) => (
                    <div
                      key={promoter.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg font-bold text-gray-300 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{promoter.name}</p>
                        <p className="text-sm text-gray-500">
                          {promoter.events} eventos
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(promoter.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Reportes Rápidos</h3>
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={loadDailySalesReport}
            disabled={quickReportLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3"
          >
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 flex-1">
              Ventas diarias
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={loadSaycoReport}
            disabled={quickReportLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3"
          >
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 flex-1">
              Informe SAYCO/ACINPRO
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={loadTaxesReport}
            disabled={quickReportLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3"
          >
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 flex-1">
              Reporte de impuestos
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3"
          >
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 flex-1">
              Funnel de conversión
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Daily Sales Modal */}
      {showDailySales && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Ventas Diarias - {periodLabels[period]}
              </h2>
              <button
                onClick={() => setShowDailySales(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {dailySalesData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay datos disponibles
                </p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Órdenes
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Tickets
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Ingresos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailySalesData.map((day) => (
                      <tr key={day.date}>
                        <td className="px-4 py-3 text-gray-900">
                          {new Date(day.date).toLocaleDateString('es-CO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {day.orders}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {day.tickets}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatPrice(day.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td className="px-4 py-3 text-gray-900">Total</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {dailySalesData.reduce((sum, d) => sum + d.orders, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {dailySalesData.reduce((sum, d) => sum + d.tickets, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        {formatPrice(
                          dailySalesData.reduce((sum, d) => sum + d.revenue, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAYCO/ACINPRO Modal */}
      {showSayco && saycoData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Informe SAYCO/ACINPRO
                </h2>
                <p className="text-sm text-gray-500">
                  SAYCO: 2.5% | ACINPRO: 2%
                </p>
              </div>
              <button
                onClick={() => setShowSayco(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {saycoData.data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay datos disponibles
                </p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Evento
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Venue
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Asistentes
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Ingresos
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          SAYCO
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          ACINPRO
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {saycoData.data.map((event, index) => (
                        <tr key={index}>
                          <td className="px-3 py-3 text-gray-900">
                            {event.eventName}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {event.venueName}, {event.city}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-600">
                            {event.attendees.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-900">
                            {formatPrice(event.revenue)}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-600">
                            {formatPrice(event.saycoFee)}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-600">
                            {formatPrice(event.acinproFee)}
                          </td>
                          <td className="px-3 py-3 text-right font-medium text-red-600">
                            {formatPrice(event.totalRoyalties)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td colSpan={2} className="px-3 py-3 text-gray-900">
                          Total
                        </td>
                        <td className="px-3 py-3 text-right text-gray-900">
                          {saycoData.totals.attendees?.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-900">
                          {formatPrice(saycoData.totals.revenue || 0)}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-900">
                          {formatPrice(saycoData.totals.saycoFee || 0)}
                        </td>
                        <td className="px-3 py-3 text-right text-gray-900">
                          {formatPrice(saycoData.totals.acinproFee || 0)}
                        </td>
                        <td className="px-3 py-3 text-right text-red-600">
                          {formatPrice(saycoData.totals.totalRoyalties || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Este informe es un estimado basado en
                      las ventas del período. Consulte con su asesor legal para
                      los cálculos oficiales de SAYCO y ACINPRO.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Taxes Modal */}
      {showTaxes && taxesData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Reporte de Impuestos
              </h2>
              <button
                onClick={() => setShowTaxes(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(taxesData.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Impuestos Recaudados</p>
                  <p className="text-2xl font-bold text-[#E53935]">
                    {formatPrice(taxesData.totalTaxes)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Desglose por Tipo de Impuesto
                </h3>
                <div className="space-y-3">
                  {taxesData.taxBreakdown.map((tax) => (
                    <div
                      key={tax.code}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{tax.name}</p>
                        <p className="text-sm text-gray-500">
                          {tax.code} - {tax.rate}%
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(tax.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
