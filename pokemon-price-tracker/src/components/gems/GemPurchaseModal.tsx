'use client';

import { useState, useEffect } from 'react';
import { Diamond, Loader2, Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GemPackage } from '@/types/gems.types';

interface GemPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GemPurchaseModal({ open, onOpenChange }: GemPurchaseModalProps) {
  const [packages, setPackages] = useState<GemPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPackages();
    }
  }, [open]);

  async function fetchPackages() {
    try {
      const res = await fetch('/api/gems/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(packageId: string) {
    setPurchasing(packageId);
    try {
      const res = await fetch('/api/gems/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    } finally {
      setPurchasing(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <Card className="relative z-10 max-w-2xl w-full mx-4 bg-[#1B3A2F] border-[#D4AF37]/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#D4AF37]">
            <Diamond className="h-6 w-6 text-purple-400" />
            Buy Gems
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-[#D7C7A3]"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <p className="text-[#D7C7A3] mb-4">
            Get gems to open mystery packs and collect rare cards
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const totalGems = pkg.base_gems + pkg.bonus_gems;
                const bonusPercent = pkg.bonus_gems > 0
                  ? Math.round((pkg.bonus_gems / pkg.base_gems) * 100)
                  : 0;

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-4 rounded-lg border transition-all ${
                      pkg.badge_text === 'BEST VALUE'
                        ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/10 to-transparent'
                        : 'border-purple-500/30 hover:border-purple-400/50'
                    }`}
                  >
                    {pkg.badge_text && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-bold bg-[#D4AF37] text-[#1B3A2F] rounded-full">
                          {pkg.badge_text}
                        </span>
                      </div>
                    )}

                    <div className="text-center space-y-3 pt-2">
                      <h3 className="font-bold text-[#D7C7A3]">{pkg.name}</h3>

                      <div className="flex items-center justify-center gap-1">
                        <Diamond className="h-5 w-5 text-purple-400" />
                        <span className="text-2xl font-bold text-purple-300">
                          {totalGems.toLocaleString()}
                        </span>
                      </div>

                      {bonusPercent > 0 && (
                        <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
                          <Sparkles className="h-4 w-4" />
                          <span>+{bonusPercent}% bonus!</span>
                        </div>
                      )}

                      <Button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={purchasing !== null}
                        className="w-full bg-purple-600 hover:bg-purple-500"
                      >
                        {purchasing === pkg.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            ${(pkg.price_cents / 100).toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
