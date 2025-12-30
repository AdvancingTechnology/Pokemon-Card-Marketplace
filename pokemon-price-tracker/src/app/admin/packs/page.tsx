'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface Pack {
  id: string;
  name: string;
  description: string;
  tier: string;
  price: number;
  gem_cost: number | null;
  floor_value: number;
  ceiling_value: number;
  expected_value: number;
  total_cards: number;
  total_opened: number;
  is_featured: boolean;
  is_hot: boolean;
  created_at: string;
}

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPacks();
  }, []);

  async function fetchPacks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setPacks(data);
    }
    setLoading(false);
  }

  async function deletePack(id: string) {
    if (!confirm('Are you sure you want to delete this pack?')) return;

    const { error } = await supabase.from('packs').delete().eq('id', id);
    if (!error) {
      setPacks(packs.filter((p) => p.id !== id));
    }
  }

  const tierColors: Record<string, string> = {
    legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    bronze: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    misc: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-safari-gold">Packs</h1>
          <p className="text-safari-tan/60 mt-1">Manage your mystery pack offerings</p>
        </div>
        <Link href="/admin/packs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Pack
          </Button>
        </Link>
      </div>

      {/* Packs List */}
      {loading ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-safari-gold mx-auto animate-pulse mb-4" />
          <p className="text-safari-tan/60">Loading packs...</p>
        </div>
      ) : packs.length === 0 ? (
        <Card className="bg-safari-green border-safari-gold/20">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-safari-gold/40 mx-auto mb-4" />
            <p className="text-safari-tan/60 mb-4">No packs created yet</p>
            <Link href="/admin/packs/new">
              <Button>Create Your First Pack</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {packs.map((pack) => (
            <Card key={pack.id} className="bg-safari-green border-safari-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Pack Icon */}
                  <div className="w-16 h-16 bg-safari-green-dark rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-safari-gold" />
                  </div>

                  {/* Pack Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-safari-tan truncate">
                        {pack.name}
                      </h3>
                      <Badge className={tierColors[pack.tier] || tierColors.misc}>
                        {pack.tier.toUpperCase()}
                      </Badge>
                      {pack.is_featured && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          FEATURED
                        </Badge>
                      )}
                      {pack.is_hot && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          HOT
                        </Badge>
                      )}
                    </div>
                    <p className="text-safari-tan/60 text-sm truncate mb-2">
                      {pack.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-safari-tan/60">
                      <span>Price: <strong className="text-safari-gold">${pack.price}</strong></span>
                      <span>Gems: <strong className="text-purple-400">{pack.gem_cost || '-'}</strong></span>
                      <span>EV: <strong className="text-green-400">${pack.expected_value}</strong></span>
                      <span>Opened: <strong>{pack.total_opened}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/packs/${pack.id}`}>
                      <Button variant="outline" size="icon" className="border-safari-gold/30">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/packs/${pack.id}/edit`}>
                      <Button variant="outline" size="icon" className="border-safari-gold/30">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-500/30 hover:bg-red-500/10"
                      onClick={() => deletePack(pack.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
