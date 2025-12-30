'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const PACK_ODDS = [
  { rarity: 'Common', percentage: 65.0, color: '#9CA3AF' },
  { rarity: 'Uncommon', percentage: 24.0, color: '#34D399' },
  { rarity: 'Rare', percentage: 8.0, color: '#3B82F6' },
  { rarity: 'Ultra Rare', percentage: 2.5, color: '#8B5CF6' },
  { rarity: 'Secret Rare', percentage: 0.45, color: '#F59E0B' },
  { rarity: 'Chase', percentage: 0.05, color: '#EF4444' },
];

interface PackOddsDisplayProps {
  packName?: string;
  packPrice?: number;
}

export function PackOddsDisplay({ packName = 'Safari Premium Pack', packPrice = 100 }: PackOddsDisplayProps) {
  const expectedValue = packPrice * 0.85; // 85% payout
  const houseEdge = 15;

  return (
    <Card className="bg-[#1B3A2F]/80 border-[#D4AF37]/30">
      <CardHeader>
        <CardTitle className="text-[#D4AF37]">Pack Odds Disclosure</CardTitle>
        <p className="text-sm text-[#D7C7A3]">{packName} (${packPrice})</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Odds Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[#D7C7A3]">Rarity Distribution</h4>
          {PACK_ODDS.map((odds) => (
            <div key={odds.rarity} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: odds.color }}>{odds.rarity}</span>
                <span className="text-[#D7C7A3]">{odds.percentage}%</span>
              </div>
              <Progress
                value={odds.percentage}
                className="h-2"
                style={{ '--progress-color': odds.color } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        {/* Expected Value */}
        <div className="pt-4 border-t border-[#D4AF37]/20 space-y-2">
          <div className="flex justify-between">
            <span className="text-[#D7C7A3]">Expected Value:</span>
            <span className="text-[#D4AF37] font-bold">
              ${expectedValue.toFixed(2)} ({((expectedValue / packPrice) * 100).toFixed(0)}% of pack price)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#D7C7A3]">House Edge:</span>
            <span className="text-red-400 font-bold">{houseEdge}%</span>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300">
            ⚠️ On average, pack contents are worth less than the purchase price.
            This is entertainment, not an investment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
