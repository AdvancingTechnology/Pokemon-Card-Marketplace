import { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, ArrowRight, Truck, Package, Gem, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGems } from '@/hooks/useGems';
import { toast } from "@/components/ui/use-toast";

interface PackOpeningModalProps {
  packId: string;
  packName: string;
  packTier: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PulledCard {
  id: string;
  name: string;
  set_name: string;
  rarity: string | null;
  image_url: string | null;
  market_price: number | null;
}

export function PackOpeningModal({ packId, packName, packTier, isOpen, onClose }: PackOpeningModalProps) {
  const [stage, setStage] = useState<'idle' | 'opening' | 'revealing' | 'revealed' | 'decision' | 'confirmed'>('idle');
  const [pulledCard, setPulledCard] = useState<PulledCard | null>(null);
  const [packOpenId, setPackOpenId] = useState<string | null>(null);
  const [decision, setDecision] = useState<'redeem' | 'resell' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { gemBalance, addTransaction } = useGems();
  const supabase = createClient();

  // Calculate resell value (70% of market price)
  const resellValue = pulledCard?.market_price ? Math.round(pulledCard.market_price * 0.7 * 100) / 100 : 0;

  useEffect(() => {
    if (isOpen) {
      setStage('idle');
      setPulledCard(null);
      setPackOpenId(null);
      setDecision(null);
      setError(null);
    }
  }, [isOpen]);

  const handleOpenPack = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to open packs');
      return;
    }

    setError(null);
    setLoading(true);
    setStage('opening');

    try {
      // Simulate pack opening delay (build tension!)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Fetch pack cards with odds
      const { data: packCards, error: packCardsError } = await supabase
        .from('pack_cards')
        .select(`
          id,
          weight,
          cards (
            id,
            name,
            set_name,
            rarity,
            image_url,
            market_price
          )
        `)
        .eq('pack_id', packId);

      if (packCardsError || !packCards || packCards.length === 0) {
        setError('Failed to open pack. Please try again.');
        setStage('idle');
        setLoading(false);
        return;
      }

      // Weighted random selection
      const totalWeight = packCards.reduce((sum, pc) => sum + ((pc.weight as number) || 1), 0);
      let random = Math.random() * totalWeight;
      let selectedCard: PulledCard | null = null;

      for (const packCard of packCards) {
        random -= (packCard.weight as number) || 1;
        if (random <= 0) {
          // Supabase returns cards as object for single relations
          const card = packCard.cards as unknown as PulledCard;
          selectedCard = card;
          break;
        }
      }

      if (!selectedCard) {
        const card = packCards[0].cards as unknown as PulledCard;
        selectedCard = card; // Fallback
      }

      // Save pack open to database
      if (user) {
        const { data: packOpenData, error: insertError } = await supabase
          .from('pack_opens')
          .insert({
            user_id: user.id,
            pack_id: packId,
            card_id: selectedCard.id,
            redemption_status: 'in_inventory',
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to save pack open:', insertError);
        } else {
          setPackOpenId(packOpenData.id);
        }
      }

      // Reveal animation
      setStage('revealing');
      await new Promise(resolve => setTimeout(resolve, 800));

      setPulledCard(selectedCard);
      setStage('revealed');
      setLoading(false);

    } catch (err) {
      console.error('Pack opening error:', err);
      setError('Something went wrong. Please try again.');
      setStage('idle');
      setLoading(false);
    }
  };

  const handleMakeDecision = () => {
    setStage('decision');
  };

