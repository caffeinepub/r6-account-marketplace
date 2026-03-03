import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  Loader2,
  Lock,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useGetCredential } from "../../hooks/useQueries";

interface CredentialViewProps {
  accountId: string;
  purchaseId: string;
  onCredentialsLoaded: (blob: Uint8Array) => void;
}

export default function CredentialView({
  accountId,
  purchaseId,
  onCredentialsLoaded,
}: CredentialViewProps) {
  const [credentialText, setCredentialText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const getCredential = useGetCredential();

  const handleFetchCredentials = async () => {
    try {
      const result = await getCredential.mutateAsync({ accountId, purchaseId });

      // Use __kind__ (double underscore) as per backend interface
      if (result.__kind__ === "success") {
        const blob = result.success;
        const text = new TextDecoder("utf-8").decode(blob);
        setCredentialText(text);
        onCredentialsLoaded(blob);
      } else if (result.__kind__ === "notAuthenticated") {
        toast.error("Authentication required to view credentials.");
      } else if (result.__kind__ === "notPurchased") {
        toast.error("No confirmed purchase found for this account.");
      } else if (result.__kind__ === "viewLimitExceeded") {
        toast.error(
          "View limit exceeded (max 5 views). Contact support if needed.",
        );
      } else if (result.__kind__ === "notFound") {
        toast.error("Credentials not yet uploaded. Please contact support.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || "Failed to retrieve credentials.");
    }
  };

  const copyCredentials = () => {
    if (!credentialText) return;
    navigator.clipboard.writeText(credentialText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!credentialText) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-500/30 bg-green-500/5">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <AlertDescription className="text-sm text-green-300">
            Payment confirmed! Your account credentials are ready.
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-surface-raised border border-border rounded-sm text-center space-y-3">
          <Lock className="w-8 h-8 text-gold mx-auto" />
          <p className="text-sm text-muted-foreground">
            Click below to securely retrieve your account credentials.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Credentials are encrypted at rest and decrypted only for you. Max 5
            views allowed.
          </p>
        </div>

        <Button
          onClick={handleFetchCredentials}
          disabled={getCredential.isPending}
          className="w-full bg-gold text-background hover:bg-gold-bright font-semibold"
        >
          {getCredential.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Retrieving credentials...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Account Credentials
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <Alert className="border-red-500/40 bg-red-500/5">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <AlertDescription className="text-sm text-foreground">
          <strong className="text-red-400">IMPORTANT:</strong> Change your
          password immediately after logging in. Do not share these credentials.
        </AlertDescription>
      </Alert>

      <div className="relative">
        <div className="p-4 bg-surface-raised border border-gold/30 rounded-sm font-mono text-sm text-foreground whitespace-pre-wrap break-all">
          {credentialText}
        </div>
        <button
          type="button"
          onClick={copyCredentials}
          className="absolute top-2 right-2 p-1.5 bg-surface border border-border rounded-sm text-muted-foreground hover:text-gold transition-colors"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        These credentials are linked to your purchase. You have up to 5 views
        total.
      </p>
    </div>
  );
}
