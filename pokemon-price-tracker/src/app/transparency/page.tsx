import { Metadata } from 'next';
import { PackOddsDisplay } from '@/components/transparency/PackOddsDisplay';
import { LiveStatistics } from '@/components/transparency/LiveStatistics';
import { ProvablyFairVerifier } from '@/components/transparency/ProvablyFairVerifier';
import { Shield, AlertTriangle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Transparency | Slab Safari',
  description: 'Full transparency on odds, payouts, and provably fair system',
};

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B3A2F] to-[#0f2319]">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-[#D4AF37]" />
            <h1 className="text-4xl font-bold text-[#D4AF37]">Transparency</h1>
          </div>
          <p className="text-[#D7C7A3] max-w-2xl mx-auto">
            At Slab Safari, we believe in complete transparency. View our odds, verify our RNG,
            and understand exactly how our system works.
          </p>
        </div>

        {/* Important Disclosure */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h2 className="font-bold text-amber-400">Important Disclosure</h2>
              <ul className="text-sm text-amber-200/80 space-y-1">
                <li>• <strong>Random Outcome:</strong> Pack contents are determined randomly using provably fair RNG.</li>
                <li>• <strong>Expected Value:</strong> On average, pack contents are worth less than the purchase price.</li>
                <li>• <strong>Not an Investment:</strong> Card values fluctuate. This is entertainment.</li>
                <li>• <strong>Age Requirement:</strong> You must be 18+ (21+ in some states).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <LiveStatistics />

        {/* Odds Display */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PackOddsDisplay packName="Safari Bronze Pack" packPrice={25} />
          <PackOddsDisplay packName="Safari Gold Pack" packPrice={100} />
        </div>

        {/* Provably Fair */}
        <ProvablyFairVerifier />

        {/* Gambling Help */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Phone className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h2 className="font-bold text-red-400">Gambling Problem?</h2>
              <p className="text-sm text-red-200/80">
                If you or someone you know has a gambling problem, help is available.
              </p>
              <p className="font-bold text-red-300">
                Call 1-800-522-4700 (National Problem Gambling Helpline)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center text-sm text-[#D7C7A3]/60 py-8 border-t border-[#D4AF37]/20">
          <p>
            Slab Safari is entertainment. Expected value is typically below purchase price.
            Must be 18+. Gambling Problem? Call 1-800-522-4700
          </p>
        </div>
      </div>
    </div>
  );
}
