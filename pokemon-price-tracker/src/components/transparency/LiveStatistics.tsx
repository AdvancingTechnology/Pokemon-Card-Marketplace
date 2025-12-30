'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Truck, TrendingUp } from 'lucide-react';

interface Stats {
  total_packs_opened: number;
  total_gems_distributed: number;
  total_cards_shipped: number;
  active_users_24h: number;
  payout_percentage: number;
}

export function LiveStatistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/transparency/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Packs Opened',
      value: stats?.total_packs_opened ?? 0,
      icon: Package,
      color: 'text-purple-400',
    },
    {
      title: 'Gems Distributed',
      value: stats?.total_gems_distributed ?? 0,
      icon: TrendingUp,
      color: 'text-[#D4AF37]',
    },
    {
      title: 'Cards Shipped',
      value: stats?.total_cards_shipped ?? 0,
      icon: Truck,
      color: 'text-green-400',
    },
    {
      title: 'Active Users (24h)',
      value: stats?.active_users_24h ?? 0,
      icon: Users,
      color: 'text-blue-400',
    },
  ];

  return (
    <Card className="bg-[#1B3A2F]/80 border-[#D4AF37]/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#D4AF37]">Live Platform Statistics</CardTitle>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400">Live</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.title} className="text-center space-y-2">
              <stat.icon className={`h-6 w-6 mx-auto ${stat.color}`} />
              <p className="text-2xl font-bold text-[#D7C7A3]">
                {loading ? '...' : stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-[#D7C7A3]/70">{stat.title}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
