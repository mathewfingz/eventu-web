import Link from 'next/link';
import { CheckCircle, Download, Calendar, MapPin, Ticket } from 'lucide-react';

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { order?: string };
}) {
    const orderId = searchParams.order || 'N/A';

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-[#212121] mb-2">
                    ¡Pago exitoso!
                </h1>
                <p className="text-[#757575] mb-8">
                    Tu compra ha sido confirmada. Hemos enviado los detalles a tu correo.
                </p>

                {/* Order Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 text-left">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 bg-[#E53935]/10 rounded-lg flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-[#E53935]" />
                        </div>
                        <div>
                            <p className="text-sm text-[#757575]">Número de orden</p>
                            <p className="font-mono font-semibold">{orderId}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-[#757575]">
                            <Calendar className="w-4 h-4" />
                            <span>Recibirás tus boletas en unos minutos</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#757575]">
                            <MapPin className="w-4 h-4" />
                            <span>Encontrarás tu QR en la app o en tu email</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/dashboard/tickets"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Ver mis boletas
                    </Link>

                    <Link
                        href="/events"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Explorar más eventos
                    </Link>
                </div>

                {/* Help */}
                <p className="mt-8 text-sm text-[#757575]">
                    ¿Tienes problemas?{' '}
                    <Link href="/contact" className="text-[#E53935] hover:underline">
                        Contáctanos
                    </Link>
                </p>
            </div>
        </div>
    );
}
