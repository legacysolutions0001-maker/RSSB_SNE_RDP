import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { updatePassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, User, Loader2 } from 'lucide-react';

export default function Settings() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(user, newPassword);
      toast({ title: "Success", description: "Password updated successfully." });
      setNewPassword('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message || "Please logout and login again to change password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
            <CardDescription>Your current system access details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md border space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <div className="font-medium text-base">{profile?.fullName}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="font-medium text-base">{profile?.email}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <div className="font-medium text-base capitalize">{profile?.role.replace('_', ' ')}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Designation</Label>
                <div className="font-medium text-base">{profile?.designation || 'N/A'}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">Contact Super Admin to update your profile details.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Security</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