  const handleConfirmDecision = async () => {
    if (!decision || !pulledCard || !packOpenId || !user) {
      setError('Please select an option');
      return;
    }

    setLoading(true);

    try {
      if (decision === 'redeem') {
        // Update pack open status
        await supabase
          .from('pack_opens')
          .update({ redemption_status: 'pending_redemption' })
          .eq('id', packOpenId);

        toast({
          title: "Redemption Requested",
          description: `Your ${pulledCard.name} will be prepared for shipping.`,
        });
      } else if (decision === 'resell') {
        // Update pack open status and record gems earned
        await supabase
          .from('pack_opens')
          .update({
            redemption_status: 'resold',
            resell_gems_earned: resellValue
          })
          .eq('id', packOpenId);

        // Add gem transaction
        await addTransaction(
          resellValue,
          'earned_resell',
          `Resold ${pulledCard.name} from ${packName} pack`,
          {
            card_id: pulledCard.id,
            pack_id: packId
          }
        );

        toast({
          title: "Card Resold for Gems",
          description: `Added ${resellValue} Gems to your balance!`,
        });
      }

      setStage('confirmed');
    } catch (err: unknown) {
      console.error('Decision error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to process your decision: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStage('idle');
    setPulledCard(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const tierColors: Record<string, string> = {
    legendary: 'from-yellow-500 via-amber-500 to-orange-500',
    gold: 'from-safari-gold via-yellow-500 to-amber-600',
    bronze: 'from-amber-700 via-amber-800 to-amber-900',
  };

  const tierColor = tierColors[packTier] || tierColors.bronze;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
      {/* Particle Effects */}
      {(stage === 'revealing' || stage === 'revealed' || stage === 'decision') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-safari-gold rounded-full animate-float opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
      >
        <X className="h-6 w-6 text-safari-tan" />
      </button>

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Idle / Opening State */}
        {(stage === 'idle' || stage === 'opening') && (
          <Card className={`safari-card border-4 ${stage === 'opening' ? 'animate-pulse' : ''}`}>
            <CardContent className="p-12 text-center">
              {/* Pack Icon */}
              <div className={`w-48 h-48 mx-auto mb-8 rounded-2xl bg-gradient-to-br ${tierColor} flex items-center justify-center transform transition-transform ${stage === 'opening' ? 'scale-110 rotate-12' : ''}`}>
                <div className="text-8xl animate-bounce">📦</div>
              </div>

              {/* Pack Info */}
              <h2 className="text-4xl font-bold text-safari-tan mb-2">{packName}</h2>
              <p className="text-safari-tan/70 mb-8">
                {stage === 'opening' ? 'Opening your pack...' : 'Ready to rip?'}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              {stage === 'idle' && (
                <Button
                  size="lg"
                  className="text-2xl h-16 px-12"
                  onClick={handleOpenPack}
                  disabled={!isAuthenticated || loading}
                >
                  <Sparkles className="h-6 w-6 mr-2" />
                  RIP IT OPEN
                </Button>
              )}

              {stage === 'opening' && (
                <div className="flex items-center justify-center gap-2 text-safari-gold text-lg">
                  <div className="w-3 h-3 bg-safari-gold rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-safari-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-safari-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Revealing / Revealed State */}
        {(stage === 'revealing' || stage === 'revealed') && pulledCard && (
          <div className="relative">
            {/* Card Reveal */}
            <div
              className={`transform transition-all duration-1000 ${
                stage === 'revealing'
                  ? 'scale-50 opacity-0 rotate-180'
                  : 'scale-100 opacity-100 rotate-0'
              }`}
            >
              <Card className="safari-card border-4 border-safari-gold shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Card Image */}
                  <div className="relative h-96 bg-gradient-to-br from-black/40 to-black/60 flex items-center justify-center p-8">
                    {pulledCard.image_url ? (
                      <img
                        src={pulledCard.image_url}
                        alt={pulledCard.name}
                        className="max-h-full max-w-full object-contain drop-shadow-2xl"
                      />
                    ) : (
                      <div className="text-safari-gold text-9xl">?</div>
                    )}

                    {/* Rarity Badge */}
                    {pulledCard.rarity && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-safari-gold/90 text-safari-green text-lg px-4 py-2 font-bold">
                          {pulledCard.rarity}
                        </Badge>
                      </div>
                    )}

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-pack-shine opacity-50 pointer-events-none"></div>
                  </div>

                  {/* Card Info */}
                  <div className="p-8 bg-gradient-to-br from-safari-green-dark to-safari-green text-center">
                    <h3 className="text-3xl font-bold text-safari-tan mb-2">{pulledCard.name}</h3>
                    <p className="text-safari-tan/70 mb-6">{pulledCard.set_name}</p>

                    {pulledCard.market_price && (
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="text-sm text-safari-tan/60">Market Value</div>
                        <div className="text-4xl font-bold text-safari-gold">
                          ${pulledCard.market_price}
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleClose}
                        size="lg"
                        variant="outline"
                        className="px-6"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={handleMakeDecision}
                        size="lg"
                        className="px-6"
                      >
                        <ChevronRight className="h-5 w-5 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Confetti burst on reveal */}
            {stage === 'revealed' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full opacity-0 animate-ping"
                    style={{
                      backgroundColor: ['#D4AF37', '#E5C158', '#B8952B', '#D7C7A3'][i % 4],
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${Math.cos(i * 0.126) * 200}px, ${Math.sin(i * 0.126) * 200}px)`,
                      animationDelay: `${i * 0.02}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Decision State - Redeem or Resell */}
        {stage === 'decision' && pulledCard && (
          <Card className="safari-card border-4 border-safari-gold shadow-2xl overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold text-safari-tan text-center mb-6">What would you like to do?</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {/* Redeem Option */}
                <div
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    decision === 'redeem'
                      ? 'bg-safari-green border-2 border-safari-gold shadow-lg'
                      : 'bg-safari-green-dark/80 hover:bg-safari-green-dark border border-safari-gold/30'
                  }`}
                  onClick={() => setDecision('redeem')}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-safari-green-light/20 flex items-center justify-center">
                      <Truck className="h-8 w-8 text-safari-gold" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-safari-tan text-center mb-2">Redeem Card</h3>
                  <p className="text-safari-tan/70 text-center text-sm mb-4">
                    Ship this physical graded card to your address.
                  </p>
                  <div className="text-center text-safari-gold font-bold">
                    FREE SHIPPING
                  </div>
                </div>

                {/* Resell Option */}
                <div
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    decision === 'resell'
                      ? 'bg-safari-green border-2 border-safari-gold shadow-lg'
                      : 'bg-safari-green-dark/80 hover:bg-safari-green-dark border border-safari-gold/30'
                  }`}
                  onClick={() => setDecision('resell')}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-safari-green-light/20 flex items-center justify-center">
                      <Gem className="h-8 w-8 text-safari-gold" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-safari-tan text-center mb-2">Resell for Gems</h3>
                  <p className="text-safari-tan/70 text-center text-sm mb-4">
                    Get Gems instantly to buy more packs.
                  </p>
                  <div className="text-center text-safari-gold font-bold">
                    {pulledCard.market_price ? `${resellValue} GEMS` : 'N/A'}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  className="w-32"
                  onClick={() => setStage('revealed')}
                >
                  Back
                </Button>
                <Button
                  className="w-32"
                  disabled={!decision || loading}
                  onClick={handleConfirmDecision}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation State */}
        {stage === 'confirmed' && pulledCard && (
          <Card className="safari-card border-4 border-safari-gold shadow-2xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                {decision === 'redeem' ? (
                  <Truck className="h-16 w-16 text-safari-gold" />
                ) : (
                  <Gem className="h-16 w-16 text-safari-gold" />
                )}
              </div>

              <h2 className="text-3xl font-bold text-safari-tan mb-4">
                {decision === 'redeem'
                  ? 'Redemption Confirmed!'
                  : 'Gems Added to Your Balance!'}
              </h2>

              <p className="text-safari-tan/70 mb-8">
                {decision === 'redeem'
                  ? `Your ${pulledCard.name} will be prepared for shipping. Check your email for updates.`
                  : `You've received ${resellValue} Gems for reselling ${pulledCard.name}.`}
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  className="w-40"
                  onClick={handleClose}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Done
                </Button>
                <Button
                  className="w-40"
                  onClick={handleOpenPack}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Open Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
