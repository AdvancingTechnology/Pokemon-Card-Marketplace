'use client';

import { useState } from 'react';
import { Bell, Plus, Trash2, Mail, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
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

interface PriceAlert {
  id: number;
  cardName: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  email: string;
  enabled: boolean;
  createdDate: string;
  triggered?: boolean;
  image?: string;
}

export function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 1,
      cardName: "Charizard ex",
      condition: 'below',
      targetPrice: 220.00,
      currentPrice: 245.99,
      email: "user@example.com",
      enabled: true,
      createdDate: "2024-01-15",
      image: cardImages.charizard
    },
    {
      id: 2,
      cardName: "Umbreon VMAX",
      condition: 'above',
      targetPrice: 450.00,
      currentPrice: 425.00,
      email: "user@example.com",
      enabled: true,
      createdDate: "2024-02-20",
      image: cardImages.umbreon
    },
    {
      id: 3,
      cardName: "Pikachu VMAX",
      condition: 'below',
      targetPrice: 170.00,
      currentPrice: 189.99,
      email: "user@example.com",
      enabled: false,
      createdDate: "2024-03-10",
      triggered: true,
      image: cardImages.pikachu
    }
  ]);

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    cardName: '',
    condition: 'below' as 'above' | 'below',
    targetPrice: 0,
    email: ''
  });

  const [emailSettings, setEmailSettings] = useState({
    defaultEmail: 'user@example.com',
    frequency: 'instant',
    enabledGlobal: true
  });

  const addAlert = () => {
    if (newAlert.cardName && newAlert.targetPrice > 0 && newAlert.email) {
      const alert: PriceAlert = {
        id: Date.now(),
        cardName: newAlert.cardName,
        condition: newAlert.condition,
        targetPrice: newAlert.targetPrice,
        currentPrice: newAlert.targetPrice * (1 + (Math.random() - 0.5) * 0.3), // Simulate current price
        email: newAlert.email || emailSettings.defaultEmail,
        enabled: true,
        createdDate: new Date().toISOString().split('T')[0],
        image: cardImages.charizard // Default image
      };
      setAlerts([...alerts, alert]);
      setNewAlert({ cardName: '', condition: 'below', targetPrice: 0, email: '' });
      setShowAddAlert(false);
    }
  };

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  // Count active and triggered alerts
  const activeAlerts = alerts.filter(a => a.enabled && !a.triggered).length;
  const triggeredAlerts = alerts.filter(a => a.triggered).length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Triggered Today</p>
                <p className="text-2xl font-bold">{triggeredAlerts}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Email Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notification Settings</CardTitle>
          <CardDescription>Configure how you receive price alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Default Email</label>
              <Input
                type="email"
                value={emailSettings.defaultEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, defaultEmail: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notification Frequency</label>
              <Select value={emailSettings.frequency} onValueChange={(value) => setEmailSettings({ ...emailSettings, frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={emailSettings.enabledGlobal ? "default" : "outline"}
                onClick={() => setEmailSettings({ ...emailSettings, enabledGlobal: !emailSettings.enabledGlobal })}
                className="w-full"
              >
                {emailSettings.enabledGlobal ? (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Notifications Off
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Price Alerts</CardTitle>
              <CardDescription>Get notified when cards reach your target prices</CardDescription>
            </div>
            <Button onClick={() => setShowAddAlert(!showAddAlert)}>
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddAlert && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Card name"
                  value={newAlert.cardName}
                  onChange={(e) => setNewAlert({ ...newAlert, cardName: e.target.value })}
                />
                <Select value={newAlert.condition} onValueChange={(value: 'above' | 'below') => setNewAlert({ ...newAlert, condition: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below">Price drops below</SelectItem>
                    <SelectItem value="above">Price rises above</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Target price"
                  value={newAlert.targetPrice || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={newAlert.email}
                  onChange={(e) => setNewAlert({ ...newAlert, email: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addAlert}>Create Alert</Button>
                <Button variant="outline" onClick={() => setShowAddAlert(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {alerts.map((alert) => {
              const priceDistance = Math.abs(alert.currentPrice - alert.targetPrice);
              const priceDistancePercent = (priceDistance / alert.targetPrice) * 100;
              const isClose = priceDistancePercent < 5;

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.triggered ? 'bg-green-50 border-green-200' :
                    isClose ? 'bg-yellow-50 border-yellow-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {alert.image && (
                        <img src={alert.image} alt={alert.cardName} className="w-16 h-16 object-contain" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{alert.cardName}</h4>
                          {alert.triggered && (
                            <Badge className="bg-green-500">Triggered</Badge>
                          )}
                          {isClose && !alert.triggered && (
                            <Badge className="bg-yellow-500">Close to target</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Alert when price {alert.condition === 'below' ? 'drops below' : 'rises above'}{' '}
                          <span className="font-semibold">${alert.targetPrice.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Current price: <span className="font-medium">${alert.currentPrice.toFixed(2)}</span>
                          {' • '}
                          {alert.condition === 'below' ? (
                            <span className={alert.currentPrice < alert.targetPrice ? 'text-green-600' : 'text-gray-500'}>
                              {alert.currentPrice < alert.targetPrice ? (
                                <>
                                  <TrendingDown className="inline h-3 w-3" />
                                  {' '}Target reached!
                                </>
                              ) : (
                                `$${priceDistance.toFixed(2)} away`
                              )}
                            </span>
                          ) : (
                            <span className={alert.currentPrice > alert.targetPrice ? 'text-green-600' : 'text-gray-500'}>
                              {alert.currentPrice > alert.targetPrice ? (
                                <>
                                  <TrendingUp className="inline h-3 w-3" />
                                  {' '}Target reached!
                                </>
                              ) : (
                                `$${priceDistance.toFixed(2)} away`
                              )}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created {alert.createdDate} • {alert.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={alert.enabled ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => toggleAlert(alert.id)}
                      >
                        {alert.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No price alerts set</p>
              <p className="text-sm">Create alerts to get notified when cards reach your target prices</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Activity</CardTitle>
          <CardDescription>Your triggered alerts from the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { card: "Pikachu VMAX", type: "below", target: 170, actual: 168.99, date: "Today, 2:30 PM" },
              { card: "Lugia VSTAR", type: "below", target: 150, actual: 149.99, date: "Yesterday, 5:15 PM" },
              { card: "Mew VMAX", type: "above", target: 100, actual: 102.50, date: "3 days ago" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${activity.type === 'below' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {activity.type === 'below' ? (
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{activity.card}</div>
                    <div className="text-sm text-gray-600">
                      Price {activity.type === 'below' ? 'dropped to' : 'rose to'} ${activity.actual}
                      {' '}(target: ${activity.target})
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activity.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
