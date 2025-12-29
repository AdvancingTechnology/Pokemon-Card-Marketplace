'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Package, Star } from 'lucide-react';

interface PackCardProps {
  id: string;
  name: string;
  description: string;
  tier: string;
  price: number;
  floorValue: number;
  ceilingValue: number;
  expectedValue: number;
  totalOpened?: number;
  isFeatured?: boolean;
  isHot?: boolean;
  imageUrl?: string;
  onClick?: () => void;
}

const tierColors = {
  legendary: 'pack-legendary',
  gold: 'pack-gold',
  bronze: 'pack-bronze',
  misc: 'pack-bronze',
};

const tierBadges = {
  legendary: '🏆 LEGENDARY',
  gold: '💎 GOLD',
  bronze: '🥉 BRONZE',
  misc: '🥉 BRONZE',
};

export function PackCard({
  name,
  description,
  tier,
  price,
  floorValue,
  ceilingValue,
  expectedValue,
  totalOpened = 0,
  isFeatured = false,
  isHot = false,
  imageUrl,
  onClick,
}: PackCardProps) {
  const tierClass = tierColors[tier as keyof typeof tierColors] || 'pack-bronze';
  const tierBadge = tierBadges[tier as keyof typeof tierBadges] || '🥉 BRONZE';

  // Calculate EV ratio
  const evRatio = ((expectedValue / price) * 100).toFixed(0);

  return (
    <Card
      className="safari-card safari-card-hover gold-shine cursor-pointer relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-safari-gold/30"
      onClick={onClick}
    >
      {/* Hot/Featured Badge */}
      {(isHot || isFeatured) && (
        <div className="absolute top-3 left-3 z-10">
          {isHot && (
            <Badge className="bg-safari-gold text-safari-green font-bold">
              <Zap className="h-3 w-3 mr-1" />
              HOT
            </Badge>
          )}
          {isFeatured && !isHot && (
            <Badge className="bg-safari-gold-light text-safari-green font-bold">
              <Star className="h-3 w-3 mr-1" />
              FEATURED
            </Badge>
          )}
        </div>
      )}

      {/* Glossy Pack Design - Matches Physical Pack Aesthetic */}
      <div className="relative h-64 bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-6 border-t border-b border-safari-gold/20">
        {/* Shine effect for glossy look */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

        {/* Safari Hat Logo */}
        <div className="relative z-10 mb-4">
          <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="65" rx="45" ry="8" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2"/>
            <path d="M 20 65 Q 20 25, 50 20 Q 80 25, 80 65 Z" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2"/>
            <path d="M 30 65 Q 30 35, 50 30 Q 70 35, 70 65 Z" fill="#1B3A2F" stroke="#1B3A2F" strokeWidth="2"/>
            <rect x="40" y="45" width="20" height="25" fill="#D7C7A3" stroke="#1B3A2F" strokeWidth="2" rx="1"/>
          </svg>
        </div>

        {/* SLAB SAFARI Text */}
        <div className="relative z-10 text-center">
          <div className="text-safari-tan font-bold text-2xl tracking-wider mb-1" style={{ fontFamily: 'system-ui, sans-serif' }}>
            SLAB SAFARI
          </div>
          <div className={`font-bold text-xl mb-1 ${tier === 'legendary' ? 'text-safari-gold' : tier === 'gold' ? 'text-yellow-500' : 'text-amber-600'}`}>
            {tier === 'legendary' ? 'LEGENDARY' : tier === 'gold' ? 'GOLD' : 'BRONZE'}
          </div>
          <div className="text-safari-tan/60 text-xs tracking-widest">
            POKEMON MYSTERY PACK
          </div>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-safari-tan text-xl">{name}</CardTitle>
        <CardDescription className="text-safari-tan/70 text-sm">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* EV Display - PurpleMana Style */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-black/30 rounded-lg border border-safari-gold/20">
          <div className="text-center">
            <div className="text-xs text-safari-tan/60 mb-1">↓ Floor</div>
            <div className="text-sm font-bold text-safari-tan">${floorValue}</div>
          </div>
          <div className="text-center border-x border-safari-gold/20">
            <div className="text-xs text-safari-gold mb-1">$ EV</div>
            <div className="text-lg font-bold text-safari-gold">${expectedValue}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-safari-tan/60 mb-1">↑ Ceiling</div>
            <div className="text-sm font-bold text-safari-tan">${ceilingValue}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-safari-tan/60">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{evRatio}% EV</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{totalOpened.toLocaleString()} opened</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-safari-gold/20">
          <div>
            <div className="text-xs text-safari-tan/60">Price</div>
            <div className="text-2xl font-bold text-safari-gold">${price}</div>
          </div>
          <Button size="lg" className="flex-1">
            RIP NOW
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
