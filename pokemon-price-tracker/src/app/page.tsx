'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Package, Zap, TrendingUp, Shield, DollarSign, Star } from 'lucide-react';
import { SlabSafariLogo } from '@/components/branding/SlabSafariLogo';
import { PackCard } from '@/components/packs/PackCard';
import { PackOpeningModal } from '@/components/packs/PackOpeningModal';
import { PackDetailModal } from '@/components/packs/PackDetailModal';
import { LiveFeed } from '@/components/activity/LiveFeed';
import { PackFilters } from '@/components/packs/PackFilters';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from '@/lib/supabase/client';
import { GemBalance } from '@/components/GemBalance';

// Sample pack data (will be replaced with Supabase data)
const samplePacks = [
  {
    id: '1',
    name: 'Legendary Safari',
    description: 'Hunt for PSA 10 Gem Mints and BGS Black Labels. Only the rarest pulls make it here.',
    tier: 'legendary',
    price: 500,
    floorValue: 100,
    ceilingValue: 5000,
    expectedValue: 425,
    totalOpened: 1247,
    isFeatured: true,
    isHot: true,
  },
  {
    id: '2',
    name: 'Gold Safari',
    description: 'Mid-tier chase cards with excellent odds of hitting modern staples and vintage holos.',
    tier: 'gold',
    price: 100,
    floorValue: 20,
    ceilingValue: 500,
    expectedValue: 85,
    totalOpened: 5832,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Bronze Safari',
    description: 'Start your hunt with graded commons and uncommons. Perfect for beginners.',
    tier: 'bronze',
    price: 25,
    floorValue: 5,
    ceilingValue: 150,
    expectedValue: 22,
    totalOpened: 12458,
  },
  {
    id: '4',
    name: 'Vintage Bronze',
    description: 'Classic WOTC era cards in graded condition. Guaranteed PSA 6 or better.',
    tier: 'bronze',
    price: 25,
    floorValue: 8,
    ceilingValue: 120,
    expectedValue: 21,
    totalOpened: 3721,
  },
  {
    id: '5',
    name: 'Modern Gold',
    description: 'Modern era chase cards from Sword & Shield through Scarlet & Violet. PSA 9+ guaranteed.',
    tier: 'gold',
    price: 100,
    floorValue: 25,
    ceilingValue: 450,
    expectedValue: 90,
    totalOpened: 2156,
  },
  {
    id: '6',
    name: 'Graded Gem Hunt',
    description: 'Premium pack focused on PSA 10 candidates. Every card is a potential gem mint.',
    tier: 'legendary',
    price: 500,
    floorValue: 150,
    ceilingValue: 4500,
    expectedValue: 450,
    totalOpened: 891,
  },
];

