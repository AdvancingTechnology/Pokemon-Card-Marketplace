'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Gem,
  Package,
  CreditCard,
  Bell,
  Mail,
  Settings,
  Activity,
  TrendingUp,
  Calendar,
  Star,
  AlertCircle,
  User,
} from 'lucide-react';

interface UserStats {
  total_packs_opened: number;
  cards_collected: number;
  gems_earned: number;
  gems_spent: number;
  rarest_card: string | null;
}

interface ActivityItem {
  id: string;
  type: 'pack_opened' | 'card_collected' | 'gems_purchased' | 'gems_earned';
  description: string;
  timestamp: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    full_name: string | null;
    gem_balance: number;
    created_at: string;
  } | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          gem_balance: profileData.gem_balance || 0,
          created_at: profileData.created_at,
        });
        setEmail(profileData.email || user.email || '');
      } else {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: null,
          gem_balance: 100,
          created_at: new Date().toISOString(),
        });
        setEmail(user.email || '');
      }

      // Fetch pack opens count
      const { count: packsOpened } = await supabase
        .from('pack_opens')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch gem transactions
      const { data: gemTx } = await supabase
        .from('gem_transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id);

      const gemsEarned =
        gemTx
          ?.filter((tx) => tx.transaction_type.startsWith('earned'))
          .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      setStats({
        total_packs_opened: packsOpened || 0,
        cards_collected: packsOpened || 0,
        gems_earned: gemsEarned,
        gems_spent: 0,
        rarest_card: null,
      });

      // Mock activities for now
      setActivities([
        {
          id: '1',
          type: 'gems_earned',
          description: 'Welcome bonus! You received 100 gems',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router, fetchProfile]);

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'U';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'pack_opened':
        return <Package className="h-4 w-4 text-safari-gold" />;
      case 'card_collected':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'gems_purchased':
        return <Gem className="h-4 w-4 text-purple-500" />;
      case 'gems_earned':
        return <TrendingUp className="h-4 w-4 text-safari-gold" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          <Card className="border-safari-gold/20 bg-safari-tan/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-safari-gold/20">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchProfile} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-safari-gold/20 bg-gradient-to-br from-safari-tan/10 to-safari-gold/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="h-24 w-24 rounded-full bg-safari-gold/20 border-4 border-safari-gold/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-safari-gold">
                  {getUserInitials()}
                </span>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile?.full_name || 'Safari Explorer'}
                </h1>
                <p className="text-muted-foreground">{profile?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="border-safari-gold/50 text-safari-gold"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined{' '}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          'en-US',
                          { month: 'short', year: 'numeric' }
                        )
                      : 'Recently'}
                  </Badge>
                </div>
              </div>

              {/* Gem Balance */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-safari-gold/10 border border-safari-gold/30">
                <div className="flex items-center gap-2">
                  <Gem className="h-6 w-6 text-safari-gold" />
                  <span className="text-3xl font-bold text-safari-gold">
                    {profile?.gem_balance?.toLocaleString() || 0}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Gem Balance
                </span>
                <Button
                  size="sm"
                  className="mt-2 bg-safari-gold hover:bg-safari-gold/90 text-black font-semibold"
                  onClick={() => router.push('/')}
                >
                  Buy Gems
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-safari-gold/20 hover:border-safari-gold/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-safari-gold" />
                <span className="text-2xl font-bold">
                  {stats?.total_packs_opened || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Packs Opened</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">
                  {stats?.cards_collected || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Cards Collected</p>
            </CardContent>
          </Card>

          <Card className="border-safari-gold/20 hover:border-safari-gold/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-safari-gold" />
                <span className="text-2xl font-bold">
                  {stats?.gems_earned?.toLocaleString() || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Gems Earned</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium truncate">
                  {stats?.rarest_card || 'None yet'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Rarest Card</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="border-safari-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-safari-gold" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest actions on Slab Safari
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm">
                    Start opening packs to see your history!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-safari-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-safari-gold" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start border-safari-gold/30 hover:bg-safari-gold/10"
                onClick={() => router.push('/inventory')}
              >
                <Package className="h-4 w-4 mr-2" />
                View My Collection
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-safari-gold/30 hover:bg-safari-gold/10"
                onClick={() => router.push('/')}
              >
                <Gem className="h-4 w-4 mr-2" />
                Open More Packs
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-safari-gold/30 hover:bg-safari-gold/10"
                onClick={() => router.push('/transparency')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Odds & Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Toast */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
