'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  CreditCard,
  BarChart3,
  Truck,
  Settings,
  Home,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

// Admin emails - add your email here
const ADMIN_EMAILS = [
  'testuser@slabsafari.com',
  'admin@slabsafari.com',
  'eli@advancingtechnology.online'
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
      } else {
        router.push('/');
        return;
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-safari-green-dark flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-safari-gold mx-auto animate-pulse mb-4" />
          <p className="text-safari-tan">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { href: '/admin', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/packs', icon: Package, label: 'Packs' },
    { href: '/admin/cards', icon: CreditCard, label: 'Cards' },
    { href: '/admin/redemptions', icon: Truck, label: 'Redemptions' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-safari-green-dark">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-safari-green border-safari-gold/30"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-safari-green border-r border-safari-gold/20
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-safari-gold/20">
          <Link href="/admin" className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-safari-gold" />
            <div>
              <h1 className="text-xl font-bold text-safari-gold">Slab Safari</h1>
              <p className="text-xs text-safari-tan/60">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-safari-tan hover:bg-safari-gold/10 hover:text-safari-gold transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-safari-gold/20">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-safari-tan/60 hover:bg-safari-gold/10 hover:text-safari-tan transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
