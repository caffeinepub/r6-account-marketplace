import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useClaimAdmin, useIsAdminClaimed } from '../hooks/useQueries';
import { Variant_success_alreadyClaimed } from '../backend';
import ListingsManagement from '../components/admin/ListingsManagement';
import CredentialUpload from '../components/admin/CredentialUpload';
import PurchasesView from '../components/admin/PurchasesView';
import VouchModeration from '../components/admin/VouchModeration';
import AdminSettings from '../components/admin/AdminSettings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Shield, Lock, ShoppingBag, Star, Settings, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isAdminClaimed, isLoading: claimLoading } = useIsAdminClaimed();
  const claimAdminMutation = useClaimAdmin();

  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleClaimAdmin = async () => {
    setClaimError(null);
    try {
      const result = await claimAdminMutation.mutateAsync();
      if (result === Variant_success_alreadyClaimed.success) {
        setClaimSuccess(true);
      } else if (result === Variant_success_alreadyClaimed.alreadyClaimed) {
        setClaimError('Admin has already been claimed. Access denied.');
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('already been claimed') || msg.includes('Access Denied') || msg.includes('Unauthorized')) {
        setClaimError('Admin has already been claimed by another principal. Access denied.');
      } else {
        setClaimError('Failed to claim admin. Please try again.');
      }
    }
  };

  const isLoading = adminLoading || claimLoading;

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
          <button
            onClick={login}
            disabled={isLoggingIn}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Checking admin status...</span>
        </div>
      </div>
    );
  }

  // Authenticated but not admin — show claim or access denied
  if (!isAdmin && !claimSuccess) {
    // Admin not yet claimed — show claim button
    if (!isAdminClaimed) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Claim Admin</h1>
            <p className="text-muted-foreground">
              No admin has been set yet. As the first authenticated user, you can claim the admin role permanently.
            </p>
            {claimError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {claimError}
              </div>
            )}
            <button
              onClick={handleClaimAdmin}
              disabled={claimAdminMutation.isPending}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {claimAdminMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {claimAdminMutation.isPending ? 'Claiming...' : 'Claim Admin Role'}
            </button>
          </div>
        </div>
      );
    }

    // Admin already claimed by someone else — access denied
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            Admin access has already been claimed by another principal. You do not have permission to access this dashboard.
          </p>
          {claimError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {claimError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Ascension's Market — Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage listings, credentials, purchases, and reviews.
          </p>
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Purchases
            </TabsTrigger>
            <TabsTrigger value="vouches" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <ListingsManagement />
          </TabsContent>
          <TabsContent value="credentials">
            <CredentialUpload />
          </TabsContent>
          <TabsContent value="purchases">
            <PurchasesView />
          </TabsContent>
          <TabsContent value="vouches">
            <VouchModeration />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
