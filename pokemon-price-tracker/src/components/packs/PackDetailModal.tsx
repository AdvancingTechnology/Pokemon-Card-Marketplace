'use client';

import { useState, useEffect } from 'react';
import { X, Package, TrendingUp, Zap, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from '@/lib/supabase/client';
import { initiateCheckout } from '@/lib/stripe/client';
import { AuthModal } from '@/components/auth/AuthModal';

interface PackDetailModalProps {
  packId: string;
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: () => void;
}

interface PackCard {
  id: string;
  odds_percentage: number;
  cards: {
    id: string;
    name: string;
    set_name: string;
    rarity: string | null;
    image_url: string | null;
    market_price: number | null;
  };
}

interface PackData {
  id: string;
  name: string;
  description: string;
  tier: string;
  price: number;
  floor_value: number;
  ceiling_value: number;
  expected_value: number;
  total_cards: number;
  total_opened: number;
  is_featured: boolean;
  is_hot: boolean;
}

const tierBadges = {
  legendary: '🏆 LEGENDARY',
  gold: '💎 GOLD',
  bronze: '🥉 BRONZE',
  misc: '🥉 BRONZE',
};

export function PackDetailModal({ packId, isOpen, onClose, onPurchase }: PackDetailModalProps) {
  const [pack, setPack] = useState<PackData | null>(null);
  const [packCards, setPackCards] = useState<PackCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCards, setShowAllCards] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (!isOpen || !packId) return;

    const fetchPackDetails = async () => {
      setLoading(true);

      // Fetch pack details
      const { data: packData, error: packError } = await supabase
        .from('packs')
        .select('*')
        .eq('id', packId)
        .single();

      if (packData && !packError) {
        setPack(packData as PackData);
      }

      // Fetch pack cards with odds
      const { data: cardsData, error: cardsError } = await supabase
        .from('pack_cards')
        .select(`
          id,
          odds_percentage,
          cards (
            id,
            name,
            set_name,
            rarity,
            image_url,
            market_price
          )
        `)
        .eq('pack_id', packId)
        .order('odds_percentage', { ascending: false });

      if (cardsData && !cardsError) {
        setPackCards(cardsData as unknown as PackCard[]);
      }

      setLoading(false);
    };

    fetchPackDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, packId]);

  if (!isOpen) return null;

  const evRatio = pack ? ((pack.expected_value / pack.price) * 100).toFixed(0) : '0';
  const tierBadge = pack ? tierBadges[pack.tier as keyof typeof tierBadges] || '🥉 BRONZE' : '';

  // Show top 5 cards by default
  const displayedCards = showAllCards ? packCards : packCards.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-safari-green-dark to-safari-green rounded-2xl border-2 border-safari-gold/30 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-safari-tan" />
        </button>

        {loading ? (
          <div className="p-12 text-center">
            <Package className="h-16 w-16 text-safari-gold mx-auto mb-4 animate-pulse" />
            <p className="text-safari-tan">Loading pack details...</p>
          </div>
        ) : pack ? (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start gap-6 mb-8">
              {/* Pack Icon */}
              <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-black to-black rounded-xl flex items-center justify-center border-2 border-safari-gold/50 shadow-lg">
                <Package className="h-20 w-20 text-safari-gold" />
              </div>

              {/* Pack Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-safari-gold/20 text-safari-gold border-safari-gold">
                    {tierBadge}
                  </Badge>
                  {pack.is_hot && (
                    <Badge className="bg-safari-gold text-safari-green font-bold">
                      <Zap className="h-3 w-3 mr-1" />
                      HOT
                    </Badge>
                  )}
                </div>

                <h2 className="text-4xl font-bold text-safari-tan mb-2">{pack.name}</h2>
                <p className="text-safari-tan/70 text-lg mb-4">{pack.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-safari-tan/60">
                    <TrendingUp className="h-4 w-4" />
                    <span>{evRatio}% EV Ratio</span>
                  </div>
                  <div className="flex items-center gap-2 text-safari-tan/60">
                    <Package className="h-4 w-4" />
                    <span>{pack.total_opened.toLocaleString()} opened</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-sm text-safari-tan/60 mb-1">Price</div>
                <div className="text-5xl font-bold text-safari-gold mb-4">${pack.price}</div>
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="w-full bg-safari-gold hover:bg-safari-gold/90 text-black font-bold"
                    disabled={checkoutLoading}
                    onClick={async () => {
                      try {
                        setCheckoutLoading(true);
                        await initiateCheckout(packId);
                      } catch (error) {
                        console.error('Checkout failed:', error);
                        alert('Failed to start checkout. Please try again.');
                      } finally {
                        setCheckoutLoading(false);
                      }
                    }}
                  >
                    {checkoutLoading ? 'Loading...' : 'BUY & OPEN'}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full bg-safari-gold hover:bg-safari-gold/90 text-black font-bold"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in to Buy
                  </Button>
                )}
              </div>
            </div>

            {/* EV Breakdown */}
            <Card className="safari-card mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-safari-tan mb-4">Expected Value Breakdown</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-safari-tan/60 mb-2">↓ Floor Value</div>
                    <div className="text-3xl font-bold text-safari-tan">${pack.floor_value}</div>
                    <div className="text-xs text-safari-tan/50 mt-1">Worst case scenario</div>
                  </div>
                  <div className="text-center border-x border-safari-gold/20">
                    <div className="text-sm text-safari-gold mb-2">💰 Expected Value</div>
                    <div className="text-4xl font-bold text-safari-gold">${pack.expected_value}</div>
                    <div className="text-xs text-safari-tan/50 mt-1">Average pull value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-safari-tan/60 mb-2">↑ Ceiling Value</div>
                    <div className="text-3xl font-bold text-safari-tan">${pack.ceiling_value}</div>
                    <div className="text-xs text-safari-tan/50 mt-1">Best case scenario</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-black/20 rounded-lg border border-safari-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-safari-tan/70">Your investment:</span>
                    <span className="text-safari-tan font-semibold">${pack.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-safari-tan/70">Expected return:</span>
                    <span className="text-safari-gold font-bold text-lg">${pack.expected_value}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-safari-gold/10">
                    <span className="text-safari-tan font-semibold">EV Ratio:</span>
                    <span className={`font-bold text-lg ${Number(evRatio) >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {evRatio}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Odds */}
            <div>
              <h3 className="text-2xl font-bold text-safari-tan mb-4">Possible Pulls & Odds</h3>
              <p className="text-safari-tan/60 text-sm mb-6">
                Full transparency. Here are all the cards you can pull from this pack with exact odds.
              </p>

              <div className="space-y-3">
                {displayedCards.map((packCard, index) => (
                  <div
                    key={packCard.id}
                    className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-safari-gold/10 hover:border-safari-gold/30 transition-all"
                  >
                    {/* Rank */}
                    <div className="text-2xl font-bold text-safari-tan/40 w-8">
                      #{index + 1}
                    </div>

                    {/* Card Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-black/40 to-black/60 rounded flex items-center justify-center flex-shrink-0">
                      {packCard.cards.image_url ? (
                        <img
                          src={packCard.cards.image_url}
                          alt={packCard.cards.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-safari-gold text-xs">?</div>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="flex-1">
                      <div className="font-semibold text-safari-tan">{packCard.cards.name}</div>
                      <div className="text-sm text-safari-tan/60">
                        {packCard.cards.set_name}
                        {packCard.cards.rarity && ` • ${packCard.cards.rarity}`}
                      </div>
                    </div>

                    {/* Market Price */}
                    {packCard.cards.market_price && (
                      <div className="text-right mr-6">
                        <div className="text-xs text-safari-tan/60">Market</div>
                        <div className="text-lg font-bold text-safari-gold">
                          ${packCard.cards.market_price}
                        </div>
                      </div>
                    )}

                    {/* Odds */}
                    <div className="text-right min-w-[120px]">
                      <div className="text-xs text-safari-tan/60 mb-1">Pull Odds</div>
                      <Badge className="bg-safari-gold/20 text-safari-gold text-lg font-bold border-safari-gold/40 px-4 py-1">
                        {packCard.odds_percentage.toFixed(2)}%
                      </Badge>
                      <div className="text-xs text-safari-tan/50 mt-1">
                        1 in {Math.round(100 / packCard.odds_percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More/Less Button */}
              {packCards.length > 5 && (
                <button
                  onClick={() => setShowAllCards(!showAllCards)}
                  className="w-full mt-4 p-4 bg-black/20 rounded-lg border border-safari-gold/10 hover:border-safari-gold/30 transition-all flex items-center justify-center gap-2 text-safari-tan hover:text-safari-gold"
                >
                  {showAllCards ? (
                    <>
                      <ChevronUp className="h-5 w-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5" />
                      Show All {packCards.length} Cards
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Total Odds Check */}
            <div className="mt-6 p-4 bg-safari-gold/10 rounded-lg border border-safari-gold/20">
              <div className="flex items-center justify-between">
                <span className="text-safari-tan/70 text-sm">Total odds verification:</span>
                <span className="text-safari-gold font-bold">
                  {packCards.reduce((sum, pc) => sum + pc.odds_percentage, 0).toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-safari-tan/50 mt-2">
                All odds are independently verified and transparent. What you see is what you get.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-safari-tan">Pack not found</p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // After successful login, authentication state will update via the listener
        }}
      />
    </div>
  );
}
