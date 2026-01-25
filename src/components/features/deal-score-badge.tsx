'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { DealScoreResult, getDealScoreColor } from '@/lib/features/deal-score';
import { cn } from '@/lib/utils';

interface DealScoreBadgeProps {
    result: DealScoreResult;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

export function DealScoreBadge({
    result,
    size = 'md',
    showDetails = false
}: DealScoreBadgeProps) {
    const color = getDealScoreColor(result.score);

    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-14 h-14 text-lg',
        lg: 'w-20 h-20 text-2xl',
    };

    return (
        <div className="flex items-center gap-3">
            {/* Score Circle */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                    'relative rounded-full flex items-center justify-center font-bold',
                    sizeClasses[size]
                )}
                style={{
                    backgroundColor: `${color}20`,
                    color: color,
                }}
            >
                {result.score}

                {/* Emoji overlay */}
                <span className="absolute -top-1 -right-1 text-base">
                    {result.emoji}
                </span>
            </motion.div>

            {/* Label */}
            <div>
                <p className="font-semibold text-[#212121]" style={{ color }}>
                    {result.label}
                </p>

                {showDetails && (
                    <div className="flex items-center gap-2 text-sm text-[#757575]">
                        {result.priceVsOriginal <= 0 ? (
                            <span className="flex items-center gap-1 text-green-600">
                                <TrendingDown className="w-4 h-4" />
                                {Math.abs(result.priceVsOriginal)}% bajo precio original
                            </span>
                        ) : result.priceVsOriginal > 0 ? (
                            <span className="flex items-center gap-1 text-orange-500">
                                <TrendingUp className="w-4 h-4" />
                                {result.priceVsOriginal}% sobre precio original
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Minus className="w-4 h-4" />
                                Precio original
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface DealScoreCardProps {
    result: DealScoreResult;
}

export function DealScoreCard({ result }: DealScoreCardProps) {
    const color = getDealScoreColor(result.score);

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <DealScoreBadge result={result} size="lg" />

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Info className="w-5 h-5 text-[#757575]" />
                </button>
            </div>

            {/* Recommendation */}
            <p className="text-sm text-[#757575] mb-4">
                {result.recommendation}
            </p>

            {/* Factor Breakdown */}
            <div className="space-y-2">
                <FactorBar label="Precio" score={result.factors.priceScore} />
                <FactorBar label="Timing" score={result.factors.timingScore} />
                <FactorBar label="Demanda" score={result.factors.demandScore} />
                <FactorBar label="Vendedor" score={result.factors.sellerScore} />
            </div>

            {/* Price comparison */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-[#757575]">vs Precio Original</p>
                    <p className={cn(
                        'font-semibold',
                        result.priceVsOriginal <= 0 ? 'text-green-600' : 'text-orange-500'
                    )}>
                        {result.priceVsOriginal <= 0 ? '' : '+'}{result.priceVsOriginal}%
                    </p>
                </div>

                {result.priceVsMarket !== undefined && (
                    <div>
                        <p className="text-[#757575]">vs Mercado</p>
                        <p className={cn(
                            'font-semibold',
                            result.priceVsMarket <= 0 ? 'text-green-600' : 'text-orange-500'
                        )}>
                            {result.priceVsMarket <= 0 ? '' : '+'}{result.priceVsMarket}%
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FactorBar({ label, score }: { label: string; score: number }) {
    const color = score >= 70 ? '#22C55E' : score >= 50 ? '#EAB308' : '#EF4444';

    return (
        <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-[#757575]">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            <span className="w-8 text-xs text-right font-medium">{score}</span>
        </div>
    );
}
