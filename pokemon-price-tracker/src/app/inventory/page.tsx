'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, TrendingUp, Calendar, Filter } from 'lucide-react';
import { SlabSafariLogo } from '@/components/branding/SlabSafariLogo';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { GemBalance } from '@/components/GemBalance';

interface PulledCard {
  id: string;
  opened_at: string;
  pack_name: string;
  card_id: string;
  card_name: string;
  card_set: string;
  card_rarity: string | null;
  card_image: string | null;
  card_price: number | null;
  redemption_status: 'in_inventory' | 'pending_redemption' | 'shipped' | 'resold';
  resell_gems_earned: number | null;
}

export default function CollectionPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [pulls, setPulls] = useState<PulledCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'value' | 'pack'>('recent');
  const [filterPack, setFilterPack] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!user) return;

    const fetchPulls = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('pack_opens')
        .select(`
          id,
          opened_at,
          redemption_status,
          resell_gems_earned,
          packs(name),
          cards(id, name, set_name, rarity, image_url, market_price)
        `)
        .eq('user_id', user.id)
        .order('opened_at', { ascending: false });

      if (data && !error) {
        const transformedPulls = data.map((pull) => {
          // Supabase returns nested objects for single relations
          const packs = pull.packs as unknown as { name: string } | null;
          const cards = pull.cards as unknown as { id: string; name: string; set_name: string; rarity: string | null; image_url: string | null; market_price: number | null } | null;
          return {
            id: pull.id as string,
            opened_at: pull.opened_at as string,
            pack_name: packs?.name || 'Unknown Pack',
            card_id: cards?.id || '',
            card_name: cards?.name || 'Unknown Card',
            card_set: cards?.set_name || '',
            card_rarity: cards?.rarity ?? null,
            card_image: cards?.image_url ?? null,
            card_price: cards?.market_price ?? null,
            redemption_status: pull.redemption_status as 'in_inventory' | 'pending_redemption' | 'shipped' | 'resold',
            resell_gems_earned: pull.resell_gems_earned as number | null,
          };
        });
        setPulls(transformedPulls);
      }

      setLoading(false);
    };

    fetchPulls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated, authLoading, router]);

  // Calculate stats
  const totalValue = pulls.reduce((sum, pull) => sum + (pull.card_price || 0), 0);
  const totalPulls = pulls.length;
  const uniqueCards = new Set(pulls.map(p => p.card_id)).size;
  const packTypes = [...new Set(pulls.map(p => p.pack_name))];

  // Sort pulls
  const sortedPulls = [...pulls].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return (b.card_price || 0) - (a.card_price || 0);
      case 'pack':
        return a.pack_name.localeCompare(b.pack_name);
      case 'recent':
      default:
        return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
    }
  });

  // Filter pulls
  const filteredPulls = filterPack === 'all'
    ? sortedPulls
    : sortedPulls.filter(p => p.pack_name === filterPack);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-safari-green flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-safari-gold mx-auto mb-4 animate-pulse" />
          <p className="text-safari-tan">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-safari-green">
      {/* Navigation */}
      <nav className="border-b border-safari-gold/20 bg-safari-green-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-safari-tan hover:text-safari-gold"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Packs
              </Button>
              <SlabSafariLogo showTagline={false} />
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && <GemBalance />}
              <div className="text-safari-tan">
                <span className="text-sm">Signed in as </span>
                <span className="font-semibold">{user?.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-safari-green-dark via-safari-green to-safari-green-light py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-safari-tan mb-4">Digital Inventory</h1>
          <p className="text-safari-tan/70 text-lg">All your pulled cards in one place</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <Card className="safari-card">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-safari-gold mx-auto mb-2" />
                <div className="text-3xl font-bold text-safari-tan">{totalPulls}</div>
                <div className="text-sm text-safari-tan/60">Total Pulls</div>
              </CardContent>
            </Card>

            <Card className="safari-card">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-safari-gold">${totalValue.toFixed(2)}</div>
                <div className="text-sm text-safari-tan/60">Total Value</div>
              </CardContent>
            </Card>

            <Card className="safari-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-safari-tan mb-2">🎴</div>
                <div className="text-3xl font-bold text-safari-tan">{uniqueCards}</div>
                <div className="text-sm text-safari-tan/60">Unique Cards</div>
              </CardContent>
            </Card>

            <Card className="safari-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-safari-tan mb-2">📦</div>
                <div className="text-3xl font-bold text-safari-tan">{packTypes.length}</div>
                <div className="text-sm text-safari-tan/60">Pack Types</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-safari-tan/60" />
            <span className="text-safari-tan/60 text-sm">Filter & Sort:</span>
          </div>

          <Select value={sortBy} onValueChange={(value: 'recent' | 'value' | 'pack') => setSortBy(value)}>
            <SelectTrigger className="w-[180px] bg-safari-green-dark border-safari-gold/20 text-safari-tan">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="value">Highest Value</SelectItem>
              <SelectItem value="pack">Pack Name</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPack} onValueChange={setFilterPack}>
            <SelectTrigger className="w-[200px] bg-safari-green-dark border-safari-gold/20 text-safari-tan">
              <SelectValue placeholder="All Packs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Packs</SelectItem>
              {packTypes.map(pack => (
                <SelectItem key={pack} value={pack}>{pack}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto text-safari-tan/60 text-sm">
            Showing {filteredPulls.length} of {totalPulls} pulls
          </div>
        </div>

        {/* Cards Grid */}
        {filteredPulls.length === 0 ? (
          <Card className="safari-card p-12">
            <div className="text-center">
              <Package className="h-16 w-16 text-safari-tan/40 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-safari-tan mb-2">No Cards Yet</h3>
              <p className="text-safari-tan/60 mb-6">
                {filterPack === 'all'
                  ? "Start opening packs to build your collection!"
                  : `No pulls from ${filterPack} yet.`}
              </p>
              <Button onClick={() => router.push('/')}>
                Browse Packs
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPulls.map((pull) => (
              <Card key={pull.id} className="safari-card safari-card-hover overflow-hidden">
                {/* Card Image */}
                <div className="relative h-64 bg-gradient-to-br from-black/40 to-black/60 flex items-center justify-center p-4">
                  {pull.card_image ? (
                    <img
                      src={pull.card_image}
                      alt={pull.card_name}
                      className="max-h-full max-w-full object-contain drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-safari-gold text-6xl">?</div>
                  )}

                  {/* Rarity Badge */}
                  {pull.card_rarity && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-safari-gold/90 text-safari-green font-bold text-xs">
                        {pull.card_rarity}
                      </Badge>
                    </div>
                  )}

                  {/* Price Badge */}
                  {pull.card_price && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-500/90 text-white font-bold">
                        ${pull.card_price}
                      </Badge>
                    </div>
                  )}

                  {/* Status Overlay for non-in_inventory cards */}
                  {pull.redemption_status !== 'in_inventory' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      {pull.redemption_status === 'pending_redemption' && (
                        <Badge className="bg-blue-500 text-white px-3 py-2 text-sm">
                          Pending Shipment
                        </Badge>
                      )}
                      {pull.redemption_status === 'shipped' && (
                        <Badge className="bg-green-500 text-white px-3 py-2 text-sm">
                          Shipped
                        </Badge>
                      )}
                      {pull.redemption_status === 'resold' && (
                        <Badge className="bg-safari-gold text-safari-green-dark px-3 py-2 text-sm">
                          Resold for {pull.resell_gems_earned} Gems
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <CardContent className="p-4">
                  <h3 className="font-bold text-safari-tan text-lg mb-1 truncate">
                    {pull.card_name}
                  </h3>
                  <p className="text-safari-tan/60 text-sm mb-3 truncate">
                    {pull.card_set}
                  </p>

                  {/* Pack & Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-safari-tan/50">
                      <Package className="h-3 w-3" />
                      <span className="truncate">{pull.pack_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-safari-tan/50">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(pull.opened_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
