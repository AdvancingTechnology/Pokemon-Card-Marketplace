'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Shield, RefreshCw } from 'lucide-react';

export function ProvablyFairVerifier() {
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState('');
  const [expectedRoll, setExpectedRoll] = useState('');
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);
  const [calculatedRoll, setCalculatedRoll] = useState<number | null>(null);

  async function handleVerify() {
    if (!serverSeed || !clientSeed || !nonce) return;

    // Client-side verification using Web Crypto API
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const roll = parseInt(hashHex.substring(0, 8), 16) % 100000;
    setCalculatedRoll(roll);

    if (expectedRoll) {
      setResult(roll === parseInt(expectedRoll) ? 'valid' : 'invalid');
    }
  }

  function handleClear() {
    setServerSeed('');
    setClientSeed('');
    setNonce('');
    setExpectedRoll('');
    setResult(null);
    setCalculatedRoll(null);
  }

  return (
    <Card className="bg-[#1B3A2F]/80 border-[#D4AF37]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#D4AF37]">
          <Shield className="h-5 w-5" />
          Provably Fair Verifier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#D7C7A3]">
          Verify any pull by entering the seeds. Server seeds are revealed when you rotate to new seeds.
        </p>

        <div className="grid gap-4">
          <div>
            <Label className="text-[#D7C7A3]">Server Seed</Label>
            <Input
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              placeholder="Enter revealed server seed"
              className="bg-black/20 border-[#D4AF37]/30"
            />
          </div>
          <div>
            <Label className="text-[#D7C7A3]">Client Seed</Label>
            <Input
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              placeholder="Your client seed"
              className="bg-black/20 border-[#D4AF37]/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#D7C7A3]">Nonce</Label>
              <Input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                placeholder="0"
                className="bg-black/20 border-[#D4AF37]/30"
              />
            </div>
            <div>
              <Label className="text-[#D7C7A3]">Expected Roll (optional)</Label>
              <Input
                type="number"
                value={expectedRoll}
                onChange={(e) => setExpectedRoll(e.target.value)}
                placeholder="0-99999"
                className="bg-black/20 border-[#D4AF37]/30"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleVerify} className="flex-1 bg-[#D4AF37] text-[#1B3A2F] hover:bg-[#D4AF37]/80">
            Verify Roll
          </Button>
          <Button onClick={handleClear} variant="outline" className="border-[#D4AF37]/30">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {calculatedRoll !== null && (
          <div className={`p-4 rounded-lg ${result === 'valid' ? 'bg-green-500/10 border border-green-500/30' : result === 'invalid' ? 'bg-red-500/10 border border-red-500/30' : 'bg-purple-500/10 border border-purple-500/30'}`}>
            <div className="flex items-center gap-2">
              {result === 'valid' ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : result === 'invalid' ? (
                <X className="h-5 w-5 text-red-400" />
              ) : (
                <Shield className="h-5 w-5 text-purple-400" />
              )}
              <span className={result === 'valid' ? 'text-green-400' : result === 'invalid' ? 'text-red-400' : 'text-purple-400'}>
                Calculated Roll: {calculatedRoll}
              </span>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="pt-4 border-t border-[#D4AF37]/20">
          <h4 className="font-semibold text-[#D7C7A3] mb-2">How Provably Fair Works</h4>
          <ol className="text-sm text-[#D7C7A3]/80 space-y-1 list-decimal list-inside">
            <li>Before you open packs, you see a hash of the server seed</li>
            <li>Combined = server_seed + client_seed + nonce</li>
            <li>Roll = SHA-256(combined) first 8 chars → mod 100000</li>
            <li>After rotating, server seed is revealed for verification</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