export default function Home() {
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [openingPack, setOpeningPack] = useState<{ id: string; name: string; tier: string } | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [packs, setPacks] = useState(samplePacks);
  const [filteredPacks, setFilteredPacks] = useState(samplePacks);
  const [sortBy, setSortBy] = useState("default");
  const [tierFilter, setTierFilter] = useState("any");
  const supabase = createClient();

  // Fetch packs from Supabase
  useEffect(() => {
    const fetchPacks = async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .order('tier', { ascending: false });

      if (data && data.length > 0) {
        const transformedPacks = data.map((pack: any) => ({
          id: pack.id,
          name: pack.name,
          description: pack.description || '',
          tier: pack.tier,
          price: Number(pack.price),
          floorValue: Number(pack.floor_value || 0),
          ceilingValue: Number(pack.ceiling_value || 0),
          expectedValue: Number(pack.expected_value || 0),
          totalOpened: pack.total_opened || 0,
          isFeatured: pack.is_featured || false,
          isHot: pack.is_hot || false,
          imageUrl: pack.image_url,
        }));
        setPacks(transformedPacks);
      }
    };

    fetchPacks();
  }, []);

  const featuredPack = packs.find(p => p.isHot) || packs[0];
  const legendaryPacks = packs.filter(p => p.tier === 'legendary');
  const goldPacks = packs.filter(p => p.tier === 'gold');
  const bronzePacks = packs.filter(p => p.tier === 'bronze' || p.tier === 'misc');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-safari-green flex items-center justify-center">
        <div className="text-center">
          <SlabSafariLogo variant="icon" className="w-24 h-24 mx-auto mb-4 animate-pulse" />
          <p className="text-safari-tan">Loading Slab Safari...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-safari-green">
      {/* Navigation */}
      <nav className="border-b border-safari-gold/20 bg-safari-green-dark/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <SlabSafariLogo showTagline={false} />

            <div className="hidden md:flex items-center gap-6">
              <button className="text-safari-tan hover:text-safari-gold font-medium transition-colors">
                Packs
              </button>
              <Link href="/inventory" className="text-safari-tan hover:text-safari-gold font-medium transition-colors">
                <Package className="inline h-4 w-4 mr-1" />
                Digital Inventory
              </Link>
              <button className="text-safari-tan hover:text-safari-gold font-medium transition-colors">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Leaderboard
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <>
                  <GemBalance />
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-safari-tan" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-safari-gold rounded-full"></span>
                  </Button>
                </>
              )}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-safari-tan hidden md:block">
                    {user?.email?.split('@')[0]}
                  </span>
                  <Button variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Pack Detail Modal */}
      <PackDetailModal
        packId={selectedPackId || ""}
        isOpen={!!selectedPackId}
        onClose={() => setSelectedPackId(null)}
        onPurchase={() => {
          const pack = packs.find(p => p.id === selectedPackId);
          if (pack) {
            setOpeningPack({ id: pack.id, name: pack.name, tier: pack.tier });
            setSelectedPackId(null);
          }
        }}
      />


      {/* Pack Opening Modal */}
      <PackOpeningModal
        packId={openingPack?.id || ""}
        packName={openingPack?.name || ""}
        packTier={openingPack?.tier || ""}
        isOpen={!!openingPack}
        onClose={() => setOpeningPack(null)}
      />

      {/* Hero Section - Hot Pack Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-safari-green-dark via-safari-green to-safari-green-light py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/safari-pattern.svg')] bg-repeat"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Text */}
            <div className="space-y-6">
              <Badge className="bg-safari-gold text-safari-green font-bold text-sm px-4 py-1">
                <Zap className="h-4 w-4 mr-1 animate-pulse" />
                LIVE NOW
              </Badge>

              <h1 className="text-6xl font-bold text-safari-tan leading-tight">
                Hunt for
                <br />
                <span className="text-gold-gradient">Pokemon Cards</span>
              </h1>

              <p className="text-xl text-safari-tan/80">
                Open Pokemon Mystery Packs with transparent odds. Every pack reveals ONE graded Pokemon card. Redeem for the physical card or resell for Gems!
              </p>

              <div className="flex gap-3">
                <Button size="lg" className="text-lg h-14 px-8">
                  <Package className="h-5 w-5 mr-2" />
                  Browse Packs
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Recent Pulls
                </Button>
              </div>
            </div>

            {/* Right: Featured Pack */}
            <div className="relative">
              <div className="absolute -inset-4 bg-safari-gold/20 rounded-2xl blur-xl"></div>
              <div className="relative max-w-sm mx-auto">
                <PackCard {...featuredPack} onClick={() => setSelectedPackId(featuredPack.id)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-safari-green-dark border-y border-safari-gold/20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Package, label: "Total Packs", value: "50K+", color: "text-safari-gold" },
              { icon: TrendingUp, label: "Avg EV Ratio", value: "85%", color: "text-green-400" },
              { icon: Star, label: "PSA 10 Pulls", value: "2,341", color: "text-yellow-400" },
              { icon: Shield, label: "Verified Cards", value: "100%", color: "text-blue-400" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-3xl font-bold text-safari-tan">{stat.value}</div>
                <div className="text-sm text-safari-tan/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content - Packs Grid & Activity Feed */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Packs Grid (Left - 2 cols) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Legendary Packs */}
            {legendaryPacks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-3xl font-bold text-gold-gradient">🏆 Legendary</h2>
                  <Badge className="bg-safari-gold/20 text-safari-gold border-safari-gold">
                    {legendaryPacks.length} packs
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {legendaryPacks.map(pack => (
                    <PackCard key={pack.id} {...pack} onClick={() => setSelectedPackId(pack.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Gold Packs */}
            {goldPacks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-3xl font-bold text-safari-tan">💎 Gold</h2>
                  <Badge className="bg-safari-tan/20 text-safari-tan border-safari-tan">
                    {goldPacks.length} packs
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {goldPacks.map(pack => (
                    <PackCard key={pack.id} {...pack} onClick={() => setSelectedPackId(pack.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Bronze Packs */}
            {bronzePacks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-3xl font-bold text-safari-tan">🥉 Bronze</h2>
                  <Badge className="bg-amber-700/20 text-amber-400 border-amber-600">
                    {bronzePacks.length} packs
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {bronzePacks.map(pack => (
                    <PackCard key={pack.id} {...pack} onClick={() => setSelectedPackId(pack.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Activity Feed (Right - 1 col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LiveFeed />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-safari-green-dark border-t border-safari-gold/20 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <SlabSafariLogo showTagline={true} className="mb-4" />
              <p className="text-safari-tan/60 text-sm">
                Pokemon Mystery Pack marketplace with transparent odds and instant choice.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-safari-tan">Quick Links</h5>
              <ul className="space-y-2 text-sm text-safari-tan/60">
                <li><a href="#" className="hover:text-safari-gold transition-colors">Browse Packs</a></li>
                <li><a href="#" className="hover:text-safari-gold transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-safari-gold transition-colors">Pack Odds</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-safari-tan">Account</h5>
              <ul className="space-y-2 text-sm text-safari-tan/60">
                <li><Link href="/inventory" className="hover:text-safari-gold transition-colors">Digital Inventory</Link></li>
                <li><a href="#" className="hover:text-safari-gold transition-colors">Pack History</a></li>
                <li><a href="#" className="hover:text-safari-gold transition-colors">Settings</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-safari-tan">Support</h5>
              <ul className="space-y-2 text-sm text-safari-tan/60">
                <li><a href="#" className="hover:text-safari-gold transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-safari-gold transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-safari-gold transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-safari-gold/20 mt-8 pt-8 text-center text-sm text-safari-tan/60">
            © 2025 Slab Safari. Not affiliated with PSA, BGS, or Pokémon Company International.
          </div>
        </div>
      </footer>
    </div>
  );
}
