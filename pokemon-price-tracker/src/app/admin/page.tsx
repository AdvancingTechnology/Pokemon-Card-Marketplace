'use client';

import { useEffect, useState } from 'react';
import { Package, CreditCard, Gem, Truck, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalPacks: number;
  totalCards: number;
  totalPackOpens: number;
  totalGemsSold: number;
  pendingRedemptions: number;
  totalUsers: number;
  recentOpens: Array<{
    id: string;
    user_email: string;
    pack_name: string;
    card_name: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch counts in parallel
        const [
          { count: packsCount },
          { count: cardsCount },
          { count: opensCount },
          { data: gemTx },
          { count: pendingCount },
        ] = await Promise.all([
          supabase.from('packs').select('*', { count: 'exact', head: true }),
          supabase.from('cards').select('*', { count: 'exact', head: true }),
          supabase.from('pack_opens').select('*', { count: 'exact', head: true }),
          supabase.from('gem_transactions').select('amount').eq('transaction_type', 'purchase'),
          supabase.from('pack_opens').select('*', { count: 'exact', head: true }).eq('redemption_status', 'pending_redemption'),
        ]);

        // Calculate total gems sold
        const totalGemsSold = gemTx?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

        // Fetch recent pack opens
        const { data: recentOpens } = await supabase
          .from('pack_opens')
          .select(`
            id,
            created_at,
            packs (name),
            cards (name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalPacks: packsCount || 0,
          totalCards: cardsCount || 0,
          totalPackOpens: opensCount || 0,
          totalGemsSold,
          pendingRedemptions: pendingCount || 0,
          totalUsers: 0, // Would need auth admin access
          recentOpens: (recentOpens || []).map((open) => {
            const pack = open.packs as unknown as { name: string } | null;
            const card = open.cards as unknown as { name: string } | null;
            return {
              id: open.id,
              user_email: 'User',
              pack_name: pack?.name || 'Unknown Pack',
              card_name: card?.name || 'Unknown Card',
              created_at: open.created_at,
            };
          }),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  const statCards = [
    { title: 'Total Packs', value: stats?.totalPacks || 0, icon: Package, color: 'text-blue-400' },
    { title: 'Total Cards', value: stats?.totalCards || 0, icon: CreditCard, color: 'text-green-400' },
    { title: 'Packs Opened', value: stats?.totalPackOpens || 0, icon: TrendingUp, color: 'text-purple-400' },
    { title: 'Gems Sold', value: stats?.totalGemsSold?.toLocaleString() || 0, icon: Gem, color: 'text-yellow-400' },
    { title: 'Pending Redemptions', value: stats?.pendingRedemptions || 0, icon: Truck, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-safari-gold">Dashboard</h1>
        <p className="text-safari-tan/60 mt-1">Overview of your Slab Safari marketplace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-safari-green border-safari-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-safari-tan/60">{stat.title}</p>
                  <p className="text-2xl font-bold text-safari-tan mt-1">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-safari-green border-safari-gold/20">
        <CardHeader>
          <CardTitle className="text-safari-gold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Pack Opens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-safari-tan/60">Loading...</p>
          ) : stats?.recentOpens.length === 0 ? (
            <p className="text-safari-tan/60">No pack opens yet</p>
          ) : (
            <div className="space-y-4">
              {stats?.recentOpens.map((open) => (
                <div
                  key={open.id}
                  className="flex items-center justify-between p-4 bg-safari-green-dark rounded-lg"
                >
                  <div>
                    <p className="text-safari-tan font-medium">{open.card_name}</p>
                    <p className="text-sm text-safari-tan/60">
                      from {open.pack_name}
                    </p>
                  </div>
                  <p className="text-sm text-safari-tan/40">
                    {new Date(open.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
