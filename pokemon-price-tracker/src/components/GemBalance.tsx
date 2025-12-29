'use client';

import { useState } from 'react';
import { Gem, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { useGems, GemTransaction } from '@/hooks/useGems';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function GemBalance() {
  const { gemBalance, transactions, loading } = useGems();
  const [open, setOpen] = useState(false);

  const formatTransaction = (tx: GemTransaction) => {
    const isPositive = tx.amount > 0;
    const typeLabels: Record<GemTransaction['type'], string> = {
      earned_resell: 'Card Resell',
      spent_pack: 'Pack Purchase',
      purchased: 'Gems Purchase',
      refund: 'Refund'
    };

    return {
      amountFormatted: `${isPositive ? '+' : ''}${tx.amount}`,
      typeLabel: typeLabels[tx.type] || 'Transaction',
      isPositive,
      date: formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Gem className="h-4 w-4 text-safari-gold animate-pulse" />
        <span className="text-safari-tan/60 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 px-3">
          <Gem className="h-4 w-4 text-safari-gold" />
          <span className="font-bold text-safari-gold">{gemBalance}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-safari-gold/30" align="end">
        <div className="bg-safari-green-dark p-4 border-b border-safari-gold/20">
          <div className="text-sm text-safari-tan/70">Your Balance</div>
          <div className="text-2xl font-bold text-safari-gold flex items-center gap-2">
            <Gem className="h-5 w-5" />
            {gemBalance} Gems
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-safari-tan mb-2">Recent Transactions</h3>

            {transactions.length === 0 ? (
              <p className="text-safari-tan/50 text-sm py-2 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => {
                  const { amountFormatted, typeLabel, isPositive, date } = formatTransaction(tx);
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-1 border-b border-safari-gold/10 last:border-0">
                      <div className="flex items-center gap-2">
                        {tx.type === 'earned_resell' ? (
                          <Gem className={`h-4 w-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                        ) : tx.type === 'spent_pack' ? (
                          <CreditCard className={`h-4 w-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                        ) : (
                          <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                        )}
                        <div>
                          <div className="text-sm text-safari-tan">
                            {typeLabel}
                          </div>
                          <div className="text-xs text-safari-tan/50 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {date}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-red-500/20 text-red-400 border-red-400/30'}`}>
                        {amountFormatted}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-safari-green-dark p-3 border-t border-safari-gold/20 flex justify-between">
          <Button variant="ghost" size="sm" className="text-safari-tan/70 hover:text-safari-tan">
            History
          </Button>
          <Button size="sm">
            <CreditCard className="h-4 w-4 mr-1" />
            Buy Gems
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
