'use client';

import { useState, useEffect } from 'react';
import { Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GemBalanceProps {
  onBuyClick?: () => void;
}

export function GemBalance({ onBuyClick }: GemBalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch('/api/gems');
        if (res.ok) {
          const data = await res.json();
          setBalance(data.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch gem balance:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, []);

  return (
    <Button
      variant="outline"
      onClick={onBuyClick}
      className="gap-2 bg-gradient-to-r from-purple-600/20 to-purple-400/20 border-purple-500/50 hover:border-purple-400"
    >
      <Diamond className="h-4 w-4 text-purple-400" />
      <span className="font-bold text-purple-300">
        {loading ? '...' : balance.toLocaleString()}
      </span>
    </Button>
  );
}
