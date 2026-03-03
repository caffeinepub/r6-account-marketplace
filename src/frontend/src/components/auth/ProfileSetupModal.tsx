import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !actor) return;
    setSaving(true);
    try {
      await actor.saveCallerUserProfile({ name: name.trim() });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Profile created successfully!");
    } catch (_err) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="bg-surface border-border max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-foreground">
                Set Up Your Profile
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Choose a display name for the marketplace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Display Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="pl-9 bg-surface-raised border-border focus:border-gold"
                maxLength={32}
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This name will be shown publicly. No real names or personal info
              required.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full bg-gold text-background hover:bg-gold-bright font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Continue to Marketplace"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
