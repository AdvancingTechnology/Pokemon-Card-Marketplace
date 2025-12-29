'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PullActivity {
  id: string;
  opened_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
  cards: {
    name: string;
    image_url: string | null;
    market_price: number | null;
  };
  packs: {
    name: string;
  };
}

export function LiveFeed() {
  const [recentPulls, setRecentPulls] = useState<PullActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial pulls
    const fetchPulls = async () => {
      const { data, error } = await supabase
        .from('pack_opens')
        .select(`
          id,
          opened_at,
          profiles(full_name, email),
          cards(name, image_url, market_price),
          packs(name)
        `)
        .order('opened_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        setRecentPulls(data as unknown as PullActivity[]);
      }
      setLoading(false);
    };

    fetchPulls();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('pack_opens_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pack_opens',
        },
        async (payload) => {
          // Fetch the full data with relations
          const { data } = await supabase
            .from('pack_opens')
            .select(`
              id,
              opened_at,
              profiles(full_name, email),
              cards(name, image_url, market_price),
              packs(name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setRecentPulls((prev) => [data as unknown as PullActivity, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="safari-card">
        <CardHeader>
          <CardTitle className="text-safari-tan">Loading activity...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (recentPulls.length === 0) {
    return (
      <Card className="safari-card">
        <CardHeader>
          <CardTitle className="text-safari-tan flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-safari-gold" />
            Just Pulled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-safari-tan/60 text-center py-8">
            No pulls yet. Be the first to open a pack!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="safari-card">
      <CardHeader>
        <CardTitle className="text-safari-tan flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-safari-gold animate-pulse" />
          Just Pulled
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentPulls.map((pull, index) => (
          <div
            key={pull.id}
            className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-safari-gold/10 hover:border-safari-gold/30 transition-all animate-in slide-in-from-top"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card Image */}
            <div className="w-16 h-16 bg-gradient-to-br from-black/40 to-black/60 rounded flex items-center justify-center flex-shrink-0">
              {pull.cards.image_url ? (
                <img
                  src={pull.cards.image_url}
                  alt={pull.cards.name}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="text-safari-gold text-xs">?</div>
              )}
            </div>

            {/* Pull Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-safari-tan truncate">
                {pull.cards.name}
              </div>
              <div className="text-xs text-safari-tan/60 truncate">
                {pull.profiles?.full_name || pull.profiles?.email?.split('@')[0] || 'Anonymous'}
                {' • '}
                {pull.packs?.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {pull.cards.market_price && (
                  <Badge className="bg-safari-gold/20 text-safari-gold text-xs border-safari-gold/40">
                    ${pull.cards.market_price}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-safari-tan/50">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(pull.opened_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
