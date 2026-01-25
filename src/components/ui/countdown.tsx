'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
    targetDate: Date;
    label?: string;
    onComplete?: () => void;
    variant?: 'default' | 'compact' | 'banner';
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

export function Countdown({
    targetDate,
    label = 'Inicia en',
    onComplete,
    variant = 'default',
}: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

    useEffect(() => {
        const calculateTimeLeft = (): TimeLeft => {
            const difference = targetDate.getTime() - Date.now();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                total: difference,
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft.total <= 0) {
                clearInterval(timer);
                onComplete?.();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const formatNumber = (num: number): string => num.toString().padStart(2, '0');

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-[#E53935]" />
                <span>
                    {timeLeft.days > 0 && `${timeLeft.days}d `}
                    {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
                </span>
            </div>
        );
    }

    if (variant === 'banner') {
        return (
            <div className="bg-[#E53935] text-white">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-4">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex gap-3 font-mono font-bold">
                        {timeLeft.days > 0 && (
                            <span>{timeLeft.days}d</span>
                        )}
                        <span>{formatNumber(timeLeft.hours)}h</span>
                        <span>{formatNumber(timeLeft.minutes)}m</span>
                        <span>{formatNumber(timeLeft.seconds)}s</span>
                    </div>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className="text-center">
            {label && (
                <p className="text-sm text-[#757575] mb-3">{label}</p>
            )}
            <div className="flex justify-center gap-3">
                {timeLeft.days > 0 && (
                    <TimeUnit value={timeLeft.days} label="Días" />
                )}
                <TimeUnit value={timeLeft.hours} label="Horas" />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeUnit value={timeLeft.seconds} label="Seg" />
            </div>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#212121] text-white rounded-xl flex items-center justify-center text-2xl font-bold font-mono">
                {value.toString().padStart(2, '0')}
            </div>
            <span className="mt-1 text-xs text-[#757575]">{label}</span>
        </div>
    );
}
