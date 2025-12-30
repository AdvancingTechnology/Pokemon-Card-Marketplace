'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CreditCard, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

interface CardItem {
  id: string;
  name: string;
  set_name: string;
  rarity: string | null;
  image_url: string | null;
  market_price: number | null;
  created_at: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('name', { ascending: true })
      .limit(100);

    if (data && !error) {
      setCards(data);
    }
    setLoading(false);
  }

  async function deleteCard(id: string) {
    if (!confirm('Are you sure you want to delete this card?')) return;

    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (!error) {
      setCards(cards.filter((c) => c.id !== id));
    }
  }

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.set_name.toLowerCase().includes(search.toLowerCase())
  );

  const rarityColors: Record<string, string> = {
    common: 'bg-gray-500/20 text-gray-400',
    uncommon: 'bg-green-500/20 text-green-400',
    rare: 'bg-blue-500/20 text-blue-400',
    'ultra rare': 'bg-purple-500/20 text-purple-400',
    secret: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-safari-gold">Cards</h1>
          <p className="text-safari-tan/60 mt-1">Manage your card catalog</p>
        </div>
        <Link href="/admin/cards/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-safari-tan/40" />
        <Input
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-safari-green border-safari-gold/30"
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-safari-gold mx-auto animate-pulse mb-4" />
          <p className="text-safari-tan/60">Loading cards...</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <Card className="bg-safari-green border-safari-gold/20">
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-safari-gold/40 mx-auto mb-4" />
            <p className="text-safari-tan/60 mb-4">
              {search ? 'No cards match your search' : 'No cards in catalog yet'}
            </p>
            {!search && (
              <Link href="/admin/cards/new">
                <Button>Add Your First Card</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="bg-safari-green border-safari-gold/20 overflow-hidden">
              <div className="aspect-[3/4] bg-safari-green-dark flex items-center justify-center p-4">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <CreditCard className="h-16 w-16 text-safari-gold/30" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-safari-tan truncate">{card.name}</h3>
                <p className="text-sm text-safari-tan/60 truncate">{card.set_name}</p>
                <div className="flex items-center justify-between mt-3">
                  {card.rarity && (
                    <Badge className={rarityColors[card.rarity.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}>
                      {card.rarity}
                    </Badge>
                  )}
                  {card.market_price && (
                    <span className="text-safari-gold font-bold">${card.market_price}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/cards/${card.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-safari-gold/30">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 hover:bg-red-500/10"
                    onClick={() => deleteCard(card.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
