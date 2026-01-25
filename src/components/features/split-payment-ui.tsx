'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Send, Check, Clock, AlertCircle, Copy } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

interface SplitPaymentUIProps {
    orderId: string;
    totalAmount: number;
    eventName: string;
    onCreateSplit: (participants: { email: string; name: string }[]) => Promise<void>;
}

interface Participant {
    id: string;
    email: string;
    name: string;
}

export function SplitPaymentUI({
    orderId,
    totalAmount,
    eventName,
    onCreateSplit,
}: SplitPaymentUIProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const splitCount = participants.length + 1; // +1 for self
    const amountPerPerson = Math.ceil(totalAmount / splitCount);

    const addParticipant = () => {
        if (!newEmail || !newName) {
            setError('Ingresa nombre y email');
            return;
        }

        if (!newEmail.includes('@')) {
            setError('Email inválido');
            return;
        }

        if (participants.some(p => p.email === newEmail)) {
            setError('Este email ya está agregado');
            return;
        }

        setParticipants([
            ...participants,
            { id: crypto.randomUUID(), email: newEmail, name: newName },
        ]);
        setNewEmail('');
        setNewName('');
        setError(null);
    };

    const removeParticipant = (id: string) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const handleCreateSplit = async () => {
        if (participants.length === 0) {
            setError('Agrega al menos una persona');
            return;
        }

        setIsCreating(true);
        try {
            await onCreateSplit(participants.map(p => ({ email: p.email, name: p.name })));
        } catch (err) {
            setError('Error al crear split');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E53935] to-[#B71C1C] p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6" />
                    <h2 className="text-lg font-semibold">Dividir Pago</h2>
                </div>
                <p className="text-white/80 text-sm">{eventName}</p>
            </div>

            <div className="p-6">
                {/* Amount breakdown */}
                <div className="bg-[#FAFAFA] rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#757575]">Total a dividir</span>
                        <span className="font-semibold">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#757575]">Personas</span>
                        <span className="font-semibold">{splitCount}</span>
                    </div>
                    <hr className="my-3 border-gray-200" />
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-medium">Cada uno paga</span>
                        <span className="font-bold text-[#E53935]">{formatPrice(amountPerPerson)}</span>
                    </div>
                </div>

                {/* Your portion */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            Tú
                        </div>
                        <span className="font-medium text-green-800">Tu parte</span>
                    </div>
                    <span className="font-semibold text-green-800">{formatPrice(amountPerPerson)}</span>
                </div>

                {/* Participants list */}
                <div className="space-y-3 mb-6">
                    {participants.map((participant, index) => (
                        <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-[#212121]">{participant.name}</p>
                                    <p className="text-sm text-[#757575]">{participant.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{formatPrice(amountPerPerson)}</span>
                                <button
                                    onClick={() => removeParticipant(participant.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add participant form */}
                <div className="mb-6">
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nombre"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Email"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                        />
                        <button
                            onClick={addParticipant}
                            className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </p>
                    )}
                </div>

                {/* Create button */}
                <button
                    onClick={handleCreateSplit}
                    disabled={participants.length === 0 || isCreating}
                    className="w-full py-4 bg-[#E53935] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    Enviar invitaciones
                </button>

                <p className="mt-4 text-xs text-center text-[#757575]">
                    Cada persona recibirá un link para pagar su parte
                </p>
            </div>
        </div>
    );
}

// Split status component for tracking payments
interface SplitStatusProps {
    splitGroup: {
        id: string;
        status: string;
        amountPerPerson: number;
        participants: {
            id: string;
            name: string;
            email: string;
            status: 'INVITED' | 'ACCEPTED' | 'PAID' | 'DECLINED';
        }[];
    };
    shareLink: string;
}

export function SplitStatus({ splitGroup, shareLink }: SplitStatusProps) {
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const paidCount = splitGroup.participants.filter(p => p.status === 'PAID').length;
    const totalCount = splitGroup.participants.length;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Estado del Split</h3>
                <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    splitGroup.status === 'COMPLETE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                )}>
                    {paidCount}/{totalCount} pagados
                </span>
            </div>

            {/* Share link */}
            <div className="flex items-center gap-2 mb-6">
                <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                />
                <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-[#E53935] text-white rounded-lg flex items-center gap-2"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                </button>
            </div>

            {/* Participants status */}
            <div className="space-y-3">
                {splitGroup.participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                p.status === 'PAID' ? 'bg-green-500' : 'bg-gray-300'
                            )}>
                                {p.status === 'PAID' ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs text-[#757575]">{p.email}</p>
                            </div>
                        </div>

                        <span className={cn(
                            'text-sm font-medium',
                            p.status === 'PAID' ? 'text-green-600' : 'text-[#757575]'
                        )}>
                            {p.status === 'PAID' ? 'Pagado' :
                                p.status === 'DECLINED' ? 'Rechazado' : 'Pendiente'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
