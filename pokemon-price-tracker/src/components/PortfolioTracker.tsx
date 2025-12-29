'use client';

import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Package, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cardImages } from '@/lib/card-images';

interface PortfolioCard {
  id: number;
  name: string;
  set: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  image: string;
  dateAdded: string;
}

export function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState<PortfolioCard[]>([
    {
      id: 1,
      name: "Charizard ex",
      set: "Obsidian Flames",
      quantity: 2,
      purchasePrice: 220.00,
      currentPrice: 245.99,
      image: cardImages.charizard,
      dateAdded: "2024-01-15"
    },
    {
      id: 2,
      name: "Pikachu VMAX",
      set: "Vivid Voltage",
      quantity: 1,
      purchasePrice: 195.00,
      currentPrice: 189.99,
      image: cardImages.pikachu,
      dateAdded: "2024-02-20"
    },
    {
      id: 3,
      name: "Umbreon VMAX",
      set: "Evolving Skies",
      quantity: 1,
      purchasePrice: 380.00,
      currentPrice: 425.00,
      image: cardImages.umbreon,
      dateAdded: "2024-03-10"
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    set: '',
    quantity: 1,
    purchasePrice: 0
  });

  // Calculate portfolio statistics
  const totalInvested = portfolio.reduce((sum, card) => sum + (card.purchasePrice * card.quantity), 0);
  const currentValue = portfolio.reduce((sum, card) => sum + (card.currentPrice * card.quantity), 0);
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100) : 0;
  const totalCards = portfolio.reduce((sum, card) => sum + card.quantity, 0);

  const addCard = () => {
    if (newCard.name && newCard.purchasePrice > 0) {
      const card: PortfolioCard = {
        id: Date.now(),
        name: newCard.name,
        set: newCard.set,
        quantity: newCard.quantity,
        purchasePrice: newCard.purchasePrice,
        currentPrice: newCard.purchasePrice * (1 + (Math.random() - 0.5) * 0.3), // Simulate current price
        image: cardImages.charizard, // Default image
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setPortfolio([...portfolio, card]);
      setNewCard({ name: '', set: '', quantity: 1, purchasePrice: 0 });
      setShowAddCard(false);
    }
  };

  const removeCard = (id: number) => {
    setPortfolio(portfolio.filter(card => card.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity > 0) {
      setPortfolio(portfolio.map(card =>
        card.id === id ? { ...card, quantity } : card
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">${currentValue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''} ${Math.abs(totalGainLoss).toFixed(2)}
                </p>
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cards</p>
                <p className="text-2xl font-bold">{totalCards}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Return</p>
                <p className="text-2xl font-bold">
                  {totalGainLossPercent.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Collection</CardTitle>
              <CardDescription>Track your Pokémon card investments</CardDescription>
            </div>
            <Button onClick={() => setShowAddCard(!showAddCard)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddCard && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Card name"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                />
                <Input
                  placeholder="Set name"
                  value={newCard.set}
                  onChange={(e) => setNewCard({ ...newCard, set: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newCard.quantity}
                  onChange={(e) => setNewCard({ ...newCard, quantity: parseInt(e.target.value) || 1 })}
                />
                <Input
                  type="number"
                  placeholder="Purchase price"
                  value={newCard.purchasePrice || ''}
                  onChange={(e) => setNewCard({ ...newCard, purchasePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCard}>Add to Portfolio</Button>
                <Button variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Portfolio Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Card</th>
                  <th className="text-left p-2">Set</th>
                  <th className="text-center p-2">Qty</th>
                  <th className="text-right p-2">Purchase Price</th>
                  <th className="text-right p-2">Current Price</th>
                  <th className="text-right p-2">Total Value</th>
                  <th className="text-right p-2">Gain/Loss</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((card) => {
                  const totalPurchase = card.purchasePrice * card.quantity;
                  const totalCurrent = card.currentPrice * card.quantity;
                  const gainLoss = totalCurrent - totalPurchase;
                  const gainLossPercent = (gainLoss / totalPurchase) * 100;

                  return (
                    <tr key={card.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <img src={card.image} alt={card.name} className="w-12 h-12 object-contain" />
                          <span className="font-medium">{card.name}</span>
                        </div>
                      </td>
                      <td className="p-2 text-gray-600">{card.set}</td>
                      <td className="p-2 text-center">
                        <Input
                          type="number"
                          value={card.quantity}
                          onChange={(e) => updateQuantity(card.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                      </td>
                      <td className="p-2 text-right">${card.purchasePrice.toFixed(2)}</td>
                      <td className="p-2 text-right">${card.currentPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-semibold">${totalCurrent.toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <div className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <div>{gainLoss >= 0 ? '+' : ''} ${Math.abs(gainLoss).toFixed(2)}</div>
                          <div className="text-xs">
                            {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {portfolio.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No cards in your portfolio yet</p>
              <p className="text-sm">Add cards to start tracking your collection value</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Chart */}
      {portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Your collection value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Portfolio chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
