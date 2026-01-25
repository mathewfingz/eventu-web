'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Plus,
  Trash2,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockCategories, mockCities } from '@/lib/mock-data';

type Step = 1 | 2 | 3 | 4;

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    category: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    venue: '',
    address: '',
    city: '',

    // Step 2: Description & Media
    description: '',
    imageUrl: '',

    // Step 3: Tickets
    tickets: [] as TicketType[],
  });

  const steps = [
    { number: 1, title: 'Información básica' },
    { number: 2, title: 'Descripción y media' },
    { number: 3, title: 'Boletas' },
    { number: 4, title: 'Revisión' },
  ];

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      maxPerOrder: 6,
    };
    setFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
    }));
  };

  const updateTicket = (id: string, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const removeTicket = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((t) => t.id !== id),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name &&
          formData.category &&
          formData.date &&
          formData.time &&
          formData.venue &&
          formData.city
        );
      case 2:
        return formData.description;
      case 3:
        return formData.tickets.length > 0 && formData.tickets.every((t) => t.name && t.price > 0);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    router.push('/organizer/events');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/organizer/events"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Crear nuevo evento</h1>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-[#E53935] text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm hidden sm:inline',
                      currentStep >= step.number
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 sm:w-24 h-0.5 mx-2 sm:mx-4',
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Información básica
                </h2>
                <p className="text-gray-500">
                  Cuéntanos sobre tu evento
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del evento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Ej: Concierto de Bad Bunny"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  >
                    <option value="">Selecciona una categoría</option>
                    {mockCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Fecha de inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Hora de inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => updateField('time', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lugar del evento *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => updateField('venue', e.target.value)}
                    placeholder="Ej: Estadio El Campín"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Ej: Carrera 30 #57-60"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {mockCities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description & Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Descripción y media
                </h2>
                <p className="text-gray-500">
                  Agrega detalles e imágenes de tu evento
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del evento *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe tu evento, qué pueden esperar los asistentes, información importante..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen principal
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-[#E53935] transition-colors cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-gray-100 rounded-full mb-3">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-1">
                        Arrastra una imagen o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-gray-400">
                        PNG, JPG hasta 5MB. Recomendado: 1200x628px
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Consejo</p>
                    <p className="mt-1 text-blue-700">
                      Una buena imagen y descripción pueden aumentar tus ventas hasta un 40%.
                      Asegúrate de que la imagen sea de alta calidad y la descripción sea clara.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tickets */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Tipos de boletas
                </h2>
                <p className="text-gray-500">
                  Configura los tipos de boletas y sus precios
                </p>
              </div>

              <div className="space-y-4">
                {formData.tickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-900">
                        Boleta {index + 1}
                      </span>
                      <button
                        onClick={() => removeTicket(ticket.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) =>
                            updateTicket(ticket.id, 'name', e.target.value)
                          }
                          placeholder="Ej: General, VIP, Platinum"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Precio (COP) *
                        </label>
                        <input
                          type="number"
                          value={ticket.price || ''}
                          onChange={(e) =>
                            updateTicket(
                              ticket.id,
                              'price',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="150000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Cantidad disponible
                        </label>
                        <input
                          type="number"
                          value={ticket.quantity}
                          onChange={(e) =>
                            updateTicket(
                              ticket.id,
                              'quantity',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Máximo por orden
                        </label>
                        <input
                          type="number"
                          value={ticket.maxPerOrder}
                          onChange={(e) =>
                            updateTicket(
                              ticket.id,
                              'maxPerOrder',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          value={ticket.description}
                          onChange={(e) =>
                            updateTicket(ticket.id, 'description', e.target.value)
                          }
                          placeholder="Descripción breve de lo que incluye"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addTicketType}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#E53935] hover:text-[#E53935] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar tipo de boleta
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Revisar y publicar
                </h2>
                <p className="text-gray-500">
                  Verifica la información antes de enviar
                </p>
              </div>

              <div className="space-y-6">
                {/* Event Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Resumen del evento
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Nombre</dt>
                      <dd className="font-medium text-gray-900">
                        {formData.name || 'No especificado'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Categoría</dt>
                      <dd className="font-medium text-gray-900">
                        {formData.category || 'No especificado'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Fecha</dt>
                      <dd className="font-medium text-gray-900">
                        {formData.date} {formData.time}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Lugar</dt>
                      <dd className="font-medium text-gray-900">
                        {formData.venue}, {formData.city}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tipos de boletas</dt>
                      <dd className="font-medium text-gray-900">
                        {formData.tickets.length}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Tickets Summary */}
                {formData.tickets.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Boletas</h3>
                    <div className="space-y-2">
                      {formData.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600">{ticket.name}</span>
                          <span className="font-medium text-gray-900">
                            ${ticket.price.toLocaleString()} x {ticket.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Nota importante</p>
                    <p className="mt-1 text-yellow-700">
                      Tu evento será enviado para revisión. Recibirás una notificación
                      cuando sea aprobado y esté listo para publicar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                currentStep === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                  canProceed()
                    ? 'bg-[#E53935] text-white hover:bg-[#B71C1C]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Enviar para revisión
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
