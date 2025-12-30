'use client';

import { useEffect, useState } from 'react';
import { Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface Redemption {
  id: string;
  user_id: string;
  pack_id: string;
  card_id: string;
  redemption_status: string;
  created_at: string;
  cards: {
    name: string;
    set_name: string;
    market_price: number | null;
  } | null;
  packs: {
    name: string;
  } | null;
}

export default function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending_redemption');
  const supabase = createClient();

  useEffect(() => {
    fetchRedemptions();
  }, [filter]);

  async function fetchRedemptions() {
    setLoading(true);
    let query = supabase
      .from('pack_opens')
      .select(`
        id,
        user_id,
        pack_id,
        card_id,
        redemption_status,
        created_at,
        cards (name, set_name, market_price),
        packs (name)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('redemption_status', filter);
    }

    const { data, error } = await query.limit(50);

    if (data && !error) {
      setRedemptions(data as unknown as Redemption[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('pack_opens')
      .update({ redemption_status: newStatus })
      .eq('id', id);

    if (!error) {
      setRedemptions(
        redemptions.map((r) =>
          r.id === id ? { ...r, redemption_status: newStatus } : r
        )
      );
    }
  }

  const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    in_inventory: { color: 'bg-gray-500/20 text-gray-400', icon: Package, label: 'In Inventory' },
    pending_redemption: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, label: 'Pending' },
    shipped: { color: 'bg-blue-500/20 text-blue-400', icon: Truck, label: 'Shipped' },
    delivered: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: 'Delivered' },
    resold: { color: 'bg-purple-500/20 text-purple-400', icon: Package, label: 'Resold' },
  };

  const filters = [
    { value: 'pending_redemption', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-safari-gold">Redemptions</h1>
        <p className="text-safari-tan/60 mt-1">Manage card redemption requests</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter !== f.value ? 'border-safari-gold/30' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Redemptions List */}
      {loading ? (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-safari-gold mx-auto animate-pulse mb-4" />
          <p className="text-safari-tan/60">Loading redemptions...</p>
        </div>
      ) : redemptions.length === 0 ? (
        <Card className="bg-safari-green border-safari-gold/20">
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 text-safari-gold/40 mx-auto mb-4" />
            <p className="text-safari-tan/60">No redemptions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {redemptions.map((redemption) => {
            const status = statusConfig[redemption.redemption_status] || statusConfig.in_inventory;
            const StatusIcon = status.icon;

            return (
              <Card key={redemption.id} className="bg-safari-green border-safari-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-safari-green-dark rounded-lg flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="h-6 w-6 text-safari-gold" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-safari-tan">
                          {redemption.cards?.name || 'Unknown Card'}
                        </h3>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-safari-tan/60">
                        {redemption.cards?.set_name} • from {redemption.packs?.name}
                      </p>
                      <p className="text-xs text-safari-tan/40 mt-1">
                        Requested: {new Date(redemption.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Value */}
                    {redemption.cards?.market_price && (
                      <div className="text-right">
                        <p className="text-xs text-safari-tan/60">Value</p>
                        <p className="text-xl font-bold text-safari-gold">
                          ${redemption.cards.market_price}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {redemption.redemption_status === 'pending_redemption' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(redemption.id, 'shipped')}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Mark Shipped
                        </Button>
                      )}
                      {redemption.redemption_status === 'shipped' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(redemption.id, 'delivered')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
