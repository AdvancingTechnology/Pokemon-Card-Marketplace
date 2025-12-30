'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function NewPackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tier: 'bronze',
    price: 25,
    gem_cost: 2500,
    floor_value: 5,
    ceiling_value: 100,
    expected_value: 21,
    is_featured: false,
    is_hot: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('packs')
      .insert({
        ...formData,
        total_cards: 0,
        total_opened: 0,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/admin/packs/${data.id}`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/packs">
          <Button variant="outline" size="icon" className="border-safari-gold/30">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-safari-gold">Create Pack</h1>
          <p className="text-safari-tan/60 mt-1">Add a new mystery pack to your marketplace</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-safari-green border-safari-gold/20">
          <CardHeader>
            <CardTitle className="text-safari-gold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pack Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-safari-tan">Pack Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bronze Mystery Pack"
                required
                className="bg-safari-green-dark border-safari-gold/30"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-safari-tan">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of this pack"
                className="bg-safari-green-dark border-safari-gold/30"
              />
            </div>

            {/* Tier */}
            <div className="space-y-2">
              <Label htmlFor="tier" className="text-safari-tan">Tier</Label>
              <select
                id="tier"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full p-3 rounded-md bg-safari-green-dark border border-safari-gold/30 text-safari-tan"
              >
                <option value="bronze">Bronze ($25)</option>
                <option value="gold">Gold ($100)</option>
                <option value="legendary">Legendary ($500+)</option>
                <option value="misc">Misc</option>
              </select>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-safari-tan">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                  className="bg-safari-green-dark border-safari-gold/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gem_cost" className="text-safari-tan">Gem Cost</Label>
                <Input
                  id="gem_cost"
                  type="number"
                  min="0"
                  value={formData.gem_cost}
                  onChange={(e) => setFormData({ ...formData, gem_cost: parseInt(e.target.value) || 0 })}
                  className="bg-safari-green-dark border-safari-gold/30"
                />
              </div>
            </div>

            {/* Value Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor_value" className="text-safari-tan">Floor Value ($)</Label>
                <Input
                  id="floor_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.floor_value}
                  onChange={(e) => setFormData({ ...formData, floor_value: parseFloat(e.target.value) || 0 })}
                  required
                  className="bg-safari-green-dark border-safari-gold/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_value" className="text-safari-tan">Expected Value ($)</Label>
                <Input
                  id="expected_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.expected_value}
                  onChange={(e) => setFormData({ ...formData, expected_value: parseFloat(e.target.value) || 0 })}
                  required
                  className="bg-safari-green-dark border-safari-gold/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceiling_value" className="text-safari-tan">Ceiling Value ($)</Label>
                <Input
                  id="ceiling_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ceiling_value}
                  onChange={(e) => setFormData({ ...formData, ceiling_value: parseFloat(e.target.value) || 0 })}
                  required
                  className="bg-safari-green-dark border-safari-gold/30"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-safari-gold/30"
                />
                <span className="text-safari-tan">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_hot}
                  onChange={(e) => setFormData({ ...formData, is_hot: e.target.checked })}
                  className="w-4 h-4 rounded border-safari-gold/30"
                />
                <span className="text-safari-tan">Hot</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Link href="/admin/packs" className="flex-1">
                <Button variant="outline" className="w-full border-safari-gold/30">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                <Save className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Pack'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
