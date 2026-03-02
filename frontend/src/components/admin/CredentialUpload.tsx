import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertTriangle, Loader2, Key } from 'lucide-react';
import { useUploadCredential, useSetDecryptionKey } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function CredentialUpload() {
  const [accountId, setAccountId] = useState('');
  const [credentialText, setCredentialText] = useState('');
  const [keyText, setKeyText] = useState('');

  const uploadCredential = useUploadCredential();
  const setDecryptionKey = useSetDecryptionKey();

  const handleUploadCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim() || !credentialText.trim()) return;
    try {
      const encoder = new TextEncoder();
      const blob = encoder.encode(credentialText.trim());
      await uploadCredential.mutateAsync({
        accountId: accountId.trim(),
        encryptedBlob: blob,
      });
      toast.success(`Credentials uploaded for account: ${accountId}`);
      setAccountId('');
      setCredentialText('');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to upload credentials.');
    }
  };

  const handleSetKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyText.trim()) return;
    try {
      const encoder = new TextEncoder();
      const keyBlob = encoder.encode(keyText.trim());
      await setDecryptionKey.mutateAsync(keyBlob);
      toast.success('Decryption key updated successfully.');
      setKeyText('');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to set decryption key.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Credentials */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Upload Credentials</h2>
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <AlertDescription className="text-sm text-muted-foreground">
            Credentials are stored as-is. Encrypt them before uploading if required by your security policy.
          </AlertDescription>
        </Alert>

        <form
          onSubmit={handleUploadCredential}
          className="p-4 bg-surface-raised border border-border rounded-sm space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Account ID
            </Label>
            <Input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. acc_001"
              className="bg-surface border-border focus:border-gold font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Credential Data
            </Label>
            <textarea
              value={credentialText}
              onChange={(e) => setCredentialText(e.target.value)}
              placeholder={`Username: example_user\nEmail: user@example.com\nPassword: SecurePass123!`}
              className="w-full h-32 px-3 py-2 bg-surface border border-border rounded-sm focus:border-gold focus:outline-none font-mono text-sm text-foreground resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the account credentials. These will be stored and delivered to the buyer after purchase.
            </p>
          </div>

          <Button
            type="submit"
            disabled={uploadCredential.isPending || !accountId.trim() || !credentialText.trim()}
            className="bg-gold text-background hover:bg-gold-bright font-semibold"
          >
            {uploadCredential.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Credentials
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Set Decryption Key */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Decryption Key</h2>
        <Alert className="border-red-500/30 bg-red-500/5">
          <Key className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-sm text-muted-foreground">
            The decryption key is only accessible to admins and is never returned to buyers.
          </AlertDescription>
        </Alert>

        <form
          onSubmit={handleSetKey}
          className="p-4 bg-surface-raised border border-border rounded-sm space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Symmetric Key
            </Label>
            <Input
              value={keyText}
              onChange={(e) => setKeyText(e.target.value)}
              placeholder="Enter symmetric decryption key..."
              className="bg-surface border-border focus:border-gold font-mono text-sm"
              type="password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={setDecryptionKey.isPending || !keyText.trim()}
            className="bg-gold text-background hover:bg-gold-bright font-semibold"
          >
            {setDecryptionKey.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Set Decryption Key
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
