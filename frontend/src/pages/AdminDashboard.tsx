import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAuth';
import { useClaimAdmin } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, AlertTriangle, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ListingsManagement from '../components/admin/ListingsManagement';
import CredentialUpload from '../components/admin/CredentialUpload';
import PurchasesView from '../components/admin/PurchasesView';
import VouchModeration from '../components/admin/VouchModeration';
import AdminSettings from '../components/admin/AdminSettings';
import { Variant_success_alreadyClaimed } from '../backend';

export default function AdminDashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const claimAdminMutation = useClaimAdmin();

  // Track whether the user has already attempted to claim and it was already claimed
  const [claimDenied, setClaimDenied] = useState(false);

  const handleClaimAdmin = async () => {
    try {
      const result = await claimAdminMutation.mutateAsync();
      if (result === Variant_success_alreadyClaimed.success) {
        toast.success('Admin role claimed successfully! Welcome to the dashboard.');
        // isCallerAdmin query will be invalidated and re-fetched automatically
      } else if (result === Variant_success_alreadyClaimed.alreadyClaimed) {
        setClaimDenied(true);
        toast.error('Admin role is already claimed by another account. Access denied.');
      }
    } catch (err) {
      toast.error('Failed to claim admin role. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground text-sm">You must be logged in to access the admin dashboard.</p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-gold text-background hover:bg-gold-bright font-semibold"
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </span>
          ) : (
            'Login with Internet Identity'
          )}
        </Button>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // User is authenticated but not admin — show claim or access denied
  if (!isAdmin) {
    // If we already know the claim was denied (alreadyClaimed), show access denied
    if (claimDenied) {
      return (
        <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-sm bg-crimson/10 border border-crimson/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-crimson-bright" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground text-sm">
              Your account does not have admin privileges. Contact the marketplace owner if you believe this is an error.
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-mono bg-surface-raised border border-border rounded-sm px-3 py-2 break-all">
            {identity?.getPrincipal().toString()}
          </p>
        </div>
      );
    }

    // Show the claim admin option — the first authenticated user to click this becomes admin
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
          <Crown className="w-8 h-8 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Claim Admin Role</h1>
          <p className="text-muted-foreground text-sm">
            No admin has been assigned yet. If you are the marketplace owner, click below to claim the admin role for your account.
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-mono bg-surface-raised border border-border rounded-sm px-3 py-2 break-all">
          {identity?.getPrincipal().toString()}
        </p>
        <Button
          onClick={handleClaimAdmin}
          disabled={claimAdminMutation.isPending}
          className="bg-gold text-background hover:bg-gold-bright font-semibold w-full"
        >
          {claimAdminMutation.isPending ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Claiming Admin...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Crown className="w-4 h-4" />
              Claim Admin Role
            </span>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          This action can only be performed once. Once claimed, admin access can only be transferred by the current admin.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">ADMIN DASHBOARD</h1>
          <p className="text-sm text-muted-foreground">Manage listings, credentials, purchases, and reviews</p>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="bg-surface-raised border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="listings" className="data-[state=active]:bg-gold data-[state=active]:text-background text-sm">
            Listings
          </TabsTrigger>
          <TabsTrigger value="credentials" className="data-[state=active]:bg-gold data-[state=active]:text-background text-sm">
            Credentials
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-gold data-[state=active]:text-background text-sm">
            Purchases
          </TabsTrigger>
          <TabsTrigger value="vouches" className="data-[state=active]:bg-gold data-[state=active]:text-background text-sm">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-background text-sm">
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
  );
}
