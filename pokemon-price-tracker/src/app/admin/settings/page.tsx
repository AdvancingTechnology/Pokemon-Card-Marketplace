'use client';

import { useState } from 'react';
import { Settings, Save, Bell, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-safari-gold">Settings</h1>
        <p className="text-safari-tan/60 mt-1">Configure your marketplace</p>
      </div>

      {/* Platform Settings */}
      <Card className="bg-safari-green border-safari-gold/20">
        <CardHeader>
          <CardTitle className="text-safari-gold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-safari-tan">Resell Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={70}
                min={1}
                max={100}
                className="w-24 bg-safari-green-dark border-safari-gold/30"
              />
              <span className="text-safari-tan/60">% of market value</span>
            </div>
            <p className="text-xs text-safari-tan/40">
              Users receive this percentage when reselling cards for gems
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-safari-tan">Gems to USD Rate</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={100}
                className="w-24 bg-safari-green-dark border-safari-gold/30"
              />
              <span className="text-safari-tan/60">gems = $1</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-safari-green border-safari-gold/20">
        <CardHeader>
          <CardTitle className="text-safari-gold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-safari-gold/30"
            />
            <div>
              <span className="text-safari-tan">Email on new redemption</span>
              <p className="text-xs text-safari-tan/40">Get notified when users request card redemptions</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-safari-gold/30"
            />
            <div>
              <span className="text-safari-tan">Email on large purchase</span>
              <p className="text-xs text-safari-tan/40">Get notified for gem purchases over $50</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Admin Access */}
      <Card className="bg-safari-green border-safari-gold/20">
        <CardHeader>
          <CardTitle className="text-safari-gold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-safari-tan">Admin Emails</Label>
            <Input
              defaultValue="testuser@slabsafari.com, admin@slabsafari.com"
              className="bg-safari-green-dark border-safari-gold/30"
            />
            <p className="text-xs text-safari-tan/40">
              Comma-separated list of emails with admin access
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" />
        {saved ? 'Saved!' : 'Save Settings'}
      </Button>
    </div>
  );
}
