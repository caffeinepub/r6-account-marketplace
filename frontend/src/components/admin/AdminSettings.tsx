import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAssignCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { identity } = useInternetIdentity();
  const [newAdminPrincipal, setNewAdminPrincipal] = useState('');
  const assignRole = useAssignCallerUserRole();

  const currentPrincipal = identity?.getPrincipal().toString() ?? '';

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPrincipal.trim()) return;
    try {
      await assignRole.mutateAsync({
        principal: newAdminPrincipal.trim(),
        role: UserRole.admin,
      });
      toast.success('Admin role assigned successfully!');
      setNewAdminPrincipal('');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to assign admin role.');
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Admin Settings</h2>

        {/* Current Admin Info */}
        <div className="p-4 bg-surface-raised border border-border rounded-sm space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">Current Admin Principal</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground break-all bg-surface border border-border rounded-sm px-3 py-2">
            {currentPrincipal}
          </p>
        </div>

        {/* Assign New Admin */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Assign Admin Role</h3>

          <Alert className="border-yellow-500/30 bg-yellow-500/5">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <AlertDescription className="text-sm text-muted-foreground">
              Assigning admin role to another principal grants full marketplace control. This action
              is irreversible without canister access.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleAssignAdmin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Principal ID
              </Label>
              <Input
                value={newAdminPrincipal}
                onChange={(e) => setNewAdminPrincipal(e.target.value)}
                placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
                className="bg-surface border-border focus:border-gold font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the Internet Identity principal to grant admin access.
              </p>
            </div>

            <Button
              type="submit"
              disabled={assignRole.isPending || !newAdminPrincipal.trim()}
              className="bg-gold text-background hover:bg-gold-bright font-semibold"
            >
              {assignRole.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Assign Admin Role
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
