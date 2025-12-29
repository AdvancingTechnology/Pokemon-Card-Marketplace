'use client';

import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PackFiltersProps {
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onTierFilter: (tier: string) => void;
  minGems?: number;
  maxGems?: number;
  onMinGemsChange?: (min: number) => void;
  onMaxGemsChange?: (max: number) => void;
}

export function PackFilters({
  onSearchChange,
  onSortChange,
  onTierFilter,
  minGems,
  maxGems,
  onMinGemsChange,
  onMaxGemsChange,
}: PackFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [tierFilter, setTierFilter] = useState('any');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setTierFilter('any');
    onSearchChange('');
    onSortChange('default');
    onTierFilter('any');
    if (onMinGemsChange) onMinGemsChange(0);
    if (onMaxGemsChange) onMaxGemsChange(999999);
  };

  return (
    <div className="bg-safari-green-dark/80 backdrop-blur-sm border border-safari-gold/20 rounded-lg p-4 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-safari-tan/60" />
          <Input
            type="text"
            placeholder="Search packs..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-safari-green border-safari-gold/30 text-safari-tan placeholder:text-safari-tan/40"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-safari-tan/60 hover:text-safari-tan"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Gem Range (Min) */}
        {onMinGemsChange && (
          <div className="flex items-center gap-2">
            <span className="text-safari-tan/60 text-sm">💎 Min</span>
            <Input
              type="number"
              placeholder="0"
              value={minGems || ''}
              onChange={(e) => onMinGemsChange(Number(e.target.value) || 0)}
              className="w-24 bg-safari-green border-safari-gold/30 text-safari-tan"
            />
          </div>
        )}

        {/* Separator */}
        {onMinGemsChange && onMaxGemsChange && (
          <span className="text-safari-tan/40">—</span>
        )}

        {/* Gem Range (Max) */}
        {onMaxGemsChange && (
          <div className="flex items-center gap-2">
            <span className="text-safari-tan/60 text-sm">💎 Max</span>
            <Input
              type="number"
              placeholder="999"
              value={maxGems === 999999 ? '' : maxGems}
              onChange={(e) => onMaxGemsChange(Number(e.target.value) || 999999)}
              className="w-24 bg-safari-green border-safari-gold/30 text-safari-tan"
            />
          </div>
        )}

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(value) => { setSortBy(value); onSortChange(value); }}>
          <SelectTrigger className="w-[180px] bg-safari-green border-safari-gold/30 text-safari-tan">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="bg-safari-green-dark border-safari-gold/30">
            <SelectItem value="default" className="text-safari-tan">Default</SelectItem>
            <SelectItem value="price-low" className="text-safari-tan">Price: Low to High</SelectItem>
            <SelectItem value="price-high" className="text-safari-tan">Price: High to Low</SelectItem>
            <SelectItem value="ev-high" className="text-safari-tan">Best EV Ratio</SelectItem>
            <SelectItem value="popular" className="text-safari-tan">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        {/* Tier Filter */}
        <Select value={tierFilter} onValueChange={(value) => { setTierFilter(value); onTierFilter(value); }}>
          <SelectTrigger className="w-[150px] bg-safari-green border-safari-gold/30 text-safari-tan">
            <SelectValue placeholder="Any Tier" />
          </SelectTrigger>
          <SelectContent className="bg-safari-green-dark border-safari-gold/30">
            <SelectItem value="any" className="text-safari-tan">Any Tier</SelectItem>
            <SelectItem value="legendary" className="text-safari-gold">🏆 Legendary</SelectItem>
            <SelectItem value="gold" className="text-yellow-500">💎 Gold</SelectItem>
            <SelectItem value="bronze" className="text-amber-600">🥉 Bronze</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="border-safari-gold/30 text-safari-tan hover:bg-safari-gold/10"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
